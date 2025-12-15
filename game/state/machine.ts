import { GameState } from '../types';

export type StateTransition = {
  from: GameState | GameState[];
  to: GameState;
  condition?: () => boolean;
};

const STATE_TRANSITIONS: StateTransition[] = [
  { from: 'BOOT', to: 'MENU' },
  { from: 'MENU', to: 'READY' },
  { from: 'READY', to: 'COUNTDOWN' },
  { from: 'COUNTDOWN', to: 'PLAYING' },
  { from: 'PLAYING', to: 'PAUSED' },
  { from: 'PAUSED', to: 'PLAYING' },
  { from: 'PLAYING', to: 'WON' },
  { from: 'PLAYING', to: 'LOST' },
  { from: ['WON', 'LOST'], to: 'RESULTS' },
  { from: 'RESULTS', to: 'MENU' },
  { from: 'RESULTS', to: 'READY' },
  { from: 'PAUSED', to: 'MENU' },
];

export function canTransition(from: GameState, to: GameState): boolean {
  return STATE_TRANSITIONS.some((transition) => {
    const fromMatch = Array.isArray(transition.from)
      ? transition.from.includes(from)
      : transition.from === from;
    const toMatch = transition.to === to;
    const conditionMet = transition.condition ? transition.condition() : true;
    return fromMatch && toMatch && conditionMet;
  });
}

export function getValidTransitions(from: GameState): GameState[] {
  return STATE_TRANSITIONS
    .filter((transition) => {
      const fromMatch = Array.isArray(transition.from)
        ? transition.from.includes(from)
        : transition.from === from;
      return fromMatch;
    })
    .map((transition) => transition.to);
}

export type StateEventType =
  | 'INIT'
  | 'START_GAME'
  | 'COUNTDOWN_COMPLETE'
  | 'PAUSE'
  | 'RESUME'
  | 'WIN'
  | 'LOSE'
  | 'SHOW_RESULTS'
  | 'RETURN_TO_MENU'
  | 'RETRY';

export function getNextState(current: GameState, event: StateEventType): GameState | null {
  const transitions: Record<StateEventType, Partial<Record<GameState, GameState>>> = {
    INIT: {
      BOOT: 'MENU',
    },
    START_GAME: {
      MENU: 'READY',
      RESULTS: 'READY',
    },
    COUNTDOWN_COMPLETE: {
      READY: 'COUNTDOWN',
      COUNTDOWN: 'PLAYING',
    },
    PAUSE: {
      PLAYING: 'PAUSED',
    },
    RESUME: {
      PAUSED: 'PLAYING',
    },
    WIN: {
      PLAYING: 'WON',
    },
    LOSE: {
      PLAYING: 'LOST',
    },
    SHOW_RESULTS: {
      WON: 'RESULTS',
      LOST: 'RESULTS',
    },
    RETURN_TO_MENU: {
      RESULTS: 'MENU',
      PAUSED: 'MENU',
    },
    RETRY: {
      RESULTS: 'READY',
    },
  };

  return transitions[event]?.[current] ?? null;
}

export class GameStateMachine {
  private _state: GameState = 'BOOT';
  private listeners: Set<(state: GameState, prevState: GameState) => void> = new Set();

  get state(): GameState {
    return this._state;
  }

  transition(to: GameState): boolean {
    if (!canTransition(this._state, to)) {
      console.warn(`Invalid transition: ${this._state} -> ${to}`);
      return false;
    }

    const prevState = this._state;
    this._state = to;

    this.listeners.forEach((listener) => listener(to, prevState));
    return true;
  }

  dispatch(event: StateEventType): boolean {
    const nextState = getNextState(this._state, event);
    if (nextState) {
      return this.transition(nextState);
    }
    console.warn(`No valid transition for event ${event} from state ${this._state}`);
    return false;
  }

  subscribe(listener: (state: GameState, prevState: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(): void {
    this._state = 'BOOT';
  }
}

export const gameStateMachine = new GameStateMachine();
