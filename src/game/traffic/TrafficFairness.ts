import type { LaneIndex } from "../../app/GameConfig";
import { TRAFFIC_CAR_SPECS, type TrafficRowDefinition } from "./TrafficTypes";

const lanes: LaneIndex[] = [-1, 0, 1];
const sameHazardBandDistance = 6;
const minSingleLaneChangeDistance = 12;
const minDoubleLaneChangeDistance = 20;
const pathValidationLoops = 2;
const stableLoopSpeedTolerance = 0.01;

export function validateTrafficRows(rows: TrafficRowDefinition[], loopLength: number): void {
  if (rows.length === 0) {
    return;
  }

  const sortedRows = [...rows].sort((a, b) => a.trackZ - b.trackZ);
  validateRows(sortedRows, loopLength);
  validateStableLoopSpeeds(sortedRows);
  validateHazardBands(sortedRows, loopLength);
  validatePath(sortedRows, loopLength);
}

function validateStableLoopSpeeds(rows: TrafficRowDefinition[]): void {
  const speeds = rows.flatMap((row) => row.cars.map((car) => car.speed ?? TRAFFIC_CAR_SPECS[car.kind].speed));

  if (speeds.length <= 1) {
    return;
  }

  const slowest = Math.min(...speeds);
  const fastest = Math.max(...speeds);
  if (fastest - slowest > stableLoopSpeedTolerance) {
    throw new Error("Traffic rows need one shared speed until the scheduler supports dynamic speed drift.");
  }
}

function validateRows(rows: TrafficRowDefinition[], loopLength: number): void {
  for (const row of rows) {
    if (row.trackZ < 0 || row.trackZ >= loopLength) {
      throw new Error(`Traffic row at z=${row.trackZ} is outside loop length ${loopLength}.`);
    }

    if (!lanes.includes(row.safeLane)) {
      throw new Error(`Traffic row at z=${row.trackZ} has invalid safe lane ${row.safeLane}.`);
    }

    if (row.cars.length >= lanes.length) {
      throw new Error(`Traffic row at z=${row.trackZ} blocks all lanes.`);
    }

    const blockedLanes = new Set<LaneIndex>();
    for (const car of row.cars) {
      if (!lanes.includes(car.lane)) {
        throw new Error(`Traffic car at z=${row.trackZ} has invalid lane ${car.lane}.`);
      }

      if (blockedLanes.has(car.lane)) {
        throw new Error(`Traffic row at z=${row.trackZ} has duplicate lane ${car.lane}.`);
      }
      blockedLanes.add(car.lane);
    }

    if (blockedLanes.has(row.safeLane)) {
      throw new Error(`Traffic row at z=${row.trackZ} marks blocked lane ${row.safeLane} as safe.`);
    }

    const rowSpeeds = row.cars.map((car) => car.speed ?? TRAFFIC_CAR_SPECS[car.kind].speed);
    const slowest = Math.min(...rowSpeeds);
    const fastest = Math.max(...rowSpeeds);
    if (fastest - slowest > 0.2) {
      throw new Error(`Traffic row at z=${row.trackZ} has cars drifting apart too quickly.`);
    }
  }
}

function validateHazardBands(rows: TrafficRowDefinition[], loopLength: number): void {
  const expandedRows = expandRows(rows, loopLength, 2);

  for (let index = 0; index < expandedRows.length; index += 1) {
    const blockedLanes = new Set<LaneIndex>();
    const origin = expandedRows[index];

    for (let next = index; next < expandedRows.length; next += 1) {
      const row = expandedRows[next];
      if (row.trackZ - origin.trackZ > sameHazardBandDistance) {
        break;
      }

      for (const car of row.cars) {
        blockedLanes.add(car.lane);
      }

      if (blockedLanes.size >= lanes.length) {
        throw new Error(
          `Traffic rows near z=${origin.trackZ % loopLength} combine into a full-lane block within ${sameHazardBandDistance}m.`
        );
      }
    }
  }
}

function validatePath(rows: TrafficRowDefinition[], loopLength: number): void {
  const expandedRows = expandRows(rows, loopLength, pathValidationLoops);
  let reachable = new Set<LaneIndex>(lanes);
  let previousZ = 0;

  for (const row of expandedRows) {
    const blockedLanes = new Set<LaneIndex>(row.cars.map((car) => car.lane));
    const distance = row.trackZ - previousZ;
    const nextReachable = new Set<LaneIndex>();

    for (const fromLane of reachable) {
      for (const toLane of lanes) {
        const laneDelta = Math.abs(toLane - fromLane);
        const canReach =
          laneDelta === 0 ||
          (laneDelta === 1 && distance >= minSingleLaneChangeDistance) ||
          (laneDelta === 2 && distance >= minDoubleLaneChangeDistance);

        if (canReach && !blockedLanes.has(toLane)) {
          nextReachable.add(toLane);
        }
      }
    }

    if (nextReachable.size === 0) {
      throw new Error(`Traffic path becomes impossible near z=${row.trackZ % loopLength}.`);
    }

    reachable = nextReachable;
    previousZ = row.trackZ;
  }
}

function expandRows(rows: TrafficRowDefinition[], loopLength: number, loopCount: number): TrafficRowDefinition[] {
  const expandedRows: TrafficRowDefinition[] = [];

  for (let loopIndex = 0; loopIndex < loopCount; loopIndex += 1) {
    for (const row of rows) {
      expandedRows.push({
        ...row,
        trackZ: row.trackZ + loopIndex * loopLength
      });
    }
  }

  return expandedRows.sort((a, b) => a.trackZ - b.trackZ);
}
