export const SCORING = {
  SHARD_BASE: 100,
  TIME_BONUS_PER_SECOND: 10,
  COMBO_MULTIPLIERS: [1.0, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0], // index = combo count
  DAMAGE_PENALTY: -50,
  AIRTIME_BONUS: 5,
  OVERCLOCK_MULTIPLIER: 1.5,
} as const;

export interface RunStats {
  shardsCollected: number;
  timeRemaining: number;
  maxCombo: number;
  impactCount: number;
  airtime?: number;
}

export function calculateFinalScore(stats: RunStats, overclock: boolean = false): number {
  const shardPoints = stats.shardsCollected * SCORING.SHARD_BASE;
  const timeBonus = Math.floor(stats.timeRemaining) * SCORING.TIME_BONUS_PER_SECOND;
  const comboBonus = stats.maxCombo * 200;
  const damagePenalty = stats.impactCount * SCORING.DAMAGE_PENALTY;
  const airtimeBonus = Math.floor(stats.airtime || 0) * SCORING.AIRTIME_BONUS;

  let total = shardPoints + timeBonus + comboBonus + damagePenalty + airtimeBonus;

  if (overclock) {
    total = Math.floor(total * SCORING.OVERCLOCK_MULTIPLIER);
  }

  return Math.max(0, total);
}

export function getComboMultiplier(comboCount: number): number {
  const index = Math.min(comboCount, SCORING.COMBO_MULTIPLIERS.length - 1);
  return SCORING.COMBO_MULTIPLIERS[index];
}

export function calculateShardScore(baseScore: number, comboCount: number, overclock: boolean = false): number {
  const multiplier = getComboMultiplier(comboCount);
  let score = Math.floor(baseScore * multiplier);

  if (overclock) {
    score = Math.floor(score * SCORING.OVERCLOCK_MULTIPLIER);
  }

  return score;
}

export function calculateImpactPenalty(force: number): number {
  // Light impacts (< 2 m/s) have reduced penalty
  if (force < 2) {
    return Math.floor(SCORING.DAMAGE_PENALTY * 0.5);
  }
  // Heavy impacts (> 5 m/s) have increased penalty
  if (force > 5) {
    return Math.floor(SCORING.DAMAGE_PENALTY * 1.5);
  }
  return SCORING.DAMAGE_PENALTY;
}

export function getScoreBreakdown(stats: RunStats, overclock: boolean = false) {
  const shardPoints = stats.shardsCollected * SCORING.SHARD_BASE;
  const timeBonus = Math.floor(stats.timeRemaining) * SCORING.TIME_BONUS_PER_SECOND;
  const comboBonus = stats.maxCombo * 200;
  const damagePenalty = stats.impactCount * Math.abs(SCORING.DAMAGE_PENALTY);
  const airtimeBonus = Math.floor(stats.airtime || 0) * SCORING.AIRTIME_BONUS;

  const subtotal = shardPoints + timeBonus + comboBonus - damagePenalty + airtimeBonus;
  const overclockBonus = overclock ? Math.floor(subtotal * 0.5) : 0;
  const total = Math.max(0, subtotal + overclockBonus);

  return {
    shardPoints,
    timeBonus,
    comboBonus,
    damagePenalty,
    airtimeBonus,
    overclockBonus,
    total,
  };
}
