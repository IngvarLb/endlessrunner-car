import type * as THREE from "three";
import type { LaneIndex } from "../../app/GameConfig";
import type { Collidable, Collider } from "../../engine/physics/Collider";
import { LaneSystem } from "../world/LaneSystem";

export type CollectibleDefinition = {
  id: string;
  mesh: THREE.Object3D;
  lane: LaneIndex;
  trackZ: number;
};

export class Collectible implements Collidable {
  readonly id: string;
  readonly mesh: THREE.Object3D;
  readonly initialTrackZ: number;
  lane: LaneIndex;
  trackZ: number;
  collected = false;

  constructor(
    definition: CollectibleDefinition,
    private readonly laneSystem: LaneSystem,
    private readonly getDistance: () => number
  ) {
    this.id = definition.id;
    this.mesh = definition.mesh;
    this.lane = definition.lane;
    this.trackZ = definition.trackZ;
    this.initialTrackZ = definition.trackZ;
    this.syncMeshPosition();
  }

  updateVisual(dt: number, elapsed: number): void {
    this.mesh.rotation.z += dt * 4.8;
    this.mesh.position.y = 0.92 + Math.sin(elapsed * 4 + this.trackZ) * 0.08;
  }

  collect(): void {
    this.collected = true;
    this.mesh.visible = false;
  }

  recycle(worldLength: number, lane: LaneIndex, show = true): void {
    this.trackZ += worldLength;
    this.lane = lane;
    this.collected = !show; // a gap coin parks "collected" → invisible + no collider
    this.mesh.visible = show;
    this.syncMeshPosition();
  }

  /** Move to an absolute lane + trackZ; `show=false` parks it in a coin gap (hidden). */
  placeAt(lane: LaneIndex, trackZ: number, show = true): void {
    this.lane = lane;
    this.trackZ = trackZ;
    this.collected = !show;
    this.mesh.visible = show;
    this.syncMeshPosition();
  }

  reset(): void {
    this.trackZ = this.initialTrackZ;
    this.collected = false;
    this.mesh.visible = true;
    this.syncMeshPosition();
  }

  getCollider(): Collider {
    return {
      id: `${this.id}-collider`,
      ownerId: this.id,
      kind: "collectible",
      center: {
        x: this.laneSystem.getLaneX(this.lane),
        y: this.mesh.position.y,
        z: this.trackZ - this.getDistance()
      },
      size: {
        x: 0.82,
        y: 0.82,
        z: 0.82
      },
      enabled: this.mesh.visible && !this.collected
    };
  }

  private syncMeshPosition(): void {
    this.mesh.position.x = this.laneSystem.getLaneX(this.lane);
    this.mesh.position.z = this.trackZ;
  }
}
