import React, { useEffect } from 'react';
import { useJoyride, Step, STATUS, EVENTS } from 'react-joyride';

interface WalkthroughProps {
  steps: Step[];
  run: boolean;
  onFinish: () => void;
  onStepChange?: (index: number) => void;
}

export const Walkthrough: React.FC<WalkthroughProps> = ({ 
  steps, 
  run, 
  onFinish,
  onStepChange
}) => {
  const { Tour, state, on, controls } = useJoyride({
    continuous: true,
    hideCloseButton: true,
    disableScrolling: true,
    disableOverlayClose: true,
    showProgress: true,
    showSkipButton: true,
    steps,
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
    const unsubAfter = on(EVENTS.STEP_AFTER, (data: any) => {
      if (onStepChange) {
        // Compute the next step index depending on whether we went back or forward
        const nextIndex = data.action === 'prev' ? data.index - 1 : data.index + 1;
        onStepChange(nextIndex);
      }
    });

    return () => {
      unsubAfter();
    };
  }, [on, onStepChange]);

  // Watch for finished/skipped status
  useEffect(() => {
    if (state.status === STATUS.FINISHED || state.status === STATUS.SKIPPED) {
      onFinish();
    }
  }, [state.status, onFinish]);

  return Tour;
};
