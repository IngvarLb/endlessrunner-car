import * as THREE from "three";
import { getVehicleKanji } from "../../game/vehicles/vehicleKanji";
import { getVehicleDefinition, getVehiclePrice } from "../../game/vehicles/VehicleCatalog";

const TIER_INFO: Record<string, { num: number; kanji: string; label: string }> = {
  starter: { num: 1, kanji: "初", label: "STARTER" },
  street: { num: 2, kanji: "街", label: "STREET" },
  sport: { num: 3, kanji: "走", label: "SPORT" },
  elite: { num: 4, kanji: "極", label: "ELITE" },
  legend: { num: 5, kanji: "龍", label: "LEGEND" }
};

/**
 * The garage hero backdrop: a monumental per-vehicle kanji printed on a bright
 * washi-paper wall, sitting INSIDE the 3D scene behind the car. The car occludes
 * it and casts its shadow onto the paper — so the UI reads as one printed object,
 * not an overlay (DESIGN_VISION.md §15.4 / E3). Ink on bright paper, like the
 * references — no sunburst, no glow.
 *
 * Textures are drawn once (kanji is redrawn only on vehicle change, never per
 * frame) and disposed with the scene.
 */

const SCARLET = "#e1261c";
const SUMI = "#15141a";

export class GarageBackdrop {
  readonly group = new THREE.Group();

  private readonly kanjiCanvas = document.createElement("canvas");
  private readonly kanjiTexture: THREE.CanvasTexture;
  private readonly kanjiMesh: THREE.Mesh;
  private currentKanji = "";
  private fontReady = false;
  private punchT = 1;

  // Diegetic wall stencil: tier + price/owned printed on the wall, not as HTML.
  private readonly metaCanvas = document.createElement("canvas");
  private readonly metaTexture: THREE.CanvasTexture;
  private metaKey = "";
  private metaVehicleId = "";
  private metaOwned = false;

  constructor() {
    this.group.name = "garage_backdrop";

    // Shadow-catching bright washi wall — the "paper" the print sits on.
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xe9dec6,
      roughness: 0.98,
      metalness: 0,
      flatShading: true
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 5.4), wallMaterial);
    wall.position.set(0, 1.7, -3.02);
    wall.receiveShadow = true;

    // Monumental kanji print, partly occluded by the car.
    this.kanjiCanvas.width = 1024;
    this.kanjiCanvas.height = 1024;
    this.kanjiTexture = new THREE.CanvasTexture(this.kanjiCanvas);
    this.kanjiTexture.colorSpace = THREE.SRGBColorSpace;
    this.kanjiTexture.anisotropy = 4;

    const kanjiMaterial = new THREE.MeshStandardMaterial({
      map: this.kanjiTexture,
      transparent: true,
      roughness: 0.94,
      metalness: 0,
      depthWrite: false
    });
    this.kanjiMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 4.1), kanjiMaterial);
    this.kanjiMesh.position.set(0, 1.62, -2.96);
    this.kanjiMesh.receiveShadow = true;

    // Wall stencil plane (tier + price/owned), printed to the left of the car.
    this.metaCanvas.width = 768;
    this.metaCanvas.height = 448;
    this.metaTexture = new THREE.CanvasTexture(this.metaCanvas);
    this.metaTexture.colorSpace = THREE.SRGBColorSpace;
    this.metaTexture.anisotropy = 4;
    const metaMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.05, 1.2),
      new THREE.MeshStandardMaterial({
        map: this.metaTexture,
        transparent: true,
        roughness: 0.96,
        metalness: 0,
        depthWrite: false
      })
    );
    metaMesh.position.set(-2.75, 1.58, -2.985);
    metaMesh.rotation.z = 0.02;

    this.group.add(wall, this.kanjiMesh, metaMesh);

    // Redraw once the bold web fonts are actually available.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          this.fontReady = true;
          if (this.currentKanji) {
            this.drawKanji(this.currentKanji);
          }
          if (this.metaVehicleId) {
            this.drawMeta(this.metaVehicleId, this.metaOwned);
          }
        })
        .catch(() => undefined);
    }
  }

  setVehicle(vehicleId: string, owned: boolean): void {
    this.drawMeta(vehicleId, owned);

    const kanji = getVehicleKanji(vehicleId);
    if (kanji === this.currentKanji) {
      return;
    }
    const isFirstPaint = this.currentKanji === "";
    this.drawKanji(kanji);
    // Stamp-punch on every change except the very first paint.
    if (!isFirstPaint) {
      this.punchT = 0;
    }
  }

  /** Advance the stamp-punch animation; call once per frame. */
  update(dt: number): void {
    if (this.punchT >= 1) {
      return;
    }
    this.punchT = Math.min(1, this.punchT + dt / 0.32);
    // back-ease-out overshoot: pops in big, settles to 1.0
    const t = this.punchT - 1;
    const eased = 1 + t * t * (2.7 * t + 1.7);
    const scale = 1 + (1 - eased) * 0.18;
    this.kanjiMesh.scale.setScalar(scale);
  }

  dispose(): void {
    this.group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          const map = (material as THREE.MeshStandardMaterial).map;
          map?.dispose();
          material.dispose();
        }
      }
    });
  }

  private drawKanji(kanji: string): void {
    this.currentKanji = kanji;
    const ctx = this.kanjiCanvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const w = this.kanjiCanvas.width;
    const h = this.kanjiCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const family = this.fontReady
      ? '"Shippori Mincho B1", "Hiragino Mincho ProN", serif'
      : '"Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.font = `800 ${Math.round(h * 0.84)}px ${family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Riso misregistration: a sumi plate offset behind the scarlet plate.
    ctx.fillStyle = SUMI;
    ctx.globalAlpha = 0.5;
    ctx.fillText(kanji, w / 2 - 16, h / 2 + 12);
    ctx.globalAlpha = 1;
    ctx.fillStyle = SCARLET;
    ctx.fillText(kanji, w / 2, h / 2);

    this.kanjiTexture.needsUpdate = true;
  }

  private drawMeta(vehicleId: string, owned: boolean): void {
    const key = `${vehicleId}|${owned}`;
    if (key === this.metaKey) {
      return;
    }
    this.metaKey = key;
    this.metaVehicleId = vehicleId;
    this.metaOwned = owned;

    const ctx = this.metaCanvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const vehicle = getVehicleDefinition(vehicleId);
    const tier = TIER_INFO[vehicle.economy.tier] ?? { num: 0, kanji: "車", label: "CAR" };
    const price = getVehiclePrice(vehicle);
    const w = this.metaCanvas.width;
    const h = this.metaCanvas.height;
    const body = '"Zen Kaku Gothic New", "Hiragino Sans", sans-serif';
    const ink = "#2a2320";

    ctx.clearRect(0, 0, w, h);
    // pinned washi spec-card (readable on the dim wall) with an ink frame
    ctx.fillStyle = "rgba(241,235,220,0.95)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = ink;
    ctx.fillRect(14, 14, w - 28, 12);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    // kicker
    ctx.fillStyle = "#6b6157";
    ctx.font = `700 42px ${body}`;
    ctx.fillText(`N°.0${tier.num} · 蔵 SELECT`, 44, 108);
    // tier
    ctx.fillStyle = ink;
    ctx.font = `800 104px ${body}`;
    ctx.fillText(`${tier.kanji} ${tier.label}`, 38, 232);
    // owned / price
    if (owned) {
      ctx.fillStyle = ink;
      ctx.font = `800 86px ${body}`;
      ctx.fillText("所 OWNED", 44, 364);
    } else {
      ctx.fillStyle = "#a9842f";
      ctx.font = `800 96px ${body}`;
      ctx.fillText(`金 ${price.toLocaleString("en-US")}`, 44, 366);
    }

    this.metaTexture.needsUpdate = true;
  }
}
