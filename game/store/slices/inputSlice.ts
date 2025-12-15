import { StateCreator } from 'zustand';
import { InputState, GestureType, Vector3Data } from '../../types';

export interface InputSlice {
  input: InputState;
  setGravity: (gravity: Vector3Data) => void;
  setTouchActive: (active: boolean) => void;
  setLastGesture: (gesture: GestureType | null) => void;
  setCalibrationOffset: (offset: Vector3Data) => void;
  setKeyboardInput: (input: Vector3Data) => void;
  setMousePosition: (position: { x: number; y: number }) => void;
  setMouseDown: (down: boolean) => void;
  resetInput: () => void;
}

const initialInputState: InputState = {
  gravity: { x: 0, y: -9.8, z: 0 },
  touchActive: false,
  lastGesture: null,
  gestureTimestamp: 0,
  calibrationOffset: { x: 0, y: 0, z: 0 },
  keyboardInput: { x: 0, y: 0, z: 0 },
  mousePosition: { x: 0, y: 0 },
  mouseDown: false,
};

export const createInputSlice: StateCreator<InputSlice> = (set) => ({
  input: initialInputState,

  setGravity: (gravity: Vector3Data) =>
    set((state) => ({
      input: {
        ...state.input,
        gravity,
      },
    })),

  setTouchActive: (active: boolean) =>
    set((state) => ({
      input: {
        ...state.input,
        touchActive: active,
      },
    })),

  setLastGesture: (gesture: GestureType | null) =>
    set((state) => ({
      input: {
        ...state.input,
        lastGesture: gesture,
        gestureTimestamp: gesture ? performance.now() : state.input.gestureTimestamp,
      },
    })),

  setCalibrationOffset: (offset: Vector3Data) =>
    set((state) => ({
      input: {
        ...state.input,
        calibrationOffset: offset,
      },
    })),

  setKeyboardInput: (input: Vector3Data) =>
    set((state) => ({
      input: {
        ...state.input,
        keyboardInput: input,
      },
    })),

  setMousePosition: (position: { x: number; y: number }) =>
    set((state) => ({
      input: {
        ...state.input,
        mousePosition: position,
      },
    })),

  setMouseDown: (down: boolean) =>
    set((state) => ({
      input: {
        ...state.input,
        mouseDown: down,
      },
    })),

  resetInput: () =>
    set(() => ({
      input: initialInputState,
    })),
});
