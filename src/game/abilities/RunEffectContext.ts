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
    /**
     * Restore cars to their normal lanes, keeping only those closer than
     * `minReactionSec` of reaction time on the sides (so traffic returns to normal
     * promptly without snapping a car unfairly into the player's path).
     */
    restoreLanes(minReactionSec: number): void;
    /** 将 Nachtjagd: ram any car for `coins` each (undefined to clear). */
    setRamMode(coins: number | undefined): void;
    /** 鬼 Schwarzes Loch: tapped cars are liftable for `coins` each (undefined to clear). */
    setLiftMode(coins: number | undefined): void;
  };
  scene: {
    /** 将 Nachtjagd: fade the world to night (and back). */
    setNight(on: boolean): void;
    /** 鬼 Schwarzes Loch: fade the world to a deep violet (and back). */
    setBlackHole(on: boolean): void;
    /** 龍 Überschall: supersonic atmosphere — wider FOV, speed lines, bright haze (and back). */
    setHyperspeed(on: boolean): void;
    /** A short camera punch on activation (e.g. 赤 Striker Boost kicking off). */
    kick(): void;
    /** 藍 Freie Bahn: emit an expanding horn shockwave ring from the car. */
    hornPulse(): void;
  };
  coins: {
    /** Funnel recycled coins into `lane` (or restore the default spread with undefined). */
    biasLane(lane: LaneIndex | undefined): void;
    /** Immediately move the coins ahead into `lane` (no recycle wait). */
    pullToLane(lane: LaneIndex): void;
    /** Re-spread the coins ahead back to the normal lane pattern. */
    redistribute(): void;
    /** Toggle the 桜 coin-rain field; density scales with mastery `level` (0–100). */
    rain(on: boolean, level: number): void;
  };
};
