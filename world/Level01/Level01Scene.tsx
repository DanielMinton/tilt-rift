'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, BallCollider } from '@react-three/rapier';
import { Group, Vector3 } from 'three';
import { useGameStore } from '@/game/store/useGameStore';
import { SeededRandom } from '@/lib/math/random';
import { Platform } from './interactables/Platform';
import { Hazard } from './interactables/Hazard';
import { Checkpoint } from './interactables/Checkpoint';
import { ExitGate } from './interactables/ExitGate';
import { SignalShard } from './collectibles/SignalShard';
import { LEVEL_CONFIG, WORLD_BOUNDS } from '../shared/constants';

interface LevelData {
  platforms: Array<{ position: [number, number, number]; size: [number, number, number]; rotation?: number }>;
  hazards: Array<{ position: [number, number, number]; size: [number, number, number] }>;
  shards: Array<{ position: [number, number, number]; id: string }>;
  checkpoints: Array<{ position: [number, number, number]; id: string }>;
  exitGate: { position: [number, number, number] };
  spawnPoint: [number, number, number];
}

function generateLevel(seed: string): LevelData {
  const rng = new SeededRandom(seed);

  const platforms: LevelData['platforms'] = [];
  const hazards: LevelData['hazards'] = [];
  const shards: LevelData['shards'] = [];
  const checkpoints: LevelData['checkpoints'] = [];

  // Starting platform
  platforms.push({
    position: [0, 0, 0],
    size: [8, 0.5, 8],
  });

  // Generate main path platforms
  let currentY = 2;
  let currentX = 0;
  let currentZ = 0;

  for (let i = 0; i < LEVEL_CONFIG.PLATFORM_COUNT; i++) {
    const xOffset = (rng.next() - 0.5) * 12;
    const zOffset = (rng.next() - 0.5) * 12;
    const yOffset = 2 + rng.next() * 2;

    currentX = Math.max(WORLD_BOUNDS.MIN_X + 5, Math.min(WORLD_BOUNDS.MAX_X - 5, currentX + xOffset));
    currentZ = Math.max(WORLD_BOUNDS.MIN_Z + 5, Math.min(WORLD_BOUNDS.MAX_Z - 5, currentZ + zOffset));
    currentY += yOffset;

    const width = 3 + rng.next() * 4;
    const depth = 3 + rng.next() * 4;
    const rotation = rng.next() * Math.PI * 0.25;

    platforms.push({
      position: [currentX, currentY, currentZ],
      size: [width, 0.5, depth],
      rotation,
    });

    // Add shard on some platforms
    if (shards.length < LEVEL_CONFIG.SHARD_COUNT && rng.next() > 0.4) {
      shards.push({
        position: [currentX, currentY + 1.5, currentZ],
        id: `shard-${i}`,
      });
    }

    // Add hazard near some platforms
    if (rng.next() < LEVEL_CONFIG.HAZARD_DENSITY) {
      const hazardOffset = (rng.next() - 0.5) * 4;
      hazards.push({
        position: [currentX + hazardOffset, currentY + 0.5, currentZ + hazardOffset],
        size: [1 + rng.next(), 0.3, 1 + rng.next()],
      });
    }

    // Add checkpoints periodically
    if (i > 0 && i % Math.floor(LEVEL_CONFIG.PLATFORM_COUNT / (LEVEL_CONFIG.CHECKPOINT_COUNT + 1)) === 0) {
      if (checkpoints.length < LEVEL_CONFIG.CHECKPOINT_COUNT) {
        checkpoints.push({
          position: [currentX, currentY + 0.5, currentZ],
          id: `checkpoint-${checkpoints.length}`,
        });
      }
    }
  }

  // Ensure we have enough shards
  while (shards.length < LEVEL_CONFIG.SHARD_COUNT) {
    const randomPlatform = platforms[Math.floor(rng.next() * platforms.length)];
    shards.push({
      position: [
        randomPlatform.position[0] + (rng.next() - 0.5) * 2,
        randomPlatform.position[1] + 1.5,
        randomPlatform.position[2] + (rng.next() - 0.5) * 2,
      ],
      id: `shard-extra-${shards.length}`,
    });
  }

  // Exit gate at the end
  const exitGate = {
    position: [currentX, currentY + 3, currentZ] as [number, number, number],
  };

  // Final platform under exit
  platforms.push({
    position: [currentX, currentY, currentZ],
    size: [10, 0.5, 10],
  });

  return {
    platforms,
    hazards,
    shards,
    checkpoints,
    exitGate,
    spawnPoint: [0, 2, 0],
  };
}

interface Level01SceneProps {
  seed?: string;
}

export function Level01Scene({ seed = 'default' }: Level01SceneProps) {
  const groupRef = useRef<Group>(null);
  const levelData = useMemo(() => generateLevel(seed), [seed]);

  const setTotalShards = useGameStore((s) => s.setTotalShards);
  const setSpawnPoint = useGameStore((s) => s.setSpawnPoint);

  useEffect(() => {
    setTotalShards(levelData.shards.length);
    setSpawnPoint({
      x: levelData.spawnPoint[0],
      y: levelData.spawnPoint[1],
      z: levelData.spawnPoint[2],
    });
  }, [levelData, setTotalShards, setSpawnPoint]);

  return (
    <group ref={groupRef}>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={0.5} castShadow />

      {/* Fog for depth */}
      <fog attach="fog" args={['#07060D', 30, 100]} />

      {/* Platforms */}
      {levelData.platforms.map((platform, i) => (
        <Platform
          key={`platform-${i}`}
          position={platform.position}
          size={platform.size}
          rotation={platform.rotation}
        />
      ))}

      {/* Hazards */}
      {levelData.hazards.map((hazard, i) => (
        <Hazard
          key={`hazard-${i}`}
          position={hazard.position}
          size={hazard.size}
        />
      ))}

      {/* Signal Shards */}
      {levelData.shards.map((shard) => (
        <SignalShard
          key={shard.id}
          id={shard.id}
          position={shard.position}
        />
      ))}

      {/* Checkpoints */}
      {levelData.checkpoints.map((checkpoint) => (
        <Checkpoint
          key={checkpoint.id}
          id={checkpoint.id}
          position={checkpoint.position}
        />
      ))}

      {/* Exit Gate */}
      <ExitGate position={levelData.exitGate.position} />

      {/* World boundaries (invisible walls) */}
      <RigidBody type="fixed" colliders={false}>
        {/* Floor boundary (death plane) */}
        <CuboidCollider
          args={[100, 1, 100]}
          position={[0, WORLD_BOUNDS.MIN_Y - 1, 0]}
          sensor
        />
        {/* Side walls */}
        <CuboidCollider args={[1, 100, 100]} position={[WORLD_BOUNDS.MIN_X - 1, 50, 0]} />
        <CuboidCollider args={[1, 100, 100]} position={[WORLD_BOUNDS.MAX_X + 1, 50, 0]} />
        <CuboidCollider args={[100, 100, 1]} position={[0, 50, WORLD_BOUNDS.MIN_Z - 1]} />
        <CuboidCollider args={[100, 100, 1]} position={[0, 50, WORLD_BOUNDS.MAX_Z + 1]} />
      </RigidBody>
    </group>
  );
}

export default Level01Scene;
