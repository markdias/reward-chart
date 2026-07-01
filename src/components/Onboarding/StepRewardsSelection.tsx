import React, { useState } from 'react';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';
import { PREMADE_REWARDS } from '../../data/premadeTemplates';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';

interface StepRewardsSelectionProps {
  theme: ThemeId;
  initialSelectedRewardIds: string[];
  onNext: (selectedRewardIds: string[]) => void;
  onBack: () => void;
}

export default function StepRewardsSelection({ theme, initialSelectedRewardIds, onNext, onBack }: StepRewardsSelectionProps) {
  const styles = THEME_PRESETS[theme];
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
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-center h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl ${styles.cardBg} space-y-4 shadow-xl flex flex-col h-[85vh] overflow-hidden relative z-10`}>
        <div className="text-center space-y-2 shrink-0">
          <h2 className={`text-2xl font-display font-bold ${styles.titleColor}`}>Pick Starting Rewards</h2>
          <p className={`text-xs ${styles.textMuted}`}>Select some common rewards to add to your children's dashboard right away. You can add more later!</p>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                if (selectedIds.length === PREMADE_REWARDS.length) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds(PREMADE_REWARDS.map(r => r.id as string));
                }
              }}
              className={`text-xs font-bold transition-colors underline ${selectedIds.length === PREMADE_REWARDS.length ? 'text-stone-500 hover:text-stone-700' : 'text-amber-600 hover:text-amber-700'}`}
            >
              {selectedIds.length === PREMADE_REWARDS.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar min-h-[300px]">
          {PREMADE_REWARDS.map(reward => {
            const isSelected = selectedIds.includes(reward.id as string);
            const Icon = (Icons as any)[reward.icon_name] || Icons.Star;
            
            return (
              <button
                key={reward.id}
                onClick={() => toggleReward(reward.id as string)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isSelected 
                    ? 'border-amber-400 bg-amber-50 shadow-sm' 
                    : `border-stone-200 bg-white hover:border-stone-300`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`block font-bold text-sm ${isSelected ? 'text-amber-900' : 'text-stone-700'}`}>
                      {reward.title}
                    </span>
                    <span className="text-xs text-stone-500">{reward.cost_points} Gold</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-amber-400 border-amber-400' : 'border-stone-300'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex gap-3 pt-4 shrink-0 border-t border-stone-200">
          <button
            onClick={onBack}
            className="p-3.5 rounded-xl border-2 border-stone-200 text-stone-500 hover:bg-stone-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleContinue}
            className={`flex-1 ${styles.btnPrimary} py-3.5 rounded-xl flex items-center justify-center gap-2 font-display uppercase tracking-wide shadow-lg`}
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
