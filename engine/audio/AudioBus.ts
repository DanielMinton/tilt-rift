import { Howl, Howler } from 'howler';

export interface AudioBusConfig {
  volume: number;
  parent?: string;
}

export const AUDIO_BUSES: Record<string, AudioBusConfig> = {
  MASTER: { volume: 1.0 },
  MUSIC: { volume: 0.7, parent: 'MASTER' },
  SFX: { volume: 0.8, parent: 'MASTER' },
  AMBIENT: { volume: 0.5, parent: 'MASTER' },
  UI: { volume: 0.6, parent: 'MASTER' },
};

class AudioBusManager {
  private volumes: Map<string, number> = new Map();
  private sounds: Map<string, Howl> = new Map();

  constructor() {
    // Initialize bus volumes
    Object.entries(AUDIO_BUSES).forEach(([name, config]) => {
      this.volumes.set(name, config.volume);
    });
  }

  getEffectiveVolume(busName: string): number {
    const config = AUDIO_BUSES[busName];
    if (!config) return 1.0;

    let volume = this.volumes.get(busName) || config.volume;

    if (config.parent) {
      volume *= this.getEffectiveVolume(config.parent);
    }

    return volume;
  }

  setBusVolume(busName: string, volume: number): void {
    this.volumes.set(busName, Math.max(0, Math.min(1, volume)));

    // Update all sounds on this bus
    this.sounds.forEach((sound, id) => {
      const soundBus = id.split(':')[0];
      if (soundBus === busName) {
        sound.volume(this.getEffectiveVolume(busName));
      }
    });
  }

  getBusVolume(busName: string): number {
    return this.volumes.get(busName) || AUDIO_BUSES[busName]?.volume || 1.0;
  }

  registerSound(id: string, sound: Howl): void {
    this.sounds.set(id, sound);
  }

  unregisterSound(id: string): void {
    this.sounds.delete(id);
  }

  setMasterVolume(volume: number): void {
    this.setBusVolume('MASTER', volume);
    Howler.volume(volume);
  }

  getMasterVolume(): number {
    return this.getBusVolume('MASTER');
  }

  muteAll(): void {
    Howler.mute(true);
  }

  unmuteAll(): void {
    Howler.mute(false);
  }

  stopAll(): void {
    Howler.stop();
  }

  pauseAll(): void {
    this.sounds.forEach((sound) => sound.pause());
  }

  resumeAll(): void {
    this.sounds.forEach((sound) => sound.play());
  }
}

export const audioBus = new AudioBusManager();

export function setMasterVolume(volume: number): void {
  audioBus.setMasterVolume(volume);
}

export function setMusicVolume(volume: number): void {
  audioBus.setBusVolume('MUSIC', volume);
}

export function setSfxVolume(volume: number): void {
  audioBus.setBusVolume('SFX', volume);
}

export function setAmbientVolume(volume: number): void {
  audioBus.setBusVolume('AMBIENT', volume);
}
