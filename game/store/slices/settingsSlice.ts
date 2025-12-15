import { StateCreator } from 'zustand';
import { SettingsState } from '../../types';
import { saveSettings, loadSettings } from '../../state/persistence';

export interface SettingsSlice {
  settings: SettingsState;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setTiltSensitivity: (sensitivity: number) => void;
  setInvertTiltX: (invert: boolean) => void;
  setInvertTiltY: (invert: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setHighContrast: (high: boolean) => void;
  setColorblindMode: (mode: SettingsState['colorblindMode']) => void;
  setShowFPS: (show: boolean) => void;
  setShowTelemetry: (show: boolean) => void;
  loadSettingsFromStorage: () => void;
  resetSettings: () => void;
}

const defaultSettings: SettingsState = {
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

export const createSettingsSlice: StateCreator<SettingsSlice> = (set, get) => ({
  settings: defaultSettings,

  setMasterVolume: (volume: number) =>
    set((state) => {
      const newSettings = { ...state.settings, masterVolume: Math.max(0, Math.min(1, volume)) };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setMusicVolume: (volume: number) =>
    set((state) => {
      const newSettings = { ...state.settings, musicVolume: Math.max(0, Math.min(1, volume)) };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setSfxVolume: (volume: number) =>
    set((state) => {
      const newSettings = { ...state.settings, sfxVolume: Math.max(0, Math.min(1, volume)) };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setTiltSensitivity: (sensitivity: number) =>
    set((state) => {
      const newSettings = { ...state.settings, tiltSensitivity: Math.max(0.5, Math.min(2, sensitivity)) };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setInvertTiltX: (invert: boolean) =>
    set((state) => {
      const newSettings = { ...state.settings, invertTiltX: invert };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setInvertTiltY: (invert: boolean) =>
    set((state) => {
      const newSettings = { ...state.settings, invertTiltY: invert };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setReducedMotion: (reduced: boolean) =>
    set((state) => {
      const newSettings = { ...state.settings, reducedMotion: reduced };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setHighContrast: (high: boolean) =>
    set((state) => {
      const newSettings = { ...state.settings, highContrast: high };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setColorblindMode: (mode: SettingsState['colorblindMode']) =>
    set((state) => {
      const newSettings = { ...state.settings, colorblindMode: mode };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setShowFPS: (show: boolean) =>
    set((state) => {
      const newSettings = { ...state.settings, showFPS: show };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setShowTelemetry: (show: boolean) =>
    set((state) => {
      const newSettings = { ...state.settings, showTelemetry: show };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  loadSettingsFromStorage: () =>
    set(() => ({
      settings: loadSettings(),
    })),

  resetSettings: () =>
    set(() => {
      saveSettings(defaultSettings);
      return { settings: defaultSettings };
    }),
});
