'use client';

import { useGameStore } from '@/game/store/useGameStore';
import { DesktopHUD } from '@/components/hud/DesktopHUD';
import { TutorialOverlay } from '@/components/overlays/TutorialOverlay';
import { PauseOverlay } from '@/components/overlays/PauseOverlay';
import { ResultsOverlay } from '@/components/overlays/ResultsOverlay';
import { StartOverlay } from '@/components/overlays/StartOverlay';
import { RouteMapPanel } from '@/components/panels/RouteMapPanel';
import { ModCardsPanel } from '@/components/panels/ModCardsPanel';
import { FieldCooldownsPanel } from '@/components/panels/FieldCooldownsPanel';
import { TelemetryPanel } from '@/components/panels/TelemetryPanel';

export function DesktopLayout() {
  const phase = useGameStore((state) => state.phase);
  const isPaused = useGameStore((state) => state.isPaused);
  const ui = useGameStore((state) => state.ui);
  const settings = useGameStore((state) => state.settings);

  return (
    <div className="hud-overlay">
      {/* Start overlay for menu state */}
      {phase === 'menu' && (
        <StartOverlay deviceMode="desktop" />
      )}

      {/* Tutorial overlay */}
      {ui.showTutorial && (
        <TutorialOverlay deviceMode="desktop" />
      )}

      {/* In-game HUD and panels */}
      {(phase === 'playing' || phase === 'loading') && (
        <>
          <DesktopHUD />

          {/* Left side panels */}
          <div className="fixed left-4 top-20 bottom-4 w-64 flex flex-col gap-4">
            <ModCardsPanel />
            <FieldCooldownsPanel />
          </div>

          {/* Right side panels */}
          <div className="fixed right-4 top-20 bottom-4 w-72 flex flex-col gap-4">
            <RouteMapPanel />
            {settings.showTelemetry && <TelemetryPanel />}
          </div>
        </>
      )}

      {/* Pause overlay */}
      {isPaused && phase === 'playing' && (
        <PauseOverlay />
      )}

      {/* Results overlay */}
      {(phase === 'victory' || phase === 'gameOver' || ui.showResults) && (
        <ResultsOverlay />
      )}
    </div>
  );
}

export default DesktopLayout;
