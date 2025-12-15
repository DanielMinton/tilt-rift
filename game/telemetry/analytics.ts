import type {
  TelemetryEvent,
  EventType,
  SessionStartData,
  RunStartData,
  RunCompleteData,
  ShardCollectedData,
  DamageTakenData,
  ModifierActivatedData,
  CheckpointReachedData,
  SettingsChangedData,
  ErrorData,
} from './schema';

const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds

class Analytics {
  private sessionId: string;
  private eventQueue: TelemetryEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public init(): void {
    if (typeof window === 'undefined') return;

    // Start flush timer
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL);

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  private track(type: EventType, data: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    const event: TelemetryEvent = {
      type,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data,
    };

    this.eventQueue.push(event);

    if (this.eventQueue.length >= BATCH_SIZE) {
      this.flush();
    }
  }

  public async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events),
        keepalive: true,
      });

      if (!response.ok) {
        // Re-queue events on failure
        this.eventQueue.unshift(...events);
      }
    } catch {
      // Re-queue events on network error
      this.eventQueue.unshift(...events);
    }
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }

  // Typed tracking methods
  public trackSessionStart(data: SessionStartData): void {
    this.track('session_start', data as unknown as Record<string, unknown>);
  }

  public trackRunStart(data: RunStartData): void {
    this.track('run_start', data as unknown as Record<string, unknown>);
  }

  public trackRunComplete(data: RunCompleteData): void {
    this.track('run_complete', data as unknown as Record<string, unknown>);
    this.flush(); // Immediately flush run completions
  }

  public trackShardCollected(data: ShardCollectedData): void {
    this.track('shard_collected', data as unknown as Record<string, unknown>);
  }

  public trackDamageTaken(data: DamageTakenData): void {
    this.track('damage_taken', data as unknown as Record<string, unknown>);
  }

  public trackModifierActivated(data: ModifierActivatedData): void {
    this.track('modifier_activated', data as unknown as Record<string, unknown>);
  }

  public trackCheckpointReached(data: CheckpointReachedData): void {
    this.track('checkpoint_reached', data as unknown as Record<string, unknown>);
  }

  public trackPause(): void {
    this.track('pause', {});
  }

  public trackResume(): void {
    this.track('resume', {});
  }

  public trackSettingsChanged(data: SettingsChangedData): void {
    this.track('settings_changed', data as unknown as Record<string, unknown>);
  }

  public trackError(data: ErrorData): void {
    this.track('error', data as unknown as Record<string, unknown>);
    this.flush(); // Immediately flush errors
  }
}

export const analytics = new Analytics();

// Initialize on client side
if (typeof window !== 'undefined') {
  analytics.init();
}

export default analytics;
