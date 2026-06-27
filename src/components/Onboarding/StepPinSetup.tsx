import React, { useState } from 'react';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';
import { ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { playSound } from '../../utils/sound';

interface StepPinSetupProps {
  theme: ThemeId;
  onNext: (pin: string) => void;
  onBack: () => void;
}

export default function StepPinSetup({ theme, onNext, onBack }: StepPinSetupProps) {
  const styles = THEME_PRESETS[theme];
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      playSound.pinError();
      return;
    }
    playSound.pinSuccess();
    onNext(pin);
  };

  return (
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl ${styles.cardBg} space-y-6 shadow-xl relative z-10`}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className={`text-2xl font-display font-bold ${styles.titleColor}`}>Parent PIN</h2>
          <p className={`text-xs ${styles.textMuted}`}>Set a 4-digit PIN to lock the Parent Dashboard. This stops children from granting themselves unlimited points!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/[^0-9]/g, ''));
                setError('');
              }}
              placeholder="1234"
              className={`w-40 text-center px-4 py-4 rounded-2xl text-3xl font-mono border-2 tracking-[0.5em] font-bold text-stone-700 bg-white shadow-inner focus:border-amber-400 focus:outline-none transition-colors ${
                error ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-stone-200'
              }`}
            />
            {error && <p className="text-xs text-rose-500 font-bold mt-2">{error}</p>}
          </div>

          <div className="flex gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onBack}
              className="p-3.5 rounded-xl border-2 border-stone-200 text-stone-500 hover:bg-stone-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className={`flex-1 ${styles.btnPrimary} py-3.5 rounded-xl flex items-center justify-center gap-2 font-display uppercase tracking-wide shadow-lg`}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
