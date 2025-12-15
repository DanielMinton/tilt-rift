export const HAPTIC_PATTERNS = {
  LIGHT: [10],
  MEDIUM: [30],
  HEAVY: [50],
  VICTORY: [30, 50, 100],
  DEFEAT: [100, 50, 100],
  SHARD_PICKUP: [15],
  BUMPER_HIT: [25],
  HAZARD_HIT: [40],
  COMBO_UP: [10, 20, 10],
  COUNTDOWN_TICK: [20],
  BUTTON_PRESS: [8],
} as const;

export type HapticPattern = keyof typeof HAPTIC_PATTERNS;

let hapticEnabled = true;

export function setHapticEnabled(enabled: boolean): void {
  hapticEnabled = enabled;
}

export function isHapticSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

export function triggerHaptic(pattern: HapticPattern | number[]): boolean {
  if (!hapticEnabled || !isHapticSupported()) {
    return false;
  }

  try {
    const vibrationPattern = Array.isArray(pattern) ? pattern : HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
    return true;
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
    return false;
  }
}

export function stopHaptic(): void {
  if (isHapticSupported()) {
    navigator.vibrate(0);
  }
}

// Convenience functions
export function hapticLight(): void {
  triggerHaptic('LIGHT');
}

export function hapticMedium(): void {
  triggerHaptic('MEDIUM');
}

export function hapticHeavy(): void {
  triggerHaptic('HEAVY');
}

export function hapticVictory(): void {
  triggerHaptic('VICTORY');
}

export function hapticDefeat(): void {
  triggerHaptic('DEFEAT');
}

export function hapticShardPickup(): void {
  triggerHaptic('SHARD_PICKUP');
}

export function hapticBumperHit(): void {
  triggerHaptic('BUMPER_HIT');
}

export function hapticHazardHit(): void {
  triggerHaptic('HAZARD_HIT');
}

export function hapticComboUp(): void {
  triggerHaptic('COMBO_UP');
}

export function hapticCountdownTick(): void {
  triggerHaptic('COUNTDOWN_TICK');
}

export function hapticButtonPress(): void {
  triggerHaptic('BUTTON_PRESS');
}

// Impact-based haptic that scales with force
export function hapticImpact(force: number): void {
  if (!hapticEnabled || !isHapticSupported()) return;

  const clampedForce = Math.min(Math.max(force, 0), 1);

  if (clampedForce < 0.3) {
    hapticLight();
  } else if (clampedForce < 0.7) {
    hapticMedium();
  } else {
    hapticHeavy();
  }
}

// Continuous haptic feedback (for sustained effects)
let continuousHapticId: ReturnType<typeof setInterval> | null = null;

export function startContinuousHaptic(
  intensity: 'LIGHT' | 'MEDIUM' | 'HEAVY' = 'LIGHT',
  intervalMs: number = 100
): void {
  stopContinuousHaptic();

  if (!hapticEnabled || !isHapticSupported()) return;

  continuousHapticId = setInterval(() => {
    triggerHaptic(intensity);
  }, intervalMs);
}

export function stopContinuousHaptic(): void {
  if (continuousHapticId) {
    clearInterval(continuousHapticId);
    continuousHapticId = null;
    stopHaptic();
  }
}
