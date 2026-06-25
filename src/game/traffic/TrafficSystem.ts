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

  /** Nearest live car ahead within `maxAheadZ` metres (for 狐's turret targeting). */
  nearestCarAhead(maxAheadZ: number): TrafficCar | undefined {
    const distance = this.getDistance();
    let best: TrafficCar | undefined;
    let bestRel = Infinity;
    for (const car of this.cars) {
      if (car.hit || !car.mesh.visible) {
        continue;
      }
      const rel = car.trackZ - distance;
      if (rel < -2 || rel > maxAheadZ) {
        continue;
      }
      if (rel < bestRel) {
        bestRel = rel;
        best = car;
      }
    }
    return best;
  }

  /** Nearest live car directly ahead in `lane`, within `maxAheadZ` (藍 Lichthupe trigger). */
  frontCarInLane(lane: LaneIndex, maxAheadZ: number): TrafficCar | undefined {
    const distance = this.getDistance();
    let best: TrafficCar | undefined;
    let bestRel = Infinity;
    for (const car of this.cars) {
      if (car.hit || !car.mesh.visible || car.lane !== lane) {
        continue;
      }
      const rel = car.trackZ - distance;
      if (rel < 0.5 || rel > maxAheadZ) {
        continue;
      }
      if (rel < bestRel) {
        bestRel = rel;
        best = car;
      }
    }
    return best;
  }

  /**
   * Restore cars to their normal lanes (e.g. when 藍 ends), except those in the
   * close band ahead — snapping a car back into the middle right in front of the
   * player would be an unfair hit, so leave those until they pass / recycle.
   */
  restoreLanes(minSafeAheadZ: number): void {
    const distance = this.getDistance();
    for (const car of this.cars) {
      if (car.hit) {
        continue;
      }
      const rel = car.trackZ - distance;
      if (rel < 0 || rel > minSafeAheadZ) {
        car.lane = car.initialLane;
      }
    }
  }

  /** Make a specific car pull aside into an adjacent lane (藍 Lichthupe: it gives way). */
  swerveCar(car: TrafficCar): void {
    if (!car.hit) {
      car.lane = this.adjacentLane(car);
    }
  }

  /** Destroy a specific car (turret hit). */
  destroyCar(car: TrafficCar): void {
    if (car.hit) {
      return;
    }
    car.hit = true;
    car.mesh.visible = false;
    this.onDestroyed?.({ car });
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
