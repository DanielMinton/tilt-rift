'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/game/store/useGameStore';

export function GameOverOverlay() {
  const router = useRouter();
  const score = useGameStore((s) => s.run.score);
  const shardsCollected = useGameStore((s) => s.shardsCollected);
  const totalShards = useGameStore((s) => s.totalShards);
  const timeElapsed = useGameStore((s) => s.run.timeElapsed);
  const resetGame = useGameStore((s) => s.resetGame);
  const startGame = useGameStore((s) => s.startGame);

  const handleRetry = () => {
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
          <h1 className="text-4xl font-bold text-neon-magenta">SIGNAL LOST</h1>
          <p className="text-ghost font-mono text-sm">Connection terminated</p>
        </div>

        {/* Stats */}
        <div className="w-full space-y-4 bg-navy/50 border border-ghost/20 p-6">
          <div className="flex justify-between items-center">
            <span className="text-ghost">Score</span>
            <span className="text-neon-cyan font-mono text-xl">{Math.floor(score)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ghost">Shards</span>
            <span className="text-neon-gold font-mono">
              {shardsCollected} / {totalShards}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ghost">Time</span>
            <span className="text-silver font-mono">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <motion.button
            onClick={handleRetry}
            className="px-6 py-4 bg-neon-magenta/10 border border-neon-magenta text-neon-magenta font-mono uppercase tracking-wider"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Try Again
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

export default GameOverOverlay;
