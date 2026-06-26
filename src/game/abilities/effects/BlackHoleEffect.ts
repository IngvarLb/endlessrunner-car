import type { EffectKey } from "../AbilityTypes";
import type { RunEffect } from "../RunEffect";
import type { RunEffectContext } from "../RunEffectContext";

const COINS_PER_LIFT = 10;

/**
 * 鬼 Schwarzes Loch — the world darkens to a deep violet and a hole opens: tap cars
 * (finger/mouse) to lift them up and out of your way; each one swallowed streams +10
 * coins onto your account. Active, tap-driven coin farming for the duration.
 */
export class BlackHoleEffect implements RunEffect {
  readonly key: EffectKey = "blackHole";
  readonly displayName = "Schwarzes Loch";

  start(ctx: RunEffectContext): void {
    ctx.scene.setBlackHole(true);
    ctx.traffic.setLiftMode(COINS_PER_LIFT);
  }

  update(): void {
    // Tapping is driven by pointer input (GameApp → RunScene.tapLift) for the duration.
  }

  end(ctx: RunEffectContext): void {
    ctx.scene.setBlackHole(false);
    ctx.traffic.setLiftMode(undefined);
  }
}
