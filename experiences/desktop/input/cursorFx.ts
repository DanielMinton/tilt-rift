import { Vector2 } from 'three';

interface CursorState {
  position: Vector2;
  velocity: Vector2;
  isOverInteractable: boolean;
  interactableType: string | null;
}

let cursorState: CursorState = {
  position: new Vector2(0, 0),
  velocity: new Vector2(0, 0),
  isOverInteractable: false,
  interactableType: null,
};

let lastPosition = new Vector2(0, 0);
let lastTime = 0;

export function updateCursor(x: number, y: number): void {
  const now = performance.now();
  const dt = (now - lastTime) / 1000;

  if (dt > 0 && dt < 0.1) {
    cursorState.velocity.set(
      (x - lastPosition.x) / dt,
      (y - lastPosition.y) / dt
    );
  }

  cursorState.position.set(x, y);
  lastPosition.set(x, y);
  lastTime = now;
}

export function setCursorOverInteractable(type: string | null): void {
  cursorState.isOverInteractable = type !== null;
  cursorState.interactableType = type;
}

export function getCursorState(): Readonly<CursorState> {
  return cursorState;
}

export function getCursorPosition(): Vector2 {
  return cursorState.position.clone();
}

export function getCursorVelocity(): Vector2 {
  return cursorState.velocity.clone();
}

export function getCursorSpeed(): number {
  return cursorState.velocity.length();
}

// Cursor visual effects
export type CursorStyle = 'default' | 'pointer' | 'grab' | 'grabbing' | 'crosshair' | 'none';

let currentCursorStyle: CursorStyle = 'default';

export function setCursorStyle(style: CursorStyle): void {
  if (typeof document === 'undefined') return;

  currentCursorStyle = style;
  document.body.style.cursor = style;
}

export function getCursorStyle(): CursorStyle {
  return currentCursorStyle;
}

// Cursor trail effect
interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

const trailPoints: TrailPoint[] = [];
const MAX_TRAIL_LENGTH = 20;
const TRAIL_LIFESPAN = 0.3; // seconds

export function addTrailPoint(x: number, y: number): void {
  trailPoints.push({ x, y, age: 0 });

  if (trailPoints.length > MAX_TRAIL_LENGTH) {
    trailPoints.shift();
  }
}

export function updateTrail(dt: number): void {
  for (let i = trailPoints.length - 1; i >= 0; i--) {
    trailPoints[i].age += dt;
    if (trailPoints[i].age > TRAIL_LIFESPAN) {
      trailPoints.splice(i, 1);
    }
  }
}

export function getTrailPoints(): ReadonlyArray<TrailPoint> {
  return trailPoints;
}

export function clearTrail(): void {
  trailPoints.length = 0;
}

// Ripple effect for clicks
interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

const ripples: Ripple[] = [];
const RIPPLE_DURATION = 0.5;
const RIPPLE_MAX_RADIUS = 50;

export function createRipple(x: number, y: number): void {
  ripples.push({
    x,
    y,
    radius: 0,
    maxRadius: RIPPLE_MAX_RADIUS,
    opacity: 1,
  });
}

export function updateRipples(dt: number): void {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const ripple = ripples[i];
    const progress = ripple.radius / ripple.maxRadius;

    ripple.radius += (ripple.maxRadius / RIPPLE_DURATION) * dt;
    ripple.opacity = 1 - progress;

    if (ripple.opacity <= 0) {
      ripples.splice(i, 1);
    }
  }
}

export function getRipples(): ReadonlyArray<Ripple> {
  return ripples;
}

export function clearRipples(): void {
  ripples.length = 0;
}
