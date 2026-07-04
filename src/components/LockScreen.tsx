import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ShieldAlert, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { playSound } from '../utils/sound';
import { ThemeId } from '../utils/theme';
import { getSupabaseClient } from '../utils/supabase';
import { hashPassword } from '../utils/security';

interface LockScreenProps {
  parentEmail: string | null;
  onSuccess: () => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  theme: ThemeId;
}

export default function LockScreen({
  parentEmail,
  onSuccess,
  onClose,
  title = "SECURE DECRYPTION CHECK",
  subtitle = "Provide your parent account password to unlock mission variables",
  theme
}: LockScreenProps) {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError(false);
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      if (supabase && parentEmail && parentEmail !== 'demo_parent@rewardchart.app') {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: parentEmail,
          password: password,
        });

        if (authError) {
          setError(true);
          playSound.pinError();
        } else {
          playSound.pinSuccess();
          onSuccess();
        }
      } else {
        // Offline / Local / Demo fallback
        const emailKey = (parentEmail || 'demo_parent@rewardchart.app').trim().toLowerCase();
        const stored = localStorage.getItem('RCH_LOCAL_CREDENTIALS');
        const creds = stored ? JSON.parse(stored) : {};
        const savedPass = creds[emailKey];

        const isCorrect = (savedPass && savedPass === password) ||
                          (emailKey === 'demo_parent@rewardchart.app' && (password === 'password' || password === '1234'));

        // Check if the stored credentials contains a SHA-256 hash (64 hex characters)
        let matched = false;
        if (savedPass && savedPass.length === 64) {
          const computedHash = await hashPassword(password, emailKey);
          matched = computedHash === savedPass;
        } else {
          // Fallback to legacy plaintext check
          matched = isCorrect;
        }

        if (matched) {
          playSound.pinSuccess();
          onSuccess();
        } else {
          setError(true);
          playSound.pinError();
        }
      }
    } catch (err) {
      setError(true);
      playSound.pinError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      id="lock-screen-container"
    >

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl relative"
        id="lock-panel"
      >
        {/* Vault Frame Header */}
        <div className="bg-gray-50/50 p-6 text-center border-b border-gray-100 relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 left-4 p-2.5 rounded-xl transition-all cursor-pointer bg-white border border-gray-200 text-stone-600 hover:bg-gray-50 shadow-sm"
            id="lock-back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold font-display tracking-wide text-slate-900">{title}</h2>
          <p className="font-mono text-[10px] tracking-widest mt-1.5 uppercase text-stone-500 font-bold">{subtitle}</p>
        </div>

        {/* Password Entry Form */}
        <form onSubmit={handleVerify} className="p-8 flex flex-col items-center w-full">
          <div className="w-full max-w-sm mb-6 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Enter Password"
              className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-gray-200 bg-gray-50 text-slate-900 font-mono text-center text-sm shadow-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all placeholder:text-stone-400"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                playSound.click();
                setShowPassword(!showPassword);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 font-mono font-bold text-[10px] mb-6 flex items-center justify-center gap-1.5 uppercase tracking-wider bg-red-50 px-3 py-2 rounded-xl border border-red-100 w-full max-w-sm"
            >
              <ShieldAlert className="w-4 h-4" /> Incorrect Password
            </motion.p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border-2 border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-xs hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 font-display uppercase tracking-wider shadow-lg ${
                loading || !password ? 'bg-orange-300 text-white cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {loading ? 'Verifying...' : 'Unlock'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
