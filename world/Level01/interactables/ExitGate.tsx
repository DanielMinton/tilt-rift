'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Group, Vector3 } from 'three';
import { COLORS } from '../../shared/constants';
import { useGameStore } from '@/game/store/useGameStore';
import { triggerVictoryBurst } from '@/engine/vfx/VictoryBurst';
import { playVictory } from '@/engine/audio/procedural';

interface ExitGateProps {
  position: [number, number, number];
}

export function ExitGate({ position }: ExitGateProps) {
  const groupRef = useRef<Group>(null);
  const triggerVictory = useGameStore((s) => s.triggerVictory);
  const phase = useGameStore((s) => s.phase);

  // Gate is always active - shards are bonus points only
  const isActive = true;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += isActive ? 0.03 : 0.01;

      if (isActive) {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.15 + 1;
        groupRef.current.scale.setScalar(pulse);
      }
    }
  });

  const handleEnter = () => {
    // Only trigger if currently playing
    if (phase !== 'playing') return;

    triggerVictoryBurst({ x: position[0], y: position[1], z: position[2] });
    playVictory();
    triggerVictory();
  };

  const color = isActive ? COLORS.GATE : COLORS.CHECKPOINT_INACTIVE;

  return (
    <RigidBody
      type="fixed"
      position={position}
      colliders={false}
      sensor
      onIntersectionEnter={handleEnter}
    >
      <CuboidCollider args={[1.5, 2, 1.5]} sensor />

      <group ref={groupRef}>
        {/* Main portal ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.2, 16, 32]} />
          <meshBasicMaterial color={color} transparent opacity={isActive ? 0.9 : 0.4} />
        </mesh>

        {/* Inner rings */}
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <torusGeometry args={[1.2, 0.1, 8, 24]} />
          <meshBasicMaterial color={color} transparent opacity={isActive ? 0.7 : 0.3} />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, -Math.PI / 4]}>
          <torusGeometry args={[0.9, 0.08, 8, 24]} />
          <meshBasicMaterial color={color} transparent opacity={isActive ? 0.7 : 0.3} />
        </mesh>

        {/* Portal fill */}
        {isActive && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.3, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
              side={2}
            />
          </mesh>
        )}

        {/* Floating crystals */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          const x = Math.cos(angle) * 2;
          const z = Math.sin(angle) * 2;
          return (
            <mesh key={i} position={[x, Math.sin(angle) * 0.5, z]}>
              <octahedronGeometry args={[0.2]} />
              <meshBasicMaterial color={color} transparent opacity={isActive ? 0.9 : 0.4} />
            </mesh>
          );
        })}

        {/* Glow effect */}
        {isActive && (
          <mesh>
            <sphereGeometry args={[2.5, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.1} />
          </mesh>
        )}
      </group>

    </RigidBody>
  );
}

export default ExitGate;
