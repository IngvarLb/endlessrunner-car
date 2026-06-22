import type { QualityMode } from "../../app/GameConfig";
import {
  canAffordVehicle,
  getAllVehicles,
  getDefaultUnlockedVehicleIds,
  getVehiclePrice,
  isVehicleOwned,
  normalizeUnlockedVehicleIds,
  resolveVehicleId
} from "../vehicles/VehicleCatalog";
import { MAIN_MAX_LEVEL, mainUpgradeCost } from "../abilities/UpgradeService";
import { DEFAULT_SAVE_DATA, type SaveData, type VehicleProgress } from "./SaveData";

const saveKey = "feudal-runner-save-v1";
const qualityModes: QualityMode[] = ["low", "medium", "high"];

export type UnlockVehicleResult =
  | { ok: true; saveData: SaveData; vehicleId: string }
  | {
      ok: false;
      reason: "already-owned" | "not-found" | "not-enough-coins";
      saveData: SaveData;
    };

export function loadSaveData(): SaveData {
  const storage = getStorage();
  if (!storage) {
    return normalizeSaveData(undefined);
  }

  try {
    return normalizeSaveData(JSON.parse(storage.getItem(saveKey) ?? "null"));
  } catch {
    return normalizeSaveData(undefined);
  }
}

export function saveSaveData(data: SaveData): SaveData {
  const normalized = normalizeSaveData(data);
  const storage = getStorage();

  if (storage) {
    try {
      storage.setItem(saveKey, JSON.stringify(normalized));
    } catch {
      // Some browsers can reject storage writes in private or restricted contexts.
    }
  }

  return normalized;
}

export function saveSelectedVehicle(vehicleId: string, current: SaveData = loadSaveData()): SaveData {
  const normalizedCurrent = normalizeSaveData(current);

  return saveSaveData({
    ...normalizedCurrent,
    selectedVehicleId: resolveVehicleId(vehicleId, normalizedCurrent.unlockedVehicleIds)
  });
}

export function addRunCoins(amount: number, current: SaveData = loadSaveData()): SaveData {
  const normalizedCurrent = normalizeSaveData(current);
  const earnedCoins = normalizeCoinDelta(amount);

  return saveSaveData({
    ...normalizedCurrent,
    totalCoins: normalizedCurrent.totalCoins + earnedCoins
  });
}

export function unlockVehicle(vehicleId: string, current: SaveData = loadSaveData()): UnlockVehicleResult {
  const normalizedCurrent = normalizeSaveData(current);
  const vehicle = getAllVehicles().find((candidate) => candidate.id === vehicleId);

  if (!vehicle) {
    return { ok: false, reason: "not-found", saveData: normalizedCurrent };
  }

  if (isVehicleOwned(vehicle, normalizedCurrent.unlockedVehicleIds)) {
    return { ok: false, reason: "already-owned", saveData: normalizedCurrent };
  }

  if (!canAffordVehicle(vehicle, normalizedCurrent.totalCoins)) {
    return { ok: false, reason: "not-enough-coins", saveData: normalizedCurrent };
  }

  const next = saveSaveData({
    ...normalizedCurrent,
    totalCoins: Math.max(0, normalizedCurrent.totalCoins - getVehiclePrice(vehicle)),
    unlockedVehicleIds: normalizeUnlockedVehicleIds([...normalizedCurrent.unlockedVehicleIds, vehicle.id])
  });

  return { ok: true, saveData: next, vehicleId: vehicle.id };
}

const EMPTY_PROGRESS: VehicleProgress = { meters: 0, mainLevel: 0 };

export function getVehicleProgress(vehicleId: string, current: SaveData = loadSaveData()): VehicleProgress {
  const normalizedCurrent = normalizeSaveData(current);
  return normalizedCurrent.vehicleProgress[vehicleId] ?? { ...EMPTY_PROGRESS };
}

/** Add driven meters to a vehicle's mastery track and persist. No-op for non-positive amounts. */
export function addVehicleMeters(vehicleId: string, meters: number, current: SaveData = loadSaveData()): SaveData {
  const normalizedCurrent = normalizeSaveData(current);
  const added = Number.isFinite(meters) && meters > 0 ? meters : 0;
  if (added <= 0) {
    return normalizedCurrent;
  }

  const previous = normalizedCurrent.vehicleProgress[vehicleId] ?? EMPTY_PROGRESS;
  return saveSaveData({
    ...normalizedCurrent,
    vehicleProgress: {
      ...normalizedCurrent.vehicleProgress,
      [vehicleId]: { ...previous, meters: previous.meters + added }
    }
  });
}

export type PurchaseMainUpgradeResult =
  | { ok: true; saveData: SaveData; vehicleId: string; newLevel: number; cost: number }
  | { ok: false; reason: "maxed" | "not-enough-coins" | "unknown-vehicle"; saveData: SaveData };

/** Buy the next Main upgrade level for a vehicle (deduct coins, mainLevel++), then persist. */
export function purchaseMainUpgrade(
  vehicleId: string,
  current: SaveData = loadSaveData()
): PurchaseMainUpgradeResult {
  const normalizedCurrent = normalizeSaveData(current);

  if (!getAllVehicles().some((vehicle) => vehicle.id === vehicleId)) {
    return { ok: false, reason: "unknown-vehicle", saveData: normalizedCurrent };
  }

  const previous = normalizedCurrent.vehicleProgress[vehicleId] ?? EMPTY_PROGRESS;
  if (previous.mainLevel >= MAIN_MAX_LEVEL) {
    return { ok: false, reason: "maxed", saveData: normalizedCurrent };
  }

  const cost = mainUpgradeCost(previous.mainLevel);
  if (!Number.isFinite(cost) || normalizedCurrent.totalCoins < cost) {
    return { ok: false, reason: "not-enough-coins", saveData: normalizedCurrent };
  }

  const newLevel = previous.mainLevel + 1;
  const next = saveSaveData({
    ...normalizedCurrent,
    totalCoins: Math.max(0, normalizedCurrent.totalCoins - cost),
    vehicleProgress: {
      ...normalizedCurrent.vehicleProgress,
      [vehicleId]: { ...previous, mainLevel: newLevel }
    }
  });

  return { ok: true, saveData: next, vehicleId, newLevel, cost };
}

function normalizeSaveData(value: unknown): SaveData {
  const raw = isRecord(value) ? value : {};
  const settings = isRecord(raw.settings) ? raw.settings : {};
  const unlockedVehicleIds = normalizeUnlockedVehicleIds(
    normalizeStringArray(raw.unlockedVehicleIds, getDefaultUnlockedVehicleIds())
  );

  return {
    version: 1,
    highScore: normalizeNumber(raw.highScore, DEFAULT_SAVE_DATA.highScore),
    bestDistance: normalizeNumber(raw.bestDistance, DEFAULT_SAVE_DATA.bestDistance),
    totalCoins: normalizeCoinBalance(raw.totalCoins, DEFAULT_SAVE_DATA.totalCoins),
    selectedVehicleId: resolveVehicleId(normalizeString(raw.selectedVehicleId), unlockedVehicleIds),
    unlockedVehicleIds,
    vehicleProgress: normalizeVehicleProgress(raw.vehicleProgress),
    settings: {
      masterVolume: normalizeNumber(settings.masterVolume, DEFAULT_SAVE_DATA.settings.masterVolume),
      musicVolume: normalizeNumber(settings.musicVolume, DEFAULT_SAVE_DATA.settings.musicVolume),
      sfxVolume: normalizeNumber(settings.sfxVolume, DEFAULT_SAVE_DATA.settings.sfxVolume),
      muted: typeof settings.muted === "boolean" ? settings.muted : DEFAULT_SAVE_DATA.settings.muted,
      quality: normalizeQuality(settings.quality),
      reducedMotion:
        typeof settings.reducedMotion === "boolean" ? settings.reducedMotion : DEFAULT_SAVE_DATA.settings.reducedMotion,
      showPerfHud:
        typeof settings.showPerfHud === "boolean" ? settings.showPerfHud : DEFAULT_SAVE_DATA.settings.showPerfHud
    }
  };
}

function getStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function normalizeString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const unique = new Set(value.filter((item): item is string => typeof item === "string"));
  return unique.size > 0 ? [...unique] : [...fallback];
}

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeCoinBalance(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}

function normalizeCoinDelta(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function normalizeVehicleProgress(value: unknown): Record<string, VehicleProgress> {
  const result: Record<string, VehicleProgress> = {};
  if (!isRecord(value)) {
    return result;
  }

  const knownIds = new Set(getAllVehicles().map((vehicle) => vehicle.id));
  for (const [vehicleId, entry] of Object.entries(value)) {
    if (!knownIds.has(vehicleId) || !isRecord(entry)) {
      continue;
    }
    result[vehicleId] = {
      meters: normalizeMeters(entry.meters),
      mainLevel: normalizeMainLevel(entry.mainLevel)
    };
  }

  return result;
}

function normalizeMeters(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

function normalizeMainLevel(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(MAIN_MAX_LEVEL, Math.floor(value)));
}

function normalizeQuality(value: unknown): QualityMode {
  return typeof value === "string" && qualityModes.includes(value as QualityMode)
    ? (value as QualityMode)
    : DEFAULT_SAVE_DATA.settings.quality;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
