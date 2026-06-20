import * as THREE from "three";

export function disposeObject3D(object: THREE.Object3D, disposeMaterials = false): void {
  object.parent?.remove(object);

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.geometry.dispose();

    if (disposeMaterials) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        material.dispose();
      }
    }
  });
}

