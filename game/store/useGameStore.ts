import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { GameState, CooldownState, OrbState, ModCard, Vector3Data } from '../types';
import { RunSlice, createRunSlice } from './slices/runSlice';
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';
import { InputSlice, createInputSlice } from './slices/inputSlice';
import { UISlice, createUISlice } from './slices/uiSlice';
import { TelemetrySlice, createTelemetrySlice } from './slices/telemetrySlice';

export type GamePhase = 'menu' | 'loading' | 'playing' | 'paused' | 'gameOver' | 'victory';

export interface GameStoreState extends RunSlice, SettingsSlice, InputSlice, UISlice, TelemetrySlice {
  // Core game state
  gameState: GameState;
  setGameState: (state: GameState) => void;

  // Game phase
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;

  // Pause state
  isPaused: boolean;
  togglePause: () => void;
  setPaused: (paused: boolean) => void;

  // Device mode
  deviceMode: 'mobile' | 'desktop';
  setDeviceMode: (mode: 'mobile' | 'desktop') => void;

  // Input mode
  inputMode: 'mobile' | 'desktop';
  setInputMode: (mode: 'mobile' | 'desktop') => void;

  // Tilt input
  tiltX: number;
  tiltY: number;
  setTilt: (x: number, y: number) => void;

  // Current seed
  seed: string;
  setSeed: (seed: string) => void;

  // Spawn point
  spawnPoint: Vector3Data | null;
  setSpawnPoint: (point: Vector3Data) => void;

  // Player position
  playerPosition: Vector3Data;
  setPlayerPosition: (position: Vector3Data) => void;

  // Course progress
  courseLength: number;
  courseProgress: number;
  setCourseLength: (length: number) => void;
  updateCourseProgress: (playerZ: number, startZ: number) => void;

  // Shards
  shardsCollected: number;
  totalShards: number;
  collectedShardIds: Set<string>;
  setTotalShards: (total: number) => void;
  collectShard: (id: string, value?: number) => void;

  // Health/Damage
  health: number;
  maxHealth: number;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;

  // Victory/GameOver
  triggerVictory: () => void;
  triggerGameOver: () => void;

  // Overclock mode
  overclockEnabled: boolean;
  setOverclockEnabled: (enabled: boolean) => void;

  // Active modifiers
  activeModifiers: ModCard[];
  addModifier: (modifier: ModCard) => void;
  removeModifier: (modifierId: string) => void;
  clearModifiers: () => void;

  // Cooldowns
  cooldowns: CooldownState;
  startCooldown: (ability: keyof CooldownState, duration: number) => void;
  updateCooldowns: (delta: number) => void;
  isCooldownReady: (ability: keyof CooldownState) => boolean;

  // Orb state (synced from physics)
  orb: OrbState;
  updateOrbState: (state: Partial<OrbState>) => void;

  // Physics sync
  syncPhysicsState: () => void;

  // Full reset
  resetGame: () => void;
  startGame: () => void;
}

const initialCooldowns: CooldownState = {
  tap: 0,
  doubleTap: 0,
  longPress: 0,
  pulse: 0,
  brake: 0,
  vectorField: 0,
};

const initialOrbState: OrbState = {
  position: { x: 0, y: 1, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  speed: 0,
  isGrounded: true,
  isInExitGate: false,
  lastImpactTime: 0,
  lastImpactForce: 0,
};

export const useGameStore = create<GameStoreState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get, store) => ({
          // Slices
          ...createRunSlice(set, get, store),
          ...createSettingsSlice(set, get, store),
          ...createInputSlice(set, get, store),
          ...createUISlice(set, get, store),
          ...createTelemetrySlice(set, get, store),

          // Core game state
          gameState: 'BOOT',
          setGameState: (gameState: GameState) => set({ gameState }),

          // Game phase
          phase: 'menu',
          setPhase: (phase: GamePhase) => set({ phase }),

          // Pause
          isPaused: false,
          togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
          setPaused: (isPaused: boolean) => set({ isPaused }),

          // Device mode
          deviceMode: 'desktop',
          setDeviceMode: (deviceMode: 'mobile' | 'desktop') => set({ deviceMode }),

          // Input mode
          inputMode: 'desktop',
          setInputMode: (inputMode: 'mobile' | 'desktop') => set({ inputMode }),

          // Tilt
          tiltX: 0,
          tiltY: 0,
          setTilt: (tiltX: number, tiltY: number) => set({ tiltX, tiltY }),

          // Seed
          seed: '',
          setSeed: (seed: string) => set({ seed }),

          // Spawn point
          spawnPoint: null,
          setSpawnPoint: (spawnPoint: Vector3Data) => set({ spawnPoint }),

          // Player position
          playerPosition: { x: 0, y: 0, z: 0 },
          setPlayerPosition: (playerPosition: Vector3Data) => set({ playerPosition }),

          // Course progress
          courseLength: 60,
          courseProgress: 0,
          setCourseLength: (courseLength: number) => set({ courseLength }),
          updateCourseProgress: (playerZ: number, startZ: number) => {
            const state = get();
            const progress = Math.max(0, Math.min(1, (startZ - playerZ) / state.courseLength));
            set({ courseProgress: progress });
          },

          // Shards
          shardsCollected: 0,
          totalShards: 20,
          collectedShardIds: new Set<string>(),
          setTotalShards: (totalShards: number) => set({ totalShards }),
          collectShard: (id: string, value: number = 100) => {
            const state = get();
            if (state.collectedShardIds.has(id)) return;

            const newCollectedIds = new Set(state.collectedShardIds);
            newCollectedIds.add(id);

            set({
              shardsCollected: state.shardsCollected + 1,
              collectedShardIds: newCollectedIds,
            });

            // Update score in run slice
            state.updateScore(value * (1 + state.run.currentCombo * 0.1));
            state.incrementCombo();
          },

          // Health
          health: 100,
          maxHealth: 100,
          takeDamage: (amount: number) => {
            const state = get();
            const newHealth = Math.max(0, state.health - amount);
            set({ health: newHealth });

            if (newHealth <= 0) {
              state.triggerGameOver();
            }
          },
          heal: (amount: number) =>
            set((state) => ({
              health: Math.min(state.maxHealth, state.health + amount),
            })),

          // Victory/GameOver
          triggerVictory: () => set({ phase: 'victory', isPaused: false }),
          triggerGameOver: () => set({ phase: 'gameOver', isPaused: false }),

          // Overclock
          overclockEnabled: false,
          setOverclockEnabled: (overclockEnabled: boolean) => set({ overclockEnabled }),

          // Modifiers
          activeModifiers: [],
          addModifier: (modifier: ModCard) =>
            set((state) => ({
              activeModifiers: [...state.activeModifiers, modifier],
            })),
          removeModifier: (modifierId: string) =>
            set((state) => ({
              activeModifiers: state.activeModifiers.filter((m) => m.id !== modifierId),
            })),
          clearModifiers: () => set({ activeModifiers: [] }),

          // Cooldowns
          cooldowns: initialCooldowns,
          startCooldown: (ability: keyof CooldownState, duration: number) =>
            set((state) => ({
              cooldowns: {
                ...state.cooldowns,
                [ability]: duration,
              },
            })),
          updateCooldowns: (delta: number) =>
            set((state) => ({
              cooldowns: {
                tap: Math.max(0, state.cooldowns.tap - delta),
                doubleTap: Math.max(0, state.cooldowns.doubleTap - delta),
                longPress: Math.max(0, state.cooldowns.longPress - delta),
                pulse: Math.max(0, state.cooldowns.pulse - delta),
                brake: Math.max(0, state.cooldowns.brake - delta),
                vectorField: Math.max(0, state.cooldowns.vectorField - delta),
              },
            })),
          isCooldownReady: (ability: keyof CooldownState) => get().cooldowns[ability] <= 0,

          // Orb state
          orb: initialOrbState,
          updateOrbState: (orbUpdate: Partial<OrbState>) =>
            set((state) => ({
              orb: { ...state.orb, ...orbUpdate },
            })),

          // Physics sync
          syncPhysicsState: () => {
            // This is called from the physics loop to sync state
          },

          // Start game
          startGame: () =>
            set({
              phase: 'playing',
              isPaused: false,
              shardsCollected: 0,
              collectedShardIds: new Set<string>(),
              health: 100,
            }),

          // Full reset
          resetGame: () =>
            set((state) => {
              state.resetRun();
              state.resetInput();
              state.resetUI();
              state.resetTelemetry();
              return {
                gameState: 'MENU',
                phase: 'menu',
                isPaused: false,
                activeModifiers: [],
                cooldowns: initialCooldowns,
                orb: initialOrbState,
                overclockEnabled: false,
                shardsCollected: 0,
                collectedShardIds: new Set<string>(),
                health: 100,
                tiltX: 0,
                tiltY: 0,
              };
            }),
        }),
        {
          name: 'tilt-rift-game-store',
          partialize: (state) => ({
            settings: state.settings,
          }),
        }
      )
    ),
    { name: 'TiltRift' }
  )
);

// Subscribe to game state changes
useGameStore.subscribe(
  (state) => state.gameState,
  (gameState, previousGameState) => {
    console.log(`Game state changed: ${previousGameState} -> ${gameState}`);
  }
);
