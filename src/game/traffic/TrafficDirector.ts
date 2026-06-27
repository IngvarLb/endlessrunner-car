import type { LaneIndex } from "../../app/GameConfig";

const LANES: LaneIndex[] = [-1, 0, 1];

// Difficulty ramp (mirrors TrafficSystem): obstacle density rises with distance.
const RAMP_START = 160; // m: calm intro
const RAMP_FULL = 2400; // m: full density deep into a run

export type RowConfig = {
  /** Lanes occupied by cars this row (0–2, never all 3). */
  blocked: LaneIndex[];
  /** A guaranteed-reachable open lane (coins are funnelled here). */
  safe: LaneIndex;
};

function shuffled<T>(items: T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Every size-`k` subset of LANES (k = 0,1,2), in random order. */
function laneSubsets(k: number): LaneIndex[][] {
  if (k <= 0) return [[]];
  if (k === 1) return shuffled(LANES).map((l) => [l]);
  const pairs: LaneIndex[][] = [
    [-1, 0],
    [-1, 1],
    [0, 1]
  ];
  return shuffled(pairs);
}

/**
 * Procedural traffic director — an endless, always-different sequence of obstacle
 * rows that is FAIR BY CONSTRUCTION. Rows sit `rowGap` apart, so between any two the
 * player can move only one lane; the generator therefore always keeps at least one
 * open lane reachable from the previous row, and the path can never dead-end.
 * Density (cars per row) ramps up with distance. Re-seeded per run via Math.random,
 * so no two runs — and no two loops within a run — are the same.
 */
export class TrafficDirector {
  readonly rowStart: number;
  readonly rowGap: number;
  private readonly configs = new Map<number, RowConfig>();
  private reachable: Set<LaneIndex> = new Set(LANES);
  private frontier = -1; // highest rowKey generated so far

  constructor(rowStart: number, rowGap: number) {
    this.rowStart = rowStart;
    this.rowGap = rowGap;
  }

  /** Start a fresh run: clear the sequence and let the player begin anywhere. */
  reset(): void {
    this.configs.clear();
    this.reachable = new Set(LANES);
    this.frontier = -1;
  }

  /** Row index for a track position. */
  keyForZ(z: number): number {
    return Math.round((z - this.rowStart) / this.rowGap);
  }

  /** Config for a row index (generated on demand, in order). */
  config(key: number): RowConfig {
    const existing = this.configs.get(key);
    if (existing) {
      return existing;
    }
    // Generate forward from the frontier so reachability stays correct in order.
    for (let k = this.frontier + 1; k <= key; k += 1) {
      this.configs.set(k, this.generate(k));
      this.frontier = k;
      if (k % 64 === 0) {
        this.prune(k);
      }
    }
    return this.configs.get(key) ?? { blocked: [], safe: 0 };
  }

  /** The open/safe lane at a track position — where coins go. */
  safeLaneForZ(z: number): LaneIndex {
    return this.config(this.keyForZ(z)).safe;
  }

  private generate(key: number): RowConfig {
    // A short clear runway at the very start of each run (no instant wall in your face).
    if (key < 2) {
      this.reachable = new Set(LANES);
      return { blocked: [], safe: 0 };
    }
    const distance = this.rowStart + key * this.rowGap;
    const d = Math.max(0, Math.min(1, (distance - RAMP_START) / (RAMP_FULL - RAMP_START)));

    // Density weights: early runs are mostly 0–1 blocked; later up to half are 2-blocked.
    const r = Math.random();
    const p0 = 0.3 - 0.2 * d; // 30% → 10% empty rows
    const p2 = 0.05 + 0.45 * d; // 5% → 50% two-blocked
    let blockCount = r < p0 ? 0 : r < 1 - p2 ? 1 : 2;

    // Find a blocked set of the chosen size that keeps an open lane reachable; if none
    // works (rare), step the density down — 0 blocked is always reachable.
    for (; blockCount >= 0; blockCount -= 1) {
      for (const blocked of laneSubsets(blockCount)) {
        const open = LANES.filter((l) => !blocked.includes(l));
        const reachableOpen = open.filter((l) => [...this.reachable].some((p) => Math.abs(l - p) <= 1));
        if (reachableOpen.length > 0) {
          this.reachable = new Set(reachableOpen);
          const safe = reachableOpen[Math.floor(Math.random() * reachableOpen.length)];
          return { blocked, safe };
        }
      }
    }
    // Unreachable fallback (shouldn't happen): clear row.
    this.reachable = new Set(LANES);
    return { blocked: [], safe: 0 };
  }

  private prune(upTo: number): void {
    for (const key of this.configs.keys()) {
      if (key < upTo - 40) {
        this.configs.delete(key);
      }
    }
  }
}
