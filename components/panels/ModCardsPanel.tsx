'use client';

import { useGameStore } from '@/game/store/useGameStore';
import { cn } from '@/lib/utils';

export function ModCardsPanel() {
  const activeModifiers = useGameStore((state) => state.activeModifiers);
  const overclockEnabled = useGameStore((state) => state.overclockEnabled);

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
        Active Rift Cards
      </h3>

      <div className="space-y-2">
        {/* Overclock indicator */}
        {overclockEnabled && (
          <div className="flex items-center gap-3 p-2 bg-neon-red/10 border border-neon-red/30 rounded">
            <span className="text-lg">⚡</span>
            <div>
              <div className="text-sm font-bold text-neon-red">OVERCLOCK</div>
              <div className="text-xs text-text-muted">1.5x Score, +30% Danger</div>
            </div>
          </div>
        )}

        {/* Active modifier cards */}
        {activeModifiers.map((mod) => (
          <div
            key={mod.id}
            className="flex items-center gap-3 p-2 bg-navy/50 border border-neon-cyan/20 rounded"
          >
            <span className="text-lg">{mod.icon}</span>
            <div>
              <div className="text-sm font-bold text-text-primary">{mod.name}</div>
              <div className="text-xs text-text-muted">{mod.description}</div>
            </div>
          </div>
        ))}

        {activeModifiers.length === 0 && !overclockEnabled && (
          <div className="text-sm text-text-muted text-center py-4">
            No active modifiers
          </div>
        )}
      </div>
    </div>
  );
}

export default ModCardsPanel;
