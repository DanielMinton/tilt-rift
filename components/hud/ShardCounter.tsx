'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/game/store/useGameStore';
import { cn } from '@/lib/utils';

interface ShardCounterProps {
  compact?: boolean;
}

export function ShardCounter({ compact = false }: ShardCounterProps) {
  const shardsCollected = useGameStore((state) => state.run.shardsCollected);
  const totalShards = useGameStore((state) => state.run.totalShards);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevShards, setPrevShards] = useState(0);

  useEffect(() => {
    if (shardsCollected > prevShards) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timeout);
    }
    setPrevShards(shardsCollected);
  }, [shardsCollected, prevShards]);

  const isComplete = shardsCollected === totalShards;

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 font-mono',
          isAnimating && 'animate-pulse',
          isComplete && 'text-neon-gold'
        )}
      >
        <ShardIcon className={cn('w-4 h-4', isComplete ? 'text-neon-gold' : 'text-neon-cyan')} />
        <span className="text-lg">
          {shardsCollected}/{totalShards}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'panel px-4 py-2 flex items-center gap-3',
        isAnimating && 'ring-2 ring-neon-gold',
        isComplete && 'ring-2 ring-neon-gold'
      )}
    >
      <ShardIcon className={cn('w-6 h-6', isComplete ? 'text-neon-gold' : 'text-neon-cyan')} />
      <div className="flex flex-col">
        <span className="text-xs text-text-muted uppercase tracking-wider">Shards</span>
        <span className={cn('font-mono text-xl font-bold', isComplete ? 'text-neon-gold' : 'text-text-primary')}>
          {shardsCollected}
          <span className="text-text-muted">/{totalShards}</span>
        </span>
      </div>
    </div>
  );
}

function ShardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2L4 8l8 14 8-14-8-6zm0 3.5L16.5 9l-4.5 8-4.5-8L12 5.5z" />
    </svg>
  );
}

export default ShardCounter;
