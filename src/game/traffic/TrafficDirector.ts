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
  /** Whether coins appear at this row — coins come in clusters with gaps, not one line. */
  coin: boolean;
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
  private denseRun = 0; // consecutive 2-car rows (cap → avoid an endless gauntlet)
  private coinOn = false; // coin cluster vs gap toggle (first row flips it on → start with coins)
  private coinLeft = 0; // rows left in the current coin cluster/gap

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
    this.coinOn = false;
    this.coinLeft = 0;
  }

  /** Whether a coin should appear at this track position (clusters with gaps). */
  coinAt(z: number): boolean {
    return this.config(this.keyForZ(z)).coin;
  }

  /** Advance the coin cluster/gap toggle one row and report if this row has coins. */
  private nextCoin(): boolean {
    if (this.coinLeft <= 0) {
      this.coinOn = !this.coinOn;
      // clusters ~2–3 rows of coins, gaps ~2–3 rows without
      this.coinLeft = 2 + Math.floor(Math.random() * 2);
    }
    this.coinLeft -= 1;
    return this.coinOn;
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
    return this.configs.get(key) ?? { blocked: [], safe: 0, coin: false };
  }

  /** The open/safe lane at a track position — where coins go. */
  safeLaneForZ(z: number): LaneIndex {
    return this.config(this.keyForZ(z)).safe;
  }

  private generate(key: number): RowConfig {
    const coin = this.nextCoin();
    // Just a 1-row clear runway at spawn (no obstacle the instant you start).
    if (key < 1) {
      this.corridor = 0;
      return { blocked: [], safe: 0, coin: true };
    }
    const distance = this.rowStart + key * this.rowGap;
    const d = Math.max(0, Math.min(1, (distance - RAMP_START) / (RAMP_FULL - RAMP_START)));

    // Dense from the start (few empty rows), ramping to a near-constant gauntlet.
    const r = Math.random();
    const p0 = 0.06 - 0.04 * d; // 6% → 2% empty rows
    const p2 = 0.46 + 0.44 * d; // 46% → 90% two-car rows
    let blockCount = r < p0 ? 0 : r < 1 - p2 ? 1 : 2;
    // Spread caps: never two empty rows back-to-back; allow up to 3 dense rows for intensity.
    if (blockCount === 0 && this.emptyRun >= 1) blockCount = 1;
    if (blockCount === 2 && this.denseRun >= 3) blockCount = 1;

    const c = this.corridor;
    const adj = LANES.filter((l) => Math.abs(l - c) <= 1); // lanes the player can step to this row
    // How often an obstacle sits IN the corridor and forces a weave — frequent even early,
    // always to an open neighbour so the corridor stays connected + clear (navigable).
    const wantShift = Math.random() < 0.5 + 0.3 * d;
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
        return { blocked: pick.blocked, safe: this.corridor, coin };
      }
    }
    this.emptyRun += 1; // fallback (never reached: blockCount 0 always keeps the corridor open)
    this.denseRun = 0;
    return { blocked: [], safe: c, coin };
  }

  private prune(upTo: number): void {
    for (const key of this.configs.keys()) {
      if (key < upTo - 40) {
        this.configs.delete(key);
      }
    }
  }
}
