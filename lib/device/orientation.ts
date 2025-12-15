export type OrientationType = 'portrait' | 'landscape';
type OrientationLockType = 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';

export function getOrientation(): OrientationType {
  if (typeof window === 'undefined') return 'landscape';
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

export function onOrientationChange(callback: (orientation: OrientationType) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleResize = () => {
    callback(getOrientation());
  };

  window.addEventListener('resize', handleResize);

  if ('orientation' in screen) {
    screen.orientation.addEventListener('change', handleResize);
  }

  return () => {
    window.removeEventListener('resize', handleResize);
    if ('orientation' in screen) {
      screen.orientation.removeEventListener('change', handleResize);
    }
  };
}

export function lockOrientation(orientation: 'portrait' | 'landscape' | 'any'): Promise<void> {
  if (typeof window === 'undefined' || !('orientation' in screen)) {
    return Promise.resolve();
  }

  const screenOrientation = screen.orientation as ScreenOrientation & {
    lock: (orientation: OrientationLockType) => Promise<void>
  };

  if (!screenOrientation.lock) {
    return Promise.resolve();
  }

  const lockType: OrientationLockType =
    orientation === 'portrait' ? 'portrait' :
    orientation === 'landscape' ? 'landscape' : 'any';

  return screenOrientation.lock(lockType).catch(() => {
    // Silently fail - orientation lock not supported
  });
}

export function unlockOrientation(): void {
  if (typeof window === 'undefined' || !('orientation' in screen)) {
    return;
  }

  const screenOrientation = screen.orientation as ScreenOrientation & { unlock: () => void };
  if (screenOrientation.unlock) {
    screenOrientation.unlock();
  }
}
