import type { EffectKey } from "../AbilityTypes";
import type { RunEffect } from "../RunEffect";
import type { RunEffectContext } from "../RunEffectContext";

/**
 * 狐 Geschützturm — deploy a roof turret for the duration; it swivels to the
 * nearest car and streams tracer rounds. Each car shot down pays +10 coins.
 */
export class TurretEffect implements RunEffect {
  readonly key: EffectKey = "turret";
  readonly displayName = "Geschützturm";

  start(ctx: RunEffectContext): void {
    ctx.turret.setActive(true);
  }

  update(): void {
    // The turret system handles aiming + firing per frame.
  }

  end(ctx: RunEffectContext): void {
    ctx.turret.setActive(false);
  }
}
