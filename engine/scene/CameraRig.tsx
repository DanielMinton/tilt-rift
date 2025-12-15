'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils, Camera } from 'three';
import { useGameStore } from '@/game/store/useGameStore';

interface CameraRigProps {
  offset?: [number, number, number];
  smoothness?: number;
  velocityLead?: number;
  maxShakeIntensity?: number;
}

export function CameraRig({
  offset = [0, 15, 20],
  smoothness = 0.05,
  velocityLead = 0.3,
  maxShakeIntensity = 6,
}: CameraRigProps) {
  const { camera } = useThree();
  const orbPosition = useGameStore((state) => state.orb.position);
  const orbVelocity = useGameStore((state) => state.orb.velocity);
  const gameState = useGameStore((state) => state.gameState);
  const settings = useGameStore((state) => state.settings);

  const targetPosition = useRef(new Vector3());
  const currentPosition = useRef(new Vector3());
  const shakeOffset = useRef(new Vector3());
  const shakeIntensity = useRef(0);
  const shakeDecay = useRef(0.9);

  // Initialize camera position
  useEffect(() => {
    const initialPos = new Vector3(
      orbPosition.x + offset[0],
      orbPosition.y + offset[1],
      orbPosition.z + offset[2]
    );
    camera.position.copy(initialPos);
    currentPosition.current.copy(initialPos);
    targetPosition.current.copy(initialPos);
  }, []);

  const triggerShake = (intensity: number) => {
    if (settings.reducedMotion) return;
    shakeIntensity.current = Math.min(intensity, maxShakeIntensity);
  };

  useFrame((_, delta) => {
    if (gameState !== 'PLAYING' && gameState !== 'COUNTDOWN') return;

    // Calculate target position with velocity lead
    const leadOffset = new Vector3(
      orbVelocity.x * velocityLead,
      0,
      orbVelocity.z * velocityLead
    );

    targetPosition.current.set(
      orbPosition.x + offset[0] + leadOffset.x,
      orbPosition.y + offset[1],
      orbPosition.z + offset[2] + leadOffset.z
    );

    // Smooth interpolation
    currentPosition.current.lerp(targetPosition.current, smoothness);

    // Apply screen shake
    if (shakeIntensity.current > 0.01 && !settings.reducedMotion) {
      shakeOffset.current.set(
        (Math.random() - 0.5) * shakeIntensity.current * 0.01,
        (Math.random() - 0.5) * shakeIntensity.current * 0.01,
        (Math.random() - 0.5) * shakeIntensity.current * 0.01
      );
      shakeIntensity.current *= shakeDecay.current;
    } else {
      shakeOffset.current.set(0, 0, 0);
    }

    // Apply final position
    camera.position.copy(currentPosition.current).add(shakeOffset.current);

    // Look at orb position
    camera.lookAt(orbPosition.x, orbPosition.y, orbPosition.z);
  });

  return null;
}

// Hook to trigger camera shake from other components
export function useCameraShake() {
  const shakeIntensityRef = useRef(0);

  const triggerShake = (intensity: number) => {
    shakeIntensityRef.current = intensity;
  };

  return { triggerShake };
}

export default CameraRig;
