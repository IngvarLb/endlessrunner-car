import type * as THREE from "three";
import type { LaneIndex } from "../../app/GameConfig";
import type { Collidable, Collider } from "../../engine/physics/Collider";
import { LaneSystem } from "../world/LaneSystem";

export type ObstacleAction = "low" | "tall" | "barrier";

export type ObstacleDefinition = {
  id: string;
  mesh: THREE.Object3D;
  lane: LaneIndex;
  trackZ: number;
  action: ObstacleAction;
};

export class Obstacle implements Collidable {
  readonly id: string;
  readonly action: ObstacleAction;
  readonly mesh: THREE.Object3D;
  readonly initialTrackZ: number;
  lane: LaneIndex;
  trackZ: number;
  hit = false;

  constructor(
    definition: ObstacleDefinition,
    private readonly laneSystem: LaneSystem,
    private readonly getDistance: () => number
  ) {
    this.id = definition.id;
    this.mesh = definition.mesh;
    this.lane = definition.lane;
    this.trackZ = definition.trackZ;
    this.initialTrackZ = definition.trackZ;
    this.action = definition.action;
    this.syncMeshPosition();
  }

  getCollider(): Collider {
    const shape = this.getColliderShape();

    return {
      id: `${this.id}-collider`,
      ownerId: this.id,
      kind: "obstacle",
      center: {
        x: this.laneSystem.getLaneX(this.lane),
        y: shape.centerY,
        z: this.trackZ - this.getDistance()
      },
      size: {
        x: shape.width,
        y: shape.height,
        z: shape.depth
      },
      enabled: this.mesh.visible && !this.hit
    };
  }

  recycle(worldLength: number): void {
    this.trackZ += worldLength;
    this.hit = false;
    this.mesh.visible = true;
    this.syncMeshPosition();
  }

  reset(): void {
    this.trackZ = this.initialTrackZ;
    this.hit = false;
    this.mesh.visible = true;
    this.syncMeshPosition();
  }

  private syncMeshPosition(): void {
    this.mesh.position.set(this.laneSystem.getLaneX(this.lane), 0, this.trackZ);
  }

  private getColliderShape(): { centerY: number; width: number; height: number; depth: number } {
    switch (this.action) {
      case "low":
        return {
          centerY: 0.32,
          width: 1.62,
          height: 0.52,
          depth: 0.9
        };
      case "tall":
        return {
          centerY: 0.72,
          width: 1.45,
          height: 1.18,
          depth: 0.78
        };
      case "barrier":
        return {
          centerY: 0.62,
          width: 1.18,
          height: 1.08,
          depth: 0.92
        };
    }
  }
}
