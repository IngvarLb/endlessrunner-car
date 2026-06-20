import type { LaneIndex } from "../../app/GameConfig";

export type TrafficCarKind = "traffic-kei-hatch" | "traffic-city-sedan" | "traffic-box-van";

export type TrafficColliderShape = {
  centerY: number;
  width: number;
  height: number;
  depth: number;
};

export type TrafficCarSpec = {
  speed: number;
  collider: TrafficColliderShape;
};

export type TrafficRowCarDefinition = {
  kind: TrafficCarKind;
  lane: LaneIndex;
  speed?: number;
};

export type TrafficRowDefinition = {
  trackZ: number;
  safeLane: LaneIndex;
  cars: TrafficRowCarDefinition[];
};

export type TrafficCarPlacement = {
  id: string;
  kind: TrafficCarKind;
  lane: LaneIndex;
  trackZ: number;
  speed: number;
  collider: TrafficColliderShape;
  patternId: string;
};

export const TRAFFIC_CAR_SPECS: Record<TrafficCarKind, TrafficCarSpec> = {
  "traffic-kei-hatch": {
    speed: 5.0,
    collider: { centerY: 0.5, width: 1.35, height: 0.82, depth: 2.05 }
  },
  "traffic-city-sedan": {
    speed: 5.0,
    collider: { centerY: 0.5, width: 1.5, height: 0.78, depth: 2.45 }
  },
  "traffic-box-van": {
    speed: 5.0,
    collider: { centerY: 0.62, width: 1.48, height: 1.05, depth: 2.25 }
  }
};
