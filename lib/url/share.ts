import { encodeSeedToURL } from './seed';

export interface ShareData {
  seed: string;
  score: number;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum';
  device: 'mobile' | 'desktop';
}

export function generateShareURL(data: ShareData): string {
  const baseURL = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://tilt-rift.vercel.app';

  const params = new URLSearchParams({
    s: encodeSeedToURL(data.seed),
    sc: data.score.toString(),
    r: data.rank[0],
    d: data.device[0],
  });

  return `${baseURL}/play?${params.toString()}`;
}

export function parseShareURL(url: string): Partial<ShareData> | null {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    const seed = params.get('s');
    const score = params.get('sc');
    const rank = params.get('r');
    const device = params.get('d');

    if (!seed) return null;

    const rankMap: Record<string, ShareData['rank']> = {
      b: 'bronze',
      s: 'silver',
      g: 'gold',
      p: 'platinum',
    };

    const deviceMap: Record<string, ShareData['device']> = {
      m: 'mobile',
      d: 'desktop',
    };

    return {
      seed,
      score: score ? parseInt(score, 10) : undefined,
      rank: rank ? rankMap[rank] : undefined,
      device: device ? deviceMap[device] : undefined,
    };
  } catch {
    return null;
  }
}

export function generateShareText(data: ShareData): string {
  const emoji = {
    bronze: '',
    silver: '',
    gold: '',
    platinum: '',
  }[data.rank];

  return `${emoji} I scored ${data.score.toLocaleString()} on TILT//RIFT! Can you beat my score? ${generateShareURL(data)}`;
}

export async function shareResult(data: ShareData): Promise<boolean> {
  const url = generateShareURL(data);
  const text = generateShareText(data);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'TILT//RIFT - Signalrunner',
        text,
        url,
      });
      return true;
    } catch {
      // User cancelled or share failed
    }
  }

  // Fallback to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Clipboard access denied
    }
  }

  return false;
}

export function generateQRCodeURL(data: ShareData): string {
  const url = encodeURIComponent(generateShareURL(data));
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${url}`;
}
