import * as THREE from "three";

/**
 * Roadside "flyby" hint signs worked into the 3D world. A few posted signs sit
 * on the right shoulder, recycle with the rest of the decorations, and show the
 * active vehicle's ability kanji — flipping to a glowing "発動 / GO!" board when
 * the Main ability is charged. They are only a hint; the HUD ring is the exact
 * readout. See memory: charge-indicator-decision.
 */

export type AbilityHint = { kanji: string; paint: string; ready: boolean; meters: number };

const SIGN_COUNT = 2;
const SIGN_SPACING = 60; // metres between signs (contentLoopLength / SIGN_COUNT)
const SIGN_START_Z = 96; // first sign ahead of the player
// Camera looks toward +z, so world +x is screen-left; negative x = screen-right shoulder.
const SIGN_X = -2.9; // right shoulder; thin post keeps it from blocking the road

type SignRecord = {
  group: THREE.Group;
  board: THREE.Mesh;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
};

export class AbilitySignField {
  /** Sign roots to hand to the scene's decoration recycle/reset list. */
  readonly objects: THREE.Object3D[] = [];

  private readonly signs: SignRecord[] = [];
  private hint: AbilityHint = { kanji: "赤", paint: "#e23b2e", ready: false, meters: 0 };
  private lastDrawKey = "";

  constructor() {
    for (let i = 0; i < SIGN_COUNT; i += 1) {
      const record = this.createSign();
      record.group.position.set(SIGN_X, 0, SIGN_START_Z + i * SIGN_SPACING);
      record.group.rotation.y = Math.PI; // face the oncoming camera (-z)
      this.signs.push(record);
      this.objects.push(record.group);
    }
    this.redraw();
    // Re-draw once web fonts are ready so the kanji uses Noto Sans JP.
    document.fonts?.ready?.then(() => this.redraw()).catch(() => undefined);
  }

  setHint(hint: AbilityHint): void {
    this.hint = { kanji: hint.kanji, paint: hint.paint, ready: hint.ready, meters: hint.meters };
    // Redraw only when the displayed state changes (ready, or the metres bucket).
    const key = `${hint.kanji}|${hint.ready ? "go" : `m${Math.round(hint.meters / 5)}`}`;
    if (key !== this.lastDrawKey) {
      this.lastDrawKey = key;
      this.redraw();
    }
  }

  /** Gentle pulse on the board while the ability is ready. */
  update(elapsed: number): void {
    const pulse = this.hint.ready ? 1 + Math.sin(elapsed * 6) * 0.05 : 1;
    for (const sign of this.signs) {
      sign.board.scale.setScalar(pulse);
    }
  }

  reset(): void {
    this.hint = { ...this.hint, ready: false };
    this.redraw();
  }

  dispose(): void {
    for (const sign of this.signs) {
      sign.texture.dispose();
      (sign.board.material as THREE.Material).dispose();
      sign.board.geometry.dispose();
    }
  }

  private createSign(): SignRecord {
    const group = new THREE.Group();
    group.name = "ability_sign";

    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 3.0, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.9, metalness: 0 })
    );
    post.position.y = 1.5;
    group.add(post);

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("AbilitySignField: 2D canvas context unavailable");
    }

    // DoubleSide + the group's Y-180 rotation makes the camera see the front face,
    // so the texture reads correctly with no manual flip.
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;

    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.5),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
    );
    board.position.y = 2.95;
    group.add(board);

    return { group, board, canvas, ctx, texture };
  }

  private redraw(): void {
    for (const sign of this.signs) {
      this.drawSign(sign);
    }
  }

  private drawSign(sign: SignRecord): void {
    const { ctx, canvas, texture } = sign;
    const w = canvas.width;
    const h = canvas.height;
    const ready = this.hint.ready;
    ctx.clearRect(0, 0, w, h);

    const pad = 14;
    // Outer sumi border for a hard edge against any background.
    drawRoundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 22);
    ctx.fillStyle = "#1a130b";
    ctx.fill();
    // Inner board face: warm washi while charging, vehicle paint when ready.
    const ip = pad + 11;
    drawRoundRect(ctx, ip, ip, w - ip * 2, h - ip * 2, 14);
    ctx.fillStyle = ready ? this.hint.paint : "#efe6d4";
    ctx.fill();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (ready) {
      // Charged: bold "発動 / GO!" board in the vehicle paint.
      ctx.fillStyle = "#fff7ee";
      ctx.font = '900 96px "Noto Sans JP", sans-serif';
      ctx.fillText(this.hint.kanji, w / 2, h * 0.34);
      ctx.font = '900 66px "Noto Sans JP", sans-serif';
      ctx.fillText("発動", w / 2, h * 0.64);
      ctx.font = '400 40px "Anton", system-ui, sans-serif';
      ctx.fillText("GO!", w / 2, h * 0.85);
    } else {
      // Distance sign: ability kanji over the metres remaining ("NNN  M").
      ctx.fillStyle = this.hint.paint;
      ctx.font = '900 96px "Noto Sans JP", sans-serif';
      ctx.fillText(this.hint.kanji, w / 2, h * 0.31);
      const metres = Math.max(0, Math.round(this.hint.meters));
      ctx.fillStyle = "#1a130b";
      ctx.font = `400 ${metres >= 1000 ? 84 : 104}px "Anton", system-ui, sans-serif`;
      ctx.fillText(String(metres), w / 2, h * 0.63);
      ctx.font = '400 42px "Anton", system-ui, sans-serif';
      ctx.fillText("M", w / 2, h * 0.85);
    }

    texture.needsUpdate = true;
  }
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
