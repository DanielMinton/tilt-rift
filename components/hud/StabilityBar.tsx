'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/game/store/useGameStore';
import { cn } from '@/lib/utils';

interface StabilityBarProps {
  className?: string;
}

export function StabilityBar({ className }: StabilityBarProps) {
  const stability = useGameStore((state) => state.run.stability);
  const maxStability = useGameStore((state) => state.run.maxStability);

  const percentage = (stability / maxStability) * 100;

  const barColor = useMemo(() => {
    if (percentage > 50) return 'bg-neon-cyan';
    if (percentage > 25) return 'bg-neon-gold';
    return 'bg-neon-red';
  }, [percentage]);

  const isLow = percentage <= 25;
  const isCritical = percentage <= 10;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
          Stability
        </span>
        <span
          className={cn(
            'text-xs font-mono',
            isLow ? (isCritical ? 'text-neon-red animate-pulse' : 'text-neon-gold') : 'text-text-primary'
          )}
        >
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="stability-bar h-2 bg-navy rounded-full overflow-hidden">
        <div
          className={cn(
            'stability-bar-fill h-full rounded-full transition-all duration-150',
            barColor,
            isCritical && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default StabilityBar;
