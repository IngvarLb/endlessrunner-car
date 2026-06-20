import * as THREE from "three";
import { ModelFactory } from "../../engine/assets/ModelFactory";
import { disposeObject3D } from "../../engine/rendering/disposeObject3D";
import {
  canAffordVehicle,
  getMissingCoins,
  getVehiclePrice,
  isVehicleOwned,
  type VehicleDefinition
} from "../vehicles/VehicleCatalog";
import type { GarageSelectionResult, GarageSwitchState, GarageVehiclePreview } from "./GarageTypes";

const switchDuration = 0.46;
const slideDistance = 3.25;

export class GarageShowroomController {
  private previewIndex = 0;
  private confirmedIndex = 0;
  private switchState: GarageSwitchState = "idle";
  private switchTimer = 0;
  private switchDirection: -1 | 1 = 1;
  private readonly vehicleObjects: THREE.Object3D[] = [];
  private currentVehicle?: THREE.Object3D;
  private incomingVehicle?: THREE.Object3D;
  private outgoingVehicle?: THREE.Object3D;

  constructor(
    private readonly models: ModelFactory,
    private readonly parent: THREE.Object3D,
    private readonly vehicles: VehicleDefinition[],
    initialVehicleId: string,
    private unlockedVehicleIds: string[],
    private totalCoins: number
  ) {
    const initialIndex = Math.max(
      0,
      this.vehicles.findIndex((vehicle) => vehicle.id === initialVehicleId)
    );
    this.previewIndex = initialIndex;
    this.confirmedIndex = initialIndex;

    for (const vehicle of this.vehicles) {
      const object = this.createVehicle(vehicle, 0);
      object.visible = false;
      this.vehicleObjects.push(object);
    }

    this.activateVehicle(initialIndex, 0);
  }

  update(dt: number, elapsed: number): void {
    switch (this.switchState) {
      case "idle":
        this.updateIdle(dt, elapsed);
        break;
      case "switchingOut":
        this.updateSwitching(dt, elapsed);
        break;
      case "switchingIn":
        this.updateSwitching(dt, elapsed);
        break;
    }
  }

  moveSelection(direction: -1 | 1): void {
    if (this.switchState !== "idle" || this.vehicles.length < 2) {
      return;
    }

    this.switchDirection = direction;
    this.switchTimer = 0;
    const nextIndex = wrapIndex(this.previewIndex + direction, this.vehicles.length);
    this.previewIndex = nextIndex;
    this.outgoingVehicle = this.currentVehicle;
    this.incomingVehicle = this.vehicleObjects[nextIndex];
    this.prepareIncomingVehicle(nextIndex, direction * slideDistance);
    this.switchState = "switchingOut";
  }

  confirmSelection(): GarageSelectionResult {
    if (this.switchState !== "idle") {
      return { ok: false, reason: "switching" };
    }

    const preview = this.getPreview();
    if (!preview.owned) {
      return { ok: false, reason: "locked", vehicleId: preview.vehicle.id };
    }

    this.confirmedIndex = this.previewIndex;
    return {
      ok: true,
      vehicleId: this.getConfirmedVehicle().id
    };
  }

  cancelPreview(): void {
    this.previewIndex = this.confirmedIndex;
    this.switchState = "idle";
    this.switchTimer = 0;
    this.incomingVehicle = undefined;
    this.outgoingVehicle = undefined;
    this.activateVehicle(this.confirmedIndex, 0);
  }

  getPreviewVehicle(): VehicleDefinition {
    return this.vehicles[this.previewIndex];
  }

  getPreview(): GarageVehiclePreview {
    const vehicle = this.getPreviewVehicle();

    return {
      vehicle,
      owned: isVehicleOwned(vehicle, this.unlockedVehicleIds),
      price: getVehiclePrice(vehicle),
      canAfford: canAffordVehicle(vehicle, this.totalCoins),
      missingCoins: getMissingCoins(vehicle, this.totalCoins),
      totalCoins: Math.max(0, Math.floor(this.totalCoins))
    };
  }

  refreshOwnership(unlockedVehicleIds: string[], totalCoins: number): void {
    this.unlockedVehicleIds = [...unlockedVehicleIds];
    this.totalCoins = Number.isFinite(totalCoins) ? Math.max(0, Math.floor(totalCoins)) : 0;
  }

  getConfirmedVehicle(): VehicleDefinition {
    return this.vehicles[this.confirmedIndex];
  }

  getSwitchState(): GarageSwitchState {
    return this.switchState;
  }

  dispose(): void {
    for (const object of this.vehicleObjects) {
      disposeObject3D(object);
    }

    this.vehicleObjects.length = 0;
    this.currentVehicle = undefined;
  }

  private updateIdle(dt: number, elapsed: number): void {
    if (!this.currentVehicle) {
      return;
    }

    this.currentVehicle.position.x = THREE.MathUtils.lerp(this.currentVehicle.position.x, 0, 0.16);
    this.currentVehicle.position.y = 0.08 + Math.sin(elapsed * 2.2) * 0.015;
    this.currentVehicle.rotation.y += 0.22 * dt;
  }

  private updateSwitching(dt: number, elapsed: number): void {
    if (!this.outgoingVehicle || !this.incomingVehicle) {
      return;
    }

    this.switchTimer += dt;
    const progress = Math.min(1, this.switchTimer / switchDuration);
    const eased = easeInOut(progress);
    const y = 0.08 + Math.sin(elapsed * 2.2) * 0.008;
    this.outgoingVehicle.position.x = -this.switchDirection * slideDistance * eased;
    this.outgoingVehicle.position.y = y;
    this.outgoingVehicle.rotation.y += this.switchDirection * dt * 1.2;
    this.incomingVehicle.position.x = this.switchDirection * slideDistance * (1 - eased);
    this.incomingVehicle.position.y = y;
    this.incomingVehicle.rotation.y += this.switchDirection * dt * 1.2;

    if (progress >= 1) {
      this.outgoingVehicle.visible = false;
      this.incomingVehicle.position.x = 0;
      this.currentVehicle = this.incomingVehicle;
      this.incomingVehicle = undefined;
      this.outgoingVehicle = undefined;
      this.switchTimer = 0;
      this.switchState = "idle";
    }
  }

  private activateVehicle(index: number, x: number): void {
    for (const object of this.vehicleObjects) {
      object.visible = false;
    }

    const object = this.prepareIncomingVehicle(index, x);
    this.currentVehicle = object;
  }

  private prepareIncomingVehicle(index: number, x: number): THREE.Object3D {
    const vehicle = this.vehicles[index];
    const object = this.vehicleObjects[index];
    object.visible = true;
    object.position.set(x, 0.08, 0);
    object.rotation.set(0, vehicle.run.forwardRotationY, 0);
    object.scale.setScalar(vehicle.showroom.scale);
    return object;
  }

  private createVehicle(vehicle: VehicleDefinition, x: number): THREE.Object3D {
    const object = this.models.createVehicle(vehicle.modelKey);
    object.name = `garage_preview_${vehicle.id}`;
    object.position.set(x, 0.08, 0);
    object.rotation.set(0, vehicle.run.forwardRotationY, 0);
    object.scale.setScalar(vehicle.showroom.scale);
    this.parent.add(object);
    return object;
  }
}

function wrapIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}

function easeInOut(value: number): number {
  return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
}
