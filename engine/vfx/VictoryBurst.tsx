'use client';

import { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, Color } from 'three';
import { particleBudget, PARTICLE_BUDGETS } from '@/lib/perf/budget';

interface BurstParticle {
  position: Vector3;
  velocity: Vector3;
  rotation: Vector3;
  rotationSpeed: Vector3;
  color: Color;
  scale: number;
  life: number;
  maxLife: number;
  active: boolean;
}

interface VictoryBurstProps {
  maxParticles?: number;
}

export function VictoryBurst({ maxParticles = 600 }: VictoryBurstProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const particles = useRef<BurstParticle[]>([]);
  const dummy = useMemo(() => new Object3D(), []);
  const [isActive, setIsActive] = useState(false);
  const burstPosition = useRef(new Vector3(0, 0, 0));

  // Initialize particles pool
  useEffect(() => {
    const colors = [
      new Color('#FFD166'), // Gold
      new Color('#1FF2FF'), // Cyan
      new Color('#FF3BF5'), // Magenta
      new Color('#2DFF88'), // Green
    ];

    particles.current = Array.from({ length: maxParticles }, () => ({
      position: new Vector3(),
      velocity: new Vector3(),
      rotation: new Vector3(),
      rotationSpeed: new Vector3(),
      color: colors[Math.floor(Math.random() * colors.length)].clone(),
      scale: 0.1 + Math.random() * 0.1,
      life: 0,
      maxLife: 2,
      active: false,
    }));
  }, [maxParticles]);

  const trigger = useCallback((position?: { x: number; y: number; z: number }) => {
    if (position) {
      burstPosition.current.set(position.x, position.y, position.z);
    }
    setIsActive(true);

    // Emit all particles
    const emitCount = Math.min(maxParticles, PARTICLE_BUDGETS.VICTORY_TOTAL);

    particles.current.forEach((particle, i) => {
      if (i >= emitCount) return;

      particle.active = true;
      particle.life = 1.5 + Math.random() * 1; // 1.5-2.5 seconds
      particle.maxLife = particle.life;
      particle.position.copy(burstPosition.current);

      // Spherical burst pattern
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 5 + Math.random() * 10;

      particle.velocity.set(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed + 5, // Upward bias
        Math.cos(phi) * speed
      );

      particle.rotationSpeed.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
    });
  }, [maxParticles]);

  useFrame((_, delta) => {
    if (!meshRef.current || !isActive) return;

    let activeCount = 0;

    particles.current.forEach((particle, i) => {
      if (!particle.active) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        return;
      }

      activeCount++;

      // Physics
      particle.velocity.y -= 5 * delta; // Gravity
      particle.position.add(particle.velocity.clone().multiplyScalar(delta));
      particle.rotation.add(particle.rotationSpeed.clone().multiplyScalar(delta));
      particle.life -= delta;

      if (particle.life <= 0) {
        particle.active = false;
        dummy.scale.setScalar(0);
      } else {
        const lifeRatio = particle.life / particle.maxLife;

        dummy.position.copy(particle.position);
        dummy.rotation.set(
          particle.rotation.x,
          particle.rotation.y,
          particle.rotation.z
        );
        dummy.scale.setScalar(particle.scale * lifeRatio);
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Set color
      meshRef.current!.setColorAt?.(i, particle.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    // Deactivate when all particles are done
    if (activeCount === 0 && isActive) {
      setIsActive(false);
    }
  });

  // Expose trigger function
  useEffect(() => {
    (window as unknown as { victoryBurst?: { trigger: typeof trigger } }).victoryBurst = { trigger };
    return () => {
      delete (window as unknown as { victoryBurst?: { trigger: typeof trigger } }).victoryBurst;
    };
  }, [trigger]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial vertexColors transparent />
    </instancedMesh>
  );
}

export function triggerVictoryBurst(position?: { x: number; y: number; z: number }): void {
  const burst = (window as unknown as { victoryBurst?: { trigger: (pos?: { x: number; y: number; z: number }) => void } }).victoryBurst;
  if (burst) {
    burst.trigger(position);
  }
}

export default VictoryBurst;
