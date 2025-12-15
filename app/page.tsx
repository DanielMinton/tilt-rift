'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { detectPlatform, type Platform } from '@/lib/device/platform';
import { useGameStore } from '@/game/store/useGameStore';

export default function HomePage() {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setInputMode = useGameStore((s) => s.setInputMode);

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    setIsLoading(false);
  }, []);

  const handlePlay = (mode: 'mobile' | 'desktop') => {
    setInputMode(mode);
    router.push(`/play/${mode}`);
  };

  const handleAutoPlay = () => {
    if (platform) {
      const mode = platform.isMobile ? 'mobile' : 'desktop';
      handlePlay(mode);
    }
  };

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-void">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-navy/50 via-void to-void" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1FF2FF 1px, transparent 1px),
            linear-gradient(to bottom, #1FF2FF 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-12 h-12 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
            <span className="text-ghost font-mono text-sm">INITIALIZING</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
          >
            {/* Logo */}
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
                <span className="text-neon-cyan">TILT</span>
                <span className="text-ghost">//</span>
                <span className="text-neon-magenta">RIFT</span>
              </h1>
              <p className="text-ghost font-mono text-sm tracking-widest uppercase">
                Signalrunner
              </p>
            </div>

            {/* Tagline */}
            <p className="text-lg md:text-xl text-silver max-w-md">
              Guide the orb through crystalline void-scapes.
              Collect signal shards. Survive the rift.
            </p>

            {/* Play buttons */}
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <motion.button
                onClick={handleAutoPlay}
                className="relative px-8 py-4 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan font-mono text-lg uppercase tracking-wider overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">Play Now</span>
                <motion.div
                  className="absolute inset-0 bg-neon-cyan/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              <div className="flex gap-2">
                <motion.button
                  onClick={() => handlePlay('mobile')}
                  className="flex-1 px-4 py-3 bg-transparent border border-ghost/30 text-ghost font-mono text-sm uppercase tracking-wider hover:border-neon-magenta hover:text-neon-magenta transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Mobile
                </motion.button>
                <motion.button
                  onClick={() => handlePlay('desktop')}
                  className="flex-1 px-4 py-3 bg-transparent border border-ghost/30 text-ghost font-mono text-sm uppercase tracking-wider hover:border-neon-cyan hover:text-neon-cyan transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Desktop
                </motion.button>
              </div>
            </div>

            {/* Platform indicator */}
            {platform && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-ghost/50 font-mono text-xs"
              >
                Detected: {platform.isMobile ? 'Mobile' : 'Desktop'}
                {platform.hasGyroscope && ' • Gyroscope available'}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version */}
      <div className="absolute bottom-4 right-4 text-ghost/30 font-mono text-xs">
        v0.1.0-alpha
      </div>
    </main>
  );
}
