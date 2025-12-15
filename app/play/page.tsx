'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { detectPlatform } from '@/lib/device/platform';
import { useGameStore } from '@/game/store/useGameStore';

export default function PlayRedirectPage() {
  const router = useRouter();
  const setInputMode = useGameStore((s) => s.setInputMode);

  useEffect(() => {
    const platform = detectPlatform();
    const mode = platform.isMobile ? 'mobile' : 'desktop';
    setInputMode(mode);
    router.replace(`/play/${mode}`);
  }, [router, setInputMode]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-void">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
        <span className="text-ghost font-mono text-sm">DETECTING PLATFORM</span>
      </div>
    </div>
  );
}
