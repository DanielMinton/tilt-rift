import { Vector3 } from 'three';

export type GameState =
  | 'BOOT'
  | 'MENU'
  | 'READY'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'PAUSED'
  | 'WON'
  | 'LOST'
  | 'RESULTS';

export type DeviceMode = 'mobile' | 'desktop';

export type Rank = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Vector3Data {
  x: number;
  y: number;
  z: number;
}

export interface OrbState {
  position: Vector3Data;
  velocity: Vector3Data;
  speed: number;
  isGrounded: boolean;
  isInExitGate: boolean;
  lastImpactTime: number;
  lastImpactForce: number;
}

export interface RunStats {
  shardsCollected: number;
  totalShards: number;
  timeRemaining: number;
  timeElapsed: number;
  maxCombo: number;
  currentCombo: number;
  comboTimer: number;
  impactCount: number;
  stability: number;
  maxStability: number;
  score: number;
  airtime: number;
  maxSpeed: number;
}

export interface ModCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  apply: () => void;
  remove: () => void;
}

export interface LevelConfig {
  id: string;
  name: string;
  totalShards: number;
  timeLimit: number;
  spawnPoints: Vector3Data[];
  shardSockets: Vector3Data[];
  hazardZones: HazardZone[];
}

export interface HazardZone {
  type: 'burn' | 'blade' | 'static';
  position: Vector3Data;
  size: Vector3Data;
  damage: number;
}

export interface CollisionEvent {
  type: 'wall' | 'bumper' | 'hazard' | 'shard' | 'gate' | 'plate';
  position: Vector3Data;
  force: number;
  damage?: number;
}

export interface InputState {
  gravity: Vector3Data;
  touchActive: boolean;
  lastGesture: GestureType | null;
  gestureTimestamp: number;
  calibrationOffset: Vector3Data;
  keyboardInput: Vector3Data;
  mousePosition: { x: number; y: number };
  mouseDown: boolean;
}

export type GestureType = 'tap' | 'double-tap' | 'long-press' | 'swipe';

export interface GestureEvent {
  type: GestureType;
  position: { x: number; y: number };
  direction?: { x: number; y: number };
  duration?: number;
}

export interface CooldownState {
  tap: number;
  doubleTap: number;
  longPress: number;
  pulse: number;
  brake: number;
  vectorField: number;
}

export interface SettingsState {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  tiltSensitivity: number;
  invertTiltX: boolean;
  invertTiltY: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  showFPS: boolean;
  showTelemetry: boolean;
}

export interface TelemetryState {
  fps: number;
  avgFps: number;
  minFps: number;
  frameTime: number;
  physicsTime: number;
  drawCalls: number;
  triangles: number;
  particleCount: number;
}

export interface UIState {
  showPause: boolean;
  showSettings: boolean;
  showTutorial: boolean;
  showResults: boolean;
  showCrossPlatformPrompt: boolean;
  tutorialStep: number;
  currentPanel: 'map' | 'mods' | 'cooldowns' | 'telemetry' | null;
}

export const TOTAL_SHARDS = 12;
export const DEFAULT_TIME_LIMIT = 180; // 3 minutes
export const MAX_STABILITY = 100;

export const RANK_THRESHOLDS: Record<Rank, number> = {
  bronze: 1000,
  silver: 2500,
  gold: 5000,
  platinum: 8000,
};

export function getRankForScore(score: number): Rank {
  if (score >= RANK_THRESHOLDS.platinum) return 'platinum';
  if (score >= RANK_THRESHOLDS.gold) return 'gold';
  if (score >= RANK_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}
