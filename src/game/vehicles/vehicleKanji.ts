/**
 * Per-vehicle "theme" kanji, shared by the garage 3D backdrop and the hanko
 * collection rail so both always show the same glyph for a car.
 */
const VEHICLE_KANJI: Record<string, string> = {
  "sports-car": "赤",
  "drift-coupe": "藍",
  "sakura-roadster": "桜",
  "kitsune-rally": "狐",
  "shogun-gtr": "将",
  "oni-interceptor": "鬼",
  "ryujin-hypercar": "龍"
};

const FALLBACK_KANJI = "走";

export function getVehicleKanji(vehicleId: string): string {
  return VEHICLE_KANJI[vehicleId] ?? FALLBACK_KANJI;
}
