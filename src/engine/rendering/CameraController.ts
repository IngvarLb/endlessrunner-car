import * as THREE from "three";
import type { GameState } from "../../game/state/GameStateTypes";

// Lane-change camera follow: the camera eases toward the player's lateral position
// with a lag, so it swings along a bit on a lane change — no tilt/roll.
const FOLLOW_LERP = 6; // how fast the camera anchor chases the player's x (lower = more swing)
const CAM_FOLLOW = 0.62; // how far the camera body shifts toward the player's lane
const TARGET_FOLLOW = 0.82; // how far the look-at point shifts (keeps the player framed)

export class CameraController {
  readonly camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120);
  private readonly target = new THREE.Vector3(0, 1.25, 8);
  private readonly desiredPosition = new THREE.Vector3(0, 4.7, -8.4);
  private followX = 0;
  private shakeTimer = 0;
  private shakeDuration = 0;
  private shakeIntensity = 0;

  constructor() {
    this.camera.position.copy(this.desiredPosition);
    this.camera.lookAt(this.target);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  shake(duration: number, intensity: number): void {
    this.shakeDuration = Math.max(this.shakeDuration, duration);
    this.shakeTimer = Math.max(this.shakeTimer, duration);
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  update(dt: number, elapsed: number, state: GameState, lateral = 0): void {
    const speedFov = state === "running" ? 4 : 0;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 58 + speedFov, dt * 3);
    this.camera.updateProjectionMatrix();

    // Chase the player's lateral position with a lag — the lag is the swing.
    this.followX += (lateral - this.followX) * Math.min(1, dt * FOLLOW_LERP);

    const idleSway = Math.sin(elapsed * 0.75) * 0.12;
    this.desiredPosition.set(idleSway + this.followX * CAM_FOLLOW, 4.7, -8.4);
    this.target.set(this.followX * TARGET_FOLLOW, 1.25, 8);

    this.camera.position.lerp(this.desiredPosition, Math.min(1, dt * 4));
    const shakeOffset = this.getShakeOffset(dt, elapsed);
    this.camera.position.add(shakeOffset);
    this.camera.lookAt(this.target.clone().add(shakeOffset.multiplyScalar(0.25)));
  }

  private getShakeOffset(dt: number, elapsed: number): THREE.Vector3 {
    if (this.shakeTimer <= 0 || this.shakeDuration <= 0) {
      this.shakeIntensity = 0;
      return new THREE.Vector3();
    }

    this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    const falloff = this.shakeTimer / this.shakeDuration;
    const strength = this.shakeIntensity * falloff * falloff;

    return new THREE.Vector3(
      Math.sin(elapsed * 97.1) * strength,
      Math.sin(elapsed * 81.7 + 1.4) * strength * 0.62,
      Math.sin(elapsed * 53.3 + 0.7) * strength * 0.42
    );
  }
}
