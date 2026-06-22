import type { MainAbilityDef, PassiveAbilityDef, VehicleAbilities } from "./AbilityTypes";

/**
 * Ability data for all 7 vehicles. Keyed by the *real* vehicleId from
 * VehicleCatalog (NOT the kanji): 赤→sports-car, 藍→drift-coupe,
 * 桜→sakura-roadster, 狐→kitsune-rally, 将→shogun-gtr, 鬼→oni-interceptor,
 * 龍→ryujin-hypercar. Numbers come from FAEHIGKEITEN_KONZEPT.md (tunable).
 *
 * Main duration = durationBase + durationStep * mainLevel (mainLevel 0..maxLevel).
 * Passive value = base + (max - base) * masteryLevel/100 (masteryLevel 0..100);
 * for "less is better" passives (cooldowns, losses) `max` is lower than `base`.
 */

export const MAIN_MAX_LEVEL = 30;

const mains: Record<string, MainAbilityDef> = {
  // 赤 Striker Boost — Boost forward, destroys NPCs in lane. 3s → 9s.
  "sports-car": {
    id: "striker-boost",
    name: "Striker Boost",
    kanji: "赤",
    effect: "boostRam",
    durationBase: 3,
    durationStep: 0.2,
    maxLevel: MAIN_MAX_LEVEL,
    chargeCost: "low"
  },
  // 藍 Hupe / Freie Bahn — NPCs swerve away, middle lane clears + coin row. 6s → 12s.
  "drift-coupe": {
    id: "horn-clear",
    name: "Freie Bahn",
    kanji: "藍",
    effect: "hornClear",
    durationBase: 6,
    durationStep: 0.2,
    maxLevel: MAIN_MAX_LEVEL,
    chargeCost: "midLow"
  },
  // 桜 Blütenregen — real (sakura-tinted) coins rain everywhere. ~10s, density scales with level.
  "sakura-roadster": {
    id: "blossom-rain",
    name: "Blütenregen",
    kanji: "桜",
    effect: "coinRain",
    durationBase: 10,
    durationStep: 0,
    maxLevel: MAIN_MAX_LEVEL,
    chargeCost: "mid",
    // density multiplier = densityBase + densityStep * mainLevel (drizzle → downpour).
    params: { densityBase: 1, densityStep: 0.1 }
  },
  // 狐 Titan — car grows over 3 lanes, indestructible, vacuums all-lane coins. 3s → 9s.
  "kitsune-rally": {
    id: "titan",
    name: "Titan",
    kanji: "狐",
    effect: "titan",
    durationBase: 3,
    durationStep: 0.2,
    maxLevel: MAIN_MAX_LEVEL,
    chargeCost: "midHigh"
  },
  // 将 Nachtjagd — it turns night, NPCs laterally rammable (drop 10 coins + leave wreck). 20s → 50s.
  "shogun-gtr": {
    id: "night-hunt",
    name: "Nachtjagd",
    kanji: "将",
    effect: "nightHunt",
    durationBase: 20,
    durationStep: 1,
    maxLevel: MAIN_MAX_LEVEL,
    chargeCost: "high",
    params: { ramCoins: 10 }
  },
  // 鬼 Schwarzes Loch — tapped cars are lifted, stream coins into the hole → account. 10s → 20s.
  "oni-interceptor": {
    id: "black-hole",
    name: "Schwarzes Loch",
    kanji: "鬼",
    effect: "blackHole",
    durationBase: 10,
    durationStep: 10 / MAIN_MAX_LEVEL,
    maxLevel: MAIN_MAX_LEVEL,
    chargeCost: "midHigh"
  },
  // 龍 Überschall — very fast; NPCs biased right, left lane sparse; FOV widens + speed lines. 10s → 40s.
  "ryujin-hypercar": {
    id: "hyperspeed",
    name: "Überschall",
    kanji: "龍",
    effect: "hyperspeed",
    durationBase: 10,
    durationStep: 1,
    maxLevel: MAIN_MAX_LEVEL,
    chargeCost: "high"
  }
};

const passives: Record<string, PassiveAbilityDef> = {
  // 赤 Knautschzone — +1 Extra-Fail; buffer recharge distance 600m → 300m.
  "sports-car": {
    id: "crumple-zone",
    name: "Knautschzone",
    kanji: "赤",
    effect: "crumpleZone",
    base: 600,
    max: 300,
    unit: "m"
  },
  // 藍 Lichthupe — front car gives way on approach; cooldown 1200m → 600m.
  "drift-coupe": {
    id: "high-beam",
    name: "Lichthupe",
    kanji: "藍",
    effect: "highBeam",
    base: 1200,
    max: 600,
    unit: "m"
  },
  // 桜 Sparbüchse — a small fail costs coins; loss 40 → 10.
  "sakura-roadster": {
    id: "piggy-bank",
    name: "Sparbüchse",
    kanji: "桜",
    effect: "piggyBank",
    base: 40,
    max: 10,
    unit: "金"
  },
  // 狐 Zweites Leben — extra life, auto-consumed on a fatal hit; recharge 2000m → 1000m.
  "kitsune-rally": {
    id: "second-life",
    name: "Zweites Leben",
    kanji: "狐",
    effect: "secondLife",
    base: 2000,
    max: 1000,
    unit: "m"
  },
  // 将 Draufgänger — survive lateral hits but police gives chase; police window 60s → 30s.
  "shogun-gtr": {
    id: "daredevil",
    name: "Draufgänger",
    kanji: "将",
    effect: "daredevil",
    base: 60,
    max: 30,
    unit: "s"
  },
  // 鬼 Anzapfen — cars drop coins while police is right behind; coins/car/s 1 → 7.
  // Simultaneous tapped cars (1→2→3→4) are derived per-level in the Phase-2 effect.
  "oni-interceptor": {
    id: "siphon",
    name: "Anzapfen",
    kanji: "鬼",
    effect: "siphon",
    base: 1,
    max: 7,
    unit: "金/s"
  },
  // 龍 Zu schnell für die Polizei — lose-window after a small fail 10s → 1s (≈ immunity at max).
  "ryujin-hypercar": {
    id: "too-fast",
    name: "Zu schnell",
    kanji: "龍",
    effect: "tooFast",
    base: 10,
    max: 1,
    unit: "s"
  }
};

/** Vehicles that must NOT charge from their own coins (loop protection). */
const selfCoinChargeBlocked = new Set<string>(["sakura-roadster", "oni-interceptor"]);

export function hasAbilities(vehicleId: string): boolean {
  return vehicleId in mains && vehicleId in passives;
}

export function getMainAbility(vehicleId: string): MainAbilityDef | undefined {
  return mains[vehicleId];
}

export function getPassiveAbility(vehicleId: string): PassiveAbilityDef | undefined {
  return passives[vehicleId];
}

export function getVehicleAbilities(vehicleId: string): VehicleAbilities | undefined {
  const main = mains[vehicleId];
  const passive = passives[vehicleId];
  return main && passive ? { main, passive } : undefined;
}

/** True when this vehicle's Main is coin-generating and must charge via distance instead. */
export function chargesFromOwnCoins(vehicleId: string): boolean {
  return !selfCoinChargeBlocked.has(vehicleId);
}
