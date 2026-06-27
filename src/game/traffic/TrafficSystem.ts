import type * as THREE from "three";
import type { LaneIndex } from "../../app/GameConfig";
import { CollisionSystem } from "../../engine/physics/CollisionSystem";
import { RunnerController } from "../runner/RunnerController";
import { LaneSystem } from "../world/LaneSystem";
import { TrafficCar, type TrafficCarDefinition } from "./TrafficCar";

export type TrafficCarHit = {
  car: TrafficCar;
  /** True for a side contact (player or car was changing lanes); false for a rear-end. */
  side: boolean;
};

export type TrafficCarDestroyed = {
  car: TrafficCar;
  /** Coins to award for this kill (>0 only when rammed during 将 Nachtjagd). */
  coins: number;
};

// Car-following (longitudinal) — centre-to-centre gaps in metres.
const LEAD_LOOKAHEAD = 30;
const FOLLOW_SLOW_GAP = 12; // start easing off the throttle below this gap (early + smooth)
const FOLLOW_STOP_GAP = 4.6; // hold this much space from the leader (no bumper-to-bumper stacking)
const FOLLOW_OVERLAP_GAP = 2.2; // ~touching — brake to a crawl to avoid overlapping

// Overtaking (lateral).
const OVERTAKE_LEAD_GAP = 17; // start the pass while still well back, so it never bunches up first
const OVERTAKE_SPEED_MARGIN = 0.25; // ...as long as it's faster than the car ahead
const OVERTAKE_CLEAR_AHEAD = 9; // room needed ahead in the target lane to pull in
const OVERTAKE_CLEAR_BEHIND = 4; // ...and behind
const OVERTAKE_SIGNAL_SECONDS = 2; // blink this long before actually moving over

// Fairness — never let three lanes block within WALL_BAND metres in the player's view,
// so there is always an open lane within reach (sometimes only after a car gives way).
const WALL_NEAR = 2.5;
const WALL_FAR = 56;
const WALL_BAND = 8;
const WALL_BRAKE_SECONDS = 1.2;
const ANTICIPATE_FAR = 30; // pre-empt a wall this far out, while it's still only two-wide
const ANTICIPATE_BEHIND = 9; // ...by holding back a car this far behind the open lane's band

// Difficulty ramp — NPCs make discretionary lane changes (on top of overtaking) that
// get more frequent the further you drive. Each is still blinker-telegraphed and
// gap/wall-checked, so there's always a readable, fair escape.
const DIFFICULTY_RAMP_START = 160; // metres: calm intro before any churn
const DIFFICULTY_RAMP_FULL = 2400; // metres: flatter ramp — full difficulty only deep into a run
const LANE_CHURN_RATE_MAX = 0.1; // per car, per second, at full difficulty (less frequent than before)

export class TrafficSystem {
  private readonly cars: TrafficCar[] = [];
  /** While set, cars in this lane are knocked aside instead of failing (藍 Freie Bahn). */
  private shieldedLane?: LaneIndex;
  /** While set, any car rammed is destroyed for this many coins (将 Nachtjagd). */
  private ramCoins?: number;
  /** While set, a tapped car can be lifted for this many coins (鬼 Schwarzes Loch). */
  private liftCoins?: number;

  constructor(
    private readonly runner: RunnerController,
    private readonly laneSystem: LaneSystem,
    private readonly collisionSystem: CollisionSystem,
    private readonly getDistance: () => number,
    private readonly onHit: (hit: TrafficCarHit) => void,
    private readonly onDestroyed?: (destroyed: TrafficCarDestroyed) => void
  ) {}

  add(definition: TrafficCarDefinition): TrafficCar {
    const car = new TrafficCar(definition, this.laneSystem, this.getDistance);
    this.cars.push(car);
    this.collisionSystem.register(car);
    return car;
  }

  update(dt: number, isRunning: boolean, worldLength: number): void {
    if (isRunning) {
      this.think(dt);
    }

    for (const car of this.cars) {
      car.update(dt, isRunning);

      if (!car.hit && isRunning && this.collisionSystem.queryPair(this.runner, car)) {
        // Side hit = lateral contact (player just swerved, or the car is merging into us);
        // otherwise it's a straight rear-end (driving into the back of a car ahead).
        const side = this.runner.isLaneChanging() || car.isMerging();
        if (
          this.runner.isBoosting() ||
          this.runner.isInvincible() ||
          (this.shieldedLane !== undefined && this.runner.getLane() === this.shieldedLane)
        ) {
          // 赤 Boost / 狐 Titan / 藍 Freie Bahn knock any car aside (rear too) — even one
          // mid-give-way (wins over isYielding, so you never phase through).
          car.hit = true;
          car.mesh.visible = false;
          this.onDestroyed?.({ car, coins: 0 });
        } else if (this.ramCoins !== undefined && side) {
          // 将 Nachtjagd: SIDE ram only → coins + a crumpled wreck (rear-ending is fatal).
          car.wreck();
          this.runner.bounceBack(); // recoil to our lane — don't slide into the wreck
          this.onDestroyed?.({ car, coins: this.ramCoins });
        } else if (this.ramCoins === undefined && car.isYielding()) {
          // 藍 Lichthupe: the car is actively giving way — slip past it harmlessly.
        } else {
          // Fatal crash (rear-end, or a normal collision): the car you hit becomes a
          // smoking wreck — every crash, not just Nachtjagd.
          if (side) {
            this.runner.bounceBack(); // 将 Draufgänger survives this — don't glitch into the car
          }
          car.wreck();
          this.onHit({ car, side });
        }
      }

      if (car.trackZ - this.getDistance() < -14) {
        car.recycle(worldLength);
      }
    }
  }

  /**
   * Per-frame traffic AI: cars cruise at their own (varied) speeds, follow/brake to
   * avoid rear-ending, overtake slower cars, weave between lanes more as difficulty
   * rises, and a fairness guard keeps at least one lane open near the player.
   */
  private think(dt: number): void {
    const churnRate = LANE_CHURN_RATE_MAX * this.difficulty();
    for (const car of this.cars) {
      if (car.hit || !car.mesh.visible) {
        continue;
      }
      car.driveToward(this.followingTarget(car), dt);
    }
    for (const car of this.cars) {
      if (car.hit || !car.mesh.visible) {
        continue;
      }
      this.considerOvertake(car);
      this.considerLaneChurn(car, dt, churnRate);
    }
    this.cancelStaleSignals();
    this.ensureNoWall();
  }

  /** 0 at the start, ramping to 1 by DIFFICULTY_RAMP_FULL metres. */
  private difficulty(): number {
    const span = DIFFICULTY_RAMP_FULL - DIFFICULTY_RAMP_START;
    return Math.max(0, Math.min(1, (this.getDistance() - DIFFICULTY_RAMP_START) / span));
  }

  /**
   * Discretionary lane change (not driven by a slow leader): the further you've come,
   * the more often NPCs switch lanes, adding pressure. Still blinker-telegraphed and
   * gap/wall-checked, so the player always gets warning and a fair gap.
   */
  private considerLaneChurn(car: TrafficCar, dt: number, ratePerSecond: number): void {
    if (ratePerSecond <= 0 || !car.canChangeLane() || Math.random() >= ratePerSecond * dt) {
      return;
    }
    const to = this.clearAdjacentLane(car, OVERTAKE_CLEAR_AHEAD, OVERTAKE_CLEAR_BEHIND);
    if (to !== undefined && !this.wouldCreateWall(car, to)) {
      car.signalToLane(to, OVERTAKE_SIGNAL_SECONDS);
    }
  }

  /** Drop a pending blink if its target lane filled up (or would now wall the player). */
  private cancelStaleSignals(): void {
    for (const car of this.cars) {
      if (car.hit || !car.mesh.visible || !car.isSignalling() || car.pendingLane === null) {
        continue;
      }
      // Only abort on a genuine conflict (a car about to be where we'd merge) or a
      // wall — a transient car further up the target lane shouldn't cancel the plan.
      const blocked = !this.laneClear(car.pendingLane, car.trackZ, 6, 3, car);
      if (blocked || this.wouldCreateWall(car, car.pendingLane)) {
        car.cancelSignal();
      }
    }
  }

  /** Target speed honouring the leader ahead in the same lane (car-following). */
  private followingTarget(car: TrafficCar): number {
    const lead = this.leadInLane(car.lane, car.trackZ, car);
    if (!lead) {
      return car.cruiseSpeed;
    }
    const gap = lead.trackZ - car.trackZ;
    // Already signalling a pass: keep momentum and pull out rather than braking into a
    // stack behind the slower car — only ease off if a rear-end is actually imminent.
    if (car.isSignalling() && gap > FOLLOW_STOP_GAP) {
      return car.cruiseSpeed;
    }
    if (gap >= FOLLOW_SLOW_GAP) {
      return car.cruiseSpeed;
    }
    if (gap <= FOLLOW_STOP_GAP) {
      const closeness = Math.max(0, (gap - FOLLOW_OVERLAP_GAP) / (FOLLOW_STOP_GAP - FOLLOW_OVERLAP_GAP));
      return Math.min(car.cruiseSpeed, lead.speed * closeness);
    }
    const t = (gap - FOLLOW_STOP_GAP) / (FOLLOW_SLOW_GAP - FOLLOW_STOP_GAP);
    return Math.min(car.cruiseSpeed, lead.speed + t * (car.cruiseSpeed - lead.speed));
  }

  /**
   * Resolve a slow car ahead: the held-up car pulls into a clear lane to go around;
   * if it can't, it nudges the slow leader to pull aside (if the leader has room) —
   * so a faster car never just stacks up behind a slower one.
   */
  private considerOvertake(car: TrafficCar): void {
    if (!car.canChangeLane()) {
      return;
    }
    const lead = this.leadInLane(car.lane, car.trackZ, car);
    if (!lead) {
      return;
    }
    const gap = lead.trackZ - car.trackZ;
    // Compare against the leader's CURRENT speed, not its cruise: a fast car stuck
    // behind a slow one is itself crawling, and the car behind it must still pass.
    if (gap > OVERTAKE_LEAD_GAP || car.cruiseSpeed - lead.speed < OVERTAKE_SPEED_MARGIN) {
      return;
    }
    // 1) Go around — pull into a clear adjacent lane.
    const to = this.clearAdjacentLane(car, OVERTAKE_CLEAR_AHEAD, OVERTAKE_CLEAR_BEHIND);
    if (to !== undefined && !this.wouldCreateWall(car, to)) {
      car.signalToLane(to, OVERTAKE_SIGNAL_SECONDS); // blink first, then merge
      return;
    }
    // 2) Boxed in — ask the slow leader to make way, if it has a clear lane of its own.
    if (lead.canChangeLane()) {
      const leadTo = this.clearAdjacentLane(lead, OVERTAKE_CLEAR_AHEAD, OVERTAKE_CLEAR_BEHIND);
      if (leadTo !== undefined && !this.wouldCreateWall(lead, leadTo)) {
        lead.signalToLane(leadTo, OVERTAKE_SIGNAL_SECONDS);
      }
    }
  }

  /**
   * Fairness guard: if any three lanes block within WALL_BAND metres ahead of the
   * player, brake the rearmost car of that cluster so it drops back and a lane opens.
   */
  private ensureNoWall(): void {
    const distance = this.getDistance();
    const laneCount = this.laneSystem.lanes.length;
    const ahead = this.cars
      .filter((car) => {
        if (car.hit || !car.mesh.visible) {
          return false;
        }
        const rel = car.trackZ - distance;
        return rel > WALL_NEAR && rel < WALL_FAR;
      })
      .sort((a, b) => a.trackZ - b.trackZ);

    for (let i = 0; i < ahead.length; i += 1) {
      const origin = ahead[i];
      const band: TrafficCar[] = [];
      const lanes = new Set<LaneIndex>();
      for (let j = i; j < ahead.length; j += 1) {
        if (ahead[j].trackZ - origin.trackZ > WALL_BAND) {
          break;
        }
        band.push(ahead[j]);
        for (const lane of ahead[j].occupiedLanes()) {
          lanes.add(lane); // a mid-merge car spans two lanes — count both
        }
      }
      if (lanes.size >= laneCount) {
        // Already a full wall: brake the rearmost so it drops back and its lane opens.
        origin.requestBrake(WALL_BRAKE_SECONDS);
      } else if (lanes.size === laneCount - 1 && origin.trackZ - distance < ANTICIPATE_FAR) {
        // Two-wide and near: stop it closing into a wall by holding back a car that's
        // approaching the band in the still-open lane.
        const open = this.laneSystem.lanes.find((lane) => !lanes.has(lane));
        if (open !== undefined) {
          this.wallCompleter(open, origin.trackZ, band)?.requestBrake(WALL_BRAKE_SECONDS);
        }
      }
    }
  }

  /** A car in `lane` at/just behind the band that would soon close it into a full wall. */
  private wallCompleter(lane: LaneIndex, bandZ: number, band: TrafficCar[]): TrafficCar | undefined {
    let best: TrafficCar | undefined;
    let bestDz = Infinity;
    for (const car of this.cars) {
      if (car.hit || !car.mesh.visible || car.lane !== lane || band.includes(car)) {
        continue;
      }
      const dz = car.trackZ - bandZ;
      if (dz >= -ANTICIPATE_BEHIND && dz <= WALL_BAND && Math.abs(dz) < bestDz) {
        bestDz = Math.abs(dz);
        best = car;
      }
    }
    return best;
  }

  /** Nearest car ahead in `lane` within the follow lookahead. */
  private leadInLane(lane: LaneIndex, trackZ: number, except: TrafficCar): TrafficCar | undefined {
    let best: TrafficCar | undefined;
    let bestGap = LEAD_LOOKAHEAD;
    for (const car of this.cars) {
      if (car === except || car.hit || !car.mesh.visible || car.lane !== lane) {
        continue;
      }
      const gap = car.trackZ - trackZ;
      if (gap > 0 && gap < bestGap) {
        bestGap = gap;
        best = car;
      }
    }
    return best;
  }

  /** True if `lane` has no other car within [trackZ - behind, trackZ + ahead]. */
  private laneClear(lane: LaneIndex, trackZ: number, ahead: number, behind: number, except: TrafficCar): boolean {
    for (const car of this.cars) {
      if (car === except || car.hit || !car.mesh.visible || car.lane !== lane) {
        continue;
      }
      const dz = car.trackZ - trackZ;
      if (dz <= ahead && dz >= -behind) {
        return false;
      }
    }
    return true;
  }

  /** A clear adjacent lane (prefers the one with the most open road ahead), or undefined. */
  private clearAdjacentLane(car: TrafficCar, ahead: number, behind: number): LaneIndex | undefined {
    const options = this.laneSystem.lanes.filter(
      (lane) => Math.abs(lane - car.lane) === 1 && this.laneClear(lane, car.trackZ, ahead, behind, car)
    );
    if (options.length === 0) {
      return undefined;
    }
    return options.reduce((best, lane) => {
      const leadLane = this.leadInLane(lane, car.trackZ, car);
      const leadBest = this.leadInLane(best, car.trackZ, car);
      const gapLane = leadLane ? leadLane.trackZ - car.trackZ : Infinity;
      const gapBest = leadBest ? leadBest.trackZ - car.trackZ : Infinity;
      return gapLane > gapBest ? lane : best;
    });
  }

  /**
   * Would moving `car` into `toLane` form a three-lane block within WALL_BAND?
   * The mover spans BOTH its current lane and the target while merging, and any other
   * mid-merge car spans two lanes too — so a swerve is only allowed when the remaining
   * lane stays open (no "swerve covers two lanes + a third car blocks all three").
   */
  private wouldCreateWall(car: TrafficCar, toLane: LaneIndex): boolean {
    const lanes = new Set<LaneIndex>([toLane, car.lane]);
    for (const other of this.cars) {
      if (other === car || other.hit || !other.mesh.visible) {
        continue;
      }
      if (Math.abs(other.trackZ - car.trackZ) <= WALL_BAND) {
        for (const lane of other.occupiedLanes()) {
          lanes.add(lane);
        }
      }
    }
    return lanes.size >= this.laneSystem.lanes.length;
  }

  reset(): void {
    this.shieldedLane = undefined;
    for (const car of this.cars) {
      car.reset();
    }
  }

  setLaneShield(lane: LaneIndex | undefined): void {
    this.shieldedLane = lane;
  }

  /** 将 Nachtjagd: ram any car for `coins` each (undefined to clear). */
  setRamMode(coins: number | undefined): void {
    this.ramCoins = coins;
  }

  /** 鬼 Schwarzes Loch: tapped cars become liftable for `coins` each (undefined to clear). */
  setLiftMode(coins: number | undefined): void {
    this.liftCoins = coins;
  }

  /**
   * 鬼 Schwarzes Loch: lift the live car under `raycaster` (the tap), pay its coins, and
   * float it up into the hole. Returns true if a car was lifted.
   */
  tryLift(raycaster: THREE.Raycaster, target?: { x: number; y: number; z: number }): boolean {
    if (this.liftCoins === undefined) {
      return false;
    }
    const distance = this.getDistance();
    let best: TrafficCar | undefined;
    let bestDist = Infinity;
    for (const car of this.cars) {
      if (car.hit || car.isLifted() || !car.mesh.visible) {
        continue;
      }
      const rel = car.trackZ - distance;
      if (rel < -2 || rel > 34) {
        continue; // only cars in view ahead are tappable
      }
      const hits = raycaster.intersectObject(car.mesh, true);
      if (hits.length > 0 && hits[0].distance < bestDist) {
        bestDist = hits[0].distance;
        best = car;
      }
    }
    if (best) {
      best.lift(target);
      this.onDestroyed?.({ car: best, coins: this.liftCoins });
      return true;
    }
    return false;
  }

  /** Up to `count` nearest live cars within `maxAheadZ` ahead (鬼 Anzapfen siphon). */
  nearestCars(count: number, maxAheadZ: number): TrafficCar[] {
    const distance = this.getDistance();
    return this.cars
      .filter((car) => {
        if (car.hit || !car.mesh.visible) {
          return false;
        }
        const rel = car.trackZ - distance;
        return rel > -2 && rel < maxAheadZ;
      })
      .sort((a, b) => a.trackZ - b.trackZ)
      .slice(0, count);
  }

  /** Nearest live car ahead within `maxAheadZ` metres (for 狐's turret targeting). */
  nearestCarAhead(maxAheadZ: number): TrafficCar | undefined {
    const distance = this.getDistance();
    let best: TrafficCar | undefined;
    let bestRel = Infinity;
    for (const car of this.cars) {
      if (car.hit || !car.mesh.visible) {
        continue;
      }
      const rel = car.trackZ - distance;
      if (rel < -2 || rel > maxAheadZ) {
        continue;
      }
      if (rel < bestRel) {
        bestRel = rel;
        best = car;
      }
    }
    return best;
  }

  /** Nearest live car directly ahead in `lane`, within `maxAheadZ` (藍 Lichthupe trigger). */
  frontCarInLane(lane: LaneIndex, maxAheadZ: number): TrafficCar | undefined {
    const distance = this.getDistance();
    let best: TrafficCar | undefined;
    let bestRel = Infinity;
    for (const car of this.cars) {
      if (car.hit || !car.mesh.visible || car.lane !== lane) {
        continue;
      }
      const rel = car.trackZ - distance;
      if (rel < 0.5 || rel > maxAheadZ) {
        continue;
      }
      if (rel < bestRel) {
        bestRel = rel;
        best = car;
      }
    }
    return best;
  }

  /**
   * Restore cars to their normal lanes (e.g. when 藍 ends), but only into a clear
   * lane and never within the close band ahead (no unfair snap into the player).
   */
  restoreLanes(minSafeAheadZ: number): void {
    const distance = this.getDistance();
    for (const car of this.cars) {
      if (car.hit) {
        continue;
      }
      const rel = car.trackZ - distance;
      if (rel >= 0 && rel <= minSafeAheadZ) {
        continue;
      }
      if (car.lane !== car.initialLane && this.laneClear(car.initialLane, car.trackZ, 6, 6, car)) {
        car.mergeToLane(car.initialLane);
      }
    }
  }

  /** Make a specific car give way into a clear adjacent lane (藍 Lichthupe). */
  swerveCar(car: TrafficCar): void {
    if (car.hit) {
      return;
    }
    const to = this.clearAdjacentLane(car, OVERTAKE_CLEAR_AHEAD, OVERTAKE_CLEAR_BEHIND);
    if (to !== undefined) {
      car.yieldToLane(to);
    }
  }

  /** Destroy a specific car (turret hit). */
  destroyCar(car: TrafficCar): void {
    if (car.hit) {
      return;
    }
    car.hit = true;
    car.mesh.visible = false;
    this.onDestroyed?.({ car, coins: 0 }); // turret credits its own coins separately
  }

  /**
   * Swerve cars out of `lane` once they're far enough ahead (so the move happens
   * off in the distance, not in the player's face). Used by 藍 Freie Bahn — only
   * into a clear lane, so cars never glitch into a neighbour.
   */
  swerveOutOfLane(lane: LaneIndex, minAheadZ: number): void {
    const distance = this.getDistance();
    for (const car of this.cars) {
      if (car.hit || car.lane !== lane || car.isMerging()) {
        continue;
      }
      if (car.trackZ - distance <= minAheadZ) {
        continue; // too close — leave it so it doesn't snap on screen (shield covers it)
      }
      const to = this.clearAdjacentLane(car, 12, 6);
      if (to !== undefined) {
        car.mergeToLane(to);
      }
    }
  }

  getActiveCount(): number {
    return this.cars.length;
  }
}
