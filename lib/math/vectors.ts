import { Vector3, Vector2 } from 'three';

export function vec3(x: number = 0, y: number = 0, z: number = 0): Vector3 {
  return new Vector3(x, y, z);
}

export function vec2(x: number = 0, y: number = 0): Vector2 {
  return new Vector2(x, y);
}

export function lerpVec3(a: Vector3, b: Vector3, t: number): Vector3 {
  return new Vector3().lerpVectors(a, b, t);
}

export function lerpVec2(a: Vector2, b: Vector2, t: number): Vector2 {
  return new Vector2().lerpVectors(a, b, t);
}

export function magnitude(v: Vector3): number {
  return v.length();
}

export function magnitude2D(v: Vector2): number {
  return v.length();
}

export function normalize(v: Vector3): Vector3 {
  return v.clone().normalize();
}

export function normalize2D(v: Vector2): Vector2 {
  return v.clone().normalize();
}

export function distance(a: Vector3, b: Vector3): number {
  return a.distanceTo(b);
}

export function distance2D(a: Vector2, b: Vector2): number {
  return a.distanceTo(b);
}

export function dot(a: Vector3, b: Vector3): number {
  return a.dot(b);
}

export function cross(a: Vector3, b: Vector3): Vector3 {
  return new Vector3().crossVectors(a, b);
}

export function reflect(incident: Vector3, normal: Vector3): Vector3 {
  return incident.clone().reflect(normal);
}

export function projectOnPlane(v: Vector3, planeNormal: Vector3): Vector3 {
  return v.clone().projectOnPlane(planeNormal);
}

export function angle(a: Vector3, b: Vector3): number {
  return a.angleTo(b);
}

export function rotateAroundY(v: Vector3, angle: number): Vector3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return new Vector3(
    v.x * cos - v.z * sin,
    v.y,
    v.x * sin + v.z * cos
  );
}

export function randomPointInSphere(radius: number): Vector3 {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());

  return new Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
}

export function randomPointOnSphere(radius: number): Vector3 {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);

  return new Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

export function randomPointInCircle(radius: number): Vector2 {
  const angle = Math.random() * Math.PI * 2;
  const r = radius * Math.sqrt(Math.random());
  return new Vector2(r * Math.cos(angle), r * Math.sin(angle));
}
