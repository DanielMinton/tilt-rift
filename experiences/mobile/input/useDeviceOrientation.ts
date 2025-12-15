'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Vector3 } from 'three';
import { useGameStore } from '@/game/store/useGameStore';

const DEAD_ZONE = 3;
const MAX_TILT = 28;
const GRAVITY = 9.8;
const SMOOTH_FACTOR = 0.12;

interface OrientationState {
  gravity: Vector3;
  isCalibrated: boolean;
  permissionGranted: boolean;
  permissionDenied: boolean;
  isSupported: boolean;
  rawBeta: number;
  rawGamma: number;
}

interface UseDeviceOrientationOptions {
  sensitivity?: number;
  invertX?: boolean;
  invertY?: boolean;
}

export function useDeviceOrientation(options: UseDeviceOrientationOptions = {}) {
  const { sensitivity = 1, invertX = false, invertY = false } = options;

  const [state, setState] = useState<OrientationState>(() => {
    const isSupported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
    return {
      gravity: new Vector3(0, -GRAVITY, 0),
      isCalibrated: false,
      permissionGranted: false,
      permissionDenied: false,
      isSupported,
      rawBeta: 0,
      rawGamma: 0,
    };
  });

  const smoothedGravity = useRef(new Vector3(0, -GRAVITY, 0));
  const calibrationOffset = useRef({ beta: 0, gamma: 0 });

  const setTilt = useGameStore((state) => state.setTilt);
  const settingsSensitivity = useGameStore((state) => state.settings.tiltSensitivity);
  const settingsInvertX = useGameStore((state) => state.settings.invertTiltX);
  const settingsInvertY = useGameStore((state) => state.settings.invertTiltY);

  const effectiveSensitivity = sensitivity * settingsSensitivity;
  const effectiveInvertX = invertX !== settingsInvertX;
  const effectiveInvertY = invertY !== settingsInvertY;

  const normalizeAxis = useCallback((raw: number): number => {
    const adjusted = Math.abs(raw) < DEAD_ZONE
      ? 0
      : raw - Math.sign(raw) * DEAD_ZONE;
    const normalized = Math.max(-1, Math.min(1, adjusted / MAX_TILT));
    // Cubic easing for fine control at small angles
    return Math.sign(normalized) * Math.pow(Math.abs(normalized), 3);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return false;

    // Check if DeviceOrientationEvent exists
    if (!('DeviceOrientationEvent' in window)) {
      console.warn('DeviceOrientationEvent not supported');
      setState((prev) => ({ ...prev, permissionDenied: true, isSupported: false }));
      return false;
    }

    const DeviceOrientationEventWithPermission = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    // iOS 13+ requires explicit permission request
    if (typeof DeviceOrientationEventWithPermission.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEventWithPermission.requestPermission();
        const granted = permission === 'granted';
        console.log('DeviceOrientation permission:', permission);
        setState((prev) => ({
          ...prev,
          permissionGranted: granted,
          permissionDenied: !granted,
        }));
        return granted;
      } catch (error) {
        console.error('Permission request failed:', error);
        setState((prev) => ({ ...prev, permissionDenied: true }));
        return false;
      }
    } else {
      // Android, desktop with sensors, or older browsers - permission not required
      // Just grant access directly
      console.log('DeviceOrientation permission not required, granting access');
      setState((prev) => ({ ...prev, permissionGranted: true }));
      return true;
    }
  }, []);

  const calibrate = useCallback(() => {
    calibrationOffset.current = {
      beta: state.rawBeta,
      gamma: state.rawGamma,
    };
    setState((prev) => ({ ...prev, isCalibrated: true }));
  }, [state.rawBeta, state.rawGamma]);

  const resetCalibration = useCallback(() => {
    calibrationOffset.current = { beta: 0, gamma: 0 };
    setState((prev) => ({ ...prev, isCalibrated: false }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let animationFrameId: number;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const rawBeta = event.beta ?? 0;
      const rawGamma = event.gamma ?? 0;

      // Apply calibration offset
      const calibratedBeta = rawBeta - calibrationOffset.current.beta;
      const calibratedGamma = rawGamma - calibrationOffset.current.gamma;

      // Normalize with dead zone and cubic easing
      let nx = normalizeAxis(calibratedGamma) * effectiveSensitivity;
      let nz = normalizeAxis(calibratedBeta) * effectiveSensitivity;

      // Apply inversion
      if (effectiveInvertX) nx = -nx;
      if (effectiveInvertY) nz = -nz;

      const newGravity = new Vector3(
        nx * GRAVITY,
        -GRAVITY,
        nz * GRAVITY
      );

      setState((prev) => ({
        ...prev,
        rawBeta,
        rawGamma,
      }));

      // EMA smoothing
      smoothedGravity.current.lerp(newGravity, SMOOTH_FACTOR);
    };

    const smoothingLoop = () => {
      const gravity = smoothedGravity.current;

      // Update store with normalized tilt values (-1 to 1)
      const tiltX = gravity.x / GRAVITY;
      const tiltY = gravity.z / GRAVITY;
      setTilt(tiltX, tiltY);

      setState((prev) => ({
        ...prev,
        gravity: gravity.clone(),
      }));

      animationFrameId = requestAnimationFrame(smoothingLoop);
    };

    if (state.permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation);
      animationFrameId = requestAnimationFrame(smoothingLoop);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    state.permissionGranted,
    normalizeAxis,
    effectiveSensitivity,
    effectiveInvertX,
    effectiveInvertY,
    setTilt,
  ]);

  return {
    gravity: state.gravity,
    isCalibrated: state.isCalibrated,
    permissionGranted: state.permissionGranted,
    permissionDenied: state.permissionDenied,
    isSupported: state.isSupported,
    rawBeta: state.rawBeta,
    rawGamma: state.rawGamma,
    requestPermission,
    calibrate,
    resetCalibration,
  };
}

export default useDeviceOrientation;
