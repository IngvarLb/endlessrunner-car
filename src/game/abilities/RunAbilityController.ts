import type { EffectKey, MainAbilityDef, PassiveAbilityDef } from "./AbilityTypes";
import { chargesFromOwnCoins, getMainAbility, getPassiveAbility } from "./AbilityCatalog";
import { ChargeMeter } from "./ChargeMeter";
import { masteryLevel } from "./MasteryService";
import { mainDuration } from "./UpgradeService";

/**
 * Orchestrates the active vehicle's abilities for a single run. Phase 0b is the
 * scaffold: it tracks meters (for mastery + run-end booking) and fills the
 * charge meter from coins/distance. Real effect modules and the activation
 * pipeline arrive in Phase 1/2 — `tryActivate` already returns the resolved
 * effect + duration so the HUD/activation wiring (0d) can build on it.
 */

/** Metres-equivalent of progress granted per collected coin (coins shortcut the sign). */
const COIN_METRES = 6;

export type ActivationResult = {
  effect: EffectKey;
  durationSec: number;
  level: number;
};

export type RunAbilityInit = {
  mainLevel: number;
  meters: number;
};

export class RunAbilityController {
  readonly vehicleId: string;

  private readonly main?: MainAbilityDef;
  private readonly passive?: PassiveAbilityDef;
  private readonly mainLevel: number;
  private readonly baseMeters: number;
  private readonly charge?: ChargeMeter;
  private readonly coinCharges: boolean;

  private runMeters = 0;
  private trackedLevel: number;
  private pendingLevelUps = 0;

  constructor(vehicleId: string, init: RunAbilityInit) {
    this.vehicleId = vehicleId;
    this.main = getMainAbility(vehicleId);
    this.passive = getPassiveAbility(vehicleId);
    this.mainLevel = Math.max(0, init.mainLevel);
    this.baseMeters = Math.max(0, init.meters);
    this.coinCharges = chargesFromOwnCoins(vehicleId);
    this.charge = this.main ? new ChargeMeter(this.main.chargeCost) : undefined;
    this.trackedLevel = masteryLevel(this.baseMeters);
  }

  get mainAbility(): MainAbilityDef | undefined {
    return this.main;
  }

  get passiveAbility(): PassiveAbilityDef | undefined {
    return this.passive;
  }

  /** Meters driven this run (booked to the mastery track at run end). */
  get metersThisRun(): number {
    return this.runMeters;
  }

  /** Cumulative meters including this run — drives the live mastery level. */
  get totalMeters(): number {
    return this.baseMeters + this.runMeters;
  }

  /** Live mastery level (0–100) including this run's progress. */
  masteryLevel(): number {
    return masteryLevel(this.totalMeters);
  }

  /** Feed collected coins into the charge meter (loop-protected mains ignore their own coins). */
  onCoinCollected(amount: number): void {
    if (!this.charge || !this.coinCharges || !Number.isFinite(amount) || amount <= 0) {
      return;
    }
    this.charge.add(amount * COIN_METRES);
  }

  /** Sync to the run's cumulative distance (monotonic). Drives meters + distance charge + level-ups. */
  syncDistance(cumulativeMeters: number): void {
    if (!Number.isFinite(cumulativeMeters) || cumulativeMeters <= this.runMeters) {
      return;
    }
    const delta = cumulativeMeters - this.runMeters;
    this.runMeters = cumulativeMeters;
    this.charge?.add(delta); // distance charges 1:1 (metres-equivalent)

    const level = this.masteryLevel();
    if (level > this.trackedLevel) {
      this.pendingLevelUps += level - this.trackedLevel;
      this.trackedLevel = level;
    }
  }

  /** Charge meter fill ratio [0,1] for the HUD bar. */
  chargeRatio(): number {
    return this.charge?.ratio() ?? 0;
  }

  isReady(): boolean {
    return this.charge?.isReady() ?? false;
  }

  /** Estimated metres until the Main is charged (0 when ready) — drives the roadside sign. */
  metersUntilReady(): number {
    return Math.ceil(this.charge?.remaining() ?? 0);
  }

  /** Consume a full charge and resolve what to activate; undefined when not ready / no main. */
  tryActivate(): ActivationResult | undefined {
    if (!this.main || !this.charge || !this.charge.consume()) {
      return undefined;
    }
    return {
      effect: this.main.effect,
      durationSec: mainDuration(this.main, this.mainLevel),
      level: this.mainLevel
    };
  }

  /** Drain mastery level-ups gained this frame/run (for a one-shot HUD toast). */
  consumeLevelUp(): number {
    const count = this.pendingLevelUps;
    this.pendingLevelUps = 0;
    return count;
  }
}
