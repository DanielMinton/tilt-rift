'use client';

import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useGameStore } from '@/game/store/useGameStore';
import { Button } from '@/components/ui/Button';

export function CrossPlatformPrompt() {
  const deviceMode = useGameStore((state) => state.deviceMode);
  const hideCrossPlatformPrompt = useGameStore((state) => state.hideCrossPlatformPrompt);

  const currentURL = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-void/80 backdrop-blur-sm z-50"
      onClick={hideCrossPlatformPrompt}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="panel p-8 max-w-md w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {deviceMode === 'desktop' ? (
          <>
            <h3 className="font-display text-2xl text-neon-cyan mb-4">
              Try on Mobile!
            </h3>
            <p className="text-text-muted mb-6">
              Experience TILT//RIFT with intuitive tilt controls on your phone or tablet.
              Scan the QR code to play the same seed.
            </p>
            <div className="flex justify-center mb-6">
              <div className="bg-white p-3 rounded">
                <QRCodeSVG value={currentURL} size={150} />
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-display text-2xl text-neon-cyan mb-4">
              Try on Desktop!
            </h3>
            <p className="text-text-muted mb-6">
              Experience TILT//RIFT with mouse-painted vector fields and keyboard controls.
              Visit this URL on your computer:
            </p>
            <div className="panel bg-navy/50 p-3 mb-6 overflow-x-auto">
              <code className="text-neon-gold text-sm break-all">
                {currentURL}
              </code>
            </div>
          </>
        )}

        <Button variant="secondary" onClick={hideCrossPlatformPrompt}>
          Maybe Later
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default CrossPlatformPrompt;
