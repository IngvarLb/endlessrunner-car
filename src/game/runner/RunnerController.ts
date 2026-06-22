import * as THREE from "three";
import type { Collidable, Collider } from "../../engine/physics/Collider";
import type { LaneIndex } from "../../app/GameConfig";
import type { VehicleBounds } from "../vehicles/VehicleCatalog";
import { LaneSystem } from "../world/LaneSystem";

export type RunnerMoveResult = {
  moved: boolean;
  mistake: boolean;
  lane: LaneIndex;
};

export type RunnerControllerOptions = {
  baseScale: number;
  boostDuration: number;
  boostSpeedMultiplier: number;
  forwardRotationY: number;
  bounds: VehicleBounds;
};

const defaultOptions: RunnerControllerOptions = {
  baseScale: 0.92,
  boostDuration: 1.35,
  boostSpeedMultiplier: 1.65,
  forwardRotationY: Math.PI,
  bounds: { x: 1.15, y: 0.72, z: 1.96 }
};

export class RunnerController implements Collidable {
  readonly id = "runner";

  private lane: LaneIndex = 0;
  private targetX = 0;
  private stumbleLean = 0;
  private recoilTimer = 0;
  private recoilDuration = 0;
  private recoilZ = 0;
  private recoilPitch = 0;
  private boostTimer = 0;
  private readonly options: RunnerControllerOptions;

  constructor(
    private readonly object: THREE.Object3D,
    private readonly laneSystem: LaneSystem,
    options: Partial<RunnerControllerOptions> = {}
  ) {
    this.options = { ...defaultOptions, ...options };
    this.reset();
  }

  reset(): void {
    this.lane = 0;
    this.targetX = this.laneSystem.getLaneX(this.lane);
    this.stumbleLean = 0;
    this.recoilTimer = 0;
    this.recoilDuration = 0;
    this.recoilZ = 0;
    this.recoilPitch = 0;
    this.boostTimer = 0;
    this.object.position.set(this.targetX, 0, 0);
    this.object.rotation.set(0, this.options.forwardRotationY, 0);
    this.object.scale.setScalar(this.options.baseScale);
  }

  update(dt: number, elapsed: number, isRunning: boolean): void {
    if (this.boostTimer > 0) {
      this.boostTimer = Math.max(0, this.boostTimer - dt);
    }

    if (this.recoilTimer > 0) {
      this.recoilTimer = Math.max(0, this.recoilTimer - dt);
      const progress = this.recoilDuration > 0 ? this.recoilTimer / this.recoilDuration : 0;
      this.recoilZ = -1.05 * progress;
      this.recoilPitch = -0.42 * progress;
    } else {
      this.recoilZ = THREE.MathUtils.lerp(this.recoilZ, 0, Math.min(1, dt * 6));
      this.recoilPitch = THREE.MathUtils.lerp(this.recoilPitch, 0, Math.min(1, dt * 6));
    }

    this.stumbleLean = THREE.MathUtils.lerp(this.stumbleLean, 0, Math.min(1, dt * 7));
    this.object.position.x = THREE.MathUtils.lerp(this.object.position.x, this.targetX, Math.min(1, dt * 12));
    this.object.position.y = isRunning ? Math.abs(Math.sin(elapsed * 12)) * 0.025 : 0;
    this.object.position.z = this.recoilZ;
    const targetScale = this.options.baseScale + (this.isBoosting() ? 0.04 : 0);
    this.object.scale.x = THREE.MathUtils.lerp(this.object.scale.x, targetScale, Math.min(1, dt * 12));
    this.object.scale.y = THREE.MathUtils.lerp(this.object.scale.y, targetScale, Math.min(1, dt * 12));
    this.object.scale.z = THREE.MathUtils.lerp(this.object.scale.z, targetScale, Math.min(1, dt * 12));
    this.object.rotation.z = THREE.MathUtils.lerp(
      this.object.rotation.z,
      (this.targetX - this.object.position.x) * -0.08 + this.stumbleLean,
      Math.min(1, dt * 8)
    );
    this.object.rotation.x = this.recoilPitch;
  }

  moveLeft(): RunnerMoveResult {
    return this.moveLane(-1);
  }

  moveRight(): RunnerMoveResult {
    return this.moveLane(1);
  }

  activateBoost(): boolean {
    if (this.boostTimer > 0 || this.recoilTimer > 0) {
      return false;
    }

    this.boostTimer = this.options.boostDuration;
    return true;
  }

  /** Drive boost for an ability (custom duration); while boosting, traffic is rammed through. */
  applyAbilityBoost(durationSec: number): void {
    if (!Number.isFinite(durationSec) || durationSec <= 0) {
      return;
    }
    this.boostTimer = Math.max(this.boostTimer, durationSec);
  }

  clearBoost(): void {
    this.boostTimer = 0;
  }

  applyStumble(direction: -1 | 1): void {
    this.stumbleLean = direction * -0.18;
  }

  applyStrongHit(): void {
    this.boostTimer = 0;
    this.recoilDuration = 0.58;
    this.recoilTimer = this.recoilDuration;
    this.recoilZ = -1.05;
    this.recoilPitch = -0.42;
  }

  getLane(): LaneIndex {
    return this.lane;
  }

  getPosition(): THREE.Vector3 {
    return this.object.position.clone();
  }

  getBounds(): Collider {
    return {
      id: "runner-collider",
      ownerId: "runner",
      kind: "runner",
      center: {
        x: this.object.position.x,
        y: 0.46,
        z: this.object.position.z
      },
      size: {
        x: this.options.bounds.x,
        y: this.options.bounds.y,
        z: this.options.bounds.z
      },
      enabled: true
    };
  }

  getCollider(): Collider {
    return this.getBounds();
  }

  isBoosting(): boolean {
    return this.boostTimer > 0;
  }

  getSpeedMultiplier(): number {
    return this.isBoosting() ? this.options.boostSpeedMultiplier : 1;
  }

  private moveLane(direction: -1 | 1): RunnerMoveResult {
    if (!this.laneSystem.canMove(this.lane, direction)) {
      this.applyStumble(direction);
      return {
        moved: false,
        mistake: true,
        lane: this.lane
      };
    }

    this.lane = this.laneSystem.move(this.lane, direction);
    this.targetX = this.laneSystem.getLaneX(this.lane);

    return {
      moved: true,
      mistake: false,
      lane: this.lane
    };
  }
}
