import type { TrafficRowDefinition } from "../traffic/TrafficTypes";

export type DecorationKind =
  | "torii"
  | "bambooCluster"
  | "stoneLantern"
  | "machiyaHouse"
  | "minkaHouse"
  | "nagayaRowHouse"
  | "kuraStorehouse";

export type TrackLoopDefinition = {
  segmentLength: number;
  startIndex: number;
  segmentCount: number;
  recycleBehindDistance: number;
};

export type DecorationPlacement = {
  kind: DecorationKind;
  x: number;
  z: number;
  rotationY?: number;
  scale?: number;
};

export type CoinPatternDefinition = {
  count: number;
  startZ: number;
  spacing: number;
};

export type BiomeContentDefinition = {
  id: string;
  track: TrackLoopDefinition;
  contentLoopLength: number;
  decorationRecycleBehindDistance: number;
  decorations: DecorationPlacement[];
  coins: CoinPatternDefinition;
  trafficRows: TrafficRowDefinition[];
};

const FEUDAL_JAPAN_CONTENT_LOOP_LENGTH = 120;

export const FEUDAL_JAPAN_BIOME_CONTENT: BiomeContentDefinition = {
  id: "feudal-japan-temple-road",
  track: {
    segmentLength: 36,
    startIndex: -2,
    segmentCount: 10,
    recycleBehindDistance: 42
  },
  contentLoopLength: FEUDAL_JAPAN_CONTENT_LOOP_LENGTH,
  decorationRecycleBehindDistance: 18,
  decorations: createFeudalJapanDecorations(),
  coins: {
    count: 33,
    startZ: 7,
    spacing: 3.45
  },
  trafficRows: [
    {
      trackZ: 20,
      safeLane: 0,
      cars: [{ lane: -1, kind: "traffic-kei-hatch", speed: 5.0 }]
    },
    {
      trackZ: 32,
      safeLane: 0,
      cars: [
        { lane: -1, kind: "traffic-city-sedan", speed: 5.0 },
        { lane: 1, kind: "traffic-kei-hatch", speed: 5.0 }
      ]
    },
    {
      trackZ: 44,
      safeLane: 1,
      cars: [
        { lane: -1, kind: "traffic-box-van", speed: 5.0 },
        { lane: 0, kind: "traffic-city-sedan", speed: 5.0 }
      ]
    },
    {
      trackZ: 56,
      safeLane: 1,
      cars: [{ lane: 0, kind: "traffic-kei-hatch", speed: 5.0 }]
    },
    {
      trackZ: 68,
      safeLane: 0,
      cars: [
        { lane: -1, kind: "traffic-city-sedan", speed: 5.0 },
        { lane: 1, kind: "traffic-box-van", speed: 5.0 }
      ]
    },
    {
      trackZ: 80,
      safeLane: -1,
      cars: [
        { lane: 0, kind: "traffic-box-van", speed: 5.0 },
        { lane: 1, kind: "traffic-city-sedan", speed: 5.0 }
      ]
    },
    {
      trackZ: 92,
      safeLane: -1,
      cars: [{ lane: 1, kind: "traffic-kei-hatch", speed: 5.0 }]
    },
    {
      trackZ: 104,
      safeLane: 0,
      cars: [
        { lane: -1, kind: "traffic-kei-hatch", speed: 5.0 },
        { lane: 1, kind: "traffic-city-sedan", speed: 5.0 }
      ]
    },
    {
      trackZ: 116,
      safeLane: 1,
      cars: [
        { lane: -1, kind: "traffic-box-van", speed: 5.0 },
        { lane: 0, kind: "traffic-kei-hatch", speed: 5.0 }
      ]
    }
  ]
};

function createFeudalJapanDecorations(): DecorationPlacement[] {
  const decorations: DecorationPlacement[] = [];
  const loopLength = FEUDAL_JAPAN_CONTENT_LOOP_LENGTH;
  const leftHouseX = -6.95;
  const rightHouseX = 6.95;
  const houseKinds: DecorationKind[] = ["machiyaHouse", "nagayaRowHouse", "minkaHouse", "kuraStorehouse"];

  for (let z = 8; z < loopLength; z += 16) {
    decorations.push({
      kind: "torii",
      x: 0,
      z
    });
  }

  for (let index = 0, z = 4; z < loopLength; index += 1, z += 5) {
    decorations.push(
      {
        kind: "bambooCluster",
        x: -4.5 - (index % 3) * 0.25,
        z
      },
      {
        kind: "bambooCluster",
        x: 4.5 + (index % 2) * 0.25,
        z: z + 2.2
      }
    );

    if (index % 3 === 0) {
      decorations.push({
        kind: "stoneLantern",
        x: index % 2 === 0 ? -3.6 : 3.6,
        z: z + 1
      });
    }
  }

  for (let index = 0, z = 0; z < loopLength + 4; index += 1, z += 4) {
    decorations.push(
      {
        kind: houseKinds[index % houseKinds.length],
        x: leftHouseX - (index % 2) * 0.18,
        z,
        rotationY: Math.PI * 0.5,
        scale: getHouseScale(index)
      },
      {
        kind: houseKinds[(index + 2) % houseKinds.length],
        x: rightHouseX + (index % 2) * 0.18,
        z: z + 2,
        rotationY: -Math.PI * 0.5,
        scale: getHouseScale(index + 2)
      }
    );
  }

  return decorations;
}

function getHouseScale(index: number): number {
  const scales = [1.72, 1.56, 1.64, 1.82];
  return scales[index % scales.length];
}
