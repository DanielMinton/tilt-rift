import { NextRequest, NextResponse } from 'next/server';

function getDailySeed(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function getNextResetTime(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return tomorrow.getTime();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customSeed = searchParams.get('seed');

  const seed = customSeed || getDailySeed();
  const nextReset = getNextResetTime();
  const timeUntilReset = nextReset - Date.now();

  return NextResponse.json({
    seed,
    isDaily: !customSeed,
    nextReset,
    timeUntilReset,
    serverTime: Date.now(),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seed } = body;

    if (!seed || typeof seed !== 'string') {
      return NextResponse.json(
        { error: 'Invalid seed parameter' },
        { status: 400 }
      );
    }

    // Validate seed format (alphanumeric, max 32 chars)
    if (!/^[a-zA-Z0-9]{1,32}$/.test(seed)) {
      return NextResponse.json(
        { error: 'Seed must be alphanumeric and max 32 characters' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      seed,
      isDaily: false,
      validated: true,
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
