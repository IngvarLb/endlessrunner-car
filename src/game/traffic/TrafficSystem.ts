import type { LaneIndex } from "../../app/GameConfig";
import { CollisionSystem } from "../../engine/physics/CollisionSystem";
import { RunnerController } from "../runner/RunnerController";
import { LaneSystem } from "../world/LaneSystem";
import { TrafficCar, type TrafficCarDefinition } from "./TrafficCar";

export type TrafficCarHit = {
  car: TrafficCar;
};

export type TrafficCarDestroyed = {
  car: TrafficCar;
};

export class TrafficSystem {
  private readonly cars: TrafficCar[] = [];
  /** While set, cars in this lane are knocked aside instead of failing (藍 Freie Bahn). */
  private shieldedLane?: LaneIndex;

  constructor(
    private readonly runner: RunnerController,
    private readonly laneSystem: LaneSystem,
    private readonly collisionSystem: CollisionSystem,
    private readonly getDistance: () => number,
    private readonly onHit: (hit: TrafficCarHit) => void,
    private readonly onDestroyed?: (destroyed: TrafficCarDestroyed) => void
  ) {}

  add(definition: TrafficCarDefinition): TrafficCar {
    const car = new TrafficCar(definition, this.laneSystem, this.getDistance);
    this.cars.push(car);
    this.collisionSystem.register(car);
    return car;
  }

  update(dt: number, isRunning: boolean, worldLength: number): void {
    for (const car of this.cars) {
      car.update(dt, isRunning);

      if (!car.hit && isRunning && this.collisionSystem.queryPair(this.runner, car)) {
        if (this.runner.isBoosting() || this.runner.isInvincible() || car.lane === this.shieldedLane) {
          car.hit = true;
          car.mesh.visible = false;
          this.onDestroyed?.({ car });
        } else {
          car.hit = true;
          this.onHit({ car });
        }
      }

      if (car.trackZ - this.getDistance() < -14) {
        car.recycle(worldLength);
      }
    }
  }

  reset(): void {
    this.shieldedLane = undefined;
    for (const car of this.cars) {
      car.reset();
    }
  }

  setLaneShield(lane: LaneIndex | undefined): void {
    this.shieldedLane = lane;
  }

  /**
   * Swerve cars out of `lane` once they're far enough ahead (so the move happens
   * off in the distance, not in the player's face). Used by 藍 Freie Bahn to keep
   * the middle lane clear. Targets an adjacent lane.
   */
  swerveOutOfLane(lane: LaneIndex, minAheadZ: number): void {
    const distance = this.getDistance();
    for (const car of this.cars) {
      if (car.hit || car.lane !== lane) {
        continue;
      }
      if (car.trackZ - distance <= minAheadZ) {
        continue; // too close — leave it so it doesn't snap on screen
      }
      car.lane = this.adjacentLane(car);
    }
  }

  private adjacentLane(car: TrafficCar): LaneIndex {
    const lanes = this.laneSystem.lanes;
    const options = lanes.filter((candidate) => Math.abs(candidate - car.lane) === 1);
    if (options.length === 0) {
      return car.lane;
    }
    // Deterministic side choice so a car doesn't flip-flop between frames.
    return options[Math.abs(Math.floor(car.trackZ)) % options.length];
  }

  getActiveCount(): number {
    return this.cars.length;
  }
}
