'use client';

import { Physics, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, ReactNode } from 'react';
import { useGameStore } from '@/game/store/useGameStore';
import { PHYSICS_CONFIG } from './rapierConfig';
import { Vector3 } from 'three';

interface PhysicsWorldProps {
  children: ReactNode;
  paused?: boolean;
  debug?: boolean;
}

const SYNC_INTERVAL = 0.1; // Sync every 100ms

export function PhysicsWorld({ children, paused = false, debug = false }: PhysicsWorldProps) {
  const lastSyncTimeRef = useRef(0);
  const orbRef = useRef<RapierRigidBody>(null);

  const phase = useGameStore((state) => state.phase);
  const gravity = useGameStore((state) => state.input.gravity);
  const updateOrbState = useGameStore((state) => state.updateOrbState);
  const updateCooldowns = useGameStore((state) => state.updateCooldowns);
  const updateTime = useGameStore((state) => state.updateTime);

  const isPaused = paused || phase !== 'playing';

  const syncGameState = useCallback(() => {
    if (!orbRef.current) return;

    const position = orbRef.current.translation();
    const velocity = orbRef.current.linvel();
    const speed = new Vector3(velocity.x, velocity.y, velocity.z).length();

    updateOrbState({
      position: { x: position.x, y: position.y, z: position.z },
      velocity: { x: velocity.x, y: velocity.y, z: velocity.z },
      speed,
      isGrounded: position.y < 0.6,
    });
  }, [updateOrbState]);

  useFrame((state, delta) => {
    if (isPaused) return;

    // Update game time
    if (phase === 'playing') {
      updateTime(delta);
      updateCooldowns(delta);
    }

    // Throttled state sync
    const elapsedTime = state.clock.elapsedTime;
    if (elapsedTime - lastSyncTimeRef.current >= SYNC_INTERVAL) {
      syncGameState();
      lastSyncTimeRef.current = elapsedTime;
    }
  });

  return (
    <Physics
      gravity={[gravity.x, gravity.y, gravity.z]}
      timeStep={PHYSICS_CONFIG.FIXED_DELTA}
      paused={isPaused}
      debug={debug}
    >
      {children}
    </Physics>
  );
}

export function usePhysicsWorld() {
  const gravity = useGameStore((state) => state.input.gravity);
  const setGravity = useGameStore((state) => state.setGravity);

  const applyGravityModifier = useCallback((modifier: number) => {
    setGravity({
      x: gravity.x * modifier,
      y: gravity.y * modifier,
      z: gravity.z * modifier,
    });
  }, [gravity, setGravity]);

  const resetGravity = useCallback(() => {
    setGravity(PHYSICS_CONFIG.GRAVITY_DEFAULT);
  }, [setGravity]);

  return {
    gravity,
    applyGravityModifier,
    resetGravity,
  };
}
