'use client';

import { useEffect, useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '@/game/store/useGameStore';
import { Platform } from './interactables/Platform';
import { Hazard } from './interactables/Hazard';
import { ExitGate } from './interactables/ExitGate';
import { SignalShard } from './collectibles/SignalShard';
import { COLORS } from '../shared/constants';

interface LevelData {
  platforms: Array<{ position: [number, number, number]; size: [number, number, number]; rotation?: number }>;
  walls: Array<{ position: [number, number, number]; size: [number, number, number]; rotation?: number }>;
  hazards: Array<{ position: [number, number, number]; size: [number, number, number] }>;
  shards: Array<{ position: [number, number, number]; id: string }>;
  exitGate: { position: [number, number, number] };
  spawnPoint: [number, number, number];
  courseLength: number;
}

function generateHorizontalCourse(): LevelData {
  const platforms: LevelData['platforms'] = [];
  const walls: LevelData['walls'] = [];
  const hazards: LevelData['hazards'] = [];
  const shards: LevelData['shards'] = [];

  // Course parameters
  const segmentLength = 12;
  const pathWidth = 6;
  const wallHeight = 1.5;
  const wallThickness = 0.3;

  // Create a winding path with gentle curves
  // Segment 1: Straight start
  platforms.push({
    position: [0, 0, 0],
    size: [pathWidth, 0.5, segmentLength],
  });
  // Left wall
  walls.push({
    position: [-pathWidth / 2 - wallThickness / 2, wallHeight / 2, 0],
    size: [wallThickness, wallHeight, segmentLength],
  });
  // Right wall
  walls.push({
    position: [pathWidth / 2 + wallThickness / 2, wallHeight / 2, 0],
    size: [wallThickness, wallHeight, segmentLength],
  });

  // Shards in first segment
  shards.push({ position: [0, 1, -2], id: 'shard-1' });
  shards.push({ position: [-1.5, 1, -4], id: 'shard-2' });
  shards.push({ position: [1.5, 1, -4], id: 'shard-3' });

  // Segment 2: Curve right
  const curve1Z = -segmentLength;
  platforms.push({
    position: [pathWidth / 2, 0, curve1Z - segmentLength / 2],
    size: [pathWidth * 1.5, 0.5, segmentLength],
    rotation: Math.PI / 6,
  });
  // Outer wall
  walls.push({
    position: [-pathWidth / 2, wallHeight / 2, curve1Z - segmentLength / 2],
    size: [wallThickness, wallHeight, segmentLength * 1.2],
    rotation: Math.PI / 6,
  });

  // Hazard in curve
  hazards.push({
    position: [2, 0.5, curve1Z - 4],
    size: [1.5, 0.3, 1.5],
  });

  // Shards along curve
  shards.push({ position: [1, 1, curve1Z - 2], id: 'shard-4' });
  shards.push({ position: [3, 1, curve1Z - 6], id: 'shard-5' });

  // Segment 3: Wide section with obstacles
  const seg3Z = curve1Z - segmentLength - 2;
  platforms.push({
    position: [4, 0, seg3Z - segmentLength / 2],
    size: [pathWidth * 1.5, 0.5, segmentLength],
  });
  // Walls
  walls.push({
    position: [4 - pathWidth * 0.75 - wallThickness / 2, wallHeight / 2, seg3Z - segmentLength / 2],
    size: [wallThickness, wallHeight, segmentLength],
  });
  walls.push({
    position: [4 + pathWidth * 0.75 + wallThickness / 2, wallHeight / 2, seg3Z - segmentLength / 2],
    size: [wallThickness, wallHeight, segmentLength],
  });

  // Center obstacle
  hazards.push({
    position: [4, 0.5, seg3Z - segmentLength / 2],
    size: [2, 0.3, 2],
  });

  // Shards around obstacle
  shards.push({ position: [2, 1, seg3Z - 4], id: 'shard-6' });
  shards.push({ position: [6, 1, seg3Z - 4], id: 'shard-7' });
  shards.push({ position: [2, 1, seg3Z - 8], id: 'shard-8' });
  shards.push({ position: [6, 1, seg3Z - 8], id: 'shard-9' });

  // Segment 4: Curve left
  const seg4Z = seg3Z - segmentLength - 2;
  platforms.push({
    position: [2, 0, seg4Z - segmentLength / 2],
    size: [pathWidth * 1.5, 0.5, segmentLength],
    rotation: -Math.PI / 6,
  });
  // Walls
  walls.push({
    position: [6, wallHeight / 2, seg4Z - segmentLength / 2],
    size: [wallThickness, wallHeight, segmentLength * 1.2],
    rotation: -Math.PI / 6,
  });

  // Shards
  shards.push({ position: [3, 1, seg4Z - 3], id: 'shard-10' });
  shards.push({ position: [1, 1, seg4Z - 6], id: 'shard-11' });

  // Segment 5: Final straight to gate
  const seg5Z = seg4Z - segmentLength - 2;
  platforms.push({
    position: [0, 0, seg5Z - segmentLength / 2],
    size: [pathWidth, 0.5, segmentLength],
  });
  // Walls
  walls.push({
    position: [-pathWidth / 2 - wallThickness / 2, wallHeight / 2, seg5Z - segmentLength / 2],
    size: [wallThickness, wallHeight, segmentLength],
  });
  walls.push({
    position: [pathWidth / 2 + wallThickness / 2, wallHeight / 2, seg5Z - segmentLength / 2],
    size: [wallThickness, wallHeight, segmentLength],
  });

  // Final shards leading to gate
  shards.push({ position: [-1.5, 1, seg5Z - 2], id: 'shard-12' });
  shards.push({ position: [1.5, 1, seg5Z - 2], id: 'shard-13' });
  shards.push({ position: [0, 1, seg5Z - 5], id: 'shard-14' });
  shards.push({ position: [0, 1, seg5Z - 8], id: 'shard-15' });

  // Exit gate at the end
  const gateZ = seg5Z - segmentLength + 1;
  const exitGate = {
    position: [0, 1.5, gateZ] as [number, number, number],
  };

  // End platform (wider for the gate)
  platforms.push({
    position: [0, 0, gateZ],
    size: [pathWidth * 1.2, 0.5, 4],
  });

  return {
    platforms,
    walls,
    hazards,
    shards,
    exitGate,
    spawnPoint: [0, 1, 4], // Start at beginning of course
    courseLength: Math.abs(gateZ - 4),
  };
}

interface Level01SceneProps {
  seed?: string;
}

export function Level01Scene({ seed = 'default' }: Level01SceneProps) {
  const levelData = useMemo(() => generateHorizontalCourse(), []);

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
      {/* Ground plane for visual reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -30]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0a0a15" />
      </mesh>

      {/* Platforms (the course) */}
      {levelData.platforms.map((platform, i) => (
        <Platform
          key={`platform-${i}`}
          position={platform.position}
          size={platform.size}
          rotation={platform.rotation}
        />
      ))}

      {/* Walls (guardrails) */}
      {levelData.walls.map((wall, i) => (
        <RigidBody
          key={`wall-${i}`}
          type="fixed"
          position={wall.position}
          rotation={[0, wall.rotation || 0, 0]}
        >
          <mesh>
            <boxGeometry args={wall.size} />
            <meshStandardMaterial
              color={COLORS.PLATFORM_EDGE}
              transparent
              opacity={0.3}
              emissive={COLORS.PLATFORM_EDGE}
              emissiveIntensity={0.2}
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

      {/* Signal Shards */}
      {levelData.shards.map((shard) => (
        <SignalShard
          key={shard.id}
          id={shard.id}
          position={shard.position}
        />
      ))}

      {/* Exit Gate */}
      <ExitGate position={levelData.exitGate.position} />

      {/* Invisible death plane */}
      <RigidBody type="fixed" colliders={false} position={[0, -10, -30]}>
        <CuboidCollider args={[100, 1, 100]} sensor />
      </RigidBody>
    </group>
  );
}

export default Level01Scene;
