/**
 * Pure data types for the ability system. No engine or DOM imports — these are
 * shared by the catalog, the mastery/upgrade/charge services and (later) the
 * run-time effect modules. See FAEHIGKEITEN_KONZEPT.md / UMSETZUNGSPLAN.md.
 */

/** Identifies the run-time effect module a Main ability drives (one per vehicle). */
export type EffectKey =
  | "boostRam" // 赤 Striker Boost
  | "hornClear" // 藍 Hupe / Freie Bahn
  | "coinRain" // 桜 Blütenregen
  | "titan" // 狐 Titan
  | "nightHunt" // 将 Nachtjagd
  | "blackHole" // 鬼 Schwarzes Loch
  | "hyperspeed"; // 龍 Überschall

/** Identifies the always-on passive modifier a vehicle gains through mastery. */
export type PassiveKey =
  | "crumpleZone" // 赤 Knautschzone (+1 Extra-Fail)
  | "highBeam" // 藍 Lichthupe
  | "piggyBank" // 桜 Sparbüchse
  | "secondLife" // 狐 Zweites Leben
  | "daredevil" // 将 Draufgänger
  | "siphon" // 鬼 Anzapfen
  | "tooFast"; // 龍 Zu schnell für die Polizei

/** Relative cost to fill the charge meter (resolved to coins in ChargeMeter). */
export type ChargeTier = "low" | "midLow" | "mid" | "midHigh" | "high";

/** A coin-bought, charge-gated active ability. Duration = base + step * mainLevel. */
export type MainAbilityDef = {
  id: string;
  name: string;
  kanji: string;
  effect: EffectKey;
  /** Duration in seconds at mainLevel 0. */
  durationBase: number;
  /** Duration added per purchased level. */
  durationStep: number;
  /** Highest purchasable level (inclusive). */
  maxLevel: number;
  chargeCost: ChargeTier;
  /** Short German effect description shown after the duration on the garage card. */
  blurb?: string;
  /** Effect-specific tuning knobs (e.g. coinRain density, nightHunt ram coins). */
  params?: Record<string, number>;
};

/** A meters-driven passive. Value scales linearly from `base` (Lv0) to `max` (Lv100). */
export type PassiveAbilityDef = {
  id: string;
  name: string;
  kanji: string;
  effect: PassiveKey;
  /** Value at mastery level 0. */
  base: number;
  /** Value at mastery level 100. May be lower than `base` when "less is better". */
  max: number;
  /** Display unit, e.g. "m", "金", "s". */
  unit?: string;
  /** Short German descriptor shown before the current value on the garage card. */
  blurb?: string;
  /** Passive-specific tuning knobs. */
  params?: Record<string, number>;
};

/** The two abilities a single vehicle owns. */
export type VehicleAbilities = {
  main: MainAbilityDef;
  passive: PassiveAbilityDef;
};
