'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  InstancedMesh,
  Object3D,
  Color,
  Vector3,
  MathUtils,
} from 'three';
import { particleBudget, PARTICLE_BUDGETS } from '@/lib/perf/budget';

interface Particle {
  position: Vector3;
  velocity: Vector3;
  color: Color;
  size: number;
  life: number;
  maxLife: number;
  active: boolean;
}

interface ParticleSystemProps {
  maxParticles?: number;
  emissionRate?: number;
  position?: [number, number, number];
  spread?: number;
  speed?: number;
  color?: string;
  size?: number;
  lifetime?: number;
  gravity?: number;
  paused?: boolean;
  budgetType?: keyof typeof PARTICLE_BUDGETS;
}

export function ParticleSystem({
  maxParticles = 100,
  emissionRate = 10,
  position = [0, 0, 0],
  spread = 1,
  speed = 2,
  color = '#1FF2FF',
  size = 0.1,
  lifetime = 2,
  gravity = -1,
  paused = false,
  budgetType = 'AMBIENT_GLYPHS',
}: ParticleSystemProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const particles = useRef<Particle[]>([]);
  const dummy = useMemo(() => new Object3D(), []);
  const emissionAccumulator = useRef(0);

  // Initialize particles
  useEffect(() => {
    particles.current = Array.from({ length: maxParticles }, () => ({
      position: new Vector3(),
      velocity: new Vector3(),
      color: new Color(color),
      size,
      life: 0,
      maxLife: lifetime,
      active: false,
    }));
  }, [maxParticles, color, size, lifetime]);

  const emitParticle = () => {
    if (!particleBudget.canSpawn(budgetType)) return;

    const particle = particles.current.find((p) => !p.active);
    if (!particle) return;

    particleBudget.spawn(budgetType);

    particle.active = true;
    particle.life = lifetime;
    particle.maxLife = lifetime;
    particle.position.set(
      position[0] + (Math.random() - 0.5) * spread,
      position[1] + (Math.random() - 0.5) * spread,
      position[2] + (Math.random() - 0.5) * spread
    );
    particle.velocity.set(
      (Math.random() - 0.5) * speed,
      Math.random() * speed,
      (Math.random() - 0.5) * speed
    );
  };

  useFrame((_, delta) => {
    if (!meshRef.current || paused) return;

    // Emit new particles
    emissionAccumulator.current += delta * emissionRate;
    while (emissionAccumulator.current >= 1) {
      emitParticle();
      emissionAccumulator.current -= 1;
    }

    // Update particles
    particles.current.forEach((particle, i) => {
      if (!particle.active) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        return;
      }

      // Update physics
      particle.velocity.y += gravity * delta;
      particle.position.add(particle.velocity.clone().multiplyScalar(delta));
      particle.life -= delta;

      if (particle.life <= 0) {
        particle.active = false;
        particleBudget.release(budgetType);
        dummy.scale.setScalar(0);
      } else {
        // Scale based on life
        const lifeRatio = particle.life / particle.maxLife;
        const currentSize = particle.size * lifeRatio;

        dummy.position.copy(particle.position);
        dummy.scale.setScalar(currentSize);
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </instancedMesh>
  );
}

export default ParticleSystem;
