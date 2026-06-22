import type { ChargeTier } from "./AbilityTypes";

/**
 * Charge meter for the Main ability, denominated in **metres-equivalent** so the
 * roadside distance sign can read straight off it ("noch NNN m"). Distance adds
 * 1:1; collected coins add a fixed metres-bonus (see RunAbilityController), so
 * coins make the sign count down faster. Ready when full. Values are tunable.
 */
export const CHARGE_TIER_COST: Record<ChargeTier, number> = {
  low: 400,
  midLow: 550,
  mid: 700,
  midHigh: 950,
  high: 1300
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

  /** Metres-equivalent still needed until ready (0 when full). */
  remaining(): number {
    return Math.max(0, this.capacity - this.charge);
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
