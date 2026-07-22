import React, { useState } from 'react';
import { Typography } from '../ui/Typography';
import { PREMADE_ROUTINES, PREMADE_TASKS } from '../../data/premadeTemplates';
import { Routine, Task } from '../../types';
import { Check, ArrowRight, ArrowLeft, Sun, Sunset, Moon } from 'lucide-react';
import { Button } from '../ui/Button';

interface StepRoutinesSelectionProps {
  initialSelectedRoutines: Omit<Routine, 'id'>[];
  onNext: (selectedRoutines: Omit<Routine, 'id'>[]) => void;
  onBack: () => void;
}

export default function StepRoutinesSelection({ initialSelectedRoutines, onNext, onBack }: StepRoutinesSelectionProps) {
  const styles = {
    textMuted: 'text-stone-500 dark:text-stone-400',
    titleColor: 'text-[#1C1917] dark:text-stone-50',
  };

  const [selectedRoutines, setSelectedRoutines] = useState<Omit<Routine, 'id'>[]>(
    initialSelectedRoutines.length > 0 
      ? initialSelectedRoutines 
      : [PREMADE_ROUTINES[0]]
  );

  const toggleRoutine = (routineName: string) => {
    setSelectedRoutines(prev => {
      const exists = prev.find(r => r.name === routineName);
      if (exists) {
        return prev.filter(r => r.name !== routineName);
      } else {
        const routineToAdd = PREMADE_ROUTINES.find(r => r.name === routineName);
        return routineToAdd ? [...prev, routineToAdd] : prev;
      }
    });
  };

  const handleContinue = () => {
    onNext(selectedRoutines);
  };

  const renderTaskCount = (taskIds: string[]) => {
    return `${taskIds.length} ${taskIds.length === 1 ? 'task' : 'tasks'}`;
  };

  return (
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 pt-[8vh] sm:pt-[12vh] pb-10 flex flex-col h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl space-y-6 flex flex-col h-full max-h-[85vh] relative z-10`}>
        <div className="text-center space-y-2 shrink-0">
          <Typography variant="h2" className={styles.titleColor}>Pick Starting Routines</Typography>
          <p className={`text-xs ${styles.textMuted}`}>Routines group common tasks together to make managing your child's day easier. Select one or more to get started!</p>
          <div className="flex justify-end pt-1">
            <Button
              variant="none"
              size="none"
              onClick={() => {
                if (selectedRoutines.length === PREMADE_ROUTINES.length) {
                  setSelectedRoutines([]);
                } else {
                  setSelectedRoutines([...PREMADE_ROUTINES]);
                }
              }}
              className={`text-xs font-bold transition-colors underline ${selectedRoutines.length === PREMADE_ROUTINES.length ? 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200' : 'text-amber-600 hover:text-amber-700'}`}
            >
              {selectedRoutines.length === PREMADE_ROUTINES.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar min-h-[300px]">
          {PREMADE_ROUTINES.map(routine => {
            const isSelected = selectedRoutines.some(r => r.name === routine.name);
            return (
              <Button
                variant="none"
                size="none"
                key={routine.name}
                onClick={() => toggleRoutine(routine.name)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex flex-col gap-3 ${
                  isSelected 
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10 shadow-sm' 
                    : `border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300`
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`block font-bold text-lg ${isSelected ? 'text-amber-900 dark:text-amber-100' : 'text-stone-700 dark:text-stone-200'}`}>
                    {routine.name}
                  </span>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-amber-400 border-amber-400' : 'border-stone-300 dark:border-stone-600'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 w-full mt-2">
                  <div className="flex flex-col items-center p-2 bg-white/50 dark:bg-stone-800/50 rounded-lg border border-stone-100 dark:border-stone-700">
                    <Sun className="w-5 h-5 text-amber-500 mb-1" />
                    <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase">Morning</span>
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{renderTaskCount(routine.morningTaskIds)}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white/50 dark:bg-stone-800/50 rounded-lg border border-stone-100 dark:border-stone-700">
                    <Sunset className="w-5 h-5 text-orange-500 mb-1" />
                    <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase">Afternoon</span>
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{renderTaskCount(routine.afternoonTaskIds)}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white/50 dark:bg-stone-800/50 rounded-lg border border-stone-100 dark:border-stone-700">
                    <Moon className="w-5 h-5 text-indigo-500 mb-1" />
                    <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase">Evening</span>
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{renderTaskCount(routine.eveningTaskIds)}</span>
                  </div>
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
