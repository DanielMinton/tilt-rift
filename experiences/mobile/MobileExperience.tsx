'use client';

import { useEffect, Suspense } from 'react';
import { useGameStore } from '@/game/store/useGameStore';
import { useDeviceOrientation } from './input/useDeviceOrientation';
import { useTouchGestures } from './input/useTouchGestures';
import { setHapticEnabled } from './input/haptics';
import { GameCanvas } from '@/engine/scene/GameCanvas';
import { PhysicsWorld } from '@/engine/physics/PhysicsWorld';
import { LightingRig } from '@/engine/scene/LightingRig';
import { CameraRig } from '@/engine/scene/CameraRig';
import { BackgroundRift } from '@/engine/scene/BackgroundRift';
import { PlayerOrb } from '@/engine/scene/PlayerOrb';
import { MobileLayout } from './ui/MobileLayout';
import { Level01Scene } from '@/world/Level01/Level01Scene';
import { VictoryBurst } from '@/engine/vfx/VictoryBurst';
import { ImpactSparks } from '@/engine/vfx/ImpactSparks';
import { PickupSwirl } from '@/engine/vfx/PickupSwirl';
import { GateRing } from '@/engine/vfx/GateRing';

export function MobileExperience() {
  const setDeviceMode = useGameStore((state) => state.setDeviceMode);
  const phase = useGameStore((state) => state.phase);
  const isPaused = useGameStore((state) => state.isPaused);
  const seed = useGameStore((state) => state.seed);
  const settings = useGameStore((state) => state.settings);

  const orientation = useDeviceOrientation();
  useTouchGestures();

  useEffect(() => {
    setDeviceMode('mobile');
    setHapticEnabled(true);
  }, [setDeviceMode]);

  const isPlaying = phase === 'playing' && !isPaused;

  return (
    <div className="relative w-full h-full">
      <GameCanvas>
        <PhysicsWorld paused={!isPlaying}>
          <LightingRig />
          <CameraRig offset={[0, 12, 15]} />
          <BackgroundRift />

          {/* VFX Systems */}
          <VictoryBurst />
          <ImpactSparks />
          <PickupSwirl />
          <GateRing />

          {/* Level */}
          <Suspense fallback={null}>
            <Level01Scene seed={seed} />
          </Suspense>

          {/* Player */}
          <PlayerOrb inputMode="mobile" />
        </PhysicsWorld>
      </GameCanvas>

      <MobileLayout
        permissionGranted={orientation.permissionGranted}
        permissionDenied={orientation.permissionDenied}
        isCalibrated={orientation.isCalibrated}
        isSupported={orientation.isSupported}
        onRequestPermission={orientation.requestPermission}
        onCalibrate={orientation.calibrate}
      />
    </div>
  );
}

export default MobileExperience;
