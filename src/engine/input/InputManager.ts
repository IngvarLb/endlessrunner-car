import type { GameConfig } from "../../app/GameConfig";
import type { InputAction, InputActionEvent } from "./InputActions";

type TouchPoint = {
  x: number;
  y: number;
  time: number;
};

export class InputManager {
  private readonly bufferedActions: InputActionEvent[] = [];
  private touchStart?: TouchPoint;
  private lastTapAt = 0;
  private enabled = true;
  // Braking is a CONTINUOUS held action (not a one-shot buffered one): S / ArrowDown held,
  // or a touch swiped down and held. `braking` mirrors the live held state.
  private braking = false;
  private brakingTouch = false; // the current touch became a downward brake-hold

  constructor(
    private readonly target: Window,
    private readonly config: GameConfig["input"]
  ) {}

  bind(): void {
    this.target.addEventListener("keydown", this.handleKeyDown);
    this.target.addEventListener("keyup", this.handleKeyUp);
    this.target.addEventListener("touchstart", this.handleTouchStart, { passive: true });
    this.target.addEventListener("touchmove", this.handleTouchMove, { passive: false });
    this.target.addEventListener("touchend", this.handleTouchEnd, { passive: false });
  }

  unbind(): void {
    this.target.removeEventListener("keydown", this.handleKeyDown);
    this.target.removeEventListener("keyup", this.handleKeyUp);
    this.target.removeEventListener("touchstart", this.handleTouchStart);
    this.target.removeEventListener("touchmove", this.handleTouchMove);
    this.target.removeEventListener("touchend", this.handleTouchEnd);
    this.bufferedActions.length = 0;
    this.braking = false;
    this.brakingTouch = false;
  }

  /** True while the brake is held (S / ArrowDown, or a touch swiped down and held). */
  isBraking(): boolean {
    return this.enabled && this.braking;
  }

  update(): void {
    const now = performance.now();
    for (let index = this.bufferedActions.length - 1; index >= 0; index -= 1) {
      if (this.bufferedActions[index].expiresAt < now) {
        this.bufferedActions.splice(index, 1);
      }
    }
  }

  consumeAction(action: InputAction): boolean {
    const index = this.bufferedActions.findIndex((event) => event.action === action);
    if (index === -1) {
      return false;
    }

    this.bufferedActions.splice(index, 1);
    return true;
  }

  getBufferedActions(): InputActionEvent[] {
    return [...this.bufferedActions];
  }

  clearBuffer(): void {
    this.bufferedActions.length = 0;
    this.braking = false;
    this.brakingTouch = false;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.bufferedActions.length = 0;
      this.braking = false;
      this.brakingTouch = false;
    }
  }

  private isBrakeKey(event: KeyboardEvent): boolean {
    return event.key === "ArrowDown" || event.key.toLowerCase() === "s";
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.enabled || !this.config.keyboardEnabled || this.isTypingTarget(event.target)) {
      return;
    }

    // Brake (S / ArrowDown): a held action — set the state and keep it while the key repeats.
    if (this.isBrakeKey(event)) {
      this.braking = true;
      event.preventDefault();
      return;
    }

    if (event.repeat) {
      return;
    }

    const action = this.mapKey(event);
    if (!action) {
      return;
    }

    if (action !== "confirm") {
      event.preventDefault();
    }

    this.bufferAction(action, "keyboard");
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    if (this.isBrakeKey(event)) {
      this.braking = false;
    }
  };

  private readonly handleTouchStart = (event: TouchEvent): void => {
    if (!this.enabled || !this.config.touchEnabled || event.changedTouches.length === 0) {
      return;
    }

    const touch = event.changedTouches[0];
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now()
    };
    this.brakingTouch = false;
  };

  private readonly handleTouchMove = (event: TouchEvent): void => {
    if (!this.enabled || !this.config.touchEnabled || !this.touchStart || event.changedTouches.length === 0) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaY = touch.clientY - this.touchStart.y;
    const deltaX = touch.clientX - this.touchStart.x;
    // A downward, predominantly-vertical drag past the threshold engages the brake; holding
    // the finger down keeps it engaged (release = touchend = brake off).
    if (!this.brakingTouch && deltaY > this.config.swipeThresholdPx && Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
      this.brakingTouch = true;
    }
    if (this.brakingTouch) {
      this.braking = true;
      event.preventDefault(); // keep the brake-drag from scrolling the page
    }
  };

  private readonly handleTouchEnd = (event: TouchEvent): void => {
    if (this.brakingTouch) {
      // The touch was a brake-hold — release the brake and don't also fire a swipe action.
      this.braking = false;
      this.brakingTouch = false;
      this.touchStart = undefined;
      return;
    }

    if (!this.enabled || !this.config.touchEnabled || !this.touchStart || event.changedTouches.length === 0) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const threshold = this.config.swipeThresholdPx;

    if (absX < threshold && absY < threshold) {
      // A tap: a quick second tap activates the Main ability (double-tap to activate).
      const now = performance.now();
      if (now - this.lastTapAt < 360) {
        this.bufferAction("activate", "touch");
        this.lastTapAt = 0;
      } else {
        this.lastTapAt = now;
      }
      this.touchStart = undefined;
      return;
    }

    event.preventDefault();

    if (absX > absY) {
      this.bufferAction(deltaX < 0 ? "moveLeft" : "moveRight", "touch");
    } else if (deltaY < 0) {
      this.bufferAction("boost", "touch");
    }

    this.touchStart = undefined;
  };

  private mapKey(event: KeyboardEvent): InputAction | undefined {
    const key = event.key;
    const lower = key.toLowerCase();

    if (key === "ArrowLeft" || lower === "a") {
      return "moveLeft";
    }

    if (key === "ArrowRight" || lower === "d") {
      return "moveRight";
    }

    if (key === "ArrowUp" || lower === "w") {
      return "activate";
    }

    if (key === " " || key === "Escape") {
      return "pause";
    }

    if (key === "Enter") {
      return "confirm";
    }

    return undefined;
  }

  private bufferAction(action: InputAction, source: InputActionEvent["source"]): void {
    const now = performance.now();
    this.bufferedActions.push({
      action,
      source,
      performedAt: now,
      expiresAt: now + this.config.inputBufferMs
    });
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const tagName = target.tagName.toLowerCase();
    return tagName === "input" || tagName === "textarea" || target.isContentEditable;
  }
}
