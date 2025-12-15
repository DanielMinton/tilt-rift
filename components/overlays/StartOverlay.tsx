'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/game/store/useGameStore';
import { getDailySeed } from '@/lib/url/seed';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';

interface StartOverlayProps {
  deviceMode: 'mobile' | 'desktop';
  onCalibrate?: () => void;
  isCalibrated?: boolean;
}

export function StartOverlay({ deviceMode, onCalibrate, isCalibrated }: StartOverlayProps) {
  const setPhase = useGameStore((state) => state.setPhase);
  const setSeed = useGameStore((state) => state.setSeed);
  const overclockEnabled = useGameStore((state) => state.overclockEnabled);
  const setOverclockEnabled = useGameStore((state) => state.setOverclockEnabled);
  const showTutorialOverlay = useGameStore((state) => state.showTutorialOverlay);
  const startGame = useGameStore((state) => state.startGame);

  const [seed] = useState(getDailySeed());

  const handleStartGame = () => {
    setSeed(seed);
    setPhase('loading');
    // Brief loading then start playing
    setTimeout(() => {
      startGame();
    }, 500);
  };

  const handleShowTutorial = () => {
    showTutorialOverlay();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex items-center justify-center bg-void/90 backdrop-blur-md z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col items-center gap-8 p-8"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="font-display text-5xl md:text-7xl font-bold text-neon-cyan neon-glow mb-2">
            TILT//RIFT
          </h1>
          <p className="font-mono text-lg text-neon-magenta">
            SIGNALRUNNER
          </p>
        </motion.div>

        {/* Daily seed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="panel px-4 py-2"
        >
          <span className="text-xs text-text-muted">DAILY SEED: </span>
          <span className="font-mono text-neon-gold">{seed}</span>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-4 items-center"
        >
          {/* Overclock toggle */}
          <div className="flex items-center gap-3">
            <Toggle
              pressed={overclockEnabled}
              onPressedChange={setOverclockEnabled}
              variant="outline"
            >
              <span className={overclockEnabled ? 'text-neon-red' : ''}>
                OVERCLOCK
              </span>
            </Toggle>
            {overclockEnabled && (
              <span className="text-xs text-neon-red">1.5x Score, +30% Danger</span>
            )}
          </div>

          {/* Calibrate button for mobile */}
          {deviceMode === 'mobile' && onCalibrate && (
            <Button
              variant="secondary"
              onClick={onCalibrate}
            >
              {isCalibrated ? 'Recalibrate Tilt' : 'Calibrate Tilt'}
            </Button>
          )}
        </motion.div>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-3"
        >
          <Button
            size="xl"
            onClick={handleStartGame}
            className="min-w-[200px]"
          >
            START RUN
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowTutorial}
          >
            How to Play
          </Button>
        </motion.div>

        {/* Device mode indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-text-muted"
        >
          {deviceMode === 'mobile' ? 'Tilt to control' : 'WASD + Mouse to control'}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export default StartOverlay;
