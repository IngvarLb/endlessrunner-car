import type { DifficultyMode, QualityMode } from "../../app/GameConfig";

/** Per-vehicle progression: meters drive the Passive mastery level, mainLevel the coin-bought Main. */
export type VehicleProgress = {
  /** Cumulative meters driven with this vehicle → mastery level (`floor(meters/10000)`, cap 100). */
  meters: number;
  /** Purchased upgrade level of this vehicle's Main ability (0–30). */
  mainLevel: number;
};

export type SaveData = {
  version: number;
  highScore: number;
  bestDistance: number;
  totalCoins: number;
  selectedVehicleId: string;
  unlockedVehicleIds: string[];
  /** Keyed by vehicleId. Missing entries default to `{ meters: 0, mainLevel: 0 }`. */
  vehicleProgress: Record<string, VehicleProgress>;
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
    quality: QualityMode;
    difficulty: DifficultyMode;
    reducedMotion: boolean;
    showPerfHud: boolean;
  };
};

export const DEFAULT_SAVE_DATA: SaveData = {
  version: 1,
  highScore: 0,
  bestDistance: 0,
  totalCoins: 0,
  selectedVehicleId: "sports-car",
  unlockedVehicleIds: ["sports-car", "drift-coupe"],
  vehicleProgress: {},
  settings: {
    masterVolume: 0.85,
    musicVolume: 0.55,
    sfxVolume: 0.75,
    muted: false,
    quality: "medium",
    difficulty: "medium",
    reducedMotion: false,
    showPerfHud: false
  }
};
