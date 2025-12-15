'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Mesh, MeshBasicMaterial } from 'three';
import { COLLISION_GROUPS, COLORS } from '../../shared/constants';
import { useGameStore } from '@/game/store/useGameStore';

interface HazardProps {
  position: [number, number, number];
  size: [number, number, number];
  damage?: number;
}

export function Hazard({ position, size, damage = 1 }: HazardProps) {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const takeDamage = useGameStore((s) => s.takeDamage);

  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      (glowRef.current.material as MeshBasicMaterial).opacity = pulse * 0.5;
    }
  });

  const handleCollision = () => {
    takeDamage(damage);
  };

  return (
    <RigidBody
      type="fixed"
      position={position}
      colliders={false}
      sensor
      onIntersectionEnter={handleCollision}
    >
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2, size[2] / 2]}
        sensor
      />

      {/* Hazard mesh */}
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshBasicMaterial
          color={COLORS.HAZARD}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} scale={1.2}>
        <boxGeometry args={size} />
        <meshBasicMaterial
          color={COLORS.HAZARD}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Warning spikes */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * (size[0] * 0.3);
        const z = Math.sin(angle) * (size[2] * 0.3);
        return (
          <mesh key={i} position={[x, size[1] * 0.5, z]}>
            <coneGeometry args={[0.1, 0.3, 4]} />
            <meshBasicMaterial color={COLORS.HAZARD} />
          </mesh>
        );
      })}
    </RigidBody>
  );
}

export default Hazard;
