import * as THREE from "three";
import type { GameConfig } from "../../app/GameConfig";
import { GarageShowroomController } from "../../game/garage/GarageShowroomController";
import type { GarageSelectionResult, GarageVehiclePreview } from "../../game/garage/GarageTypes";
import type { GameState } from "../../game/state/GameStateTypes";
import {
  getAllVehicles,
  getOwnedVehicleDefinition,
  type VehicleDefinition
} from "../../game/vehicles/VehicleCatalog";
import { MaterialFactory } from "../assets/MaterialFactory";
import { ModelFactory } from "../assets/ModelFactory";
import type { AppScene } from "./AppScene";
import { GarageBackdrop } from "./GarageBackdrop";

export type GarageSceneBundle = AppScene & {
  moveSelection(direction: -1 | 1): void;
  confirmSelection(): GarageSelectionResult;
  cancelPreview(): void;
  isSwitching(): boolean;
  getPreviewVehicle(): VehicleDefinition;
  getPreview(): GarageVehiclePreview;
  refreshOwnership(unlockedVehicleIds: string[], totalCoins: number): void;
  getConfirmedVehicle(): VehicleDefinition;
};

class GarageCameraController {
  readonly camera = new THREE.PerspectiveCamera(46, 1, 0.1, 80);
  // ¾ angle looking INTO a deep room (DESIGN_VISION §9 / §15.5), not frontal.
  private readonly target = new THREE.Vector3(0, 0.6, -0.25);
  private readonly desiredTarget = this.target.clone();
  private readonly basePosition = new THREE.Vector3(2.85, 1.5, 5.15);
  private pullback = 0;
  private sideOffset = 0;
  private heightOffset = 0;
  private targetLift = 0;

  constructor() {
    this.camera.position.copy(this.basePosition);
    this.camera.lookAt(this.target);
  }

  setVehicle(vehicle: VehicleDefinition, snap = false): void {
    const focus = vehicle.showroom.cameraFocusOffset;
    this.desiredTarget.set(focus.x, 0.55, focus.z - 0.25);
    if (snap) {
      this.target.copy(this.desiredTarget);
    }
  }

  resize(width: number, height: number): void {
    const aspect = width / Math.max(1, height);
    this.camera.aspect = aspect;
    // Portrait is its own stage: closer + more frontal + lower camera looking UP,
    // so the car rides low (cut from below) and the kanji towers out of the top.
    const portrait = aspect < 0.72;
    const snug = aspect < 1;
    this.pullback = portrait ? -0.7 : snug ? 1.1 : 0;
    this.sideOffset = portrait ? -1.55 : snug ? -0.7 : 0;
    this.heightOffset = portrait ? -0.32 : 0;
    this.targetLift = portrait ? 0.82 : snug ? 0.1 : 0;
    this.camera.updateProjectionMatrix();
  }

  update(dt: number, elapsed: number): void {
    const sway = Math.sin(elapsed * 0.4) * 0.06;
    this.target.lerp(this.desiredTarget, Math.min(1, dt * 5));
    this.camera.position.set(
      this.basePosition.x + this.sideOffset + sway,
      this.basePosition.y + this.heightOffset,
      this.basePosition.z + this.pullback
    );
    this.camera.lookAt(this.target.x, this.target.y + this.targetLift, this.target.z);
  }
}

export class GarageSceneFactory {
  static create(
    config: GameConfig,
    models: ModelFactory,
    materials: MaterialFactory,
    selectedVehicleId: string,
    unlockedVehicleIds: string[],
    totalCoins: number
  ): GarageSceneBundle {
    const scene = new THREE.Scene();
    scene.name = "garage_showroom_scene";
    scene.background = new THREE.Color(0x17121a);
    scene.fog = new THREE.Fog(0x17121a, 7, 24);

    const cameraController = new GarageCameraController();
    const vehicles = getAllVehicles();
    const initialVehicle = getOwnedVehicleDefinition(selectedVehicleId, unlockedVehicleIds);
    const showroomRoot = new THREE.Group();
    showroomRoot.name = "garage_showroom_root";
    scene.add(showroomRoot);

    buildLighting(scene, config.quality);
    buildGarageShell(showroomRoot, materials);

    const backdrop = new GarageBackdrop();
    scene.add(backdrop.group);

    const controller = new GarageShowroomController(
      models,
      showroomRoot,
      vehicles,
      initialVehicle.id,
      unlockedVehicleIds,
      totalCoins
    );
    cameraController.setVehicle(controller.getPreviewVehicle(), true);
    backdrop.setVehicle(controller.getPreviewVehicle().id, controller.getPreview().owned);

    const update = (dt: number, elapsed: number, _state: GameState): void => {
      controller.update(dt, elapsed);
      const previewVehicle = controller.getPreviewVehicle();
      cameraController.setVehicle(previewVehicle);
      backdrop.setVehicle(previewVehicle.id, controller.getPreview().owned);
      backdrop.update(dt);
      cameraController.update(dt, elapsed);
    };

    const dispose = (): void => {
      controller.dispose();
      backdrop.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
        }

        if (object instanceof THREE.Light && object.shadow) {
          object.shadow.dispose();
        }
      });
      scene.clear();
    };

    return {
      scene,
      cameraController,
      update,
      dispose,
      moveSelection: (direction) => controller.moveSelection(direction),
      confirmSelection: () => controller.confirmSelection(),
      cancelPreview: () => controller.cancelPreview(),
      isSwitching: () => controller.getSwitchState() !== "idle",
      getPreviewVehicle: () => controller.getPreviewVehicle(),
      getPreview: () => controller.getPreview(),
      refreshOwnership: (nextUnlockedVehicleIds, nextTotalCoins) =>
        controller.refreshOwnership(nextUnlockedVehicleIds, nextTotalCoins),
      getConfirmedVehicle: () => controller.getConfirmedVehicle()
    };
  }
}

function buildLighting(scene: THREE.Scene, quality: GameConfig["quality"]): void {
  // Dark, moody room with a single hero spotlight pooling on the turntable.
  const ambient = new THREE.HemisphereLight(0xb6a488, 0x120d14, 0.42);

  // soft directional fill so the shadow side of the car isn't pure black
  const fill = new THREE.DirectionalLight(0xffe6c0, 0.55);
  fill.position.set(3.0, 3.4, 3.6);

  // HERO spotlight from above-front, aimed down at the platform
  const spot = new THREE.SpotLight(0xfff2d4, 16, 16, Math.PI / 7.5, 0.45, 1.0);
  spot.position.set(0.5, 5.4, 1.8);
  spot.target.position.set(0, 0.2, -0.15);
  spot.castShadow = quality !== "low";
  if (spot.castShadow) {
    const size = quality === "high" ? 2048 : 1024;
    spot.shadow.mapSize.set(size, size);
    spot.shadow.bias = -0.0004;
    spot.shadow.camera.near = 1.5;
    spot.shadow.camera.far = 12;
  }

  // warm gold lift rising from the turntable ring + cool rim for separation
  const goldUp = new THREE.PointLight(0xffcf8a, 0.7, 4.5);
  goldUp.position.set(0, 0.45, 0.5);
  const rim = new THREE.PointLight(0x6f7fb0, 0.5, 7);
  rim.position.set(-2.4, 2.2, -1.8);
  // soft wash so the backdrop kanji stays readable in the dark room
  const wallWash = new THREE.PointLight(0xffe2b0, 0.85, 6);
  wallWash.position.set(0, 2.6, -1.5);

  scene.add(ambient, fill, spot, spot.target, goldUp, rim, wallWash);
}

function buildGarageShell(root: THREE.Group, materials: MaterialFactory): void {
  // Deep room (receding toward the backdrop at z=-3) seen from a ¾ angle.
  const floor = mesh(new THREE.BoxGeometry(8.4, 0.14, 9), materials.warmWood, [0, -0.08, -0.6]);
  const floorRing = mesh(new THREE.CylinderGeometry(1.92, 2.0, 0.04, 40), materials.stone, [0, 0.0, 0]);
  const leftWall = mesh(new THREE.BoxGeometry(0.18, 2.8, 9), materials.darkWood, [-4.1, 1.3, -0.6]);
  const rightWall = mesh(new THREE.BoxGeometry(0.18, 2.8, 9), materials.darkWood, [4.1, 1.3, -0.6]);

  const turntable = mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.12, 40), materials.stone, [0, 0.02, 0]);
  const turntableTrim = mesh(new THREE.TorusGeometry(1.55, 0.04, 8, 40), materials.gold, [0, 0.11, 0]);
  turntableTrim.rotation.x = Math.PI * 0.5;

  // Paper lanterns receding along the left wall — pure depth cue for the ¾ view.
  const lanternRail = new THREE.Group();
  lanternRail.name = "garage_lantern_rail";
  const lanternZ = [1.4, -0.4, -2.2];
  for (const z of lanternZ) {
    const cord = mesh(new THREE.BoxGeometry(0.03, 0.26, 0.03), materials.darkWood, [-3.9, 2.32, z]);
    const lantern = mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.3, 10), materials.lanternPaper, [-3.9, 2.08, z]);
    lanternRail.add(cord, lantern);
  }

  // A single lit workshop prop on the left for depth (asymmetric, like the refs).
  const shelf = createToolShelf(materials);
  shelf.position.set(-3.15, 0, -0.4);

  root.add(floor, floorRing, leftWall, rightWall, turntable, turntableTrim, lanternRail, shelf);

  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}

function createToolShelf(materials: MaterialFactory): THREE.Group {
  const group = new THREE.Group();
  group.add(
    mesh(new THREE.BoxGeometry(0.95, 0.08, 0.28), materials.wood, [0, 0.56, 0]),
    mesh(new THREE.BoxGeometry(0.95, 0.08, 0.28), materials.wood, [0, 1.0, 0]),
    mesh(new THREE.BoxGeometry(0.08, 1.08, 0.2), materials.wood, [-0.5, 0.54, 0]),
    mesh(new THREE.BoxGeometry(0.08, 1.08, 0.2), materials.wood, [0.5, 0.54, 0]),
    mesh(new THREE.BoxGeometry(0.18, 0.2, 0.18), materials.gold, [-0.22, 0.72, 0.02]),
    mesh(new THREE.BoxGeometry(0.28, 0.16, 0.18), materials.torii, [0.2, 1.14, 0.02])
  );
  return group;
}

function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number]
): THREE.Mesh {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  return object;
}
