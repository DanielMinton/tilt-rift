'use client';

import { useEffect, Suspense, useCallback } from 'react';
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
import { initAudio, resumeAudio } from '@/engine/audio/procedural';
import { startAmbient, stopAmbient, updateAmbientProgress } from '@/engine/audio/ambientLayers';

export function DesktopExperience() {
  const setDeviceMode = useGameStore((state) => state.setDeviceMode);
  const phase = useGameStore((state) => state.phase);
  const isPaused = useGameStore((state) => state.isPaused);
  const seed = useGameStore((state) => state.seed);
  const courseProgress = useGameStore((state) => state.courseProgress);

  // Input handlers
  useKeyboardInput();
  useDragInput();

  // Initialize audio on first user interaction
  const handleUserInteraction = useCallback(() => {
    initAudio();
    resumeAudio();
    startAmbient();
    // Remove listener after first interaction
    document.removeEventListener('click', handleUserInteraction);
    document.removeEventListener('touchstart', handleUserInteraction);
    document.removeEventListener('keydown', handleUserInteraction);
  }, []);

  useEffect(() => {
    setDeviceMode('desktop');

    // Set up audio initialization on user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      stopAmbient();
    };
  }, [setDeviceMode, handleUserInteraction]);

  // Update ambient music based on course progress
  useEffect(() => {
    if (phase === 'playing') {
      updateAmbientProgress(courseProgress);
    }
  }, [courseProgress, phase]);

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
