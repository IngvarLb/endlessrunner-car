/**
 * Macro-biome selector for the endless run. The world alternates between long "legs"
 * by absolute track distance: leg 0 = village (with its own village↔autumn season
 * sub-cycle), leg 1 = neon city, leg 2 = village, … . Pure logic (no THREE): the run
 * scene asks it which biome a given prop/segment z belongs to (drives the recycle-time
 * visibility swap) and what the eased biome target is for the camera distance (drives
 * the sky/fog/road crossfade).
 */
export type MacroBiomeIndex = 0 | 1;

export class BiomeManager {
  constructor(
    private readonly legLength: number,
    private readonly biomeCount = 2
  ) {}

  /** Macro-biome index for an absolute forward track-z (0 = village, 1 = city). */
  biomeIndexForZ(absoluteZ: number): MacroBiomeIndex {
    const leg = Math.floor(absoluteZ / this.legLength);
    const idx = ((leg % this.biomeCount) + this.biomeCount) % this.biomeCount;
    return (idx === 1 ? 1 : 0) as MacroBiomeIndex;
  }

  /** Eased crossfade TARGET [0 = village, 1 = city] for the camera's current distance. */
  biomeLevelForDistance(distance: number): number {
    return this.biomeIndexForZ(distance) === 1 ? 1 : 0;
  }
}
