import { Howl, Howler } from 'howler';
import { Vector3Data } from '@/game/types';

interface SpatialSoundConfig {
  position: Vector3Data;
  maxDistance?: number;
  refDistance?: number;
  rolloffFactor?: number;
}

class SpatialAudioManager {
  private listenerPosition: Vector3Data = { x: 0, y: 0, z: 0 };
  private spatialSounds: Map<number, { sound: Howl; config: SpatialSoundConfig }> = new Map();

  setListenerPosition(position: Vector3Data): void {
    this.listenerPosition = position;

    // Update Howler's listener position (for future Web Audio integration)
    Howler.pos(position.x, position.y, position.z);

    // Update all spatial sounds
    this.updateAllVolumes();
  }

  private calculateVolume(soundPosition: Vector3Data, config: SpatialSoundConfig): number {
    const maxDistance = config.maxDistance || 50;
    const refDistance = config.refDistance || 1;
    const rolloffFactor = config.rolloffFactor || 1;

    const dx = soundPosition.x - this.listenerPosition.x;
    const dy = soundPosition.y - this.listenerPosition.y;
    const dz = soundPosition.z - this.listenerPosition.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance <= refDistance) {
      return 1;
    }

    if (distance >= maxDistance) {
      return 0;
    }

    // Linear rolloff
    const normalizedDistance = (distance - refDistance) / (maxDistance - refDistance);
    return Math.max(0, 1 - normalizedDistance * rolloffFactor);
  }

  private calculatePan(soundPosition: Vector3Data): number {
    const dx = soundPosition.x - this.listenerPosition.x;
    // Simple left-right panning based on x offset
    return Math.max(-1, Math.min(1, dx / 10));
  }

  private updateAllVolumes(): void {
    this.spatialSounds.forEach(({ sound, config }, soundId) => {
      const volume = this.calculateVolume(config.position, config);
      const pan = this.calculatePan(config.position);

      sound.volume(volume, soundId);
      sound.stereo(pan, soundId);
    });
  }

  playSpatial(
    soundId: string,
    sound: Howl,
    config: SpatialSoundConfig
  ): number {
    const id = sound.play(soundId);

    if (id === undefined) return -1;

    this.spatialSounds.set(id, { sound, config });

    // Initial volume and pan calculation
    const volume = this.calculateVolume(config.position, config);
    const pan = this.calculatePan(config.position);

    sound.volume(volume, id);
    sound.stereo(pan, id);

    // Clean up when sound ends
    sound.once('end', () => {
      this.spatialSounds.delete(id);
    }, id);

    return id;
  }

  updateSoundPosition(soundId: number, position: Vector3Data): void {
    const entry = this.spatialSounds.get(soundId);
    if (!entry) return;

    entry.config.position = position;

    const volume = this.calculateVolume(position, entry.config);
    const pan = this.calculatePan(position);

    entry.sound.volume(volume, soundId);
    entry.sound.stereo(pan, soundId);
  }

  stopSpatial(soundId: number): void {
    const entry = this.spatialSounds.get(soundId);
    if (entry) {
      entry.sound.stop(soundId);
      this.spatialSounds.delete(soundId);
    }
  }

  stopAll(): void {
    this.spatialSounds.forEach(({ sound }, soundId) => {
      sound.stop(soundId);
    });
    this.spatialSounds.clear();
  }

  getListenerPosition(): Vector3Data {
    return { ...this.listenerPosition };
  }
}

export const spatialAudio = new SpatialAudioManager();

// Convenience functions
export function setListenerPosition(position: Vector3Data): void {
  spatialAudio.setListenerPosition(position);
}

export function playSpatialSound(
  soundId: string,
  sound: Howl,
  position: Vector3Data,
  options?: {
    maxDistance?: number;
    refDistance?: number;
    rolloffFactor?: number;
  }
): number {
  return spatialAudio.playSpatial(soundId, sound, {
    position,
    ...options,
  });
}

export function updateSoundPosition(soundId: number, position: Vector3Data): void {
  spatialAudio.updateSoundPosition(soundId, position);
}

export function stopSpatialSound(soundId: number): void {
  spatialAudio.stopSpatial(soundId);
}
