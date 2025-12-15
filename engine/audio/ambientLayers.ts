'use client';

// Layered Ambient Drone System
// Creates an evolving soundscape that builds as player progresses through the course

import { getAudioContext, initAudio } from './procedural';

interface AmbientLayer {
  oscillators: OscillatorNode[];
  gains: GainNode[];
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
}

let masterGain: GainNode | null = null;
let layer1: AmbientLayer | null = null;
let layer2: AmbientLayer | null = null;
let layer3: AmbientLayer | null = null;
let isPlaying = false;

// Layer volumes (0-1)
let layer1Volume = 0;
let layer2Volume = 0;
let layer3Volume = 0;
const fadeSpeed = 0.02; // Per frame

// === LAYER 1: Deep bass drone (always playing) ===
function createLayer1(ctx: AudioContext, master: GainNode): AmbientLayer {
  // Base frequency: A1 (55Hz)
  const frequencies = [55, 55 * 1.5, 55 * 2]; // A1, E2, A2

  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    // Slight detuning for warmth
    if (i > 0) {
      osc.detune.value = Math.random() * 10 - 5;
    }

    osc.connect(gain);
    gain.connect(master);
    gain.gain.value = i === 0 ? 0.12 : 0.06;

    oscillators.push(osc);
    gains.push(gain);
  });

  // LFO for subtle movement
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.1; // Very slow
  lfoGain.gain.value = 3; // Subtle pitch variation

  lfo.connect(lfoGain);
  lfoGain.connect(oscillators[0].frequency);

  return { oscillators, gains, lfo, lfoGain };
}

// === LAYER 2: Mid-range pad (fades in at 33% progress) ===
function createLayer2(ctx: AudioContext, master: GainNode): AmbientLayer {
  // A minor chord: A2, C3, E3
  const frequencies = [110, 130.81, 164.81];

  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;
    osc.detune.value = Math.random() * 8 - 4;

    osc.connect(gain);
    gain.connect(master);
    gain.gain.value = 0.08;

    oscillators.push(osc);
    gains.push(gain);
  });

  // Chorus effect via detuned copy
  const chorusOsc = ctx.createOscillator();
  const chorusGain = ctx.createGain();
  chorusOsc.type = 'triangle';
  chorusOsc.frequency.value = frequencies[0];
  chorusOsc.detune.value = 12;
  chorusOsc.connect(chorusGain);
  chorusGain.connect(master);
  chorusGain.gain.value = 0.04;
  oscillators.push(chorusOsc);
  gains.push(chorusGain);

  return { oscillators, gains };
}

// === LAYER 3: High shimmer (fades in at 66% progress) ===
function createLayer3(ctx: AudioContext, master: GainNode): AmbientLayer {
  // High harmonics: A4, C#5
  const frequencies = [440, 554.37];

  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(master);
    gain.gain.value = 0.05;

    oscillators.push(osc);
    gains.push(gain);
  });

  // Tremolo LFO
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 3; // Gentle tremolo
  lfoGain.gain.value = 0.02;

  lfo.connect(lfoGain);
  gains.forEach((g) => lfoGain.connect(g.gain));

  return { oscillators, gains, lfo, lfoGain };
}

// Start ambient music
export function startAmbient(): void {
  if (isPlaying) return;

  const ctx = getAudioContext();
  if (!ctx) {
    initAudio();
    const newCtx = getAudioContext();
    if (!newCtx) return;
    startAmbientWithContext(newCtx);
  } else {
    startAmbientWithContext(ctx);
  }
}

function startAmbientWithContext(ctx: AudioContext): void {
  // Master gain for all ambient layers
  masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = 0.4;

  // Create layers
  layer1 = createLayer1(ctx, masterGain);
  layer2 = createLayer2(ctx, masterGain);
  layer3 = createLayer3(ctx, masterGain);

  // Start all oscillators
  const now = ctx.currentTime;

  layer1.oscillators.forEach((osc) => osc.start(now));
  layer1.lfo?.start(now);

  layer2.oscillators.forEach((osc) => osc.start(now));

  layer3.oscillators.forEach((osc) => osc.start(now));
  layer3.lfo?.start(now);

  // Initially only layer 1 is audible
  setLayerVolumes(1, 0, 0);

  isPlaying = true;
}

// Set individual layer volumes (0-1)
function setLayerVolumes(l1: number, l2: number, l3: number): void {
  if (layer1) {
    layer1.gains.forEach((g, i) => {
      const baseVol = i === 0 ? 0.12 : 0.06;
      g.gain.value = baseVol * l1;
    });
  }
  if (layer2) {
    layer2.gains.forEach((g, i) => {
      const baseVol = i < 3 ? 0.08 : 0.04;
      g.gain.value = baseVol * l2;
    });
  }
  if (layer3) {
    layer3.gains.forEach((g) => {
      g.gain.value = 0.05 * l3;
    });
  }
}

// Update layers based on course progress (0-1)
export function updateAmbientProgress(progress: number): void {
  if (!isPlaying) return;

  // Layer 1: Always on (but increases slightly)
  const targetL1 = 0.7 + progress * 0.3;

  // Layer 2: Fades in from 20% to 50%
  let targetL2 = 0;
  if (progress > 0.2) {
    targetL2 = Math.min(1, (progress - 0.2) / 0.3);
  }

  // Layer 3: Fades in from 50% to 80%
  let targetL3 = 0;
  if (progress > 0.5) {
    targetL3 = Math.min(1, (progress - 0.5) / 0.3);
  }

  // Smooth interpolation
  layer1Volume += (targetL1 - layer1Volume) * fadeSpeed;
  layer2Volume += (targetL2 - layer2Volume) * fadeSpeed;
  layer3Volume += (targetL3 - layer3Volume) * fadeSpeed;

  setLayerVolumes(layer1Volume, layer2Volume, layer3Volume);
}

// Stop ambient music
export function stopAmbient(): void {
  if (!isPlaying) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const fadeTime = 1;
  const now = ctx.currentTime;

  // Fade out master
  if (masterGain) {
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + fadeTime);
  }

  // Schedule cleanup
  setTimeout(() => {
    layer1?.oscillators.forEach((osc) => {
      try { osc.stop(); } catch (e) {}
    });
    layer1?.lfo?.stop();

    layer2?.oscillators.forEach((osc) => {
      try { osc.stop(); } catch (e) {}
    });

    layer3?.oscillators.forEach((osc) => {
      try { osc.stop(); } catch (e) {}
    });
    layer3?.lfo?.stop();

    layer1 = null;
    layer2 = null;
    layer3 = null;
    masterGain = null;
    isPlaying = false;
  }, fadeTime * 1000 + 100);
}

// Set master volume for ambient
export function setAmbientVolume(volume: number): void {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, volume)) * 0.4;
  }
}

// Check if ambient is playing
export function isAmbientPlaying(): boolean {
  return isPlaying;
}
