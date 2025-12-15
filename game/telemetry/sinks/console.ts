import type { TelemetryEvent } from '../schema';

export class ConsoleSink {
  private enabled: boolean;

  constructor(enabled: boolean = process.env.NODE_ENV === 'development') {
    this.enabled = enabled;
  }

  public send(events: TelemetryEvent[]): void {
    if (!this.enabled) return;

    events.forEach((event) => {
      console.log(
        `%c[Telemetry] ${event.type}`,
        'color: #1FF2FF; font-weight: bold;',
        {
          sessionId: event.sessionId,
          timestamp: new Date(event.timestamp).toISOString(),
          data: event.data,
        }
      );
    });
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

export const consoleSink = new ConsoleSink();
export default consoleSink;
