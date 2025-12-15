// World constants
export const WORLD_BOUNDS = {
  MIN_X: -50,
  MAX_X: 50,
  MIN_Y: -10,
  MAX_Y: 100,
  MIN_Z: -50,
  MAX_Z: 50,
};

export const LEVEL_CONFIG = {
  SHARD_COUNT: 20,
  CHECKPOINT_COUNT: 3,
  HAZARD_DENSITY: 0.15,
  PLATFORM_COUNT: 25,
};

export const COLLISION_GROUPS = {
  PLAYER: 0x0001,
  PLATFORM: 0x0002,
  HAZARD: 0x0004,
  COLLECTIBLE: 0x0008,
  CHECKPOINT: 0x0010,
  GATE: 0x0020,
  BOUNDARY: 0x0040,
};

export const PHYSICS_MATERIALS = {
  DEFAULT: {
    friction: 0.5,
    restitution: 0.3,
  },
  ICE: {
    friction: 0.05,
    restitution: 0.1,
  },
  RUBBER: {
    friction: 0.9,
    restitution: 0.8,
  },
  METAL: {
    friction: 0.3,
    restitution: 0.5,
  },
};

export const COLORS = {
  PLATFORM_BASE: '#1A1A2E',
  PLATFORM_EDGE: '#1FF2FF',
  HAZARD: '#FF3B3B',
  CHECKPOINT_INACTIVE: '#4A4A6A',
  CHECKPOINT_ACTIVE: '#2DFF88',
  SHARD: '#FFD166',
  GATE: '#FF3BF5',
  VOID: '#07060D',
};
