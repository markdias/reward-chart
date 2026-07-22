import React, { useState } from 'react';
import { Typography } from '../ui/Typography';

import { Cloud, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { playSound } from '../../utils/sound';
import { getSupabaseClient, isSupabaseConfigured } from '../../utils/supabase';
import { PasswordInput } from '../PasswordInput';
import { evaluatePassword } from '../../utils/security';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';

import { sendWelcomeEmail, resendConfirmationEmail } from '../../utils/email';

interface StepCreateAccountProps {
  name?: string;
  familyName?: string;
  onComplete: (email?: string) => void;
  onBack: () => void;
  onLoginInstead: () => void;
  theme?: string;
}

const formatAuthError = (err: any): string => {
  if (!err) return 'An error occurred during account creation.';
  if (typeof err === 'string') return err;
  const msg = err.message || err.error_description || err.error;
  if (typeof msg === 'string' && msg && msg !== '{}' && msg !== '[object Object]') {
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already in use') || msg.toLowerCase().includes('user_already_exists')) {
      return 'An account with this email already exists. Tap "Sign in instead" below!';
    }
    return msg;
  }
  return 'An account with this email may already exist. Try signing in instead!';
};

export default function StepCreateAccount({ name = '', familyName = '', onComplete, onBack, onLoginInstead, theme }: StepCreateAccountProps) {
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleResendConfirmationInStep = async () => {
    if (!email) return;
    setIsResending(true);
    setResendMsg('');
    const res = await resendConfirmationEmail(email);
    setIsResending(false);
    if (res.success) {
      setResendMsg(`Confirmation email re-sent to ${email}! Check your inbox.`);
      playSound.pinSuccess();
    } else {
      setError(formatAuthError(res.error));
      playSound.pinError();
    }
  };
  const { flags } = useFeatureFlags();

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client is not configured.');
      return;
    }
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) setError(formatAuthError(error));
    } catch (err: any) {
      setError(formatAuthError(err));
      playSound.pinError();
    }
  };



  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      playSound.pinError();
      return;
    }

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Please check your environment variables.');
      playSound.pinError();
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      playSound.pinError();
      return;
    }

    const { isValid } = evaluatePassword(password);
    if (!isValid) {
      setError('Please ensure your password meets all requirements.');
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
          setError(formatAuthError(signUpError));
          playSound.pinError();
          setIsSubmitting(false);
          return;
        }

        const session = data?.session;
        if (!session) {
          // If auto-confirm is off, try signing in manually if possible
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!signInError && signInData?.session) {
            playSound.success();
            onComplete(email);
            return;
          }

          setEmailConfirmationPending(true);
          setIsSubmitting(false);
          playSound.success();
          return;
        }

        playSound.success();
        onComplete(email);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during account creation.');
        playSound.pinError();
        setIsSubmitting(false);
      }
    } else {
      playSound.success();
      onComplete(email);
    }
  };

  return (
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 pt-[8vh] sm:pt-[12vh] pb-10 flex flex-col min-h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-6 shadow-xl relative z-10`}>
        {emailConfirmationPending ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-sm">
              ✉️
            </div>
            <div>
              <Typography variant="h2" className={styles.titleColor}>Check your email!</Typography>
              <p className={`text-xs sm:text-sm ${styles.textMuted} mt-1.5`}>
                We sent a confirmation link to <strong className="text-stone-900 dark:text-stone-50 font-bold">{email}</strong>. Please click the link in your email to activate your account.
              </p>
            </div>

            {resendMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold">
                {resendMsg}
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="font-black"
                onClick={handleSignUp}
              >
                I'VE CONFIRMED MY EMAIL
              </Button>
              <Button
                variant="secondary"
                fullWidth
                size="md"
                className="text-xs font-bold"
                disabled={isResending}
                onClick={handleResendConfirmationInStep}
              >
                {isResending ? 'RESENDING...' : 'RESEND CONFIRMATION EMAIL'}
              </Button>
              <button
                type="button"
                onClick={onLoginInstead}
                className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 font-bold underline mt-2 block mx-auto"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto shadow-sm">
                <Cloud className="w-8 h-8 text-cyan-500" />
              </div>
              <Typography variant="h2" className={styles.titleColor}>Save & Sync</Typography>
              <p className={`text-xs ${styles.textMuted}`}>Create a free account to back up your family's data and share the dashboard with another parent's device.</p>
            </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Parent Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="parent@example.com"
            required
          />



          <div>
            <label className={`block text-[10px] font-sans font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>Password</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              showPolicy={true}
              className={`${styles.inputBg}`}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            className="mt-2"
          >
            CREATE ACCOUNT
          </Button>
        </form>

        {(flags.google_login || flags.apple_login) && (
          <div className="mt-6 mb-4">
            <div className="relative flex items-center py-2 mb-4">
              <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Or</span>
              <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
            </div>
            
            <div className="flex flex-col gap-3">
              {flags.google_login && (
                <Button type="button" variant="secondary" size="lg" fullWidth onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2">
                  <FcGoogle className="w-5 h-5" />
                  <span>Continue with Google</span>
                </Button>
              )}
              {flags.apple_login && (
                <Button type="button" variant="secondary" size="lg" fullWidth onClick={() => handleSocialLogin('apple')} className="flex items-center justify-center gap-2">
                  <FaApple className="w-5 h-5 text-black dark:text-white" />
                  <span>Continue with Apple</span>
                </Button>
              )}
            </div>
          </div>
        )}
        </>
        )}

        <div className="flex flex-col items-center gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
          <p className="text-[10px] text-stone-500 dark:text-stone-400">Already have an account? <button onClick={onLoginInstead} className="font-bold underline">Sign in instead</button></p>
          <div className="flex w-full justify-center mt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
