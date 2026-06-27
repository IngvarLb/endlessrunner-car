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

type Flash = { mesh: THREE.Mesh; life: number };

export class TurretSystem {
  private readonly root = new THREE.Group();
  private readonly body = new THREE.Group(); // swivels to aim
  private readonly muzzle = new THREE.Object3D();
  private readonly projectiles: Projectile[] = [];
  private readonly muzzleWorld = new THREE.Vector3();
  private readonly targetWorld = new THREE.Vector3();

  // 狐 VFX: a muzzle flash, a target reticle on the locked car, and impact bursts.
  private readonly muzzleFlashMat = new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  private readonly tracerMat = new THREE.MeshBasicMaterial({ color: 0xffb024, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
  private readonly reticleMat = new THREE.MeshBasicMaterial({ color: 0xff8a1e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  private readonly flashMat = new THREE.MeshBasicMaterial({ color: 0xffc24a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  private muzzleFlash!: THREE.Mesh;
  private readonly reticle = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.07, 8, 20), this.reticleMat);
  private readonly impacts: Flash[] = [];
  private muzzleFlashLife = 0;
  private reticleLevel = 0;
  private reticleSpin = 0;

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

    // Glowing tracer rounds (additive so they read as energy bolts).
    const tracerGeo = new THREE.BoxGeometry(0.12, 0.12, 1.0);
    for (let i = 0; i < 14; i += 1) {
      const mesh = new THREE.Mesh(tracerGeo, this.tracerMat);
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

    // Target reticle — a spinning ring that locks onto the engaged car.
    this.reticle.rotation.x = Math.PI / 2;
    this.reticle.visible = false;
    scene.add(this.reticle);

    // Impact bursts at each kill (own material clone each, so they fade independently).
    const flashGeo = new THREE.SphereGeometry(0.5, 10, 8);
    for (let i = 0; i < 6; i += 1) {
      const mesh = new THREE.Mesh(flashGeo, this.flashMat.clone());
      mesh.visible = false;
      scene.add(mesh);
      this.impacts.push({ mesh, life: 0 });
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

    let lockedCar: TrafficCar | undefined;
    if (deployed && isRunning) {
      const car = this.traffic.nearestCarAhead(RANGE);
      if (car) {
        car.mesh.getWorldPosition(this.targetWorld);
        this.aimY = Math.atan2(this.targetWorld.x - this.root.position.x, this.targetWorld.z - this.root.position.z);
        lockedCar = car;
      }
      this.body.rotation.y = approachAngle(this.body.rotation.y, this.aimY, dt * 9);

      this.fireTimer -= dt;
      if (this.fireTimer <= 0 && car) {
        this.fireTimer = FIRE_INTERVAL;
        this.fire(car);
      }
    }

    this.updateVfx(dt, lockedCar);
    this.updateProjectiles(dt);
  }

  /** Muzzle flash decay, target reticle lock, and impact-burst fades. */
  private updateVfx(dt: number, lockedCar: TrafficCar | undefined): void {
    // Muzzle flash: quick pop that scales down and fades.
    this.muzzleFlashLife = Math.max(0, this.muzzleFlashLife - dt / 0.07);
    this.muzzleFlash.visible = this.muzzleFlashLife > 0.01;
    if (this.muzzleFlash.visible) {
      this.muzzleFlashMat.opacity = this.muzzleFlashLife;
      this.muzzleFlash.scale.setScalar(0.7 + this.muzzleFlashLife * 0.9);
    }

    // Reticle: ease in over the locked car, spin, billboard-flat above it.
    const want = lockedCar && !lockedCar.hit ? 1 : 0;
    this.reticleLevel = THREE.MathUtils.lerp(this.reticleLevel, want, Math.min(1, dt * 12));
    this.reticle.visible = this.reticleLevel > 0.02;
    if (this.reticle.visible) {
      if (lockedCar) {
        lockedCar.mesh.getWorldPosition(this.targetWorld);
        this.reticle.position.set(this.targetWorld.x, this.targetWorld.y + 0.6, this.targetWorld.z);
      }
      this.reticleSpin += dt * 3.2;
      this.reticle.rotation.z = this.reticleSpin;
      this.reticleMat.opacity = this.reticleLevel * 0.85;
      this.reticle.scale.setScalar(0.85 + this.reticleLevel * 0.25);
    }

    // Impact bursts: expand + fade.
    for (const f of this.impacts) {
      if (f.life <= 0) {
        continue;
      }
      f.life = Math.max(0, f.life - dt / 0.2);
      if (f.life <= 0.01) {
        f.mesh.visible = false;
        continue;
      }
      (f.mesh.material as THREE.MeshBasicMaterial).opacity = f.life * 0.9;
      f.mesh.scale.setScalar(0.5 + (1 - f.life) * 1.6);
    }
  }

  private spawnImpact(at: THREE.Vector3): void {
    const f = this.impacts.find((x) => x.life <= 0);
    if (!f) {
      return;
    }
    f.life = 1;
    f.mesh.visible = true;
    f.mesh.position.copy(at);
    f.mesh.scale.setScalar(0.5);
  }

  reset(): void {
    this.active = false;
    this.rise = 0;
    this.fireTimer = 0;
    this.root.visible = false;
    this.muzzleFlashLife = 0;
    this.muzzleFlash.visible = false;
    this.reticleLevel = 0;
    this.reticle.visible = false;
    for (const p of this.projectiles) {
      p.active = false;
      p.mesh.visible = false;
    }
    for (const f of this.impacts) {
      f.life = 0;
      f.mesh.visible = false;
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
    }
    this.tracerMat.dispose();
    this.reticle.geometry.dispose();
    this.reticleMat.dispose();
    for (const f of this.impacts) {
      f.mesh.geometry.dispose();
      (f.mesh.material as THREE.Material).dispose?.();
    }
    this.flashMat.dispose();
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
    this.muzzleFlashLife = 1; // pop the muzzle flash
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
          p.target.mesh.getWorldPosition(this.targetWorld);
          this.spawnImpact(this.targetWorld);
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

    // Muzzle flash — a small additive burst at the barrel tip, popped on each shot.
    this.muzzleFlash = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), this.muzzleFlashMat);
    this.muzzleFlash.position.set(0, 0.28, 0.72);
    this.muzzleFlash.visible = false;
    this.body.add(this.muzzleFlash);

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
