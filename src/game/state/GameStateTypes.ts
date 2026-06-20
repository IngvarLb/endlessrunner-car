export type GameState =
  | "boot"
  | "loading"
  | "menu"
  | "garage"
  | "countdown"
  | "running"
  | "paused"
  | "reviving"
  | "gameOver";

export type StateListener = (previous: GameState, next: GameState, reason?: string) => void;

export type Unsubscribe = () => void;
