import { Howl } from 'howler';

type SFXName =
  | 'shardCollect'
  | 'impact'
  | 'checkpoint'
  | 'victory'
  | 'gameOver'
  | 'menuSelect'
  | 'menuHover'
  | 'pulse'
  | 'brake'
  | 'damage';

interface SFXConfig {
  src: string[];
  volume: number;
  rate?: number;
}

const SFX_CONFIG: Record<SFXName, SFXConfig> = {
  shardCollect: {
    src: ['/audio/sfx/shard-collect.webm', '/audio/sfx/shard-collect.mp3'],
    volume: 0.6,
    rate: 1.0,
  },
  impact: {
    src: ['/audio/sfx/impact.webm', '/audio/sfx/impact.mp3'],
    volume: 0.5,
  },
  checkpoint: {
    src: ['/audio/sfx/checkpoint.webm', '/audio/sfx/checkpoint.mp3'],
    volume: 0.7,
  },
  victory: {
    src: ['/audio/sfx/victory.webm', '/audio/sfx/victory.mp3'],
    volume: 0.8,
  },
  gameOver: {
    src: ['/audio/sfx/game-over.webm', '/audio/sfx/game-over.mp3'],
    volume: 0.7,
  },
  menuSelect: {
    src: ['/audio/sfx/menu-select.webm', '/audio/sfx/menu-select.mp3'],
    volume: 0.5,
  },
  menuHover: {
    src: ['/audio/sfx/menu-hover.webm', '/audio/sfx/menu-hover.mp3'],
    volume: 0.3,
  },
  pulse: {
    src: ['/audio/sfx/pulse.webm', '/audio/sfx/pulse.mp3'],
    volume: 0.6,
  },
  brake: {
    src: ['/audio/sfx/brake.webm', '/audio/sfx/brake.mp3'],
    volume: 0.5,
  },
  damage: {
    src: ['/audio/sfx/damage.webm', '/audio/sfx/damage.mp3'],
    volume: 0.6,
  },
};

class SFXManager {
  private sounds: Map<SFXName, Howl> = new Map();
  private enabled: boolean = true;
  private masterVolume: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.preload();
    }
  }

  private preload(): void {
    // Preload sounds lazily on first interaction
    Object.entries(SFX_CONFIG).forEach(([name, config]) => {
      const sound = new Howl({
        src: config.src,
        volume: config.volume * this.masterVolume,
        rate: config.rate || 1.0,
        preload: false,
      });
      this.sounds.set(name as SFXName, sound);
    });
  }

  play(name: SFXName, options?: { volume?: number; rate?: number }): number | undefined {
    if (!this.enabled) return undefined;

    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`SFX not found: ${name}`);
      return undefined;
    }

    // Load if not loaded
    if (sound.state() === 'unloaded') {
      sound.load();
    }

    const config = SFX_CONFIG[name];
    const volume = (options?.volume ?? config.volume) * this.masterVolume;
    const rate = options?.rate ?? config.rate ?? 1.0;

    sound.volume(volume);
    sound.rate(rate);

    return sound.play();
  }

  stop(name: SFXName): void {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.stop();
    }
  }

  stopAll(): void {
    this.sounds.forEach((sound) => sound.stop());
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound, name) => {
      const config = SFX_CONFIG[name];
      sound.volume(config.volume * this.masterVolume);
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const sfx = new SFXManager();
export default sfx;
