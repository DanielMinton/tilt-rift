export type PlatformOS = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
export type Browser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'unknown';

export interface Platform {
  os: PlatformOS;
  browser: Browser;
  isMobile: boolean;
  isDesktop: boolean;
  hasGyroscope: boolean;
  hasTouchscreen: boolean;
}

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    return {
      os: 'unknown',
      browser: 'unknown',
      isMobile: false,
      isDesktop: true,
      hasGyroscope: false,
      hasTouchscreen: false,
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();

  // Detect OS
  let os: PlatformOS = 'unknown';
  if (/iphone|ipad|ipod/.test(userAgent)) os = 'ios';
  else if (/android/.test(userAgent)) os = 'android';
  else if (/win/.test(userAgent)) os = 'windows';
  else if (/mac/.test(userAgent)) os = 'macos';
  else if (/linux/.test(userAgent)) os = 'linux';

  // Detect browser
  let browser: Browser = 'unknown';
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) browser = 'safari';
  else if (/edg/.test(userAgent)) browser = 'edge';
  else if (/chrome/.test(userAgent)) browser = 'chrome';
  else if (/firefox/.test(userAgent)) browser = 'firefox';

  // Detect capabilities
  const isMobile = os === 'ios' || os === 'android' || /mobile/.test(userAgent);
  const isDesktop = !isMobile;
  const hasGyroscope = typeof DeviceOrientationEvent !== 'undefined';
  const hasTouchscreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    os,
    browser,
    isMobile,
    isDesktop,
    hasGyroscope,
    hasTouchscreen,
  };
}

export function getPlatform(): PlatformOS {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  if (/win/.test(userAgent)) return 'windows';
  if (/mac/.test(userAgent)) return 'macos';
  if (/linux/.test(userAgent)) return 'linux';

  return 'unknown';
}

export function getBrowser(): Browser {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = navigator.userAgent.toLowerCase();

  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) return 'safari';
  if (/edg/.test(userAgent)) return 'edge';
  if (/chrome/.test(userAgent)) return 'chrome';
  if (/firefox/.test(userAgent)) return 'firefox';

  return 'unknown';
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone)
  );
}

export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function supportsWebGL2(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

export function getMaxTextureSize(): number {
  if (typeof window === 'undefined') return 4096;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return 4096;
    return gl.getParameter(gl.MAX_TEXTURE_SIZE);
  } catch {
    return 4096;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function prefersColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
