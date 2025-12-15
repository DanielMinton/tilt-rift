import { StateCreator } from 'zustand';
import { TelemetryState } from '../../types';

export interface TelemetrySlice {
  telemetry: TelemetryState;
  updateFPS: (fps: number) => void;
  updateFrameTime: (time: number) => void;
  updatePhysicsTime: (time: number) => void;
  updateRenderStats: (drawCalls: number, triangles: number) => void;
  updateParticleCount: (count: number) => void;
  resetTelemetry: () => void;
}

const initialTelemetryState: TelemetryState = {
  fps: 60,
  avgFps: 60,
  minFps: 60,
  frameTime: 16.67,
  physicsTime: 0,
  drawCalls: 0,
  triangles: 0,
  particleCount: 0,
};

const FPS_SAMPLE_SIZE = 60;
const fpsSamples: number[] = [];

export const createTelemetrySlice: StateCreator<TelemetrySlice> = (set) => ({
  telemetry: initialTelemetryState,

  updateFPS: (fps: number) =>
    set((state) => {
      fpsSamples.push(fps);
      if (fpsSamples.length > FPS_SAMPLE_SIZE) {
        fpsSamples.shift();
      }

      const avgFps = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
      const minFps = Math.min(...fpsSamples);

      return {
        telemetry: {
          ...state.telemetry,
          fps,
          avgFps: Math.round(avgFps),
          minFps: Math.round(minFps),
        },
      };
    }),

  updateFrameTime: (time: number) =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        frameTime: time,
      },
    })),

  updatePhysicsTime: (time: number) =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        physicsTime: time,
      },
    })),

  updateRenderStats: (drawCalls: number, triangles: number) =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        drawCalls,
        triangles,
      },
    })),

  updateParticleCount: (count: number) =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        particleCount: count,
      },
    })),

  resetTelemetry: () => {
    fpsSamples.length = 0;
    set(() => ({
      telemetry: initialTelemetryState,
    }));
  },
});
