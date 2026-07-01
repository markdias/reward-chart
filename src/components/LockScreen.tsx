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
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-md"
      id="lock-screen-container"
    >
      
      {/* Background neon elements */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(var(--color-dark)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border-2 border-neutral-border bg-surface-alt shadow-sm relative"
        id="lock-panel"
      >
        <div className="absolute inset-0  opacity-25 pointer-events-none" />

        {/* Vault Frame Header */}
        <div className="bg-surface p-6 text-center border-b border-neutral-border relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 left-4 p-2 rounded-xl border transition-all cursor-pointer bg-surface border-neutral-border text-dark hover:bg-surface-alt shadow-sm"
            id="lock-back-btn"
          >
            <ArrowLeft className="w-4 h-4 text-dark" />
          </button>
          
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border bg-warning/15 border-neutral-border text-dark shadow-[0_3px_0_0_var(--color-dark-shadow)]">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-black font-display tracking-wider uppercase text-dark">{title}</h2>
          <p className="font-mono text-[9px] tracking-widest mt-1 uppercase text-stone-500 font-bold">{subtitle}</p>
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
              placeholder="ENTER PASSWORD"
              className="w-full px-4 py-3.5 pr-12 rounded-2xl border bg-surface border-neutral-border text-dark font-mono text-center text-sm tracking-wide shadow-[0_3px_0_0_var(--color-dark-shadow)] focus:ring-2 focus:ring-warning outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                playSound.click();
                setShowPassword(!showPassword);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-dark p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-danger font-mono font-bold text-xs mb-6 flex items-center gap-1.5 uppercase tracking-wide bg-danger/10 px-3 py-1.5 rounded-lg border border-danger/30"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" /> PASSWORD DECRYPTION FAILURE
            </motion.p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 w-full max-w-sm">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 h-12 btn-secondary text-danger hover:bg-danger/10 border-neutral-border"
            >
              ABORT
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !password}
              className="flex-1 h-12 btn-warning"
            >
              {loading ? 'VERIFYING...' : 'DECRYPT'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
