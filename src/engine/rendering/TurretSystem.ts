import * as THREE from "three";
import { RunnerController } from "../../game/runner/RunnerController";
import { TrafficSystem } from "../../game/traffic/TrafficSystem";
import type { TrafficCar } from "../../game/traffic/TrafficCar";

/**
 * 狐 Geschützturm — a roof-mounted turret that rises out of the car, swivels to
 * the nearest NPC and streams visible tracer rounds at it. Each car shot down is
 * destroyed and pays +10 coins. Self-contained engine system: builds the turret
 * mesh + a projectile pool, follows the runner, and drives aiming/firing.
 */
const ROOF_Y = 0.82; // world height the turret sits at on the car roof
const RISE_HIDE = 0.85; // how far below the roof it starts (tucked inside the car)
const RISE_TIME = 0.45; // seconds to deploy / retract
const TURRET_SCALE = 1.3; // overall turret size
const RANGE = 24; // metres ahead it will engage cars
const FIRE_INTERVAL = 0.11; // seconds between tracer rounds (rapid stream)
const PROJECTILE_SPEED = 72; // metres/second (slow enough to read the shots)
const COINS_PER_KILL = 10;

type Projectile = {
  mesh: THREE.Mesh;
  active: boolean;
  from: THREE.Vector3;
  to: THREE.Vector3;
  travelled: number;
  duration: number;
  target?: TrafficCar;
};

export class TurretSystem {
  private readonly root = new THREE.Group();
  private readonly body = new THREE.Group(); // swivels to aim
  private readonly muzzle = new THREE.Object3D();
  private readonly projectiles: Projectile[] = [];
  private readonly muzzleWorld = new THREE.Vector3();
  private readonly targetWorld = new THREE.Vector3();

  private active = false;
  private rise = 0;
  private aimY = 0;
  private fireTimer = 0;

  constructor(
    scene: THREE.Scene,
    private readonly runner: RunnerController,
    private readonly traffic: TrafficSystem,
    private readonly onKill: (coins: number) => void
  ) {
    this.buildTurret();
    this.root.visible = false;
    scene.add(this.root);

    const tracerGeo = new THREE.BoxGeometry(0.09, 0.09, 0.75);
    const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });
    for (let i = 0; i < 14; i += 1) {
      const mesh = new THREE.Mesh(tracerGeo, tracerMat);
      mesh.visible = false;
      scene.add(mesh);
      this.projectiles.push({
        mesh,
        active: false,
        from: new THREE.Vector3(),
        to: new THREE.Vector3(),
        travelled: 0,
        duration: 0
      });
    }
  }

  setActive(on: boolean): void {
    this.active = on;
  }

  update(dt: number, isRunning: boolean): void {
    // Deploy / retract.
    const target = this.active && isRunning ? 1 : 0;
    this.rise = THREE.MathUtils.clamp(this.rise + Math.sign(target - this.rise) * (dt / RISE_TIME), 0, 1);
    const deployed = this.rise > 0.02;
    this.root.visible = deployed;

    const runnerPos = this.runner.getPosition();
    this.root.position.set(runnerPos.x, ROOF_Y - (1 - this.rise) * RISE_HIDE, runnerPos.z);

    if (deployed && isRunning) {
      const car = this.traffic.nearestCarAhead(RANGE);
      if (car) {
        car.mesh.getWorldPosition(this.targetWorld);
        this.aimY = Math.atan2(this.targetWorld.x - this.root.position.x, this.targetWorld.z - this.root.position.z);
      }
      this.body.rotation.y = approachAngle(this.body.rotation.y, this.aimY, dt * 9);

      this.fireTimer -= dt;
      if (this.fireTimer <= 0 && car) {
        this.fireTimer = FIRE_INTERVAL;
        this.fire(car);
      }
    }

    this.updateProjectiles(dt);
  }

  reset(): void {
    this.active = false;
    this.rise = 0;
    this.fireTimer = 0;
    this.root.visible = false;
    for (const p of this.projectiles) {
      p.active = false;
      p.mesh.visible = false;
    }
  }

  dispose(): void {
    this.root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose?.();
      }
    });
    for (const p of this.projectiles) {
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose?.();
    }
  }

  private fire(car: TrafficCar): void {
    const projectile = this.projectiles.find((p) => !p.active);
    if (!projectile) {
      return;
    }
    this.muzzle.getWorldPosition(this.muzzleWorld);
    car.mesh.getWorldPosition(this.targetWorld);
    projectile.active = true;
    projectile.target = car;
    projectile.from.copy(this.muzzleWorld);
    projectile.to.copy(this.targetWorld);
    projectile.travelled = 0;
    projectile.duration = Math.max(0.06, this.muzzleWorld.distanceTo(this.targetWorld) / PROJECTILE_SPEED);
    projectile.mesh.visible = true;
    projectile.mesh.position.copy(this.muzzleWorld);
    projectile.mesh.lookAt(this.targetWorld);
  }

  private updateProjectiles(dt: number): void {
    for (const p of this.projectiles) {
      if (!p.active) {
        continue;
      }
      p.travelled += dt;
      const t = p.travelled / p.duration;
      if (t >= 1) {
        p.active = false;
        p.mesh.visible = false;
        if (p.target && !p.target.hit) {
          this.traffic.destroyCar(p.target);
          this.onKill(COINS_PER_KILL);
        }
        p.target = undefined;
        continue;
      }
      p.mesh.position.lerpVectors(p.from, p.to, t);
    }
  }

  private buildTurret(): void {
    const metal = new THREE.MeshStandardMaterial({ color: 0x40434d, roughness: 0.5, metalness: 0.6 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x202227, roughness: 0.6, metalness: 0.5 });
    const accent = new THREE.MeshStandardMaterial({ color: 0xe08a2a, roughness: 0.45, metalness: 0.3 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.16, 0.44), metal);
    base.position.y = 0.08;
    this.root.add(base);

    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.4), metal);
    housing.position.y = 0.28;
    this.body.add(housing);

    const band = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.06), accent);
    band.position.set(0, 0.34, 0.2);
    this.body.add(band);

    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.58), dark);
    barrel.position.set(0, 0.28, 0.36);
    this.body.add(barrel);

    this.muzzle.position.set(0, 0.28, 0.66);
    this.body.add(this.muzzle);

    this.body.position.y = 0.04;
    this.root.add(this.body);
    this.root.scale.setScalar(TURRET_SCALE);
  }
}

/** Lerp an angle toward a target along the shortest path. */
function approachAngle(current: number, target: number, t: number): number {
  let delta = target - current;
  delta = Math.atan2(Math.sin(delta), Math.cos(delta));
  return current + delta * Math.min(1, t);
}
