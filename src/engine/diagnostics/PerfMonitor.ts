import type * as THREE from "three";

type ChromeMemory = {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
};

const sampleIntervalMs = 250;

/**
 * Lightweight on-screen diagnostics overlay.
 *
 * Shows real requestAnimationFrame FPS / frame time, JS heap (Chrome only) and
 * the live WebGL `renderer.info` counters. The geometry/texture counts are the
 * key signal for spotting a GPU-memory leak: they should stay flat over time,
 * not climb. True GPU/CPU utilisation is intentionally absent — browsers do not
 * expose it to JS; use the OS activity monitor for that.
 */
export class PerfMonitor {
  private enabled = false;
  private lastTimestamp = 0;
  private frames = 0;
  private accumulatedMs = 0;
  private worstFrameMs = 0;
  private peakGeometries = 0;
  private peakTextures = 0;

  constructor(
    private readonly element: HTMLElement,
    private readonly renderer: THREE.WebGLRenderer
  ) {}

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.element.hidden = !enabled;
    this.reset();
    if (!enabled) {
      this.peakGeometries = 0;
      this.peakTextures = 0;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Call once per active animation frame (before any render throttling). */
  frame(): void {
    if (!this.enabled) {
      return;
    }

    const now = performance.now();
    if (this.lastTimestamp > 0) {
      const delta = now - this.lastTimestamp;
      this.frames += 1;
      this.accumulatedMs += delta;
      this.worstFrameMs = Math.max(this.worstFrameMs, delta);
    }
    this.lastTimestamp = now;

    if (this.accumulatedMs >= sampleIntervalMs && this.frames > 0) {
      this.render();
      this.frames = 0;
      this.accumulatedMs = 0;
      this.worstFrameMs = 0;
    }
  }

  private render(): void {
    const fps = (this.frames / this.accumulatedMs) * 1000;
    const avgMs = this.accumulatedMs / this.frames;
    const info = this.renderer.info;

    this.peakGeometries = Math.max(this.peakGeometries, info.memory.geometries);
    this.peakTextures = Math.max(this.peakTextures, info.memory.textures);

    const memory = (performance as Performance & { memory?: ChromeMemory }).memory;
    const heap = memory ? `${Math.round(memory.usedJSHeapSize / 1048576)}MB` : "n/a";

    const triangles = info.render.triangles >= 1000
      ? `${(info.render.triangles / 1000).toFixed(0)}k`
      : `${info.render.triangles}`;

    this.element.textContent =
      `${fps.toFixed(0)} fps · ${avgMs.toFixed(1)}ms (max ${this.worstFrameMs.toFixed(0)})\n` +
      `geo ${info.memory.geometries} (peak ${this.peakGeometries}) · ` +
      `tex ${info.memory.textures} (peak ${this.peakTextures})\n` +
      `calls ${info.render.calls} · tri ${triangles} · heap ${heap}`;
  }

  private reset(): void {
    this.lastTimestamp = 0;
    this.frames = 0;
    this.accumulatedMs = 0;
    this.worstFrameMs = 0;
  }
}
