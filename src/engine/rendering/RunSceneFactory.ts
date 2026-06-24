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
import { CameraController } from "./CameraController";
import { LightingRig } from "./LightingRig";

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
const hiddenChaserZ = -7.2;
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

    LightingRig.addTo(scene, config.quality);

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

    validateTrafficRows(biome.trafficRows, contentLoopLength);

    const trafficSystem = new TrafficSystem(
      runnerController,
      laneSystem,
      collisionSystem,
      () => distance,
      () => {
        scoreSystem.resetCombo();
        registerStrongFail("obstacle");
      },
      () => {
        cameraController.shake(0.18, 0.08);
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
      64,
      makePinkCoin,
      laneSystem,
      collisionSystem,
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
      chaser.position.set(introChaserSideOffset, 0, introChaserZ);
      chaser.visible = false;
      world.position.z = 0;
      resetWorldPieces();
      runnerController.reset();
      collectibleSystem.reset();
      coinRain.reset();
      trafficSystem.reset();
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

        if (lightMistakeWindowTimer > 0) {
          lightMistakeWindowTimer = Math.max(0, lightMistakeWindowTimer - dt);
          if (lightMistakeWindowTimer === 0) {
            weakFails = 0;
            pressure = Math.min(pressure, 8);
          }
        }
      }

      runnerController.update(dt, elapsed, isRunning);
      recycleWorldPieces();
      collectibleSystem.update(dt, elapsed, isRunning, contentLoopLength);
      coinRain.update(dt, elapsed, isRunning);
      trafficSystem.update(dt, isRunning, contentLoopLength);
      updateBoostAura(dt, elapsed);
      updateChaser(dt, elapsed, isRunning);

      world.position.z = -distance;
      cameraController.update(dt, elapsed, state);
    };

    const effectContext: RunEffectContext = {
      runner: {
        boost: (durationSec: number) => runnerController.applyAbilityBoost(durationSec),
        clearBoost: () => runnerController.clearBoost()
      },
      player: {
        setTitan: (on: boolean) => runnerController.setTitan(on)
      },
      traffic: {
        swerveOutOfLane: (lane, minAheadZ) => trafficSystem.swerveOutOfLane(lane, minAheadZ),
        setLaneShield: (lane) => trafficSystem.setLaneShield(lane)
      },
      coins: {
        biasLane: (lane) => collectibleSystem.setLaneBias(lane),
        rain: (on, level) => coinRain.setActive(on, level)
      }
    };

    const dispose = (): void => {
      coinRain.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
        }
      });
    };

    function updateBoostAura(dt: number, elapsed: number): void {
      boostAura.visible = runnerController.isBoosting();
      boostAura.rotation.y += dt * 4.5;
      boostAura.rotation.z += dt * 2.4;
      boostAura.position.y = -0.14 + Math.sin(elapsed * 14) * 0.02;
    }

    function updateChaser(dt: number, elapsed: number, isRunning: boolean): void {
      const isCatchWindowActive = lightMistakeWindowTimer > 0;
      const isIntroActive = introChaserTimer > 0;
      const shouldShowChaser = isRunning && (isIntroActive || isCatchWindowActive);
      chaser.visible = shouldShowChaser;

      const pressureOffset = THREE.MathUtils.clamp(pressure / 100, 0, 1);
      const targetZ = isCatchWindowActive ? catchWindowChaserZ + pressureOffset * 0.85 : isIntroActive ? introChaserZ : hiddenChaserZ;
      const sideOffset = isIntroActive ? introChaserSideOffset : 0;
      chaser.position.z = THREE.MathUtils.lerp(chaser.position.z, targetZ, Math.min(1, dt * 4));
      chaser.position.x = THREE.MathUtils.lerp(
        chaser.position.x,
        runnerController.getPosition().x * 0.35 + sideOffset,
        Math.min(1, dt * 3)
      );
      chaser.position.y = Math.abs(Math.sin(elapsed * 7.2)) * 0.06;
      chaser.rotation.z = -0.08 + Math.sin(elapsed * 2.4) * 0.035;
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
      dispose
    };
  }
}
