'use client';

import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, Color } from 'three';
import { particleBudget } from '@/lib/perf/budget';
import { Vector3Data } from '@/game/types';

interface Spark {
  position: Vector3;
  velocity: Vector3;
  life: number;
  active: boolean;
}

interface ImpactSparksProps {
  maxSparks?: number;
}

export function ImpactSparks({ maxSparks = 200 }: ImpactSparksProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const sparks = useRef<Spark[]>([]);
  const dummy = useMemo(() => new Object3D(), []);
  const pendingBursts = useRef<Array<{ position: Vector3Data; count: number; color: string }>>([]);

  // Initialize sparks pool
  useEffect(() => {
    sparks.current = Array.from({ length: maxSparks }, () => ({
      position: new Vector3(),
      velocity: new Vector3(),
      life: 0,
      active: false,
    }));
  }, [maxSparks]);

  const burst = useCallback((position: Vector3Data, count: number = 20, color: string = '#1FF2FF') => {
    pendingBursts.current.push({ position, count, color });
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Process pending bursts
    pendingBursts.current.forEach((burstData) => {
      const availableCount = Math.min(
        burstData.count,
        particleBudget.getRemaining('IMPACT_SPARKS_PER_SEC')
      );

      if (availableCount <= 0) return;

      let emitted = 0;
      for (const spark of sparks.current) {
        if (spark.active) continue;
        if (emitted >= availableCount) break;
        if (!particleBudget.spawn('IMPACT_SPARKS_PER_SEC')) break;

        spark.active = true;
        spark.life = 0.3 + Math.random() * 0.2;
        spark.position.set(
          burstData.position.x,
          burstData.position.y,
          burstData.position.z
        );
        spark.velocity.set(
          (Math.random() - 0.5) * 10,
          Math.random() * 8 + 2,
          (Math.random() - 0.5) * 10
        );
        emitted++;
      }
    });
    pendingBursts.current = [];

    // Update sparks
    sparks.current.forEach((spark, i) => {
      if (!spark.active) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        return;
      }

      // Physics update
      spark.velocity.y -= 20 * delta; // Gravity
      spark.position.add(spark.velocity.clone().multiplyScalar(delta));
      spark.life -= delta;

      if (spark.life <= 0) {
        spark.active = false;
        dummy.scale.setScalar(0);
      } else {
        dummy.position.copy(spark.position);
        dummy.scale.setScalar(0.05 * (spark.life / 0.5));
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Expose burst function via ref
  useEffect(() => {
    (window as unknown as { impactSparks?: { burst: typeof burst } }).impactSparks = { burst };
    return () => {
      delete (window as unknown as { impactSparks?: { burst: typeof burst } }).impactSparks;
    };
  }, [burst]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxSparks]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#1FF2FF" transparent opacity={0.9} />
    </instancedMesh>
  );
}

export function triggerImpactSparks(position: Vector3Data, count?: number, color?: string): void {
  const sparks = (window as unknown as { impactSparks?: { burst: (pos: Vector3Data, count?: number, color?: string) => void } }).impactSparks;
  if (sparks) {
    sparks.burst(position, count, color);
  }
}

export default ImpactSparks;
