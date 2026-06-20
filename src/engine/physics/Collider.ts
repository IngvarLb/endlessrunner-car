import type { Vec3Like } from "../../app/GameConfig";

export type ColliderKind = "runner" | "obstacle" | "collectible" | "powerup" | "fire";

export type Collider = {
  id: string;
  ownerId: string;
  kind: ColliderKind;
  center: Vec3Like;
  size: Vec3Like;
  enabled: boolean;
};

export type CollisionEvent = {
  a: Collider;
  b: Collider;
  normal?: Vec3Like;
  penetration?: number;
};

export type Collidable = {
  id: string;
  getCollider(): Collider;
};

export const Bounds = {
  intersects(a: Collider, b: Collider): boolean {
    if (!a.enabled || !b.enabled) {
      return false;
    }

    return (
      Math.abs(a.center.x - b.center.x) <= (a.size.x + b.size.x) * 0.5 &&
      Math.abs(a.center.y - b.center.y) <= (a.size.y + b.size.y) * 0.5 &&
      Math.abs(a.center.z - b.center.z) <= (a.size.z + b.size.z) * 0.5
    );
  }
};
