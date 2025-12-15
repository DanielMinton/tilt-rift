'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, BallCollider, RapierRigidBody } from '@react-three/rapier';
import { Mesh, Vector3, MeshBasicMaterial } from 'three';
import { useGameStore } from '@/game/store/useGameStore';
import { COLLISION_GROUPS } from '@/world/shared/constants';

interface PlayerOrbProps {
  inputMode: 'mobile' | 'desktop';
}

export function PlayerOrb({ inputMode }: PlayerOrbProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  const tiltX = useGameStore((s) => s.tiltX);
  const tiltY = useGameStore((s) => s.tiltY);
  const spawnPoint = useGameStore((s) => s.spawnPoint);
  const phase = useGameStore((s) => s.phase);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const takeDamage = useGameStore((s) => s.takeDamage);

  const forceMultiplier = inputMode === 'mobile' ? 15 : 20;

  // Respawn at spawn point
  useEffect(() => {
    if (rigidBodyRef.current && spawnPoint) {
      rigidBodyRef.current.setTranslation(
        { x: spawnPoint.x, y: spawnPoint.y, z: spawnPoint.z },
        true
      );
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [spawnPoint]);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || phase !== 'playing') return;

    // Apply tilt force
    const forceX = tiltX * forceMultiplier;
    const forceZ = -tiltY * forceMultiplier;

    rigidBodyRef.current.applyImpulse(
      { x: forceX * delta, y: 0, z: forceZ * delta },
      true
    );

    // Update player position in store
    const pos = rigidBodyRef.current.translation();
    setPlayerPosition({ x: pos.x, y: pos.y, z: pos.z });

    // Check for fall death
    if (pos.y < -5) {
      takeDamage(100);
    }

    // Glow pulse
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8;
      (glowRef.current.material as MeshBasicMaterial).opacity = pulse * 0.3;
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      position={[spawnPoint?.x ?? 0, spawnPoint?.y ?? 2, spawnPoint?.z ?? 0]}
      colliders={false}
      linearDamping={0.5}
      angularDamping={0.5}
      restitution={0.3}
      friction={0.5}
    >
      <BallCollider args={[0.5]} />

      {/* Main orb */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#1FF2FF"
          emissive="#1FF2FF"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Inner core */}
      <mesh scale={0.6}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef} scale={1.5}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#1FF2FF" transparent opacity={0.3} />
      </mesh>
    </RigidBody>
  );
}

export default PlayerOrb;
