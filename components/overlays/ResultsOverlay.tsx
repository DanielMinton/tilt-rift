'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useGameStore } from '@/game/store/useGameStore';
import { getRankForScore, Rank } from '@/game/types';
import { calculateFinalScore } from '@/game/rules/scoring';
import { generateShareURL, shareResult } from '@/lib/url/share';
import { Button } from '@/components/ui/Button';

const RANK_COLORS: Record<Rank, string> = {
  bronze: 'text-orange-400',
  silver: 'text-gray-300',
  gold: 'text-neon-gold',
  platinum: 'text-neon-cyan',
};

const RANK_LABELS: Record<Rank, string> = {
  bronze: 'BRONZE',
  silver: 'SILVER',
  gold: 'GOLD',
  platinum: 'PLATINUM',
};

export function ResultsOverlay() {
  const gameState = useGameStore((state) => state.gameState);
  const run = useGameStore((state) => state.run);
  const seed = useGameStore((state) => state.seed);
  const deviceMode = useGameStore((state) => state.deviceMode);
  const setGameState = useGameStore((state) => state.setGameState);
  const resetGame = useGameStore((state) => state.resetGame);
  const hideResultsOverlay = useGameStore((state) => state.hideResultsOverlay);
  const showCrossPlatformPrompt = useGameStore((state) => state.showCrossPlatformPrompt);

  const isVictory = gameState === 'WON';

  const finalScore = useMemo(() => {
    return calculateFinalScore({
      shardsCollected: run.shardsCollected,
      timeRemaining: run.timeRemaining,
      maxCombo: run.maxCombo,
      impactCount: run.impactCount,
    });
  }, [run]);

  const rank = getRankForScore(finalScore);

  const shareData = useMemo(() => ({
    seed,
    score: finalScore,
    rank,
    device: deviceMode,
  }), [seed, finalScore, rank, deviceMode]);

  const shareURL = useMemo(() => generateShareURL(shareData), [shareData]);

  const handleRetry = () => {
    hideResultsOverlay();
    resetGame();
    setGameState('MENU');
  };

  const handleShare = async () => {
    await shareResult(shareData);
  };

  const handleSwitchDevice = () => {
    showCrossPlatformPrompt();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-void/90 backdrop-blur-md z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="panel p-8 max-w-lg w-full mx-4 my-8"
      >
        {/* Victory/Defeat header */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`font-display text-4xl text-center mb-2 ${
            isVictory ? 'text-neon-gold neon-glow-gold' : 'text-neon-red'
          }`}
        >
          {isVictory ? 'SIGNAL CLEAR' : 'CONNECTION LOST'}
        </motion.h2>

        {/* Rank badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="flex justify-center mb-6"
        >
          <div className={`text-2xl font-display font-bold ${RANK_COLORS[rank]}`}>
            {RANK_LABELS[rank]}
          </div>
        </motion.div>

        {/* Score breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 mb-6"
        >
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Shards Collected</span>
            <span className="font-mono">{run.shardsCollected}/{run.totalShards}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Time Bonus</span>
            <span className="font-mono text-neon-cyan">+{Math.floor(run.timeRemaining * 10)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Max Combo</span>
            <span className="font-mono">{run.maxCombo}x</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Impacts</span>
            <span className="font-mono text-neon-red">-{run.impactCount * 50}</span>
          </div>
          <div className="border-t border-neon-cyan/20 pt-3 flex justify-between">
            <span className="text-text-primary font-bold">TOTAL SCORE</span>
            <span className="font-mono text-2xl text-neon-gold">{finalScore.toLocaleString()}</span>
          </div>
        </motion.div>

        {/* QR Code for sharing (desktop only) */}
        {deviceMode === 'desktop' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-white p-2 rounded">
              <QRCodeSVG value={shareURL} size={120} />
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-3"
        >
          <Button onClick={handleRetry} size="lg" className="w-full">
            Play Again
          </Button>
          <Button onClick={handleShare} variant="secondary" size="lg" className="w-full">
            Share Score
          </Button>
          <Button onClick={handleSwitchDevice} variant="ghost" size="md" className="w-full">
            Try on {deviceMode === 'mobile' ? 'Desktop' : 'Mobile'}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ResultsOverlay;
