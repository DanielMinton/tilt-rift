import { Howl } from 'howler';
import { audioBus } from './AudioBus';

export interface SoundSprite {
  id: string;
  src: string[];
  volume: number;
  bus: string;
  loop?: boolean;
  sprite?: Record<string, [number, number]>;
}

// Sound effect definitions
export const SFX_SPRITES: Record<string, SoundSprite> = {
  // Player movement
  ROLL: {
    id: 'roll',
    src: ['/audio/sfx/roll.ogg', '/audio/sfx/roll.mp3'],
    volume: 0.5,
    bus: 'SFX',
    loop: true,
  },
  AIR_WHOOSH: {
    id: 'air-whoosh',
    src: ['/audio/sfx/whoosh.ogg', '/audio/sfx/whoosh.mp3'],
    volume: 0.4,
    bus: 'SFX',
  },
  GRAVITY_SHIFT: {
    id: 'gravity-shift',
    src: ['/audio/sfx/gravity.ogg', '/audio/sfx/gravity.mp3'],
    volume: 0.5,
    bus: 'SFX',
  },
  FIELD_DEPLOY: {
    id: 'field-deploy',
    src: ['/audio/sfx/deploy.ogg', '/audio/sfx/deploy.mp3'],
    volume: 0.6,
    bus: 'SFX',
  },

  // Collisions
  IMPACT_LIGHT: {
    id: 'impact-light',
    src: ['/audio/sfx/tap.ogg', '/audio/sfx/tap.mp3'],
    volume: 0.3,
    bus: 'SFX',
  },
  IMPACT_MEDIUM: {
    id: 'impact-medium',
    src: ['/audio/sfx/thud.ogg', '/audio/sfx/thud.mp3'],
    volume: 0.5,
    bus: 'SFX',
  },
  IMPACT_HEAVY: {
    id: 'impact-heavy',
    src: ['/audio/sfx/slam.ogg', '/audio/sfx/slam.mp3'],
    volume: 0.7,
    bus: 'SFX',
  },
  BUMPER_BOING: {
    id: 'bumper',
    src: ['/audio/sfx/boing.ogg', '/audio/sfx/boing.mp3'],
    volume: 0.6,
    bus: 'SFX',
  },
  HAZARD_ZAP: {
    id: 'hazard-zap',
    src: ['/audio/sfx/zap.ogg', '/audio/sfx/zap.mp3'],
    volume: 0.5,
    bus: 'SFX',
  },

  // Pickups
  SHARD_PICKUP: {
    id: 'shard-pickup',
    src: ['/audio/sfx/pickup.ogg', '/audio/sfx/pickup.mp3'],
    volume: 0.6,
    bus: 'SFX',
  },
  COMBO_UP: {
    id: 'combo-up',
    src: ['/audio/sfx/combo.ogg', '/audio/sfx/combo.mp3'],
    volume: 0.5,
    bus: 'SFX',
  },

  // UI
  BUTTON_CLICK: {
    id: 'button-click',
    src: ['/audio/sfx/click.ogg', '/audio/sfx/click.mp3'],
    volume: 0.4,
    bus: 'UI',
  },
  PANEL_OPEN: {
    id: 'panel-open',
    src: ['/audio/sfx/slide.ogg', '/audio/sfx/slide.mp3'],
    volume: 0.3,
    bus: 'UI',
  },
  CONFIRM: {
    id: 'confirm',
    src: ['/audio/sfx/confirm.ogg', '/audio/sfx/confirm.mp3'],
    volume: 0.5,
    bus: 'UI',
  },
  ERROR: {
    id: 'error',
    src: ['/audio/sfx/error.ogg', '/audio/sfx/error.mp3'],
    volume: 0.4,
    bus: 'UI',
  },

  // Stingers
  VICTORY: {
    id: 'victory',
    src: ['/audio/sfx/victory.ogg', '/audio/sfx/victory.mp3'],
    volume: 0.8,
    bus: 'SFX',
  },
  DEFEAT: {
    id: 'defeat',
    src: ['/audio/sfx/defeat.ogg', '/audio/sfx/defeat.mp3'],
    volume: 0.6,
    bus: 'SFX',
  },
  COUNTDOWN: {
    id: 'countdown',
    src: ['/audio/sfx/countdown.ogg', '/audio/sfx/countdown.mp3'],
    volume: 0.5,
    bus: 'SFX',
  },
};

class SoundManager {
  private sounds: Map<string, Howl> = new Map();
  private loadedSprites: Set<string> = new Set();

  preload(sprites: SoundSprite[]): Promise<void> {
    return new Promise((resolve) => {
      let loaded = 0;
      const total = sprites.length;

      if (total === 0) {
        resolve();
        return;
      }

      sprites.forEach((sprite) => {
        if (this.loadedSprites.has(sprite.id)) {
          loaded++;
          if (loaded === total) resolve();
          return;
        }

        const sound = new Howl({
          src: sprite.src,
          volume: sprite.volume * audioBus.getEffectiveVolume(sprite.bus),
          loop: sprite.loop || false,
          sprite: sprite.sprite,
          onload: () => {
            this.loadedSprites.add(sprite.id);
            audioBus.registerSound(`${sprite.bus}:${sprite.id}`, sound);
            loaded++;
            if (loaded === total) resolve();
          },
          onloaderror: (_id, error) => {
            console.warn(`Failed to load sound ${sprite.id}:`, error);
            loaded++;
            if (loaded === total) resolve();
          },
        });

        this.sounds.set(sprite.id, sound);
      });
    });
  }

  play(id: string, options?: { volume?: number; rate?: number }): number | undefined {
    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`Sound not found: ${id}`);
      return undefined;
    }

    const soundId = sound.play();

    if (options?.volume !== undefined) {
      sound.volume(options.volume, soundId);
    }

    if (options?.rate !== undefined) {
      sound.rate(options.rate, soundId);
    }

    return soundId;
  }

  stop(id: string, soundId?: number): void {
    const sound = this.sounds.get(id);
    if (sound) {
      if (soundId !== undefined) {
        sound.stop(soundId);
      } else {
        sound.stop();
      }
    }
  }

  setVolume(id: string, volume: number, soundId?: number): void {
    const sound = this.sounds.get(id);
    if (sound) {
      if (soundId !== undefined) {
        sound.volume(volume, soundId);
      } else {
        sound.volume(volume);
      }
    }
  }

  setRate(id: string, rate: number, soundId?: number): void {
    const sound = this.sounds.get(id);
    if (sound) {
      if (soundId !== undefined) {
        sound.rate(rate, soundId);
      } else {
        sound.rate(rate);
      }
    }
  }

  isPlaying(id: string): boolean {
    const sound = this.sounds.get(id);
    return sound?.playing() || false;
  }

  unloadAll(): void {
    this.sounds.forEach((sound) => sound.unload());
    this.sounds.clear();
    this.loadedSprites.clear();
  }
}

export const soundManager = new SoundManager();

// Convenience functions
export function playSFX(id: keyof typeof SFX_SPRITES, options?: { volume?: number; rate?: number }): number | undefined {
  return soundManager.play(SFX_SPRITES[id].id, options);
}

export function stopSFX(id: keyof typeof SFX_SPRITES): void {
  soundManager.stop(SFX_SPRITES[id].id);
}

export function preloadSFX(): Promise<void> {
  return soundManager.preload(Object.values(SFX_SPRITES));
}
