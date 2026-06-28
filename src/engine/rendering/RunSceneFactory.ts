import * as THREE from "three";
import type { GameEvents } from "../../app/GameEvents";
import type { GameConfig } from "../../app/GameConfig";
import type { GameState } from "../../game/state/GameStateTypes";
import { CollisionSystem } from "../physics/CollisionSystem";
import { CollectibleSystem } from "../../game/collectibles/CollectibleSystem";
import { CoinRainSystem } from "../../game/collectibles/CoinRainSystem";
import { ScoreSystem, type RunStats } from "../../game/progression/ScoreSystem";
import { RunnerController } from "../../game/runner/RunnerController";
import { TrafficSystem } from "../../game/traffic/TrafficSystem";
import { TrafficDirector } from "../../game/traffic/TrafficDirector";
import { TRAFFIC_CAR_SPECS, type TrafficCarKind } from "../../game/traffic/TrafficTypes";
import { getVehicleDefinition, type VehicleDefinition } from "../../game/vehicles/VehicleCatalog";
import {
  FEUDAL_JAPAN_BIOME_CONTENT,
  NEON_CITY_DECORATIONS,
  FOREST_VALLEY_DECORATIONS,
  type DecorationKind
} from "../../game/world/BiomeContent";
import { BiomeManager } from "../../game/world/BiomeManager";
import { LaneSystem } from "../../game/world/LaneSystem";
import { MaterialFactory } from "../assets/MaterialFactory";
import { mergeByMaterial } from "../assets/mergeByMaterial";
import { ModelFactory } from "../assets/ModelFactory";
import type { AppScene } from "./AppScene";
import type { RunEffectContext } from "../../game/abilities/RunEffectContext";
import type { WeakFailOutcome } from "../../game/abilities/RunAbilityController";

/** Scene-side hooks the ability controller provides for fail/avoidance passives. */
export type PassiveHooks = {
  onWeakFail(): WeakFailOutcome;
  onApproachCar(): boolean;
  /** 龍 Zu schnell: catch-window length (s) after a weak fail, or undefined for the default. */
  catchWindowSec(): number | undefined;
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
  /** Current speed as a ratio of max (≈0.5 at the start, 1 at flat-out, >1 while boosted) — drives the engine sound. */
  getSpeedRatio(): number;
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
  /** Credit coins to the run (used when 将 ram-drop coins land on the counter). */
  creditCoins(amount: number): void;
  /** 鬼 Schwarzes Loch: lift the car tapped at clip-space (`ndcX`,`ndcY`), if any. */
  tapLift(ndcX: number, ndcY: number): void;
  /** True while the police are right behind you (a catch window is open). */
  isPoliceBehind(): boolean;
  /** 鬼 Anzapfen: continuous coin stream from the nearest cars in range to the counter. */
  siphonStream(dt: number, coinsPerCar: number, maxCars: number): void;
  /** 鬼 Anzapfen: hide the mini black holes (no car being drained / police gone). */
  clearSiphonVfx(): void;
};

const baseSpeed = 14; // fast from the very start (was 9.5)
const linearSpeedRampDistance = 300;
const linearSpeedGain = 3.5;
const maxSpeed = 26; // very fast late game (was 18.5)
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
// 鬼 Schwarzes Loch: a fixed point high in the sky (scene space) that tapped cars are sucked UP into.
const BLACK_HOLE_POS = { x: 0, y: 9, z: 13 };
// 鬼 Anzapfen: only the nearest cars within this many metres ahead bleed coins.
const SIPHON_RANGE = 38;
// Procedural traffic: obstacle rows sit ROW_GAP apart starting at ROW_START; one full
// loop is contentLoopLength / ROW_GAP rows, each with up to 2 cars.
const ROW_START = 18;
const ROW_GAP = 15;

type TrackPiece = {
  object: THREE.Object3D;
  initialZ: number;
};

export class RunSceneFactory {
  static create(
    config: GameConfig,
    models: ModelFactory,
    materials: MaterialFactory,
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
    const NIGHT_SKY = new THREE.Color(0x141a38); // 将 Nachtjagd
    const BLACKHOLE_SKY = new THREE.Color(0x1c0b30); // 鬼 Schwarzes Loch (deep violet)
    const HYPER_SKY = new THREE.Color(0xffe1a6); // 龍 Überschall (bright golden supersonic haze — the dragon's realm)
    const SAKURA_SKY = new THREE.Color(0xffd6e6); // 桜 Blütenregen (soft sakura-pink atmosphere)
    const dayHemi = sceneLights.hemi.intensity;
    const daySun = sceneLights.sun.intensity;
    // Scene tint (将 night / 鬼 black hole): lerp lights + sky/fog toward a mood and back.
    let tintTarget = 0;
    let tintLevel = 0;
    const tintSky = NIGHT_SKY.clone();
    let tintHemiScale = 0.28;
    let tintSunScale = 0.32;

    // 紅葉 Autumn Momiji season — a slow crossfade that oscillates the VILLAGE between
    // summer and a blazing autumn leg by distance. Base atmosphere; ability tints layer on top.
    let seasonLevel = 0; // 0 = summer village, 1 = autumn momiji
    let seasonTarget = 0;
    const SEASON_LEG = 500;
    const AUTUMN_SKY = new THREE.Color(0xe9b16a);
    const SUMMER_SUN = sceneLights.sun.color.clone();
    const AUTUMN_SUN = new THREE.Color(0xffcf8a);
    const SUMMER_HEMI = sceneLights.hemi.color.clone();
    const AUTUMN_HEMI = new THREE.Color(0xffd9a8);
    const SUMMER_HEMI_GROUND = sceneLights.hemi.groundColor.clone();
    // Maple-leaf materials — village-only autumn morph (maples are hidden in the city leg).
    const seasonMats: { mat: { color: THREE.Color }; summer: THREE.Color; autumn: THREE.Color }[] = [
      { mat: materials.mapleLeafRed, summer: materials.mapleLeafRed.color.clone(), autumn: new THREE.Color(0xc62f1c) },
      { mat: materials.mapleLeafOrange, summer: materials.mapleLeafOrange.color.clone(), autumn: new THREE.Color(0xe0701c) },
      { mat: materials.mapleLeafGold, summer: materials.mapleLeafGold.color.clone(), autumn: new THREE.Color(0xe6b022) }
    ];

    // ===== Macro-biome atmosphere — village (0) → 電脳都市 neon city (1) → 奥山 forest valley (2).
    // A per-biome PRESET table + ONE eased "active" struct that each frame chases the current
    // leg's preset. This crossfades ANY adjacent pair smoothly (a single scalar couldn't express
    // city→forest without smearing through village). Season is a village-only sub-mood layered on
    // the village preset; ability tints compose on top of the eased active.
    const MACRO_LEG = 700;
    const biomeManager = new BiomeManager(MACRO_LEG, 3);
    type AtmoPreset = {
      sky: THREE.Color; sun: THREE.Color; hemi: THREE.Color; hemiGround: THREE.Color;
      hemiScale: number; sunScale: number; path: THREE.Color; grass: THREE.Color; line: THREE.Color;
      fogNear: number; fogFar: number;
    };
    const fog = scene.fog as THREE.Fog;
    const DAY_FOG_NEAR = fog.near;
    const DAY_FOG_FAR = fog.far;
    const PATH_BASE = materials.path.color.clone();
    const GRASS_SUMMER = materials.grass.color.clone();
    const GRASS_AUTUMN = new THREE.Color(0x9c8a3c);
    const LINE_BASE = materials.roadLine.color.clone();
    const CITY_PRESET: AtmoPreset = {
      sky: new THREE.Color(0x1a2150), sun: new THREE.Color(0xff9a55), hemi: new THREE.Color(0x3a4a8c),
      hemiGround: new THREE.Color(0x0c1018), hemiScale: 0.5, sunScale: 0.62,
      path: new THREE.Color(0x14171d), grass: new THREE.Color(0x4a4e57), line: new THREE.Color(0xdfe4ea),
      fogNear: DAY_FOG_NEAR, fogFar: DAY_FOG_FAR
    };
    const FOREST_PRESET: AtmoPreset = {
      sky: new THREE.Color(0xaebfbd), sun: new THREE.Color(0xcfe0d2), hemi: new THREE.Color(0x9fc0b8),
      hemiGround: new THREE.Color(0x2f3d2c), hemiScale: 0.92, sunScale: 0.5,
      path: new THREE.Color(0x6f7857), grass: new THREE.Color(0x4f7a3a), line: new THREE.Color(0x6e7a5e),
      fogNear: 17, fogFar: 48 // tight misty fog — distant cedars/peaks dissolve into the haze
    };
    // Village preset, rebuilt each frame from seasonLevel (summer ↔ autumn momiji).
    const villagePreset: AtmoPreset = {
      sky: DAY_SKY.clone(), sun: SUMMER_SUN.clone(), hemi: SUMMER_HEMI.clone(),
      hemiGround: SUMMER_HEMI_GROUND.clone(), hemiScale: 1, sunScale: 1,
      path: PATH_BASE.clone(), grass: GRASS_SUMMER.clone(), line: LINE_BASE.clone(),
      fogNear: DAY_FOG_NEAR, fogFar: DAY_FOG_FAR
    };
    const refreshVillagePreset = (): void => {
      villagePreset.sky.copy(DAY_SKY).lerp(AUTUMN_SKY, seasonLevel);
      villagePreset.sun.copy(SUMMER_SUN).lerp(AUTUMN_SUN, seasonLevel);
      villagePreset.hemi.copy(SUMMER_HEMI).lerp(AUTUMN_HEMI, seasonLevel);
      villagePreset.hemiScale = THREE.MathUtils.lerp(1, 0.96, seasonLevel);
      villagePreset.sunScale = THREE.MathUtils.lerp(1, 1.02, seasonLevel);
      villagePreset.grass.copy(GRASS_SUMMER).lerp(GRASS_AUTUMN, seasonLevel);
    };
    const BIOME_PRESETS: AtmoPreset[] = [villagePreset, CITY_PRESET, FOREST_PRESET];
    // The eased "active" atmosphere — chases BIOME_PRESETS[currentLeg] every frame.
    const activeAtmo: AtmoPreset = {
      sky: DAY_SKY.clone(), sun: SUMMER_SUN.clone(), hemi: SUMMER_HEMI.clone(),
      hemiGround: SUMMER_HEMI_GROUND.clone(), hemiScale: 1, sunScale: 1,
      path: PATH_BASE.clone(), grass: GRASS_SUMMER.clone(), line: LINE_BASE.clone(),
      fogNear: DAY_FOG_NEAR, fogFar: DAY_FOG_FAR
    };
    const resetActiveAtmo = (): void => {
      activeAtmo.sky.copy(DAY_SKY);
      activeAtmo.sun.copy(SUMMER_SUN);
      activeAtmo.hemi.copy(SUMMER_HEMI);
      activeAtmo.hemiGround.copy(SUMMER_HEMI_GROUND);
      activeAtmo.hemiScale = 1;
      activeAtmo.sunScale = 1;
      activeAtmo.path.copy(PATH_BASE);
      activeAtmo.grass.copy(GRASS_SUMMER);
      activeAtmo.line.copy(LINE_BASE);
      activeAtmo.fogNear = DAY_FOG_NEAR;
      activeAtmo.fogFar = DAY_FOG_FAR;
      fog.near = DAY_FOG_NEAR;
      fog.far = DAY_FOG_FAR;
    };
    const restoreWorldMats = (): void => {
      for (const s of seasonMats) {
        s.mat.color.copy(s.summer);
      }
      materials.path.color.copy(PATH_BASE);
      materials.grass.color.copy(GRASS_SUMMER);
      materials.roadLine.color.copy(LINE_BASE);
    };

    const cameraController = new CameraController();
    const tapRaycaster = new THREE.Raycaster(); // 鬼 tap-to-lift

    // 龍 Überschall warp: a dense GOLDEN slipstream tunnel streaming past the camera —
    // the dragon's own light tearing past at supersonic speed (legendary, not cheap white scratches).
    const speedLineGeo = new THREE.BoxGeometry(0.07, 0.07, 1);
    const speedLineMat = new THREE.MeshBasicMaterial({
      color: 0xfff3df, // warm-white warp streaks (carry contrast over the golden sky)
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const speedLineCoreMat = new THREE.MeshBasicMaterial({
      color: 0xff9a2a, // saturated orange-gold accent streaks
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const speedLines = new THREE.Group();
    speedLines.name = "hyper_speed_lines";
    speedLines.visible = false;
    const streaks: { mesh: THREE.Mesh; angle: number; radius: number; len: number }[] = [];
    const seedStreak = (s: { mesh: THREE.Mesh; angle: number; radius: number; len: number }, z: number): void => {
      s.angle = Math.random() * Math.PI * 2;
      s.radius = 1.5 + Math.random() * 5.0;
      s.len = 2.5 + Math.random() * 4.5;
      s.mesh.scale.z = s.len;
      s.mesh.position.set(Math.cos(s.angle) * s.radius, Math.sin(s.angle) * s.radius, z);
    };
    for (let i = 0; i < 70; i++) {
      // Every 3rd streak is an orange-gold accent — the rest are warm-white.
      const streak = { mesh: new THREE.Mesh(speedLineGeo, i % 3 === 0 ? speedLineCoreMat : speedLineMat), angle: 0, radius: 0, len: 0 };
      seedStreak(streak, -42 + Math.random() * 45);
      speedLines.add(streak.mesh);
      streaks.push(streak);
    }
    let hyperLevel = 0; // eased 0→1 fade of the speed-line / haze intensity
    let hyperTarget = 0;
    let hyperTime = 0; // free-running clock for afterburner flicker
    let boostLevel = 0; // eased 0→1 fade of the 赤 red nitro afterburner
    let boostTime = 0;

    // 鬼 Schwarzes Loch — an epic violet black hole brewing in the sky. A dark SPHERE
    // (writes depth, so it genuinely occludes the disk's far half → it reads 3D, not a
    // flat decal) wrapped by a tilted, swirling accretion disk; dust wisps orbit it in
    // 3D and a funnel opens downward, sucking the cars up into it.
    const bhCoreMat = new THREE.MeshBasicMaterial({ color: 0x050009 });
    const bhDiskMat = new THREE.MeshBasicMaterial({ color: 0x7a2fd0, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const bhStreakMat = new THREE.MeshBasicMaterial({ color: 0xca8bff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const bhWispMat = new THREE.MeshBasicMaterial({ color: 0x9a4ff0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });
    const bhGlowMat = new THREE.MeshBasicMaterial({ color: 0x4a1690, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });
    const blackHole = new THREE.Group();
    blackHole.name = "black_hole";
    blackHole.visible = false;
    blackHole.position.set(BLACK_HOLE_POS.x, BLACK_HOLE_POS.y, BLACK_HOLE_POS.z);

    const bhGlow = new THREE.Mesh(new THREE.CircleGeometry(5.4, 40), bhGlowMat);
    bhGlow.renderOrder = -2;
    const bhCore = new THREE.Mesh(new THREE.SphereGeometry(1.25, 28, 20), bhCoreMat);
    bhCore.renderOrder = -1;
    blackHole.add(bhGlow, bhCore);

    // Accretion disk: a tilted plane (perspective ellipse) holding a spinning ring + streaks.
    const bhDiskTilt = new THREE.Group();
    bhDiskTilt.rotation.x = -0.5; // lean toward the camera so the disk reads as an ellipse
    const bhDiskSpin = new THREE.Group();
    const bhRing = new THREE.Mesh(new THREE.RingGeometry(1.45, 3.9, 64), bhDiskMat);
    bhRing.rotation.x = -Math.PI / 2; // lay flat in the spin group's XZ plane
    bhDiskSpin.add(bhRing);
    const bhStreakGeo = new THREE.PlaneGeometry(0.85, 0.11);
    for (let i = 0; i < 44; i += 1) {
      const s = new THREE.Mesh(bhStreakGeo, bhStreakMat);
      const a = i * 0.72;
      const r = 1.55 + (i / 44) * 2.3;
      s.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      s.rotation.set(-Math.PI / 2, 0, 0);
      s.rotateZ(-a); // tangent to the swirl, lying in the disk plane
      s.scale.x = 0.8 + (i / 44) * 1.5;
      bhDiskSpin.add(s);
    }
    bhDiskTilt.add(bhDiskSpin);
    blackHole.add(bhDiskTilt);

    // Dust wisps: soft streaks on tilted orbits (3D schlieren swirling around the hole).
    const bhWispGeo = new THREE.PlaneGeometry(1.9, 0.42);
    const bhWisps: { mesh: THREE.Mesh; tilt: number; radius: number; phase: number; speed: number }[] = [];
    for (let i = 0; i < 9; i += 1) {
      const mesh = new THREE.Mesh(bhWispGeo, bhWispMat);
      blackHole.add(mesh);
      bhWisps.push({
        mesh,
        tilt: (i / 9) * Math.PI,
        radius: 2.3 + (i % 3) * 0.75,
        phase: i * 1.3,
        speed: 0.45 + (i % 4) * 0.16
      });
    }

    // Funnel: particles spiralling UP from the road into the sphere — the cars ride this in.
    const bhFunnelGeo = new THREE.PlaneGeometry(0.5, 0.13);
    const bhFunnel: { mesh: THREE.Mesh; phase: number; speed: number; ang: number }[] = [];
    for (let i = 0; i < 30; i += 1) {
      const mesh = new THREE.Mesh(bhFunnelGeo, bhStreakMat);
      blackHole.add(mesh);
      bhFunnel.push({ mesh, phase: i / 30, speed: 0.55 + (i % 5) * 0.1, ang: i * 1.1 });
    }
    let bhLevel = 0; // eased 0→1 brew-in of the whole effect
    let bhTarget = 0;
    let bhSpin = 0; // accumulated disk rotation
    let siphonAccum = 0; // 鬼 Anzapfen continuous-stream accumulator + round-robin source index
    let siphonIdx = 0;
    // 鬼 Anzapfen mini black holes (materials/geometry; pool built once `world` exists below).
    const miniCoreMat = new THREE.MeshBasicMaterial({ color: 0x0a0012, transparent: true, opacity: 0.92, depthWrite: false });
    const miniGlowMat = new THREE.MeshBasicMaterial({ color: 0x6a28b0, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false });
    const miniSwirlMat = new THREE.MeshBasicMaterial({ color: 0xb45cff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    const miniCoreGeo = new THREE.CircleGeometry(0.34, 20);
    const miniGlowGeo = new THREE.CircleGeometry(0.72, 20);
    const miniArmGeo = new THREE.PlaneGeometry(0.13, 0.04);
    const miniHoles: { group: THREE.Group; swirl: THREE.Group }[] = [];
    const runner = mergeByMaterial(models.createVehicle(vehicle.modelKey));
    const chaser = mergeByMaterial(models.createTokyoPoliceCar());
    const collisionSystem = new CollisionSystem();
    const laneSystem = new LaneSystem(2.4);
    const runnerController = new RunnerController(runner, laneSystem, {
      baseScale: vehicle.run.scale,
      forwardRotationY: vehicle.run.forwardRotationY,
      bounds: vehicle.run.bounds
    });
    const scoreSystem = new ScoreSystem();
    const biome = FEUDAL_JAPAN_BIOME_CONTENT;
    const trackLoopLength = biome.track.segmentLength * biome.track.segmentCount;
    const contentLoopLength = biome.contentLoopLength;
    const rowCount = Math.round(contentLoopLength / ROW_GAP); // rows per loop (e.g. 10)
    const trafficDirector = new TrafficDirector(ROW_START, ROW_GAP);
    const world = new THREE.Group();
    // 鬼 Anzapfen: pool of 4 mini black holes (mastery cap), parented to `world` so they
    // scroll with the cars they hover above.
    for (let h = 0; h < 4; h += 1) {
      const group = new THREE.Group();
      group.visible = false;
      const glow = new THREE.Mesh(miniGlowGeo, miniGlowMat);
      glow.position.z = -0.04;
      const core = new THREE.Mesh(miniCoreGeo, miniCoreMat);
      core.position.z = -0.02;
      const swirl = new THREE.Group();
      for (let i = 0; i < 8; i += 1) {
        const arm = new THREE.Mesh(miniArmGeo, miniSwirlMat);
        const a = i * 0.78;
        const r = 0.34 + (i / 8) * 0.34;
        arm.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
        arm.rotation.z = a + Math.PI / 2;
        swirl.add(arm);
      }
      group.add(glow, core, swirl);
      world.add(group);
      miniHoles.push({ group, swirl });
    }
    const groundSegments: TrackPiece[] = [];
    type TintMat = { mat: THREE.MeshStandardMaterial; base: THREE.Color };
    type DecoPiece = {
      object: THREE.Object3D;
      initialZ: number;
      baseX: number;
      baseScale: number;
      kind: DecorationKind;
      biome: number; // 0 = village pool, 1 = neon-city pool (visible only in its macro-leg)
      tints?: TintMat[]; // per-instance weatherable materials (houses)
    };
    const decorative: DecoPiece[] = [];
    const HOUSE_KINDS = new Set<DecorationKind>(["machiyaHouse", "minkaHouse", "nagayaRowHouse", "kuraStorehouse"]);

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

    const trafficSystem = new TrafficSystem(
      runnerController,
      laneSystem,
      collisionSystem,
      () => distance,
      () => getRunSpeed() * runnerController.getSpeedMultiplier(),
      trafficDirector,
      ({ side }) => {
        lastHitWasSide = side;
        scoreSystem.resetCombo();
        registerStrongFail("obstacle");
      },
      ({ car, coins, cause }) => {
        cameraController.shake(0.18, 0.08);
        events?.emit("traffic:destroyed", { cause });
        if (coins > 0) {
          // 将 Nachtjagd: coins drop here and fly to the counter — credited on arrival.
          const drop = new THREE.Vector3(car.mesh.position.x, 0.9, car.trackZ - distance);
          drop.project(cameraController.camera);
          events?.emit("coins:dropped", { amount: coins, ndc: { x: drop.x, y: drop.y } });
        }
      }
    );
    const collectibleSystem = new CollectibleSystem(
      runnerController,
      laneSystem,
      collisionSystem,
      () => distance,
      trafficDirector,
      ({ collectible, amount }) => {
        scoreSystem.addCoin(amount);
        const laneX = laneSystem.getLaneX(collectible.lane);
        spawnCoinSparkle(laneX, collectible.trackZ); // gold pop at the pickup
        events?.emit("coin:collected", {
          amount,
          combo: scoreSystem.getStats(pressure, weakFails).combo,
          worldPosition: {
            x: laneX,
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
    scene.add(world, runner, chaser, speedLines, blackHole);
    collisionSystem.register(runnerController);

    chaser.position.set(introChaserSideOffset, 0, introChaserZ);
    chaser.rotation.y = 0;
    chaser.scale.setScalar(0.92);
    chaser.visible = false;

    // 龍 Überschall afterburner: twin two-layer flame jets (white-hot core inside a
    // saturated-orange flame) streaming off the dragon's tail, plus a warm halo wrapping
    // the car — only lit while Überschall runs (driven by hyperLevel). Saturated/hot so
    // it reads as flame even additively over the bright golden sky.
    const dragonJetMat = new THREE.MeshBasicMaterial({
      color: 0xff6a10, // outer flame (saturated orange)
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const dragonCoreMat = new THREE.MeshBasicMaterial({
      color: 0xfff0c8, // white-hot inner core
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const dragonHaloMat = new THREE.MeshBasicMaterial({
      color: 0xffb347, // warm gold body halo
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const dragonAura = new THREE.Group();
    dragonAura.name = "runner_dragon_aura";
    dragonAura.visible = false;
    const dragonJets: THREE.Mesh[] = [];
    const dragonCores: THREE.Mesh[] = [];
    for (const sx of [-1, 1]) {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.26, 2.4, 14), dragonJetMat);
      flame.rotation.x = -Math.PI / 2; // apex points backward (-Z), trailing the car
      flame.position.set(sx * 0.34, 0.42, -2.4);
      const core = new THREE.Mesh(new THREE.ConeGeometry(0.13, 1.7, 12), dragonCoreMat);
      core.rotation.x = -Math.PI / 2;
      core.position.set(sx * 0.34, 0.42, -2.0);
      dragonJets.push(flame);
      dragonCores.push(core);
      dragonAura.add(flame, core);
    }
    const dragonHalo = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), dragonHaloMat);
    dragonHalo.scale.set(1.0, 0.62, 1.7);
    dragonHalo.position.set(0, 0.5, -0.1);
    dragonAura.add(dragonHalo);
    runner.add(dragonAura);

    // 赤 Striker Boost nitro: twin RED afterburner flames (white-hot core in a crimson
    // flame) + a red body glow, lit while boosting (slightly shorter than the 龍 dragon's
    // so the legendary still outshines the starter). Replaces the old turquoise wisp.
    const boostJetMat = new THREE.MeshBasicMaterial({
      color: 0xff2e0a, // crimson flame
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const boostCoreMat = new THREE.MeshBasicMaterial({
      color: 0xfff0d8, // white-hot core
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const boostHaloMat = new THREE.MeshBasicMaterial({
      color: 0xff4a1e,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const boostBurn = new THREE.Group();
    boostBurn.name = "runner_boost_burn";
    boostBurn.visible = false;
    const boostJets: THREE.Mesh[] = [];
    const boostCores: THREE.Mesh[] = [];
    for (const sx of [-1, 1]) {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.24, 2.0, 14), boostJetMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(sx * 0.34, 0.42, -2.2);
      const core = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.4, 12), boostCoreMat);
      core.rotation.x = -Math.PI / 2;
      core.position.set(sx * 0.34, 0.42, -1.9);
      boostJets.push(flame);
      boostCores.push(core);
      boostBurn.add(flame, core);
    }
    const boostHalo = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), boostHaloMat);
    boostHalo.scale.set(0.95, 0.58, 1.55);
    boostHalo.position.set(0, 0.5, -0.1);
    boostBurn.add(boostHalo);
    runner.add(boostBurn);

    // Speed-reactive taillight streaks: two red light-smears that trail the rear of the
    // car, growing longer + brighter the faster you go. A pure visual speed cue (every
    // car), independent of any ability — overdrives during boost / 龍 Überschall.
    const streakTexture = (() => {
      const canvas = document.createElement("canvas");
      canvas.width = 4;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, 0, 64);
      grad.addColorStop(0, "rgba(255,255,255,1)"); // bright at the taillight (car) end
      grad.addColorStop(0.4, "rgba(255,255,255,0.5)");
      grad.addColorStop(1, "rgba(255,255,255,0)"); // smears out to nothing at the tail
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 4, 64);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })();
    // Normal alpha blend (NOT additive): additive red washes out over the bright daytime
    // road. A saturated opaque red that fades along its length paints a real smear.
    const streakMat = new THREE.MeshBasicMaterial({
      map: streakTexture,
      color: 0xff1828, // taillight red
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const STREAK_LEN = 2.6;
    const tailStreaks = new THREE.Group();
    tailStreaks.name = "runner_tail_streaks";
    tailStreaks.visible = false;
    for (const sx of [-1, 1]) {
      const geo = new THREE.PlaneGeometry(0.34, STREAK_LEN);
      geo.translate(0, -STREAK_LEN / 2, 0); // pivot at the bright edge; geometry extends −Y
      const mesh = new THREE.Mesh(geo, streakMat);
      mesh.rotation.x = Math.PI / 2; // lie flat in XZ so the trail runs backward (−Z)
      mesh.position.set(sx * 0.36, 0.34, -1.05); // at taillight height, just behind the rear
      tailStreaks.add(mesh);
    }
    runner.add(tailStreaks);

    // 藍 Freie Bahn horn blast: expanding indigo shockwave rings that radiate from the
    // car as the horn sounds (cars part before it). Each ring fades over ~0.55 s.
    const hornRingMat = new THREE.MeshBasicMaterial({
      color: 0x86c0ff, // bright indigo so it reads over the grey road
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const hornRingGeo = new THREE.TorusGeometry(1, 0.06, 10, 36); // thin tube → a crisp ripple, not a disc
    const hornRings: { mesh: THREE.Mesh; life: number }[] = [];
    for (let i = 0; i < 3; i += 1) {
      const mesh = new THREE.Mesh(hornRingGeo, hornRingMat.clone());
      mesh.rotation.x = Math.PI / 2; // lie flat on the road, radiating outward
      mesh.visible = false;
      scene.add(mesh);
      hornRings.push({ mesh, life: 0 });
    }

    // 桜 Blütenregen petals: a soft pink blossom-fall drifting through the whole view,
    // anchored to the camera so it fills the frame wherever you look. Ambiance only —
    // the collectible pink coins are separate (CoinRainSystem).
    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xf7a8c8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const petalGeo = new THREE.PlaneGeometry(0.2, 0.13);
    const petals = new THREE.Group();
    petals.name = "sakura_petals";
    petals.visible = false;
    const petalData: { mesh: THREE.Mesh; sway: number; phase: number; fall: number; spin: number }[] = [];
    const seedPetal = (d: { mesh: THREE.Mesh; sway: number; phase: number; fall: number; spin: number }, y: number): void => {
      d.sway = 0.6 + Math.random() * 1.2;
      d.phase = Math.random() * Math.PI * 2;
      d.fall = 1.6 + Math.random() * 1.8;
      d.spin = (Math.random() - 0.5) * 4;
      d.mesh.position.set((Math.random() * 2 - 1) * 6, y, -3 - Math.random() * 13);
      d.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    };
    for (let i = 0; i < 56; i += 1) {
      const d = { mesh: new THREE.Mesh(petalGeo, petalMat), sway: 0, phase: 0, fall: 0, spin: 0 };
      seedPetal(d, -3 + Math.random() * 9);
      petals.add(d.mesh);
      petalData.push(d);
    }
    scene.add(petals);
    let blossomLevel = 0;
    let blossomTarget = 0;
    let petalTime = 0;

    // 紅葉 falling maple leaves — same drift idea as the 桜 petals, but red/orange/gold and
    // driven by the season level (ambient, not an ability). Camera-anchored to fill the frame.
    type LeafD = { mesh: THREE.Mesh; sway: number; phase: number; fall: number; spin: number };
    const leafMats = [0xd23a1e, 0xe07a1e, 0xe6b324].map(
      (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    );
    const leafGeo = new THREE.PlaneGeometry(0.26, 0.2);
    const leaves = new THREE.Group();
    leaves.name = "momiji_leaves";
    leaves.visible = false;
    const leafData: LeafD[] = [];
    const seedLeaf = (d: LeafD, y: number): void => {
      d.sway = 0.5 + Math.random() * 1.1;
      d.phase = Math.random() * Math.PI * 2;
      d.fall = 1.3 + Math.random() * 1.6;
      d.spin = (Math.random() - 0.5) * 5;
      d.mesh.position.set((Math.random() * 2 - 1) * 6.5, y, -3 - Math.random() * 13);
      d.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    };
    for (let i = 0; i < 64; i += 1) {
      const d: LeafD = { mesh: new THREE.Mesh(leafGeo, leafMats[i % leafMats.length]), sway: 0, phase: 0, fall: 0, spin: 0 };
      seedLeaf(d, -3 + Math.random() * 9);
      leaves.add(d.mesh);
      leafData.push(d);
    }
    scene.add(leaves);
    let leafTime = 0;

    // Coin pickup pop: a quick additive gold burst at each collected street coin.
    // Lives in `world` so it rides the road as it scrolls past during its short life.
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffe48a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const sparkleGeo = new THREE.IcosahedronGeometry(0.32, 0);
    const sparkles: { mesh: THREE.Mesh; life: number }[] = [];
    for (let i = 0; i < 10; i += 1) {
      const mesh = new THREE.Mesh(sparkleGeo, sparkleMat.clone());
      mesh.visible = false;
      world.add(mesh);
      sparkles.push({ mesh, life: 0 });
    }

    // 将 Nachtjagd blood moon: a big ominous red moon hangs over the night hunt,
    // billboarded high and far ahead so it sits in the sky wherever the camera points.
    const moonBodyMat = new THREE.MeshBasicMaterial({ color: 0xc8402a, transparent: true, opacity: 0, depthWrite: false });
    const moonGlowMat = new THREE.MeshBasicMaterial({ color: 0xd8542c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const moon = new THREE.Group();
    moon.name = "hunt_blood_moon";
    moon.visible = false;
    const moonGlow = new THREE.Mesh(new THREE.CircleGeometry(9.5, 36), moonGlowMat);
    moonGlow.position.z = -0.2;
    const moonBody = new THREE.Mesh(new THREE.CircleGeometry(5.5, 36), moonBodyMat);
    moon.add(moonGlow, moonBody);
    scene.add(moon);
    let moonLevel = 0;
    let moonTarget = 0;

    // Kind → model factory (exhaustive over DecorationKind, so TS flags any unmapped kind).
    const DECORATION_FACTORY: Record<DecorationKind, () => THREE.Group> = {
      torii: () => models.createTorii(),
      bambooCluster: () => models.createBambooCluster(),
      mapleTree: () => models.createMapleTree(),
      stoneLantern: () => models.createStoneLantern(),
      machiyaHouse: () => models.createMachiyaHouse(),
      minkaHouse: () => models.createMinkaHouse(),
      nagayaRowHouse: () => models.createNagayaRowHouse(),
      kuraStorehouse: () => models.createKuraStorehouse(),
      cyberSlabTower: () => models.createCyberSlabTower(),
      cyberSetbackTower: () => models.createCyberSetbackTower(),
      cyberCapsuleTower: () => models.createCyberCapsuleTower(),
      cyberOfficeMidrise: () => models.createCyberOfficeMidrise(),
      neonShophouse: () => models.createNeonShophouse(),
      pachinkoFacade: () => models.createPachinkoFacade(),
      capsuleHotelBlock: () => models.createCapsuleHotelBlock(),
      rooftopBillboard: () => models.createRooftopBillboard(),
      verticalKanjiBlade: () => models.createVerticalKanjiBlade(),
      hologramAdPanel: () => models.createHologramAdPanel(),
      expresswaySignGantry: () => models.createExpresswaySignGantry(),
      glassSkybridge: () => models.createGlassSkybridge(),
      monorailPillar: () => models.createMonorailPillar(),
      cyberStreetLamp: () => models.createCyberStreetLamp(),
      vendingMachineBank: () => models.createVendingMachineBank(),
      trafficSignal: () => models.createTrafficSignal(),
      utilityPoleWires: () => models.createUtilityPoleWires(),
      concreteSteelBarrier: () => models.createConcreteSteelBarrier(),
      neonSakuraTree: () => models.createNeonSakuraTree(),
      litGinkgoTree: () => models.createLitGinkgoTree(),
      planterHedge: () => models.createPlanterHedge(),
      broadcastTower: () => models.createBroadcastTower(),
      distantTowerCluster: () => models.createDistantTowerCluster(),
      reflectorStrip: () => models.createReflectorStrip(),
      drainGrateKerb: () => models.createDrainGrateKerb(),
      busLaneMarking: () => models.createBusLaneMarking(),
      sugiCedar: () => models.createSugiCedar(),
      mountainPine: () => models.createMountainPine(),
      bambooGrove: () => models.createBambooGrove(),
      valleyMapleTree: () => models.createValleyMapleTree(),
      fernShrub: () => models.createFernShrub(),
      undergrowthShrub: () => models.createUndergrowthShrub(),
      susukiGrass: () => models.createSusukiGrass(),
      mossBoulder: () => models.createMossBoulder(),
      rockCluster: () => models.createRockCluster(),
      rockCairn: () => models.createRockCairn(),
      cliffWall: () => models.createCliffWall(),
      riverSegment: () => models.createRiverSegment(),
      rapidsRock: () => models.createRapidsRock(),
      waterfall: () => models.createWaterfall(),
      steppingStones: () => models.createSteppingStones(),
      forestFootbridge: () => models.createForestFootbridge(),
      chayaTeahouse: () => models.createChayaTeahouse(),
      waterMillHut: () => models.createWaterMillHut(),
      hokoraShrine: () => models.createHokoraShrine(),
      trailheadTorii: () => models.createTrailheadTorii(),
      shimenawaSacredTree: () => models.createShimenawaSacredTree(),
      mossStoneLantern: () => models.createMossStoneLantern(),
      jizoCluster: () => models.createJizoCluster(),
      woodenSignpost: () => models.createWoodenSignpost(),
      sikaDeer: () => models.createSikaDeer(),
      fallenMossyLog: () => models.createFallenMossyLog(),
      mushroomCluster: () => models.createMushroomCluster(),
      mossPatch: () => models.createMossPatch(),
      forestLogEdging: () => models.createForestLogEdging(),
      mossyPathEdging: () => models.createMossyPathEdging(),
      dirtShoulder: () => models.createDirtShoulder(),
      mistyPeaks: () => models.createMistyPeaks(),
      cedarRidge: () => models.createCedarRidge(),
      distantWaterfall: () => models.createDistantWaterfall()
    };
    // Tall city structures + skyline landmarks must not cast shadows.
    const NO_SHADOW_KINDS = new Set<DecorationKind>([
      "cyberSlabTower", "cyberSetbackTower", "cyberCapsuleTower", "cyberOfficeMidrise",
      "neonShophouse", "pachinkoFacade", "capsuleHotelBlock", "rooftopBillboard",
      "verticalKanjiBlade", "hologramAdPanel", "expresswaySignGantry", "glassSkybridge",
      "monorailPillar", "broadcastTower", "distantTowerCluster",
      // 奥山 tall trees / cliffs / landmarks exceed the ~40 m shadow frustum.
      "sugiCedar", "mountainPine", "bambooGrove", "shimenawaSacredTree", "cliffWall",
      "waterfall", "trailheadTorii", "mistyPeaks", "cedarRidge", "distantWaterfall"
    ]);

    for (let offset = 0; offset < biome.track.segmentCount; offset += 1) {
      const index = biome.track.startIndex + offset;
      // Merge road + grass + every lane dash into a few draw calls (per material).
      const segment = mergeByMaterial(models.createGroundSegment(biome.track.segmentLength));
      segment.position.z = index * biome.track.segmentLength;
      freezeStaticChildren(segment);
      groundSegments.push({ object: segment, initialZ: segment.position.z });
      world.add(segment);
    }

    // Two independent decoration pools tiling the SAME content loop: the feudal village
    // (biome 0) and the neon city (biome 1). Both exist at once; each piece is visible only
    // while its own z sits in its macro-leg, so the world swaps seamlessly at recycle time
    // (off-screen in the fog). The run begins in the village leg.
    const buildPool = (placements: typeof biome.decorations, biomeIndex: number): void => {
      for (const placement of placements) {
        const decoration = createDecoration(placement.kind);
        decoration.position.set(placement.x, 0, placement.z);
        decoration.rotation.y = placement.rotationY ?? 0;
        decoration.scale.setScalar(placement.scale ?? 1);
        freezeStaticChildren(decoration);
        addDecorative(decoration, placement.kind, biomeIndex);
      }
    };
    buildPool(biome.decorations, 0);
    buildPool(NEON_CITY_DECORATIONS, 1);
    buildPool(FOREST_VALLEY_DECORATIONS, 2);

    for (let index = 0; index < biome.coins.count; index += 1) {
      const coin = models.createKoban();
      const trackZ = biome.coins.startZ + index * biome.coins.spacing;
      collectibleSystem.add({
        id: `coin-${trackZ}`,
        mesh: coin,
        lane: trafficDirector.safeLaneForZ(trackZ), // placeholder; reset re-lanes per run
        trackZ
      });
      world.add(coin);
    }

    // Procedural traffic pool: `rowCount` rows × 2 slots, kinds mixed across the pool.
    // The director decides each slot's lane (or hides it) per run and per recycle.
    const TRAFFIC_KINDS: TrafficCarKind[] = ["traffic-kei-hatch", "traffic-city-sedan", "traffic-box-van"];
    for (let key = 0; key < rowCount; key += 1) {
      const rowZ = ROW_START + key * ROW_GAP;
      for (let slot = 0; slot < 2; slot += 1) {
        const kind = TRAFFIC_KINDS[(key + slot) % TRAFFIC_KINDS.length];
        // Merge the static body; keep the animated blinkers + wreck smoke separate.
        const mesh = mergeByMaterial(models.createTrafficCar(kind), /blinker|smoke/);
        const spec = TRAFFIC_CAR_SPECS[kind];
        trafficSystem.add({
          id: `traffic-${key}-${slot}`,
          kind,
          mesh,
          lane: slot === 0 ? -1 : 1, // placeholder; the director sets the real lane on reset
          trackZ: rowZ,
          speed: spec.speed,
          collider: spec.collider,
          patternId: `row-${key}`,
          slotIndex: slot
        });
        world.add(mesh);
      }
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
      trafficDirector.reset(); // fresh procedural sequence — every run different
      resetWorldPieces();
      runnerController.reset();
      collectibleSystem.reset();
      daredevilPursuit = 0;
      coinRain.reset();
      trafficSystem.reset();
      trafficSystem.setRamMode(undefined);
      trafficSystem.setLiftMode(undefined);
      turret.reset();
      tintTarget = 0;
      tintLevel = 0;
      sceneLights.hemi.intensity = dayHemi;
      sceneLights.sun.intensity = daySun;
      (scene.background as THREE.Color).copy(DAY_SKY);
      (scene.fog as THREE.Fog).color.copy(DAY_SKY);
      // 龍 Überschall: clear the supersonic VFX so a new run starts at normal speed/FOV.
      hyperTarget = 0;
      hyperLevel = 0;
      speedLineMat.opacity = 0;
      speedLineCoreMat.opacity = 0;
      speedLines.visible = false;
      dragonAura.visible = false;
      boostLevel = 0;
      boostBurn.visible = false;
      for (const ring of hornRings) {
        ring.life = 0;
        ring.mesh.visible = false;
      }
      blossomLevel = 0;
      blossomTarget = 0;
      petalMat.opacity = 0;
      petals.visible = false;
      // 紅葉 season + macro-biome: back to the summer village; restore shared materials + atmosphere.
      seasonLevel = 0;
      seasonTarget = 0;
      resetActiveAtmo();
      restoreWorldMats();
      sceneLights.sun.color.copy(SUMMER_SUN);
      sceneLights.hemi.color.copy(SUMMER_HEMI);
      sceneLights.hemi.groundColor.copy(SUMMER_HEMI_GROUND);
      for (const m of leafMats) {
        m.opacity = 0;
      }
      leaves.visible = false;
      moonLevel = 0;
      moonTarget = 0;
      moon.visible = false;
      for (const s of sparkles) {
        s.life = 0;
        s.mesh.visible = false;
      }
      cameraController.setFovBoost(0);
      // 鬼 Schwarzes Loch: hide the vortex and reset the siphon stream.
      bhTarget = 0;
      bhLevel = 0;
      bhSpin = 0;
      bhGlowMat.opacity = 0;
      bhDiskMat.opacity = 0;
      bhStreakMat.opacity = 0;
      bhWispMat.opacity = 0;
      blackHole.visible = false;
      blackHole.scale.setScalar(1);
      siphonAccum = 0;
      siphonIdx = 0;
      for (const mh of miniHoles) {
        mh.group.visible = false;
      }
    };

    const moveLane = (direction: -1 | 1): void => {
      const result = direction < 0 ? runnerController.moveLeft() : runnerController.moveRight();
      if (result.mistake) {
        registerLightMistake(direction);
      } else if (result.moved) {
        events?.emit("runner:laneChanged", { lane: result.lane });
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
        // 紅葉 season oscillates within the VILLAGE leg only (held at summer in city + forest).
        seasonTarget =
          biomeManager.biomeIndexForZ(distance) === 0 ? (Math.floor(distance / SEASON_LEG) % 2 === 1 ? 1 : 0) : 0;
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
      updateTailStreaks(activeSpeed, isRunning);
      updateHornPulse(dt);
      updatePetals(dt);
      updateLeaves(dt);
      updateMoon(dt);
      updateCoinSparkles(dt);
      updateChaser(dt, elapsed, isRunning);

      world.position.z = -distance;
      cameraController.update(dt, elapsed, state, isRunning ? runnerController.getPosition().x : 0);
      updateAtmosphere(dt);
      updateSpeedLines(dt);
      updateBlackHole(dt);
    };

    function setTint(on: boolean, sky: THREE.Color, hemiScale: number, sunScale: number): void {
      tintTarget = on ? 1 : 0;
      if (on) {
        tintSky.copy(sky);
        tintHemiScale = hemiScale;
        tintSunScale = sunScale;
      }
    }

    function updateAtmosphere(dt: number): void {
      // Ease season + macro-biome (slow) and the ability tint (fast) toward target.
      seasonLevel = THREE.MathUtils.lerp(seasonLevel, seasonTarget, Math.min(1, dt * 0.5));
      if (Math.abs(seasonLevel - seasonTarget) < 0.002) {
        seasonLevel = seasonTarget;
      }
      if (tintLevel !== tintTarget) {
        tintLevel = THREE.MathUtils.lerp(tintLevel, tintTarget, Math.min(1, dt * 3.5));
        if (Math.abs(tintLevel - tintTarget) < 0.01) {
          tintLevel = tintTarget;
        }
      }
      // Ease the active atmosphere toward the current macro-biome's preset (slow, so the sky
      // never snaps at a leg boundary). Village preset is season-modulated first.
      refreshVillagePreset();
      const target = BIOME_PRESETS[biomeManager.legIndexForDistance(distance)] ?? villagePreset;
      const k = Math.min(1, dt * 0.5);
      activeAtmo.sky.lerp(target.sky, k);
      activeAtmo.sun.lerp(target.sun, k);
      activeAtmo.hemi.lerp(target.hemi, k);
      activeAtmo.hemiGround.lerp(target.hemiGround, k);
      activeAtmo.hemiScale = THREE.MathUtils.lerp(activeAtmo.hemiScale, target.hemiScale, k);
      activeAtmo.sunScale = THREE.MathUtils.lerp(activeAtmo.sunScale, target.sunScale, k);
      activeAtmo.path.lerp(target.path, k);
      activeAtmo.grass.lerp(target.grass, k);
      activeAtmo.line.lerp(target.line, k);
      activeAtmo.fogNear = THREE.MathUtils.lerp(activeAtmo.fogNear, target.fogNear, k);
      activeAtmo.fogFar = THREE.MathUtils.lerp(activeAtmo.fogFar, target.fogFar, k);
      // Apply — ability tint composes on top via tintLevel.
      const sky = activeAtmo.sky.clone().lerp(tintSky, tintLevel);
      (scene.background as THREE.Color).copy(sky);
      fog.color.copy(sky);
      fog.near = activeAtmo.fogNear;
      fog.far = activeAtmo.fogFar;
      sceneLights.hemi.intensity = THREE.MathUtils.lerp(dayHemi * activeAtmo.hemiScale, dayHemi * activeAtmo.hemiScale * tintHemiScale, tintLevel);
      sceneLights.sun.intensity = THREE.MathUtils.lerp(daySun * activeAtmo.sunScale, daySun * activeAtmo.sunScale * tintSunScale, tintLevel);
      sceneLights.sun.color.copy(activeAtmo.sun);
      sceneLights.hemi.color.copy(activeAtmo.hemi);
      sceneLights.hemi.groundColor.copy(activeAtmo.hemiGround);
      materials.grass.color.copy(activeAtmo.grass);
      materials.path.color.copy(activeAtmo.path);
      materials.roadLine.color.copy(activeAtmo.line);
      // Maple canopies (village-only) follow the season.
      for (const s of seasonMats) {
        s.mat.color.copy(s.summer).lerp(s.autumn, seasonLevel);
      }
    }

    function updateLeaves(dt: number): void {
      const op = seasonLevel * 0.85;
      for (const m of leafMats) {
        m.opacity = op;
      }
      leaves.visible = op > 0.02;
      if (!leaves.visible) {
        return;
      }
      leafTime += dt;
      // Anchor the field to the camera so leaves fill the view wherever it points.
      leaves.position.copy(cameraController.camera.position);
      leaves.quaternion.copy(cameraController.camera.quaternion);
      for (const d of leafData) {
        const m = d.mesh;
        m.position.y -= d.fall * dt;
        m.position.x += Math.sin(leafTime * d.sway + d.phase) * dt * 0.8;
        m.rotation.x += d.spin * dt;
        m.rotation.z += d.spin * dt * 0.7;
        if (m.position.y < -4) {
          seedLeaf(d, 6); // recycle to the top of the field
        }
      }
    }

    function updateTailStreaks(speed: number, running: boolean): void {
      // Below ~13 m/s: no streaks. Ramps in toward maxSpeed and overdrives past it
      // (boost / 龍 Überschall push speed above max → longer, brighter smears).
      const s = running ? THREE.MathUtils.clamp((speed - 13) / (maxSpeed - 13), 0, 1.6) : 0;
      if (s <= 0.02) {
        tailStreaks.visible = false;
        return;
      }
      tailStreaks.visible = true;
      streakMat.opacity = Math.min(0.8, 0.12 + s * 0.55);
      const len = 0.4 + s * 0.85; // length multiplier on the 2.6 m base
      const wide = 0.8 + s * 0.5;
      for (const mesh of tailStreaks.children as THREE.Mesh[]) {
        mesh.scale.y = len; // geometry length axis (trail length)
        mesh.scale.x = wide; // width
      }
    }

    function setHyperspeed(on: boolean): void {
      // Bright supersonic haze (no darkening), a punched-out FOV and the speed lines.
      setTint(on, HYPER_SKY, 1, 1.08);
      cameraController.setFovBoost(on ? 12 : 0);
      hyperTarget = on ? 1 : 0;
    }

    function updateSpeedLines(dt: number): void {
      if (hyperLevel !== hyperTarget) {
        hyperLevel = THREE.MathUtils.lerp(hyperLevel, hyperTarget, Math.min(1, dt * 4));
        if (Math.abs(hyperLevel - hyperTarget) < 0.01) {
          hyperLevel = hyperTarget;
        }
        speedLineMat.opacity = hyperLevel * 0.85;
        speedLineCoreMat.opacity = hyperLevel * 0.95;
        speedLines.visible = hyperLevel > 0.01;
      }
      updateDragonAura(dt);
      if (!speedLines.visible) {
        return;
      }
      // Anchor the field to the camera, then stream the streaks toward (and past) the viewer.
      speedLines.position.copy(cameraController.camera.position);
      speedLines.quaternion.copy(cameraController.camera.quaternion);
      const step = 80 * dt; // supersonic streaming
      for (const s of streaks) {
        s.mesh.position.z += step;
        if (s.mesh.position.z > 3.5) {
          seedStreak(s, -42);
        }
      }
    }

    function updateDragonAura(dt: number): void {
      dragonAura.visible = hyperLevel > 0.01;
      if (!dragonAura.visible) {
        return;
      }
      hyperTime += dt;
      const flicker = 0.8 + 0.2 * Math.sin(hyperTime * 38); // fast jet flutter
      const pulse = 0.85 + 0.15 * Math.sin(hyperTime * 6);
      dragonJetMat.opacity = hyperLevel * 0.95 * flicker;
      dragonCoreMat.opacity = hyperLevel * 0.95;
      dragonHaloMat.opacity = hyperLevel * 0.34 * pulse;
      for (const jet of dragonJets) {
        jet.scale.set(flicker, flicker, hyperLevel * (1.1 + 0.5 * flicker));
      }
      for (const core of dragonCores) {
        core.scale.set(1, 1, hyperLevel * (1.0 + 0.4 * flicker));
      }
      dragonHalo.rotation.z += dt * 1.6;
    }

    function setBlackHole(on: boolean): void {
      setTint(on, BLACKHOLE_SKY, 0.2, 0.26);
      bhTarget = on ? 1 : 0;
    }

    function updateBlackHole(dt: number): void {
      if (bhLevel !== bhTarget) {
        bhLevel = THREE.MathUtils.lerp(bhLevel, bhTarget, Math.min(1, dt * 3));
        if (Math.abs(bhLevel - bhTarget) < 0.01) {
          bhLevel = bhTarget;
        }
        bhGlowMat.opacity = bhLevel * 0.5;
        bhDiskMat.opacity = bhLevel * 0.5;
        bhStreakMat.opacity = bhLevel * 0.9;
        bhWispMat.opacity = bhLevel * 0.5;
        blackHole.visible = bhLevel > 0.01;
        blackHole.scale.setScalar(0.55 + bhLevel * 0.45); // brews/grows as it forms
      }
      if (!blackHole.visible) {
        return;
      }
      const camQ = cameraController.camera.quaternion;
      // Disk spins fast while brewing in, then settles.
      bhSpin += dt * (1.1 + (1 - bhLevel) * 3.5);
      bhDiskSpin.rotation.y = bhSpin;
      // Dust wisps orbit on tilted rings (3D), billboarded so they read as soft schlieren.
      for (const w of bhWisps) {
        const th = w.phase + bhSpin * w.speed * 0.6;
        const z0 = Math.sin(th) * w.radius;
        w.mesh.position.set(Math.cos(th) * w.radius, -z0 * Math.sin(w.tilt), z0 * Math.cos(w.tilt));
        w.mesh.quaternion.copy(camQ);
      }
      // Funnel particles spiral UP from the road into the sphere (the cars ride this in).
      for (const f of bhFunnel) {
        f.phase = (f.phase + dt * f.speed * 0.4) % 1;
        const p = f.phase; // 0 at the bottom (toward the road), 1 at the sphere
        f.mesh.position.set(Math.cos(f.ang + p * 9) * (1.8 * (1 - p) + 0.35), -7 + p * 7, Math.sin(f.ang + p * 9) * (1.8 * (1 - p) + 0.35));
        f.mesh.quaternion.copy(camQ);
      }
      bhGlow.quaternion.copy(camQ); // billboard the halo (group has no rotation)
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
        setRamMode: (coins) => trafficSystem.setRamMode(coins),
        setLiftMode: (coins) => trafficSystem.setLiftMode(coins)
      },
      coins: {
        biasLane: (lane) => collectibleSystem.setLaneBias(lane),
        pullToLane: (lane) => collectibleSystem.pullToLane(lane),
        redistribute: () => collectibleSystem.redistribute(),
        rain: (on, level) => coinRain.setActive(on, level)
      },
      scene: {
        setNight: (on) => setNight(on),
        setBlackHole: (on) => setBlackHole(on),
        setHyperspeed: (on) => setHyperspeed(on),
        kick: () => cameraController.shake(0.24, 0.13),
        hornPulse: () => triggerHornPulse(),
        setBlossom: (on) => setBlossom(on)
      }
    };

    const dispose = (): void => {
      coinRain.dispose();
      turret.dispose();
      speedLineMat.dispose();
      speedLineCoreMat.dispose();
      dragonJetMat.dispose();
      dragonCoreMat.dispose();
      dragonHaloMat.dispose();
      boostJetMat.dispose();
      boostCoreMat.dispose();
      boostHaloMat.dispose();
      hornRingMat.dispose();
      hornRingGeo.dispose();
      for (const ring of hornRings) {
        (ring.mesh.material as THREE.Material).dispose();
      }
      petalMat.dispose();
      petalGeo.dispose();
      // 紅葉 leaves + restore the shared materials the season/biome morphed (so other scenes
      // that share MaterialFactory always see the village base).
      restoreWorldMats();
      sceneLights.sun.color.copy(SUMMER_SUN);
      sceneLights.hemi.color.copy(SUMMER_HEMI);
      sceneLights.hemi.groundColor.copy(SUMMER_HEMI_GROUND);
      leafGeo.dispose();
      for (const m of leafMats) {
        m.dispose();
      }
      moonBodyMat.dispose();
      moonGlowMat.dispose();
      sparkleMat.dispose();
      sparkleGeo.dispose();
      for (const s of sparkles) {
        (s.mesh.material as THREE.Material).dispose();
      }
      for (const deco of decorative) {
        deco.tints?.forEach((t) => t.mat.dispose()); // cloned per-house weathering materials
      }
      bhGlowMat.dispose();
      bhCoreMat.dispose();
      bhDiskMat.dispose();
      bhStreakMat.dispose();
      bhWispMat.dispose();
      miniCoreMat.dispose();
      miniGlowMat.dispose();
      miniSwirlMat.dispose();
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

    function updateBoostAura(dt: number, _elapsed: number): void {
      // 赤 red nitro afterburner — shown while boosting, but NOT during 龍 Überschall
      // (the dragon's golden afterburner takes over there).
      const want = runnerController.isBoosting() && hyperLevel < 0.01 ? 1 : 0;
      boostLevel = THREE.MathUtils.lerp(boostLevel, want, Math.min(1, dt * 9));
      if (Math.abs(boostLevel - want) < 0.01) {
        boostLevel = want;
      }
      boostBurn.visible = boostLevel > 0.01;
      if (!boostBurn.visible) {
        return;
      }
      boostTime += dt;
      const flicker = 0.8 + 0.2 * Math.sin(boostTime * 40);
      const pulse = 0.85 + 0.15 * Math.sin(boostTime * 7);
      boostJetMat.opacity = boostLevel * 0.95 * flicker;
      boostCoreMat.opacity = boostLevel * 0.95;
      boostHaloMat.opacity = boostLevel * 0.3 * pulse;
      for (const jet of boostJets) {
        jet.scale.set(flicker, flicker, boostLevel * (1.05 + 0.5 * flicker));
      }
      for (const core of boostCores) {
        core.scale.set(1, 1, boostLevel * (1.0 + 0.4 * flicker));
      }
      boostHalo.rotation.z += dt * 1.8;
    }

    function triggerHornPulse(): void {
      const ring = hornRings.find((r) => r.life <= 0) ?? hornRings[0];
      const pos = runnerController.getPosition();
      ring.life = 1;
      ring.mesh.visible = true;
      ring.mesh.position.set(pos.x, 0.35, pos.z);
      ring.mesh.scale.setScalar(0.4);
    }

    function updateHornPulse(dt: number): void {
      for (const ring of hornRings) {
        if (ring.life <= 0) {
          continue;
        }
        ring.life = Math.max(0, ring.life - dt / 0.55);
        if (ring.life <= 0.01) {
          ring.mesh.visible = false;
          continue;
        }
        const grow = 1 - ring.life;
        ring.mesh.scale.setScalar(0.5 + grow * 4.0); // stays roughly road-width
        (ring.mesh.material as THREE.MeshBasicMaterial).opacity = ring.life * 0.85;
        const pos = runnerController.getPosition(); // ride along with the car
        ring.mesh.position.x = pos.x;
        ring.mesh.position.z = pos.z;
      }
    }

    function spawnCoinSparkle(x: number, trackZ: number): void {
      const s = sparkles.find((sp) => sp.life <= 0);
      if (!s) {
        return;
      }
      s.life = 1;
      s.mesh.visible = true;
      s.mesh.position.set(x, 0.95, trackZ);
      s.mesh.rotation.set(Math.PI * x, trackZ, 0); // vary orientation per pickup
      s.mesh.scale.setScalar(0.3);
    }

    function updateCoinSparkles(dt: number): void {
      for (const s of sparkles) {
        if (s.life <= 0) {
          continue;
        }
        s.life = Math.max(0, s.life - dt / 0.3);
        if (s.life <= 0.01) {
          s.mesh.visible = false;
          continue;
        }
        (s.mesh.material as THREE.MeshBasicMaterial).opacity = s.life * 0.9;
        s.mesh.scale.setScalar(0.3 + (1 - s.life) * 1.5);
        s.mesh.rotation.y += dt * 9;
      }
    }

    function setNight(on: boolean): void {
      setTint(on, NIGHT_SKY, 0.28, 0.32); // 将 Nachtjagd — fall to night
      moonTarget = on ? 1 : 0; // raise/lower the blood moon
    }

    function updateMoon(dt: number): void {
      if (moonLevel !== moonTarget) {
        moonLevel = THREE.MathUtils.lerp(moonLevel, moonTarget, Math.min(1, dt * 2.5));
        if (Math.abs(moonLevel - moonTarget) < 0.01) {
          moonLevel = moonTarget;
        }
        moonBodyMat.opacity = moonLevel;
        moonGlowMat.opacity = moonLevel * 0.4;
        moon.visible = moonLevel > 0.01;
      }
      if (!moon.visible) {
        return;
      }
      // Hang high and far ahead, billboarded to face the camera (reads as a sky moon).
      const cam = cameraController.camera;
      moon.position.set(cam.position.x + 7, cam.position.y + 16, cam.position.z + 58);
      moon.quaternion.copy(cam.quaternion);
    }

    function setBlossom(on: boolean): void {
      setTint(on, SAKURA_SKY, 0.92, 0.96); // soft pink atmosphere (barely darkened)
      blossomTarget = on ? 1 : 0;
    }

    function updatePetals(dt: number): void {
      if (blossomLevel !== blossomTarget) {
        blossomLevel = THREE.MathUtils.lerp(blossomLevel, blossomTarget, Math.min(1, dt * 3));
        if (Math.abs(blossomLevel - blossomTarget) < 0.01) {
          blossomLevel = blossomTarget;
        }
        petalMat.opacity = blossomLevel * 0.95;
        petals.visible = blossomLevel > 0.01;
      }
      if (!petals.visible) {
        return;
      }
      petalTime += dt;
      // Anchor the field to the camera so petals fill the view wherever it points.
      petals.position.copy(cameraController.camera.position);
      petals.quaternion.copy(cameraController.camera.quaternion);
      for (const d of petalData) {
        const m = d.mesh;
        m.position.y -= d.fall * dt;
        m.position.x += Math.sin(petalTime * d.sway + d.phase) * dt * 0.7;
        m.rotation.z += d.spin * dt;
        m.rotation.x += d.spin * 0.5 * dt;
        if (m.position.y < -3.5) {
          seedPetal(d, 6); // recycle to the top of the field
        }
      }
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
          jitterDecoration(deco); // re-roll its offset/scale each loop
          applyBiomeVisibility(deco); // its new z may have crossed a macro-biome boundary
        }
      }
    }

    // A piece is visible only while its own absolute z sits in its macro-leg. Its z only
    // changes at recycle (>18 m behind the camera), so every toggle happens off-screen.
    function applyBiomeVisibility(deco: DecoPiece): void {
      deco.object.visible = biomeManager.biomeIndexForZ(deco.object.position.z) === deco.biome;
    }

    function resetWorldPieces(): void {
      for (const segment of groundSegments) {
        segment.object.position.z = segment.initialZ;
      }

      for (const deco of decorative) {
        deco.object.position.z = deco.initialZ;
        jitterDecoration(deco); // fresh scenery layout each run
        applyBiomeVisibility(deco); // every run starts at distance 0 → village leg
      }
    }

    function addDecorative(object: THREE.Object3D, kind: DecorationKind, biomeIndex: number): void {
      const piece: DecoPiece = {
        object,
        initialZ: object.position.z,
        baseX: object.position.x,
        baseScale: object.scale.x,
        kind,
        biome: biomeIndex
      };
      if (HOUSE_KINDS.has(kind)) {
        piece.tints = buildTints(object); // clone materials so each house can weather independently
      }
      decorative.push(piece);
      jitterDecoration(piece);
      applyBiomeVisibility(piece);
      world.add(object);
    }

    // Clone every (deduped) material on a decoration so it owns its colours, keeping the
    // original tone as a base to re-tint from. No geometry/material churn at recycle time.
    function buildTints(object: THREE.Object3D): TintMat[] {
      const seen = new Map<THREE.Material, THREE.MeshStandardMaterial>();
      const tints: TintMat[] = [];
      object.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) {
          return;
        }
        const remap = (m: THREE.Material): THREE.Material => {
          let cloned = seen.get(m);
          if (!cloned) {
            cloned = (m as THREE.MeshStandardMaterial).clone();
            seen.set(m, cloned);
            tints.push({ mat: cloned, base: cloned.color.clone() });
          }
          return cloned;
        };
        mesh.material = Array.isArray(mesh.material) ? mesh.material.map(remap) : remap(mesh.material);
      });
      return tints;
    }

    // Per-instance weathering: shift the whole building a touch warmer/cooler and
    // lighter/darker, so two of the same house kind never look identical.
    function applyTint(tints: TintMat[]): void {
      const bright = 0.74 + Math.random() * 0.42;
      const warm = 0.9 + Math.random() * 0.22;
      const cool = 0.9 + Math.random() * 0.18;
      for (const t of tints) {
        t.mat.color.copy(t.base);
        t.mat.color.r *= bright * warm;
        t.mat.color.g *= bright;
        t.mat.color.b *= bright * cool;
      }
    }

    // Per-run / per-recycle scenery variety: nudge each prop outward off the road, vary
    // its scale, spin the bamboo, and re-weather houses — so the roadside never reads as
    // an obvious repeating loop.
    function jitterDecoration(piece: DecoPiece): void {
      const dir = Math.sign(piece.baseX); // 0 for centred props (torii) — leave them put
      piece.object.position.x = piece.baseX + dir * Math.random() * 0.7;
      piece.object.scale.setScalar(piece.baseScale * (0.85 + Math.random() * 0.3));
      if (piece.kind === "bambooCluster") {
        piece.object.rotation.y = Math.random() * Math.PI * 2; // bamboo reads fine at any spin
      }
      if (piece.tints) {
        applyTint(piece.tints);
      }
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
      // Every decoration is static low-poly — merge its dozens of boxes into a handful
      // of draw calls (per material). Tall city structures are forced non-shadow-casting
      // (the 40 m shadow frustum can't hold them — they'd flicker + cost for nothing).
      const merged = mergeByMaterial(DECORATION_FACTORY[kind]());
      if (NO_SHADOW_KINDS.has(kind)) {
        merged.traverse((object) => {
          (object as THREE.Mesh).castShadow = false;
        });
      }
      return merged;
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
      // 龍 Zu schnell shrinks this window (10 s → 1 s) — the police barely get a second chance.
      lightMistakeWindowTimer = passiveHooks?.catchWindowSec() ?? lightMistakeCatchWindow;
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

    return {
      scene,
      cameraController,
      update,
      resetRun,
      moveLane,
      activateBoost,
      getRunStats,
      getSpeedRatio: () => (getRunSpeed() * runnerController.getSpeedMultiplier()) / maxSpeed,
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
      tapLift: (ndcX: number, ndcY: number) => {
        tapRaycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cameraController.camera);
        trafficSystem.tryLift(tapRaycaster, BLACK_HOLE_POS); // tapped car flies into the hole
      },
      isPoliceBehind: () => lightMistakeWindowTimer > 0 || daredevilPursuit > 0,
      siphonStream: (dt: number, coinsPerCar: number, maxCars: number) => {
        const cars = trafficSystem.nearestCars(maxCars, SIPHON_RANGE);
        // A small black hole hovers over each drained car (spins, faces the camera);
        // unused pool slots are hidden.
        for (let i = 0; i < miniHoles.length; i += 1) {
          const mh = miniHoles[i];
          const car = cars[i];
          if (car) {
            mh.group.visible = true;
            mh.group.position.set(car.mesh.position.x, 1.7, car.trackZ);
            mh.group.lookAt(cameraController.camera.position);
            mh.swirl.rotation.z += dt * 4;
          } else {
            mh.group.visible = false;
          }
        }
        if (cars.length === 0) {
          siphonAccum = 0;
          return;
        }
        // Steady drip: total rate = coinsPerCar × cars-in-range, emitted as single coins
        // round-robin from the nearest cars (from the mini hole above them), so it reads
        // as a continuous stream.
        siphonAccum += coinsPerCar * cars.length * dt;
        let guard = 8; // frame safety cap
        while (siphonAccum >= 1 && guard-- > 0) {
          siphonAccum -= 1;
          const car = cars[siphonIdx % cars.length];
          siphonIdx += 1;
          const drop = new THREE.Vector3(car.mesh.position.x, 1.7, car.trackZ - distance);
          drop.project(cameraController.camera);
          events?.emit("coins:dropped", { amount: 1, ndc: { x: drop.x, y: drop.y } });
        }
      },
      clearSiphonVfx: () => {
        for (const mh of miniHoles) {
          mh.group.visible = false;
        }
      },
      creditCoins: (amount: number) => {
        scoreSystem.addCoin(amount);
        events?.emit("coin:collected", {
          amount,
          combo: scoreSystem.getStats(pressure, weakFails).combo,
          worldPosition: { x: runnerController.getPosition().x, y: 0.9, z: 0 }
        });
      },
      dispose
    };
  }
}
