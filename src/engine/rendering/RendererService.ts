import * as THREE from "three";
import type { QualityMode } from "../../app/GameConfig";

export class RendererService {
  readonly renderer: THREE.WebGLRenderer;

  constructor(private readonly root: HTMLElement, quality: QualityMode) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: quality !== "low",
      alpha: false,
      powerPreference: quality === "low" ? "default" : "high-performance"
    });

    this.renderer.setClearColor(0x58c7f3, 1);
    this.renderer.setPixelRatio(this.getPixelRatio(quality));
    this.renderer.shadowMap.enabled = quality !== "low";
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.domElement.className = "game-canvas";
    this.root.appendChild(this.renderer.domElement);
  }

  setSize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
  }

  /**
   * Apply a quality change live. Pixel ratio + shadow toggle take effect
   * immediately; antialias / power-preference are baked into the GL context at
   * creation, so those only change on the next launch (new scenes also pick up
   * shadow detail from config.quality when they are rebuilt).
   */
  setQuality(quality: QualityMode): void {
    this.renderer.setPixelRatio(this.getPixelRatio(quality));
    this.renderer.shadowMap.enabled = quality !== "low";
    this.renderer.shadowMap.needsUpdate = true;
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  dispose(): void {
    this.renderer.domElement.remove();
    this.renderer.dispose();
  }

  private getPixelRatio(quality: QualityMode): number {
    const ratio = window.devicePixelRatio || 1;
    if (quality === "low") {
      return Math.min(ratio, 1.25);
    }

    if (quality === "medium") {
      return Math.min(ratio, 1.75);
    }

    return Math.min(ratio, 2);
  }
}
