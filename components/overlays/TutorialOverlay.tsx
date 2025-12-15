'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/game/store/useGameStore';
import { Button } from '@/components/ui/Button';

interface TutorialStep {
  title: string;
  description: string;
  mobileHint?: string;
  desktopHint?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Collect Signal Shards',
    description: 'Guide the Data Core to collect all 12 Signal Shards scattered across the circuit.',
    mobileHint: 'Tilt your device to roll the orb',
    desktopHint: 'Use WASD to create wind fields',
  },
  {
    title: 'Maintain Stability',
    description: 'Watch your stability meter! Hard impacts and hazards drain it. Reach zero and you lose.',
    mobileHint: 'Tilt gently for fine control',
    desktopHint: 'Hold SHIFT to brake',
  },
  {
    title: 'Build Combos',
    description: 'Collect shards quickly to build combo multipliers for higher scores!',
    mobileHint: 'Double-tap to activate brake field',
    desktopHint: 'Click and drag to paint vector fields',
  },
  {
    title: 'Avoid Hazards',
    description: 'Watch out for Burn Lines, Router Blades, and Static Bumpers!',
    mobileHint: 'Long-press to stabilize gravity',
    desktopHint: 'Press SPACE for pulse impulse',
  },
  {
    title: 'Reach the Exit',
    description: 'Once all shards are collected, reach the exit gate to complete the run!',
    mobileHint: 'Tap to send a ping impulse',
    desktopHint: 'Use Q/E to rotate camera',
  },
];

interface TutorialOverlayProps {
  deviceMode: 'mobile' | 'desktop';
}

export function TutorialOverlay({ deviceMode }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const hideTutorialOverlay = useGameStore((state) => state.hideTutorialOverlay);

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      hideTutorialOverlay();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    hideTutorialOverlay();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-void/80 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="panel p-8 max-w-md w-full mx-4"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-neon-cyan' : 'bg-navy'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center mb-8"
          >
            <h3 className="font-display text-2xl text-neon-cyan mb-4">
              {step.title}
            </h3>
            <p className="text-text-primary mb-4">
              {step.description}
            </p>
            <p className="text-sm text-neon-gold font-mono">
              {deviceMode === 'mobile' ? step.mobileHint : step.desktopHint}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Back
          </Button>

          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>

          <Button onClick={handleNext}>
            {isLastStep ? 'Got It!' : 'Next'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TutorialOverlay;
