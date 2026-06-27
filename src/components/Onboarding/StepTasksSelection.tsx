import React, { useState } from 'react';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';
import { PREMADE_TASKS } from '../../data/premadeTemplates';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface StepTasksSelectionProps {
  theme: ThemeId;
  initialSelectedTaskIds: string[];
  onNext: (selectedTaskIds: string[]) => void;
  onBack: () => void;
}

export default function StepTasksSelection({ theme, initialSelectedTaskIds, onNext, onBack }: StepTasksSelectionProps) {
  const styles = THEME_PRESETS[theme];
  // Select first 3 by default if none selected
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedTaskIds.length > 0 
      ? initialSelectedTaskIds 
      : PREMADE_TASKS.slice(0, 3).map(t => t.id)
  );

  const toggleTask = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    onNext(selectedIds);
  };

  return (
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-center h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl ${styles.cardBg} space-y-4 shadow-xl flex flex-col h-[85vh] overflow-hidden relative z-10`}>
        <div className="text-center space-y-2 shrink-0">
          <h2 className={`text-2xl font-display font-bold ${styles.titleColor}`}>Pick Starting Tasks</h2>
          <p className={`text-xs ${styles.textMuted}`}>Select some common tasks to add to your children's dashboard right away. You can add more later!</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar min-h-[300px]">
          {PREMADE_TASKS.map(task => {
            const isSelected = selectedIds.includes(task.id);
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isSelected 
                    ? 'border-amber-400 bg-amber-50 shadow-sm' 
                    : `border-stone-200 bg-white hover:border-stone-300`
                }`}
              >
                <div>
                  <span className={`block font-bold text-sm ${isSelected ? 'text-amber-900' : 'text-stone-700'}`}>
                    {task.title}
                  </span>
                  <span className="text-xs text-stone-500">{task.points} Gold • {task.xp} XP</span>
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
