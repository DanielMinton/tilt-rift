import { ModCard } from './types';
import { Vector3Data } from '@/game/types';

interface ShardShuffleState {
  shuffleTimer: number;
  shuffleInterval: number;
  shuffleCount: number;
  onShuffle?: (newPositions: Vector3Data[]) => void;
}

let state: ShardShuffleState | null = null;

export const shardShuffleMod: ModCard = {
  id: 'shard-shuffle',
  name: 'Quantum Flux',
  description: 'Uncollected shards teleport to new positions every 15 seconds.',
  icon: '✨',
  rarity: 'uncommon',

  apply: () => {
    state = {
      shuffleTimer: 0,
      shuffleInterval: 15,
      shuffleCount: 0,
    };
    console.log('Shard Shuffle modifier applied');
  },

  remove: () => {
    state = null;
    console.log('Shard Shuffle modifier removed');
  },

  tick: (deltaTime: number) => {
    if (!state) return;

    state.shuffleTimer += deltaTime;

    if (state.shuffleTimer >= state.shuffleInterval) {
      state.shuffleTimer = 0;
      state.shuffleCount++;

      if (state.onShuffle) {
        // This would be called with the new positions
        // The actual shuffle logic is in spawn.ts
        console.log(`Shard shuffle #${state.shuffleCount}`);
      }
    }
  },
};

export function setShuffleCallback(callback: (newPositions: Vector3Data[]) => void): void {
  if (state) {
    state.onShuffle = callback;
  }
}

export function getTimeUntilShuffle(): number {
  if (!state) return Infinity;
  return state.shuffleInterval - state.shuffleTimer;
}

export function getShuffleCount(): number {
  return state?.shuffleCount || 0;
}

export function isShuffleImminent(): boolean {
  return getTimeUntilShuffle() < 3;
}
