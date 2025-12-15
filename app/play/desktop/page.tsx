'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/game/store/useGameStore';
import { LoadingScreen } from '@/components/shell/LoadingScreen';

const DesktopExperience = dynamic(
  () => import('@/experiences/desktop/DesktopExperience').then((mod) => mod.DesktopExperience),
  {
    ssr: false,
    loading: () => <LoadingScreen progress={0} status="Loading experience..." />,
  }
);

export default function DesktopPlayPage() {
  const [mounted, setMounted] = useState(false);
  const setInputMode = useGameStore((s) => s.setInputMode);

  useEffect(() => {
    setMounted(true);
    setInputMode('desktop');
  }, [setInputMode]);

  if (!mounted) {
    return <LoadingScreen progress={0} status="Initializing..." />;
  }

  return (
    <div className="fixed inset-0 bg-void">
      <DesktopExperience />
    </div>
  );
}
