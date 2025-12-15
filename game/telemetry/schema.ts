export interface TelemetryEvent {
  type: EventType;
  timestamp: number;
  sessionId: string;
  data: Record<string, unknown>;
}

export type EventType =
  | 'session_start'
  | 'run_start'
  | 'run_complete'
  | 'shard_collected'
  | 'damage_taken'
  | 'modifier_activated'
  | 'checkpoint_reached'
  | 'pause'
  | 'resume'
  | 'settings_changed'
  | 'error';

export interface SessionStartData {
  platform: 'mobile' | 'desktop';
  userAgent: string;
  screenSize: { width: number; height: number };
  hasGyroscope: boolean;
  referrer: string;
}

export interface RunStartData {
  seed: string;
  isDaily: boolean;
  modifiers: string[];
  difficulty: string;
}

export interface RunCompleteData {
  seed: string;
  score: number;
  shardsCollected: number;
  totalShards: number;
  timeElapsed: number;
  damagesTaken: number;
  modifiersUsed: string[];
  platform: 'mobile' | 'desktop';
  outcome: 'victory' | 'defeat' | 'quit';
  checkpointsReached: number;
}

export interface ShardCollectedData {
  shardId: string;
  position: { x: number; y: number; z: number };
  timeInRun: number;
  totalCollected: number;
}

export interface DamageTakenData {
  source: string;
  amount: number;
  currentHealth: number;
  position: { x: number; y: number; z: number };
  timeInRun: number;
}

export interface ModifierActivatedData {
  modifierId: string;
  modifierName: string;
  timeInRun: number;
}

export interface CheckpointReachedData {
  checkpointId: string;
  position: { x: number; y: number; z: number };
  timeInRun: number;
  shardsCollected: number;
}

export interface SettingsChangedData {
  setting: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface ErrorData {
  message: string;
  stack?: string;
  context: string;
}
