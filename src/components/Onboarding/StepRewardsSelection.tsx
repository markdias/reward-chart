import React, { useState } from 'react';
import { Typography } from '../ui/Typography';

import { PREMADE_REWARDS } from '../../data/premadeTemplates';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/Button';

interface StepRewardsSelectionProps {
  initialSelectedRewardIds: string[];
  onNext: (selectedRewardIds: string[]) => void;
  onBack: () => void;
}

export default function StepRewardsSelection({ initialSelectedRewardIds, onNext, onBack }: StepRewardsSelectionProps) {
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
  // Select first 3 by default if none selected
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedRewardIds.length > 0 
      ? initialSelectedRewardIds 
      : PREMADE_REWARDS.slice(0, 3).map(r => r.id as string)
  );

  const toggleReward = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    onNext(selectedIds);
  };

  return (
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 pt-[8vh] sm:pt-[12vh] pb-10 flex flex-col h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl space-y-4 flex flex-col h-[85vh] overflow-hidden relative z-10`}>
        <div className="text-center space-y-2 shrink-0">
          <Typography variant="h2" className={styles.titleColor}>Pick Starting Rewards</Typography>
          <p className={`text-xs ${styles.textMuted}`}>Select some common rewards to add to your children's dashboard right away. You can add more later!</p>
          <div className="flex justify-end pt-1">
            <Button
              variant="none"
              size="none"
              onClick={() => {
                if (selectedIds.length === PREMADE_REWARDS.length) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds(PREMADE_REWARDS.map(r => r.id as string));
                }
              }}
              className={`text-xs font-bold transition-colors underline ${selectedIds.length === PREMADE_REWARDS.length ? 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200' : 'text-amber-600 hover:text-amber-700'}`}
            >
              {selectedIds.length === PREMADE_REWARDS.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar min-h-[300px]">
          {PREMADE_REWARDS.map(reward => {
            const isSelected = selectedIds.includes(reward.id as string);
            const Icon = (Icons as any)[reward.icon_name] || Icons.Star;
            
            return (
              <Button
                variant="none"
                size="none"
                key={reward.id}
                onClick={() => toggleReward(reward.id as string)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isSelected 
                    ? 'border-amber-400 bg-amber-50 shadow-sm' 
                    : `border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`block font-bold text-sm ${isSelected ? 'text-amber-900' : 'text-stone-700 dark:text-stone-200'}`}>
                      {reward.title}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">{reward.cost_points} Gold</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-amber-400 border-amber-400' : 'border-stone-300'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </Button>
            )
          })}
        </div>

        <div className="flex gap-3 pt-4 shrink-0 border-t border-stone-200 dark:border-stone-700">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="primary"
            fullWidth
            className="flex-1"
            onClick={handleContinue}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
