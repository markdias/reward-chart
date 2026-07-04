import React, { useState } from 'react';
import { Typography } from '../ui/Typography';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';
import { UserCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { playSound } from '../../utils/sound';
import { Button } from '../ui/Button';

interface StepParentDetailsProps {
  theme: ThemeId;
  onNext: (name: string, familyName: string) => void;
  initialName?: string;
  initialFamilyName?: string;
  onBack?: () => void;
}

export default function StepParentDetails({ theme, onNext, onBack, initialName = '', initialFamilyName = '' }: StepParentDetailsProps) {
  const styles = THEME_PRESETS[theme];
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
      <div className={`p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6 shadow-xl relative z-10`}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto shadow-sm">
            <UserCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className={`text-2xl font-display font-bold ${styles.titleColor}`}>Parent Details</h2>
          <p className={`text-xs ${styles.textMuted}`}>Tell us a bit about yourself so we can personalize the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-[10px] font-mono font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Mummy, Daddy"
              required
              className={`w-full px-4 py-3 rounded-xl text-sm border ${styles.inputBg}`}
            />
          </div>

          <div>
            <label className={`block text-[10px] font-mono font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>Family Name</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="E.g. The Smiths"
              required
              className={`w-full px-4 py-3 rounded-xl text-sm border ${styles.inputBg}`}
            />
          </div>

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
