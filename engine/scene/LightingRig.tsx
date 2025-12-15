'use client';

import { useRef } from 'react';
import { DirectionalLight, HemisphereLight } from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/game/store/useGameStore';

interface LightingRigProps {
  followTarget?: boolean;
  targetPosition?: [number, number, number];
}

export function LightingRig({ followTarget = true, targetPosition = [0, 0, 0] }: LightingRigProps) {
  const directionalRef = useRef<DirectionalLight>(null);
  const orbPosition = useGameStore((state) => state.orb.position);
  const settings = useGameStore((state) => state.settings);

  const shadowMapSize = settings.reducedMotion ? 1024 : 2048;

  useFrame(() => {
    if (directionalRef.current && followTarget) {
      const target = targetPosition || [orbPosition.x, orbPosition.y, orbPosition.z];
      directionalRef.current.target.position.set(target[0], target[1], target[2]);
      directionalRef.current.target.updateMatrixWorld();

      // Position light relative to target
      directionalRef.current.position.set(
        target[0] + 10,
        target[1] + 20,
        target[2] + 10
      );
    }
  });

  return (
    <>
      {/* Hemisphere light for ambient fill */}
      <hemisphereLight
        args={['#87CEEB', '#0B1020', 0.4]}
        position={[0, 50, 0]}
      />

      {/* Main directional light (key light) */}
      <directionalLight
        ref={directionalRef}
        color="#FFFFFF"
        intensity={1.2}
        position={[10, 20, 10]}
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />

      {/* Fill light from opposite side */}
      <directionalLight
        color="#4488FF"
        intensity={0.3}
        position={[-10, 10, -10]}
      />

      {/* Rim light for separation */}
      <directionalLight
        color="#FF3BF5"
        intensity={0.2}
        position={[0, 5, -15]}
      />

      {/* Subtle point light for orb area glow */}
      <pointLight
        color="#1FF2FF"
        intensity={0.5}
        distance={10}
        decay={2}
        position={[orbPosition.x, orbPosition.y + 2, orbPosition.z]}
      />
    </>
  );
}

export default LightingRig;
