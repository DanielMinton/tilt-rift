'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/game/store/useGameStore';

interface KeyState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
  shift: boolean;
  q: boolean;
  e: boolean;
  r: boolean;
  escape: boolean;
}

const KEY_MAPPINGS: Record<string, keyof KeyState> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  Space: 'space',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
  KeyQ: 'q',
  KeyE: 'e',
  KeyR: 'r',
  Escape: 'escape',
};

const WIND_FORCE = 5; // Force multiplier for wind fields
const COOLDOWNS = {
  pulse: 2500,
  camera: 200,
};

export function useKeyboardControls() {
  const keyState = useRef<KeyState>({
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
    shift: false,
    q: false,
    e: false,
    r: false,
    escape: false,
  });

  const setTilt = useGameStore((state) => state.setTilt);
  const startCooldown = useGameStore((state) => state.startCooldown);
  const isCooldownReady = useGameStore((state) => state.isCooldownReady);
  const phase = useGameStore((state) => state.phase);
  const togglePause = useGameStore((state) => state.togglePause);

  const updateInput = useCallback(() => {
    const state = keyState.current;

    // Calculate tilt direction (-1 to 1)
    let x = 0;
    let y = 0;

    if (state.left) x -= 1;
    if (state.right) x += 1;
    if (state.up) y += 1;
    if (state.down) y -= 1;

    // Normalize diagonal movement
    const length = Math.sqrt(x * x + y * y);
    if (length > 0) {
      x /= length;
      y /= length;
    }

    // Update tilt (same as device orientation)
    setTilt(x, y);
  }, [setTilt]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default for game keys
    if (Object.keys(KEY_MAPPINGS).includes(e.code)) {
      e.preventDefault();
    }

    const key = KEY_MAPPINGS[e.code];
    if (!key) return;

    // Handle escape (pause) in any playable state
    if (key === 'escape') {
      if (phase === 'playing') {
        togglePause();
      }
      return;
    }

    // Only process game controls when playing
    if (phase !== 'playing') return;

    if (!keyState.current[key]) {
      keyState.current[key] = true;

      // Handle special keys
      if (key === 'space' && isCooldownReady('pulse')) {
        // Trigger pulse impulse
        startCooldown('pulse', COOLDOWNS.pulse / 1000);
        console.log('Pulse triggered');
      }

      updateInput();
    }
  }, [phase, togglePause, isCooldownReady, startCooldown, updateInput]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = KEY_MAPPINGS[e.code];
    if (!key) return;

    keyState.current[key] = false;
    updateInput();
  }, [updateInput]);

  // Handle brake (shift held)
  const checkBrake = useCallback(() => {
    if (phase !== 'playing') return;

    if (keyState.current.shift) {
      // Apply brake effect
      // This would be handled by the physics system
    }
  }, [phase]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Check brake state periodically
    const brakeInterval = setInterval(checkBrake, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(brakeInterval);
    };
  }, [handleKeyDown, handleKeyUp, checkBrake]);

  return {
    keyState: keyState.current,
    isUp: () => keyState.current.up,
    isDown: () => keyState.current.down,
    isLeft: () => keyState.current.left,
    isRight: () => keyState.current.right,
    isSpace: () => keyState.current.space,
    isShift: () => keyState.current.shift,
    isQ: () => keyState.current.q,
    isE: () => keyState.current.e,
    isR: () => keyState.current.r,
  };
}

export default useKeyboardControls;
