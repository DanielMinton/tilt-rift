import seedrandom from 'seedrandom';
import { ModCard, ModifierId, MODIFIER_POOL_WEIGHTS } from './types';
import { lowFrictionMod } from './lowFriction';
import { gravityPulseMod } from './gravityPulse';
import { shardShuffleMod } from './shardShuffle';
import { overclockMod } from './overclock';

export const MODIFIER_POOL: ModCard[] = [
  lowFrictionMod,
  gravityPulseMod,
  shardShuffleMod,
  overclockMod,
];

export function drawModifiers(seed: string, count: number = 3): ModCard[] {
  const rng = seedrandom(seed);
  const availablePool = [...MODIFIER_POOL];
  const drawn: ModCard[] = [];

  // Calculate weighted selection
  const weightedPool: Array<{ mod: ModCard; weight: number }> = availablePool.map((mod) => ({
    mod,
    weight: MODIFIER_POOL_WEIGHTS[mod.id as ModifierId] || 1,
  }));

  for (let i = 0; i < count && weightedPool.length > 0; i++) {
    const totalWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0);
    let random = rng() * totalWeight;

    for (let j = 0; j < weightedPool.length; j++) {
      random -= weightedPool[j].weight;
      if (random <= 0) {
        drawn.push(weightedPool[j].mod);
        weightedPool.splice(j, 1);
        break;
      }
    }
  }

  return drawn;
}

export function getModifierById(id: string): ModCard | undefined {
  return MODIFIER_POOL.find((mod) => mod.id === id);
}

export function createModifierDeck(seed: string): {
  draw: (count: number) => ModCard[];
  remaining: () => number;
  reset: () => void;
} {
  let deck = [...MODIFIER_POOL];
  const rng = seedrandom(seed);

  // Shuffle deck
  const shuffle = () => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  };

  shuffle();

  return {
    draw: (count: number) => {
      const drawn = deck.splice(0, count);
      return drawn;
    },
    remaining: () => deck.length,
    reset: () => {
      deck = [...MODIFIER_POOL];
      shuffle();
    },
  };
}
