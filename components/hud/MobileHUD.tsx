'use client';

import { useGameStore } from '@/game/store/useGameStore';
import { StabilityBar } from './StabilityBar';
import { ComboMeter } from './ComboMeter';
import { Timer } from './Timer';
import { ShardCounter } from './ShardCounter';
import { cn } from '@/lib/utils';

export function MobileHUD() {
  const phase = useGameStore((state) => state.phase);

  if (phase !== 'playing' && phase !== 'loading') {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-3 flex flex-col gap-2">
        <StabilityBar />

        <div className="flex justify-between items-center">
          <ShardCounter compact />
          <Timer compact />
        </div>
      </div>

      {/* Combo indicator (center) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2">
        <ComboMeter />
      </div>

      {/* Bottom gesture hints */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-xs text-text-muted opacity-50">
        <span>TAP: Ping</span>
        <span>2x TAP: Brake</span>
        <span>HOLD: Stabilize</span>
      </div>
    </div>
  );
}

export default MobileHUD;
