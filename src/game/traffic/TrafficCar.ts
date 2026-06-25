import type * as THREE from "three";
import type { LaneIndex } from "../../app/GameConfig";
import type { Collidable, Collider } from "../../engine/physics/Collider";
import { LaneSystem } from "../world/LaneSystem";
import type { TrafficCarKind, TrafficColliderShape } from "./TrafficTypes";

// Lateral lane-change tuning (average sideways speed in m/s over the merge).
const POLITE_MERGE_SPEED = 1.5; // casual highway lane change — slow + angled (overtake, 藍 Freie Bahn)
const URGENT_MERGE_SPEED = 10; // emergency give-way (藍 Lichthupe): a quick veer out of the way
const MAX_YAW = 0.42; // rad (~24°): cap the body angle so it never looks like driving sideways
const BLINK_INTERVAL = 0.22; // seconds per on/off phase of the turn signal

// Longitudinal tuning: cars cruise at varied speeds and ease toward a target.
const ACCEL = 6; // m/s² when speeding up to cruise / overtaking
const BRAKE = 18; // m/s² when slowing to follow / avoid a rear-end
const LANE_COOLDOWN = 1.7; // seconds between a car's own lane changes (no oscillation)
// Per-car cruise speed = base × this range, keyed off the id so it's stable across recycles.
const CRUISE_MIN_FACTOR = 0.9;
const CRUISE_MAX_FACTOR = 1.2;

function hashTo01(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 100000) / 100000;
}

export type TrafficCarDefinition = {
  id: string;
  kind: TrafficCarKind;
  mesh: THREE.Object3D;
  lane: LaneIndex;
  trackZ: number;
  speed: number;
  collider: TrafficColliderShape;
  patternId: string;
};

export class TrafficCar implements Collidable {
  readonly id: string;
  readonly kind: TrafficCarKind;
  readonly mesh: THREE.Object3D;
  readonly initialTrackZ: number;
  /** Preferred free-flow speed; the live `speed` eases toward this (or slower when following). */
  readonly cruiseSpeed: number;
  readonly colliderShape: TrafficColliderShape;
  readonly patternId: string;
  readonly initialLane: LaneIndex;
  lane: LaneIndex;
  trackZ: number;
  speed: number;
  hit = false;

  // Lane-change animation: glide visualX from fromX to toX with a smoothstep so the
  // car merges gradually and at an angle, like a real car — not a sideways snap.
  private visualX = 0;
  private fromX = 0;
  private toX = 0;
  private mergeElapsed = 0;
  private mergeDuration = 0; // 0 => settled in lane (no merge in progress)
  private mergeDir = 0; // sign of lateral travel: +1 toward +x, -1 toward -x
  private mergeSpeed = POLITE_MERGE_SPEED;
  // 藍 Lichthupe give-way: the car deliberately yields, so it can't fatally hit the
  // player while veering off (cleared once the merge finishes).
  private yielding = false;
  private blinkTime = 0;
  private laneCooldown = 0;
  private brakeTimer = 0; // while > 0 the scheduler wants this car to slow (wall relief)
  private readonly blinkerPosX?: THREE.Object3D;
  private readonly blinkerNegX?: THREE.Object3D;

  constructor(
    definition: TrafficCarDefinition,
    private readonly laneSystem: LaneSystem,
    private readonly getDistance: () => number
  ) {
    this.id = definition.id;
    this.kind = definition.kind;
    this.mesh = definition.mesh;
    this.lane = definition.lane;
    this.initialLane = definition.lane;
    this.trackZ = definition.trackZ;
    this.initialTrackZ = definition.trackZ;
    this.cruiseSpeed =
      definition.speed * (CRUISE_MIN_FACTOR + (CRUISE_MAX_FACTOR - CRUISE_MIN_FACTOR) * hashTo01(definition.id));
    this.speed = this.cruiseSpeed;
    this.colliderShape = definition.collider;
    this.patternId = definition.patternId;
    this.blinkerPosX = this.mesh.getObjectByName("blinker_px") ?? undefined;
    this.blinkerNegX = this.mesh.getObjectByName("blinker_nx") ?? undefined;
    this.syncMeshPosition();
  }

  update(dt: number, isRunning: boolean): void {
    if (isRunning) {
      this.trackZ += this.speed * dt;
      if (this.laneCooldown > 0) {
        this.laneCooldown -= dt;
      }
      if (this.brakeTimer > 0) {
        this.brakeTimer -= dt;
      }
    }

    // A new target lane (set via mergeToLane/yieldToLane) kicks off an angled merge
    // from wherever the car currently sits.
    const targetX = this.laneSystem.getLaneX(this.lane);
    if (targetX !== this.toX) {
      this.fromX = this.visualX;
      this.toX = targetX;
      this.mergeElapsed = 0;
      this.blinkTime = 0;
      const distance = Math.abs(this.toX - this.fromX);
      this.mergeDuration = this.mergeSpeed > 0 ? distance / this.mergeSpeed : 0;
      this.mergeDir = Math.sign(this.toX - this.fromX);
    }

    let yaw = 0;
    if (this.mergeDuration > 0 && this.mergeElapsed < this.mergeDuration) {
      if (isRunning) {
        this.mergeElapsed += dt;
      }
      const p = Math.min(1, this.mergeElapsed / this.mergeDuration);
      const smooth = p * p * (3 - 2 * p); // smoothstep: eases in and out of the lane change
      this.visualX = this.fromX + (this.toX - this.fromX) * smooth;
      const slope = 6 * p * (1 - p); // smoothstep derivative (0 → 1.5 → 0): lateral speed shape
      const lateralVel = ((this.toX - this.fromX) * slope) / this.mergeDuration;
      // Point the nose toward where it's heading, capped so it stays believable.
      yaw = Math.max(-MAX_YAW, Math.min(MAX_YAW, Math.atan2(lateralVel, Math.max(0.5, this.speed))));
      this.updateBlinkers(dt, isRunning);
    } else {
      this.visualX = this.toX;
      this.mergeDuration = 0;
      this.yielding = false;
      this.setBlinkers(false, false);
    }

    this.mesh.position.set(this.visualX, 0, this.trackZ);
    this.mesh.rotation.y = yaw;
  }

  /** Ease the live speed toward `target` (separate accel/brake rates), respecting any brake request. */
  driveToward(target: number, dt: number): void {
    const goal = this.brakeTimer > 0 ? Math.min(target, this.cruiseSpeed * 0.45) : target;
    const delta = goal - this.speed;
    const step = delta >= 0 ? Math.min(delta, ACCEL * dt) : Math.max(delta, -BRAKE * dt);
    this.speed = Math.max(0, this.speed + step);
  }

  /** Ask the scheduler-driven car to ease off for `seconds` (used to open a lane for the player). */
  requestBrake(seconds: number): void {
    this.brakeTimer = Math.max(this.brakeTimer, seconds);
  }

  getCollider(): Collider {
    return {
      id: `${this.id}-collider`,
      ownerId: this.id,
      kind: "obstacle",
      center: {
        // Follow the visual x so a slow merge has no phantom gap (no driving through
        // a car that looks like it's still in the lane).
        x: this.visualX,
        y: this.colliderShape.centerY,
        z: this.trackZ - this.getDistance()
      },
      size: {
        x: this.colliderShape.width,
        y: this.colliderShape.height,
        z: this.colliderShape.depth
      },
      enabled: this.mesh.visible && !this.hit
    };
  }

  /** Casual lane change toward `lane`: slow, angled, signalled (overtaking, 藍 Freie Bahn, restore). */
  mergeToLane(lane: LaneIndex): void {
    if (this.hit || this.lane === lane) {
      return;
    }
    this.lane = lane;
    this.mergeSpeed = POLITE_MERGE_SPEED;
    this.laneCooldown = LANE_COOLDOWN;
  }

  /** Emergency give-way toward `lane` (藍 Lichthupe): a quick veer that yields to the player. */
  yieldToLane(lane: LaneIndex): void {
    if (this.hit || this.lane === lane) {
      return;
    }
    this.lane = lane;
    this.mergeSpeed = URGENT_MERGE_SPEED;
    this.yielding = true;
    this.laneCooldown = LANE_COOLDOWN;
  }

  /** True while the car is actively giving way (so it shouldn't fatally hit the player). */
  isYielding(): boolean {
    return this.yielding;
  }

  /** True while a lane change is animating (don't start another). */
  isMerging(): boolean {
    return this.mergeDuration > 0;
  }

  /** Ready to start a new lane change (off cooldown and not mid-merge). */
  canChangeLane(): boolean {
    return !this.hit && this.laneCooldown <= 0 && this.mergeDuration === 0;
  }

  recycle(worldLength: number): void {
    this.trackZ += worldLength;
    this.lane = this.initialLane; // restore normal lane spread (e.g. after 藍 moved it aside)
    this.hit = false;
    this.speed = this.cruiseSpeed;
    this.mesh.visible = true;
    this.syncMeshPosition();
  }

  reset(): void {
    this.trackZ = this.initialTrackZ;
    this.lane = this.initialLane;
    this.hit = false;
    this.speed = this.cruiseSpeed;
    this.mesh.visible = true;
    this.syncMeshPosition();
  }

  private updateBlinkers(dt: number, isRunning: boolean): void {
    if (isRunning) {
      this.blinkTime += dt;
    }
    const on = Math.floor(this.blinkTime / BLINK_INTERVAL) % 2 === 0;
    this.setBlinkers(this.mergeDir > 0 && on, this.mergeDir < 0 && on);
  }

  private setBlinkers(posX: boolean, negX: boolean): void {
    if (this.blinkerPosX) {
      this.blinkerPosX.visible = posX;
    }
    if (this.blinkerNegX) {
      this.blinkerNegX.visible = negX;
    }
  }

  private syncMeshPosition(): void {
    const x = this.laneSystem.getLaneX(this.lane);
    this.visualX = x;
    this.fromX = x;
    this.toX = x;
    this.mergeElapsed = 0;
    this.mergeDuration = 0;
    this.mergeDir = 0;
    this.yielding = false;
    this.blinkTime = 0;
    this.laneCooldown = 0;
    this.brakeTimer = 0;
    this.setBlinkers(false, false);
    this.mesh.position.set(x, 0, this.trackZ);
    this.mesh.rotation.y = 0;
  }
}
