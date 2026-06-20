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
    for (const collectible of this.collectibles) {
      collectible.reset();
    }
  }

  getActiveCount(): number {
    return this.collectibles.length;
  }

  private getNextLane(trackZ: number) {
    const lanes = this.laneSystem.lanes;
    return lanes[Math.abs(Math.floor(trackZ / 9)) % lanes.length];
  }
}
