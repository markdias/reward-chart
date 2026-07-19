

import React, { useState } from 'react';
import { Typography } from '../ui/Typography';
import { motion, AnimatePresence } from 'motion/react';


import LandingPage from '../LandingPage'; // Using this as the welcome step
import StepRoleSelection from './StepRoleSelection';
import StepChildrenSetup from './StepChildrenSetup';
import StepTasksSelection from './StepTasksSelection';
import StepRewardsSelection from './StepRewardsSelection';
import StepCreateAccount from './StepCreateAccount';
import StepHandover from './StepHandover';
import StepParentDetails from './StepParentDetails';
import StepRoutinesSelection from './StepRoutinesSelection';
import { Child, Task, Reward, Routine } from '../../types';
import { PREMADE_TASKS, PREMADE_REWARDS } from '../../data/premadeTemplates';

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onLoginInstead: () => void;
  onJoinCodeInstead?: () => void;
  initialStep?: WizardStep;
  initialData?: Partial<OnboardingData>;
  skipAccountStep?: boolean;
}

export interface OnboardingData {
  children: Partial<Child>[];
  parentName: string;
  familyName: string;
  selectedRoutines: Omit<Routine, 'id'>[];
  selectedTasks: Task[];
  selectedRewards: Reward[];
  skippedAccount: boolean;
  email?: string;
}

export type WizardStep = 'welcome' | 'role' | 'children' | 'handover' | 'parentDetails' | 'routines' | 'tasks' | 'rewards' | 'account';

export default function OnboardingWizard({
  onComplete,
  onLoginInstead,
  onJoinCodeInstead,
  initialStep = 'welcome',
  initialData,
  skipAccountStep = false
}: OnboardingWizardProps) {
  const [step, setStep] = useState<WizardStep>(initialStep || 'welcome');
  const [startedBy, setStartedBy] = useState<'parent' | 'child' | null>(initialStep === 'children' ? 'parent' : null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    children: [],
    parentName: '',
    familyName: '',
    selectedRoutines: [],
    selectedTasks: [],
    selectedRewards: [],
    skippedAccount: false,
    ...initialData
  });

  const handleWelcomeComplete = () => {
    setStep('role');
  };

  const handleRoleSelectionComplete = (role: 'parent' | 'child') => {
    setStartedBy(role);
    setStep('children');
  };

  const handleChildrenSetupComplete = (childrenData: Partial<Child>[]) => {
    setOnboardingData(prev => ({ ...prev, children: childrenData }));
    if (skipAccountStep) {
      setStep('routines');
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
    setStep('routines');
  };

  const handleRoutinesSelectionComplete = (selectedRoutines: Omit<Routine, 'id'>[]) => {
    setOnboardingData(prev => ({ ...prev, selectedRoutines }));
    // Automatically select the tasks included in these routines
    const routineTaskIds = new Set<string>();
    selectedRoutines.forEach(routine => {
      routine.morningTaskIds.forEach(id => routineTaskIds.add(id));
      routine.afternoonTaskIds.forEach(id => routineTaskIds.add(id));
      routine.eveningTaskIds.forEach(id => routineTaskIds.add(id));
    });

    // We update selectedTasks temporarily so the tasks step has them pre-selected
    setOnboardingData(prev => {
      const existingTaskIds = prev.selectedTasks.map(t => t.id as string);
      const newTasks = PREMADE_TASKS.filter(t => routineTaskIds.has(t.id as string) && !existingTaskIds.includes(t.id as string));
      return {
        ...prev,
        selectedTasks: [...prev.selectedTasks, ...(newTasks as Task[])]
      };
    });

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

  const handleAccountComplete = (email?: string) => {
    const finalData = { ...onboardingData, skippedAccount: false, email };
    setOnboardingData(finalData);
    onComplete(finalData);
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <LandingPage
            onEnterArcade={handleWelcomeComplete}

            onSignIn={onLoginInstead}
            onJoinCode={onJoinCodeInstead}
          />
        );
      case 'role':
        return (
          <StepRoleSelection

            onSelectRole={handleRoleSelectionComplete}
            onJoinCode={onJoinCodeInstead}
            onBack={() => setStep('welcome')}
          />
        );
      case 'children':
        return (
          <StepChildrenSetup

            onNext={handleChildrenSetupComplete}
            onBack={() => setStep('welcome')}
            initialChildren={onboardingData.children}
            startedBy={startedBy}
          />
        );
      case 'handover':
        return (
          <StepHandover

            onNext={handleHandoverComplete}
            onBack={() => setStep('children')}
          />
        );
      case 'parentDetails':
        return (
          <StepParentDetails

            onNext={handleParentDetailsComplete}
            onBack={() => startedBy === 'child' ? setStep('handover') : setStep('children')}
            initialName={onboardingData.parentName}
            initialFamilyName={onboardingData.familyName}
          />
        );
      case 'routines':
        return (
          <StepRoutinesSelection
            onNext={handleRoutinesSelectionComplete}
            onBack={() => startedBy === 'child' ? setStep('handover') : setStep('parentDetails')}
            initialSelectedRoutines={onboardingData.selectedRoutines}
          />
        );
      case 'tasks':
        return (
          <StepTasksSelection

            onNext={handleTasksSelectionComplete}
            onBack={() => setStep('routines')}
            initialSelectedTaskIds={onboardingData.selectedTasks.map(t => t.id)}
          />
        );
      case 'rewards':
        return (
          <StepRewardsSelection

            onNext={handleRewardsSelectionComplete}
            onBack={() => setStep('tasks')}
            initialSelectedRewardIds={onboardingData.selectedRewards.map(r => r.id)}
          />
        );
      case 'account':
        return (
          <StepCreateAccount

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
        className="w-full h-full min-h-screen bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50"
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
}
