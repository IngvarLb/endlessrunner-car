import type { TrafficRowDefinition } from "../traffic/TrafficTypes";

export type DecorationKind =
  | "torii"
  | "bambooCluster"
  | "mapleTree"
  | "stoneLantern"
  | "machiyaHouse"
  | "minkaHouse"
  | "nagayaRowHouse"
  | "kuraStorehouse"
  // 電脳都市 Neon Cyber-City props
  | "cyberSlabTower"
  | "cyberSetbackTower"
  | "cyberCapsuleTower"
  | "cyberOfficeMidrise"
  | "neonShophouse"
  | "pachinkoFacade"
  | "capsuleHotelBlock"
  | "rooftopBillboard"
  | "verticalKanjiBlade"
  | "hologramAdPanel"
  | "expresswaySignGantry"
  | "glassSkybridge"
  | "monorailPillar"
  | "cyberStreetLamp"
  | "vendingMachineBank"
  | "trafficSignal"
  | "utilityPoleWires"
  | "concreteSteelBarrier"
  | "neonSakuraTree"
  | "litGinkgoTree"
  | "planterHedge"
  | "broadcastTower"
  | "distantTowerCluster"
  | "reflectorStrip"
  | "drainGrateKerb"
  | "busLaneMarking";

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

  // Torii as occasional landmarks (every 60 m, evenly across the loop) rather
  // than a continuous tunnel of arches.
  for (let z = 8; z < loopLength; z += 60) {
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

  // 紅葉 Momiji maples lining the road just inside the houses — leafy green in the
  // village leg, blazing crimson/orange/gold in the autumn leg. Staggered both sides.
  for (let index = 0, z = 6; z < loopLength; index += 1, z += 9.5) {
    const side = index % 2 === 0 ? -1 : 1;
    decorations.push(
      {
        kind: "mapleTree",
        x: side * (5.0 + (index % 3) * 0.3),
        z,
        rotationY: index * 1.3,
        scale: 1.0 + (index % 4) * 0.12
      },
      {
        kind: "mapleTree",
        x: -side * (5.2 + (index % 2) * 0.4),
        z: z + 4.5,
        rotationY: index * 2.1 + 1,
        scale: 0.92 + (index % 3) * 0.14
      }
    );
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

/**
 * 電脳都市 Neon Cyber-City roadside layout (against the SAME 120 m content loop as the
 * village). A separate decoration pool, biome-tagged so the run scene shows it only in
 * the city macro-leg. Skyline landmarks (broadcast tower, distant cluster) are NOT here —
 * they live in a camera-anchored skyline group built by the run scene.
 */
export function createNeonCityDecorations(): DecorationPlacement[] {
  const d: DecorationPlacement[] = [];
  const loop = FEUDAL_JAPAN_CONTENT_LOOP_LENGTH;
  const leftX = -6.95;
  const rightX = 6.95;
  const buildings: DecorationKind[] = [
    "cyberSlabTower",
    "cyberSetbackTower",
    "cyberCapsuleTower",
    "cyberOfficeMidrise",
    "neonShophouse",
    "pachinkoFacade",
    "capsuleHotelBlock"
  ];

  // A continuous wall of towers/buildings flush on both sides, facing the road.
  for (let i = 0, z = 0; z < loop + 4; i += 1, z += 6) {
    d.push({
      kind: buildings[i % buildings.length],
      x: leftX - (i % 2) * 0.2,
      z,
      rotationY: Math.PI * 0.5,
      scale: 0.92 + (i % 3) * 0.12
    });
    d.push({
      kind: buildings[(i + 3) % buildings.length],
      x: rightX + (i % 2) * 0.2,
      z: z + 3,
      rotationY: -Math.PI * 0.5,
      scale: 0.92 + ((i + 1) % 3) * 0.12
    });
  }

  // Overhead arches spanning the road (x=0): sign gantry / glass skybridge alternating.
  for (let i = 0, z = 16; z < loop; i += 1, z += 34) {
    d.push({ kind: i % 2 === 0 ? "expresswaySignGantry" : "glassSkybridge", x: 0, z });
  }

  // Monorail pillars just inside the building line.
  for (let z = 26; z < loop; z += 50) {
    d.push({ kind: "monorailPillar", x: z % 100 < 50 ? -6.1 : 6.1, z });
  }

  // Street furniture along the sidewalk shelf, staggered both sides, facing the road.
  const furniture: DecorationKind[] = [
    "cyberStreetLamp",
    "vendingMachineBank",
    "trafficSignal",
    "utilityPoleWires",
    "neonSakuraTree",
    "verticalKanjiBlade",
    "litGinkgoTree",
    "hologramAdPanel",
    "planterHedge"
  ];
  for (let i = 0, z = 5; z < loop; i += 1, z += 7) {
    const side = i % 2 === 0 ? -1 : 1;
    d.push({
      kind: furniture[i % furniture.length],
      x: side * (4.7 + (i % 3) * 0.4),
      z,
      rotationY: side < 0 ? Math.PI * 0.5 : -Math.PI * 0.5
    });
  }

  // Hard elevated-expressway edge: crash barriers + glowing reflector cat's-eyes.
  for (let z = 0; z < loop; z += 8) {
    d.push({ kind: "concreteSteelBarrier", x: -3.2, z });
    d.push({ kind: "concreteSteelBarrier", x: 3.2, z });
  }
  for (let z = 0; z < loop; z += 9) {
    d.push({ kind: "reflectorStrip", x: -3.02, z });
    d.push({ kind: "reflectorStrip", x: 3.02, z });
  }
  // Kerb/drain units + a painted bus lane.
  for (let z = 12; z < loop; z += 20) {
    d.push({ kind: "drainGrateKerb", x: -3.3, z });
    d.push({ kind: "drainGrateKerb", x: 3.3, z });
  }
  for (let z = 10; z < loop; z += 22) {
    d.push({ kind: "busLaneMarking", x: 2.0, z });
  }

  // Distant skyline backdrop, set far beyond the buildings (parallax fill in the fog):
  // one broadcast-tower landmark + a few simplified tower clusters.
  d.push({ kind: "broadcastTower", x: -33, z: 44, scale: 1.05 });
  for (let i = 0, z = 18; z < loop; i += 1, z += 38) {
    d.push({ kind: "distantTowerCluster", x: i % 2 === 0 ? 34 : -36, z });
  }
  // A couple of rooftop billboards perched on their trusses among the street props.
  for (let z = 30; z < loop; z += 56) {
    d.push({ kind: "rooftopBillboard", x: z % 112 < 56 ? -7.4 : 7.4, z, rotationY: z % 112 < 56 ? Math.PI * 0.5 : -Math.PI * 0.5 });
  }

  return d;
}

export const NEON_CITY_DECORATIONS: DecorationPlacement[] = createNeonCityDecorations();
