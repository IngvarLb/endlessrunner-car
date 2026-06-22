import type { EffectKey } from "../AbilityTypes";
import type { RunEffect } from "../RunEffect";
import type { RunEffectContext } from "../RunEffectContext";

/**
 * 赤 Striker Boost — boost forward for the duration; while boosting, the existing
 * traffic system rams NPCs in the path (destroys them) instead of failing.
 */
export class BoostRamEffect implements RunEffect {
  readonly key: EffectKey = "boostRam";
  readonly displayName = "Striker Boost";

  start(ctx: RunEffectContext, opts: { durationSec: number; level: number }): void {
    ctx.runner.boost(opts.durationSec);
  }

  update(): void {
    // Boost runs on its own timer; nothing to do per frame.
  }

  end(ctx: RunEffectContext): void {
    ctx.runner.clearBoost();
  }
}
