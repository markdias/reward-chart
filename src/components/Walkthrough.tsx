import React, { useEffect } from 'react';
import { useJoyride, Step, STATUS, EVENTS } from 'react-joyride';

interface WalkthroughProps {
  steps: Step[];
  run: boolean;
  onFinish: () => void;
  onStepChange?: (index: number) => void;
  onBeforeStepChange?: (index: number) => void;
  stepIndex?: number;
}

export const Walkthrough: React.FC<WalkthroughProps> = ({ 
  steps, 
  run, 
  onFinish,
  onStepChange,
  onBeforeStepChange,
  stepIndex
}) => {
  const { Tour, state, on, controls } = useJoyride({
    continuous: true,
    hideCloseButton: true,
    disableScrolling: true,
    disableOverlayClose: true,
    showProgress: true,
    showSkipButton: true,
    steps,
    stepIndex,
    styles: {
      options: {
        zIndex: 10000,
        primaryColor: '#8b5cf6',
        textColor: '#1f2937',
      },
      buttonClose: {
        display: 'none',
      },
      buttonSkip: {
        color: '#6b7280',
      },
      tooltipContainer: {
        textAlign: 'left' as const,
      },
    },
  });

  // Start/stop the tour based on the run prop
  useEffect(() => {
    if (run) {
      controls.start(0);
    } else {
      controls.reset();
    }
  }, [run]);

  // Listen for step changes and tour completion
  useEffect(() => {
    const unsubBefore = on(EVENTS.STEP_BEFORE, (data: any) => {
      if (onBeforeStepChange) {
        // The index in STEP_BEFORE is the step we are about to render.
        // Wait, STEP_BEFORE gives data.index as the current step or the next step?
        // Let's use the same logic as STEP_AFTER to determine the next index.
        const nextIndex = data.action === 'prev' ? data.index - 1 : data.index + 1;
        
        // If this is the very first step starting (action is 'start'), nextIndex might be NaN or incorrect.
        // Joyride passes action 'start' and index 0. 
        const targetIndex = data.action === 'start' ? 0 : (data.action === 'prev' ? data.index - 1 : data.index + 1);
        onBeforeStepChange(targetIndex);
      }
    });

    const unsubAfter = on(EVENTS.STEP_AFTER, (data: any) => {
      if (onStepChange) {
        // Compute the next step index depending on whether we went back or forward
        const nextIndex = data.action === 'prev' ? data.index - 1 : data.index + 1;
        onStepChange(nextIndex);
      }
    });

    return () => {
      unsubBefore();
      unsubAfter();
    };
  }, [on, onStepChange, onBeforeStepChange]);

  // Watch for finished/skipped status
  useEffect(() => {
    if (state.status === STATUS.FINISHED || state.status === STATUS.SKIPPED) {
      onFinish();
    }
  }, [state.status, onFinish]);

  return Tour;
};
