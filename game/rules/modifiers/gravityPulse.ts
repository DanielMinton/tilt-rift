import { ModCard } from './types';

interface GravityPulseState {
  phaseTimer: number;
  cycleTime: number;
  minMultiplier: number;
  maxMultiplier: number;
  currentMultiplier: number;
}

let state: GravityPulseState | null = null;

export const gravityPulseMod: ModCard = {
  id: 'gravity-pulse',
  name: 'Gravity Waves',
  description: 'Gravity pulses between 60% and 140% strength every 5 seconds.',
  icon: '🌊',
  rarity: 'uncommon',

  apply: () => {
    state = {
      phaseTimer: 0,
      cycleTime: 5,
      minMultiplier: 0.6,
      maxMultiplier: 1.4,
      currentMultiplier: 1.0,
    };
    console.log('Gravity Pulse modifier applied');
  },

  remove: () => {
    state = null;
    console.log('Gravity Pulse modifier removed');
  },

  tick: (deltaTime: number) => {
    if (!state) return;

    state.phaseTimer += deltaTime;

    // Sine wave oscillation
    const phase = (state.phaseTimer / state.cycleTime) * Math.PI * 2;
    const t = (Math.sin(phase) + 1) / 2; // 0 to 1

    state.currentMultiplier =
      state.minMultiplier + (state.maxMultiplier - state.minMultiplier) * t;
  },
};

export function getGravityMultiplier(): number {
  return state?.currentMultiplier || 1.0;
}

export function getGravityPhase(): number {
  if (!state) return 0;
  return (state.phaseTimer % state.cycleTime) / state.cycleTime;
}

export function isGravityIncreasing(): boolean {
  const phase = getGravityPhase();
  return phase < 0.5;
}
