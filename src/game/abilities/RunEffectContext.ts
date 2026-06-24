/**
 * Bridge between ability effects and the run-time systems. Effects only ever
 * touch the run through this surface, so they stay engine-agnostic and the
 * RunScene decides how each capability is fulfilled. Grown per ability as new
 * effects land (traffic clear, coin rain, player scale, camera/scene VFX, …).
 */
import type { LaneIndex } from "../../app/GameConfig";

export type RunEffectContext = {
  runner: {
    /** Boost for `durationSec`; while boosting, traffic in the path is rammed through. */
    boost(durationSec: number): void;
    /** End the boost immediately. */
    clearBoost(): void;
  };
  player: {
    /** 狐 Titan: grow over 3 lanes, become indestructible, collect every lane. */
    setTitan(on: boolean): void;
  };
  turret: {
    /** 狐 Geschützturm: deploy/retract the roof turret that shoots nearby cars. */
    setActive(on: boolean): void;
  };
  traffic: {
    /** Swerve cars out of `lane` once they are at least `minAheadZ` ahead. */
    swerveOutOfLane(lane: LaneIndex, minAheadZ: number): void;
    /** Cars in `lane` are knocked aside instead of failing (undefined to clear). */
    setLaneShield(lane: LaneIndex | undefined): void;
  };
  coins: {
    /** Funnel recycled coins into `lane` (or restore the default spread with undefined). */
    biasLane(lane: LaneIndex | undefined): void;
    /** Immediately move the coins ahead into `lane` (no recycle wait). */
    pullToLane(lane: LaneIndex): void;
    /** Toggle the 桜 coin-rain field; density scales with mastery `level` (0–100). */
    rain(on: boolean, level: number): void;
  };
};
