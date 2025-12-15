'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/game/store/useGameStore';
import { LoadingScreen } from '@/components/shell/LoadingScreen';

const MobileExperience = dynamic(
  () => import('@/experiences/mobile/MobileExperience').then((mod) => mod.MobileExperience),
  {
    ssr: false,
    loading: () => <LoadingScreen progress={0} status="Loading experience..." />,
  }
);

export default function MobilePlayPage() {
  const [mounted, setMounted] = useState(false);
  const setInputMode = useGameStore((s) => s.setInputMode);

  useEffect(() => {
    setMounted(true);
    setInputMode('mobile');
  }, [setInputMode]);

  if (!mounted) {
    return <LoadingScreen progress={0} status="Initializing..." />;
  }

  return (
    <div className="fixed inset-0 bg-void touch-none">
      <MobileExperience />
    </div>
  );
}
