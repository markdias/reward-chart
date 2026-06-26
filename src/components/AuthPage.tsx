import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Gamepad2, Play, Lock, AlertCircle, Heart } from 'lucide-react';
import { playSound } from '../utils/sound';
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { getSupabaseClient, isSupabaseConfigured } from '../utils/supabase';

interface AuthPageProps {
  onStartDemo: () => void;
  onLoginReal: (email: string) => void;
  onBackToLanding: () => void;
  theme: ThemeId;
}

export default function AuthPage({ onStartDemo, onLoginReal, onBackToLanding, theme }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [familyName, setFamilyName] = useState('');
  const searchParams = new URLSearchParams(window.location.search);
  const hasShareToken = searchParams.has('share');

  const [isSignUp, setIsSignUp] = useState(hasShareToken);
  const [realAuthError, setRealAuthError] = useState('');
  
  const handleDemoClick = () => {
    playSound.levelUp();
    onStartDemo();
  };

  const getErrorMessage = (err: any): string => {
    if (!err) return 'Unknown connection or authentication error';
    if (typeof err === 'string') return err;
    
    const parts: string[] = [];
    const directMsg = err.message || err.error_description || err.error || (err.error && err.error.message);
    if (directMsg && typeof directMsg === 'string') {
      parts.push(directMsg);
    } else if (directMsg && typeof directMsg === 'object') {
      parts.push(directMsg.message || JSON.stringify(directMsg));
    }
    
    const code = err.code || err.status || (err.error && err.error.code);
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

  const handleLocalFallback = (emailVal: string, passVal: string, action: 'signup' | 'signin') => {
    const trimmedEmail = emailVal.trim().toLowerCase();
    const stored = localStorage.getItem('RCH_LOCAL_CREDENTIALS');
    const creds = stored ? JSON.parse(stored) : {};

    if (action === 'signup') {
      creds[trimmedEmail] = passVal;
      localStorage.setItem('RCH_LOCAL_CREDENTIALS', JSON.stringify(creds));
      playSound.pinSuccess();
      onLoginReal(trimmedEmail);
    } else {
      const savedPass = creds[trimmedEmail];
      if (savedPass && savedPass === passVal) {
        playSound.pinSuccess();
        onLoginReal(trimmedEmail);
      } else if (savedPass) {
        setRealAuthError('Incorrect PIN or password for this local account.');
        playSound.pinError();
      } else {
        creds[trimmedEmail] = passVal;
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

    if (!isSupabaseConfigured()) {
      handleLocalFallback(email, password, isSignUp ? 'signup' : 'signin');
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
                pin,
                family_name: familyName
              }
            }
          });
          if (error) {
            console.warn('Supabase signup error:', error);
            setRealAuthError(`${getErrorMessage(error)}. If your server is having issues, you can register locally below instead!`);
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
              onLoginReal(email);
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
            setRealAuthError(`${getErrorMessage(error)}. You can also log in locally below!`);
            playSound.pinError();
            return;
          }
        }
      } catch (err: any) {
        console.warn('Exception during auth submission:', err);
        setRealAuthError(`${getErrorMessage(err)}. Fall back to offline mode below if this persists.`);
        playSound.pinError();
        return;
      }
    } else {
      setRealAuthError('Supabase credentials are not saved. Try toggling to "Local Browser Storage" above!');
      playSound.pinError();
      return;
    }
    
    playSound.pinSuccess();
    onLoginReal(email);
  };

  const styles = THEME_PRESETS[theme];

  return (
    <div className={`min-h-screen ${styles.bodyBg} flex flex-col font-sans relative overflow-hidden transition-colors duration-300`} id="auth-page-root">
      
      {/* High-Tech Animated Background */}
      <div className={`absolute inset-0 ${styles.gridStyle} pointer-events-none`} />
      <div className="absolute top-10 left-10 w-96 h-96 bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl pointer-events-none" />

      {/* Retro Header Console */}
      <header className={`w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b ${styles.divider} relative z-20`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="mr-2 flex items-center gap-1 text-xs font-mono font-bold text-[#78716C] hover:text-[#292524] transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Gamepad2 className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <span className={`text-2xl font-black font-display tracking-wider ${styles.titleGradient}`}>
              KIDARCADE
            </span>
            <span className="block text-[9px] text-[#78716C] font-mono tracking-widest font-extrabold">SUPERHERO CHORE PROTOCOL</span>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 w-full max-w-md mx-auto px-6 py-10 flex flex-col justify-center relative z-20" id="login-form-panel">
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl ${styles.cardBg} space-y-4`}
          >
            <div className="text-center">
              <h3 className={`text-lg font-bold font-display ${styles.titleColor}`}>
                {isSignUp ? 'REGISTER MISSION CONTROL' : 'DECRYPT PARENT ACCESS'}
              </h3>
              <p className={`text-xs ${styles.textMuted} mb-3`}>
                Requires parent permission to adjust point allocations
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
                  Parent Identity (Email)
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
                      placeholder="E.g. Mummy, Daddy, Commander"
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

                  <div>
                    <label className={`block text-[9px] font-mono font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>
                      4-Digit App PIN (For Child Lock)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="1234"
                      required
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border tracking-widest ${styles.inputBg}`}
                    />
                  </div>
                </>
              )}

              <div>
                <label className={`block text-[9px] font-mono font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>
                  Secure Key / Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono border ${styles.inputBg}`}
                />
              </div>

              <button
                type="submit"
                className="w-full gamepad-button py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-widest cursor-pointer mt-4 bg-stone-900 hover:bg-stone-800 text-white shadow-[0_3px_0_0_#1c1917]"
                id="real-login-submit"
              >
                {isSignUp ? 'ESTABLISH FAMILY ZONE' : 'AUTHENTICATE SECURE ZONE'}
              </button>
            </form>

            {isSignUp && (
              <div className="p-3 border rounded-xl text-[11px] leading-relaxed space-y-1 bg-amber-50 border-amber-200 text-amber-800">
                <p className="font-bold flex items-center gap-1">💡 Supabase Setup Tip:</p>
                <p>1. Make sure you have executed the <strong>SQL Table Setup Script</strong> in your Supabase SQL Editor so the tables exist.</p>
                <p>2. Disable <strong>Confirm email</strong> in your Supabase Dashboard under <strong>Auth ➔ Providers ➔ Email</strong> to allow instant logins.</p>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  playSound.click();
                  setIsSignUp(!isSignUp);
                }}
                className="text-xs text-stone-600 hover:text-stone-950 font-bold font-medium font-mono"
                id="toggle-sign-up"
              >
                {isSignUp ? '← USE EXISTING KEY' : 'CREATE SECURE KEYZONE'}
              </button>
            </div>

            {/* Sandbox Demo access placed directly under standard login controls */}
            <div className={`mt-6 pt-6 border-t ${styles.divider} space-y-4`}>
              <div className="text-center">
                <span className={`block text-[10px] font-mono font-bold tracking-wider ${styles.textMuted} uppercase`}>
                  OR RUN CORE SIMULATION
                </span>
              </div>
              <button
                onClick={handleDemoClick}
                className={`w-full gamepad-button ${styles.btnPrimary} py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg cursor-pointer text-xs uppercase font-display tracking-wide`}
                id="try-demo-btn"
              >
                <Play className="w-4 h-4 fill-current animate-pulse" /> EXECUTE SANDBOX RUN
              </button>
              <p className={`text-[10px] text-center ${styles.textMuted} leading-relaxed`}>
                Test the arcade instantly with Leo & Chloe, pre-loaded gold, and sample chores.
              </p>
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
              <span className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase`}>OFFLINE ZONE</span>
              <span className={`text-[11px] font-bold ${styles.textColor}`}>Local Sandbox Save</span>
            </div>
          </div>
          <div className={`p-3 rounded-2xl ${styles.innerCard} flex items-center gap-3`}>
            <div className="p-2 rounded-xl bg-red-100 text-red-500">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <span className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase`}>COMPLIANCE</span>
              <span className={`text-[11px] font-bold ${styles.textColor}`}>COPPA Encrypted</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Console */}
      <footer className={`w-full max-w-7xl mx-auto px-6 py-6 border-t ${styles.divider} text-center text-xs ${styles.textMuted} mt-auto flex flex-col sm:flex-row justify-between items-center gap-4 relative z-20`}>
        <div>
          © 2026 KIDARCADE Corp. Transforming family responsibilities into magical digital conquests.
        </div>
        <div className="flex gap-4 font-mono text-[10px]">
          <a href="#privacy" className="hover:text-stone-900 transition-colors">PRIVACY_LEDGER</a>
          <a href="#terms" className="hover:text-stone-900 transition-colors">TERMS_OF_SERVICE</a>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-600 font-bold animate-pulse">● ENGINE_ONLINE_V2.0</span>
        </div>
      </footer>
    </div>
  );
}
