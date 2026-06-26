import type { EffectKey } from "../AbilityTypes";
import type { RunEffect } from "../RunEffect";
import type { RunEffectContext } from "../RunEffectContext";

const COINS_PER_RAM = 10;

/**
 * 将 Nachtjagd — the world falls to night and traffic becomes prey: ram any car
 * (any lane, side hits too) to destroy it for +10 coins, with no risk for the
 * duration. The unleashed, danger-free version of the 将 night.
 */
export class NightHuntEffect implements RunEffect {
  readonly key: EffectKey = "nightHunt";
  readonly displayName = "Nachtjagd";

  start(ctx: RunEffectContext): void {
    ctx.scene.setNight(true);
    ctx.traffic.setRamMode(COINS_PER_RAM);
  }

  update(): void {
    // Night + ram mode stay on for the duration; no per-frame work.
  }

  end(ctx: RunEffectContext): void {
    ctx.scene.setNight(false);
    ctx.traffic.setRamMode(undefined);
  }
}
