'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/game/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';

export function PauseOverlay() {
  const setGameState = useGameStore((state) => state.setGameState);
  const hidePauseOverlay = useGameStore((state) => state.hidePauseOverlay);
  const resetGame = useGameStore((state) => state.resetGame);

  const settings = useGameStore((state) => state.settings);
  const setMasterVolume = useGameStore((state) => state.setMasterVolume);
  const setMusicVolume = useGameStore((state) => state.setMusicVolume);
  const setSfxVolume = useGameStore((state) => state.setSfxVolume);

  const handleResume = () => {
    setGameState('PLAYING');
    hidePauseOverlay();
  };

  const handleQuit = () => {
    resetGame();
    hidePauseOverlay();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-void/80 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="panel p-8 max-w-md w-full mx-4"
      >
        <h2 className="font-display text-3xl text-center text-neon-cyan mb-8">
          PAUSED
        </h2>

        {/* Volume controls */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="text-sm text-text-muted mb-2 block">
              Master Volume
            </label>
            <Slider
              value={[settings.masterVolume * 100]}
              onValueChange={([v]) => setMasterVolume(v / 100)}
              max={100}
              step={1}
            />
          </div>

          <div>
            <label className="text-sm text-text-muted mb-2 block">
              Music Volume
            </label>
            <Slider
              value={[settings.musicVolume * 100]}
              onValueChange={([v]) => setMusicVolume(v / 100)}
              max={100}
              step={1}
            />
          </div>

          <div>
            <label className="text-sm text-text-muted mb-2 block">
              SFX Volume
            </label>
            <Slider
              value={[settings.sfxVolume * 100]}
              onValueChange={([v]) => setSfxVolume(v / 100)}
              max={100}
              step={1}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Button onClick={handleResume} size="lg" className="w-full">
            Resume
          </Button>
          <Button onClick={handleQuit} variant="danger" size="lg" className="w-full">
            Abandon Run
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PauseOverlay;
