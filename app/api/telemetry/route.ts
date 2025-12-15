import { NextRequest, NextResponse } from 'next/server';

interface TelemetryEvent {
  type: string;
  timestamp: number;
  sessionId: string;
  data: Record<string, unknown>;
}

interface RunCompleteData {
  seed: string;
  score: number;
  shardsCollected: number;
  totalShards: number;
  timeElapsed: number;
  damagesTaken: number;
  modifiersUsed: string[];
  platform: 'mobile' | 'desktop';
  outcome: 'victory' | 'defeat' | 'quit';
}

const VALID_EVENT_TYPES = [
  'session_start',
  'run_start',
  'run_complete',
  'shard_collected',
  'damage_taken',
  'modifier_activated',
  'checkpoint_reached',
  'pause',
  'resume',
  'settings_changed',
  'error',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events: TelemetryEvent[] = Array.isArray(body) ? body : [body];

    // Validate events
    const validatedEvents: TelemetryEvent[] = [];
    const errors: string[] = [];

    for (const event of events) {
      if (!event.type || !VALID_EVENT_TYPES.includes(event.type)) {
        errors.push(`Invalid event type: ${event.type}`);
        continue;
      }

      if (!event.sessionId || typeof event.sessionId !== 'string') {
        errors.push('Missing or invalid sessionId');
        continue;
      }

      if (!event.timestamp || typeof event.timestamp !== 'number') {
        errors.push('Missing or invalid timestamp');
        continue;
      }

      validatedEvents.push({
        type: event.type,
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        data: event.data || {},
      });
    }

    // In production, you would send these to your analytics service
    // For now, we just log and acknowledge
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry] Received events:', validatedEvents);
    }

    // Here you could integrate with:
    // - PostHog
    // - Amplitude
    // - Mixpanel
    // - Custom analytics backend
    // - CloudFlare Analytics
    // - Vercel Analytics

    return NextResponse.json({
      received: validatedEvents.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    status: 'ok',
    validEventTypes: VALID_EVENT_TYPES,
  });
}
