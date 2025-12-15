import { Howl } from 'howler';
import { audioBus } from './AudioBus';

export interface MusicTrack {
  id: string;
  src: string[];
  bpm: number;
  loopStart?: number;
  loopEnd?: number;
}

export const MUSIC_TRACKS: Record<string, MusicTrack> = {
  MAIN_THEME: {
    id: 'main-theme',
    src: ['/audio/music/main-theme.ogg', '/audio/music/main-theme.mp3'],
    bpm: 118,
  },
  GAMEPLAY: {
    id: 'gameplay',
    src: ['/audio/music/gameplay.ogg', '/audio/music/gameplay.mp3'],
    bpm: 118,
  },
  RESULTS: {
    id: 'results',
    src: ['/audio/music/results.ogg', '/audio/music/results.mp3'],
    bpm: 90,
  },
};

class MusicManager {
  private currentTrack: Howl | null = null;
  private currentTrackId: string | null = null;
  private tracks: Map<string, Howl> = new Map();
  private fadeTime = 1000; // ms

  async preload(trackIds: string[]): Promise<void> {
    return new Promise((resolve) => {
      let loaded = 0;
      const total = trackIds.length;

      if (total === 0) {
        resolve();
        return;
      }

      trackIds.forEach((trackId) => {
        const trackConfig = MUSIC_TRACKS[trackId];
        if (!trackConfig) {
          loaded++;
          if (loaded === total) resolve();
          return;
        }

        const track = new Howl({
          src: trackConfig.src,
          volume: audioBus.getEffectiveVolume('MUSIC'),
          loop: true,
          html5: true, // Use HTML5 audio for streaming
          onload: () => {
            this.tracks.set(trackId, track);
            audioBus.registerSound(`MUSIC:${trackId}`, track);
            loaded++;
            if (loaded === total) resolve();
          },
          onloaderror: (_id, error) => {
            console.warn(`Failed to load music ${trackId}:`, error);
            loaded++;
            if (loaded === total) resolve();
          },
        });
      });
    });
  }

  play(trackId: string, fadeIn: boolean = true): void {
    if (this.currentTrackId === trackId && this.currentTrack?.playing()) {
      return;
    }

    // Fade out current track
    if (this.currentTrack && fadeIn) {
      const oldTrack = this.currentTrack;
      oldTrack.fade(oldTrack.volume(), 0, this.fadeTime);
      setTimeout(() => oldTrack.stop(), this.fadeTime);
    } else if (this.currentTrack) {
      this.currentTrack.stop();
    }

    // Start new track
    const track = this.tracks.get(trackId);
    if (!track) {
      console.warn(`Music track not found: ${trackId}`);
      return;
    }

    this.currentTrack = track;
    this.currentTrackId = trackId;

    if (fadeIn) {
      track.volume(0);
      track.play();
      track.fade(0, audioBus.getEffectiveVolume('MUSIC'), this.fadeTime);
    } else {
      track.volume(audioBus.getEffectiveVolume('MUSIC'));
      track.play();
    }
  }

  stop(fadeOut: boolean = true): void {
    if (!this.currentTrack) return;

    if (fadeOut) {
      const track = this.currentTrack;
      track.fade(track.volume(), 0, this.fadeTime);
      setTimeout(() => {
        track.stop();
      }, this.fadeTime);
    } else {
      this.currentTrack.stop();
    }

    this.currentTrack = null;
    this.currentTrackId = null;
  }

  pause(): void {
    this.currentTrack?.pause();
  }

  resume(): void {
    this.currentTrack?.play();
  }

  setVolume(volume: number): void {
    if (this.currentTrack) {
      this.currentTrack.volume(volume * audioBus.getEffectiveVolume('MUSIC'));
    }
  }

  isPlaying(): boolean {
    return this.currentTrack?.playing() || false;
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  getBPM(): number {
    if (!this.currentTrackId) return 0;
    return MUSIC_TRACKS[this.currentTrackId]?.bpm || 0;
  }

  unloadAll(): void {
    this.stop(false);
    this.tracks.forEach((track) => track.unload());
    this.tracks.clear();
  }
}

export const musicManager = new MusicManager();

// Convenience functions
export function playMusic(trackId: keyof typeof MUSIC_TRACKS, fadeIn: boolean = true): void {
  musicManager.play(trackId, fadeIn);
}

export function stopMusic(fadeOut: boolean = true): void {
  musicManager.stop(fadeOut);
}

export function pauseMusic(): void {
  musicManager.pause();
}

export function resumeMusic(): void {
  musicManager.resume();
}

export function preloadMusic(): Promise<void> {
  return musicManager.preload(Object.keys(MUSIC_TRACKS));
}
