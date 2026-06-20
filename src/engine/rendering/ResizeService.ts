export type ResizeCallback = (width: number, height: number) => void;

export class ResizeService {
  private observer?: ResizeObserver;

  constructor(
    private readonly root: HTMLElement,
    private readonly callback: ResizeCallback
  ) {}

  bind(): void {
    this.observer = new ResizeObserver(() => this.emitSize());
    this.observer.observe(this.root);
    this.emitSize();
  }

  unbind(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  private emitSize(): void {
    const rect = this.root.getBoundingClientRect();
    this.callback(Math.max(1, rect.width), Math.max(1, rect.height));
  }
}
