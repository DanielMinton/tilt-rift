import seedrandom from 'seedrandom';

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function getDailySeed(): string {
  const date = new Date();
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return hashString(`tilt-rift-${dateString}`);
}

export function getWeeklySeed(): string {
  const date = new Date();
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return hashString(`tilt-rift-${year}-W${week}`);
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function encodeSeedToURL(seed: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(seed).toString('base64').replace(/=/g, '');
  }
  return btoa(seed).replace(/=/g, '');
}

export function decodeSeedFromURL(encoded: string): string {
  try {
    const padded = encoded + '='.repeat((4 - encoded.length % 4) % 4);
    if (typeof window === 'undefined') {
      return Buffer.from(padded, 'base64').toString();
    }
    return atob(padded);
  } catch {
    return getDailySeed();
  }
}

export function createSeededRandom(seed: string): () => number {
  return seedrandom(seed);
}

export function seededShuffle<T>(array: T[], seed: string): T[] {
  const rng = createSeededRandom(seed);
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function seededRange(min: number, max: number, seed: string): number {
  const rng = createSeededRandom(seed);
  return rng() * (max - min) + min;
}

export function seededInt(min: number, max: number, seed: string): number {
  return Math.floor(seededRange(min, max + 1, seed));
}

export function seededPick<T>(array: T[], seed: string): T {
  const rng = createSeededRandom(seed);
  return array[Math.floor(rng() * array.length)];
}
