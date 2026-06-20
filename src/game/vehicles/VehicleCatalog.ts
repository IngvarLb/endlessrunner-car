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

export type VehicleDefinition = {
  id: string;
  displayName: string;
  modelKey: VehicleModelKey;
  unlockState: VehicleUnlockState;
  economy: VehicleEconomy;
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
    displayName: "Akai Striker",
    modelKey: "sports-car",
    unlockState: "owned",
    economy: {
      price: 0,
      tier: "starter"
    },
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
    displayName: "Aoi Drift Coupe",
    modelKey: "drift-coupe",
    unlockState: "owned",
    economy: {
      price: 0,
      tier: "starter"
    },
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
    unlockState: "locked",
    economy: {
      price: 350,
      tier: "street"
    },
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
    displayName: "Kitsune Rally",
    modelKey: "kitsune-rally",
    unlockState: "locked",
    economy: {
      price: 850,
      tier: "sport"
    },
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
    displayName: "Shogun GTR",
    modelKey: "shogun-gtr",
    unlockState: "locked",
    economy: {
      price: 1600,
      tier: "sport"
    },
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
    displayName: "Oni Interceptor",
    modelKey: "oni-interceptor",
    unlockState: "locked",
    economy: {
      price: 2800,
      tier: "elite"
    },
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
    displayName: "Ryujin Hypercar",
    modelKey: "ryujin-hypercar",
    unlockState: "locked",
    economy: {
      price: 5000,
      tier: "legend"
    },
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
