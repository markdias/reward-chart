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
  // In react-joyride v3, disableScrolling is removed from the root config.
  // Instead, each step must explicitly have skipScroll: true.
  // We also explicitly inject 'skip' into the buttons array so users can skip the tour.
  const stepsWithSkipScroll = steps.map(step => ({
    ...step,
    skipScroll: true,
    buttons: ['skip', 'back', 'primary', 'close'] as any
  }));

  const isDarkMode = document.documentElement.classList.contains('dark');

  const { Tour, state, on, controls } = useJoyride({
    continuous: true,
    hideCloseButton: true,
    disableOverlayClose: true,
    showProgress: true,
    scrollOffset: 120,
    steps: stepsWithSkipScroll,
    stepIndex,
    locale: { last: 'Finish' },
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
      ...(isDarkMode ? {
        beaconInner: {
          backgroundColor: '#ffffff',
        },
        beaconOuter: {
          borderColor: 'rgba(255,255,255,0.8)',
          backgroundColor: 'rgba(255,255,255,0.2)',
        },
      } : {}),
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
        const targetIndex = data.action === 'start' ? 0 : (data.action === 'prev' ? data.index - 1 : data.index + 1);
        onBeforeStepChange(targetIndex);
      }
    });

    const unsubAfter = on(EVENTS.STEP_AFTER, (data: any) => {
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED || data.action === 'close' || data.action === 'skip') {
        controls.reset();
        onFinish();
        return;
      }

      if (onStepChange) {
        const nextIndex = data.action === 'prev' ? data.index - 1 : data.index + 1;
        if (nextIndex >= 0 && nextIndex < steps.length) {
          onStepChange(nextIndex);
        } else {
          controls.reset();
          onFinish();
        }
      }
    });

    const unsubEnd = on(EVENTS.TOUR_END, () => {
      controls.reset();
      onFinish();
    });

    return () => {
      unsubBefore();
      unsubAfter();
      unsubEnd();
    };
  }, [on, steps.length, onStepChange, onBeforeStepChange, onFinish]);

  // Watch for finished/skipped status
  useEffect(() => {
    if (state.status === STATUS.FINISHED || state.status === STATUS.SKIPPED) {
      controls.reset();
      onFinish();
    }
  }, [state.status, onFinish]);

  if (!run) return null;

  return Tour;
};
