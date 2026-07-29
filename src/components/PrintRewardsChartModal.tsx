import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Printer, Check, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { ChildAvatar } from './ChildAvatar';
import { Child, Reward } from '../types';
import { playSound } from '../utils/sound';

interface PrintRewardsChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: Child[];
  rewards: Reward[];
}

type Step = 1 | 2;

export function PrintRewardsChartModal({ isOpen, onClose, childrenList, rewards }: PrintRewardsChartModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');

  const weekOffset = 0; // Hardcoded to This Week (7 days)
  const activeChild = childrenList.find(c => c.id === selectedChildId) || childrenList[0];

  const getMondayOfWeek = (offset: number): Date => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7);
    const mon = new Date(today.setDate(diff));
    mon.setHours(0, 0, 0, 0);
    return mon;
  };

  const formatWeekRange = (monday: Date): string => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${fmt(monday)} – ${fmt(sunday)}`;
  };

  const formatDateKey = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handlePrint = () => {
    playSound.click();
    if (!activeChild) return;

    // Filter active rewards for this child
    const childRewards = rewards.filter(r => r.child_id === activeChild.id && r.is_available && !r.is_template);

    const serializedRewards = childRewards.map(r => ({
      id: r.id,
      title: r.title,
      cost: r.cost_points
    }));

    const url = `/print.html?asset=assigned_rewards&childId=${activeChild.id}&childName=${encodeURIComponent(activeChild.name)}&rewards=${encodeURIComponent(JSON.stringify(serializedRewards))}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleClose = () => {
    playSound.click();
    setStep(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md pointer-events-auto bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6 overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              {/* Header Icon & Title */}
              <div className="flex items-start justify-between mb-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <Typography variant="h2" className="text-base font-black">
                      Print Reward Cards
                    </Typography>
                    <Typography variant="helper" className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {step === 1 ? 'Choose child' : 'Print preview'}
                    </Typography>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1.5 rounded-xl transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-1.5 pt-1 pb-3 shrink-0">
                {([1, 2] as const).map(s => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${s <= step ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-700'}`}
                  />
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-4">
                
                {/* Step 1: Choose Child */}
                {step === 1 && (
                  <div className="space-y-4 pt-1">
                    <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Which child are these cards for?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {childrenList.map(child => (
                        <button
                          key={child.id}
                          onClick={() => { playSound.click(); setSelectedChildId(child.id); }}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            child.id === selectedChildId
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-md'
                              : 'border-stone-200 dark:border-stone-700 hover:border-emerald-300'
                          }`}
                        >
                          <ChildAvatar iconName={child.avatar_url || 'Smile'} className="w-12 h-12 rounded-2xl" />
                          <span className="text-sm font-extrabold text-stone-800 dark:text-stone-100">{child.name}</span>
                          {child.id === selectedChildId && <Check className="w-4 h-4 text-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Print */}
                {step === 2 && (
                  <div className="space-y-4 pt-1">
                    <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                      Cards Preview
                    </Typography>

                    {/* Miniature Printed Cards Grid Mockup */}
                    <div className="bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-inner grid grid-cols-3 gap-2">
                      {rewards.filter(r => r.child_id === activeChild?.id && r.is_available && !r.is_template).slice(0, 3).map((reward) => (
                        <div key={reward.id} className="bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg p-2 flex flex-col justify-between text-center aspect-[3/4.2] shadow-sm select-none">
                          <div className="text-[7px] text-stone-400 font-extrabold uppercase truncate">{activeChild?.name}'s Reward</div>
                          <div className="text-[8px] font-black text-stone-800 dark:text-stone-100 line-clamp-2 mt-1 leading-tight">{reward.title}</div>
                          <div className="w-6 h-6 bg-stone-100 dark:bg-stone-800 mx-auto rounded border border-stone-200/50 flex items-center justify-center my-1.5">
                            <span className="text-[6px] text-stone-400">QR</span>
                          </div>
                          <div className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 py-0.5 rounded border border-emerald-100/50">
                            {reward.cost_points} Coins
                          </div>
                        </div>
                      ))}
                      {rewards.filter(r => r.child_id === activeChild?.id && r.is_available && !r.is_template).length === 0 && (
                        <div className="col-span-3 py-6 text-center text-stone-400 dark:text-stone-500 font-medium text-xs">
                          No active rewards assigned.
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                      Prints a sheet of trading cards for all active assigned rewards for {activeChild?.name}. Includes dynamic coin slots, cut guidelines, and custom QR codes.
                    </p>
                  </div>
                )}

              </div>

              {/* Landscape Print Tip */}
              {step === 2 && (
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1.5 justify-center shrink-0">
                  <span>💡 Tip: Set orientation to <strong>Landscape</strong> in print settings for the best fit.</span>
                </div>
              )}

              {/* Footer actions */}
              <div className="px-5 pb-5 pt-3 border-t border-stone-100 dark:border-stone-800 shrink-0 flex gap-3">
                {step > 1 && (
                  <Button variant="secondary" onClick={() => { playSound.click(); setStep(s => (s - 1) as Step); }} className="flex-1 justify-center">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                )}

                {step === 1 && (
                  <Button
                    variant="primary"
                    onClick={() => { playSound.click(); setStep(2); }}
                    className="flex-1 justify-center"
                    disabled={!selectedChildId}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                )}

                {step === 2 && (
                  <Button
                    variant="primary"
                    onClick={handlePrint}
                    className="flex-1 justify-center"
                  >
                    <Printer className="w-4 h-4" /> Print Cards
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
