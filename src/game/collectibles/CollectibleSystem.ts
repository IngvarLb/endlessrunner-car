import type { LaneIndex } from "../../app/GameConfig";
import { CollisionSystem } from "../../engine/physics/CollisionSystem";
import { RunnerController } from "../runner/RunnerController";
import { LaneSystem } from "../world/LaneSystem";
import { Collectible, type CollectibleDefinition } from "./Collectible";

export type CollectibleCollected = {
  collectible: Collectible;
  amount: number;
};

export class CollectibleSystem {
  private readonly collectibles: Collectible[] = [];
  /** When set, recycled coins are funnelled into this lane (e.g. 藍 Freie Bahn). */
  private laneBias?: LaneIndex;

  constructor(
    private readonly runner: RunnerController,
    private readonly laneSystem: LaneSystem,
    private readonly collisionSystem: CollisionSystem,
    private readonly getDistance: () => number,
    private readonly onCollected: (event: CollectibleCollected) => void
  ) {}

  add(definition: CollectibleDefinition): Collectible {
    const collectible = new Collectible(definition, this.laneSystem, this.getDistance);
    this.collectibles.push(collectible);
    return collectible;
  }

  update(dt: number, elapsed: number, isRunning: boolean, worldLength: number): void {
    for (const collectible of this.collectibles) {
      collectible.updateVisual(dt, elapsed);

      const relativeZ = collectible.trackZ - this.getDistance();
      if (!collectible.collected && isRunning && this.collisionSystem.queryPair(this.runner, collectible)) {
        collectible.collect();
        this.onCollected({ collectible, amount: 1 });
        continue;
      }

      if (relativeZ < -10) {
        const lane = this.getNextLane(collectible.trackZ + worldLength);
        collectible.recycle(worldLength, lane);
      }
    }
  }

  reset(): void {
    this.laneBias = undefined;
    for (const collectible of this.collectibles) {
      collectible.reset();
    }
  }

  setLaneBias(lane: LaneIndex | undefined): void {
    this.laneBias = lane;
  }

  /** Immediately move the coins ahead into `lane` (e.g. 藍 Freie Bahn coin row), no recycle wait. */
  pullToLane(lane: LaneIndex): void {
    const distance = this.getDistance();
    for (const collectible of this.collectibles) {
      if (!collectible.collected && collectible.trackZ - distance > 2) {
        collectible.placeAt(lane, collectible.trackZ);
      }
    }
  }

  /** Re-spread the coins ahead back to the normal lane pattern (e.g. when 藍 ends). */
  redistribute(): void {
    const distance = this.getDistance();
    for (const collectible of this.collectibles) {
      if (!collectible.collected && collectible.trackZ - distance > 2) {
        collectible.placeAt(this.getNextLane(collectible.trackZ), collectible.trackZ);
      }
    }
  }

  getActiveCount(): number {
    return this.collectibles.length;
  }

  private getNextLane(trackZ: number): LaneIndex {
    if (this.laneBias !== undefined) {
      return this.laneBias;
    }
    const lanes = this.laneSystem.lanes;
    return lanes[Math.abs(Math.floor(trackZ / 9)) % lanes.length];
  }
}
