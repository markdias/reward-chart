import React from 'react';
import { motion } from 'motion/react';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { ShieldCheck, Gamepad2, ArrowRight, Key } from 'lucide-react';
import { playSound } from '../../utils/sound';

interface StepRoleSelectionProps {
  theme: ThemeId;
  onSelectRole: (role: 'parent' | 'child') => void;
  onJoinCode?: () => void;
  onBack: () => void;
}

export default function StepRoleSelection({ theme, onSelectRole, onJoinCode, onBack }: StepRoleSelectionProps) {
  const styles = THEME_PRESETS[theme];

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
            className={`group relative overflow-hidden flex flex-col items-center p-6 sm:p-8 rounded-[2rem] border-2 border-stone-200 bg-white hover:border-emerald-500 hover:shadow-xl transition-all duration-300 text-left`}
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
            className={`group relative overflow-hidden flex flex-col items-center p-6 sm:p-8 rounded-[2rem] border-2 border-stone-200 bg-white hover:border-cyan-500 hover:shadow-xl transition-all duration-300 text-left`}
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
              className={`group relative overflow-hidden flex flex-col items-center p-6 sm:p-8 rounded-[2rem] border-2 border-stone-200 bg-white hover:border-amber-500 hover:shadow-xl transition-all duration-300 text-left`}
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
