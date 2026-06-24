import type { EffectKey } from "../AbilityTypes";
import type { RunEffect } from "../RunEffect";
import type { RunEffectContext } from "../RunEffectContext";

/**
 * 狐 Titan — the car grows over all three lanes, becomes indestructible (rams
 * traffic instead of failing) and vacuums coins from every lane for the duration.
 */
export class TitanEffect implements RunEffect {
  readonly key: EffectKey = "titan";
  readonly displayName = "Titan";

  start(ctx: RunEffectContext): void {
    ctx.player.setTitan(true);
  }

  update(): void {
    // Titan state holds for the duration; nothing per frame.
  }

  end(ctx: RunEffectContext): void {
    ctx.player.setTitan(false);
  }
}
