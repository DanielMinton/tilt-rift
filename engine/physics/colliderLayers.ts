import { COLLISION_GROUPS, COLLISION_MASKS } from './rapierConfig';

export type ColliderLayer =
  | 'world'
  | 'orb'
  | 'hazard'
  | 'collectible'
  | 'interactable'
  | 'trigger';

export interface ColliderConfig {
  layer: ColliderLayer;
  collidesWith: ColliderLayer[];
}

const layerToGroup: Record<ColliderLayer, number> = {
  world: COLLISION_GROUPS.WORLD,
  orb: COLLISION_GROUPS.ORB,
  hazard: COLLISION_GROUPS.HAZARD,
  collectible: COLLISION_GROUPS.COLLECTIBLE,
  interactable: COLLISION_GROUPS.INTERACTABLE,
  trigger: COLLISION_GROUPS.TRIGGER,
};

export function getCollisionGroups(layer: ColliderLayer): number {
  return layerToGroup[layer];
}

export function getCollisionMask(layers: ColliderLayer[]): number {
  return layers.reduce((mask, layer) => mask | layerToGroup[layer], 0);
}

export function createColliderGroups(config: ColliderConfig): [number, number] {
  const membership = getCollisionGroups(config.layer);
  const filter = getCollisionMask(config.collidesWith);
  return [membership, filter];
}

export const COLLIDER_CONFIGS: Record<ColliderLayer, ColliderConfig> = {
  world: {
    layer: 'world',
    collidesWith: ['orb'],
  },
  orb: {
    layer: 'orb',
    collidesWith: ['world', 'hazard', 'collectible', 'interactable', 'trigger'],
  },
  hazard: {
    layer: 'hazard',
    collidesWith: ['orb'],
  },
  collectible: {
    layer: 'collectible',
    collidesWith: ['orb'],
  },
  interactable: {
    layer: 'interactable',
    collidesWith: ['orb'],
  },
  trigger: {
    layer: 'trigger',
    collidesWith: ['orb'],
  },
};

export function getColliderProps(layer: ColliderLayer) {
  const config = COLLIDER_CONFIGS[layer];
  const [membership, filter] = createColliderGroups(config);

  return {
    collisionGroups: membership | (filter << 16),
    sensor: layer === 'trigger' || layer === 'collectible',
  };
}
