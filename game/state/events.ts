import { CollisionEvent, GestureEvent, ModCard, Rank, Vector3Data } from '../types';

export type GameEventType =
  | 'GAME_STARTED'
  | 'GAME_PAUSED'
  | 'GAME_RESUMED'
  | 'GAME_WON'
  | 'GAME_LOST'
  | 'SHARD_COLLECTED'
  | 'COMBO_INCREASED'
  | 'COMBO_LOST'
  | 'STABILITY_CHANGED'
  | 'IMPACT'
  | 'HAZARD_HIT'
  | 'GATE_TOGGLED'
  | 'PLATE_ACTIVATED'
  | 'MODIFIER_APPLIED'
  | 'MODIFIER_REMOVED'
  | 'COOLDOWN_STARTED'
  | 'COOLDOWN_ENDED'
  | 'GESTURE_PERFORMED'
  | 'SCORE_UPDATED'
  | 'RANK_ACHIEVED';

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data?: unknown;
}

export interface ShardCollectedEvent extends GameEvent {
  type: 'SHARD_COLLECTED';
  data: {
    shardIndex: number;
    position: Vector3Data;
    newTotal: number;
    comboMultiplier: number;
  };
}

export interface ComboEvent extends GameEvent {
  type: 'COMBO_INCREASED' | 'COMBO_LOST';
  data: {
    previousCombo: number;
    newCombo: number;
    multiplier: number;
  };
}

export interface StabilityEvent extends GameEvent {
  type: 'STABILITY_CHANGED';
  data: {
    previousValue: number;
    newValue: number;
    delta: number;
    reason: 'impact' | 'hazard' | 'drain' | 'heal';
  };
}

export interface ImpactEvent extends GameEvent {
  type: 'IMPACT';
  data: CollisionEvent;
}

export interface ModifierEvent extends GameEvent {
  type: 'MODIFIER_APPLIED' | 'MODIFIER_REMOVED';
  data: {
    modifier: ModCard;
  };
}

export interface CooldownEvent extends GameEvent {
  type: 'COOLDOWN_STARTED' | 'COOLDOWN_ENDED';
  data: {
    ability: string;
    duration?: number;
  };
}

export interface GesturePerformedEvent extends GameEvent {
  type: 'GESTURE_PERFORMED';
  data: GestureEvent;
}

export interface RankAchievedEvent extends GameEvent {
  type: 'RANK_ACHIEVED';
  data: {
    rank: Rank;
    score: number;
  };
}

type EventListener<T extends GameEvent = GameEvent> = (event: T) => void;

class EventBus {
  private listeners: Map<GameEventType, Set<EventListener>> = new Map();
  private eventHistory: GameEvent[] = [];
  private maxHistorySize = 100;

  emit<T extends GameEvent>(event: T): void {
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp ?? performance.now(),
    };

    this.eventHistory.push(eventWithTimestamp);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(eventWithTimestamp);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      });
    }
  }

  on<T extends GameEvent>(type: GameEventType, listener: EventListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener as EventListener);

    return () => {
      this.listeners.get(type)?.delete(listener as EventListener);
    };
  }

  once<T extends GameEvent>(type: GameEventType, listener: EventListener<T>): () => void {
    const wrappedListener: EventListener<T> = (event) => {
      this.listeners.get(type)?.delete(wrappedListener as EventListener);
      listener(event);
    };
    return this.on(type, wrappedListener);
  }

  off(type: GameEventType, listener?: EventListener): void {
    if (listener) {
      this.listeners.get(type)?.delete(listener);
    } else {
      this.listeners.delete(type);
    }
  }

  getHistory(type?: GameEventType): GameEvent[] {
    if (type) {
      return this.eventHistory.filter((e) => e.type === type);
    }
    return [...this.eventHistory];
  }

  getLastEvent(type: GameEventType): GameEvent | undefined {
    for (let i = this.eventHistory.length - 1; i >= 0; i--) {
      if (this.eventHistory[i].type === type) {
        return this.eventHistory[i];
      }
    }
    return undefined;
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();

export function emitShardCollected(
  shardIndex: number,
  position: Vector3Data,
  newTotal: number,
  comboMultiplier: number
): void {
  eventBus.emit<ShardCollectedEvent>({
    type: 'SHARD_COLLECTED',
    timestamp: performance.now(),
    data: { shardIndex, position, newTotal, comboMultiplier },
  });
}

export function emitComboChanged(previousCombo: number, newCombo: number, multiplier: number): void {
  eventBus.emit<ComboEvent>({
    type: newCombo > previousCombo ? 'COMBO_INCREASED' : 'COMBO_LOST',
    timestamp: performance.now(),
    data: { previousCombo, newCombo, multiplier },
  });
}

export function emitStabilityChanged(
  previousValue: number,
  newValue: number,
  reason: 'impact' | 'hazard' | 'drain' | 'heal'
): void {
  eventBus.emit<StabilityEvent>({
    type: 'STABILITY_CHANGED',
    timestamp: performance.now(),
    data: {
      previousValue,
      newValue,
      delta: newValue - previousValue,
      reason,
    },
  });
}

export function emitImpact(collision: CollisionEvent): void {
  eventBus.emit<ImpactEvent>({
    type: 'IMPACT',
    timestamp: performance.now(),
    data: collision,
  });
}
