'use client';

// Procedural Audio Synthesizer using Web Audio API
// Generates all sounds in code - no external audio files needed

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isInitialized = false;

// Initialize audio context (must be called after user interaction)
export function initAudio(): boolean {
  if (isInitialized && audioContext) return true;

  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = 0.5;
    isInitialized = true;
    return true;
  } catch (e) {
    console.warn('Web Audio API not supported:', e);
    return false;
  }
}

export function getAudioContext(): AudioContext | null {
  return audioContext;
}

export function setMasterVolume(volume: number): void {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }
}

// Resume audio context (needed for mobile)
export async function resumeAudio(): Promise<void> {
  if (audioContext && audioContext.state === 'suspended') {
    await audioContext.resume();
  }
}

// Create a simple oscillator with envelope
function createTone(
  frequency: number,
  type: OscillatorType = 'sine',
  duration: number = 0.5,
  volume: number = 0.3
): void {
  if (!audioContext || !masterGain) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

// === SOUND EFFECTS ===

// Crystalline chime for shard collection
export function playShardCollect(): void {
  if (!audioContext || !masterGain) return;

  const now = audioContext.currentTime;
  const frequencies = [880, 1108.73, 1318.51, 1760]; // A5, C#6, E6, A6 (A major)

  frequencies.forEach((freq, i) => {
    const osc = audioContext!.createOscillator();
    const gain = audioContext!.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(masterGain!);

    const startTime = now + i * 0.03;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

    osc.start(startTime);
    osc.stop(startTime + 0.5);
  });
}

// Hazard hit - warning buzz
export function playHazardHit(): void {
  if (!audioContext || !masterGain) return;

  const now = audioContext.currentTime;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

  osc.connect(gain);
  gain.connect(masterGain);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.start(now);
  osc.stop(now + 0.3);
}

// Victory - ascending arpeggio
export function playVictory(): void {
  if (!audioContext || !masterGain) return;

  const now = audioContext.currentTime;
  const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

  notes.forEach((freq, i) => {
    const osc = audioContext!.createOscillator();
    const gain = audioContext!.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(masterGain!);

    const startTime = now + i * 0.15;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
    gain.gain.setValueAtTime(0.25, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

    osc.start(startTime);
    osc.stop(startTime + 0.5);
  });
}

// Game over - descending tone
export function playGameOver(): void {
  if (!audioContext || !masterGain) return;

  const now = audioContext.currentTime;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 1);

  osc.connect(gain);
  gain.connect(masterGain);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
  gain.gain.setValueAtTime(0.2, now + 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

  osc.start(now);
  osc.stop(now + 1.2);
}

// UI click
export function playUIClick(): void {
  if (!audioContext || !masterGain) return;

  const now = audioContext.currentTime;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.value = 600;

  osc.connect(gain);
  gain.connect(masterGain);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.start(now);
  osc.stop(now + 0.1);
}

// === ROLLING SOUND ===
let rollOscillator: OscillatorNode | null = null;
let rollGain: GainNode | null = null;
let rollFilter: BiquadFilterNode | null = null;
let noiseSource: AudioBufferSourceNode | null = null;

export function startRollingSound(): void {
  if (!audioContext || !masterGain || rollGain) return;

  // Create noise for rolling texture
  const bufferSize = audioContext.sampleRate * 2;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  rollFilter = audioContext.createBiquadFilter();
  rollFilter.type = 'bandpass';
  rollFilter.frequency.value = 200;
  rollFilter.Q.value = 1;

  rollGain = audioContext.createGain();
  rollGain.gain.value = 0;

  noiseSource.connect(rollFilter);
  rollFilter.connect(rollGain);
  rollGain.connect(masterGain);

  noiseSource.start();
}

export function updateRollingSound(speed: number): void {
  if (!rollGain || !rollFilter) return;

  const normalizedSpeed = Math.min(speed / 10, 1);

  // Volume based on speed
  rollGain.gain.value = normalizedSpeed * 0.15;

  // Higher pitch at higher speeds
  rollFilter.frequency.value = 150 + normalizedSpeed * 400;
}

export function stopRollingSound(): void {
  if (noiseSource) {
    noiseSource.stop();
    noiseSource = null;
  }
  if (rollGain) {
    rollGain.disconnect();
    rollGain = null;
  }
  if (rollFilter) {
    rollFilter.disconnect();
    rollFilter = null;
  }
}

// Cleanup
export function disposeAudio(): void {
  stopRollingSound();
  if (audioContext) {
    audioContext.close();
    audioContext = null;
    masterGain = null;
    isInitialized = false;
  }
}
