import React, { useState } from 'react';
import { Typography } from '../ui/Typography';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';

import LandingPage from '../LandingPage'; // Using this as the welcome step
import StepChildrenSetup from './StepChildrenSetup';
import StepTasksSelection from './StepTasksSelection';
import StepRewardsSelection from './StepRewardsSelection';
import StepCreateAccount from './StepCreateAccount';
import StepHandover from './StepHandover';
import StepParentDetails from './StepParentDetails';
import { Child, Task, Reward } from '../../types';
import { PREMADE_TASKS, PREMADE_REWARDS } from '../../data/premadeTemplates';

interface OnboardingWizardProps {
  theme: ThemeId;
  onComplete: (data: OnboardingData) => void;
  onLoginInstead: () => void;
  initialStep?: WizardStep;
  initialData?: Partial<OnboardingData>;
  skipAccountStep?: boolean;
}

export interface OnboardingData {
  children: Partial<Child>[];
  parentName: string;
  familyName: string;
  selectedTasks: Task[];
  selectedRewards: Reward[];
  skippedAccount: boolean;
  email?: string;
}

type WizardStep = 'welcome' | 'children' | 'handover' | 'parentDetails' | 'tasks' | 'rewards' | 'account';

export default function OnboardingWizard({ theme, onComplete, onLoginInstead, initialStep, initialData, skipAccountStep }: OnboardingWizardProps) {
  const [step, setStep] = useState<WizardStep>(initialStep || 'welcome');
  const [startedBy, setStartedBy] = useState<'parent' | 'child' | null>(initialStep === 'children' ? 'parent' : null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    children: [],
    parentName: '',
    familyName: '',
    selectedTasks: [],
    selectedRewards: [],
    skippedAccount: false,
    ...initialData
  });

  const handleWelcomeComplete = (role: 'parent' | 'child') => {
    setStartedBy(role);
    setStep('children');
  };

  const handleChildrenSetupComplete = (childrenData: Partial<Child>[]) => {
    setOnboardingData(prev => ({ ...prev, children: childrenData }));
    if (skipAccountStep) {
      setStep('tasks');
    } else if (startedBy === 'child') {
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
    const tasks = PREMADE_TASKS.filter(t => selectedTaskIds.includes(t.id as string));
    setOnboardingData(prev => ({ ...prev, selectedTasks: tasks as Task[] }));
    setStep('rewards');
  };

  const handleRewardsSelectionComplete = (selectedRewardIds: string[]) => {
    const rewards = PREMADE_REWARDS.filter(r => selectedRewardIds.includes(r.id as string));
    const newOnboardingData = { ...onboardingData, selectedRewards: rewards as Reward[] };
    setOnboardingData(newOnboardingData);
    
    if (skipAccountStep) {
      // They already have an account, so just complete the wizard directly
      const finalData = { ...newOnboardingData, skippedAccount: false };
      onComplete(finalData);
    } else {
      setStep('account');
    }
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
            onSignIn={onLoginInstead}
          />
        );
      case 'children':
        return (
          <StepChildrenSetup
            theme={theme}
            onNext={handleChildrenSetupComplete}
            onBack={() => setStep('welcome')}
            initialChildren={onboardingData.children}
            startedBy={startedBy}
          />
        );
      case 'handover':
        return (
          <StepHandover 
            theme={theme}
            onNext={handleHandoverComplete}
            onBack={() => setStep('children')}
          />
        );
      case 'parentDetails':
        return (
          <StepParentDetails
            theme={theme}
            onNext={handleParentDetailsComplete}
            onBack={() => startedBy === 'child' ? setStep('handover') : setStep('children')}
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
      case 'rewards':
        return (
          <StepRewardsSelection
            theme={theme}
            onNext={handleRewardsSelectionComplete}
            onBack={() => setStep('tasks')}
            initialSelectedRewardIds={onboardingData.selectedRewards.map(r => r.id)}
          />
        );
      case 'account':
        return (
          <StepCreateAccount
            theme={theme}
            name={onboardingData.parentName}
            familyName={onboardingData.familyName}
            onComplete={handleAccountComplete}
            onBack={() => setStep('rewards')}
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
        className="w-full h-full min-h-screen bg-white text-stone-900"
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
}
