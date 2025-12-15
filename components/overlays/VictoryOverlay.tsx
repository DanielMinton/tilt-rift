'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/game/store/useGameStore';

export function VictoryOverlay() {
  const router = useRouter();
  const score = useGameStore((s) => s.run.score);
  const shardsCollected = useGameStore((s) => s.shardsCollected);
  const totalShards = useGameStore((s) => s.totalShards);
  const timeElapsed = useGameStore((s) => s.run.timeElapsed);
  const maxCombo = useGameStore((s) => s.run.maxCombo);
  const resetGame = useGameStore((s) => s.resetGame);
  const startGame = useGameStore((s) => s.startGame);

  const handlePlayAgain = () => {
    resetGame();
    startGame();
  };

  const handleMenu = () => {
    resetGame();
    router.push('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const perfectRun = shardsCollected === totalShards;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col items-center gap-8 p-8 max-w-md text-center"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Title */}
        <div className="space-y-2">
          <motion.h1
            className="text-4xl font-bold text-neon-cyan"
            animate={{ textShadow: ['0 0 20px #1FF2FF', '0 0 40px #1FF2FF', '0 0 20px #1FF2FF'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            SIGNAL RESTORED
          </motion.h1>
          <p className="text-ghost font-mono text-sm">
            {perfectRun ? 'PERFECT RUN!' : 'Connection established'}
          </p>
        </div>

        {/* Stats */}
        <div className="w-full space-y-4 bg-navy/50 border border-neon-cyan/30 p-6">
          <div className="flex justify-between items-center">
            <span className="text-ghost">Final Score</span>
            <motion.span
              className="text-neon-cyan font-mono text-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              {Math.floor(score)}
            </motion.span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ghost">Shards</span>
            <span className={`font-mono ${perfectRun ? 'text-neon-gold' : 'text-silver'}`}>
              {shardsCollected} / {totalShards}
              {perfectRun && ' ★'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ghost">Time</span>
            <span className="text-silver font-mono">{formatTime(timeElapsed)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ghost">Max Combo</span>
            <span className="text-neon-magenta font-mono">×{maxCombo}</span>
          </div>
        </div>

        {/* Rank */}
        <motion.div
          className="text-6xl font-bold"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        >
          {perfectRun ? (
            <span className="text-neon-gold">S</span>
          ) : shardsCollected >= totalShards * 0.9 ? (
            <span className="text-neon-cyan">A</span>
          ) : shardsCollected >= totalShards * 0.7 ? (
            <span className="text-silver">B</span>
          ) : (
            <span className="text-ghost">C</span>
          )}
        </motion.div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <motion.button
            onClick={handlePlayAgain}
            className="px-6 py-4 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan font-mono uppercase tracking-wider"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Play Again
          </motion.button>
          <motion.button
            onClick={handleMenu}
            className="px-6 py-3 bg-transparent border border-ghost/30 text-ghost font-mono uppercase tracking-wider hover:border-ghost hover:text-white transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Main Menu
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default VictoryOverlay;
