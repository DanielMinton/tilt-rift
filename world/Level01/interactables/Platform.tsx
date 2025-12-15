'use client';

import { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { COLORS } from '../../shared/constants';

interface PlatformProps {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: number;
}

export function Platform({ position, size, rotation = 0 }: PlatformProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <RigidBody
      type="fixed"
      position={position}
      rotation={[0, rotation, 0]}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={COLORS.PLATFORM_BASE}
          metalness={0.8}
          roughness={0.2}
          emissive={COLORS.PLATFORM_EDGE}
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Edge glow effect */}
      <mesh position={[0, size[1] / 2 + 0.01, 0]}>
        <boxGeometry args={[size[0] + 0.1, 0.02, size[2] + 0.1]} />
        <meshBasicMaterial
          color={COLORS.PLATFORM_EDGE}
          transparent
          opacity={0.3}
        />
      </mesh>
    </RigidBody>
  );
}

export default Platform;
