import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Star, Gamepad2, Play, Lock, AlertCircle, ArrowRight, Heart, Award, Cpu, Zap, CircleDot } from 'lucide-react';
import { playSound } from '../utils/sound';
import { createClient } from '@supabase/supabase-js';

import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { getSupabaseClient, SUPABASE_SETUP_SQL, getSupabaseConfig, isSupabaseConfigured } from '../utils/supabase';

interface AuthPageProps {
  onStartDemo: () => void;
  onLoginReal: (email: string) => void;
  theme: ThemeId;
}

const CAROUSEL_CHARACTERS = [
  { id: 'dragon', name: 'Ember the Fire Dragon', emoji: '🐲', type: 'Fire', color: 'from-orange-500 to-red-600', glow: 'shadow-red-500/30 border-red-500/40', stats: { power: 95, fun: 80, brains: 65 }, greeting: 'RAWR! Let\'s crush those chores!' },
  { id: 'unicorn', name: 'Starry the Pegasus', emoji: '🦄', type: 'Celestial', color: 'from-pink-400 to-fuchsia-600', glow: 'shadow-pink-500/30 border-pink-500/40', stats: { power: 60, fun: 95, brains: 85 }, greeting: 'Sparkles and magic! Routine is super fun!' },
  { id: 'robot', name: 'Bip-Bop Sparky', emoji: '🤖', type: 'Tech', color: 'from-cyan-400 to-blue-600', glow: 'shadow-cyan-500/30 border-cyan-500/40', stats: { power: 75, fun: 70, brains: 98 }, greeting: 'BEEP! Chore efficiency maximized!' },
  { id: 'dino', name: 'Barnaby Dino-Scout', emoji: '🦖', type: 'Nature', color: 'from-emerald-400 to-green-600', glow: 'shadow-emerald-500/30 border-emerald-500/40', stats: { power: 90, fun: 85, brains: 70 }, greeting: 'Stomp stomp! Ready for the daily mission!' },
  { id: 'cat', name: 'Pippin Wizard Cat', emoji: '🧙‍♀️', type: 'Magic', color: 'from-purple-500 to-indigo-600', glow: 'shadow-purple-500/30 border-purple-500/40', stats: { power: 70, fun: 90, brains: 92 }, greeting: 'Meow-gical! Let\'s brew some rewards!' },
  { id: 'bunny', name: 'Nebula Space Bunny', emoji: '🚀', type: 'Cosmic', color: 'from-violet-500 to-purple-800', glow: 'shadow-violet-500/30 border-violet-500/40', stats: { power: 80, fun: 88, brains: 82 }, greeting: 'Blast off! Streaks are going sky high!' },
];

export default function AuthPage({ onStartDemo, onLoginReal, theme }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [realAuthError, setRealAuthError] = useState('');
  const [selectedCharIndex, setSelectedCharIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'demo' | 'parent'>('demo');
  
  const initialConfig = getSupabaseConfig();
  const [connectionMode, setConnectionMode] = useState<'local' | 'supabase'>(
    isSupabaseConfigured() ? 'supabase' : 'local'
  );

  const [supabaseConfig, setSupabaseConfig] = useState({
    url: initialConfig.url,
    key: initialConfig.key
  });
  const [showDbConfig, setShowDbConfig] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed' | 'partial'>('idle');
  const [testError, setTestError] = useState('');

  const testConnection = async () => {
    playSound.click();
    setTestStatus('testing');
    setTestError('');
    
    const cleanUrl = supabaseConfig.url.trim() ? (supabaseConfig.url.trim().startsWith('http') ? supabaseConfig.url.trim() : 'https://' + supabaseConfig.url.trim()) : '';
    const cleanKey = supabaseConfig.key.trim();
    
    if (!cleanUrl || !cleanKey) {
      setTestStatus('failed');
      setTestError('Please enter both Supabase URL and Anon Key first.');
      playSound.pinError();
      return;
    }
    
    try {
      new URL(cleanUrl);
      
      const tempClient = createClient(cleanUrl, cleanKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      
      // 1. Handshake verification via getSession
      const { error: authError } = await tempClient.auth.getSession();
      if (authError) {
        setTestStatus('failed');
        setTestError(`Auth Handshake Failed: ${authError.message}`);
        playSound.pinError();
        return;
      }
      
      // 2. Query verification (checking schema and policies)
      const { error: queryError } = await tempClient.from('children').select('id').limit(1);
      if (queryError) {
        if (queryError.code === 'PGRST301' || queryError.message.includes('JWT') || queryError.message.includes('API key')) {
          setTestStatus('failed');
          setTestError(`API Key / Auth Error: ${queryError.message}`);
          playSound.pinError();
        } else if (queryError.message.includes('relation "children" does not exist')) {
          setTestStatus('partial');
          setTestError('Connection OK, but "children" table is missing. Run the SQL script below in your Supabase SQL Editor!');
          playSound.levelUp();
        } else {
          setTestStatus('partial');
          setTestError(`Connection OK, but DB query returned code ${queryError.code}: ${queryError.message}`);
          playSound.levelUp();
        }
        return;
      }
      
      setTestStatus('success');
      playSound.success();
    } catch (err: any) {
      setTestStatus('failed');
      setTestError(err?.message || 'Failed to connect. Check your network or URL correctness.');
      playSound.pinError();
    }
  };

  const handleDemoClick = () => {
    playSound.levelUp();
    onStartDemo();
  };

  const handleCharacterSelect = (index: number) => {
    setSelectedCharIndex(index);
    playSound.click();
  };

  const getErrorMessage = (err: any): string => {
    if (!err) return 'Unknown connection or authentication error';
    if (typeof err === 'string') return err;
    
    const parts: string[] = [];
    
    // 1. Direct message properties
    const directMsg = err.message || err.error_description || err.error || (err.error && err.error.message);
    if (directMsg && typeof directMsg === 'string') {
      parts.push(directMsg);
    } else if (directMsg && typeof directMsg === 'object') {
      parts.push(directMsg.message || JSON.stringify(directMsg));
    }
    
    // 2. Status / Code properties
    const code = err.code || err.status || (err.error && err.error.code);
    if (code) {
      parts.push(`(Code/Status: ${code})`);
    }
    
    // 3. Details / Hint
    const details = err.details || (err.error && err.error.details);
    if (details) {
      parts.push(`Details: ${details}`);
    }
    const hint = err.hint || (err.error && err.error.hint);
    if (hint) {
      parts.push(`Hint: ${hint}`);
    }
    
    // 4. Try toString if it looks customized
    if (typeof err.toString === 'function' && err.toString() !== '[object Object]') {
      const ts = err.toString();
      if (!parts.includes(ts)) {
        parts.unshift(ts);
      }
    }
    
    // 5. Fallback - inspect all object properties
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
      localStorage.setItem('SB_BYPASS', 'true');
      playSound.pinSuccess();
      onLoginReal(trimmedEmail);
    } else {
      const savedPass = creds[trimmedEmail];
      if (savedPass && savedPass === passVal) {
        localStorage.setItem('SB_BYPASS', 'true');
        playSound.pinSuccess();
        onLoginReal(trimmedEmail);
      } else if (savedPass) {
        setRealAuthError('Incorrect PIN or password for this local account.');
        playSound.pinError();
      } else {
        // Auto-register to be extremely helpful
        creds[trimmedEmail] = passVal;
        localStorage.setItem('RCH_LOCAL_CREDENTIALS', JSON.stringify(creds));
        localStorage.setItem('SB_BYPASS', 'true');
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

    // If local mode is active, execute local auth instantly
    if (connectionMode === 'local') {
      handleLocalFallback(email, password, isSignUp ? 'signup' : 'signin');
      return;
    }
    
    // Format and sanitize Supabase credentials before saving to localStorage
    const cleanUrl = supabaseConfig.url.trim() ? (supabaseConfig.url.trim().startsWith('http') ? supabaseConfig.url.trim() : 'https://' + supabaseConfig.url.trim()) : '';
    const cleanKey = supabaseConfig.key.trim();

    if (cleanUrl && cleanKey) {
      localStorage.setItem('SB_URL', cleanUrl);
      localStorage.setItem('SB_KEY', cleanKey);
      setSupabaseConfig({ url: cleanUrl, key: cleanKey });
    }

    // Force real Supabase connection attempt by clearing bypass mode
    localStorage.removeItem('SB_BYPASS');

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) {
            console.warn('Supabase signup error:', error);
            setRealAuthError(`${getErrorMessage(error)}. If your server is having issues, you can register locally below instead!`);
            playSound.pinError();
            return;
          }
          const session = data?.session;
          if (!session) {
            setRealAuthError('Sign up successful! Please check your email for verification link or sign in.');
            setIsSignUp(false); // Switch to sign in tab
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

  const saveDbConfig = () => {
    playSound.success();
    const cleanUrl = supabaseConfig.url.trim() ? (supabaseConfig.url.trim().startsWith('http') ? supabaseConfig.url.trim() : 'https://' + supabaseConfig.url.trim()) : '';
    const cleanKey = supabaseConfig.key.trim();
    localStorage.setItem('SB_URL', cleanUrl);
    localStorage.setItem('SB_KEY', cleanKey);
    setSupabaseConfig({ url: cleanUrl, key: cleanKey });
    setShowDbConfig(false);
  };

  const activeChar = CAROUSEL_CHARACTERS[selectedCharIndex];
  const styles = THEME_PRESETS[theme];

  return (
    <div className={`min-h-screen ${styles.bodyBg} flex flex-col font-sans relative overflow-hidden transition-colors duration-300`} id="auth-page-root">
      
      {/* High-Tech Animated Background */}
      <div className={`absolute inset-0 ${styles.gridStyle} pointer-events-none`} />
      {theme === 'cosmic_dark' ? (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
          <div className="absolute top-10 left-10 w-96 h-96 ambient-glow-cyan pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 ambient-glow-purple pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-10 left-10 w-96 h-96 bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Retro Header Console */}
      <header className={`w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b ${styles.divider} relative z-20`}>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${theme === 'cosmic_dark' ? 'from-cyan-400 via-indigo-500 to-purple-600' : 'from-amber-400 to-orange-500'} flex items-center justify-center shadow-lg`}>
            <Gamepad2 className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <span className={`text-2xl font-black font-display tracking-wider ${styles.titleGradient}`}>
              KIDARCADE
            </span>
            <span className={`block text-[9px] ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-[#78716C]'} font-mono tracking-widest font-extrabold`}>SUPERHERO CHORE PROTOCOL</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playSound.click();
              setShowDbConfig(!showDbConfig);
            }}
            className={`text-[10px] font-mono rounded-lg px-3 py-1.5 transition-all cursor-pointer border ${
              theme === 'cosmic_dark' 
                ? 'text-cyan-400 border-cyan-800/60 bg-cyan-950/30 hover:bg-cyan-950/80' 
                : theme === 'sunny_toybox'
                  ? 'text-stone-700 border-stone-300 bg-stone-50 hover:bg-stone-100 shadow-sm font-bold'
                  : 'text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100 shadow-sm font-bold'
            }`}
            id="database-config-toggle"
          >
            ⚙️ {supabaseConfig.url ? 'Connected Supabase DB' : 'Use Supabase Server'}
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch relative z-20">
        
        {/* Left Column: Holographic Arcade Cabinet Showcase */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme === 'cosmic_dark' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300' : 'bg-amber-100 border border-amber-200 text-amber-800'} text-xs font-bold uppercase tracking-widest font-mono`}>
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" /> HOLOGRAPHIC LAUNCHER
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight leading-tight">
              A Chore Chart That Feels Like a <br />
              <span className={`${styles.titleGradient} ${theme === 'cosmic_dark' ? 'neon-glow-cyan' : ''}`}>
                Virtual Pet Arcade
              </span>
            </h1>
            <p className={`${styles.textMuted} text-sm sm:text-base max-w-xl`}>
              Turn bed-making, tooth-brushing, and reading into gold coins. Power up, unlock legendary skins, and evolve your heroic beast!
            </p>
          </div>

          {/* Interactive Virtual Companion Holo-Deck */}
          <div className={`p-6 rounded-3xl ${styles.cardBg} relative overflow-hidden flex flex-col md:flex-row gap-6 items-center`}>
            
            {/* Ambient Scanlines */}
            <div className={`absolute inset-0 ${styles.overlayCrt} pointer-events-none`} />
            
            {/* Highlight Spotlight back-color glow */}
            <div className={`absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-30 bg-gradient-to-r ${activeChar.color}`} />

            {/* Huge holographic emoji card with live hover reflection */}
            <div className="relative shrink-0 flex flex-col items-center">
              <motion.div
                key={activeChar.id}
                initial={{ scale: 0.8, rotate: -15, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br ${activeChar.color} p-0.5 shadow-xl ${activeChar.glow} flex items-center justify-center relative group overflow-hidden`}
              >
                {/* Internal overlay shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="text-6xl md:text-8xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] animate-bounce-slow">
                  {activeChar.emoji}
                </span>
                
                {/* Floating energy star */}
                <div className="absolute top-2 right-2 text-yellow-300 animate-pulse text-lg">⭐</div>
              </motion.div>
              <span className={`mt-3 text-xs font-bold font-mono tracking-widest uppercase px-3 py-1 rounded-full ${styles.tagCategory}`}>
                CLASS: {activeChar.type}
              </span>
            </div>

            {/* Interactive Stats Panel & Speech Bubble */}
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-1">
                <h3 className={`text-xl font-black font-display tracking-wide ${styles.titleColor}`}>
                  {activeChar.name}
                </h3>
                <div className={`p-3 ${styles.innerCard} rounded-xl relative`}>
                  <div className={`absolute left-4 -top-2 w-3 h-3 ${theme === 'cosmic_dark' ? 'bg-slate-950/80 border-t border-l border-indigo-950/50' : theme === 'sunny_toybox' ? 'bg-[#F5F2EA] border-t border-l border-stone-200' : 'bg-slate-50 border-t border-l border-slate-200'} rotate-45`} />
                  <p className={`text-xs italic ${theme === 'cosmic_dark' ? 'text-cyan-200' : 'text-stone-700'}`}>
                    "{activeChar.greeting}"
                  </p>
                </div>
              </div>

              {/* Dynamic stats bars */}
              <div className="space-y-2">
                {[
                  { label: 'POWER SPEED', val: activeChar.stats.power, color: 'bg-rose-500' },
                  { label: 'CHORE MOTIVATION', val: activeChar.stats.fun, color: 'bg-amber-500' },
                  { label: 'BRAIN INTELLECT', val: activeChar.stats.brains, color: 'bg-emerald-500' }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className={`flex justify-between text-[10px] font-mono font-bold tracking-wider ${styles.textMuted}`}>
                      <span>{stat.label}</span>
                      <span className={styles.textColor}>{stat.val} XP</span>
                    </div>
                    <div className={`h-2 ${theme === 'cosmic_dark' ? 'bg-slate-950' : 'bg-stone-200'} rounded-full overflow-hidden p-0.5 border ${theme === 'cosmic_dark' ? 'border-slate-900' : 'border-stone-300'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.val}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${stat.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Select Character Carousel Grid */}
          <div className="space-y-2">
            <span className={`text-[10px] font-mono font-bold ${styles.textMuted} tracking-wider uppercase block`}>
              TAP TO SWITCH COMPANIONS & AUDIO SIGNALS
            </span>
            <div className="grid grid-cols-6 gap-2" id="character-carousel-list">
              {CAROUSEL_CHARACTERS.map((char, index) => {
                const isSelected = selectedCharIndex === index;
                return (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCharacterSelect(index)}
                    key={char.id}
                    className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected 
                        ? theme === 'cosmic_dark'
                          ? 'bg-indigo-900/30 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                          : theme === 'sunny_toybox'
                            ? 'bg-amber-100 border-2 border-stone-900 shadow-[0_3px_0_0_#1c1917]'
                            : 'bg-slate-100 border-2 border-cyan-500 shadow-sm'
                        : theme === 'cosmic_dark'
                          ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400'
                          : theme === 'sunny_toybox'
                            ? 'bg-white border-2 border-[#E7E5E4] text-stone-700 hover:border-stone-300'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl">{char.emoji}</span>
                    {isSelected && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Console Form Controller */}
        <div className="lg:col-span-5 flex flex-col justify-between" id="login-form-panel">
          
          <div className="space-y-6">
            
            {/* Supabase Pop-out overlay */}
            {showDbConfig && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl ${styles.cardBg} border-2 border-cyan-500 text-white shadow-2xl space-y-4`}
                id="supabase-config-box"
              >
                <h3 className="font-bold font-display text-sm flex items-center gap-2 text-cyan-300">
                  <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" /> CUSTOM CLOUD CONFIG
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Provide your own Supabase project details to save live database rows. Leave empty to use simulated high-fidelity client storage.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold font-mono text-cyan-500 uppercase tracking-wider mb-1">Supabase URL</label>
                    <input
                      type="text"
                      value={supabaseConfig.url}
                      onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                      placeholder="https://your-project.supabase.co"
                      className={`w-full px-3 py-2 text-xs rounded-xl ${styles.inputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold font-mono text-cyan-500 uppercase tracking-wider mb-1">Anon Key</label>
                    <input
                      type="password"
                      value={supabaseConfig.key}
                      onChange={(e) => setSupabaseConfig({ ...supabaseConfig, key: e.target.value })}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
                      className={`w-full px-3 py-2 text-xs rounded-xl ${styles.inputBg}`}
                    />
                  </div>
                </div>

                {/* Connection diagnostics display */}
                <div className="pt-2 border-t border-slate-850">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold font-mono text-cyan-500 uppercase tracking-wider">Connection Diagnostics</span>
                    <button
                      type="button"
                      onClick={testConnection}
                      disabled={testStatus === 'testing'}
                      className={`text-[9px] font-bold font-mono px-2 py-1 rounded-lg border uppercase transition-all ${
                        testStatus === 'testing'
                          ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                          : 'bg-cyan-950/40 text-cyan-400 border-cyan-800/80 hover:bg-cyan-900/40 cursor-pointer'
                      }`}
                    >
                      {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                  
                  {testStatus !== 'idle' && (
                    <div className={`p-2.5 rounded-xl border text-[10px] font-mono leading-relaxed ${
                      testStatus === 'success'
                        ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-400'
                        : testStatus === 'partial'
                          ? 'bg-amber-950/20 border-amber-800/60 text-amber-400'
                          : testStatus === 'testing'
                            ? 'bg-slate-900/60 border-slate-800 text-slate-400 animate-pulse'
                            : 'bg-red-950/20 border-red-900/60 text-red-400'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {testStatus === 'success' && <span>🟢 connection successful</span>}
                        {testStatus === 'partial' && <span>🟡 partial configuration</span>}
                        {testStatus === 'failed' && <span>🔴 connection failed</span>}
                        {testStatus === 'testing' && <span>⚡ pinging database...</span>}
                      </div>
                      
                      {testStatus === 'success' && (
                        <p>Fully connected to Supabase database! Your client is configured and the necessary tables exist.</p>
                      )}
                      
                      {(testStatus === 'failed' || testStatus === 'partial') && (
                        <p className="whitespace-pre-wrap">{testError}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => { playSound.click(); setShowSqlGuide(!showSqlGuide); }}
                    className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    🛠️ {showSqlGuide ? 'Hide' : 'Show'} SQL Table Setup Script
                  </button>
                  {showSqlGuide && (
                    <div className="mt-2 p-2 bg-slate-950 rounded-lg max-h-36 overflow-y-auto font-mono text-[9px] text-slate-400 select-all whitespace-pre-wrap border border-slate-800">
                      {SUPABASE_SETUP_SQL}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveDbConfig}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 py-2 rounded-lg text-xs font-bold font-mono text-slate-950 cursor-pointer transition-all"
                    id="db-save-btn"
                  >
                    SAVE & MOUNT
                  </button>
                  <button
                    onClick={() => setShowDbConfig(false)}
                    className="px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 py-2 rounded-lg text-xs text-slate-300 cursor-pointer"
                  >
                    CLOSE
                  </button>
                </div>
              </motion.div>
            )}

            {/* Custom Interactive Mode Controller Tab */}
            <div className={`grid grid-cols-2 p-1 rounded-xl ${theme === 'cosmic_dark' ? 'bg-[#090d22] border border-indigo-950/80' : 'bg-stone-100 border border-stone-200'}`}>
              <button
                onClick={() => { playSound.click(); setActiveTab('demo'); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold font-mono tracking-wide transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'demo'
                    ? theme === 'cosmic_dark'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-amber-400 border border-stone-950 text-stone-900 shadow-sm font-black'
                    : theme === 'cosmic_dark'
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-[#78716C] hover:text-[#292524]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> 1. Play Demo
              </button>
              <button
                onClick={() => { playSound.click(); setActiveTab('parent'); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold font-mono tracking-wide transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'parent'
                    ? theme === 'cosmic_dark'
                      ? 'bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white shadow-lg'
                      : 'bg-amber-400 border border-stone-950 text-stone-900 shadow-sm font-black'
                    : theme === 'cosmic_dark'
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-[#78716C] hover:text-[#292524]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> 2. Parent Login
              </button>
            </div>

            {/* Dynamic Card Container depending on active Tab */}
            <div className="min-h-[300px]">
              {activeTab === 'demo' ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-3xl ${styles.cardBg} relative overflow-hidden flex flex-col justify-between h-full space-y-6`}
                >
                  <div className={`absolute top-0 right-0 p-3 ${theme === 'cosmic_dark' ? 'text-cyan-500/10' : 'text-stone-300/10'} text-7xl font-black font-mono select-none`}>
                    DEMO
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] font-mono tracking-wider text-emerald-500 font-extrabold uppercase">
                        ARCADE CORE SIMULATION READY
                      </span>
                    </div>

                    <h3 className={`text-2xl font-black font-display ${styles.titleColor}`}>
                      Instant Access Mode
                    </h3>

                    <p className={`text-xs ${styles.textMuted} leading-relaxed`}>
                      Instantly spawn two profiles: <strong className="text-cyan-600 font-black">"Leo the Champion"</strong> & <strong className="text-pink-600 font-black">"Chloe the Adventurer"</strong>. Includes pre-set points, chore listings, and approval requests so you can test leveling up, unlocking pets, and parent authorizations immediately!
                    </p>

                    <div className={`p-3.5 ${styles.innerCard} space-y-2`}>
                      <div className={`flex items-center gap-2 text-xs font-mono ${theme === 'cosmic_dark' ? 'text-cyan-200' : 'text-stone-700 font-bold'}`}>
                        <Award className="w-4 h-4 text-yellow-500 fill-yellow-200" />
                        <span>Pre-loaded with 450 Gold Coins</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs font-mono ${theme === 'cosmic_dark' ? 'text-cyan-200' : 'text-stone-700 font-bold'}`}>
                        <CircleDot className="w-4 h-4 text-emerald-500 fill-emerald-150" />
                        <span>3 active custom chore submissions pending</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDemoClick}
                    className={`w-full gamepad-button ${styles.btnPrimary} py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg cursor-pointer text-base uppercase font-display tracking-wide`}
                    id="try-demo-btn"
                  >
                    <Play className="w-5 h-5 fill-current" /> EXECUTE CHORE RUN
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
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

                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-900/40 border border-stone-800/80 rounded-xl mb-1">
                      <button
                        type="button"
                        onClick={() => { playSound.click(); setConnectionMode('local'); }}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                          connectionMode === 'local'
                            ? 'bg-amber-500/25 border border-amber-500/50 text-amber-300 font-extrabold shadow-sm'
                            : 'text-stone-400 hover:text-stone-200 border border-transparent'
                        }`}
                      >
                        💾 Local Storage
                      </button>
                      <button
                        type="button"
                        onClick={() => { playSound.click(); setConnectionMode('supabase'); }}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                          connectionMode === 'supabase'
                            ? 'bg-indigo-500/25 border border-indigo-500/50 text-indigo-300 font-extrabold shadow-sm'
                            : 'text-stone-400 hover:text-stone-200 border border-transparent'
                        }`}
                      >
                        ☁️ Supabase Cloud
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleRealAuthSubmit} className="space-y-3">
                    {realAuthError && (
                      <div className="space-y-2">
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{realAuthError}</span>
                        </div>
                        {(realAuthError.includes('500') || realAuthError.toLowerCase().includes('retryable') || realAuthError.toLowerCase().includes('email') || realAuthError.toLowerCase().includes('mail')) && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-[11px] leading-relaxed space-y-1.5">
                            <span className="font-bold flex items-center gap-1 text-amber-400">💡 Supabase 500 Error Fix:</span>
                            <p>This is a common issue with new Supabase projects. By default, "Confirm email" is turned on, but their built-in mail server is heavily rate-limited and returns a 500 error.</p>
                            <ol className="list-decimal list-inside space-y-1 text-amber-200/90 font-mono text-[10px] pb-1.5">
                              <li>Go to your <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline hover:text-white">Supabase Dashboard</a></li>
                              <li>Go to <strong>Authentication</strong> ➔ <strong>Providers</strong> ➔ <strong>Email</strong></li>
                              <li>Turn <strong>OFF</strong> the "Confirm email" (or "Enable email confirmation") toggle</li>
                              <li>Click <strong>Save</strong> and try signing up again!</li>
                            </ol>
                            <div className="pt-2 border-t border-amber-500/20 flex flex-col gap-1.5">
                              <p className="text-[10px] text-amber-400/95 font-sans leading-relaxed">
                                Want to use the app immediately without waiting? You can bypass the auth block and enter Sandbox Mode under this email address. Your data will be saved safely in persistent local storage.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  playSound.success();
                                  localStorage.setItem('SB_BYPASS', 'true');
                                  onLoginReal(email.trim() || 'parent_sandbox@rewardchart.app');
                                }}
                                className="w-full text-center py-2 px-3 rounded-lg bg-amber-500 text-slate-950 font-extrabold font-mono text-[10px] uppercase hover:bg-amber-400 active:scale-95 transition-all cursor-pointer shadow-lg shadow-amber-950/20"
                              >
                                ⚡ Bypass & Run Sandbox Mode
                              </button>
                            </div>
                          </div>
                        )}
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

                    <div>
                      <label className={`block text-[9px] font-mono font-bold uppercase tracking-widest ${styles.textMuted} mb-1`}>
                        Secure Key / PIN
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
                      className={`w-full gamepad-button py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-widest cursor-pointer shadow-md mt-4 ${
                        theme === 'cosmic_dark' 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white' 
                          : 'bg-stone-900 hover:bg-stone-800 text-white shadow-[0_3px_0_0_#1c1917]'
                      }`}
                      id="real-login-submit"
                    >
                      {isSignUp ? 'ESTABLISH FAMILY ZONE' : 'AUTHENTICATE SECURE ZONE'}
                    </button>
                  </form>

                  {isSignUp && (
                    <div className={`p-3 border rounded-xl text-[11px] leading-relaxed space-y-1 ${
                      theme === 'cosmic_dark' 
                        ? 'bg-indigo-950/40 border-indigo-900 text-indigo-300' 
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <p className="font-bold flex items-center gap-1">💡 Supabase Setup Tip:</p>
                      <p>1. Make sure you have executed the <strong>SQL Table Setup Script</strong> (found in the settings panel above) in your Supabase SQL Editor so the tables exist.</p>
                      <p>2. By default, Supabase requires <strong>Email Confirmation</strong>. If you want instant sign-up/sign-in without checking your email, disable <strong>Confirm email</strong> in your Supabase Dashboard under <strong>Auth ➔ Providers ➔ Email</strong>.</p>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <button
                      onClick={() => {
                        playSound.click();
                        setIsSignUp(!isSignUp);
                      }}
                      className={`text-xs ${theme === 'cosmic_dark' ? 'text-pink-400 hover:text-pink-300' : 'text-stone-600 hover:text-stone-950 font-bold'} font-medium font-mono`}
                      id="toggle-sign-up"
                    >
                      {isSignUp ? '← USE EXISTING KEY' : 'CREATE SECURE KEYZONE'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

          </div>

          {/* Core Tech Stats Footer Info */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className={`p-3 rounded-2xl ${styles.innerCard} flex items-center gap-3`}>
              <div className={`p-2 rounded-xl ${theme === 'cosmic_dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-100 text-amber-600'}`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase`}>OFFLINE ZONE</span>
                <span className={`text-[11px] font-bold ${styles.textColor}`}>Local Sandbox Save</span>
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${styles.innerCard} flex items-center gap-3`}>
              <div className={`p-2 rounded-xl ${theme === 'cosmic_dark' ? 'bg-pink-500/10 text-pink-400' : 'bg-red-100 text-red-500'}`}>
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase`}>COMPLIANCE</span>
                <span className={`text-[11px] font-bold ${styles.textColor}`}>COPPA Encrypted</span>
              </div>
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
          <a href="#privacy" className={`hover:${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-stone-900'} transition-colors`}>PRIVACY_LEDGER</a>
          <a href="#terms" className={`hover:${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-stone-900'} transition-colors`}>TERMS_OF_SERVICE</a>
          <span className="text-slate-600">|</span>
          <span className={`${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-emerald-600'} font-bold animate-pulse`}>● ENGINE_ONLINE_V2.0</span>
        </div>
      </footer>
    </div>
  );
}
