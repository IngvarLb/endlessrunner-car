import type { LaneIndex } from "../../../app/GameConfig";
import type { EffectKey } from "../AbilityTypes";
import type { RunEffect } from "../RunEffect";
import type { RunEffectContext } from "../RunEffectContext";

const MIDDLE_LANE: LaneIndex = 0;
const SWERVE_AHEAD = 2; // swerve almost every middle-lane car ahead (close ones too — fast lerp clears them)

/**
 * 藍 Freie Bahn — NPCs pull out of the middle lane (and any straggler is knocked
 * harmlessly aside), while coins funnel into it: a clear, coin-lined lane to blast
 * down for the duration. Side lanes stay lethal, so you commit to the middle.
 */
export class HornClearEffect implements RunEffect {
  readonly key: EffectKey = "hornClear";
  readonly displayName = "Freie Bahn";

  start(ctx: RunEffectContext): void {
    ctx.traffic.setLaneShield(MIDDLE_LANE);
    ctx.coins.biasLane(MIDDLE_LANE);
    ctx.coins.pullToLane(MIDDLE_LANE); // coin row appears at once, synced with the cars parting
  }

  update(_dt: number, ctx: RunEffectContext): void {
    // Keep clearing — newly recycled/spawned cars can land in the middle lane.
    ctx.traffic.swerveOutOfLane(MIDDLE_LANE, SWERVE_AHEAD);
  }

  end(ctx: RunEffectContext): void {
    ctx.traffic.setLaneShield(undefined);
    ctx.coins.biasLane(undefined);
  }
}
