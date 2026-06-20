export type FrameCallback = (dt: number, elapsed: number) => void;

export class GameLoop {
  private readonly callbacks = new Set<FrameCallback>();
  private animationFrameId = 0;
  private lastTime = 0;
  private elapsed = 0;
  private running = false;
  private paused = false;

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (!this.running) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;
    this.running = false;
    this.paused = false;
    this.elapsed = 0;
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.lastTime = performance.now();
  }

  onFrame(callback: FrameCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  private readonly tick = (time: number): void => {
    if (!this.running) {
      return;
    }

    const rawDt = (time - this.lastTime) / 1000;
    const dt = Math.min(rawDt, 0.1);
    this.lastTime = time;

    if (!this.paused) {
      this.elapsed += dt;
      for (const callback of this.callbacks) {
        callback(dt, this.elapsed);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };
}
