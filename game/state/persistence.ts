import { SettingsState } from '../types';

const STORAGE_KEY = 'tilt-rift-data';
const SETTINGS_KEY = 'tilt-rift-settings';
const HIGH_SCORES_KEY = 'tilt-rift-high-scores';

export interface PersistedData {
  version: number;
  settings: SettingsState;
  highScores: HighScoreEntry[];
  completedRuns: number;
  hasSeenTutorial: boolean;
  hasSeenCrossPlatformPrompt: boolean;
  lastPlayedDate: string;
}

export interface HighScoreEntry {
  score: number;
  rank: string;
  seed: string;
  device: 'mobile' | 'desktop';
  date: string;
  shardsCollected: number;
  timeRemaining: number;
}

const DEFAULT_SETTINGS: SettingsState = {
  masterVolume: 1.0,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  tiltSensitivity: 1.0,
  invertTiltX: false,
  invertTiltY: false,
  reducedMotion: false,
  highContrast: false,
  colorblindMode: 'none',
  showFPS: false,
  showTelemetry: false,
};

const DEFAULT_DATA: PersistedData = {
  version: 1,
  settings: DEFAULT_SETTINGS,
  highScores: [],
  completedRuns: 0,
  hasSeenTutorial: false,
  hasSeenCrossPlatformPrompt: false,
  lastPlayedDate: '',
};

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadPersistedData(): PersistedData {
  const storage = getStorage();
  if (!storage) return DEFAULT_DATA;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;

    const data = JSON.parse(raw) as PersistedData;

    // Merge with defaults to handle new fields
    return {
      ...DEFAULT_DATA,
      ...data,
      settings: { ...DEFAULT_SETTINGS, ...data.settings },
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function savePersistedData(data: Partial<PersistedData>): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const existing = loadPersistedData();
    const updated = { ...existing, ...data };
    storage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save persisted data:', error);
  }
}

export function loadSettings(): SettingsState {
  return loadPersistedData().settings;
}

export function saveSettings(settings: SettingsState): void {
  savePersistedData({ settings });
}

export function loadHighScores(): HighScoreEntry[] {
  return loadPersistedData().highScores;
}

export function saveHighScore(entry: HighScoreEntry): void {
  const data = loadPersistedData();
  const highScores = [...data.highScores, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  savePersistedData({ highScores });
}

export function getPersonalBest(): HighScoreEntry | null {
  const highScores = loadHighScores();
  return highScores.length > 0 ? highScores[0] : null;
}

export function incrementCompletedRuns(): void {
  const data = loadPersistedData();
  savePersistedData({ completedRuns: data.completedRuns + 1 });
}

export function markTutorialSeen(): void {
  savePersistedData({ hasSeenTutorial: true });
}

export function markCrossPlatformPromptSeen(): void {
  savePersistedData({ hasSeenCrossPlatformPrompt: true });
}

export function hasSeenTutorial(): boolean {
  return loadPersistedData().hasSeenTutorial;
}

export function hasSeenCrossPlatformPrompt(): boolean {
  return loadPersistedData().hasSeenCrossPlatformPrompt;
}

export function getCompletedRuns(): number {
  return loadPersistedData().completedRuns;
}

export function clearAllData(): void {
  const storage = getStorage();
  if (storage) {
    storage.removeItem(STORAGE_KEY);
    storage.removeItem(SETTINGS_KEY);
    storage.removeItem(HIGH_SCORES_KEY);
  }
}
