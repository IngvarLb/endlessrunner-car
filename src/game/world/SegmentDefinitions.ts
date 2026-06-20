import type * as THREE from "three";
import type { LaneIndex, SegmentKind, TurnDirection, Vec3Like } from "../../app/GameConfig";
import type { Collidable } from "../../engine/physics/Collider";

export type RunnerCapabilities = {
  canBoost: boolean;
  canTurn: boolean;
  hasInvulnerability: boolean;
  inputBufferMs: number;
};

export type DifficultyState = {
  level: number;
  speed: number;
  obstacleDensity: number;
  fireAttackChance: number;
  powerUpChance: number;
  maxPatternComplexity: number;
};

export type ObstacleSlot = {
  atDistance: number;
  lane: LaneIndex;
  obstacleId: string;
};

export type SegmentDefinition = {
  id: string;
  kind: SegmentKind;
  biome: string;
  length: number;
  difficultyMin: number;
  allowedNextKinds: SegmentKind[];
  turnDirection?: TurnDirection;
  obstacleSlots: ObstacleSlot[];
  collectiblePatterns: string[];
  decorationSet: string;
};

export type SegmentContext = {
  seed: number;
  distance: number;
  difficulty: DifficultyState;
  previousSegments: SegmentDefinition[];
  runnerCapabilities: RunnerCapabilities;
};

export type TrackSegment = {
  id: string;
  definitionId: string;
  kind: SegmentKind;
  startDistance: number;
  length: number;
  object: THREE.Group;
  lanes: LaneIndex[];
  collidables: Collidable[];
  disposeToPool(): void;
};

export type SegmentDebugInfo = {
  center: Vec3Like;
  safeLanes: LaneIndex[];
};
