export const PARTICLE_BUDGETS = {
  AMBIENT_GLYPHS: 120,
  IMPACT_SPARKS_PER_SEC: 80,
  PICKUP_SWIRL_ACTIVE: 24,
  VICTORY_TOTAL: 600,
} as const;

export const RENDER_BUDGETS = {
  MAX_DRAW_CALLS: 150,
  MAX_TRIANGLES: 120000,
  MAX_LIGHTS: 8,
  MAX_SHADOW_CASTERS: 3,
} as const;

export const LOD_DISTANCES = {
  LOD0: 12,  // Full mesh + emissive + shadow
  LOD1: 25,  // Simplified mesh, no shadow
  LOD2: 40,  // Billboard or hidden
} as const;

export class ParticleBudget {
  private counts: Map<string, number> = new Map();
  private rateCounters: Map<string, { count: number; lastReset: number }> = new Map();

  canSpawn(type: keyof typeof PARTICLE_BUDGETS, count: number = 1): boolean {
    const limit = PARTICLE_BUDGETS[type];

    if (type === 'IMPACT_SPARKS_PER_SEC') {
      return this.checkRate(type, count, limit);
    }

    const current = this.counts.get(type) || 0;
    return current + count <= limit;
  }

  private checkRate(type: string, count: number, limit: number): boolean {
    const now = performance.now();
    const counter = this.rateCounters.get(type);

    if (!counter || now - counter.lastReset >= 1000) {
      this.rateCounters.set(type, { count: 0, lastReset: now });
    }

    const current = this.rateCounters.get(type)!;
    return current.count + count <= limit;
  }

  spawn(type: keyof typeof PARTICLE_BUDGETS, count: number = 1): boolean {
    if (!this.canSpawn(type, count)) return false;

    if (type === 'IMPACT_SPARKS_PER_SEC') {
      const counter = this.rateCounters.get(type);
      if (counter) {
        counter.count += count;
      }
    } else {
      const current = this.counts.get(type) || 0;
      this.counts.set(type, current + count);
    }

    return true;
  }

  release(type: keyof typeof PARTICLE_BUDGETS, count: number = 1): void {
    if (type === 'IMPACT_SPARKS_PER_SEC') return;

    const current = this.counts.get(type) || 0;
    this.counts.set(type, Math.max(0, current - count));
  }

  reset(type?: keyof typeof PARTICLE_BUDGETS): void {
    if (type) {
      this.counts.delete(type);
      this.rateCounters.delete(type);
    } else {
      this.counts.clear();
      this.rateCounters.clear();
    }
  }

  getUsage(type: keyof typeof PARTICLE_BUDGETS): number {
    if (type === 'IMPACT_SPARKS_PER_SEC') {
      return this.rateCounters.get(type)?.count || 0;
    }
    return this.counts.get(type) || 0;
  }

  getRemaining(type: keyof typeof PARTICLE_BUDGETS): number {
    return PARTICLE_BUDGETS[type] - this.getUsage(type);
  }
}

export const particleBudget = new ParticleBudget();

export function getShadowMapSize(devicePixelRatio: number): number {
  return devicePixelRatio > 1.5 ? 2048 : 1024;
}

export function getLODLevel(distance: number): 0 | 1 | 2 {
  if (distance <= LOD_DISTANCES.LOD0) return 0;
  if (distance <= LOD_DISTANCES.LOD1) return 1;
  return 2;
}

export function shouldRenderShadow(distance: number, shadowCasterCount: number): boolean {
  return distance <= LOD_DISTANCES.LOD0 && shadowCasterCount < RENDER_BUDGETS.MAX_SHADOW_CASTERS;
}
