import * as THREE from "three";
import type { GameEvents } from "../../app/GameEvents";
import type { GameConfig, LaneIndex } from "../../app/GameConfig";
import type { GameState } from "../../game/state/GameStateTypes";
import { CollisionSystem } from "../physics/CollisionSystem";
import { CollectibleSystem } from "../../game/collectibles/CollectibleSystem";
import { CoinRainSystem } from "../../game/collectibles/CoinRainSystem";
import { ScoreSystem, type RunStats } from "../../game/progression/ScoreSystem";
import { RunnerController } from "../../game/runner/RunnerController";
import { validateTrafficRows } from "../../game/traffic/TrafficFairness";
import { TrafficSystem } from "../../game/traffic/TrafficSystem";
import { TRAFFIC_CAR_SPECS } from "../../game/traffic/TrafficTypes";
import { getVehicleDefinition, type VehicleDefinition } from "../../game/vehicles/VehicleCatalog";
import { FEUDAL_JAPAN_BIOME_CONTENT, type DecorationKind } from "../../game/world/BiomeContent";
import { LaneSystem } from "../../game/world/LaneSystem";
import { MaterialFactory } from "../assets/MaterialFactory";
import { ModelFactory } from "../assets/ModelFactory";
import type { AppScene } from "./AppScene";
import type { RunEffectContext } from "../../game/abilities/RunEffectContext";
import type { WeakFailOutcome } from "../../game/abilities/RunAbilityController";

/** Scene-side hooks the ability controller provides for fail/avoidance passives. */
export type PassiveHooks = {
  onWeakFail(): WeakFailOutcome;
  onApproachCar(): boolean;
};
import { CameraController } from "./CameraController";
import { LightingRig } from "./LightingRig";
import { TurretSystem } from "./TurretSystem";

export type GameOverInfo = {
  reason: "obstacle" | "weak-fails";
};

export type RunScene = AppScene & {
  cameraController: CameraController;
  resetRun(): void;
  moveLane(direction: -1 | 1): void;
  activateBoost(): void;
  getRunStats(): RunStats;
  consumeGameOver(): GameOverInfo | undefined;
  /** Capability bridge for ability effects (see RunAbilityController). */
  getEffectContext(): RunEffectContext;
  /** Wire the per-run passive hooks (weak-fail / approach decisions). */
  setPassiveHooks(hooks: PassiveHooks): void;
  /** True while a 将 police pursuit is active (a mistake now ends the run). */
  isPursued(): boolean;
  /** 将 Draufgänger: open a police pursuit for `seconds` (chaser closes in). */
  openPursuit(seconds: number): void;
  /** True if the last fatal car hit was a side contact (not a rear-end). */
  wasHitFromSide(): boolean;
};

const baseSpeed = 9.5;
const linearSpeedRampDistance = 300;
const linearSpeedGain = 2.4;
const maxSpeed = 18.5;
const lateRampDistance = 680;
const introChaserDuration = 4.8;
const lightMistakeCatchWindow = 10;
const introChaserZ = -3.15;
const catchWindowChaserZ = -3.65;
const chaserSpawnZ = -10.5; // just behind the camera — the police appear quickly from here
const chaserHideZ = -9.5; // hide once it has slid off the bottom (just behind the camera)
const chaserApproachLerp = 5.2; // fast to appear
const chaserRecedeSpeed = 0.9; // metres/second — slow, steady fall-back (takes several seconds)
const introChaserSideOffset = 1.05;

type TrackPiece = {
  object: THREE.Object3D;
  initialZ: number;
};

export class RunSceneFactory {
  static create(
    config: GameConfig,
    models: ModelFactory,
    _materials: MaterialFactory,
    vehicle: VehicleDefinition = getVehicleDefinition(),
    events?: GameEvents
  ): RunScene {
    const scene = new THREE.Scene();
    scene.name = "run_scene";
    scene.background = new THREE.Color(0x58c7f3);
    scene.fog = new THREE.Fog(0x58c7f3, 24, 72);

    const sceneLights = LightingRig.addTo(scene, config.quality);
    // 将 Nachtjagd night fade — lerp lights + sky/fog between day and a deep indigo night.
    const DAY_SKY = new THREE.Color(0x58c7f3);
    const NIGHT_SKY = new THREE.Color(0x141a38);
    const dayHemi = sceneLights.hemi.intensity;
    const daySun = sceneLights.sun.intensity;
    let nightTarget = 0;
    let nightLevel = 0;

    const cameraController = new CameraController();
    const runner = models.createVehicle(vehicle.modelKey);
    const chaser = models.createTokyoPoliceCar();
    const boostAura = models.createShieldPowerUp();
    const collisionSystem = new CollisionSystem();
    const laneSystem = new LaneSystem(2.4);
    const runnerController = new RunnerController(runner, laneSystem, {
      baseScale: vehicle.run.scale,
      forwardRotationY: vehicle.run.forwardRotationY,
      bounds: vehicle.run.bounds
    });
    const scoreSystem = new ScoreSystem();
    const lanes = laneSystem.lanes;
    const biome = FEUDAL_JAPAN_BIOME_CONTENT;
    const trackLoopLength = biome.track.segmentLength * biome.track.segmentCount;
    const contentLoopLength = biome.contentLoopLength;
    const world = new THREE.Group();
    const groundSegments: TrackPiece[] = [];
    const decorative: TrackPiece[] = [];

    let distance = 0;
    let pressure = 0;
    let weakFails = 0;
    let gameOverInfo: GameOverInfo | undefined;
    let cleanRunTimer = 0;
    let introChaserTimer = introChaserDuration;
    let lightMistakeWindowTimer = 0;
    let daredevilPursuit = 0; // 将 Draufgänger police chase (seconds); a mistake while >0 ends the run
    let lastHitWasSide = false; // was the last fatal car hit a side contact (vs a rear-end)?
    let chaserWanted = false;
    let chaserReceding = false;
    let passiveHooks: PassiveHooks | undefined;

    validateTrafficRows(biome.trafficRows, contentLoopLength);

    const trafficSystem = new TrafficSystem(
      runnerController,
      laneSystem,
      collisionSystem,
      () => distance,
      ({ side }) => {
        lastHitWasSide = side;
        scoreSystem.resetCombo();
        registerStrongFail("obstacle");
      },
      ({ car, coins }) => {
        cameraController.shake(0.18, 0.08);
        if (coins > 0) {
          // 将 Nachtjagd ram payout.
          scoreSystem.addCoin(coins);
          events?.emit("coin:collected", {
            amount: coins,
            combo: scoreSystem.getStats(pressure, weakFails).combo,
            worldPosition: { x: car.mesh.position.x, y: 0.9, z: car.trackZ - distance }
          });
        }
      }
    );
    const collectibleSystem = new CollectibleSystem(
      runnerController,
      laneSystem,
      collisionSystem,
      () => distance,
      ({ collectible, amount }) => {
        scoreSystem.addCoin(amount);
        events?.emit("coin:collected", {
          amount,
          combo: scoreSystem.getStats(pressure, weakFails).combo,
          worldPosition: {
            x: laneSystem.getLaneX(collectible.lane),
            y: 0.9,
            z: collectible.trackZ - distance
          }
        });
      }
    );

    const makePinkCoin = (): THREE.Object3D => {
      const coin = models.createKoban();
      coin.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) {
          return;
        }
        const tint = (material: THREE.Material): THREE.Material => {
          const cloned = material.clone() as THREE.MeshStandardMaterial;
          if (cloned.color) {
            cloned.color.set(0xe0738d);
          }
          if (cloned.emissive) {
            cloned.emissive.set(0x3a1620);
          }
          return cloned;
        };
        mesh.material = Array.isArray(mesh.material) ? mesh.material.map(tint) : tint(mesh.material);
      });
      return coin;
    };
    const coinRain = new CoinRainSystem(
      80,
      makePinkCoin,
      runnerController,
      () => distance,
      (amount) => {
        scoreSystem.addCoin(amount);
        events?.emit("coin:collected", {
          amount,
          combo: scoreSystem.getStats(pressure, weakFails).combo,
          worldPosition: { x: runnerController.getPosition().x, y: 0.9, z: 0 }
        });
      }
    );
    for (const mesh of coinRain.meshes) {
      world.add(mesh);
    }

    const turret = new TurretSystem(scene, runnerController, trafficSystem, (coins) => {
      scoreSystem.addCoin(coins);
      events?.emit("coin:collected", {
        amount: coins,
        combo: scoreSystem.getStats(pressure, weakFails).combo,
        worldPosition: { x: runnerController.getPosition().x, y: 0.9, z: 0 }
      });
    });

    world.name = "playable_feudal_japan_world";
    scene.add(world, runner, chaser);
    runner.add(boostAura);
    collisionSystem.register(runnerController);

    chaser.position.set(introChaserSideOffset, 0, introChaserZ);
    chaser.rotation.y = 0;
    chaser.scale.setScalar(0.92);
    chaser.visible = false;

    boostAura.name = "runner_boost_aura";
    boostAura.position.set(0, -0.12, 0);
    boostAura.scale.set(1.75, 0.72, 2.25);
    boostAura.visible = false;

    for (let offset = 0; offset < biome.track.segmentCount; offset += 1) {
      const index = biome.track.startIndex + offset;
      const segment = models.createGroundSegment(biome.track.segmentLength);
      segment.position.z = index * biome.track.segmentLength;
      freezeStaticChildren(segment);
      groundSegments.push({ object: segment, initialZ: segment.position.z });
      world.add(segment);
    }

    for (const placement of biome.decorations) {
      const decoration = createDecoration(placement.kind);
      decoration.position.set(placement.x, 0, placement.z);
      decoration.rotation.y = placement.rotationY ?? 0;
      decoration.scale.setScalar(placement.scale ?? 1);
      freezeStaticChildren(decoration);
      addDecorative(decoration);
    }

    for (let index = 0; index < biome.coins.count; index += 1) {
      const coin = models.createKoban();
      const trackZ = biome.coins.startZ + index * biome.coins.spacing;
      const coinLane = getCoinLane(index, trackZ);
      collectibleSystem.add({
        id: `coin-${trackZ}`,
        mesh: coin,
        lane: coinLane,
        trackZ
      });
      world.add(coin);
    }

    for (const row of biome.trafficRows) {
      row.cars.forEach((definition, carIndex) => {
        const mesh = models.createTrafficCar(definition.kind);
        const spec = TRAFFIC_CAR_SPECS[definition.kind];
        trafficSystem.add({
          id: `traffic-${row.trackZ}-${definition.lane}-${carIndex}`,
          kind: definition.kind,
          mesh,
          lane: definition.lane,
          trackZ: row.trackZ,
          speed: definition.speed ?? spec.speed,
          collider: spec.collider,
          patternId: `row-${row.trackZ}`
        });
        world.add(mesh);
      });
    }

    const resetRun = (): void => {
      distance = 0;
      scoreSystem.reset();
      pressure = 0;
      weakFails = 0;
      gameOverInfo = undefined;
      cleanRunTimer = 0;
      introChaserTimer = introChaserDuration;
      lightMistakeWindowTimer = 0;
      chaser.position.set(introChaserSideOffset, 0, chaserSpawnZ);
      chaser.visible = false;
      chaserWanted = false;
      chaserReceding = false;
      world.position.z = 0;
      resetWorldPieces();
      runnerController.reset();
      collectibleSystem.reset();
      daredevilPursuit = 0;
      coinRain.reset();
      trafficSystem.reset();
      trafficSystem.setRamMode(undefined);
      turret.reset();
      nightTarget = 0;
      nightLevel = 0;
      sceneLights.hemi.intensity = dayHemi;
      sceneLights.sun.intensity = daySun;
      (scene.background as THREE.Color).copy(DAY_SKY);
      (scene.fog as THREE.Fog).color.copy(DAY_SKY);
    };

    const moveLane = (direction: -1 | 1): void => {
      const result = direction < 0 ? runnerController.moveLeft() : runnerController.moveRight();
      if (result.mistake) {
        registerLightMistake(direction);
      }
    };

    const activateBoost = (): void => {
      if (runnerController.activateBoost()) {
        cameraController.shake(0.16, 0.08);
        events?.emit("powerup:activated", { type: "shield", duration: 1.35 });
      }
    };

    const update = (dt: number, elapsed: number, state: GameState): void => {
      const isRunning = state === "running";
      const activeSpeed = isRunning ? getRunSpeed() * runnerController.getSpeedMultiplier() : 0;

      if (isRunning) {
        distance += activeSpeed * dt;
        scoreSystem.updateDistance(distance);
        cleanRunTimer += dt;
        pressure = Math.max(0, pressure - dt * 4);
        introChaserTimer = Math.max(0, introChaserTimer - dt);
        daredevilPursuit = Math.max(0, daredevilPursuit - dt);

        if (lightMistakeWindowTimer > 0) {
          lightMistakeWindowTimer = Math.max(0, lightMistakeWindowTimer - dt);
          if (lightMistakeWindowTimer === 0) {
            weakFails = 0;
            pressure = Math.min(pressure, 8);
          }
        }
      }

      runnerController.update(dt, elapsed, isRunning);
      if (isRunning) {
        updateHighBeam();
      }
      recycleWorldPieces();
      collectibleSystem.update(dt, elapsed, isRunning, contentLoopLength);
      coinRain.update(dt, elapsed, isRunning);
      trafficSystem.update(dt, isRunning, contentLoopLength);
      turret.update(dt, isRunning);
      updateBoostAura(dt, elapsed);
      updateChaser(dt, elapsed, isRunning);

      world.position.z = -distance;
      cameraController.update(dt, elapsed, state, isRunning ? runnerController.getPosition().x : 0);
      updateNight(dt);
    };

    function updateNight(dt: number): void {
      if (nightLevel === nightTarget) {
        return;
      }
      nightLevel = THREE.MathUtils.lerp(nightLevel, nightTarget, Math.min(1, dt * 3.5));
      if (Math.abs(nightLevel - nightTarget) < 0.01) {
        nightLevel = nightTarget;
      }
      sceneLights.hemi.intensity = THREE.MathUtils.lerp(dayHemi, dayHemi * 0.28, nightLevel);
      sceneLights.sun.intensity = THREE.MathUtils.lerp(daySun, daySun * 0.32, nightLevel);
      const sky = DAY_SKY.clone().lerp(NIGHT_SKY, nightLevel);
      (scene.background as THREE.Color).copy(sky);
      (scene.fog as THREE.Fog).color.copy(sky);
    }

    const effectContext: RunEffectContext = {
      runner: {
        boost: (durationSec: number) => runnerController.applyAbilityBoost(durationSec),
        clearBoost: () => runnerController.clearBoost()
      },
      player: {
        setTitan: (on: boolean) => runnerController.setTitan(on)
      },
      turret: {
        setActive: (on: boolean) => turret.setActive(on)
      },
      traffic: {
        swerveOutOfLane: (lane, minAheadZ) => trafficSystem.swerveOutOfLane(lane, minAheadZ),
        setLaneShield: (lane) => trafficSystem.setLaneShield(lane),
        restoreLanes: (minReactionSec) => {
          // Convert reaction time to a distance via the current closing speed
          // (player speed minus traffic's ~5 m/s) so the safe band is fair at any speed.
          const closing = Math.max(2, getRunSpeed() * runnerController.getSpeedMultiplier() - 5);
          trafficSystem.restoreLanes(minReactionSec * closing);
        },
        setRamMode: (coins) => trafficSystem.setRamMode(coins)
      },
      coins: {
        biasLane: (lane) => collectibleSystem.setLaneBias(lane),
        pullToLane: (lane) => collectibleSystem.pullToLane(lane),
        redistribute: () => collectibleSystem.redistribute(),
        rain: (on, level) => coinRain.setActive(on, level)
      },
      scene: {
        setNight: (on) => {
          nightTarget = on ? 1 : 0;
        }
      }
    };

    const dispose = (): void => {
      coinRain.dispose();
      turret.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
        }
      });
    };

    function updateHighBeam(): void {
      // 藍 Lichthupe: when closing on a car directly ahead, it pulls aside (cooldown-gated).
      if (!passiveHooks) {
        return;
      }
      // Only ~3 m ahead: the car gives way right before impact (collision fires at
      // ~2.2 m, and this runs before the collision check, so the swerve still beats it).
      const front = trafficSystem.frontCarInLane(runnerController.getLane(), 3);
      if (front && passiveHooks.onApproachCar()) {
        trafficSystem.swerveCar(front);
      }
    }

    function updateBoostAura(dt: number, elapsed: number): void {
      boostAura.visible = runnerController.isBoosting();
      boostAura.rotation.y += dt * 4.5;
      boostAura.rotation.z += dt * 2.4;
      boostAura.position.y = -0.14 + Math.sin(elapsed * 14) * 0.02;
    }

    function updateChaser(dt: number, _elapsed: number, isRunning: boolean): void {
      const isCatchWindowActive = lightMistakeWindowTimer > 0;
      const isIntroActive = introChaserTimer > 0;
      const wantChaser = isRunning && (isIntroActive || isCatchWindowActive);

      if (wantChaser && !chaserWanted) {
        // Police drives up from far behind (off-screen) — never pops in close.
        if (!chaser.visible) {
          chaser.position.z = chaserSpawnZ;
          chaser.position.x = runnerController.getPosition().x + (isIntroActive ? introChaserSideOffset : 0);
        }
        chaser.visible = true;
        chaserReceding = false;
      } else if (!wantChaser && chaserWanted) {
        // Shaken off → fall back into the distance (Temple Run / Subway Surfers style).
        chaserReceding = true;
      }
      chaserWanted = wantChaser;

      if (!wantChaser && !chaserReceding) {
        chaser.visible = false;
        return;
      }

      const pressureOffset = THREE.MathUtils.clamp(pressure / 100, 0, 1);
      const sideOffset = isIntroActive ? introChaserSideOffset : 0;
      if (wantChaser) {
        const targetZ = isCatchWindowActive ? catchWindowChaserZ + pressureOffset * 0.85 : introChaserZ;
        chaser.position.z = THREE.MathUtils.lerp(chaser.position.z, targetZ, Math.min(1, dt * chaserApproachLerp));
      } else {
        chaser.position.z -= chaserRecedeSpeed * dt; // constant slow fall-back, no easing
      }
      // Sit in the player's lane like a real car and change lanes when the player
      // does (full x-tracking, not a floaty partial follow), leaning into the move.
      const prevX = chaser.position.x;
      const targetX = runnerController.getPosition().x + sideOffset;
      chaser.position.x = THREE.MathUtils.lerp(prevX, targetX, Math.min(1, dt * 3.5));
      const lateralVel = (chaser.position.x - prevX) / Math.max(dt, 1e-3);
      chaser.position.y = 0; // grounded — no hover
      chaser.rotation.y = THREE.MathUtils.clamp(Math.atan2(lateralVel, 9), -0.4, 0.4);
      chaser.rotation.z = 0;

      if (chaserReceding && chaser.position.z <= chaserHideZ) {
        chaser.visible = false;
        chaserReceding = false;
      }
    }

    function getRunSpeed(): number {
      const linearProgress = Math.min(distance / linearSpeedRampDistance, 1);
      const linearSpeed = baseSpeed + linearProgress * linearSpeedGain;

      if (distance <= linearSpeedRampDistance) {
        return linearSpeed;
      }

      const lateProgress = 1 - Math.exp(-(distance - linearSpeedRampDistance) / lateRampDistance);
      return linearSpeed + (maxSpeed - linearSpeed) * lateProgress;
    }

    function recycleWorldPieces(): void {
      for (const segment of groundSegments) {
        if (segment.object.position.z - distance < -biome.track.recycleBehindDistance) {
          segment.object.position.z += trackLoopLength;
        }
      }

      for (const deco of decorative) {
        if (deco.object.position.z - distance < -biome.decorationRecycleBehindDistance) {
          deco.object.position.z += contentLoopLength;
        }
      }
    }

    function resetWorldPieces(): void {
      for (const segment of groundSegments) {
        segment.object.position.z = segment.initialZ;
      }

      for (const deco of decorative) {
        deco.object.position.z = deco.initialZ;
      }
    }

    function addDecorative(object: THREE.Object3D): void {
      decorative.push({ object, initialZ: object.position.z });
      world.add(object);
    }

    function freezeStaticChildren(object: THREE.Object3D): void {
      object.updateMatrix();
      object.traverse((child) => {
        if (child === object) {
          return;
        }

        child.updateMatrix();
        child.matrixAutoUpdate = false;
      });
    }

    function createDecoration(kind: DecorationKind): THREE.Object3D {
      switch (kind) {
        case "torii":
          return models.createTorii();
        case "bambooCluster":
          return models.createBambooCluster();
        case "stoneLantern":
          return models.createStoneLantern();
        case "machiyaHouse":
          return models.createMachiyaHouse();
        case "minkaHouse":
          return models.createMinkaHouse();
        case "nagayaRowHouse":
          return models.createNagayaRowHouse();
        case "kuraStorehouse":
          return models.createKuraStorehouse();
      }
    }

    function registerLightMistake(direction: -1 | 1): void {
      if (gameOverInfo) {
        return;
      }

      const outcome = passiveHooks?.onWeakFail() ?? { type: "normal" };
      if (outcome.type === "absorbed") {
        // 赤 Knautschzone: buffer eats the mistake — small stumble, no police window.
        runnerController.applyStumble(direction);
        cameraController.shake(0.18, 0.1);
        cleanRunTimer = 0;
        events?.emit("runner:hit", {
          hit: {
            source: "chaser",
            severity: "minor",
            worldPosition: { x: runnerController.getPosition().x, y: 0.45, z: runnerController.getPosition().z }
          },
          shieldConsumed: true,
          pressureAfter: pressure
        });
        return;
      }
      if (outcome.type === "coins" && outcome.amount > 0) {
        scoreSystem.spendCoins(outcome.amount); // 桜 Sparbüchse: the mistake costs coins (then proceeds normally)
      }

      if (lightMistakeWindowTimer > 0) {
        weakFails = 2;
        registerStrongFail("weak-fails");
        return;
      }

      weakFails = 1;
      pressure = Math.max(pressure, 64);
      events?.emit("runner:hit", {
        hit: {
          source: "chaser",
          severity: "minor",
          worldPosition: {
            x: runnerController.getPosition().x,
            y: 0.45,
            z: runnerController.getPosition().z
          }
        },
        shieldConsumed: false,
        pressureAfter: pressure
      });
      lightMistakeWindowTimer = lightMistakeCatchWindow;
      cleanRunTimer = 0;
      runnerController.applyStumble(direction);
      cameraController.shake(0.26, 0.16);
    }

    function registerStrongFail(reason: GameOverInfo["reason"]): void {
      if (gameOverInfo) {
        return;
      }

      gameOverInfo = { reason };
      pressure = 100;
      events?.emit("runner:hit", {
        hit: {
          source: reason === "weak-fails" ? "chaser" : "obstacle",
          severity: "fatal",
          worldPosition: {
            x: runnerController.getPosition().x,
            y: 0.45,
            z: runnerController.getPosition().z
          }
        },
        shieldConsumed: false,
        pressureAfter: pressure
      });
      scoreSystem.resetCombo();
      lightMistakeWindowTimer = lightMistakeCatchWindow;
      runnerController.applyStrongHit();
      cameraController.shake(0.58, 0.36);
    }

    function getRunStats(): RunStats {
      return scoreSystem.getStats(pressure, weakFails);
    }

    function consumeGameOver(): GameOverInfo | undefined {
      const pending = gameOverInfo;
      gameOverInfo = undefined;
      return pending;
    }

    function getCoinLane(index: number, trackZ: number): LaneIndex {
      const defaultLane = lanes[index % lanes.length];
      const nearbyRow = biome.trafficRows.find((row) => Math.abs(row.trackZ - trackZ) < 4);

      if (!nearbyRow) {
        return defaultLane;
      }

      const blockedLanes = new Set<LaneIndex>(nearbyRow.cars.map((car) => car.lane));
      return blockedLanes.has(defaultLane) ? nearbyRow.safeLane : defaultLane;
    }

    return {
      scene,
      cameraController,
      update,
      resetRun,
      moveLane,
      activateBoost,
      getRunStats,
      consumeGameOver,
      getEffectContext: () => effectContext,
      setPassiveHooks: (hooks: PassiveHooks) => {
        passiveHooks = hooks;
      },
      isPursued: () => daredevilPursuit > 0,
      openPursuit: (seconds: number) => {
        daredevilPursuit = seconds;
        lightMistakeWindowTimer = seconds; // chaser closes in + any mistake now ends the run
      },
      wasHitFromSide: () => lastHitWasSide,
      dispose
    };
  }
}
