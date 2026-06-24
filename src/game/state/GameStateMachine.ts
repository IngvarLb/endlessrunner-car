import type { GameEvents } from "../../app/GameEvents";
import type { GameState, StateListener, Unsubscribe } from "./GameStateTypes";

const allowedTransitions: Record<GameState, GameState[]> = {
  boot: ["loading"],
  loading: ["menu"],
  menu: ["garage", "countdown"],
  garage: ["menu", "countdown"],
  countdown: ["running", "menu"],
  running: ["paused", "gameOver", "reviving"],
  paused: ["running", "countdown", "menu", "gameOver"],
  reviving: ["running", "gameOver"],
  gameOver: ["menu", "countdown"]
};

export class GameStateMachine {
  private state: GameState = "boot";
  private readonly listeners = new Set<StateListener>();

  constructor(private readonly events: GameEvents) {}

  getState(): GameState {
    return this.state;
  }

  canTransition(next: GameState): boolean {
    return this.state === next || allowedTransitions[this.state].includes(next);
  }

  transition(next: GameState, reason?: string): void {
    if (this.state === next) {
      return;
    }

    if (!this.canTransition(next)) {
      throw new Error(`Invalid state transition: ${this.state} -> ${next}`);
    }

    const previous = this.state;
    this.state = next;

    for (const listener of this.listeners) {
      listener(previous, next, reason);
    }

    this.events.emit("state:changed", { previous, next, reason });
  }

  onChange(listener: StateListener): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
