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

// How long after a lane change a collision still counts as a "side" contact (not a rear-end).
const LANE_CHANGE_GRACE = 0.4;

// Speed-penalty model — every slip briefly shaves speed, which then eases back to full.
// This makes long, clean stretches genuinely feel faster than choppy ones and gives each
// mistake a tangible cost (the groundwork for losing ground to the rival racers later).
const SPEED_RECOVER_K = 2.8; // exponential ease-back rate toward full speed
const LANE_CHANGE_DIP = 0.085; // a lane switch shaves a little (weaving compounds it)
const LANE_CHANGE_FLOOR = 0.68; // …but no single weave can drop you below this
const MISTAKE_DIP = 0.5; // a mistake / ability-saved crash shaves a big chunk
const MISTAKE_FLOOR = 0.5;

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
  private laneChangeTimer = 0; // >0 briefly after a lane change — a hit then counts as a side contact
  private laneBeforeChange: LaneIndex = 0; // the lane the player came from (for bounce-back on a side ram)
  private titanActive = false;
  private invincible = false;
  private speedPenalty = 1; // 1 = full speed; dips on a lane change / mistake, eases back to 1
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
    this.titanActive = false;
    this.invincible = false;
    this.speedPenalty = 1;
    this.object.position.set(this.targetX, 0, 0);
    this.object.rotation.set(0, this.options.forwardRotationY, 0);
    this.object.scale.setScalar(this.options.baseScale);
  }

  update(dt: number, elapsed: number, isRunning: boolean): void {
    if (this.boostTimer > 0) {
      this.boostTimer = Math.max(0, this.boostTimer - dt);
    }
    if (this.laneChangeTimer > 0) {
      this.laneChangeTimer = Math.max(0, this.laneChangeTimer - dt);
    }
    if (this.speedPenalty < 1) {
      this.speedPenalty += (1 - this.speedPenalty) * Math.min(1, dt * SPEED_RECOVER_K);
      if (this.speedPenalty > 0.999) {
        this.speedPenalty = 1;
      }
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
    const liveScale = this.options.baseScale + (this.isBoosting() ? 0.04 : 0);
    const targetScale = this.titanActive ? liveScale * 2.6 : liveScale;
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
        // 狐 Titan spans all three lanes — wide collider rams + collects everywhere.
        x: this.titanActive ? 5.6 : this.options.bounds.x,
        y: this.options.bounds.y,
        z: this.titanActive ? this.options.bounds.z * 1.3 : this.options.bounds.z
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

  /** 狐 Titan: grow over 3 lanes + become indestructible (collisions ram/collect, not fail). */
  setTitan(on: boolean): void {
    this.titanActive = on;
    this.invincible = on;
  }

  isInvincible(): boolean {
    return this.invincible;
  }

  getSpeedMultiplier(): number {
    const boost = this.isBoosting() ? this.options.boostSpeedMultiplier : 1;
    return boost * this.speedPenalty;
  }

  /** Current speed penalty in (0,1] — 1 = full speed, lower for a moment after a slip. */
  getSpeedPenalty(): number {
    return this.speedPenalty;
  }

  private dipSpeed(amount: number, floor: number): void {
    this.speedPenalty = Math.max(floor, this.speedPenalty - amount);
  }

  /** A lane change briefly shaves a little speed (weaving compounds it, down to a floor). */
  dipForLaneChange(): void {
    this.dipSpeed(LANE_CHANGE_DIP, LANE_CHANGE_FLOOR);
  }

  /** A mistake or ability-saved crash shaves a big chunk of speed for a moment. */
  dipForMistake(): void {
    this.dipSpeed(MISTAKE_DIP, MISTAKE_FLOOR);
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

    this.laneBeforeChange = this.lane;
    this.lane = this.laneSystem.move(this.lane, direction);
    this.targetX = this.laneSystem.getLaneX(this.lane);
    this.laneChangeTimer = LANE_CHANGE_GRACE;
    this.dipForLaneChange(); // a switch costs a little speed — clean straights feel fastest

    return {
      moved: true,
      mistake: false,
      lane: this.lane
    };
  }

  /** True for a brief window after a lane change — used to tag a hit as a side contact. */
  isLaneChanging(): boolean {
    return this.laneChangeTimer > 0;
  }

  /**
   * Side-rammed a car mid-lane-change: recoil back to the lane we came from instead of
   * sliding into the car (no glitching into the wreck).
   */
  bounceBack(): void {
    const from = this.lane;
    this.lane = this.laneBeforeChange;
    this.targetX = this.laneSystem.getLaneX(this.lane);
    this.laneChangeTimer = 0;
    const direction = Math.sign(this.lane - from);
    if (direction !== 0) {
      this.applyStumble(direction as -1 | 1);
    }
  }
}
