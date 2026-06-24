import type * as THREE from "three";
import type { LaneIndex } from "../../app/GameConfig";
import { CollisionSystem } from "../../engine/physics/CollisionSystem";
import { RunnerController } from "../runner/RunnerController";
import { LaneSystem } from "../world/LaneSystem";
import { Collectible } from "./Collectible";

/**
 * 桜 Blütenregen — a pool of sakura-pink coins that, while active, fills the lanes
 * ahead of the player with a dense, scrolling coin field. Collection reuses the
 * shared CollisionSystem (same as normal coins) and credits via `onCollect`.
 * Density scales with the Main's mastery level (drizzle → downpour).
 */
const BASE_DENSITY = 16; // active coins at level 0 (drizzle); scales to the pool size at level 100
const SPREAD_AHEAD = 56; // metres of road ahead the field covers

export class CoinRainSystem {
  private readonly coins: Collectible[] = [];
  private active = false;
  private density = 0;

  constructor(
    poolSize: number,
    makeMesh: () => THREE.Object3D,
    laneSystem: LaneSystem,
    private readonly collisionSystem: CollisionSystem,
    private readonly runner: RunnerController,
    private readonly getDistance: () => number,
    private readonly onCollect: (amount: number) => void
  ) {
    for (let i = 0; i < poolSize; i += 1) {
      const mesh = makeMesh();
      mesh.visible = false;
      const coin = new Collectible({ id: `rain-${i}`, mesh, lane: 0, trackZ: -9999 }, laneSystem, getDistance);
      coin.collect(); // start hidden
      this.coins.push(coin);
      this.collisionSystem.register(coin);
    }
  }

  /** Meshes to add to the scrolling world group. */
  get meshes(): THREE.Object3D[] {
    return this.coins.map((coin) => coin.mesh);
  }

  setActive(on: boolean, level: number): void {
    this.active = on;
    if (!on) {
      this.hideAll();
      return;
    }
    const max = this.coins.length;
    const clampedLevel = Math.max(0, Math.min(100, level));
    this.density = Math.min(max, Math.round(BASE_DENSITY + (clampedLevel / 100) * (max - BASE_DENSITY)));
    const distance = this.getDistance();
    for (let i = 0; i < this.coins.length; i += 1) {
      if (i < this.density) {
        this.coins[i].placeAt(this.randomLane(), distance + 12 + (i / this.density) * SPREAD_AHEAD + Math.random() * 6);
      } else {
        this.coins[i].collect();
      }
    }
  }

  update(dt: number, elapsed: number, isRunning: boolean): void {
    if (!this.active || !isRunning) {
      return;
    }
    const distance = this.getDistance();
    for (let i = 0; i < this.density; i += 1) {
      const coin = this.coins[i];
      coin.updateVisual(dt, elapsed);

      if (!coin.collected && this.collisionSystem.queryPair(this.runner, coin)) {
        coin.collect();
        this.onCollect(1);
        coin.placeAt(this.randomLane(), distance + 45 + Math.random() * SPREAD_AHEAD); // respawn ahead
      } else if (coin.trackZ - distance < -10) {
        coin.placeAt(this.randomLane(), distance + 45 + Math.random() * SPREAD_AHEAD);
      }
    }
  }

  reset(): void {
    this.active = false;
    this.density = 0;
    this.hideAll();
  }

  dispose(): void {
    for (const coin of this.coins) {
      coin.mesh.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) {
          (mesh.material as THREE.Material).dispose?.();
        }
      });
    }
  }

  private hideAll(): void {
    for (const coin of this.coins) {
      coin.collect();
    }
  }

  private randomLane(): LaneIndex {
    const lanes: readonly LaneIndex[] = [-1, 0, 1];
    return lanes[Math.floor(Math.random() * lanes.length)];
  }
}
