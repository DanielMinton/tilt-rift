export const PHYSICS_CONFIG = {
  FIXED_DELTA: 1 / 60,
  GRAVITY_DEFAULT: { x: 0, y: -9.8, z: 0 },
  SUBSTEPS: 2,
  MAX_VELOCITY: 50,
  SLEEP_THRESHOLD: 0.1,
} as const;

export const COLLISION_GROUPS = {
  WORLD: 0x0001,
  ORB: 0x0002,
  HAZARD: 0x0004,
  COLLECTIBLE: 0x0008,
  INTERACTABLE: 0x0010,
  TRIGGER: 0x0020,
} as const;

export const COLLISION_MASKS = {
  ORB: COLLISION_GROUPS.WORLD | COLLISION_GROUPS.HAZARD | COLLISION_GROUPS.COLLECTIBLE | COLLISION_GROUPS.INTERACTABLE | COLLISION_GROUPS.TRIGGER,
  WORLD: COLLISION_GROUPS.ORB,
  HAZARD: COLLISION_GROUPS.ORB,
  COLLECTIBLE: COLLISION_GROUPS.ORB,
  INTERACTABLE: COLLISION_GROUPS.ORB,
  TRIGGER: COLLISION_GROUPS.ORB,
} as const;

export const MATERIALS = {
  ORB: {
    restitution: 0.35,
    friction: 0.6,
    density: 1.0,
  },
  BUMPER: {
    restitution: 0.8,
    friction: 0.4,
    density: 0,
  },
  OIL: {
    restitution: 0.2,
    friction: 0.15,
    density: 0,
  },
  BURN: {
    restitution: 0.3,
    friction: 0.4,
    density: 0,
  },
  METAL: {
    restitution: 0.4,
    friction: 0.5,
    density: 0,
  },
  GLASS: {
    restitution: 0.5,
    friction: 0.3,
    density: 0,
  },
  RUBBER: {
    restitution: 0.9,
    friction: 0.8,
    density: 0,
  },
} as const;

export type MaterialType = keyof typeof MATERIALS;

export function getMaterial(type: MaterialType) {
  return MATERIALS[type];
}

export function createCollisionFilter(group: number, mask: number) {
  return {
    memberships: group,
    filter: mask,
  };
}

export const ORB_COLLISION_FILTER = createCollisionFilter(
  COLLISION_GROUPS.ORB,
  COLLISION_MASKS.ORB
);

export const WORLD_COLLISION_FILTER = createCollisionFilter(
  COLLISION_GROUPS.WORLD,
  COLLISION_MASKS.WORLD
);

export const HAZARD_COLLISION_FILTER = createCollisionFilter(
  COLLISION_GROUPS.HAZARD,
  COLLISION_MASKS.HAZARD
);

export const COLLECTIBLE_COLLISION_FILTER = createCollisionFilter(
  COLLISION_GROUPS.COLLECTIBLE,
  COLLISION_MASKS.COLLECTIBLE
);

export const TRIGGER_COLLISION_FILTER = createCollisionFilter(
  COLLISION_GROUPS.TRIGGER,
  COLLISION_MASKS.TRIGGER
);
