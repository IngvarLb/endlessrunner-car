import { CollisionSystem } from "../../engine/physics/CollisionSystem";
import { RunnerController } from "../runner/RunnerController";
import { LaneSystem } from "../world/LaneSystem";
import { Obstacle, type ObstacleDefinition } from "./Obstacle";

export type ObstacleHit = {
  obstacle: Obstacle;
};

export type ObstacleDestroyed = {
  obstacle: Obstacle;
};

export class ObstacleSystem {
  private readonly obstacles: Obstacle[] = [];

  constructor(
    private readonly runner: RunnerController,
    private readonly laneSystem: LaneSystem,
    private readonly collisionSystem: CollisionSystem,
    private readonly getDistance: () => number,
    private readonly onHit: (hit: ObstacleHit) => void,
    private readonly onDestroyed?: (destroyed: ObstacleDestroyed) => void
  ) {}

  add(definition: ObstacleDefinition): Obstacle {
    const obstacle = new Obstacle(definition, this.laneSystem, this.getDistance);
    this.obstacles.push(obstacle);
    this.collisionSystem.register(obstacle);
    return obstacle;
  }

  update(isRunning: boolean, worldLength: number): void {
    for (const obstacle of this.obstacles) {
      const relativeZ = obstacle.trackZ - this.getDistance();

      if (!obstacle.hit && isRunning && this.collisionSystem.queryPair(this.runner, obstacle)) {
        if (this.runner.isBoosting()) {
          obstacle.hit = true;
          obstacle.mesh.visible = false;
          this.onDestroyed?.({ obstacle });
        } else {
          obstacle.hit = true;
          this.onHit({ obstacle });
        }
      }

      if (relativeZ < -12) {
        obstacle.recycle(worldLength);
      }
    }
  }

  reset(): void {
    for (const obstacle of this.obstacles) {
      obstacle.reset();
    }
  }

  getActiveCount(): number {
    return this.obstacles.length;
  }
}
