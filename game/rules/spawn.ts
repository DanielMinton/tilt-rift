import seedrandom from 'seedrandom';
import { Vector3Data, TOTAL_SHARDS } from '../types';

export interface SpawnConfig {
  seed: string;
  shardCount: number;
  hazardDensity: number;
}

// Predefined socket positions for Level 01
const SHARD_SOCKETS: Vector3Data[] = [
  { x: -8, y: 0.5, z: -10 },
  { x: 8, y: 0.5, z: -10 },
  { x: -12, y: 0.5, z: 0 },
  { x: 12, y: 0.5, z: 0 },
  { x: -8, y: 0.5, z: 10 },
  { x: 8, y: 0.5, z: 10 },
  { x: 0, y: 0.5, z: -15 },
  { x: 0, y: 0.5, z: 15 },
  { x: -15, y: 0.5, z: -5 },
  { x: 15, y: 0.5, z: -5 },
  { x: -15, y: 0.5, z: 5 },
  { x: 15, y: 0.5, z: 5 },
  { x: 0, y: 0.5, z: 0 },
  { x: -5, y: 0.5, z: -5 },
  { x: 5, y: 0.5, z: 5 },
  { x: -5, y: 0.5, z: 5 },
];

// Hazard spawn zones
const HAZARD_ZONES: Vector3Data[] = [
  { x: -6, y: 0.1, z: -6 },
  { x: 6, y: 0.1, z: -6 },
  { x: -6, y: 0.1, z: 6 },
  { x: 6, y: 0.1, z: 6 },
  { x: 0, y: 0.1, z: -8 },
  { x: 0, y: 0.1, z: 8 },
  { x: -10, y: 0.1, z: 0 },
  { x: 10, y: 0.1, z: 0 },
];

export function generateShardPositions(seed: string, count: number = TOTAL_SHARDS): Vector3Data[] {
  const rng = seedrandom(seed);
  const availableSockets = [...SHARD_SOCKETS];
  const selected: Vector3Data[] = [];

  // Shuffle and select
  for (let i = availableSockets.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [availableSockets[i], availableSockets[j]] = [availableSockets[j], availableSockets[i]];
  }

  for (let i = 0; i < Math.min(count, availableSockets.length); i++) {
    selected.push(availableSockets[i]);
  }

  return selected;
}

export function generateHazardPositions(
  seed: string,
  density: number = 0.5
): Array<{ type: 'burn' | 'blade' | 'static'; position: Vector3Data }> {
  const rng = seedrandom(seed + '-hazards');
  const hazards: Array<{ type: 'burn' | 'blade' | 'static'; position: Vector3Data }> = [];

  const hazardTypes: Array<'burn' | 'blade' | 'static'> = ['burn', 'blade', 'static'];

  HAZARD_ZONES.forEach((zone) => {
    if (rng() < density) {
      const type = hazardTypes[Math.floor(rng() * hazardTypes.length)];
      hazards.push({
        type,
        position: {
          x: zone.x + (rng() - 0.5) * 2,
          y: zone.y,
          z: zone.z + (rng() - 0.5) * 2,
        },
      });
    }
  });

  return hazards;
}

export function getOrbSpawnPosition(): Vector3Data {
  return { x: 0, y: 1, z: -18 };
}

export function getExitGatePosition(): Vector3Data {
  return { x: 0, y: 0, z: 18 };
}

export function shuffleShardPositions(
  currentPositions: Vector3Data[],
  seed: string,
  iteration: number
): Vector3Data[] {
  const rng = seedrandom(`${seed}-shuffle-${iteration}`);
  const shuffled = [...currentPositions];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
