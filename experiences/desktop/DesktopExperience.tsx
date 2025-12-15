'use client';

import { useEffect, Suspense } from 'react';
import { useGameStore } from '@/game/store/useGameStore';
import { useKeyboardInput } from './input/useKeyboardInput';
import { useDragInput } from './input/useDragInput';
import { GameCanvas } from '@/engine/scene/GameCanvas';
import { PhysicsWorld } from '@/engine/physics/PhysicsWorld';
import { LightingRig } from '@/engine/scene/LightingRig';
import { CameraRig } from '@/engine/scene/CameraRig';
import { BackgroundRift } from '@/engine/scene/BackgroundRift';
import { PlayerOrb } from '@/engine/scene/PlayerOrb';
import { DesktopLayout } from './ui/DesktopLayout';
import { Level01Scene } from '@/world/Level01/Level01Scene';
import { VictoryBurst } from '@/engine/vfx/VictoryBurst';
import { ImpactSparks } from '@/engine/vfx/ImpactSparks';
import { PickupSwirl } from '@/engine/vfx/PickupSwirl';
import { GateRing } from '@/engine/vfx/GateRing';

export function DesktopExperience() {
  const setDeviceMode = useGameStore((state) => state.setDeviceMode);
  const phase = useGameStore((state) => state.phase);
  const isPaused = useGameStore((state) => state.isPaused);
  const seed = useGameStore((state) => state.seed);

  // Input handlers
  useKeyboardInput();
  useDragInput();

  useEffect(() => {
    setDeviceMode('desktop');
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
          <PlayerOrb inputMode="desktop" />
        </PhysicsWorld>
      </GameCanvas>

      <DesktopLayout />
    </div>
  );
}

export default DesktopExperience;
