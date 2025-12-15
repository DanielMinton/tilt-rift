'use client';

import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, MathUtils } from 'three';
import { particleBudget } from '@/lib/perf/budget';
import { Vector3Data } from '@/game/types';

interface SwirlParticle {
  position: Vector3;
  angle: number;
  radius: number;
  height: number;
  life: number;
  maxLife: number;
  active: boolean;
}

interface PickupSwirlProps {
  maxParticles?: number;
}

export function PickupSwirl({ maxParticles = 50 }: PickupSwirlProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const particles = useRef<SwirlParticle[]>([]);
  const dummy = useMemo(() => new Object3D(), []);
  const pendingEffects = useRef<Array<{ position: Vector3Data }>>([]);

  useEffect(() => {
    particles.current = Array.from({ length: maxParticles }, () => ({
      position: new Vector3(),
      angle: 0,
      radius: 0,
      height: 0,
      life: 0,
      maxLife: 0.45,
      active: false,
    }));
  }, [maxParticles]);

  const trigger = useCallback((position: Vector3Data) => {
    pendingEffects.current.push({ position });
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Process pending effects
    pendingEffects.current.forEach((effect) => {
      const particleCount = 12;
      let emitted = 0;

      for (const particle of particles.current) {
        if (particle.active) continue;
        if (emitted >= particleCount) break;
        if (!particleBudget.canSpawn('PICKUP_SWIRL_ACTIVE')) break;

        particleBudget.spawn('PICKUP_SWIRL_ACTIVE');

        particle.active = true;
        particle.life = 0.45;
        particle.maxLife = 0.45;
        particle.position.set(
          effect.position.x,
          effect.position.y,
          effect.position.z
        );
        particle.angle = (emitted / particleCount) * Math.PI * 2;
        particle.radius = 0.5;
        particle.height = 0;
        emitted++;
      }
    });
    pendingEffects.current = [];

    // Update particles
    particles.current.forEach((particle, i) => {
      if (!particle.active) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        return;
      }

      particle.life -= delta;

      if (particle.life <= 0) {
        particle.active = false;
        particleBudget.release('PICKUP_SWIRL_ACTIVE');
        dummy.scale.setScalar(0);
      } else {
        const progress = 1 - particle.life / particle.maxLife;

        // Spiral upward and inward
        particle.angle += delta * 10;
        particle.radius = 0.5 * (1 - progress);
        particle.height = progress * 2;

        const x = particle.position.x + Math.cos(particle.angle) * particle.radius;
        const y = particle.position.y + particle.height;
        const z = particle.position.z + Math.sin(particle.angle) * particle.radius;

        dummy.position.set(x, y, z);

        // Scale pops at start then shrinks
        let scale: number;
        if (progress < 0.2) {
          scale = MathUtils.lerp(0, 0.15, progress / 0.2);
        } else {
          scale = MathUtils.lerp(0.15, 0, (progress - 0.2) / 0.8);
        }
        dummy.scale.setScalar(scale);
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Expose trigger function
  useEffect(() => {
    (window as unknown as { pickupSwirl?: { trigger: typeof trigger } }).pickupSwirl = { trigger };
    return () => {
      delete (window as unknown as { pickupSwirl?: { trigger: typeof trigger } }).pickupSwirl;
    };
  }, [trigger]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#FFD166" transparent opacity={0.9} />
    </instancedMesh>
  );
}

export function triggerPickupSwirl(position: Vector3Data): void {
  const swirl = (window as unknown as { pickupSwirl?: { trigger: (pos: Vector3Data) => void } }).pickupSwirl;
  if (swirl) {
    swirl.trigger(position);
  }
}

export default PickupSwirl;
