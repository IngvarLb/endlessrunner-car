import type { EffectKey } from "./AbilityTypes";
import type { RunEffectContext } from "./RunEffectContext";
import { BoostRamEffect } from "./effects/BoostRamEffect";
import { HornClearEffect } from "./effects/HornClearEffect";
import { CoinRainEffect } from "./effects/CoinRainEffect";
import { TitanEffect } from "./effects/TitanEffect";
import { TurretEffect } from "./effects/TurretEffect";
import { NightHuntEffect } from "./effects/NightHuntEffect";
import { BlackHoleEffect } from "./effects/BlackHoleEffect";
import { HyperspeedEffect } from "./effects/HyperspeedEffect";

/** A run-time ability effect. One instance per activation; start → update* → end. */
export interface RunEffect {
  readonly key: EffectKey;
  readonly displayName: string;
  start(ctx: RunEffectContext, opts: { durationSec: number; level: number }): void;
  update(dt: number, ctx: RunEffectContext): void;
  end(ctx: RunEffectContext): void;
}

/**
 * Build the effect for an EffectKey, or `undefined` if not implemented yet.
 * Unimplemented effects make activation a no-op (the charge is kept), so a car
 * never wastes its charge on a missing effect.
 */
export function createEffect(key: EffectKey): RunEffect | undefined {
  switch (key) {
    case "boostRam":
      return new BoostRamEffect();
    case "hornClear":
      return new HornClearEffect();
    case "coinRain":
      return new CoinRainEffect();
    case "titan":
      return new TitanEffect();
    case "turret":
      return new TurretEffect();
    case "nightHunt":
      return new NightHuntEffect();
    case "blackHole":
      return new BlackHoleEffect();
    case "hyperspeed":
      return new HyperspeedEffect();
  }
}
