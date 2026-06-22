import * as THREE from "three";

/**
 * Roadside "flyby" hint signs worked into the 3D world. A few posted signs sit
 * on the right shoulder, recycle with the rest of the decorations, and show the
 * active vehicle's ability kanji — flipping to a glowing "発動 / GO!" board when
 * the Main ability is charged. They are only a hint; the HUD ring is the exact
 * readout. See memory: charge-indicator-decision.
 */

export type AbilityHint = { kanji: string; paint: string; ready: boolean };

const SIGN_COUNT = 2;
const SIGN_SPACING = 60; // metres between signs (contentLoopLength / SIGN_COUNT)
const SIGN_START_Z = 96; // first sign ahead of the player
// Camera looks toward +z, so world +x is screen-left; negative x = screen-right shoulder.
const SIGN_X = -2.8; // right shoulder edge, in front of the roadside decorations

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
  private hint: AbilityHint = { kanji: "赤", paint: "#e23b2e", ready: false };

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
    const changed =
      hint.kanji !== this.hint.kanji || hint.paint !== this.hint.paint || hint.ready !== this.hint.ready;
    this.hint = { kanji: hint.kanji, paint: hint.paint, ready: hint.ready };
    if (changed) {
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
      new THREE.BoxGeometry(0.18, 3.2, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.9, metalness: 0 })
    );
    post.position.y = 1.6;
    group.add(post);

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("AbilitySignField: 2D canvas context unavailable");
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.center.set(0.5, 0.5);
    texture.repeat.x = -1; // compensate for the Y-180 board flip so text reads correctly

    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 2.3),
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

    const pad = 16;
    // Outer sumi border for hard edge definition against any background.
    drawRoundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 20);
    ctx.fillStyle = "#1a130b";
    ctx.fill();
    // Inner board face.
    const ip = pad + 9;
    drawRoundRect(ctx, ip, ip, w - ip * 2, h - ip * 2, 14);
    ctx.fillStyle = ready ? this.hint.paint : "#efe6d4"; // warm washi when idle
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = ready ? "#fff2e0" : this.hint.paint;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (ready) {
      ctx.shadowColor = "rgba(255,228,196,0.95)";
      ctx.shadowBlur = 26;
      ctx.fillStyle = "#fff7ee";
      ctx.font = '900 118px "Noto Sans JP", sans-serif';
      ctx.fillText("発動", w / 2, h * 0.42);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff7ee";
      ctx.font = '700 40px "Space Mono", monospace';
      ctx.fillText("GO!", w / 2, h * 0.78);
    } else {
      ctx.fillStyle = "rgba(40,30,20,0.55)";
      ctx.font = '700 30px "Noto Sans JP", sans-serif';
      ctx.fillText("能力", w / 2, h * 0.23);
      ctx.fillStyle = this.hint.paint;
      ctx.font = '900 150px "Noto Sans JP", sans-serif';
      ctx.fillText(this.hint.kanji, w / 2, h * 0.57);
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
