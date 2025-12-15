import { MeshStandardMaterial, MeshBasicMaterial, Color } from 'three';
import { COLORS } from './constants';

export function createPlatformMaterial(): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color: new Color(COLORS.PLATFORM_BASE),
    metalness: 0.8,
    roughness: 0.2,
    emissive: new Color(COLORS.PLATFORM_EDGE),
    emissiveIntensity: 0.1,
  });
}

export function createHazardMaterial(): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color: new Color(COLORS.HAZARD),
    transparent: true,
    opacity: 0.8,
  });
}

export function createShardMaterial(): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color: new Color(COLORS.SHARD),
    transparent: true,
    opacity: 0.9,
  });
}

export function createCheckpointMaterial(active: boolean): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color: new Color(active ? COLORS.CHECKPOINT_ACTIVE : COLORS.CHECKPOINT_INACTIVE),
    transparent: true,
    opacity: active ? 0.9 : 0.5,
  });
}

export function createGateMaterial(): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color: new Color(COLORS.GATE),
    transparent: true,
    opacity: 0.7,
  });
}

export function createGlowMaterial(color: string, intensity: number = 1): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color: new Color(color),
    transparent: true,
    opacity: 0.5 * intensity,
  });
}
