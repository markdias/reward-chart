import React, { useState } from 'react';
import { Typography } from '../ui/Typography';

import { UserCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { playSound } from '../../utils/sound';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface StepParentDetailsProps {
  onNext: (name: string, familyName: string) => void;
  initialName?: string;
  initialFamilyName?: string;
  onBack?: () => void;
}

export default function StepParentDetails({ onNext, onBack, initialName = '', initialFamilyName = '' }: StepParentDetailsProps) {
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
  const [name, setName] = useState(initialName);
  const [familyName, setFamilyName] = useState(initialFamilyName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !familyName.trim()) return;
    playSound.click();
    onNext(name.trim(), familyName.trim());
  };

  return (
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 pt-[8vh] sm:pt-[12vh] pb-10 flex flex-col min-h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm space-y-6 shadow-xl relative z-10`}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto shadow-sm">
            <UserCircle className="w-8 h-8 text-amber-500" />
          </div>
          <Typography variant="h2" className={styles.titleColor}>Parent Details</Typography>
          <p className={`text-xs ${styles.textMuted}`}>Tell us a bit about yourself so we can personalize the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g. Mummy, Daddy"
            required
          />

          <Input
            label="Family Name"
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="E.g. The Smiths"
            required
          />

          <div className="flex gap-3 pt-2">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="primary"
              fullWidth
              className="flex-1"
              type="submit"
              disabled={!name.trim() || !familyName.trim()}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
