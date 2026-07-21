import React from 'react';
import { Typography } from '../ui/Typography';

import { User, ArrowRight, ArrowLeft } from 'lucide-react';
import { playSound } from '../../utils/sound';
import { Button } from '../ui/Button';

interface StepHandoverProps {
  onNext: () => void;
  onBack?: () => void;
}

export default function StepHandover({ onNext, onBack }: StepHandoverProps) {
  const styles = {
    text: 'text-stone-900 dark:text-stone-50',
    textMuted: 'text-stone-500 dark:text-stone-400',
    bodyBg: 'bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-50',
    cardBg: 'bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-50',
    headerBg: 'bg-white/90 dark:bg-stone-900/90 border-b border-stone-100 dark:border-stone-800 backdrop-blur-md',
    btnPrimary: 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all uppercase tracking-wider rounded-2xl border-none',
    btnSecondary: 'bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-200 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[0.98] transition-all rounded-2xl',
    tabActive: 'bg-rose-400 text-white shadow-md shadow-rose-400/30 font-bold rounded-2xl',
    tabInactive: 'text-stone-400 hover:text-stone-600 bg-transparent',
    inputBg: 'bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl text-stone-900 dark:text-stone-50 placeholder-[#A8A29E] focus:bg-white dark:focus:bg-stone-900 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:outline-none transition-all',
    accentGlow: 'bg-orange-100/40 opacity-50',
    tagCategory: 'text-orange-600 bg-orange-50 border border-orange-100 font-bold uppercase rounded-full',
    gridStyle: 'scrolling-grid opacity-[0.03]',
    innerCard: 'bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl',
    titleGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent',
    divider: 'border-stone-100 dark:border-stone-800',
    overlayCrt: 'hidden',
    titleColor: 'text-[#1C1917] dark:text-stone-50',
    borderStyle: 'border-stone-100 dark:border-stone-800'
};

  const handleNext = () => {
    playSound.levelUp();
    onNext();
  };

  return (
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 pt-[8vh] sm:pt-[12vh] pb-10 flex flex-col min-h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm space-y-6 shadow-xl relative z-10 text-center`}>
        <div className="w-20 h-20 rounded-3xl bg-info/15 flex items-center justify-center mx-auto shadow-sm mb-4">
          <User className="w-10 h-10 text-info" />
        </div>
        
        <Typography variant="h2" className={styles.titleColor}>Great job!</Typography>
        
        <p className={`text-base ${styles.text} font-bold`}>
          You've picked your companion! Now it's time to get your quests set up.
        </p>
        
        <div className="p-4 bg-info/10 border border-info/30 rounded-xl my-6">
          <p className="text-sm font-bold text-dark dark:text-white uppercase tracking-widest font-sans">
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
