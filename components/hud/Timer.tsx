'use client';

import { useGameStore } from '@/game/store/useGameStore';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TimerProps {
  compact?: boolean;
}

export function Timer({ compact = false }: TimerProps) {
  const timeRemaining = useGameStore((state) => state.run.timeRemaining);
  const gameState = useGameStore((state) => state.gameState);

  const isLow = timeRemaining <= 30;
  const isCritical = timeRemaining <= 10;

  if (compact) {
    return (
      <div
        className={cn(
          'font-mono text-lg',
          isCritical
            ? 'text-neon-red animate-pulse'
            : isLow
            ? 'text-neon-gold'
            : 'text-text-primary'
        )}
      >
        {formatTime(timeRemaining)}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1">
        Time
      </span>
      <div
        className={cn(
          'font-mono text-3xl font-bold tabular-nums',
          isCritical
            ? 'text-neon-red animate-pulse'
            : isLow
            ? 'text-neon-gold'
            : 'text-neon-cyan neon-glow'
        )}
      >
        {formatTime(timeRemaining)}
      </div>
    </div>
  );
}

export default Timer;
