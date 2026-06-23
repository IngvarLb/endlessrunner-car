import type * as THREE from "three";
import type { LaneIndex } from "../../app/GameConfig";
import type { Collidable, Collider } from "../../engine/physics/Collider";
import { LaneSystem } from "../world/LaneSystem";
import type { TrafficCarKind, TrafficColliderShape } from "./TrafficTypes";

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
  readonly speed: number;
  readonly colliderShape: TrafficColliderShape;
  readonly patternId: string;
  readonly initialLane: LaneIndex;
  lane: LaneIndex;
  trackZ: number;
  hit = false;
  private visualX = 0;

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
    this.speed = definition.speed;
    this.colliderShape = definition.collider;
    this.patternId = definition.patternId;
    this.syncMeshPosition();
  }

  update(dt: number, isRunning: boolean): void {
    if (isRunning) {
      this.trackZ += this.speed * dt;
    }
    // Ease the mesh toward the lane x so swerves (e.g. 藍 Freie Bahn) glide instead
    // of snapping. The collider already tracks the target lane, so safety is instant.
    const targetX = this.laneSystem.getLaneX(this.lane);
    this.visualX += (targetX - this.visualX) * Math.min(1, dt * 7);
    this.mesh.position.set(this.visualX, 0, this.trackZ);
  }

  getCollider(): Collider {
    return {
      id: `${this.id}-collider`,
      ownerId: this.id,
      kind: "obstacle",
      center: {
        x: this.laneSystem.getLaneX(this.lane),
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

  recycle(worldLength: number): void {
    this.trackZ += worldLength;
    this.lane = this.initialLane; // restore normal lane spread (e.g. after 藍 swerved it aside)
    this.hit = false;
    this.mesh.visible = true;
    this.syncMeshPosition();
  }

  reset(): void {
    this.trackZ = this.initialTrackZ;
    this.lane = this.initialLane;
    this.hit = false;
    this.mesh.visible = true;
    this.syncMeshPosition();
  }

  private syncMeshPosition(): void {
    this.visualX = this.laneSystem.getLaneX(this.lane);
    this.mesh.position.set(this.laneSystem.getLaneX(this.lane), 0, this.trackZ);
  }
}
