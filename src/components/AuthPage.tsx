import React, { useState, useEffect } from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Gamepad2, Play, Lock, AlertCircle, Heart } from 'lucide-react';
import { playSound } from '../utils/sound';
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { getSupabaseClient, isSupabaseConfigured } from '../utils/supabase';
import { hashPassword, evaluatePassword } from '../utils/security';
import { PasswordInput } from './PasswordInput';
import { Button } from './ui/Button';
import pkg from '../../package.json';

interface AuthPageProps {
  onLoginReal: (email: string) => void;
  onSignUpReal?: (email: string, name: string, familyName: string) => void;
  onBackToLanding: () => void;
  theme: ThemeId;
}

export default function AuthPage({ onLoginReal, onSignUpReal, onBackToLanding, theme }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const searchParams = new URLSearchParams(window.location.search);
  const hasShareToken = searchParams.has('share');

  const [isSignUp, setIsSignUp] = useState(hasShareToken);
  const [realAuthError, setRealAuthError] = useState('');
  const [inviterInfo, setInviterInfo] = useState<{ name: string, familyName: string } | null>(null);

  useEffect(() => {
    if (hasShareToken && isSupabaseConfigured()) {
      const fetchInviter = async () => {
        const supabase = getSupabaseClient();
        if (supabase) {
          const shareToken = searchParams.get('share');
          const { data } = await supabase
            .from('parent_profiles')
            .select('name, family_name')
            .eq('share_token', shareToken)
            .maybeSingle();
          if (data) {
            setInviterInfo({ name: data.name || 'A Parent', familyName: data.family_name || 'Their Family' });
          }
        }
      };
      fetchInviter();
    }
  }, [hasShareToken]);

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
              data: {
                name,
                family_name: familyName
              }
            }
          });
          if (error) {
            console.warn('Supabase signup error:', error);
            setRealAuthError(getErrorMessage(error));
            playSound.pinError();
            return;
          }
          const session = data?.session;
          if (!session) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (!signInError && signInData?.session) {
              playSound.pinSuccess();
              if (onSignUpReal) onSignUpReal(email, name, familyName);
              else onLoginReal(email);
              return;
            }

            setRealAuthError('Sign up processed! If you still cannot log in, please try signing up with a NEW email (your first attempt might have gotten stuck in Supabase).');
            setIsSignUp(false);
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
            setRealAuthError(getErrorMessage(error));
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

  const styles = THEME_PRESETS[theme];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative overflow-x-hidden transition-colors duration-300" id="auth-page-root">
      
      {/* Clean White Header */}
      <header 
        className="w-full bg-white border-b border-gray-100 relative z-40"
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
              <span className="block text-[9px] sm:text-[10px] text-slate-600 font-mono tracking-widest font-extrabold uppercase mt-0.5">MAKE CHORES FUN</span>
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
                {isSignUp ? (hasShareToken ? 'JOIN FAMILY' : 'CREATE PARENT ACCOUNT') : 'SECURE PARENT LOGIN'}
              </h3>
              <p className={`text-xs ${styles.textMuted} mb-3`}>
                {hasShareToken && isSignUp && inviterInfo 
                  ? `You've been invited by ${inviterInfo.name} to join ${inviterInfo.familyName}`
                  : isSignUp ? 'Set up your family account to get started' : 'Sign in to manage quests and rewards'
                }
              </p>
            </div>

            <form onSubmit={handleRealAuthSubmit} className="space-y-3">
              {realAuthError && (
                <div className="space-y-2">
                  <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{realAuthError}</span>
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-[9px] font-mono font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>
                  Parent Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className={`input-field ${styles.inputBg}`}
                />
              </div>

              {isSignUp && (
                <>
                  <div>
                    <label className={`block text-[9px] font-mono font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.g. Mum, Dad, etc."
                      required
                      className={`input-field ${styles.inputBg}`}
                    />
                  </div>

                  {!hasShareToken && (
                    <div>
                      <label className={`block text-[9px] font-mono font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>
                        Family Name
                      </label>
                      <input
                        type="text"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        placeholder="E.g. The Smiths"
                        required
                        className={`input-field ${styles.inputBg}`}
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className={`block text-[9px] font-mono font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>
                  Password
                </label>
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
                {isSignUp ? 'CREATE MY ACCOUNT' : 'SIGN IN TO PORTAL'}
              </Button>
            </form>

            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => {
                  playSound.click();
                  setIsSignUp(!isSignUp);
                }}
                id="toggle-sign-up"
              >
                {isSignUp ? '← USE EXISTING ACCOUNT' : 'CREATE A NEW ACCOUNT'}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Small security compliance tags */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-xl bg-warning/15 text-dark">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase`}>SECURE CLOUD</span>
              <span className={`text-[11px] font-bold ${styles.textColor}`}>Cross-Device Sync</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-xl bg-danger/10 text-danger">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <span className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase`}>PRIVACY SAFE</span>
              <span className={`text-[11px] font-bold ${styles.textColor}`}>Safe & Family Friendly</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Console */}
      <footer className={`w-full max-w-7xl mx-auto px-6 py-6 border-t ${styles.divider} text-center text-xs ${styles.textMuted} mt-auto flex flex-col sm:flex-row justify-between items-center gap-4 relative z-20`}>
        <div>
          © 2026 Reward Chart. Transforming family responsibilities into magical digital conquests.
        </div>
        <div className="flex gap-4 font-mono text-[10px]">
          <a href="#privacy" className="hover:text-stone-900 transition-colors">PRIVACY POLICY</a>
          <a href="#terms" className="hover:text-stone-900 transition-colors">TERMS OF SERVICE</a>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-600 font-bold animate-pulse uppercase">● SYSTEM ONLINE (v{pkg.version})</span>
        </div>
      </footer>
    </div>
  );
}
