import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';

import LandingPage from '../LandingPage'; // Using this as the welcome step
import StepChildrenSetup from './StepChildrenSetup';
import StepTasksSelection from './StepTasksSelection';
import StepPinSetup from './StepPinSetup';
import StepCreateAccount from './StepCreateAccount';
import { Child, Task, Reward } from '../../types';
import { PREMADE_TASKS } from '../../data/premadeTemplates';

interface OnboardingWizardProps {
  theme: ThemeId;
  onComplete: (data: OnboardingData) => void;
  onLoginInstead: () => void;
}

export interface OnboardingData {
  children: Partial<Child>[];
  selectedTasks: Task[];
  pin: string;
  skippedAccount: boolean;
  email?: string;
}

export default function OnboardingWizard({ theme, onComplete, onLoginInstead }: OnboardingWizardProps) {
  const [step, setStep] = useState<number>(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    children: [],
    selectedTasks: [],
    pin: '',
    skippedAccount: false,
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleWelcomeComplete = () => {
    nextStep();
  };

  const handleChildrenSetupComplete = (childrenData: Partial<Child>[]) => {
    setOnboardingData(prev => ({ ...prev, children: childrenData }));
    nextStep();
  };

  const handleTasksSelectionComplete = (selectedTaskIds: string[]) => {
    const tasks = PREMADE_TASKS.filter(t => selectedTaskIds.includes(t.id));
    setOnboardingData(prev => ({ ...prev, selectedTasks: tasks }));
    nextStep();
  };

  const handlePinSetupComplete = (pin: string) => {
    setOnboardingData(prev => ({ ...prev, pin }));
    nextStep();
  };

  const handleAccountComplete = (skipped: boolean, email?: string) => {
    const finalData = { ...onboardingData, skippedAccount: skipped, email };
    setOnboardingData(finalData);
    onComplete(finalData);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <LandingPage 
            onEnterArcade={handleWelcomeComplete} 
            theme={theme} 
          />
        );
      case 1:
        return (
          <StepChildrenSetup
            theme={theme}
            onNext={handleChildrenSetupComplete}
            initialChildren={onboardingData.children}
          />
        );
      case 2:
        return (
          <StepTasksSelection
            theme={theme}
            onNext={handleTasksSelectionComplete}
            onBack={prevStep}
            initialSelectedTaskIds={onboardingData.selectedTasks.map(t => t.id)}
          />
        );
      case 3:
        return (
          <StepPinSetup
            theme={theme}
            onNext={handlePinSetupComplete}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <StepCreateAccount
            theme={theme}
            pin={onboardingData.pin}
            onComplete={handleAccountComplete}
            onBack={prevStep}
            onLoginInstead={onLoginInstead}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full min-h-screen"
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
}
