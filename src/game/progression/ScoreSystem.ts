export type RunStats = {
  score: number;
  distance: number;
  coins: number;
  combo: number;
  pressure: number;
  weakFails: number;
};

export class ScoreSystem {
  private distance = 0;
  private coins = 0;
  private combo = 0;
  private score = 0;

  reset(): void {
    this.distance = 0;
    this.coins = 0;
    this.combo = 0;
    this.score = 0;
  }

  updateDistance(distance: number): void {
    this.distance = distance;
    this.recalculate();
  }

  addCoin(amount = 1): void {
    this.coins += amount;
    this.combo += amount;
    this.recalculate();
  }

  resetCombo(): void {
    this.combo = 0;
    this.recalculate();
  }

  getStats(pressure: number, weakFails: number): RunStats {
    return {
      score: this.score,
      distance: this.distance,
      coins: this.coins,
      combo: this.combo,
      pressure,
      weakFails
    };
  }

  private recalculate(): void {
    this.score = Math.floor(this.distance * 10 + this.coins * 125 + this.combo * 18);
  }
}
