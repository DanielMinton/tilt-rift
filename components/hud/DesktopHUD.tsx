'use client';

import { useGameStore } from '@/game/store/useGameStore';
import { StabilityBar } from './StabilityBar';
import { ComboMeter } from './ComboMeter';
import { Timer } from './Timer';
import { ShardCounter } from './ShardCounter';

export function DesktopHUD() {
  const gameState = useGameStore((state) => state.gameState);
  const settings = useGameStore((state) => state.settings);
  const telemetry = useGameStore((state) => state.telemetry);

  if (gameState !== 'PLAYING' && gameState !== 'COUNTDOWN') {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {/* Top center - Timer and stability */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-96">
        <div className="flex flex-col gap-2 items-center">
          <Timer />
          <StabilityBar className="w-full" />
        </div>
      </div>

      {/* Top left - Shard counter */}
      <div className="absolute top-4 left-4">
        <ShardCounter />
      </div>

      {/* Top right - FPS counter (if enabled) */}
      {settings.showFPS && (
        <div className="absolute top-4 right-4 panel px-3 py-1 pointer-events-auto">
          <span className="font-mono text-sm text-text-muted">
            FPS: <span className="text-neon-cyan">{telemetry.fps}</span>
          </span>
        </div>
      )}

      {/* Center - Combo meter */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2">
        <ComboMeter />
      </div>

      {/* Bottom center - Control hints */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 text-xs text-text-muted opacity-50">
        <span>WASD: Wind</span>
        <span>SPACE: Pulse</span>
        <span>SHIFT: Brake</span>
        <span>DRAG: Vector Field</span>
        <span>ESC: Pause</span>
      </div>
    </div>
  );
}

export default DesktopHUD;
