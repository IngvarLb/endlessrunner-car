/**
 * Macro-biome selector for the endless run. The world cycles through long "legs" by
 * absolute track distance: leg 0 = village (with its own village↔autumn season sub-cycle),
 * leg 1 = neon city, leg 2 = mountain-forest valley, then back to village … . Pure logic
 * (no THREE): the run scene asks which biome a given prop/segment z belongs to (drives the
 * recycle-time visibility swap) and which biome the camera is currently in (drives the
 * sky/fog/road atmosphere crossfade toward that biome's preset).
 */
export class BiomeManager {
  constructor(
    private readonly legLength: number,
    private readonly biomeCount = 3
  ) {}

  /** Macro-biome index (0..count-1) for an absolute forward track-z. */
  biomeIndexForZ(absoluteZ: number): number {
    const leg = Math.floor(absoluteZ / this.legLength);
    return ((leg % this.biomeCount) + this.biomeCount) % this.biomeCount;
  }

  /** The macro-biome the camera is currently in (atmosphere eases toward its preset). */
  legIndexForDistance(distance: number): number {
    return this.biomeIndexForZ(distance);
  }
}
