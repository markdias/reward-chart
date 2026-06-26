import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';

import LandingPage from '../LandingPage'; // Using this as the welcome step
import StepChildrenSetup from './StepChildrenSetup';
import StepTasksSelection from './StepTasksSelection';
import StepPinSetup from './StepPinSetup';
import StepCreateAccount from './StepCreateAccount';
import StepHandover from './StepHandover';
import StepParentDetails from './StepParentDetails';
import { Child, Task, Reward } from '../../types';
import { PREMADE_TASKS } from '../../data/premadeTemplates';

interface OnboardingWizardProps {
  theme: ThemeId;
  onComplete: (data: OnboardingData) => void;
  onLoginInstead: () => void;
}

export interface OnboardingData {
  children: Partial<Child>[];
  parentName: string;
  familyName: string;
  selectedTasks: Task[];
  pin: string;
  skippedAccount: boolean;
  email?: string;
}

type WizardStep = 'welcome' | 'children' | 'handover' | 'parentDetails' | 'tasks' | 'pin' | 'account';

export default function OnboardingWizard({ theme, onComplete, onLoginInstead }: OnboardingWizardProps) {
  const [step, setStep] = useState<WizardStep>('welcome');
  const [startedBy, setStartedBy] = useState<'parent' | 'child' | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    children: [],
    parentName: '',
    familyName: '',
    selectedTasks: [],
    pin: '',
    skippedAccount: false,
  });

  const handleWelcomeComplete = (role: 'parent' | 'child') => {
    setStartedBy(role);
    setStep('children');
  };

  const handleChildrenSetupComplete = (childrenData: Partial<Child>[]) => {
    setOnboardingData(prev => ({ ...prev, children: childrenData }));
    if (startedBy === 'child') {
      setStep('handover');
    } else {
      setStep('parentDetails');
    }
  };

  const handleHandoverComplete = () => {
    setStep('parentDetails');
  };

  const handleParentDetailsComplete = (name: string, familyName: string) => {
    setOnboardingData(prev => ({ ...prev, parentName: name, familyName }));
    setStep('tasks');
  };

  const handleTasksSelectionComplete = (selectedTaskIds: string[]) => {
    const tasks = PREMADE_TASKS.filter(t => selectedTaskIds.includes(t.id));
    setOnboardingData(prev => ({ ...prev, selectedTasks: tasks }));
    setStep('pin');
  };

  const handlePinSetupComplete = (pin: string) => {
    setOnboardingData(prev => ({ ...prev, pin }));
    setStep('account');
  };

  const handleAccountComplete = (skipped: boolean, email?: string) => {
    const finalData = { ...onboardingData, skippedAccount: skipped, email };
    setOnboardingData(finalData);
    onComplete(finalData);
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <LandingPage 
            onEnterArcade={handleWelcomeComplete} 
            theme={theme} 
          />
        );
      case 'children':
        return (
          <StepChildrenSetup
            theme={theme}
            onNext={handleChildrenSetupComplete}
            initialChildren={onboardingData.children}
            startedBy={startedBy}
          />
        );
      case 'handover':
        return (
          <StepHandover 
            theme={theme}
            onNext={handleHandoverComplete}
          />
        );
      case 'parentDetails':
        return (
          <StepParentDetails
            theme={theme}
            onNext={handleParentDetailsComplete}
            initialName={onboardingData.parentName}
            initialFamilyName={onboardingData.familyName}
          />
        );
      case 'tasks':
        return (
          <StepTasksSelection
            theme={theme}
            onNext={handleTasksSelectionComplete}
            onBack={() => setStep('parentDetails')}
            initialSelectedTaskIds={onboardingData.selectedTasks.map(t => t.id)}
          />
        );
      case 'pin':
        return (
          <StepPinSetup
            theme={theme}
            onNext={handlePinSetupComplete}
            onBack={() => setStep('tasks')}
          />
        );
      case 'account':
        return (
          <StepCreateAccount
            theme={theme}
            pin={onboardingData.pin}
            name={onboardingData.parentName}
            familyName={onboardingData.familyName}
            onComplete={handleAccountComplete}
            onBack={() => setStep('pin')}
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
