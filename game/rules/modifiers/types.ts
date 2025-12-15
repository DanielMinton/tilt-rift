export interface ModCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare';
  apply: () => void;
  remove: () => void;
  tick?: (deltaTime: number) => void;
}

export interface ModifierState {
  active: boolean;
  startTime: number;
  data: Record<string, unknown>;
}

export type ModifierId =
  | 'low-friction'
  | 'gravity-pulse'
  | 'shard-shuffle'
  | 'overclock'
  | 'time-warp'
  | 'ghost-mode'
  | 'magnetic-pull'
  | 'bouncy-world';

export const MODIFIER_RARITIES = {
  common: 0.5,
  uncommon: 0.35,
  rare: 0.15,
} as const;

export const MODIFIER_POOL_WEIGHTS: Record<ModifierId, number> = {
  'low-friction': 1.0,
  'gravity-pulse': 0.8,
  'shard-shuffle': 0.7,
  'overclock': 0.3,
  'time-warp': 0.5,
  'ghost-mode': 0.4,
  'magnetic-pull': 0.6,
  'bouncy-world': 0.7,
};
