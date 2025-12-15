import { Vector3 } from 'three';
import { Vector3Data } from '@/game/types';

export interface RaycastResult {
  hit: boolean;
  point?: Vector3Data;
  normal?: Vector3Data;
  distance?: number;
  colliderHandle?: number;
}

export interface ShapecastResult {
  hit: boolean;
  point?: Vector3Data;
  normal?: Vector3Data;
  distance?: number;
  colliderHandle?: number;
}

export interface OverlapResult {
  colliders: number[];
}

// These functions would integrate with Rapier's query pipeline
// For now, they serve as interfaces for the physics system

export function raycast(
  origin: Vector3Data,
  direction: Vector3Data,
  maxDistance: number,
  _filterGroup?: number,
  _filterMask?: number
): RaycastResult {
  // In actual implementation, this would use Rapier's world.castRay
  // For now, return a placeholder
  return { hit: false };
}

export function spherecast(
  origin: Vector3Data,
  radius: number,
  direction: Vector3Data,
  maxDistance: number,
  _filterGroup?: number,
  _filterMask?: number
): ShapecastResult {
  return { hit: false };
}

export function overlapSphere(
  center: Vector3Data,
  radius: number,
  _filterGroup?: number,
  _filterMask?: number
): OverlapResult {
  return { colliders: [] };
}

export function overlapBox(
  center: Vector3Data,
  halfExtents: Vector3Data,
  _rotation?: Vector3Data,
  _filterGroup?: number,
  _filterMask?: number
): OverlapResult {
  return { colliders: [] };
}

export function pointInCollider(
  point: Vector3Data,
  _filterGroup?: number,
  _filterMask?: number
): boolean {
  return false;
}

export function distanceToSurface(
  point: Vector3Data,
  _colliderHandle: number
): number {
  return Infinity;
}

export function closestPointOnCollider(
  point: Vector3Data,
  _colliderHandle: number
): Vector3Data | null {
  return null;
}

// Utility functions for physics calculations

export function calculateImpactForce(
  velocity: Vector3Data,
  mass: number = 1
): number {
  const speed = Math.sqrt(
    velocity.x * velocity.x +
    velocity.y * velocity.y +
    velocity.z * velocity.z
  );
  return speed * mass;
}

export function predictPosition(
  currentPosition: Vector3Data,
  velocity: Vector3Data,
  time: number,
  gravity: Vector3Data = { x: 0, y: -9.8, z: 0 }
): Vector3Data {
  return {
    x: currentPosition.x + velocity.x * time + 0.5 * gravity.x * time * time,
    y: currentPosition.y + velocity.y * time + 0.5 * gravity.y * time * time,
    z: currentPosition.z + velocity.z * time + 0.5 * gravity.z * time * time,
  };
}

export function willCollide(
  position: Vector3Data,
  velocity: Vector3Data,
  radius: number,
  lookaheadTime: number = 0.5
): boolean {
  const futurePosition = predictPosition(position, velocity, lookaheadTime);
  return spherecast(position, radius, velocity, lookaheadTime).hit;
}

export function getProjectedVelocity(
  velocity: Vector3Data,
  normal: Vector3Data
): Vector3Data {
  const velVec = new Vector3(velocity.x, velocity.y, velocity.z);
  const normalVec = new Vector3(normal.x, normal.y, normal.z);

  const dotProduct = velVec.dot(normalVec);
  const projection = normalVec.clone().multiplyScalar(dotProduct);
  const result = velVec.sub(projection);

  return { x: result.x, y: result.y, z: result.z };
}

export function reflectVelocity(
  velocity: Vector3Data,
  normal: Vector3Data,
  bounciness: number = 1
): Vector3Data {
  const velVec = new Vector3(velocity.x, velocity.y, velocity.z);
  const normalVec = new Vector3(normal.x, normal.y, normal.z);

  const dotProduct = velVec.dot(normalVec);
  const reflection = velVec.sub(normalVec.multiplyScalar(2 * dotProduct * bounciness));

  return { x: reflection.x, y: reflection.y, z: reflection.z };
}
