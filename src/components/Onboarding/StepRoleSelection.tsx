import React from 'react';
import { motion } from 'motion/react';

import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { ShieldCheck, Gamepad2, ArrowRight, Key } from 'lucide-react';
import { playSound } from '../../utils/sound';

interface StepRoleSelectionProps {
  onSelectRole: (role: 'parent' | 'child') => void;
  onJoinCode?: () => void;
  onBack: () => void;
}

export default function StepRoleSelection({ onSelectRole, onJoinCode, onBack }: StepRoleSelectionProps) {
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

  const handleSelect = (role: 'parent' | 'child') => {
    playSound.click();
    onSelectRole(role);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} size="sm">
          ← Back
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card-panel text-center mx-auto ${onJoinCode ? 'max-w-4xl' : 'max-w-2xl'}`}
      >
        <Typography variant="h2" className={styles.titleColor}>
          Who is using this device?
        </Typography>
        <p className={`mt-2 ${styles.textMuted} max-w-md mx-auto`}>
          Choose your role to get the right setup experience.
        </p>

        <div className={`grid grid-cols-1 ${onJoinCode ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4 sm:gap-6 mt-8 sm:mt-10`}>
          {/* Parent Role */}
          <button
            onClick={() => handleSelect('parent')}
            className={`group relative overflow-hidden flex flex-col items-center p-6 sm:p-8 rounded-[2rem] border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 text-left`}
          >
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className={`text-xl font-bold font-display ${styles.titleColor} mb-2 whitespace-nowrap`}>
              I am a Parent
            </h3>
            <p className={`text-sm ${styles.textMuted} text-center`}>
              Set up accounts, create tasks, and manage rewards.
            </p>
            
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </button>

          {/* Child Role */}
          <button
            onClick={() => handleSelect('child')}
            className={`group relative overflow-hidden flex flex-col items-center p-6 sm:p-8 rounded-[2rem] border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-cyan-500 hover:shadow-xl transition-all duration-300 text-left`}
          >
            <div className="w-20 h-20 rounded-2xl bg-cyan-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Gamepad2 className="w-10 h-10 text-cyan-600" />
            </div>
            <h3 className={`text-xl font-bold font-display ${styles.titleColor} mb-2 whitespace-nowrap`}>
              I am a Kid
            </h3>
            <p className={`text-sm ${styles.textMuted} text-center`}>
              Jump straight into the arcade and start your adventure!
            </p>

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-cyan-600" />
              </div>
            </div>
          </button>

          {/* Join Code */}
          {onJoinCode && (
            <button
              onClick={() => {
                playSound.click();
                onJoinCode();
              }}
              className={`group relative overflow-hidden flex flex-col items-center p-6 sm:p-8 rounded-[2rem] border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-amber-500 hover:shadow-xl transition-all duration-300 text-left`}
            >
              <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Key className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className={`text-xl font-bold font-display ${styles.titleColor} mb-2 whitespace-nowrap`}>
                I have a Code
              </h3>
              <p className={`text-sm ${styles.textMuted} text-center`}>
                Join an existing family account using your code.
              </p>

              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-amber-600" />
                </div>
              </div>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
