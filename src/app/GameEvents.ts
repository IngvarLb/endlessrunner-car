import type { LaneIndex, TurnDirection, Vec3Like } from "./GameConfig";
import type { GameState } from "../game/state/GameStateTypes";
import type { PowerUpType } from "../game/powerups/PowerUpTypes";
import type { SaveData } from "../game/progression/SaveData";

export type HitInfo = {
  source: "obstacle" | "fire" | "chaser";
  severity: "minor" | "major" | "fatal";
  worldPosition: Vec3Like;
};

export type PressureReason = "mistake" | "perfectRun" | "powerup" | "fire" | "recovery";

export type GameEventMap = {
  "state:changed": { previous: GameState; next: GameState; reason?: string };
  "runner:hit": { hit: HitInfo; shieldConsumed: boolean; pressureAfter: number };
  "runner:laneChanged": { lane: LaneIndex };
  "runner:turned": { direction: TurnDirection };
  "coin:collected": { amount: number; combo: number; worldPosition: Vec3Like };
  "powerup:activated": { type: PowerUpType; duration: number };
  "powerup:expired": { type: PowerUpType };
  "chaser:pressureChanged": { value: number; reason: PressureReason };
  "chaser:fireTelegraph": { lanes: LaneIndex[]; duration: number };
  "chaser:fireActive": { lanes: LaneIndex[]; duration: number };
  "score:changed": { score: number; distance: number; coins: number; combo: number };
  "settings:changed": { settings: SaveData["settings"] };
};

type EventHandler<T> = (payload: T) => void;

export class GameEvents {
  private readonly handlers = new Map<keyof GameEventMap, Set<EventHandler<GameEventMap[keyof GameEventMap]>>>();

  on<K extends keyof GameEventMap>(event: K, handler: EventHandler<GameEventMap[K]>): () => void {
    const handlers = this.handlers.get(event) ?? new Set<EventHandler<GameEventMap[keyof GameEventMap]>>();
    handlers.add(handler as EventHandler<GameEventMap[keyof GameEventMap]>);
    this.handlers.set(event, handlers);

    return () => handlers.delete(handler as EventHandler<GameEventMap[keyof GameEventMap]>);
  }

  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const handlers = this.handlers.get(event);
    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      handler(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
