import type { LaneIndex } from "../../../app/GameConfig";
import type { EffectKey } from "../AbilityTypes";
import type { RunEffect } from "../RunEffect";
import type { RunEffectContext } from "../RunEffectContext";

const LEFT_LANE: LaneIndex = -1;
const SWERVE_AHEAD = 2; // clear the left lane aggressively — the road parts before the dragon
const RESTORE_REACTION_SEC = 1.3; // on end, snap traffic back beyond ~1.3 s of reaction time

/**
 * 龍 Überschall — the dragon goes supersonic: a long forward boost (you ram clean
 * through anything in the path) while NPCs flee the left lane and coins funnel into
 * it, so the world parts before you. The camera punches its FOV out and speed lines
 * streak past for the warp-speed rush. End restores traffic, coins, camera and sky.
 */
export class HyperspeedEffect implements RunEffect {
  readonly key: EffectKey = "hyperspeed";
  readonly displayName = "Überschall";

  start(ctx: RunEffectContext, opts: { durationSec: number; level: number }): void {
    ctx.runner.boost(opts.durationSec); // fast + ram-through for the whole duration
    ctx.traffic.setLaneShield(LEFT_LANE); // any straggler in the left lane is knocked harmlessly aside
    ctx.coins.biasLane(LEFT_LANE);
    ctx.coins.pullToLane(LEFT_LANE); // coin row in the open lane appears at once
    ctx.scene.setHyperspeed(true);
  }

  update(_dt: number, ctx: RunEffectContext): void {
    // Keep clearing — newly recycled/spawned cars can land in the left lane.
    ctx.traffic.swerveOutOfLane(LEFT_LANE, SWERVE_AHEAD);
  }

  end(ctx: RunEffectContext): void {
    ctx.runner.clearBoost();
    ctx.traffic.setLaneShield(undefined);
    ctx.coins.biasLane(undefined);
    ctx.traffic.restoreLanes(RESTORE_REACTION_SEC);
    ctx.coins.redistribute();
    ctx.scene.setHyperspeed(false);
  }
}
