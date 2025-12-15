'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { Vector2 } from 'three';
import { useGameStore } from '@/game/store/useGameStore';

// Extend Three.js with post-processing passes
extend({ UnrealBloomPass, FilmPass });

interface PostFXProps {
  enabled?: boolean;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  filmGrain?: number;
}

export function PostFX({
  enabled = true,
  bloomStrength = 0.5,
  bloomRadius = 0.4,
  bloomThreshold = 0.8,
  filmGrain = 0.15,
}: PostFXProps) {
  const { size, gl } = useThree();
  const settings = useGameStore((state) => state.settings);
  const overclockEnabled = useGameStore((state) => state.overclockEnabled);

  const bloomRef = useRef<UnrealBloomPass>(null);
  const filmRef = useRef<FilmPass>(null);

  // Adjust effects based on settings
  const effectiveBloomStrength = useMemo(() => {
    if (settings.reducedMotion) return bloomStrength * 0.3;
    if (overclockEnabled) return bloomStrength * 1.5;
    return bloomStrength;
  }, [bloomStrength, settings.reducedMotion, overclockEnabled]);

  const effectiveFilmGrain = useMemo(() => {
    if (settings.reducedMotion) return 0;
    if (overclockEnabled) return filmGrain * 2;
    return filmGrain;
  }, [filmGrain, settings.reducedMotion, overclockEnabled]);

  const resolution = useMemo(
    () => new Vector2(size.width, size.height),
    [size.width, size.height]
  );

  if (!enabled || settings.reducedMotion) {
    return null;
  }

  return (
    <Effects disableGamma>
      {/* @ts-ignore */}
      <unrealBloomPass
        ref={bloomRef}
        args={[resolution, effectiveBloomStrength, bloomRadius, bloomThreshold]}
        threshold={bloomThreshold}
        strength={effectiveBloomStrength}
        radius={bloomRadius}
      />
      {effectiveFilmGrain > 0 && (
        // @ts-ignore
        <filmPass
          ref={filmRef}
          args={[effectiveFilmGrain, 0.025, 648, false]}
        />
      )}
    </Effects>
  );
}

export default PostFX;
