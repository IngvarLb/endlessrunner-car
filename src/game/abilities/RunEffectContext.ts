/**
 * Bridge between ability effects and the run-time systems. Effects only ever
 * touch the run through this surface, so they stay engine-agnostic and the
 * RunScene decides how each capability is fulfilled. Grown per ability as new
 * effects land (traffic clear, coin rain, player scale, camera/scene VFX, …).
 */
export type RunEffectContext = {
  runner: {
    /** Boost for `durationSec`; while boosting, traffic in the path is rammed through. */
    boost(durationSec: number): void;
    /** End the boost immediately. */
    clearBoost(): void;
  };
};
