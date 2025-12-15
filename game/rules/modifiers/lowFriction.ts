import { ModCard } from './types';

interface LowFrictionState {
  originalFriction: number;
  zonePositions: Array<{ x: number; z: number; radius: number }>;
  rotationTimer: number;
}

let state: LowFrictionState | null = null;

export const lowFrictionMod: ModCard = {
  id: 'low-friction',
  name: 'Oil Slick',
  description: 'Random zones have reduced friction. Zones rotate every 10 seconds.',
  icon: '💧',
  rarity: 'common',

  apply: () => {
    state = {
      originalFriction: 0.6,
      zonePositions: [
        { x: -5, z: -5, radius: 3 },
        { x: 5, z: 5, radius: 3 },
      ],
      rotationTimer: 0,
    };
    console.log('Low Friction modifier applied');
  },

  remove: () => {
    state = null;
    console.log('Low Friction modifier removed');
  },

  tick: (deltaTime: number) => {
    if (!state) return;

    state.rotationTimer += deltaTime;

    // Rotate zone positions every 10 seconds
    if (state.rotationTimer >= 10) {
      state.rotationTimer = 0;

      // Rotate positions 90 degrees
      state.zonePositions = state.zonePositions.map((zone) => ({
        x: -zone.z,
        z: zone.x,
        radius: zone.radius,
      }));

      console.log('Low Friction zones rotated');
    }
  },
};

export function isInLowFrictionZone(x: number, z: number): boolean {
  if (!state) return false;

  return state.zonePositions.some((zone) => {
    const dx = x - zone.x;
    const dz = z - zone.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < zone.radius;
  });
}

export function getLowFrictionZones(): Array<{ x: number; z: number; radius: number }> {
  return state?.zonePositions || [];
}

export const LOW_FRICTION_VALUE = 0.15;
