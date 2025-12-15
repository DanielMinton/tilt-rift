'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/game/store/useGameStore';

export function SettingsPanel() {
  const settings = useGameStore((s) => s.settings);
  const setMasterVolume = useGameStore((s) => s.setMasterVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);
  const setSfxVolume = useGameStore((s) => s.setSfxVolume);
  const setReducedMotion = useGameStore((s) => s.setReducedMotion);
  const setShowFPS = useGameStore((s) => s.setShowFPS);

  return (
    <motion.div
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-72 bg-navy/95 border border-ghost/20 backdrop-blur-sm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="p-4 border-b border-ghost/20">
        <h2 className="text-lg font-bold text-neon-cyan">Settings</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Audio Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-ghost uppercase tracking-wider">Audio</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-silver">Master</label>
                <span className="text-xs text-ghost font-mono">
                  {Math.round(settings.masterVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-void rounded-none appearance-none cursor-pointer accent-neon-cyan"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-silver">Music</label>
                <span className="text-xs text-ghost font-mono">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-void rounded-none appearance-none cursor-pointer accent-neon-cyan"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-silver">SFX</label>
                <span className="text-xs text-ghost font-mono">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-void rounded-none appearance-none cursor-pointer accent-neon-cyan"
              />
            </div>
          </div>
        </div>

        {/* Accessibility Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-ghost uppercase tracking-wider">Accessibility</h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-silver">Reduced Motion</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-void border border-ghost/30 peer-checked:bg-neon-cyan/20 peer-checked:border-neon-cyan transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-ghost peer-checked:bg-neon-cyan peer-checked:translate-x-5 transition-all" />
              </div>
            </label>
          </div>
        </div>

        {/* Display Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-ghost uppercase tracking-wider">Display</h3>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-silver">Show FPS</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.showFPS}
                onChange={(e) => setShowFPS(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-void border border-ghost/30 peer-checked:bg-neon-cyan/20 peer-checked:border-neon-cyan transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-ghost peer-checked:bg-neon-cyan peer-checked:translate-x-5 transition-all" />
            </div>
          </label>
        </div>
      </div>
    </motion.div>
  );
}

export default SettingsPanel;
