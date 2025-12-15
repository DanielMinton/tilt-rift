import { StateCreator } from 'zustand';
import { UIState } from '../../types';

export interface UISlice {
  ui: UIState;
  showPauseOverlay: () => void;
  hidePauseOverlay: () => void;
  showSettingsOverlay: () => void;
  hideSettingsOverlay: () => void;
  showTutorialOverlay: () => void;
  hideTutorialOverlay: () => void;
  setTutorialStep: (step: number) => void;
  showResultsOverlay: () => void;
  hideResultsOverlay: () => void;
  showCrossPlatformPrompt: () => void;
  hideCrossPlatformPrompt: () => void;
  setCurrentPanel: (panel: UIState['currentPanel']) => void;
  resetUI: () => void;
}

const initialUIState: UIState = {
  showPause: false,
  showSettings: false,
  showTutorial: false,
  showResults: false,
  showCrossPlatformPrompt: false,
  tutorialStep: 0,
  currentPanel: null,
};

export const createUISlice: StateCreator<UISlice> = (set) => ({
  ui: initialUIState,

  showPauseOverlay: () =>
    set((state) => ({
      ui: { ...state.ui, showPause: true },
    })),

  hidePauseOverlay: () =>
    set((state) => ({
      ui: { ...state.ui, showPause: false },
    })),

  showSettingsOverlay: () =>
    set((state) => ({
      ui: { ...state.ui, showSettings: true },
    })),

  hideSettingsOverlay: () =>
    set((state) => ({
      ui: { ...state.ui, showSettings: false },
    })),

  showTutorialOverlay: () =>
    set((state) => ({
      ui: { ...state.ui, showTutorial: true, tutorialStep: 0 },
    })),

  hideTutorialOverlay: () =>
    set((state) => ({
      ui: { ...state.ui, showTutorial: false },
    })),

  setTutorialStep: (step: number) =>
    set((state) => ({
      ui: { ...state.ui, tutorialStep: step },
    })),

  showResultsOverlay: () =>
    set((state) => ({
      ui: { ...state.ui, showResults: true },
    })),

  hideResultsOverlay: () =>
    set((state) => ({
      ui: { ...state.ui, showResults: false },
    })),

  showCrossPlatformPrompt: () =>
    set((state) => ({
      ui: { ...state.ui, showCrossPlatformPrompt: true },
    })),

  hideCrossPlatformPrompt: () =>
    set((state) => ({
      ui: { ...state.ui, showCrossPlatformPrompt: false },
    })),

  setCurrentPanel: (panel: UIState['currentPanel']) =>
    set((state) => ({
      ui: { ...state.ui, currentPanel: panel },
    })),

  resetUI: () =>
    set(() => ({
      ui: initialUIState,
    })),
});
