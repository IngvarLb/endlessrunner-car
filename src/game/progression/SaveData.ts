import type { QualityMode } from "../../app/GameConfig";

export type SaveData = {
  version: number;
  highScore: number;
  bestDistance: number;
  totalCoins: number;
  selectedVehicleId: string;
  unlockedVehicleIds: string[];
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
    quality: QualityMode;
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
  settings: {
    masterVolume: 0.85,
    musicVolume: 0.55,
    sfxVolume: 0.75,
    muted: false,
    quality: "medium",
    reducedMotion: false,
    showPerfHud: false
  }
};
