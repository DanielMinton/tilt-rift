import { TOTAL_SHARDS, MAX_STABILITY } from '../types';

export interface GameState {
  shardsCollected: number;
  stability: number;
  orb: {
    isInExitGate: boolean;
  };
  timeRemaining: number;
}

export function checkWinCondition(state: GameState): boolean {
  return (
    state.shardsCollected === TOTAL_SHARDS &&
    state.orb.isInExitGate &&
    state.stability > 0
  );
}

export function checkLoseCondition(state: GameState): boolean {
  return state.stability <= 0 || state.timeRemaining <= 0;
}

export function getLoseReason(state: GameState): 'stability' | 'time' | null {
  if (state.stability <= 0) return 'stability';
  if (state.timeRemaining <= 0) return 'time';
  return null;
}

export const STABILITY_CONFIG = {
  MAX: MAX_STABILITY,
  DRAIN_PER_SECOND: 0.5,
  IMPACT_PENALTIES: {
    LIGHT: 2, // < 2 m/s
    MEDIUM: 5, // 2-5 m/s
    HEAVY: 15, // > 5 m/s
  },
  HAZARD_PENALTIES: {
    BURN: 10,
    BLADE: 20,
    STATIC: 8,
  },
  SHARD_HEAL: 5,
  COMBO_HEAL_BONUS: 2,
} as const;

export function calculateImpactDamage(force: number, overclock: boolean = false): number {
  let damage: number;

  if (force < 2) {
    damage = STABILITY_CONFIG.IMPACT_PENALTIES.LIGHT;
  } else if (force < 5) {
    damage = STABILITY_CONFIG.IMPACT_PENALTIES.MEDIUM;
  } else {
    damage = STABILITY_CONFIG.IMPACT_PENALTIES.HEAVY;
  }

  if (overclock) {
    damage = Math.floor(damage * 1.3);
  }

  return damage;
}

export function calculateHazardDamage(
  hazardType: 'burn' | 'blade' | 'static',
  overclock: boolean = false
): number {
  const baseDamage = STABILITY_CONFIG.HAZARD_PENALTIES[hazardType.toUpperCase() as keyof typeof STABILITY_CONFIG.HAZARD_PENALTIES];
  return overclock ? Math.floor(baseDamage * 1.3) : baseDamage;
}

export function calculateStabilityDrain(deltaTime: number, overclock: boolean = false): number {
  const baseDrain = STABILITY_CONFIG.DRAIN_PER_SECOND * deltaTime;
  return overclock ? baseDrain * 1.2 : baseDrain;
}

export function calculateShardHeal(comboCount: number): number {
  return STABILITY_CONFIG.SHARD_HEAL + (comboCount * STABILITY_CONFIG.COMBO_HEAL_BONUS);
}

export function getStabilityLevel(stability: number): 'critical' | 'low' | 'medium' | 'high' {
  const percentage = (stability / STABILITY_CONFIG.MAX) * 100;

  if (percentage <= 10) return 'critical';
  if (percentage <= 25) return 'low';
  if (percentage <= 50) return 'medium';
  return 'high';
}

export function shouldShowWarning(stability: number): boolean {
  return getStabilityLevel(stability) === 'critical' || getStabilityLevel(stability) === 'low';
}
