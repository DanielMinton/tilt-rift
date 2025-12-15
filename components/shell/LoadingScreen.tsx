'use client';

import { motion } from 'framer-motion';

interface LoadingScreenProps {
  progress?: number;
  status?: string;
}

export function LoadingScreen({ progress = 0, status = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1FF2FF 1px, transparent 1px),
            linear-gradient(to bottom, #1FF2FF 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      <motion.div
        className="flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tighter">
            <span className="text-neon-cyan">TILT</span>
            <span className="text-ghost">//</span>
            <span className="text-neon-magenta">RIFT</span>
          </h1>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-4 w-64">
          {/* Spinner */}
          <div className="relative w-16 h-16">
            <motion.div
              className="absolute inset-0 border-2 border-neon-cyan/20"
              style={{ borderRadius: '0' }}
            />
            <motion.div
              className="absolute inset-0 border-2 border-transparent border-t-neon-cyan"
              style={{ borderRadius: '0' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 border-2 border-transparent border-b-neon-magenta"
              style={{ borderRadius: '0' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Progress bar */}
          {progress > 0 && (
            <div className="w-full">
              <div className="h-1 bg-void border border-ghost/20">
                <motion.div
                  className="h-full bg-neon-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-ghost font-mono text-xs">{status}</span>
                <span className="text-neon-cyan font-mono text-xs">{Math.round(progress)}%</span>
              </div>
            </div>
          )}

          {/* Status without progress */}
          {progress === 0 && (
            <motion.p
              className="text-ghost font-mono text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {status}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Version */}
      <div className="absolute bottom-4 text-ghost/30 font-mono text-xs">
        TILT//RIFT v0.1.0-alpha
      </div>
    </div>
  );
}

export default LoadingScreen;
