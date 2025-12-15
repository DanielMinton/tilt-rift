'use client';

import { useGameStore } from '@/game/store/useGameStore';
import { cn } from '@/lib/utils';

export function TelemetryPanel() {
  const orb = useGameStore((state) => state.orb);
  const run = useGameStore((state) => state.run);

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
        Telemetry
      </h3>

      <div className="space-y-2 font-mono text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Speed</span>
          <span className="text-neon-cyan">
            {orb.speed.toFixed(1)} m/s
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-muted">Max Speed</span>
          <span>{run.maxSpeed.toFixed(1)} m/s</span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-muted">Airtime</span>
          <span>{run.airtime.toFixed(1)}s</span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-muted">Impacts</span>
          <span className={run.impactCount > 5 ? 'text-neon-red' : ''}>
            {run.impactCount}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-muted">Current Score</span>
          <span className="text-neon-gold">
            {run.score.toLocaleString()}
          </span>
        </div>

        <div className="border-t border-neon-cyan/20 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-text-muted">Position</span>
            <span className="text-xs">
              ({orb.position.x.toFixed(1)}, {orb.position.y.toFixed(1)}, {orb.position.z.toFixed(1)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelemetryPanel;
