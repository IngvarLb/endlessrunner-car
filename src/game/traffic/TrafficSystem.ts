import type * as THREE from "three";
import type { LaneIndex } from "../../app/GameConfig";
import { CollisionSystem } from "../../engine/physics/CollisionSystem";
import { RunnerController } from "../runner/RunnerController";
import { LaneSystem } from "../world/LaneSystem";
import { TrafficCar, type TrafficCarDefinition } from "./TrafficCar";
import { TrafficDirector } from "./TrafficDirector";

export type TrafficCarHit = {
  car: TrafficCar;
  /** True for a side contact (player or car was changing lanes); false for a rear-end. */
  side: boolean;
};

export type TrafficCarDestroyed = {
  car: TrafficCar;
  /** Coins to award for this kill (>0 only when rammed during 将 Nachtjagd). */
  coins: number;
  /** What removed the car — selects the destroy SFX. */
  cause: "poof" | "ram" | "lift" | "turret";
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
const OVERTAKE_SIGNAL_SECONDS = 0.8; // brief blink before moving over (keeps the whole merge quick + visible)

// Fairness — never let three lanes block within WALL_BAND metres in the player's view,
// so there is always an open lane within reach (sometimes only after a car gives way).
const WALL_NEAR = 2.5;
const WALL_FAR = 56;
const WALL_BAND = 8;
const WALL_BRAKE_SECONDS = 1.2;
const ANTICIPATE_FAR = 30; // pre-empt a wall this far out, while it's still only two-wide
const ANTICIPATE_BEHIND = 9; // ...by holding back a car this far behind the open lane's band
// Player-relative escape: the static generator + wall guards only guarantee SOME lane is
// open + the corridor is threadable — not that an open lane is reachable from the PLAYER's
// actual lane. If the player drifts to an outer lane and the next band blocks {their lane +
// the middle}, the only open lane is two steps away through the blocked middle = a wall.
// We watch the player's own reachable set and open the middle stepping-stone early.
const ESCAPE_HORIZON = 50; // act on a box this far ahead (early enough to clear the centre in time)
const ESCAPE_SWERVE_MIN = 22; // far enough to swerve the centre car out cleanly; else just brake it

// Difficulty ramp — NPCs make discretionary lane changes (on top of overtaking) that
// get more frequent the further you drive. Each is still blinker-telegraphed and
// gap/wall-checked, so there's always a readable, fair escape.
// A lane change is only started when it will FULLY COMPLETE while the car is still well
// ahead — so a half-merged car (spanning two lanes) can never appear in the player's
// danger zone and box them in. The head start needed grows with the closing speed, so at
// high speed merges naturally only happen on distant cars (or not at all).
const MERGE_PLAN_SECONDS = 2.0; // blinker telegraph + the merge glide (+ margin for player acceleration)
const MERGE_SAFE_AHEAD = 16; // metres the car is still ahead when the merge finishes (past the ~12 m danger zone)

const DIFFICULTY_RAMP_START = 160; // metres: calm intro before any churn
const DIFFICULTY_RAMP_FULL = 2400; // metres: flatter ramp — full difficulty only deep into a run
const LANE_CHURN_RATE_MAX = 0.18; // per car, per second, at full difficulty

export class TrafficSystem {
  private readonly cars: TrafficCar[] = [];
  /** While set, cars in this lane are knocked aside instead of failing (藍 Freie Bahn). */
  private shieldedLane?: LaneIndex;
  /** While set, any car rammed is destroyed for this many coins (将 Nachtjagd). */
  private ramCoins?: number;
  /** While set, a tapped car can be lifted for this many coins (鬼 Schwarzes Loch). */
  private liftCoins?: number;
  /**
   * Living traffic: cars make telegraphed lane changes (blinker → smooth merge) on top of
   * the director's evenly-spaced layout. SAFE because (a) base speed is uniform so cars
   * never catch up and clump, and (b) every merge is gap-checked (target lane clear) and
   * wall-checked (never closes the 3rd lane near the player), with the runtime wall guard
   * (ensureNoWall) braking as a backstop. The only speed change is a brief brake to avoid
   * a rear-end / open a lane — not systematic variation.
   */
  private readonly autonomousLaneChanges = true;

  constructor(
    private readonly runner: RunnerController,
    private readonly laneSystem: LaneSystem,
    private readonly collisionSystem: CollisionSystem,
    private readonly getDistance: () => number,
    private readonly getPlayerSpeed: () => number,
    private readonly director: TrafficDirector,
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
          this.onDestroyed?.({ car, coins: 0, cause: "poof" });
        } else if (this.ramCoins !== undefined && side) {
          // 将 Nachtjagd: SIDE ram only → coins + a crumpled wreck (rear-ending is fatal).
          car.wreck();
          this.runner.bounceBack(); // recoil to our lane — don't slide into the wreck
          this.onDestroyed?.({ car, coins: this.ramCoins, cause: "ram" });
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
        const cfg = this.director.config(this.director.keyForZ(car.trackZ + worldLength));
        car.recycle(worldLength, cfg.blocked[car.slotIndex]);
      }
    }
  }

  /**
   * Per-frame traffic AI: cars cruise at their own (varied) speeds, follow/brake to
   * avoid rear-ending, overtake slower cars, weave between lanes more as difficulty
   * rises, and a fairness guard keeps at least one lane open near the player.
   */
  private think(dt: number): void {
    // A solid baseline so traffic visibly weaves from the start, more as you go.
    const churnRate = 0.12 + (LANE_CHURN_RATE_MAX - 0.12) * this.difficulty();
    for (const car of this.cars) {
      if (car.hit || !car.mesh.visible) {
        continue;
      }
      car.driveToward(this.followingTarget(car), dt);
    }
    if (this.autonomousLaneChanges) {
      for (const car of this.cars) {
        if (car.hit || !car.mesh.visible) {
          continue;
        }
        this.considerOvertake(car);
        this.considerLaneChurn(car, dt, churnRate);
      }
      this.cancelStaleSignals();
    }
    this.ensureNoWall();
    this.ensurePlayerEscape();
  }

  /**
   * Player-relative escape guard. Every other guard is corridor-relative or
   * "some-lane-is-open"-relative; none checks the PLAYER's actual lane. If the player has
   * drifted into an outer lane and the nearest band blocks {their lane + the middle}, the
   * only open lane is two steps away through the blocked middle — impassable. Here we open
   * the middle stepping-stone (universally reachable from any lane) BEFORE the player gets
   * there: swerve the centre car into the open lane when there's room, else brake it back.
   */
  private ensurePlayerEscape(): void {
    const distance = this.getDistance();
    const lanes = this.laneSystem.lanes;
    const ahead = this.cars
      .filter((car) => {
        if (car.hit || !car.mesh.visible) {
          return false;
        }
        const rel = car.trackZ - distance;
        return rel > WALL_NEAR && rel < ESCAPE_HORIZON;
      })
      .sort((a, b) => a.trackZ - b.trackZ);
    if (ahead.length === 0) {
      return;
    }
    // Group cars into bands (cars within ~a car-length count as one row).
    const bands: { cars: TrafficCar[]; blocked: Set<LaneIndex>; z: number }[] = [];
    for (const car of ahead) {
      const last = bands[bands.length - 1];
      if (last && car.trackZ - last.z <= 6) {
        last.cars.push(car);
        for (const lane of car.occupiedLanes()) {
          last.blocked.add(lane);
        }
      } else {
        bands.push({ cars: [car], blocked: new Set(car.occupiedLanes()), z: car.trackZ });
      }
    }
    // Thread a SINGLE player forward from their committed lane — ≤1 lane step per band,
    // only onto open lanes. The first band this reachable set can't enter is a genuine box
    // (not a corridor- or union-relative guess). Detecting it across ALL bands in the
    // horizon — not just the nearest — is what lets us open it EARLY enough to swerve.
    let reachable = new Set<LaneIndex>([this.runner.getLane()]);
    for (const band of bands) {
      if (band.blocked.size >= lanes.length) {
        return; // full 3-lane wall — ensureNoWall owns that case
      }
      const next = new Set<LaneIndex>();
      for (const from of reachable) {
        for (const lane of lanes) {
          if (Math.abs(lane - from) <= 1 && !band.blocked.has(lane)) {
            next.add(lane);
          }
        }
      }
      if (next.size > 0) {
        reachable = next;
        continue; // still threadable — keep looking ahead
      }
      // Boxed at this band. The middle (0) must be blocked here (else it'd be reachable from
      // any lane), so open it: swerve the centre car into a clear outer lane, else brake it back.
      const stepCar = band.cars.filter((car) => car.lane === 0).sort((a, b) => a.trackZ - b.trackZ)[0];
      if (!stepCar) {
        return;
      }
      const open = lanes.find((lane) => lane !== 0 && !band.blocked.has(lane));
      const farEnough = stepCar.trackZ - distance > ESCAPE_SWERVE_MIN;
      const canSwerve =
        open !== undefined &&
        farEnough &&
        stepCar.canChangeLane() &&
        this.laneClear(open, stepCar.trackZ, OVERTAKE_CLEAR_AHEAD, OVERTAKE_CLEAR_BEHIND, stepCar);
      if (canSwerve && open !== undefined) {
        stepCar.mergeToLane(open); // open the universally-reachable middle stepping stone
      } else {
        stepCar.requestBrake(WALL_BRAKE_SECONDS);
      }
      return;
    }
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
  /** A merge is only allowed if it completes while the car is still safely far ahead. */
  private mergeIsSafe(car: TrafficCar): boolean {
    const rel = car.trackZ - this.getDistance();
    const closing = Math.max(2, this.getPlayerSpeed() - car.speed);
    return rel - closing * MERGE_PLAN_SECONDS > MERGE_SAFE_AHEAD;
  }

  private considerLaneChurn(car: TrafficCar, dt: number, ratePerSecond: number): void {
    if (ratePerSecond <= 0 || !car.canChangeLane() || !this.mergeIsSafe(car) || Math.random() >= ratePerSecond * dt) {
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
    if (!car.canChangeLane() || !this.mergeIsSafe(car)) {
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
    // The scene resets the director first; re-place every car per the new sequence.
    this.shieldedLane = undefined;
    for (const car of this.cars) {
      const cfg = this.director.config(this.director.keyForZ(car.initialTrackZ));
      car.reset(cfg.blocked[car.slotIndex]);
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
      this.onDestroyed?.({ car: best, coins: this.liftCoins, cause: "lift" });
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
    this.onDestroyed?.({ car, coins: 0, cause: "turret" }); // turret credits its own coins separately
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
