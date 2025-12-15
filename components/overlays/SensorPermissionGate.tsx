'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface SensorPermissionGateProps {
  onRequestPermission: () => Promise<boolean>;
  permissionDenied: boolean;
  isSupported?: boolean;
}

export function SensorPermissionGate({
  onRequestPermission,
  permissionDenied,
  isSupported = true,
}: SensorPermissionGateProps) {
  // Device doesn't support motion sensors
  if (!isSupported) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center bg-void/95 z-50"
      >
        <div className="panel p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🖥️</div>
          <h2 className="font-display text-2xl text-neon-gold mb-4">
            Desktop Detected
          </h2>
          <p className="text-text-muted mb-6">
            This device doesn't have motion sensors. Try playing on a mobile device,
            or use the desktop version with mouse/keyboard controls.
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/play/desktop'}
          >
            Play Desktop Version
          </Button>
        </div>
      </motion.div>
    );
  }

  if (permissionDenied) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center bg-void/95 z-50"
      >
        <div className="panel p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">:(</div>
          <h2 className="font-display text-2xl text-neon-red mb-4">
            Sensor Access Denied
          </h2>
          <p className="text-text-muted mb-6">
            Motion sensors require HTTPS on iOS. For local development, try the desktop version or enable in Safari settings.
          </p>
          <div className="text-sm text-text-muted mb-6">
            <p className="mb-2">On iOS Safari:</p>
            <p>Settings → Safari → Motion & Orientation Access</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={() => window.location.href = '/play/desktop'}
            >
              Play Desktop Version
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-void/95 z-50"
    >
      <div className="panel p-8 max-w-md w-full mx-4 text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl mb-4"
        >
          📱
        </motion.div>
        <h2 className="font-display text-2xl text-neon-cyan mb-4">
          Enable Motion Sensors
        </h2>
        <p className="text-text-muted mb-6">
          TILT//RIFT uses your device's motion sensors to control the game.
          Tap the button below to enable sensor access.
        </p>
        <Button size="lg" onClick={onRequestPermission}>
          Enable Sensors
        </Button>
        <p className="text-xs text-text-muted mt-4">
          Your motion data stays on your device and is never sent anywhere.
        </p>
      </div>
    </motion.div>
  );
}

export default SensorPermissionGate;
