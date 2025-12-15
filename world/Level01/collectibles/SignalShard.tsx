'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, BallCollider } from '@react-three/rapier';
import { Group, MathUtils } from 'three';
import { COLORS } from '../../shared/constants';
import { useGameStore } from '@/game/store/useGameStore';
import { triggerPickupSwirl } from '@/engine/vfx/PickupSwirl';
import { sfx } from '@/engine/audio/sfx';

interface SignalShardProps {
  id: string;
  position: [number, number, number];
  value?: number;
}

export function SignalShard({ id, position, value = 100 }: SignalShardProps) {
  const groupRef = useRef<Group>(null);
  const [collected, setCollected] = useState(false);
  const collectShard = useGameStore((s) => s.collectShard);
  const collectedShards = useGameStore((s) => s.collectedShardIds);

  // Check if already collected (for re-renders)
  const isCollected = collected || collectedShards.has(id);

  useFrame((state) => {
    if (groupRef.current && !isCollected) {
      // Floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;

      // Rotation
      groupRef.current.rotation.y += 0.03;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;

      // Pulse scale
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
      groupRef.current.scale.setScalar(pulse);
    }
  });

  const handleCollect = () => {
    if (isCollected) return;

    setCollected(true);
    collectShard(id, value);

    // Trigger VFX
    triggerPickupSwirl({ x: position[0], y: position[1], z: position[2] });

    // Play sound
    sfx.play('shardCollect');
  };

  if (isCollected) return null;

  return (
    <RigidBody
      type="fixed"
      position={position}
      colliders={false}
      sensor
      onIntersectionEnter={handleCollect}
    >
      <BallCollider args={[0.5]} sensor />

      <group ref={groupRef}>
        {/* Main crystal */}
        <mesh>
          <octahedronGeometry args={[0.3]} />
          <meshBasicMaterial color={COLORS.SHARD} transparent opacity={0.9} />
        </mesh>

        {/* Inner glow */}
        <mesh scale={0.6}>
          <octahedronGeometry args={[0.3]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
        </mesh>

        {/* Outer glow */}
        <mesh scale={1.5}>
          <octahedronGeometry args={[0.3]} />
          <meshBasicMaterial color={COLORS.SHARD} transparent opacity={0.2} />
        </mesh>

        {/* Particle ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.02, 8, 16]} />
          <meshBasicMaterial color={COLORS.SHARD} transparent opacity={0.6} />
        </mesh>
      </group>
    </RigidBody>
  );
}

export default SignalShard;
