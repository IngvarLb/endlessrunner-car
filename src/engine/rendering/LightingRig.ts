import * as THREE from "three";
import type { QualityMode } from "../../app/GameConfig";

export type SceneLights = { hemi: THREE.HemisphereLight; sun: THREE.DirectionalLight };

export class LightingRig {
  static addTo(scene: THREE.Scene, quality: QualityMode): SceneLights {
    const hemi = new THREE.HemisphereLight(0x9fe8ff, 0x3b2f23, 2.1);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2c2, quality === "low" ? 1.5 : 2.2);
    sun.position.set(-8, 12, -6);
    sun.castShadow = quality !== "low";

    if (sun.castShadow) {
      const shadowSize = quality === "high" ? 2048 : 1024;
      sun.shadow.mapSize.set(shadowSize, shadowSize);
      sun.shadow.bias = -0.0005;
      sun.shadow.camera.near = 1;
      sun.shadow.camera.far = 40;
      sun.shadow.camera.left = -18;
      sun.shadow.camera.right = 18;
      sun.shadow.camera.top = 18;
      sun.shadow.camera.bottom = -18;
    }

    scene.add(sun);

    return { hemi, sun };
  }
}
