import { StateCreator } from 'zustand';
import { RunStats, TOTAL_SHARDS, DEFAULT_TIME_LIMIT, MAX_STABILITY } from '../../types';

export interface RunSlice {
  run: RunStats;
  resetRun: () => void;
  collectShardInRun: () => void;
  updateTime: (delta: number) => void;
  damageStability: (amount: number) => void;
  healStability: (amount: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  updateScore: (points: number) => void;
  addAirtime: (time: number) => void;
  updateMaxSpeed: (speed: number) => void;
  recordImpact: () => void;
}

const initialRunState: RunStats = {
  shardsCollected: 0,
  totalShards: TOTAL_SHARDS,
  timeRemaining: DEFAULT_TIME_LIMIT,
  timeElapsed: 0,
  maxCombo: 0,
  currentCombo: 0,
  comboTimer: 0,
  impactCount: 0,
  stability: MAX_STABILITY,
  maxStability: MAX_STABILITY,
  score: 0,
  airtime: 0,
  maxSpeed: 0,
};

export const createRunSlice: StateCreator<RunSlice> = (set) => ({
  run: initialRunState,

  resetRun: () =>
    set(() => ({
      run: initialRunState,
    })),

  collectShardInRun: () =>
    set((state) => ({
      run: {
        ...state.run,
        shardsCollected: Math.min(state.run.shardsCollected + 1, state.run.totalShards),
      },
    })),

  updateTime: (delta: number) =>
    set((state) => {
      const newTimeRemaining = Math.max(0, state.run.timeRemaining - delta);
      const newTimeElapsed = state.run.timeElapsed + delta;
      const newComboTimer = state.run.comboTimer > 0 ? Math.max(0, state.run.comboTimer - delta) : 0;

      // Reset combo if timer expired
      const newCombo = newComboTimer <= 0 ? 0 : state.run.currentCombo;

      return {
        run: {
          ...state.run,
          timeRemaining: newTimeRemaining,
          timeElapsed: newTimeElapsed,
          comboTimer: newComboTimer,
          currentCombo: newCombo,
        },
      };
    }),

  damageStability: (amount: number) =>
    set((state) => ({
      run: {
        ...state.run,
        stability: Math.max(0, state.run.stability - amount),
      },
    })),

  healStability: (amount: number) =>
    set((state) => ({
      run: {
        ...state.run,
        stability: Math.min(state.run.maxStability, state.run.stability + amount),
      },
    })),

  incrementCombo: () =>
    set((state) => {
      const newCombo = state.run.currentCombo + 1;
      return {
        run: {
          ...state.run,
          currentCombo: newCombo,
          maxCombo: Math.max(state.run.maxCombo, newCombo),
          comboTimer: 3.0, // 3 second combo window
        },
      };
    }),

  resetCombo: () =>
    set((state) => ({
      run: {
        ...state.run,
        currentCombo: 0,
        comboTimer: 0,
      },
    })),

  updateScore: (points: number) =>
    set((state) => ({
      run: {
        ...state.run,
        score: state.run.score + points,
      },
    })),

  addAirtime: (time: number) =>
    set((state) => ({
      run: {
        ...state.run,
        airtime: state.run.airtime + time,
      },
    })),

  updateMaxSpeed: (speed: number) =>
    set((state) => ({
      run: {
        ...state.run,
        maxSpeed: Math.max(state.run.maxSpeed, speed),
      },
    })),

  recordImpact: () =>
    set((state) => ({
      run: {
        ...state.run,
        impactCount: state.run.impactCount + 1,
      },
    })),
});
