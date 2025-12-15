'use client';

import { Canvas, CanvasProps } from '@react-three/fiber';
import { Preload, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';
import { Suspense, ReactNode, useState, useCallback } from 'react';
import { useGameStore } from '@/game/store/useGameStore';

interface GameCanvasProps {
  children: ReactNode;
  className?: string;
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#1FF2FF" wireframe />
    </mesh>
  );
}

export function GameCanvas({ children, className }: GameCanvasProps) {
  const [dpr, setDpr] = useState(1);
  const updateTelemetry = useGameStore((state) => state.updateFPS);
  const settings = useGameStore((state) => state.settings);

  const handlePerformanceChange = useCallback(({ factor }: { factor: number }) => {
    const newDpr = Math.max(0.75, Math.min(1.25, factor));
    setDpr(newDpr);
  }, []);

  const canvasProps: CanvasProps = {
    dpr: dpr,
    gl: {
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    },
    camera: {
      fov: 60,
      near: 0.1,
      far: 1000,
      position: [0, 15, 20],
    },
    shadows: true,
    frameloop: 'always',
    flat: false,
  };

  return (
    <div className={`canvas-container ${className || ''}`}>
      <Canvas {...canvasProps}>
        <Suspense fallback={<LoadingFallback />}>
          <PerformanceMonitor
            onIncline={handlePerformanceChange}
            onDecline={handlePerformanceChange}
            onChange={({ fps }) => updateTelemetry(fps)}
            flipflops={3}
            bounds={(refreshrate) => [refreshrate / 2, refreshrate]}
          >
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />

            {/* Scene background color */}
            <color attach="background" args={['#07060D']} />

            {/* Fog for depth */}
            <fog attach="fog" args={['#07060D', 30, 80]} />

            {children}

            <Preload all />
          </PerformanceMonitor>
        </Suspense>
      </Canvas>
    </div>
  );
}

export default GameCanvas;
