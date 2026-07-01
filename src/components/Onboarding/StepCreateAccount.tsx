import React, { useState } from 'react';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';
import { Cloud, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { playSound } from '../../utils/sound';
import { getSupabaseClient, isSupabaseConfigured } from '../../utils/supabase';

interface StepCreateAccountProps {
  theme: ThemeId;
  name?: string;
  familyName?: string;
  onComplete: (skipped: boolean, email?: string) => void;
  onBack: () => void;
  onLoginInstead: () => void;
}

export default function StepCreateAccount({ theme, name = '', familyName = '', onComplete, onBack, onLoginInstead }: StepCreateAccountProps) {
  const styles = THEME_PRESETS[theme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkip = () => {
    playSound.click();
    onComplete(true);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Skip for now to use local mode.');
      playSound.pinError();
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      playSound.pinError();
      return;
    }

    setIsSubmitting(true);
    playSound.click();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              family_name: familyName
            }
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          playSound.pinError();
          setIsSubmitting(false);
          return;
        }

        const session = data?.session;
        if (!session) {
          // If auto-confirm is off, we need to sign in manually if possible, or they need to verify email
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!signInError && signInData?.session) {
            playSound.success();
            onComplete(false, email);
            return;
          }

          setError('Sign up succeeded, but could not log in automatically. Check your email or try logging in.');
          setIsSubmitting(false);
          playSound.success();
          return;
        }

        playSound.success();
        onComplete(false, email);
      } catch (err: any) {
        setError(err.message || 'Unknown error occurred');
        playSound.pinError();
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl ${styles.cardBg} space-y-6 shadow-xl relative z-10`}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto shadow-sm">
            <Cloud className="w-8 h-8 text-cyan-500" />
          </div>
          <h2 className={`text-2xl font-display font-bold ${styles.titleColor}`}>Save & Sync</h2>
          <p className={`text-xs ${styles.textMuted}`}>Create a free account to back up your family's data and share the dashboard with another parent's device.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className={`block text-[10px] font-mono font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>Parent Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              required
              className={`w-full px-4 py-2.5 rounded-xl text-sm border ${styles.inputBg}`}
            />
          </div>



          <div>
            <label className={`block text-[10px] font-mono font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={`w-full px-4 py-2.5 rounded-xl text-sm border ${styles.inputBg}`}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${styles.btnPrimary} py-3.5 rounded-xl flex items-center justify-center gap-2 font-display uppercase tracking-wide shadow-lg mt-2`}
          >
            {isSubmitting ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-3 pt-4 border-t border-stone-200">
          <p className="text-[10px] text-stone-500">Already have an account? <button onClick={onLoginInstead} className="font-bold underline">Sign in instead</button></p>
          <div className="flex w-full gap-3 mt-2">
            <button
              type="button"
              onClick={onBack}
              className="p-3.5 rounded-xl border-2 border-stone-200 text-stone-500 hover:bg-stone-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className={`flex-1 bg-white border-2 border-stone-200 text-stone-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 tracking-wide hover:bg-stone-50`}
            >
              Skip for now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
