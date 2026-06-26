import type { EffectKey, MainAbilityDef, PassiveAbilityDef } from "./AbilityTypes";
import { chargesFromOwnCoins, getMainAbility, getPassiveAbility } from "./AbilityCatalog";
import { ChargeMeter } from "./ChargeMeter";
import { masteryLevel, passiveValue } from "./MasteryService";
import { mainDuration } from "./UpgradeService";
import { createEffect, type RunEffect } from "./RunEffect";
import type { RunEffectContext } from "./RunEffectContext";

/**
 * Orchestrates the active vehicle's abilities for a single run. Phase 0b is the
 * scaffold: it tracks meters (for mastery + run-end booking) and fills the
 * charge meter from coins/distance. Real effect modules and the activation
 * pipeline arrive in Phase 1/2 — `tryActivate` already returns the resolved
 * effect + duration so the HUD/activation wiring (0d) can build on it.
 */

/** Charge gained per collected coin (1:1 with the coin-cost charge tiers). */
const CHARGE_PER_COIN = 1;
/** Small charge trickle per meter — the only source for loop-protected mains. */
const CHARGE_PER_METER = 0.05;

export type RunAbilityInit = {
  mainLevel: number;
  meters: number;
};

export type ActiveEffectState = {
  effect: EffectKey;
  name: string;
  remaining: number;
  durationSec: number;
};

/** What a weak fail (lane-edge mistake) does, decided by the vehicle's passive. */
export type WeakFailOutcome = { type: "absorbed" } | { type: "coins"; amount: number } | { type: "normal" };

/**
 * What a fatal car hit does. `survived` keeps the run going; `pursuitSec`, if set,
 * opens a police pursuit for that many seconds (将 Draufgänger): you survive the
 * crash but must drive clean to shake them.
 */
export type FatalOutcome = { survived: boolean; pursuitSec?: number };

/** Generic HUD view of a recharging passive (赤 buffer, 藍 high-beam, 狐 extra life). */
export type PassiveState = { kanji: string; name: string; ready: boolean; rechargeRatio: number };

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

  private activeEffect?: RunEffect;
  private effectRemaining = 0;
  private effectDuration = 0;

  // 狐 Zweites Leben (secondLife passive): an extra life that auto-saves a fatal
  // hit and recharges over distance.
  private readonly hasSecondLife: boolean;
  private extraLives = 0;
  private metersSinceLife = 0;

  // 赤 Knautschzone (crumpleZone): +1 weak-fail buffer that recharges over distance.
  private readonly hasCrumple: boolean;
  private crumpleBuffer = 0;
  private crumpleMeters = 0;

  // 将 Draufgänger (daredevil): survive a car hit, but the police give chase — a
  // mistake during the pursuit ends the run. Pursuit length drops with mastery.
  private readonly hasDaredevil: boolean;

  // 鬼 Anzapfen (siphon): while the police are right behind you, nearby cars drip coins.
  private readonly hasSiphon: boolean;

  // 藍 Lichthupe (highBeam): makes the front car give way; recharges over distance.
  private readonly hasHighBeam: boolean;
  private highBeamReady = false;
  private highBeamMeters = 0;

  constructor(vehicleId: string, init: RunAbilityInit) {
    this.vehicleId = vehicleId;
    this.main = getMainAbility(vehicleId);
    this.passive = getPassiveAbility(vehicleId);
    this.mainLevel = Math.max(0, init.mainLevel);
    this.baseMeters = Math.max(0, init.meters);
    this.coinCharges = chargesFromOwnCoins(vehicleId);
    this.charge = this.main ? new ChargeMeter(this.main.chargeCost) : undefined;
    this.trackedLevel = masteryLevel(this.baseMeters);
    this.hasSecondLife = this.passive?.effect === "secondLife";
    this.extraLives = this.hasSecondLife ? 1 : 0; // start each run with the extra life ready
    this.hasCrumple = this.passive?.effect === "crumpleZone";
    this.crumpleBuffer = this.hasCrumple ? 1 : 0;
    this.hasHighBeam = this.passive?.effect === "highBeam";
    this.highBeamReady = this.hasHighBeam;
    this.hasDaredevil = this.passive?.effect === "daredevil";
    this.hasSiphon = this.passive?.effect === "siphon";
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
    // No recharge while a Main is running — it only refills after the effect ends.
    if (this.activeEffect || !this.charge || !this.coinCharges || !Number.isFinite(amount) || amount <= 0) {
      return;
    }
    this.charge.add(amount * CHARGE_PER_COIN);
  }

  /** Sync to the run's cumulative distance (monotonic). Drives meters + distance charge + level-ups. */
  syncDistance(cumulativeMeters: number): void {
    if (!Number.isFinite(cumulativeMeters) || cumulativeMeters <= this.runMeters) {
      return;
    }
    const delta = cumulativeMeters - this.runMeters;
    this.runMeters = cumulativeMeters;
    if (!this.activeEffect) {
      this.charge?.add(delta * CHARGE_PER_METER); // no recharge while an effect runs
    }

    // 狐 extra life recharges over distance (2000 m → 1000 m by mastery level).
    if (this.hasSecondLife && this.passive && this.extraLives < 1) {
      this.metersSinceLife += delta;
      if (this.metersSinceLife >= passiveValue(this.passive, this.masteryLevel())) {
        this.extraLives = 1;
        this.metersSinceLife = 0;
      }
    }
    // 赤 crumple-zone buffer recharges over distance (600 m → 300 m).
    if (this.hasCrumple && this.passive && this.crumpleBuffer < 1) {
      this.crumpleMeters += delta;
      if (this.crumpleMeters >= passiveValue(this.passive, this.masteryLevel())) {
        this.crumpleBuffer = 1;
        this.crumpleMeters = 0;
      }
    }
    // 藍 high-beam recharges over distance (1200 m → 600 m).
    if (this.hasHighBeam && this.passive && !this.highBeamReady) {
      this.highBeamMeters += delta;
      if (this.highBeamMeters >= passiveValue(this.passive, this.masteryLevel())) {
        this.highBeamReady = true;
        this.highBeamMeters = 0;
      }
    }

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

  isEffectActive(): boolean {
    return this.activeEffect !== undefined;
  }

  /** State of the running effect for the HUD chip (undefined when none). */
  activeEffectState(): ActiveEffectState | undefined {
    if (!this.activeEffect) {
      return undefined;
    }
    return {
      effect: this.activeEffect.key,
      name: this.activeEffect.displayName,
      remaining: this.effectRemaining,
      durationSec: this.effectDuration
    };
  }

  /**
   * Try to fire the Main: needs a charged meter, no effect already running, and
   * an implemented effect. Consumes the charge and starts the effect. Returns
   * true on activation. Charge is kept when the effect isn't implemented yet.
   */
  tryActivate(ctx: RunEffectContext): boolean {
    if (!this.main || !this.charge || this.activeEffect || !this.charge.isReady()) {
      return false;
    }
    const effect = createEffect(this.main.effect);
    if (!effect) {
      return false;
    }
    this.charge.consume();
    const durationSec = mainDuration(this.main, this.mainLevel);
    effect.start(ctx, { durationSec, level: this.mainLevel });
    this.activeEffect = effect;
    this.effectRemaining = durationSec;
    this.effectDuration = durationSec;
    return true;
  }

  /** Advance the active effect; ends it when its duration elapses. */
  update(dt: number, ctx: RunEffectContext): void {
    if (!this.activeEffect) {
      return;
    }
    this.effectRemaining -= dt;
    if (this.effectRemaining <= 0) {
      this.activeEffect.end(ctx);
      this.activeEffect = undefined;
      this.effectRemaining = 0;
      this.effectDuration = 0;
      return;
    }
    this.activeEffect.update(dt, ctx);
  }

  /**
   * 鬼 Anzapfen: coins per car per second + how many cars drip at once (mastery-tiered),
   * or undefined if the vehicle isn't 鬼. Only pays out while the police are behind you.
   */
  siphonParams(): { coinsPerCar: number; cars: number } | undefined {
    if (!this.hasSiphon || !this.passive) {
      return undefined;
    }
    const level = this.masteryLevel();
    const coinsPerCar = Math.max(1, Math.round(passiveValue(this.passive, level)));
    const cars = level >= 100 ? 4 : level >= 67 ? 3 : level >= 34 ? 2 : 1;
    return { coinsPerCar, cars };
  }

  /** Whether a 狐 extra life is currently available. */
  hasExtraLife(): boolean {
    return this.extraLives > 0;
  }

  /**
   * A weak fail (lane-edge mistake) happened. The passive decides: 赤 absorbs it
   * with a buffer, 桜 turns it into a coin penalty (no police), else it's normal.
   */
  onWeakFail(): WeakFailOutcome {
    if (this.hasCrumple && this.crumpleBuffer > 0) {
      this.crumpleBuffer -= 1;
      this.crumpleMeters = 0;
      return { type: "absorbed" };
    }
    if (this.passive?.effect === "piggyBank") {
      return { type: "coins", amount: Math.max(0, Math.round(passiveValue(this.passive, this.masteryLevel()))) };
    }
    return { type: "normal" };
  }

  /** 藍 Lichthupe: when closing on a car, returns true (and starts the cooldown) if it should give way. */
  onApproachCar(): boolean {
    if (!this.hasHighBeam || !this.highBeamReady) {
      return false;
    }
    this.highBeamReady = false;
    this.highBeamMeters = 0;
    return true;
  }

  /**
   * Unified recharge state for the bottom-left HUD indicator. Returns undefined
   * for vehicles whose passive doesn't recharge over distance (e.g. 桜 Sparbüchse).
   */
  passiveState(): PassiveState | undefined {
    if (!this.passive) {
      return undefined;
    }
    const need = passiveValue(this.passive, this.masteryLevel());
    const ratio = (meters: number): number => (need > 0 ? Math.min(1, meters / need) : 1);
    const view = (ready: boolean, rechargeRatio: number): PassiveState => ({
      kanji: this.passive!.kanji,
      name: this.passive!.name,
      ready,
      rechargeRatio
    });
    if (this.hasCrumple) {
      return view(this.crumpleBuffer > 0, this.crumpleBuffer > 0 ? 1 : ratio(this.crumpleMeters));
    }
    if (this.hasHighBeam) {
      return view(this.highBeamReady, this.highBeamReady ? 1 : ratio(this.highBeamMeters));
    }
    if (this.hasSecondLife) {
      return view(this.extraLives > 0, this.extraLives > 0 ? 1 : ratio(this.metersSinceLife));
    }
    return undefined;
  }

  /**
   * A fatal car hit happened (`pursued` = a 将 police chase is already on). 狐 spends
   * an extra life to survive; 将 survives the crash but opens a pursuit (unless already
   * being chased — then it's caught). Otherwise it's game over.
   */
  onFatalHit(pursued: boolean, side: boolean): FatalOutcome {
    if (this.extraLives > 0) {
      this.extraLives -= 1;
      this.metersSinceLife = 0;
      return { survived: true };
    }
    // 将 Draufgänger only survives SIDE hits — a rear-end is a fatal mistake.
    if (this.hasDaredevil && this.passive && side) {
      if (pursued) {
        return { survived: false }; // caught mid-chase
      }
      return { survived: true, pursuitSec: passiveValue(this.passive, this.masteryLevel()) };
    }
    return { survived: false };
  }

  /** Drain mastery level-ups gained this frame/run (for a one-shot HUD toast). */
  consumeLevelUp(): number {
    const count = this.pendingLevelUps;
    this.pendingLevelUps = 0;
    return count;
  }
}
