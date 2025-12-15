import type { TelemetryEvent } from '../schema';

export class ApiSink {
  private endpoint: string;
  private enabled: boolean;

  constructor(endpoint: string = '/api/telemetry', enabled: boolean = true) {
    this.endpoint = endpoint;
    this.enabled = enabled;
  }

  public async send(events: TelemetryEvent[]): Promise<boolean> {
    if (!this.enabled || events.length === 0) return true;

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(events),
        keepalive: true,
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }
}

export const apiSink = new ApiSink();
export default apiSink;
