export type InputAction =
  | "moveLeft"
  | "moveRight"
  | "boost"
  | "activate"
  | "turnLeft"
  | "turnRight"
  | "pause"
  | "confirm"
  | "cancel";

export type InputActionEvent = {
  action: InputAction;
  performedAt: number;
  expiresAt: number;
  source: "keyboard" | "touch";
};
