import React, { useState } from 'react';
import { Typography } from '../ui/Typography';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';
import { PREMADE_TASKS } from '../../data/premadeTemplates';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

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
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 pt-[8vh] sm:pt-[12vh] pb-10 flex flex-col h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-6 flex flex-col h-full max-h-[85vh] relative z-10`}>
        <div className="text-center space-y-2 shrink-0">
          <Typography variant="h2" className={styles.titleColor}>Pick Starting Tasks</Typography>
          <p className={`text-xs ${styles.textMuted}`}>Select some common tasks to add to your children's dashboard right away. You can add more later!</p>
          <div className="flex justify-end pt-1">
            <Button
              variant="none"
              size="none"
              onClick={() => {
                if (selectedIds.length === PREMADE_TASKS.length) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds(PREMADE_TASKS.map(t => t.id));
                }
              }}
              className={`text-xs font-bold transition-colors underline ${selectedIds.length === PREMADE_TASKS.length ? 'text-stone-500 hover:text-stone-700' : 'text-amber-600 hover:text-amber-700'}`}
            >
              {selectedIds.length === PREMADE_TASKS.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar min-h-[300px]">
          {PREMADE_TASKS.map(task => {
            const isSelected = selectedIds.includes(task.id);
            return (
              <Button
                variant="none"
                size="none"
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
                  <span className="text-xs text-stone-500">{task.points} Gold</span>
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

        <div className="flex gap-3 pt-4 shrink-0 border-t border-stone-200">
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
