'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/game/store/useGameStore';
import { cn } from '@/lib/utils';

export function ComboMeter() {
  const currentCombo = useGameStore((state) => state.run.currentCombo);
  const comboTimer = useGameStore((state) => state.run.comboTimer);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCombo, setPrevCombo] = useState(0);

  useEffect(() => {
    if (currentCombo > prevCombo) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timeout);
    }
    setPrevCombo(currentCombo);
  }, [currentCombo, prevCombo]);

  if (currentCombo < 2) {
    return null;
  }

  const multiplier = Math.min(3, 1 + (currentCombo - 1) * 0.2);
  const timerPercentage = (comboTimer / 3) * 100;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 transition-transform duration-300',
        isAnimating && 'scale-110'
      )}
    >
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-display text-4xl font-bold',
            currentCombo >= 5 ? 'text-neon-gold neon-glow-gold' : 'text-neon-cyan neon-glow'
          )}
        >
          {currentCombo}x
        </span>
        <span className="text-sm text-text-muted font-mono">
          COMBO
        </span>
      </div>

      <div className="text-xs font-mono text-neon-gold">
        {multiplier.toFixed(1)}x MULTIPLIER
      </div>

      {/* Combo timer bar */}
      <div className="w-24 h-1 bg-navy rounded-full overflow-hidden mt-1">
        <div
          className="h-full bg-neon-cyan transition-all duration-100"
          style={{ width: `${timerPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default ComboMeter;
