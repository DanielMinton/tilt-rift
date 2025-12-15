'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Mesh, Group } from 'three';
import { COLLISION_GROUPS, COLORS } from '../../shared/constants';
import { useGameStore } from '@/game/store/useGameStore';
import { triggerGateRing } from '@/engine/vfx/GateRing';

interface CheckpointProps {
  id: string;
  position: [number, number, number];
}

export function Checkpoint({ id, position }: CheckpointProps) {
  const groupRef = useRef<Group>(null);
  const [activated, setActivated] = useState(false);
  const setSpawnPoint = useGameStore((s) => s.setSpawnPoint);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.02;

      if (activated) {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 1;
        groupRef.current.scale.setScalar(pulse);
      }
    }
  });

  const handleActivate = () => {
    if (activated) return;

    setActivated(true);
    setSpawnPoint({ x: position[0], y: position[1] + 2, z: position[2] });

    // Trigger VFX
    triggerGateRing({ x: position[0], y: position[1], z: position[2] });
  };

  const color = activated ? COLORS.CHECKPOINT_ACTIVE : COLORS.CHECKPOINT_INACTIVE;

  return (
    <RigidBody
      type="fixed"
      position={position}
      colliders={false}
      sensor
      onIntersectionEnter={handleActivate}
    >
      <CuboidCollider args={[1, 2, 1]} sensor />

      <group ref={groupRef}>
        {/* Central pillar */}
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>

        {/* Floating ring */}
        <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.1, 8, 16]} />
          <meshBasicMaterial color={color} transparent opacity={activated ? 0.9 : 0.5} />
        </mesh>

        {/* Top crystal */}
        <mesh position={[0, 1.5, 0]}>
          <octahedronGeometry args={[0.3]} />
          <meshBasicMaterial color={color} transparent opacity={activated ? 1 : 0.6} />
        </mesh>

        {/* Glow sphere */}
        {activated && (
          <mesh>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.15} />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
}

export default Checkpoint;
