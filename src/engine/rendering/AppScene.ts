import type * as THREE from "three";
import type { GameState } from "../../game/state/GameStateTypes";

export type SceneCameraController = {
  camera: THREE.Camera;
  resize(width: number, height: number): void;
};

export type AppScene = {
  scene: THREE.Scene;
  cameraController: SceneCameraController;
  update(dt: number, elapsed: number, state: GameState): void;
  dispose(): void;
};

