'use client';

import { useEffect, useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '@/game/store/useGameStore';
import { Hazard } from './interactables/Hazard';
import { ExitGate } from './interactables/ExitGate';
import { SignalShard } from './collectibles/SignalShard';
import { COLORS } from '../shared/constants';

interface LevelData {
  floorSegments: Array<{ position: [number, number, number]; size: [number, number, number] }>;
  walls: Array<{ position: [number, number, number]; size: [number, number, number] }>;
  hazards: Array<{ position: [number, number, number]; size: [number, number, number] }>;
  shards: Array<{ position: [number, number, number]; id: string }>;
  exitGate: { position: [number, number, number] };
  spawnPoint: [number, number, number];
  courseLength: number;
}

function generateCourse(): LevelData {
  const floorSegments: LevelData['floorSegments'] = [];
  const walls: LevelData['walls'] = [];
  const hazards: LevelData['hazards'] = [];
  const shards: LevelData['shards'] = [];

  const pathWidth = 8;
  const wallHeight = 1.2;
  const wallThickness = 0.5;

  // ONE CONTINUOUS FLOOR - extends well past the exit gate
  // Main floor: 8 wide x 100 long (from z=5 to z=-95)
  floorSegments.push({
    position: [0, -0.25, -45],
    size: [pathWidth, 0.5, 100],
  });

  // Left wall (full length)
  walls.push({
    position: [-pathWidth/2 - wallThickness/2, wallHeight/2, -45],
    size: [wallThickness, wallHeight, 100],
  });

  // Right wall (full length)
  walls.push({
    position: [pathWidth/2 + wallThickness/2, wallHeight/2, -45],
    size: [wallThickness, wallHeight, 100],
  });

  // Back wall (at start)
  walls.push({
    position: [0, wallHeight/2, 6],
    size: [pathWidth + wallThickness*2, wallHeight, wallThickness],
  });

  // End wall (behind exit gate)
  walls.push({
    position: [0, wallHeight/2, -90],
    size: [pathWidth + wallThickness*2, wallHeight, wallThickness],
  });

  // === SHARDS along the path ===
  // Start area
  shards.push({ position: [0, 0.8, 2], id: 'shard-1' });

  // Early section
  shards.push({ position: [-2, 0.8, -5], id: 'shard-2' });
  shards.push({ position: [2, 0.8, -5], id: 'shard-3' });
  shards.push({ position: [0, 0.8, -10], id: 'shard-4' });

  // Mid section
  shards.push({ position: [-2.5, 0.8, -20], id: 'shard-5' });
  shards.push({ position: [2.5, 0.8, -20], id: 'shard-6' });
  shards.push({ position: [0, 0.8, -25], id: 'shard-7' });
  shards.push({ position: [-2, 0.8, -30], id: 'shard-8' });
  shards.push({ position: [2, 0.8, -30], id: 'shard-9' });

  // Late section
  shards.push({ position: [0, 0.8, -40], id: 'shard-10' });
  shards.push({ position: [-2.5, 0.8, -50], id: 'shard-11' });
  shards.push({ position: [2.5, 0.8, -50], id: 'shard-12' });

  // Near goal
  shards.push({ position: [-1.5, 0.8, -60], id: 'shard-13' });
  shards.push({ position: [1.5, 0.8, -60], id: 'shard-14' });
  shards.push({ position: [0, 0.8, -65], id: 'shard-15' });

  // === HAZARDS (obstacles to avoid) ===
  hazards.push({
    position: [0, 0.3, -15],
    size: [2, 0.4, 2],
  });

  hazards.push({
    position: [-2, 0.3, -35],
    size: [1.5, 0.4, 1.5],
  });

  hazards.push({
    position: [2, 0.3, -45],
    size: [1.5, 0.4, 1.5],
  });

  hazards.push({
    position: [0, 0.3, -55],
    size: [2.5, 0.4, 2],
  });

  // Exit gate at the end
  const exitGate = {
    position: [0, 1.5, -72] as [number, number, number],
  };

  return {
    floorSegments,
    walls,
    hazards,
    shards,
    exitGate,
    spawnPoint: [0, 1, 3],
    courseLength: 75,
  };
}

interface Level01SceneProps {
  seed?: string;
}

export function Level01Scene({ seed = 'default' }: Level01SceneProps) {
  const levelData = useMemo(() => generateCourse(), []);

  const setTotalShards = useGameStore((s) => s.setTotalShards);
  const setSpawnPoint = useGameStore((s) => s.setSpawnPoint);
  const setCourseLength = useGameStore((s) => s.setCourseLength);

  useEffect(() => {
    setTotalShards(levelData.shards.length);
    setSpawnPoint({
      x: levelData.spawnPoint[0],
      y: levelData.spawnPoint[1],
      z: levelData.spawnPoint[2],
    });
    if (setCourseLength) {
      setCourseLength(levelData.courseLength);
    }
  }, [levelData, setTotalShards, setSpawnPoint, setCourseLength]);

  return (
    <group>
      {/* Dark ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -35]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#050508" />
      </mesh>

      {/* Floor segments */}
      {levelData.floorSegments.map((seg, i) => (
        <RigidBody key={`floor-${i}`} type="fixed" position={seg.position}>
          <mesh receiveShadow>
            <boxGeometry args={seg.size} />
            <meshStandardMaterial
              color="#1a1a2e"
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
          {/* Glowing edge lines */}
          <mesh position={[0, seg.size[1]/2 + 0.01, 0]}>
            <boxGeometry args={[seg.size[0], 0.02, seg.size[2]]} />
            <meshBasicMaterial color="#1FF2FF" transparent opacity={0.1} />
          </mesh>
        </RigidBody>
      ))}

      {/* Walls */}
      {levelData.walls.map((wall, i) => (
        <RigidBody key={`wall-${i}`} type="fixed" position={wall.position}>
          <mesh>
            <boxGeometry args={wall.size} />
            <meshStandardMaterial
              color="#1FF2FF"
              transparent
              opacity={0.15}
              emissive="#1FF2FF"
              emissiveIntensity={0.3}
            />
          </mesh>
        </RigidBody>
      ))}

      {/* Hazards */}
      {levelData.hazards.map((hazard, i) => (
        <Hazard
          key={`hazard-${i}`}
          position={hazard.position}
          size={hazard.size}
        />
      ))}

      {/* Shards */}
      {levelData.shards.map((shard) => (
        <SignalShard
          key={shard.id}
          id={shard.id}
          position={shard.position}
        />
      ))}

      {/* Exit Gate */}
      <ExitGate position={levelData.exitGate.position} />

      {/* Death plane */}
      <RigidBody type="fixed" colliders={false} position={[0, -10, -45]}>
        <CuboidCollider args={[100, 1, 150]} sensor />
      </RigidBody>
    </group>
  );
}

export default Level01Scene;
