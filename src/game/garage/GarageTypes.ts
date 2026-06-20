import type { VehicleDefinition } from "../vehicles/VehicleCatalog";

export type GarageSwitchState = "idle" | "switchingOut" | "switchingIn";

export type GarageVehiclePreview = {
  vehicle: VehicleDefinition;
  owned: boolean;
  price: number;
  canAfford: boolean;
  missingCoins: number;
  totalCoins: number;
};

export type GarageSelectionResult =
  | {
      ok: true;
      vehicleId: string;
    }
  | {
      ok: false;
      reason: "switching" | "locked";
      vehicleId?: string;
    };
