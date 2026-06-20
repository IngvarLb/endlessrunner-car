import type { Collidable, CollisionEvent } from "./Collider";
import { Bounds } from "./Collider";

export class CollisionSystem {
  private readonly collidables = new Map<string, Collidable>();

  register(entity: Collidable): void {
    this.collidables.set(entity.id, entity);
  }

  unregister(entity: Collidable): void {
    this.collidables.delete(entity.id);
  }

  clear(): void {
    this.collidables.clear();
  }

  update(): CollisionEvent[] {
    const entities = [...this.collidables.values()];
    const collisions: CollisionEvent[] = [];

    for (let aIndex = 0; aIndex < entities.length; aIndex += 1) {
      for (let bIndex = aIndex + 1; bIndex < entities.length; bIndex += 1) {
        const collision = this.queryPair(entities[aIndex], entities[bIndex]);
        if (collision) {
          collisions.push(collision);
        }
      }
    }

    return collisions;
  }

  queryRunnerHits(runner: Collidable): CollisionEvent[] {
    const collisions: CollisionEvent[] = [];

    for (const entity of this.collidables.values()) {
      if (entity.id === runner.id) {
        continue;
      }

      const collision = this.queryPair(runner, entity);
      if (collision) {
        collisions.push(collision);
      }
    }

    return collisions;
  }

  queryPair(a: Collidable, b: Collidable): CollisionEvent | undefined {
    const aCollider = a.getCollider();
    const bCollider = b.getCollider();

    if (!Bounds.intersects(aCollider, bCollider)) {
      return undefined;
    }

    return {
      a: aCollider,
      b: bCollider
    };
  }
}
