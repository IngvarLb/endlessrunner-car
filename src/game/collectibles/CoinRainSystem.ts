import type * as THREE from "three";
import { RunnerController } from "../runner/RunnerController";

/**
 * 桜 Blütenregen — sakura-pink coins that rain down **everywhere** (road and the
 * terrain around it) at random positions, like real rain. Each coin spawns high
 * and falls under gravity. You collect the ones that happen to land where you
 * drive (near the car in your path); off-road drops are just visual. Landed coins
 * that linger ahead re-rain, so it's a continuous, even downpour. Density scales
 * with mastery level.
 */
const BASE_DENSITY = 36; // active coins at level 0; scales to the pool size at level 100
const SPREAD_AHEAD = 70; // metres of road ahead the initial field covers
const RESPAWN_NEAR = 16; // re-rain into the visible mid-distance, not far at the horizon
const RESPAWN_SPAN = 44;
const X_RANGE = 6; // coins fall across the road (±3.6) and onto the grass beyond
const GROUND_Y = 0.92; // resting height of a coin above the ground
const GRAVITY = 15; // fall acceleration (lower = lingers in the air → more rain-like)
const DROP_MIN = 8; // metres above ground a fresh coin spawns
const DROP_MAX = 16;
const COLLECT_X = 1.1; // half-width of the car's pickup reach
const COLLECT_Z = 1.3; // depth window for a pickup

export class CoinRainSystem {
  private readonly objects: THREE.Object3D[] = [];
  private readonly coinX: number[] = [];
  private readonly coinZ: number[] = []; // world-local z (scrolls with the world group)
  private readonly fallY: number[] = [];
  private readonly fallVel: number[] = [];
  private readonly groundedTime: number[] = [];
  private readonly dwellTarget: number[] = [];
  private readonly hidden: boolean[] = [];
  private active = false;
  private density = 0;

  constructor(
    poolSize: number,
    makeMesh: () => THREE.Object3D,
    private readonly runner: RunnerController,
    private readonly getDistance: () => number,
    private readonly onCollect: (amount: number) => void
  ) {
    for (let i = 0; i < poolSize; i += 1) {
      const mesh = makeMesh();
      mesh.visible = false;
      this.objects.push(mesh);
      this.coinX.push(0);
      this.coinZ.push(-9999);
      this.fallY.push(GROUND_Y);
      this.fallVel.push(0);
      this.groundedTime.push(0);
      this.dwellTarget.push(1);
      this.hidden.push(true);
    }
  }

  /** Meshes to add to the scrolling world group. */
  get meshes(): THREE.Object3D[] {
    return this.objects;
  }

  setActive(on: boolean, level: number): void {
    this.active = on;
    if (!on) {
      this.hideAll();
      return;
    }
    const max = this.objects.length;
    const clampedLevel = Math.max(0, Math.min(100, level));
    this.density = Math.min(max, Math.round(BASE_DENSITY + (clampedLevel / 100) * (max - BASE_DENSITY)));
    const distance = this.getDistance();
    for (let i = 0; i < this.objects.length; i += 1) {
      if (i < this.density) {
        const trackZ = distance + 8 + (i / this.density) * SPREAD_AHEAD + Math.random() * 8;
        // Staggered heights so coins are at all phases of falling at once.
        this.place(i, this.randomX(), trackZ, GROUND_Y + Math.random() * (DROP_MAX - GROUND_Y));
      } else {
        this.hide(i);
      }
    }
  }

  update(dt: number, _elapsed: number, isRunning: boolean): void {
    if (!this.active || !isRunning) {
      return;
    }
    const distance = this.getDistance();
    const runnerX = this.runner.getPosition().x;
    for (let i = 0; i < this.density; i += 1) {
      if (this.fallY[i] > GROUND_Y) {
        this.fallVel[i] += GRAVITY * dt;
        this.fallY[i] = Math.max(GROUND_Y, this.fallY[i] - this.fallVel[i] * dt);
        if (this.fallY[i] <= GROUND_Y) {
          this.fallVel[i] = 0;
        }
      } else {
        this.groundedTime[i] += dt;
      }

      const mesh = this.objects[i];
      mesh.rotation.z += dt * 4.8;
      mesh.position.set(this.coinX[i], this.fallY[i], this.coinZ[i]);

      const relativeZ = this.coinZ[i] - distance;
      const grounded = this.fallY[i] <= GROUND_Y + 0.05;
      if (
        !this.hidden[i] &&
        grounded &&
        Math.abs(this.coinX[i] - runnerX) < COLLECT_X &&
        Math.abs(relativeZ) < COLLECT_Z
      ) {
        this.onCollect(1);
        this.respawn(i, distance);
      } else if (relativeZ < -10) {
        this.respawn(i, distance);
      } else if (grounded && this.groundedTime[i] > this.dwellTarget[i] && relativeZ > 20) {
        this.respawn(i, distance); // landed and lingered ahead → re-rain (keeps the downpour going)
      }
    }
  }

  reset(): void {
    this.active = false;
    this.density = 0;
    this.hideAll();
  }

  dispose(): void {
    for (const mesh of this.objects) {
      mesh.traverse((object) => {
        const child = object as THREE.Mesh;
        if (child.isMesh) {
          (child.material as THREE.Material).dispose?.();
        }
      });
    }
  }

  private respawn(index: number, distance: number): void {
    this.place(
      index,
      this.randomX(),
      distance + RESPAWN_NEAR + Math.random() * RESPAWN_SPAN,
      DROP_MIN + Math.random() * (DROP_MAX - DROP_MIN)
    );
  }

  private place(index: number, x: number, trackZ: number, height: number): void {
    this.coinX[index] = x;
    this.coinZ[index] = trackZ;
    this.fallY[index] = height;
    this.fallVel[index] = 0;
    this.groundedTime[index] = 0;
    this.dwellTarget[index] = 0.4 + Math.random() * 0.8;
    this.hidden[index] = false;
    const mesh = this.objects[index];
    mesh.visible = true;
    mesh.position.set(x, height, trackZ);
  }

  private hide(index: number): void {
    this.hidden[index] = true;
    this.objects[index].visible = false;
  }

  private hideAll(): void {
    for (let i = 0; i < this.objects.length; i += 1) {
      this.hide(i);
    }
  }

  private randomX(): number {
    return (Math.random() * 2 - 1) * X_RANGE;
  }
}
