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
  // The guaranteed always-open lane the player can follow — each row's corridor is within
  // one lane of the previous and never blocked, so a single real player (not a "union of
  // maybe-positions") can always thread it. Coins ride this lane.
  private corridor: LaneIndex = 0;
  private frontier = -1; // highest rowKey generated so far
  private emptyRun = 0; // consecutive empty rows (cap → avoid long barren stretches)
  private denseRun = 0; // consecutive 2-car rows (cap → avoid a gauntlet)

  constructor(rowStart: number, rowGap: number) {
    this.rowStart = rowStart;
    this.rowGap = rowGap;
  }

  /** Start a fresh run: clear the sequence and let the player begin anywhere. */
  reset(): void {
    this.configs.clear();
    this.corridor = 0;
    this.frontier = -1;
    this.emptyRun = 0;
    this.denseRun = 0;
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
      this.corridor = 0;
      return { blocked: [], safe: 0 };
    }
    const distance = this.rowStart + key * this.rowGap;
    const d = Math.max(0, Math.min(1, (distance - RAMP_START) / (RAMP_FULL - RAMP_START)));

    // Density weights: early runs are mostly 0–1 blocked; later up to half are 2-blocked.
    const r = Math.random();
    const p0 = 0.3 - 0.2 * d; // 30% → 10% empty rows
    const p2 = 0.05 + 0.45 * d; // 5% → 50% two-blocked
    let blockCount = r < p0 ? 0 : r < 1 - p2 ? 1 : 2;
    // Even out the spread: no more than 2 empty rows in a row, no more than 2 dense rows.
    if (blockCount === 0 && this.emptyRun >= 2) blockCount = 1;
    if (blockCount === 2 && this.denseRun >= 2) blockCount = 1;

    const c = this.corridor;
    const adj = LANES.filter((l) => Math.abs(l - c) <= 1); // lanes the player can step to this row
    // How often an obstacle is placed IN the corridor to force a lane switch — rises with
    // distance, so early runs let you cruise and later ones make you weave. Always to an
    // open neighbour, so the corridor stays connected + clear (navigable by construction).
    const wantShift = Math.random() < 0.18 + 0.4 * d;
    for (; blockCount >= 0; blockCount -= 1) {
      let keepOpen: { blocked: LaneIndex[]; openAdj: LaneIndex[] } | undefined;
      let shift: { blocked: LaneIndex[]; openAdj: LaneIndex[] } | undefined;
      for (const blocked of laneSubsets(blockCount)) {
        const openAdj = adj.filter((l) => !blocked.includes(l));
        if (openAdj.length === 0) {
          continue; // would trap the corridor — reject
        }
        if (blocked.includes(c)) {
          shift ??= { blocked, openAdj }; // blocks the corridor → forces a step to a neighbour
        } else {
          keepOpen ??= { blocked, openAdj }; // leaves the corridor lane open
        }
      }
      const pick = wantShift && shift ? shift : keepOpen ?? shift;
      if (pick) {
        this.corridor = pick.openAdj.includes(c) ? c : pick.openAdj[Math.floor(Math.random() * pick.openAdj.length)];
        this.emptyRun = pick.blocked.length === 0 ? this.emptyRun + 1 : 0;
        this.denseRun = pick.blocked.length >= 2 ? this.denseRun + 1 : 0;
        return { blocked: pick.blocked, safe: this.corridor };
      }
    }
    this.emptyRun += 1; // fallback (never reached: blockCount 0 always keeps the corridor open)
    this.denseRun = 0;
    return { blocked: [], safe: c };
  }

  private prune(upTo: number): void {
    for (const key of this.configs.keys()) {
      if (key < upTo - 40) {
        this.configs.delete(key);
      }
    }
  }
}
