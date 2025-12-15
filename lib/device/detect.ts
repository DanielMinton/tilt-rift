export type DeviceType = 'mobile' | 'desktop';

export interface DeviceInfo {
  type: DeviceType;
  isTouchDevice: boolean;
  hasOrientationSensor: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  pixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  isLandscape: boolean;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'desktop',
      isTouchDevice: false,
      hasOrientationSensor: false,
      isIOS: false,
      isAndroid: false,
      pixelRatio: 1,
      screenWidth: 1920,
      screenHeight: 1080,
      isLandscape: true,
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasOrientationSensor = 'DeviceOrientationEvent' in window;

  const isMobileUA = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isSmallScreen = window.innerWidth <= 1024;

  const type: DeviceType = (isMobileUA || (isTouchDevice && isSmallScreen)) ? 'mobile' : 'desktop';

  return {
    type,
    isTouchDevice,
    hasOrientationSensor,
    isIOS,
    isAndroid,
    pixelRatio: window.devicePixelRatio || 1,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    isLandscape: window.innerWidth > window.innerHeight,
  };
}

export function isMobile(): boolean {
  return detectDevice().type === 'mobile';
}

export function isDesktop(): boolean {
  return detectDevice().type === 'desktop';
}

export function supportsDeviceOrientation(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

export function requiresOrientationPermission(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function';
}
