import { ModCard } from './types';

interface OverclockState {
  scoreMultiplier: number;
  hazardMultiplier: number;
  drainMultiplier: number;
  visualIntensity: number;
}

let state: OverclockState | null = null;

export const overclockMod: ModCard = {
  id: 'overclock',
  name: 'OVERCLOCK',
  description: '1.5x score multiplier, but 1.3x hazard damage and 1.2x stability drain.',
  icon: '⚡',
  rarity: 'rare',

  apply: () => {
    state = {
      scoreMultiplier: 1.5,
      hazardMultiplier: 1.3,
      drainMultiplier: 1.2,
      visualIntensity: 1.5,
    };
    console.log('Overclock modifier applied');

    // Add visual effect class to document
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('overclock-active');
    }
  },

  remove: () => {
    state = null;
    console.log('Overclock modifier removed');

    // Remove visual effect class
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('overclock-active');
    }
  },

  tick: (_deltaTime: number) => {
    // Overclock is always active, no tick logic needed
  },
};

export function isOverclockActive(): boolean {
  return state !== null;
}

export function getOverclockScoreMultiplier(): number {
  return state?.scoreMultiplier || 1.0;
}

export function getOverclockHazardMultiplier(): number {
  return state?.hazardMultiplier || 1.0;
}

export function getOverclockDrainMultiplier(): number {
  return state?.drainMultiplier || 1.0;
}

export function getOverclockVisualIntensity(): number {
  return state?.visualIntensity || 1.0;
}
