import type { MainAbilityDef } from "./AbilityTypes";
import { MAIN_MAX_LEVEL } from "./AbilityCatalog";

/**
 * Pure cost/duration math for Main upgrades. Persistence + coin deduction live
 * in SaveDataStore (purchaseMainUpgrade) to keep all storage writes in one place.
 */

export { MAIN_MAX_LEVEL };

function clampLevel(level: number): number {
  if (!Number.isFinite(level)) {
    return 0;
  }
  return Math.max(0, Math.min(MAIN_MAX_LEVEL, Math.floor(level)));
}

/** Coin cost to upgrade from `currentLevel` to `currentLevel + 1`. */
export function mainUpgradeCost(currentLevel: number): number {
  const level = clampLevel(currentLevel);
  const nextLevel = level + 1;
  if (nextLevel > MAIN_MAX_LEVEL) {
    return Number.POSITIVE_INFINITY;
  }
  // Escalating curve: ~100 金 at Lv1 → ~5000 金 at Lv30 (≈45k 金 total per car).
  return Math.round(100 * Math.pow(nextLevel, 1.6));
}

/** Active duration (seconds) of a Main at a given purchased level. */
export function mainDuration(def: MainAbilityDef, level: number): number {
  const l = Math.max(0, Math.min(def.maxLevel, clampLevel(level)));
  return def.durationBase + def.durationStep * l;
}

export function isMainMaxed(level: number): boolean {
  return clampLevel(level) >= MAIN_MAX_LEVEL;
}
