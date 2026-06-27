import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const KEEP_ATTRIBUTES = ["position", "normal", "uv"];

/**
 * Collapse a low-poly Group of many small single-material meshes into one merged mesh
 * PER material — turning dozens of draw calls into a handful, with no visual change.
 *
 * Each child's local transform (relative to `group`) is baked into the merged geometry,
 * so the returned group can be positioned/rotated/scaled exactly like the original.
 * Call this on a freshly-built prop while it still sits at the origin.
 *
 * Meshes are grouped by their material *reference*, so props that reuse the shared
 * MaterialFactory materials collapse to a tiny set of draw calls.
 */
export function mergeByMaterial(group: THREE.Group, keep?: RegExp): THREE.Group {
  group.updateMatrixWorld(true);
  const inverse = new THREE.Matrix4().copy(group.matrixWorld).invert();

  const merged = new THREE.Group();
  merged.name = group.name;

  const byMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const order: THREE.Material[] = [];
  const kept: THREE.Object3D[] = [];
  group.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) {
      return;
    }
    // Animated parts (blinkers, wreck smoke, …) must stay separate meshes: collect
    // them to re-base onto the merged group with their transform intact.
    if (keep && mesh.name && keep.test(mesh.name)) {
      kept.push(mesh);
      return;
    }
    // Low-poly props are single-material; if an array slips through, take the first.
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const geometry = mesh.geometry.clone();
    // Bake the child's transform (relative to the group root) into the geometry.
    geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
    // Drop any attribute that would break the merge (keep only the shared trio) and
    // ensure every geometry is non-indexed so they always concatenate cleanly.
    for (const name of Object.keys(geometry.attributes)) {
      if (!KEEP_ATTRIBUTES.includes(name)) {
        geometry.deleteAttribute(name);
      }
    }
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if (flat !== geometry) {
      geometry.dispose();
    }
    if (!byMaterial.has(material)) {
      byMaterial.set(material, []);
      order.push(material);
    }
    byMaterial.get(material)!.push(flat);
  });

  // Re-base kept (animated) meshes onto the merged group, preserving world placement.
  for (const mesh of kept) {
    const rel = new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld);
    rel.decompose(mesh.position, mesh.quaternion, mesh.scale);
    merged.add(mesh);
  }

  for (const material of order) {
    const geometries = byMaterial.get(material)!;
    const combined = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, false);
    if (!combined) {
      continue;
    }
    if (geometries.length > 1) {
      for (const g of geometries) {
        g.dispose();
      }
    }
    const mesh = new THREE.Mesh(combined, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    merged.add(mesh);
  }
  return merged;
}
