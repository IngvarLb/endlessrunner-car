import type * as THREE from "three";
import type { LaneIndex } from "../../app/GameConfig";
import { CollisionSystem } from "../../engine/physics/CollisionSystem";
import { RunnerController } from "../runner/RunnerController";
import { LaneSystem } from "../world/LaneSystem";
import { Collectible } from "./Collectible";

/**
 * 桜 Blütenregen — a pool of sakura-pink coins that, while active, actually rain
 * down: each coin spawns high above a lane ahead and falls to the road. They are
 * only collectible once near the ground (the collider follows the falling y), and
 * respawn up top after being grabbed or passed — so it's a continuous downpour.
 * Density scales with mastery level (drizzle → downpour). Collection reuses the
 * shared CollisionSystem and credits via `onCollect`.
 */
const BASE_DENSITY = 26; // active coins at level 0 (drizzle); scales to the pool size at level 100
const SPREAD_AHEAD = 64; // metres of road ahead the field covers
const RESPAWN_NEAR = 18; // re-rain coins into the visible mid-distance, not far at the horizon
const RESPAWN_SPAN = 40;
const GROUND_Y = 0.92; // resting height of a coin on the road
const GRAVITY = 15; // fall acceleration (lower = lingers in the air → more rain-like)
const DROP_MIN = 8; // metres above ground a fresh coin spawns
const DROP_MAX = 16;

export class CoinRainSystem {
  private readonly coins: Collectible[] = [];
  private readonly fallY: number[] = [];
  private readonly fallVel: number[] = [];
  private readonly groundedTime: number[] = [];
  private readonly dwellTarget: number[] = [];
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
      this.fallY.push(GROUND_Y);
      this.fallVel.push(0);
      this.groundedTime.push(0);
      this.dwellTarget.push(1);
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
        const trackZ = distance + 10 + (i / this.density) * SPREAD_AHEAD + Math.random() * 8;
        // Staggered starting heights so coins are at all phases of falling at once.
        this.drop(i, this.randomLane(), trackZ, GROUND_Y + Math.random() * (DROP_MAX - GROUND_Y));
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

      // Fall under gravity until it rests on the road.
      if (this.fallY[i] > GROUND_Y) {
        this.fallVel[i] += GRAVITY * dt;
        this.fallY[i] = Math.max(GROUND_Y, this.fallY[i] - this.fallVel[i] * dt);
        if (this.fallY[i] <= GROUND_Y) {
          this.fallVel[i] = 0;
        }
      } else {
        this.groundedTime[i] += dt;
      }
      coin.updateVisual(dt, elapsed); // spin (its bob is overridden by the fall height below)
      coin.mesh.position.y = this.fallY[i];

      const relativeZ = coin.trackZ - distance;
      // Collider follows the falling y, so a coin is only collectible once it lands.
      if (!coin.collected && this.collisionSystem.queryPair(this.runner, coin)) {
        coin.collect();
        this.onCollect(1);
        this.respawn(i, distance);
      } else if (relativeZ < -10) {
        this.respawn(i, distance);
      } else if (this.fallY[i] <= GROUND_Y && this.groundedTime[i] > this.dwellTarget[i] && relativeZ > 20) {
        // Landed and lingered while still well ahead → re-rain it (keeps the downpour going).
        this.respawn(i, distance);
      }
    }
  }

  private respawn(index: number, distance: number): void {
    this.drop(index, this.randomLane(), distance + RESPAWN_NEAR + Math.random() * RESPAWN_SPAN, DROP_MIN + Math.random() * (DROP_MAX - DROP_MIN));
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

  private drop(index: number, lane: LaneIndex, trackZ: number, height: number): void {
    this.coins[index].placeAt(lane, trackZ);
    this.fallY[index] = height;
    this.fallVel[index] = 0;
    this.groundedTime[index] = 0;
    this.dwellTarget[index] = 0.4 + Math.random() * 0.8;
    this.coins[index].mesh.position.y = height;
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
