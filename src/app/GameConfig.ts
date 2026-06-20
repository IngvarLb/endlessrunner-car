export type Vec3Like = {
  x: number;
  y: number;
  z: number;
};

export type LaneIndex = -1 | 0 | 1;
export type TurnDirection = "left" | "right";

export type SegmentKind =
  | "straight"
  | "turnLeft"
  | "turnRight"
  | "bridge"
  | "market"
  | "forest"
  | "castle"
  | "fire";

export type QualityMode = "low" | "medium" | "high";

export type GameConfig = {
  seed?: number;
  quality: QualityMode;
  reducedMotion: boolean;
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
  };
  input: {
    touchEnabled: boolean;
    keyboardEnabled: boolean;
    swipeThresholdPx: number;
    inputBufferMs: number;
  };
};

export const DEFAULT_GAME_CONFIG: GameConfig = {
  quality: "medium",
  reducedMotion: false,
  audio: {
    masterVolume: 0.8,
    musicVolume: 0.55,
    sfxVolume: 0.75,
    muted: false
  },
  input: {
    touchEnabled: true,
    keyboardEnabled: true,
    swipeThresholdPx: 36,
    inputBufferMs: 140
  }
};
