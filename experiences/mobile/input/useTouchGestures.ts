'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/game/store/useGameStore';
import { GestureType } from '@/game/types';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface GestureConfig {
  tapTimeout: number;
  doubleTapTimeout: number;
  longPressTimeout: number;
  swipeThreshold: number;
}

const DEFAULT_CONFIG: GestureConfig = {
  tapTimeout: 200,
  doubleTapTimeout: 300,
  longPressTimeout: 350,
  swipeThreshold: 50,
};

const COOLDOWNS = {
  tap: 2000,
  doubleTap: 6000,
  longPress: 10000,
  swipe: 500,
};

export function useTouchGestures(config: Partial<GestureConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const touchStartRef = useRef<TouchPoint | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setLastGesture = useGameStore((state) => state.setLastGesture);
  const setTouchActive = useGameStore((state) => state.setTouchActive);
  const startCooldown = useGameStore((state) => state.startCooldown);
  const isCooldownReady = useGameStore((state) => state.isCooldownReady);
  const gameState = useGameStore((state) => state.gameState);

  const triggerGesture = useCallback(
    (type: GestureType, position: { x: number; y: number }, direction?: { x: number; y: number }) => {
      // Check cooldown
      const cooldownKey = type === 'double-tap' ? 'doubleTap' : type === 'long-press' ? 'longPress' : 'tap';
      if (!isCooldownReady(cooldownKey)) return;

      setLastGesture(type);
      startCooldown(cooldownKey, COOLDOWNS[cooldownKey] / 1000);

      // Trigger haptic feedback
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const patterns: Record<GestureType, number[]> = {
          'tap': [10],
          'double-tap': [20, 50, 20],
          'long-press': [50],
          'swipe': [15],
        };
        navigator.vibrate(patterns[type]);
      }

      console.log(`Gesture triggered: ${type}`, { position, direction });
    },
    [setLastGesture, startCooldown, isCooldownReady]
  );

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (gameState !== 'PLAYING') return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    setTouchActive(true);

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      if (touchStartRef.current) {
        triggerGesture('long-press', {
          x: touchStartRef.current.x,
          y: touchStartRef.current.y,
        });
        touchStartRef.current = null;
      }
    }, cfg.longPressTimeout);
  }, [gameState, setTouchActive, triggerGesture, cfg.longPressTimeout]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || gameState !== 'PLAYING') return;

    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Cancel long press if moved too far
    if (distance > 20 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, [gameState]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (gameState !== 'PLAYING') {
      setTouchActive(false);
      return;
    }

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current) {
      setTouchActive(false);
      return;
    }

    const changedTouch = e.changedTouches[0];
    const dx = changedTouch.clientX - touchStartRef.current.x;
    const dy = changedTouch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = Date.now() - touchStartRef.current.timestamp;

    const position = {
      x: changedTouch.clientX,
      y: changedTouch.clientY,
    };

    // Detect swipe
    if (distance > cfg.swipeThreshold) {
      const direction = {
        x: dx / distance,
        y: dy / distance,
      };
      triggerGesture('swipe', position, direction);
    }
    // Detect tap or double tap
    else if (duration < cfg.tapTimeout) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < cfg.doubleTapTimeout) {
        triggerGesture('double-tap', position);
        lastTapRef.current = 0;
      } else {
        triggerGesture('tap', position);
        lastTapRef.current = now;
      }
    }

    touchStartRef.current = null;
    setTouchActive(false);
  }, [gameState, setTouchActive, triggerGesture, cfg]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartRef.current = null;
    setTouchActive(false);
  }, [setTouchActive]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  return {
    triggerGesture,
  };
}

export default useTouchGestures;
