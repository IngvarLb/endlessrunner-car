import type { LaneIndex } from "../../app/GameConfig";

export class LaneSystem {
  readonly lanes: readonly LaneIndex[] = [-1, 0, 1];

  constructor(readonly laneWidth: number) {}

  getLaneX(lane: LaneIndex): number {
    return lane * this.laneWidth;
  }

  canMove(currentLane: LaneIndex, direction: -1 | 1): boolean {
    return this.isLane((currentLane + direction) as number);
  }

  move(currentLane: LaneIndex, direction: -1 | 1): LaneIndex {
    const nextLane = (currentLane + direction) as LaneIndex;
    if (!this.isLane(nextLane)) {
      return currentLane;
    }

    return nextLane;
  }

  worldToLaneX(x: number): LaneIndex {
    const nearest = Math.round(x / this.laneWidth);
    if (nearest <= -1) {
      return -1;
    }

    if (nearest >= 1) {
      return 1;
    }

    return 0;
  }

  isLane(value: number): value is LaneIndex {
    return value === -1 || value === 0 || value === 1;
  }
}
