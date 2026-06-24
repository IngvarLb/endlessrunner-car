import type { EffectKey } from "../AbilityTypes";
import type { RunEffect } from "../RunEffect";
import type { RunEffectContext } from "../RunEffectContext";

/**
 * 桜 Blütenregen — for the duration, sakura-pink coins rain into the lanes ahead
 * (denser with mastery level). You grab them where you drive.
 */
export class CoinRainEffect implements RunEffect {
  readonly key: EffectKey = "coinRain";
  readonly displayName = "Blütenregen";

  start(ctx: RunEffectContext, opts: { durationSec: number; level: number }): void {
    ctx.coins.rain(true, opts.level);
  }

  update(): void {
    // The coin-rain system handles the field per frame.
  }

  end(ctx: RunEffectContext): void {
    ctx.coins.rain(false, 0);
  }
}
