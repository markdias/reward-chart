import React from 'react';
import { Typography } from '../ui/Typography';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';
import { User, ArrowRight, ArrowLeft } from 'lucide-react';
import { playSound } from '../../utils/sound';
import { Button } from '../ui/Button';

interface StepHandoverProps {
  theme: ThemeId;
  onNext: () => void;
  onBack?: () => void;
}

export default function StepHandover({ theme, onNext, onBack }: StepHandoverProps) {
  const styles = THEME_PRESETS[theme];

  const handleNext = () => {
    playSound.levelUp();
    onNext();
  };

  return (
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 pt-[8vh] sm:pt-[12vh] pb-10 flex flex-col min-h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6 shadow-xl relative z-10 text-center`}>
        <div className="w-20 h-20 rounded-3xl bg-info/15 flex items-center justify-center mx-auto shadow-sm mb-4">
          <User className="w-10 h-10 text-info" />
        </div>
        
        <h2 className={`text-2xl font-display font-black ${styles.titleColor}`}>Great job!</h2>
        
        <p className={`text-base ${styles.textColor} font-bold`}>
          You've picked your companion! Now it's time to get your quests set up.
        </p>
        
        <div className="p-4 bg-info/10 border border-info/30 rounded-xl my-6">
          <p className="text-sm font-bold text-dark uppercase tracking-widest font-mono">
            Hand the device to a grown-up!
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="info"
            fullWidth
            className="flex-1"
            onClick={handleNext}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            I'm the grown-up, let's go
          </Button>
        </div>
      </div>
    </div>
  );
}
