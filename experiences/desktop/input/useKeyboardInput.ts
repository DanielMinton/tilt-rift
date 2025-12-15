'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/game/store/useGameStore';

export function useKeyboardInput() {
  const setTilt = useGameStore((s) => s.setTilt);
  const phase = useGameStore((s) => s.phase);
  const keysRef = useRef<Record<string, boolean>>({});

  const updateTilt = useCallback(() => {
    const keys = keysRef.current;
    let x = 0;
    let y = 0;

    if (keys['KeyA'] || keys['ArrowLeft']) x -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) x += 1;
    if (keys['KeyW'] || keys['ArrowUp']) y += 1;
    if (keys['KeyS'] || keys['ArrowDown']) y -= 1;

    setTilt(x, y);
  }, [setTilt]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't capture if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      keysRef.current[e.code] = true;
      updateTilt();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      updateTilt();
    };

    const onBlur = () => {
      // Reset all keys when window loses focus
      keysRef.current = {};
      setTilt(0, 0);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [updateTilt, setTilt]);

  return { isActive: phase === 'playing' };
}

export default useKeyboardInput;
