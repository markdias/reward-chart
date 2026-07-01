import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Gamepad2, Play, Lock, AlertCircle, Heart } from 'lucide-react';
import { playSound } from '../utils/sound';
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { getSupabaseClient, isSupabaseConfigured } from '../utils/supabase';
import { hashPassword, evaluatePassword } from '../utils/security';
import { PasswordInput } from './PasswordInput';
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
    <div className={`min-h-screen ${styles.bodyBg} flex flex-col font-sans relative overflow-x-hidden transition-colors duration-300`} id="auth-page-root">
      
      {/* Sweeping Curved Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[300px] sm:h-[350px] bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 rounded-b-[3rem] shadow-sm z-0 pointer-events-none transition-all duration-500"></div>

      {/* High-Tech Animated Background */}
      <div className={`absolute inset-0 ${styles.gridStyle} pointer-events-none z-10`} />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl pointer-events-none" />

      {/* Retro Header Console */}
      <header className={`w-full max-w-7xl mx-auto px-6 pt-safe-top pt-6 pb-6 flex items-center justify-between border-none relative z-40`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="mr-2 flex items-center gap-1 text-xs font-mono font-bold text-orange-100 hover:text-white transition-colors cursor-pointer bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded-full"
          >
            ← Back to Home
          </button>
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-orange-500/20 hidden sm:flex">
            <Gamepad2 className="w-6 h-6 text-orange-500 animate-pulse" />
          </div>
          <div>
            <span className={`text-2xl font-black font-display tracking-wider text-white drop-shadow-sm`}>
              REWARD CHART
            </span>
            <span className="block text-[9px] text-orange-100 font-mono tracking-widest font-extrabold">MAKE CHORES FUN</span>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center relative z-20 -mt-10 sm:-mt-16" id="login-form-panel">
        
        <div className="space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 sm:p-6 rounded-3xl ${styles.cardBg} space-y-4`}
          >
            <div className="text-center">
              <h3 className={`text-lg font-bold font-display ${styles.titleColor}`}>
                {isSignUp ? (hasShareToken ? 'JOIN FAMILY' : 'CREATE PARENT ACCOUNT') : 'SECURE PARENT LOGIN'}
              </h3>
              <p className={`text-xs ${styles.textMuted} mb-3`}>
                {hasShareToken && isSignUp && inviterInfo 
                  ? `You've been invited by ${inviterInfo.name} to join ${inviterInfo.familyName}`
                  : 'Requires parent credentials to manage quests and rewards'
                }
              </p>
            </div>

            <form onSubmit={handleRealAuthSubmit} className="space-y-3">
              {realAuthError && (
                <div className="space-y-2">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
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
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border ${styles.inputBg}`}
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
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border ${styles.inputBg}`}
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
                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border ${styles.inputBg}`}
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

              <button
                type="submit"
                className="w-full btn-primary py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-widest cursor-pointer mt-4 bg-stone-900 hover:bg-stone-800 text-white shadow-[0_3px_0_0_#1c1917]"
                id="real-login-submit"
              >
                {isSignUp ? 'CREATE MY ACCOUNT' : 'SIGN IN TO PORTAL'}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  playSound.click();
                  setIsSignUp(!isSignUp);
                }}
                className="text-xs text-stone-600 hover:text-stone-950 font-bold font-medium font-mono"
                id="toggle-sign-up"
              >
                {isSignUp ? '← USE EXISTING ACCOUNT' : 'CREATE A NEW ACCOUNT'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Small security compliance tags */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className={`p-3 rounded-2xl ${styles.innerCard} flex items-center gap-3`}>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase`}>SECURE CLOUD</span>
              <span className={`text-[11px] font-bold ${styles.textColor}`}>Cross-Device Sync</span>
            </div>
          </div>
          <div className={`p-3 rounded-2xl ${styles.innerCard} flex items-center gap-3`}>
            <div className="p-2 rounded-xl bg-red-100 text-red-500">
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
