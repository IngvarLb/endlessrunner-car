import type { Vec3Like } from "../../app/GameConfig";

export type VehicleModelKey =
  | "sports-car"
  | "drift-coupe"
  | "sakura-roadster"
  | "kitsune-rally"
  | "shogun-gtr"
  | "oni-interceptor"
  | "ryujin-hypercar";

export type VehicleUnlockState = "owned" | "locked";

export type VehicleEconomyTier = "starter" | "street" | "sport" | "elite" | "legend";

export type VehicleEconomy = {
  price: number;
  tier: VehicleEconomyTier;
};

export type VehicleBounds = {
  x: number;
  y: number;
  z: number;
};

/** Rarity tier shown in the new design (COMMON/RARE/EPIC/LEGEND). */
export type VehicleTier = "common" | "rare" | "epic" | "legend";

export type VehicleStats = {
  speed: number;
  grip: number;
  handle: number;
  power: number;
};

export type TierMeta = { en: string; jp: string; color: string };

export const TIER_META: Record<VehicleTier, TierMeta> = {
  common: { en: "COMMON", jp: "常", color: "#9a938a" },
  rare: { en: "RARE", jp: "稀", color: "#4f97bd" },
  epic: { en: "EPIC", jp: "極", color: "#a35fa8" },
  legend: { en: "LEGENDARY", jp: "伝", color: "#cf9d2a" }
};

export type VehicleDefinition = {
  id: string;
  displayName: string;
  modelKey: VehicleModelKey;
  unlockState: VehicleUnlockState;
  economy: VehicleEconomy;
  /** Display-system fields (from the Claude Design import). */
  kanji: string;
  romaji: string;
  tier: VehicleTier;
  paint: string;
  tag: string;
  stats: VehicleStats;
  run: {
    scale: number;
    forwardRotationY: number;
    bounds: VehicleBounds;
  };
  showroom: {
    scale: number;
    cameraFocusOffset: Vec3Like;
  };
};

export const DEFAULT_VEHICLE_ID = "sports-car";

export const VEHICLE_CATALOG: VehicleDefinition[] = [
  {
    id: "sports-car",
    displayName: "Crimson Bolt",
    modelKey: "sports-car",
    unlockState: "owned",
    economy: { price: 0, tier: "starter" },
    kanji: "赤",
    romaji: "AKA",
    tier: "common",
    paint: "#e23b2e",
    tag: "江戸 ・ 街道仕様",
    stats: { speed: 6, grip: 5, handle: 7, power: 6 },
    run: {
      scale: 0.84,
      forwardRotationY: 0,
      bounds: { x: 1.12, y: 0.94, z: 2.0 }
    },
    showroom: {
      scale: 1,
      cameraFocusOffset: { x: 0, y: 0.58, z: 0 }
    }
  },
  {
    id: "drift-coupe",
    displayName: "Indigo Drift",
    modelKey: "drift-coupe",
    unlockState: "owned",
    economy: { price: 0, tier: "starter" },
    kanji: "藍",
    romaji: "AI",
    tier: "common",
    paint: "#3f6f9e",
    tag: "藍染 ・ 夜行型",
    stats: { speed: 5, grip: 7, handle: 6, power: 5 },
    run: {
      scale: 0.84,
      forwardRotationY: 0,
      bounds: { x: 1.12, y: 0.86, z: 2.0 }
    },
    showroom: {
      scale: 1.02,
      cameraFocusOffset: { x: 0, y: 0.54, z: 0 }
    }
  },
  {
    id: "sakura-roadster",
    displayName: "Sakura Roadster",
    modelKey: "sakura-roadster",
    unlockState: "owned",
    economy: { price: 0, tier: "street" },
    kanji: "桜",
    romaji: "SAKURA",
    tier: "rare",
    paint: "#e0738d",
    tag: "花見 ・ 限定塗装",
    stats: { speed: 7, grip: 6, handle: 8, power: 6 },
    run: {
      scale: 0.86,
      forwardRotationY: 0,
      bounds: { x: 1.1, y: 0.74, z: 2.0 }
    },
    showroom: {
      scale: 1.04,
      cameraFocusOffset: { x: 0, y: 0.5, z: 0 }
    }
  },
  {
    id: "kitsune-rally",
    displayName: "Kitsune GT",
    modelKey: "kitsune-rally",
    unlockState: "locked",
    economy: { price: 1200, tier: "sport" },
    kanji: "狐",
    romaji: "KITSUNE",
    tier: "rare",
    paint: "#e08a2a",
    tag: "稲荷 ・ 高速仕様",
    stats: { speed: 8, grip: 6, handle: 7, power: 8 },
    run: {
      scale: 0.82,
      forwardRotationY: 0,
      bounds: { x: 1.2, y: 1.04, z: 2.04 }
    },
    showroom: {
      scale: 0.96,
      cameraFocusOffset: { x: 0, y: 0.6, z: 0 }
    }
  },
  {
    id: "shogun-gtr",
    displayName: "Daimyo Coupe",
    modelKey: "shogun-gtr",
    unlockState: "locked",
    economy: { price: 3500, tier: "sport" },
    kanji: "将",
    romaji: "SHOGUN",
    tier: "epic",
    paint: "#9a5fa6",
    tag: "武家 ・ 重装型",
    stats: { speed: 8, grip: 8, handle: 6, power: 9 },
    run: {
      scale: 0.8,
      forwardRotationY: 0,
      bounds: { x: 1.2, y: 0.82, z: 2.12 }
    },
    showroom: {
      scale: 0.94,
      cameraFocusOffset: { x: 0, y: 0.55, z: 0 }
    }
  },
  {
    id: "oni-interceptor",
    displayName: "Oni Racer",
    modelKey: "oni-interceptor",
    unlockState: "locked",
    economy: { price: 6000, tier: "elite" },
    kanji: "鬼",
    romaji: "ONI",
    tier: "epic",
    paint: "#b8332b",
    tag: "鬼門 ・ 攻撃的",
    stats: { speed: 9, grip: 7, handle: 7, power: 9 },
    run: {
      scale: 0.78,
      forwardRotationY: 0,
      bounds: { x: 1.22, y: 0.82, z: 2.14 }
    },
    showroom: {
      scale: 0.9,
      cameraFocusOffset: { x: 0, y: 0.55, z: 0 }
    }
  },
  {
    id: "ryujin-hypercar",
    displayName: "Dragon Zero",
    modelKey: "ryujin-hypercar",
    unlockState: "locked",
    economy: { price: 12000, tier: "legend" },
    kanji: "龍",
    romaji: "RYU",
    tier: "legend",
    paint: "#cf9d2a",
    tag: "昇龍 ・ 伝説機",
    stats: { speed: 10, grip: 9, handle: 9, power: 10 },
    run: {
      scale: 0.78,
      forwardRotationY: 0,
      bounds: { x: 1.2, y: 0.86, z: 2.18 }
    },
    showroom: {
      scale: 0.9,
      cameraFocusOffset: { x: 0, y: 0.52, z: 0 }
    }
  }
];

export function getAllVehicles(): VehicleDefinition[] {
  return [...VEHICLE_CATALOG];
}

export function getVehicleDefinition(id: string = DEFAULT_VEHICLE_ID): VehicleDefinition {
  return VEHICLE_CATALOG.find((vehicle) => vehicle.id === id) ?? VEHICLE_CATALOG[0];
}

export function getUnlockedVehicles(unlockedVehicleIds: string[] = getDefaultUnlockedVehicleIds()): VehicleDefinition[] {
  const vehicles = VEHICLE_CATALOG.filter((vehicle) => isVehicleOwned(vehicle, unlockedVehicleIds));
  return vehicles.length > 0 ? vehicles : [getVehicleDefinition(DEFAULT_VEHICLE_ID)];
}

export function isVehicleOwned(
  vehicle: VehicleDefinition,
  unlockedVehicleIds: string[] = getDefaultUnlockedVehicleIds()
): boolean {
  return vehicle.unlockState === "owned" || unlockedVehicleIds.includes(vehicle.id);
}

export function getVehiclePrice(vehicle: VehicleDefinition): number {
  return Math.max(0, Math.floor(vehicle.economy.price));
}

export function canAffordVehicle(vehicle: VehicleDefinition, totalCoins: number): boolean {
  return getNormalizedCoinBalance(totalCoins) >= getVehiclePrice(vehicle);
}

export function getMissingCoins(vehicle: VehicleDefinition, totalCoins: number): number {
  return Math.max(0, getVehiclePrice(vehicle) - getNormalizedCoinBalance(totalCoins));
}

export function resolveVehicleId(
  id: string | undefined,
  unlockedVehicleIds: string[] = getDefaultUnlockedVehicleIds()
): string {
  const candidate = VEHICLE_CATALOG.find((vehicle) => vehicle.id === id);

  if (candidate && isVehicleOwned(candidate, unlockedVehicleIds)) {
    return candidate.id;
  }

  return DEFAULT_VEHICLE_ID;
}

export function getOwnedVehicleDefinition(
  id: string | undefined = DEFAULT_VEHICLE_ID,
  unlockedVehicleIds: string[] = getDefaultUnlockedVehicleIds()
): VehicleDefinition {
  return getVehicleDefinition(resolveVehicleId(id, unlockedVehicleIds));
}

export function getDefaultUnlockedVehicleIds(): string[] {
  return VEHICLE_CATALOG.filter((vehicle) => vehicle.unlockState === "owned").map((vehicle) => vehicle.id);
}

export function normalizeUnlockedVehicleIds(unlockedVehicleIds: string[] = []): string[] {
  const knownIds = new Set(VEHICLE_CATALOG.map((vehicle) => vehicle.id));
  const normalized = new Set(getDefaultUnlockedVehicleIds());

  for (const vehicleId of unlockedVehicleIds) {
    if (knownIds.has(vehicleId)) {
      normalized.add(vehicleId);
    }
  }

  return VEHICLE_CATALOG.filter((vehicle) => normalized.has(vehicle.id)).map((vehicle) => vehicle.id);
}

function getNormalizedCoinBalance(totalCoins: number): number {
  return Number.isFinite(totalCoins) ? Math.max(0, Math.floor(totalCoins)) : 0;
}
