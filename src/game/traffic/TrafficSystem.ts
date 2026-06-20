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
        if (this.runner.isBoosting()) {
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
    for (const car of this.cars) {
      car.reset();
    }
  }

  getActiveCount(): number {
    return this.cars.length;
  }
}
