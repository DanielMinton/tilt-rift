'use client';

import { useEffect, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/game/store/useGameStore';
import { CrossPlatformPrompt } from './CrossPlatformPrompt';
import { PerformanceHUD } from './PerformanceHUD';

interface AppFrameProps {
  children: ReactNode;
}

export function AppFrame({ children }: AppFrameProps) {
  const ui = useGameStore((state) => state.ui);
  const settings = useGameStore((state) => state.settings);
  const loadSettingsFromStorage = useGameStore((state) => state.loadSettingsFromStorage);

  // Load settings on mount
  useEffect(() => {
    loadSettingsFromStorage();
  }, [loadSettingsFromStorage]);

  // Apply high contrast mode
  useEffect(() => {
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [settings.highContrast]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-void">
      {children}

      {/* Cross-platform prompt */}
      <AnimatePresence>
        {ui.showCrossPlatformPrompt && <CrossPlatformPrompt />}
      </AnimatePresence>

      {/* Performance HUD */}
      {(settings.showFPS || settings.showTelemetry) && (
        <div className="fixed bottom-4 left-4 z-50">
          <PerformanceHUD />
        </div>
      )}
    </div>
  );
}

export default AppFrame;
