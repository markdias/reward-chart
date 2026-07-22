import React, { useState, useEffect } from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Gamepad2, Play, Lock, AlertCircle, Heart } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { playSound } from '../utils/sound';

import { getSupabaseClient, isSupabaseConfigured } from '../utils/supabase';
import { hashPassword, evaluatePassword } from '../utils/security';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email';
import { PasswordInput } from './PasswordInput';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import pkg from '../../package.json';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

interface AuthPageProps {
  onLoginReal: (email: string) => void;
  onSignUpReal?: (email: string, name: string, familyName: string) => void;
  onBackToLanding: () => void;
  onCreateNewAccount: () => void;
  theme?: string;
}

export default function AuthPage({ onLoginReal, onSignUpReal, onBackToLanding, onCreateNewAccount, theme }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const searchParams = new URLSearchParams(window.location.search);
  
  const hasShareToken = searchParams.has('share');
  const hasChildShareToken = searchParams.has('child_share');
  const isResetUrl = searchParams.get('mode') === 'reset_password' || window.location.hash.includes('type=recovery');

  const initialMode = isResetUrl ? 'resetPassword'
                    : hasShareToken ? 'parentSignup' 
                    : hasChildShareToken ? 'childSignup' 
                    : (searchParams.get('mode') as any) || 'login';

  const [authMode, setAuthMode] = useState<'login' | 'joinCode' | 'parentSignup' | 'childSignup' | 'forgotPassword' | 'resetPassword'>(initialMode);
  const isSignUp = authMode === 'parentSignup' || authMode === 'childSignup';

  const [realAuthError, setRealAuthError] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [inviterInfo, setInviterInfo] = useState<{ name: string, familyName: string, isChild?: boolean } | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const { flags } = useFeatureFlags();

  const recoverySessionRef = React.useRef<any>(null);

  useEffect(() => {
    const handleRecoverySession = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      // Check URL parameters for PKCE code
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data.session) {
            recoverySessionRef.current = data.session;
            setAuthMode('resetPassword');
            return;
          }
        } catch (e) {
          console.warn('PKCE code exchange error:', e);
        }
      }

      // Check URL hash for implicit flow tokens
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!error && data.session) {
              recoverySessionRef.current = data.session;
              setAuthMode('resetPassword');
              return;
            }
          } catch (e) {
            console.warn('Set session from hash error:', e);
          }
        }
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          recoverySessionRef.current = session;
        }
        if (event === 'PASSWORD_RECOVERY' || (session && isResetUrl)) {
          setAuthMode('resetPassword');
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    };

    handleRecoverySession();
  }, []);

  useEffect(() => {
    if (hasShareToken && isSupabaseConfigured()) {
      const fetchInviter = async () => {
        const supabase = getSupabaseClient();
        if (supabase) {
          const shareToken = new URLSearchParams(window.location.search).get('share');
          const { data } = await supabase
            .from('parent_profiles')
            .select('name, family_name, family_id')
            .eq('share_token', shareToken)
            .maybeSingle();
          if (data) {
            setInviterInfo({ name: data.name || 'A Parent', familyName: data.family_name || 'Their Family' });
            localStorage.setItem('RCH_PENDING_PARENT_LINK', JSON.stringify({ family_id: data.family_id, family_name: data.family_name }));
          }
        }
      };
      fetchInviter();
    } else if (hasChildShareToken && isSupabaseConfigured()) {
      const fetchChildInviter = async () => {
        const supabase = getSupabaseClient();
        if (supabase) {
          const shareToken = new URLSearchParams(window.location.search).get('child_share');
          const { data } = await supabase
            .from('children')
            .select('id, name, parent_id')
            .eq('child_share_token', shareToken)
            .maybeSingle();
          if (data) {
            setInviterInfo({ name: data.name, familyName: 'Your Family', isChild: true });
            localStorage.setItem('RCH_PENDING_CHILD_LINK', JSON.stringify({ id: data.id, parent_id: data.parent_id }));
          }
        }
      };
      fetchChildInviter();
    }
  }, [hasShareToken, hasChildShareToken]);

  const handleApplyJoinCode = async () => {
    if (!joinCodeInput.trim()) return;
    setIsApplyingCode(true);
    setRealAuthError('');
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Backend not connected");
      
      const code = joinCodeInput.trim();
      
      // Check parent profiles
      const { data: parentData } = await supabase.from('parent_profiles').select('*').eq('share_token', code).maybeSingle();
      if (parentData) {
        localStorage.setItem('RCH_PENDING_PARENT_LINK', JSON.stringify({ family_id: parentData.family_id, family_name: parentData.family_name }));
        const url = new URL(window.location.href);
        url.searchParams.set('share', code);
        url.searchParams.delete('child_share');
        url.searchParams.delete('mode');
        window.history.replaceState({}, document.title, url.toString());
        setAuthMode('parentSignup');
        playSound.success();
      } else {
        // Check children
        const { data: childData } = await supabase.from('children').select('*').eq('child_share_token', code).maybeSingle();
        if (childData) {
          localStorage.setItem('RCH_PENDING_CHILD_LINK', JSON.stringify({ id: childData.id, parent_id: childData.parent_id }));
          const url = new URL(window.location.href);
          url.searchParams.set('child_share', code);
          url.searchParams.delete('share');
          url.searchParams.delete('mode');
          window.history.replaceState({}, document.title, url.toString());
          setAuthMode('childSignup');
          playSound.success();
        } else {
          setRealAuthError("Invalid join code. Please check and try again.");
          playSound.pinError();
        }
      }
    } catch (e: any) {
      setRealAuthError(e.message);
    } finally {
      setIsApplyingCode(false);
    }
  };

  const getErrorMessage = (err: any): string => {
    if (!err) return 'Unknown connection or authentication error';
    if (typeof err === 'string') return err;
    
    const code = err.code || err.status || (err.error && err.error.code);
    const directMsg = err.message || err.error_description || err.error || (err.error && err.error.message);
    
    if (code === 'invalid_credentials' || (typeof directMsg === 'string' && directMsg.toLowerCase().includes('invalid login credentials'))) {
      return "Incorrect email or password. Please try again or create a new account.";
    }

    const parts: string[] = [];
    if (directMsg && typeof directMsg === 'string') {
      parts.push(directMsg);
    } else if (directMsg && typeof directMsg === 'object') {
      parts.push(directMsg.message || JSON.stringify(directMsg));
    }
    
    if (code) {
      parts.push(`(Code/Status: ${code})`);
    }
    
    const details = err.details || (err.error && err.error.details);
    if (details) {
      parts.push(`Details: ${details}`);
    }
    const hint = err.hint || (err.error && err.error.hint);
    if (hint) {
      parts.push(`Hint: ${hint}`);
    }
    
    if (typeof err.toString === 'function' && err.toString() !== '[object Object]') {
      const ts = err.toString();
      if (!parts.includes(ts)) {
        parts.unshift(ts);
      }
    }
    
    if (parts.length === 0) {
      try {
        const keys = Object.getOwnPropertyNames(err);
        const objProps: Record<string, any> = {};
        for (const k of keys) {
          if (typeof err[k] !== 'function') {
            objProps[k] = err[k];
          }
        }
        const json = JSON.stringify(objProps);
        if (json && json !== '{}') {
          parts.push(json);
        }
      } catch (e) {
        // Ignored
      }
    }
    
    const finalMsg = parts.join(' ').trim();
    if (!finalMsg || finalMsg === '{}' || finalMsg === 'null') {
      return 'Database connection or registration failure. Please check your Supabase credentials (URL/Key) and network connectivity.';
    }
    return finalMsg;
  };

  const handleLocalFallback = async (emailVal: string, passVal: string, action: 'signup' | 'signin') => {
    const trimmedEmail = emailVal.trim().toLowerCase();
    const stored = localStorage.getItem('RCH_LOCAL_CREDENTIALS');
    const creds = stored ? JSON.parse(stored) : {};

    const hashedVal = await hashPassword(passVal, trimmedEmail);

    if (action === 'signup') {
      creds[trimmedEmail] = hashedVal;
      localStorage.setItem('RCH_LOCAL_CREDENTIALS', JSON.stringify(creds));
      playSound.pinSuccess();
      onLoginReal(trimmedEmail);
    } else {
      const savedPass = creds[trimmedEmail];
      const matched = (savedPass && savedPass === hashedVal) || (savedPass && savedPass === passVal);

      if (matched) {
        if (savedPass === passVal) {
          creds[trimmedEmail] = hashedVal;
          localStorage.setItem('RCH_LOCAL_CREDENTIALS', JSON.stringify(creds));
        }
        playSound.pinSuccess();
        onLoginReal(trimmedEmail);
      } else if (savedPass) {
        setRealAuthError('Incorrect password for this local account.');
        playSound.pinError();
      } else {
        creds[trimmedEmail] = hashedVal;
        localStorage.setItem('RCH_LOCAL_CREDENTIALS', JSON.stringify(creds));
        playSound.pinSuccess();
        onLoginReal(trimmedEmail);
      }
    }
  };

  const handleRealAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playSound.click();
    setRealAuthError('');
    
    if (!email || !password) {
      setRealAuthError('Enter your credentials to proceed');
      playSound.pinError();
      return;
    }

    if (password.length < 6) {
      setRealAuthError('Password must be at least 6 characters');
      playSound.pinError();
      return;
    }

    if (isSignUp) {
      const { isValid } = evaluatePassword(password);
      if (!isValid) {
        setRealAuthError('Please ensure your password meets all requirements.');
        playSound.pinError();
        return;
      }
    }

    if (!isSupabaseConfigured()) {
      await handleLocalFallback(email, password, isSignUp ? 'signup' : 'signin');
      return;
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                name,
                family_name: familyName
              }
            }
          });
          if (error) {
            console.warn('Supabase signup error:', error);
            const msg = getErrorMessage(error);
            if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already in use')) {
              setRealAuthError('An account with this email already exists. Please sign in instead!');
            } else {
              setRealAuthError(msg);
            }
            playSound.pinError();
            return;
          }

          // Trigger Welcome Email via Resend Edge Function
          sendWelcomeEmail(email, name).catch(err => console.warn('Welcome email error:', err));

          const session = data?.session;
          if (!session) {
            setResetSuccessMsg(`🎉 Account created! We sent a confirmation link to ${email}. Please check your inbox and click the link to activate your account.`);
            setAuthMode('login');
            setEmailForResend(email);
            playSound.success();
            return;
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            console.warn('Supabase signin error:', error);
            const msg = getErrorMessage(error);
            if (msg.toLowerCase().includes('email not confirmed')) {
              setRealAuthError(`Your email address (${email}) has not been confirmed yet. Please check your inbox for the confirmation link.`);
              setEmailForResend(email);
            } else {
              setRealAuthError(msg);
            }
            playSound.pinError();
            return;
          }
        }
      } catch (err: any) {
        console.warn('Exception during auth submission:', err);
        setRealAuthError(getErrorMessage(err));
        playSound.pinError();
        return;
      }
    } else {
      setRealAuthError('Supabase credentials are not saved. Try toggling to "Local Browser Storage" above!');
      playSound.pinError();
      return;
    }
    
    playSound.pinSuccess();
    if (isSignUp && onSignUpReal) {
      onSignUpReal(email, name, familyName);
    } else {
      onLoginReal(email);
    }
  };

  const handleSendForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRealAuthError('');
    setResetSuccessMsg('');

    if (!email) {
      setRealAuthError('Please enter your email address to receive password reset instructions.');
      playSound.pinError();
      return;
    }

    setIsSubmittingReset(true);
    try {
      const res = await sendPasswordResetEmail(email);
      if (res.success) {
        setResetSuccessMsg(`Password reset email sent to ${email}! Please check your inbox and follow the link to reset your password.`);
        playSound.pinSuccess();
      } else {
        setRealAuthError(res.error || 'Failed to send password reset email. Please try again.');
        playSound.pinError();
      }
    } catch (err: any) {
      setRealAuthError(err.message || 'Failed to send reset link.');
      playSound.pinError();
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleUpdateNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRealAuthError('');
    setResetSuccessMsg('');

    if (!newPassword || !confirmPassword) {
      setRealAuthError('Please enter and confirm your new password.');
      playSound.pinError();
      return;
    }

    if (newPassword !== confirmPassword) {
      setRealAuthError('Passwords do not match. Please verify both fields.');
      playSound.pinError();
      return;
    }

    if (newPassword.length < 6) {
      setRealAuthError('Password must be at least 6 characters.');
      playSound.pinError();
      return;
    }

    setIsSubmittingReset(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client is not configured');

      let { data: { session } } = await supabase.auth.getSession();

      if (!session && recoverySessionRef.current) {
        session = recoverySessionRef.current;
        if (session?.access_token && session?.refresh_token) {
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
        }
      }

      if (!session) {
        // Try exchanging PKCE code if present
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
          const { data: exData } = await supabase.auth.exchangeCodeForSession(code);
          session = exData?.session || null;
        }

        // Try setting session from URL hash if implicit flow tokens present
        if (!session && window.location.hash.includes('access_token')) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            const { data: setRes } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            session = setRes?.session || null;
          }
        }
      }

      if (!session) {
        throw new Error('Auth session missing! Your password reset link may have expired or was opened in a different browser. Please request a new password reset link.');
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setRealAuthError(error.message);
        playSound.pinError();
      } else {
        setResetSuccessMsg('Your password has been successfully reset! You can now log in with your new password.');
        setAuthMode('login');
        playSound.pinSuccess();
      }
    } catch (err: any) {
      setRealAuthError(err.message || 'Failed to update password.');
      playSound.pinError();
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setRealAuthError('Supabase client is not configured.');
      return;
    }
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        setRealAuthError(error.message);
        playSound.pinError();
      }
    } catch (err: any) {
      setRealAuthError(err.message || `An error occurred during ${provider} login`);
      playSound.pinError();
    }
  };

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

  return (
    <div className="min-h-screen bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 flex flex-col font-sans relative overflow-x-hidden transition-colors duration-300" id="auth-page-root">
      
      {/* Clean White Header */}
      <header 
        className="w-full bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 relative z-40"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-3 sm:pb-4 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToLanding}
              className="mr-2"
            >
              ← Back to Home
            </Button>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shadow-sm hidden sm:flex">
              <Gamepad2 className="w-6 h-6 text-orange-500 animate-pulse" />
            </div>
            <div>
              <Typography variant="h2" as="span">
                REWARD CHART
              </Typography>
              <span className="block text-[9px] sm:text-[10px] text-stone-600 dark:text-stone-300 font-sans tracking-widest font-extrabold uppercase mt-0.5">MAKE CHORES FUN</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center relative z-20 mt-6 sm:mt-10" id="login-form-panel">
        
        <div className="space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-panel space-y-4"
          >
            <div className="text-center">
              <h3 className={`text-lg font-bold font-display ${styles.titleColor}`}>
                {authMode === 'login' ? 'Welcome Back' : 
                 authMode === 'joinCode' ? 'Enter Your Invite Code' :
                 authMode === 'childSignup' ? 'Set Up Child Account' :
                 authMode === 'forgotPassword' ? 'Reset Password' :
                 authMode === 'resetPassword' ? 'Choose New Password' :
                 hasShareToken ? 'Join Family' : 'Set Up Your Account'}
              </h3>
              <p className={`text-xs ${styles.textMuted} mb-3`}>
                {authMode === 'login' ? 'Sign in to manage quests and rewards' :
                 authMode === 'joinCode' ? 'Paste the 6-character code given to you' :
                 authMode === 'childSignup' ? (inviterInfo ? `Hi ${inviterInfo.name}! Let's create your account.` : 'Create your secure account.') :
                 authMode === 'forgotPassword' ? 'Enter your registered email address to receive password reset instructions' :
                 authMode === 'resetPassword' ? 'Enter your new password below' :
                 (inviterInfo ? `You've been invited by ${inviterInfo.name} to join ${inviterInfo.familyName}` : 'Create your family account to get started')
                }
              </p>
            </div>

            {resetSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {authMode === 'joinCode' ? (
              <div className="space-y-3">
                {realAuthError && (
                  <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{realAuthError}</span>
                  </div>
                )}
                <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl p-3 mb-2 flex flex-col gap-3">
                  <Input
                    type="text"
                    placeholder="Enter 6-character code"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    maxLength={6}
                  />
                  <Button variant="dark" size="lg" fullWidth onClick={handleApplyJoinCode} disabled={isApplyingCode}>
                    {isApplyingCode ? 'VERIFYING...' : 'APPLY CODE'}
                  </Button>
                </div>
              </div>
            ) : authMode === 'forgotPassword' ? (
              <form onSubmit={handleSendForgotPassword} className="space-y-3">
                {realAuthError && (
                  <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{realAuthError}</span>
                  </div>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />

                <Button
                  type="submit"
                  variant="dark"
                  fullWidth
                  className="mt-4"
                  disabled={isSubmittingReset}
                >
                  {isSubmittingReset ? 'SENDING EMAIL...' : 'SEND RESET LINK'}
                </Button>
              </form>
            ) : authMode === 'resetPassword' ? (
              <form onSubmit={handleUpdateNewPassword} className="space-y-3">
                {realAuthError && (
                  <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{realAuthError}</span>
                  </div>
                )}

                <div>
                  <label className={`block text-[9px] font-sans font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>
                    New Password
                  </label>
                  <PasswordInput
                    value={newPassword}
                    onChange={setNewPassword}
                    showPolicy={true}
                  />
                </div>

                <div>
                  <label className={`block text-[9px] font-sans font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>
                    Confirm Password
                  </label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    showPolicy={false}
                  />
                </div>

                <Button
                  type="submit"
                  variant="dark"
                  fullWidth
                  className="mt-4"
                  disabled={isSubmittingReset}
                >
                  {isSubmittingReset ? 'SAVING...' : 'UPDATE PASSWORD'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRealAuthSubmit} className="space-y-3">
                {realAuthError && (
                  <div className="space-y-2">
                    <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{realAuthError}</span>
                    </div>
                  </div>
                )}

                {(flags.google_login || flags.apple_login) && (
                  <>
                    <div className="flex flex-col gap-3 mb-4">
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

                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
                      <span className="flex-shrink-0 mx-4 text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Or</span>
                      <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
                    </div>
                  </>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />

                {authMode === 'parentSignup' && (
                  <>
                    <Input
                      label="Your Name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.g. Mum, Dad, etc."
                      required
                    />

                    {!hasShareToken && (
                      <Input
                        label="Family Name"
                        type="text"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        placeholder="E.g. The Smiths"
                        required
                      />
                    )}
                  </>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`block text-[9px] font-sans font-bold uppercase tracking-widest ${styles.textMuted}`}>
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          playSound.click();
                          setRealAuthError('');
                          setResetSuccessMsg('');
                          setAuthMode('forgotPassword');
                        }}
                        className="text-[11px] font-bold text-orange-500 hover:text-orange-600 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    showPolicy={isSignUp}
                  />
                </div>

                <Button
                  type="submit"
                  variant="dark"
                  fullWidth
                  className="mt-4"
                  id="real-login-submit"
                >
                  {isSignUp ? 'CREATE MY ACCOUNT' : 'SIGN IN'}
                </Button>
              </form>
            )}

            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => {
                  playSound.click();
                  setRealAuthError('');
                  setResetSuccessMsg('');
                  if (authMode === 'login') {
                    onCreateNewAccount();
                  } else {
                    setAuthMode('login');
                  }
                }}
                id="toggle-sign-up"
              >
                {authMode === 'login' ? 'CREATE A NEW ACCOUNT' : '← BACK TO SIGN IN'}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Small security compliance tags */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-xl bg-warning/15 text-dark dark:text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase`}>SECURE CLOUD</span>
              <span className={`text-[11px] font-bold ${styles.text}`}>Cross-Device Sync</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-xl bg-danger/10 text-danger">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <span className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase`}>PRIVACY SAFE</span>
              <span className={`text-[11px] font-bold ${styles.text}`}>Safe & Family Friendly</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Console */}
      <footer className={`w-full max-w-7xl mx-auto px-6 py-6 border-t ${styles.divider} text-center text-xs ${styles.textMuted} mt-auto flex flex-col sm:flex-row justify-between items-center gap-4 relative z-20`}>
        <div>
          © 2026 Reward Chart. Transforming family responsibilities into magical digital conquests.
        </div>
        <div className="flex gap-4 font-sans text-[10px]">
          <a href="#privacy" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">PRIVACY POLICY</a>
          <a href="#terms" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">TERMS OF SERVICE</a>
          <span className="text-stone-600 dark:text-stone-300">|</span>
          <span className="text-emerald-600 font-bold animate-pulse uppercase">● SYSTEM ONLINE (v{pkg.version})</span>
        </div>
      </footer>
    </div>
  );
}
