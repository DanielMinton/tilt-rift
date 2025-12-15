'use client';

import { useGameStore } from '@/game/store/useGameStore';
import { cn } from '@/lib/utils';

interface CooldownItemProps {
  label: string;
  current: number;
  max: number;
  ready: boolean;
  hotkey?: string;
}

function CooldownItem({ label, current, max, ready, hotkey }: CooldownItemProps) {
  const percentage = ready ? 100 : ((max - current) / max) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className={cn(ready ? 'text-neon-cyan' : 'text-text-muted')}>
            {label}
          </span>
          {hotkey && (
            <span className="text-text-muted">
              [{hotkey}]
            </span>
          )}
        </div>
        <div className="h-1.5 bg-navy rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-100',
              ready ? 'bg-neon-cyan' : 'bg-neon-cyan/30'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {ready && (
        <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
      )}
    </div>
  );
}

const COOLDOWN_CONFIGS = {
  pulse: { max: 2.5, hotkey: 'SPACE' },
  brake: { max: 0.1, hotkey: 'SHIFT' },
  vectorField: { max: 8, hotkey: 'DRAG' },
};

export function FieldCooldownsPanel() {
  const cooldowns = useGameStore((state) => state.cooldowns);

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
        Field Cooldowns
      </h3>

      <div className="space-y-3">
        <CooldownItem
          label="Pulse Impulse"
          current={cooldowns.pulse}
          max={COOLDOWN_CONFIGS.pulse.max}
          ready={cooldowns.pulse <= 0}
          hotkey={COOLDOWN_CONFIGS.pulse.hotkey}
        />
        <CooldownItem
          label="Brake Field"
          current={cooldowns.brake}
          max={COOLDOWN_CONFIGS.brake.max}
          ready={true} // Brake is always available while held
          hotkey={COOLDOWN_CONFIGS.brake.hotkey}
        />
        <CooldownItem
          label="Vector Field"
          current={cooldowns.vectorField}
          max={COOLDOWN_CONFIGS.vectorField.max}
          ready={cooldowns.vectorField <= 0}
          hotkey={COOLDOWN_CONFIGS.vectorField.hotkey}
        />
      </div>
    </div>
  );
}

export default FieldCooldownsPanel;
