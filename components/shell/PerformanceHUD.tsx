'use client';

import { useGameStore } from '@/game/store/useGameStore';
import { cn } from '@/lib/utils';

interface PerformanceHUDProps {
  className?: string;
}

export function PerformanceHUD({ className }: PerformanceHUDProps) {
  const telemetry = useGameStore((state) => state.telemetry);
  const settings = useGameStore((state) => state.settings);

  if (!settings.showFPS && !settings.showTelemetry) {
    return null;
  }

  const fpsColor =
    telemetry.fps >= 55 ? 'text-neon-green' :
    telemetry.fps >= 30 ? 'text-neon-gold' :
    'text-neon-red';

  return (
    <div className={cn('panel p-3 font-mono text-xs space-y-1', className)}>
      <div className="flex justify-between gap-4">
        <span className="text-text-muted">FPS</span>
        <span className={fpsColor}>{telemetry.fps}</span>
      </div>

      {settings.showTelemetry && (
        <>
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">Avg FPS</span>
            <span>{telemetry.avgFps}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">Min FPS</span>
            <span>{telemetry.minFps}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">Frame</span>
            <span>{telemetry.frameTime.toFixed(2)}ms</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">Physics</span>
            <span>{telemetry.physicsTime.toFixed(2)}ms</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">Draw Calls</span>
            <span className={telemetry.drawCalls > 150 ? 'text-neon-red' : ''}>
              {telemetry.drawCalls}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">Triangles</span>
            <span className={telemetry.triangles > 120000 ? 'text-neon-red' : ''}>
              {(telemetry.triangles / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">Particles</span>
            <span>{telemetry.particleCount}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default PerformanceHUD;
