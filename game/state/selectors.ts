import { useGameStore, GameStoreState } from '../store/useGameStore';

// Run state selectors
export const selectShardsCollected = (state: GameStoreState) => state.run.shardsCollected;
export const selectTotalShards = (state: GameStoreState) => state.run.totalShards;
export const selectTimeRemaining = (state: GameStoreState) => state.run.timeRemaining;
export const selectTimeElapsed = (state: GameStoreState) => state.run.timeElapsed;
export const selectStability = (state: GameStoreState) => state.run.stability;
export const selectMaxStability = (state: GameStoreState) => state.run.maxStability;
export const selectCurrentCombo = (state: GameStoreState) => state.run.currentCombo;
export const selectMaxCombo = (state: GameStoreState) => state.run.maxCombo;
export const selectScore = (state: GameStoreState) => state.run.score;

// Derived selectors
export const selectStabilityPercent = (state: GameStoreState) =>
  (state.run.stability / state.run.maxStability) * 100;

export const selectShardProgress = (state: GameStoreState) =>
  state.run.shardsCollected / state.run.totalShards;

export const selectTimeProgress = (state: GameStoreState) =>
  state.run.timeElapsed / (state.run.timeElapsed + state.run.timeRemaining);

export const selectIsLowStability = (state: GameStoreState) =>
  state.run.stability < state.run.maxStability * 0.25;

export const selectIsLowTime = (state: GameStoreState) =>
  state.run.timeRemaining < 30;

export const selectHasActiveCombo = (state: GameStoreState) =>
  state.run.currentCombo > 1;

// Game state selectors
export const selectGameState = (state: GameStoreState) => state.gameState;
export const selectIsPlaying = (state: GameStoreState) => state.gameState === 'PLAYING';
export const selectIsPaused = (state: GameStoreState) => state.gameState === 'PAUSED';
export const selectIsGameOver = (state: GameStoreState) =>
  state.gameState === 'WON' || state.gameState === 'LOST';

// Settings selectors
export const selectMasterVolume = (state: GameStoreState) => state.settings.masterVolume;
export const selectMusicVolume = (state: GameStoreState) => state.settings.musicVolume;
export const selectSfxVolume = (state: GameStoreState) => state.settings.sfxVolume;
export const selectTiltSensitivity = (state: GameStoreState) => state.settings.tiltSensitivity;
export const selectReducedMotion = (state: GameStoreState) => state.settings.reducedMotion;
export const selectHighContrast = (state: GameStoreState) => state.settings.highContrast;
export const selectColorblindMode = (state: GameStoreState) => state.settings.colorblindMode;

// UI selectors
export const selectShowPause = (state: GameStoreState) => state.ui.showPause;
export const selectShowSettings = (state: GameStoreState) => state.ui.showSettings;
export const selectShowTutorial = (state: GameStoreState) => state.ui.showTutorial;
export const selectShowResults = (state: GameStoreState) => state.ui.showResults;
export const selectCurrentPanel = (state: GameStoreState) => state.ui.currentPanel;

// Telemetry selectors
export const selectFPS = (state: GameStoreState) => state.telemetry.fps;
export const selectAvgFPS = (state: GameStoreState) => state.telemetry.avgFps;
export const selectDrawCalls = (state: GameStoreState) => state.telemetry.drawCalls;
export const selectTriangles = (state: GameStoreState) => state.telemetry.triangles;

// Input selectors
export const selectGravity = (state: GameStoreState) => state.input.gravity;
export const selectLastGesture = (state: GameStoreState) => state.input.lastGesture;
export const selectCalibrationOffset = (state: GameStoreState) => state.input.calibrationOffset;

// Cooldown selectors
export const selectCooldowns = (state: GameStoreState) => state.cooldowns;
export const selectTapCooldown = (state: GameStoreState) => state.cooldowns.tap;
export const selectDoubleTapCooldown = (state: GameStoreState) => state.cooldowns.doubleTap;
export const selectPulseCooldown = (state: GameStoreState) => state.cooldowns.pulse;
export const selectBrakeCooldown = (state: GameStoreState) => state.cooldowns.brake;

// Hook-based selectors for components
export const useShardsCollected = () => useGameStore(selectShardsCollected);
export const useTimeRemaining = () => useGameStore(selectTimeRemaining);
export const useStability = () => useGameStore(selectStability);
export const useScore = () => useGameStore(selectScore);
export const useGameState = () => useGameStore(selectGameState);
export const useIsPlaying = () => useGameStore(selectIsPlaying);
export const useFPS = () => useGameStore(selectFPS);
