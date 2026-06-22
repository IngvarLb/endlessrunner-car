import type { PassiveAbilityDef } from "./AbilityTypes";

/** Meters of distance that earn one mastery level. */
export const METERS_PER_LEVEL = 10_000;
/** Highest mastery level — reached at 1,000,000 m (= 1000 km). */
export const MAX_MASTERY_LEVEL = 100;

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

function safeMeters(meters: number): number {
  return Number.isFinite(meters) && meters > 0 ? meters : 0;
}

/** Mastery level for cumulative meters: `min(100, floor(meters/10000))`. */
export function masteryLevel(meters: number): number {
  return Math.min(MAX_MASTERY_LEVEL, Math.floor(safeMeters(meters) / METERS_PER_LEVEL));
}

/** Linearly interpolated passive value for a given mastery level (0..100). */
export function passiveValue(def: PassiveAbilityDef, level: number): number {
  const l = clamp(level, 0, MAX_MASTERY_LEVEL);
  return def.base + (def.max - def.base) * (l / MAX_MASTERY_LEVEL);
}

/** Passive value resolved directly from cumulative meters. */
export function passiveValueForMeters(def: PassiveAbilityDef, meters: number): number {
  return passiveValue(def, masteryLevel(meters));
}

/** Meters still needed to reach the next level (0 when already maxed). */
export function metersToNextLevel(meters: number): number {
  const level = masteryLevel(meters);
  if (level >= MAX_MASTERY_LEVEL) {
    return 0;
  }
  return (level + 1) * METERS_PER_LEVEL - safeMeters(meters);
}

/** Fill ratio [0,1] of the current level's progress bar. Returns 1 when maxed. */
export function masteryProgressRatio(meters: number): number {
  const level = masteryLevel(meters);
  if (level >= MAX_MASTERY_LEVEL) {
    return 1;
  }
  const into = safeMeters(meters) - level * METERS_PER_LEVEL;
  return clamp(into / METERS_PER_LEVEL, 0, 1);
}
