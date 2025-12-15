import { RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { proxy, useSnapshot } from 'valtio';
import { Vector3Data } from '@/game/types';

// Valtio proxy for high-frequency physics state
export const physicsState = proxy({
  orb: {
    position: { x: 0, y: 1, z: 0 } as Vector3Data,
    velocity: { x: 0, y: 0, z: 0 } as Vector3Data,
    angularVelocity: { x: 0, y: 0, z: 0 } as Vector3Data,
    speed: 0,
    isGrounded: true,
    isSleeping: false,
  },
  gravity: { x: 0, y: -9.8, z: 0 } as Vector3Data,
  physicsTime: 0,
  frameCount: 0,
});

export function syncOrbFromRigidBody(rigidBody: RapierRigidBody): void {
  const position = rigidBody.translation();
  const velocity = rigidBody.linvel();
  const angularVelocity = rigidBody.angvel();

  physicsState.orb.position.x = position.x;
  physicsState.orb.position.y = position.y;
  physicsState.orb.position.z = position.z;

  physicsState.orb.velocity.x = velocity.x;
  physicsState.orb.velocity.y = velocity.y;
  physicsState.orb.velocity.z = velocity.z;

  physicsState.orb.angularVelocity.x = angularVelocity.x;
  physicsState.orb.angularVelocity.y = angularVelocity.y;
  physicsState.orb.angularVelocity.z = angularVelocity.z;

  physicsState.orb.speed = Math.sqrt(
    velocity.x * velocity.x +
    velocity.y * velocity.y +
    velocity.z * velocity.z
  );

  physicsState.orb.isGrounded = position.y < 0.6;
  physicsState.orb.isSleeping = rigidBody.isSleeping();
}

export function setPhysicsGravity(gravity: Vector3Data): void {
  physicsState.gravity.x = gravity.x;
  physicsState.gravity.y = gravity.y;
  physicsState.gravity.z = gravity.z;
}

export function updatePhysicsTime(delta: number): void {
  physicsState.physicsTime += delta;
  physicsState.frameCount++;
}

export function usePhysicsSnapshot() {
  return useSnapshot(physicsState);
}

export function getOrbPosition(): Vector3 {
  return new Vector3(
    physicsState.orb.position.x,
    physicsState.orb.position.y,
    physicsState.orb.position.z
  );
}

export function getOrbVelocity(): Vector3 {
  return new Vector3(
    physicsState.orb.velocity.x,
    physicsState.orb.velocity.y,
    physicsState.orb.velocity.z
  );
}

export function getOrbSpeed(): number {
  return physicsState.orb.speed;
}

export function isOrbGrounded(): boolean {
  return physicsState.orb.isGrounded;
}

// Apply impulse to orb
export function applyOrbImpulse(
  rigidBody: RapierRigidBody,
  impulse: Vector3Data,
  point?: Vector3Data
): void {
  if (point) {
    rigidBody.applyImpulseAtPoint(
      impulse,
      point,
      true
    );
  } else {
    rigidBody.applyImpulse(impulse, true);
  }
}

// Apply force to orb
export function applyOrbForce(
  rigidBody: RapierRigidBody,
  force: Vector3Data
): void {
  rigidBody.addForce(force, true);
}

// Set orb velocity directly
export function setOrbVelocity(
  rigidBody: RapierRigidBody,
  velocity: Vector3Data
): void {
  rigidBody.setLinvel(velocity, true);
}

// Reset orb position
export function resetOrbPosition(
  rigidBody: RapierRigidBody,
  position: Vector3Data
): void {
  rigidBody.setTranslation(position, true);
  rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
  rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
}
