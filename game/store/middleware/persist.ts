import { PersistOptions } from 'zustand/middleware';

export interface GamePersistConfig {
  name: string;
  version?: number;
  whitelist?: string[];
}

export function createPersistConfig<T extends object>(config: GamePersistConfig): PersistOptions<T, Partial<T>> {
  return {
    name: config.name,
    version: config.version ?? 1,
    partialize: (state: T): Partial<T> => {
      if (config.whitelist) {
        const result: Partial<T> = {};
        for (const key of config.whitelist) {
          if (key in state) {
            (result as Record<string, unknown>)[key] = (state as Record<string, unknown>)[key];
          }
        }
        return result;
      }
      return state;
    },
  };
}

export const gameStorePersistConfig: GamePersistConfig = {
  name: 'tilt-rift-store',
  version: 1,
  whitelist: ['settings'],
};

export function clearPersistedState(name: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(name);
  } catch (error) {
    console.error('Failed to clear persisted state:', error);
  }
}

export function getPersistedState<T>(name: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(name);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed.state as T;
  } catch (error) {
    console.error('Failed to get persisted state:', error);
    return null;
  }
}
