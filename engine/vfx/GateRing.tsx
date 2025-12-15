'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, RingGeometry, MeshBasicMaterial, Vector3 } from 'three';
import { Vector3Data } from '@/game/types';

interface GateRingEffect {
  position: Vector3;
  progress: number;
  active: boolean;
}

interface GateRingProps {
  maxEffects?: number;
}

export function GateRing({ maxEffects = 5 }: GateRingProps) {
  const [effects, setEffects] = useState<GateRingEffect[]>([]);

  const trigger = useCallback((position: Vector3Data) => {
    setEffects((prev) => {
      if (prev.filter((e) => e.active).length >= maxEffects) {
        return prev;
      }
      return [
        ...prev,
        {
          position: new Vector3(position.x, position.y, position.z),
          progress: 0,
          active: true,
        },
      ];
    });
  }, [maxEffects]);

  useFrame((_, delta) => {
    setEffects((prev) =>
      prev
        .map((effect) => {
          if (!effect.active) return effect;
          const newProgress = effect.progress + delta * 2; // 0.5s total duration
          if (newProgress >= 1) {
            return { ...effect, active: false };
          }
          return { ...effect, progress: newProgress };
        })
        .filter((effect) => effect.active)
    );
  });

  // Expose trigger function
  useEffect(() => {
    (window as unknown as { gateRing?: { trigger: typeof trigger } }).gateRing = { trigger };
    return () => {
      delete (window as unknown as { gateRing?: { trigger: typeof trigger } }).gateRing;
    };
  }, [trigger]);

  return (
    <>
      {effects.map((effect, index) => {
        if (!effect.active) return null;

        // Snap phase (0-0.33) then sweep phase (0.33-1)
        const snapPhase = Math.min(effect.progress / 0.33, 1);
        const sweepPhase = Math.max(0, (effect.progress - 0.33) / 0.67);

        const innerRadius = 0.8 + snapPhase * 0.2;
        const outerRadius = 1.2 + snapPhase * 0.3;
        const opacity = 1 - sweepPhase;

        return (
          <mesh
            key={index}
            position={[effect.position.x, effect.position.y + 0.01, effect.position.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[innerRadius, outerRadius, 32]} />
            <meshBasicMaterial
              color="#2DFF88"
              transparent
              opacity={opacity * 0.8}
            />
          </mesh>
        );
      })}
    </>
  );
}

export function triggerGateRing(position: Vector3Data): void {
  const gateRing = (window as unknown as { gateRing?: { trigger: (pos: Vector3Data) => void } }).gateRing;
  if (gateRing) {
    gateRing.trigger(position);
  }
}

export default GateRing;
