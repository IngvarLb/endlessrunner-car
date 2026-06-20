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
import { DEFAULT_SAVE_DATA, type SaveData } from "./SaveData";

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

function normalizeQuality(value: unknown): QualityMode {
  return typeof value === "string" && qualityModes.includes(value as QualityMode)
    ? (value as QualityMode)
    : DEFAULT_SAVE_DATA.settings.quality;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
