import type { ChargeTier } from "./AbilityTypes";

/**
 * Temple-Run-style charge meter for the Main ability. Fills primarily from
 * collected coins (+ a small distance trickle), is "ready" when full, and is
 * consumed on activation. Costs are relative starting values (tunable).
 */
export const CHARGE_TIER_COST: Record<ChargeTier, number> = {
  low: 80,
  midLow: 120,
  mid: 42, // 桜 (distance-charged, loop-protected) — halved twice so it reaches quickly
  midHigh: 125, // halved for 狐 Kitsune; currently only 狐 uses midHigh (鬼 is Phase 2, retune then)
  high: 190 // 将 Nachtjagd (only live user of high; 龍 is Phase 2, retune then)
};

export class ChargeMeter {
  private charge = 0;
  private readonly capacity: number;

  constructor(tier: ChargeTier) {
    this.capacity = Math.max(1, CHARGE_TIER_COST[tier]);
  }

  /** Add charge (ignores non-positive / non-finite amounts). Clamps at capacity. */
  add(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }
    this.charge = Math.min(this.capacity, this.charge + amount);
  }

  /** Fill ratio [0,1] for the HUD bar. */
  ratio(): number {
    return Math.min(1, this.charge / this.capacity);
  }

  isReady(): boolean {
    return this.charge >= this.capacity;
  }

  /** Spend a full charge. Returns false (and keeps the charge) when not yet ready. */
  consume(): boolean {
    if (!this.isReady()) {
      return false;
    }
    this.charge = 0;
    return true;
  }

  reset(): void {
    this.charge = 0;
  }
}
