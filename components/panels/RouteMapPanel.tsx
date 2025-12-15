'use client';

import { useGameStore } from '@/game/store/useGameStore';
import { cn } from '@/lib/utils';

export function RouteMapPanel() {
  const orb = useGameStore((state) => state.orb);
  const shardsCollected = useGameStore((state) => state.run.shardsCollected);
  const totalShards = useGameStore((state) => state.run.totalShards);

  // Simplified 2D map representation
  const mapWidth = 250;
  const mapHeight = 200;

  // Scale orb position to map coordinates
  const orbMapX = Math.max(0, Math.min(mapWidth, (orb.position.x + 25) * (mapWidth / 50)));
  const orbMapY = Math.max(0, Math.min(mapHeight, (orb.position.z + 25) * (mapHeight / 50)));

  // Placeholder shard positions
  const shardPositions = [
    { x: 50, y: 30 },
    { x: 200, y: 50 },
    { x: 30, y: 100 },
    { x: 220, y: 100 },
    { x: 100, y: 60 },
    { x: 150, y: 140 },
    { x: 80, y: 170 },
    { x: 170, y: 170 },
    { x: 125, y: 30 },
    { x: 125, y: 100 },
    { x: 40, y: 150 },
    { x: 210, y: 150 },
  ];

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
        Route Map
      </h3>

      <div
        className="relative bg-navy rounded border border-neon-cyan/20"
        style={{ width: mapWidth, height: mapHeight }}
      >
        {/* Track outline (simplified) */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        >
          {/* Track path */}
          <path
            d="M 20 100 Q 125 20 230 100 Q 125 180 20 100"
            fill="none"
            stroke="rgba(31, 242, 255, 0.2)"
            strokeWidth="20"
          />
          {/* Track border */}
          <path
            d="M 20 100 Q 125 20 230 100 Q 125 180 20 100"
            fill="none"
            stroke="rgba(31, 242, 255, 0.3)"
            strokeWidth="2"
          />
        </svg>

        {/* Shard indicators */}
        {shardPositions.map((pos, index) => (
          <div
            key={index}
            className={cn(
              'absolute w-2 h-2 rounded-full transform -translate-x-1 -translate-y-1 transition-opacity',
              index < shardsCollected
                ? 'bg-neon-gold/30'
                : 'bg-neon-gold animate-pulse'
            )}
            style={{ left: pos.x, top: pos.y }}
          />
        ))}

        {/* Exit gate indicator */}
        <div
          className={cn(
            'absolute w-4 h-4 border-2 rounded transform -translate-x-2 -translate-y-2',
            shardsCollected === totalShards
              ? 'border-neon-green animate-pulse'
              : 'border-text-muted/50'
          )}
          style={{ left: 125, top: 100 }}
        />

        {/* Orb position */}
        <div
          className="absolute w-3 h-3 bg-neon-cyan rounded-full transform -translate-x-1.5 -translate-y-1.5 shadow-[0_0_8px_rgba(31,242,255,0.8)]"
          style={{ left: orbMapX, top: orbMapY }}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs text-text-muted">
        <span>
          <span className="inline-block w-2 h-2 bg-neon-cyan rounded-full mr-1" />
          Orb
        </span>
        <span>
          <span className="inline-block w-2 h-2 bg-neon-gold rounded-full mr-1" />
          Shard
        </span>
        <span>
          <span className="inline-block w-2 h-2 border border-text-muted rounded mr-1" />
          Exit
        </span>
      </div>
    </div>
  );
}

export default RouteMapPanel;
