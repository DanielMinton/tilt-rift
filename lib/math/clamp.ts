export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function mapRangeClamped(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const mapped = mapRange(value, inMin, inMax, outMin, outMax);
  return clamp(mapped, Math.min(outMin, outMax), Math.max(outMin, outMax));
}

export function inverseLerp(a: number, b: number, value: number): number {
  if (a === b) return 0;
  return (value - a) / (b - a);
}

export function inverseLerpClamped(a: number, b: number, value: number): number {
  return clamp01(inverseLerp(a, b, value));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function deadzone(value: number, threshold: number): number {
  if (Math.abs(value) < threshold) return 0;
  return value - Math.sign(value) * threshold;
}

export function deadzoneNormalized(
  value: number,
  deadzone: number,
  maxValue: number
): number {
  const absValue = Math.abs(value);
  if (absValue < deadzone) return 0;
  const sign = Math.sign(value);
  const normalized = (absValue - deadzone) / (maxValue - deadzone);
  return sign * clamp01(normalized);
}
