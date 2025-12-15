'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/game/store/useGameStore';

export function useDragInput() {
  const setTilt = useGameStore((s) => s.setTilt);
  const phase = useGameStore((s) => s.phase);

  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const sensitivity = 50; // Pixels to drag for max tilt

  const handleStart = useCallback((x: number, y: number) => {
    isDraggingRef.current = true;
    startPosRef.current = { x, y };
  }, []);

  const handleMove = useCallback((x: number, y: number) => {
    if (!isDraggingRef.current) return;

    const dx = (x - startPosRef.current.x) / sensitivity;
    const dy = (startPosRef.current.y - y) / sensitivity;

    const clampedX = Math.max(-1, Math.min(1, dx));
    const clampedY = Math.max(-1, Math.min(1, dy));

    setTilt(clampedX, clampedY);
  }, [setTilt, sensitivity]);

  const handleEnd = useCallback(() => {
    isDraggingRef.current = false;
    setTilt(0, 0);
  }, [setTilt]);

  useEffect(() => {
    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      handleEnd();
    };

    // Mouse events
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        handleStart(e.clientX, e.clientY);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
      handleEnd();
    };

    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleStart, handleMove, handleEnd]);

  return { isActive: phase === 'playing' };
}

export default useDragInput;
