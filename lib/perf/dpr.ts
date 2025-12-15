import { useEffect, useState, useCallback, useRef } from 'react';

const TARGET_FRAME_TIME = 16.67; // 60fps
const DPR_MIN = 0.75;
const DPR_MAX = 1.25;
const DPR_STEP = 0.1;
const SAMPLE_SIZE = 60;
const ADJUSTMENT_COOLDOWN = 1000; // ms

export interface DPRControllerOptions {
  minDpr?: number;
  maxDpr?: number;
  targetFps?: number;
  sampleSize?: number;
}

export function useDynamicDPR(options: DPRControllerOptions = {}) {
  const {
    minDpr = DPR_MIN,
    maxDpr = DPR_MAX,
    targetFps = 60,
    sampleSize = SAMPLE_SIZE,
  } = options;

  const targetFrameTime = 1000 / targetFps;
  const initialDpr = typeof window !== 'undefined'
    ? Math.min(window.devicePixelRatio, maxDpr)
    : 1;

  const [dpr, setDpr] = useState(initialDpr);
  const frameTimingsRef = useRef<number[]>([]);
  const lastAdjustmentRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  const recordFrameTime = useCallback((frameTime: number) => {
    frameTimingsRef.current.push(frameTime);
    if (frameTimingsRef.current.length > sampleSize) {
      frameTimingsRef.current.shift();
    }
  }, [sampleSize]);

  const adjustDPR = useCallback(() => {
    const now = performance.now();
    if (now - lastAdjustmentRef.current < ADJUSTMENT_COOLDOWN) return;
    if (frameTimingsRef.current.length < sampleSize) return;

    const avgFrameTime = frameTimingsRef.current.reduce((a, b) => a + b, 0) / frameTimingsRef.current.length;

    let newDpr = dpr;
    if (avgFrameTime > targetFrameTime * 1.2) {
      newDpr = Math.max(minDpr, dpr - DPR_STEP);
    } else if (avgFrameTime < targetFrameTime * 0.8) {
      newDpr = Math.min(maxDpr, dpr + DPR_STEP);
    }

    if (newDpr !== dpr) {
      setDpr(newDpr);
      lastAdjustmentRef.current = now;
      frameTimingsRef.current = [];
    }
  }, [dpr, minDpr, maxDpr, sampleSize, targetFrameTime]);

  useEffect(() => {
    let animationFrameId: number;

    const measure = () => {
      const now = performance.now();
      const frameTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (frameTime > 0 && frameTime < 100) {
        recordFrameTime(frameTime);
        adjustDPR();
      }

      animationFrameId = requestAnimationFrame(measure);
    };

    animationFrameId = requestAnimationFrame(measure);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [recordFrameTime, adjustDPR]);

  return {
    dpr,
    setDpr,
    avgFrameTime: frameTimingsRef.current.length > 0
      ? frameTimingsRef.current.reduce((a, b) => a + b, 0) / frameTimingsRef.current.length
      : targetFrameTime,
    fps: frameTimingsRef.current.length > 0
      ? 1000 / (frameTimingsRef.current.reduce((a, b) => a + b, 0) / frameTimingsRef.current.length)
      : targetFps,
  };
}

export function adjustDPR(avgFrameTime: number, currentDPR: number): number {
  if (avgFrameTime > TARGET_FRAME_TIME * 1.2) {
    return Math.max(DPR_MIN, currentDPR - DPR_STEP);
  } else if (avgFrameTime < TARGET_FRAME_TIME * 0.8) {
    return Math.min(DPR_MAX, currentDPR + DPR_STEP);
  }
  return currentDPR;
}

export function getOptimalDPR(devicePixelRatio: number): number {
  return Math.min(Math.max(devicePixelRatio, DPR_MIN), DPR_MAX);
}
