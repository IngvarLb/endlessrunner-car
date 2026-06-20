export type PowerUpType = "shield" | "magnet" | "multiplier";

export type PowerUpDefinition = {
  type: PowerUpType;
  duration: number;
  spawnWeight: number;
  color: string;
  icon: string;
};
