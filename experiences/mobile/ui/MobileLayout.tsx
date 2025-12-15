'use client';

import { useGameStore } from '@/game/store/useGameStore';
import { MobileHUD } from '@/components/hud/MobileHUD';
import { SensorPermissionGate } from '@/components/overlays/SensorPermissionGate';
import { TutorialOverlay } from '@/components/overlays/TutorialOverlay';
import { PauseOverlay } from '@/components/overlays/PauseOverlay';
import { ResultsOverlay } from '@/components/overlays/ResultsOverlay';
import { StartOverlay } from '@/components/overlays/StartOverlay';

interface MobileLayoutProps {
  permissionGranted: boolean;
  permissionDenied: boolean;
  isCalibrated: boolean;
  isSupported: boolean;
  onRequestPermission: () => Promise<boolean>;
  onCalibrate: () => void;
}

export function MobileLayout({
  permissionGranted,
  permissionDenied,
  isCalibrated,
  isSupported,
  onRequestPermission,
  onCalibrate,
}: MobileLayoutProps) {
  const phase = useGameStore((state) => state.phase);
  const isPaused = useGameStore((state) => state.isPaused);
  const ui = useGameStore((state) => state.ui);

  // Show permission gate if needed (or unsupported device message)
  if (!permissionGranted) {
    return (
      <div className="hud-overlay">
        <SensorPermissionGate
          onRequestPermission={onRequestPermission}
          permissionDenied={permissionDenied}
          isSupported={isSupported}
        />
      </div>
    );
  }

  return (
    <div className="hud-overlay">
      {/* Start overlay for menu state */}
      {phase === 'menu' && (
        <StartOverlay
          deviceMode="mobile"
          onCalibrate={onCalibrate}
          isCalibrated={isCalibrated}
        />
      )}

      {/* Tutorial overlay */}
      {ui.showTutorial && (
        <TutorialOverlay deviceMode="mobile" />
      )}

      {/* In-game HUD */}
      {(phase === 'playing' || phase === 'loading') && (
        <MobileHUD />
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

export default MobileLayout;
