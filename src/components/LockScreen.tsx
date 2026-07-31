import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'motion/react';
import { Lock, ShieldAlert, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { playSound } from '../utils/sound';

import { getSupabaseClient } from '../utils/supabase';
import { hashPassword } from '../utils/security';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface LockScreenProps {
  parentEmail: string | null;
  onSuccess: () => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  theme?: string;
  onLogout?: () => void;
}

export default function LockScreen({
  parentEmail,
  onSuccess,
  onClose,
  title = "Parent Authentication",
  subtitle = "Enter your parent account password to continue",
  theme,
  onLogout
}: LockScreenProps) {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  const handleResetPassword = async () => {
    if (!parentEmail) return;
    setResetLoading(true);
    setError(false);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(parentEmail);
        if (resetError) {
          setError(true);
          playSound.pinError();
        } else {
          setResetEmailSent(true);
          playSound.pinSuccess();
        }
      } else {
        // Offline / No supabase
        setError(true);
        playSound.pinError();
      }
    } catch (err) {
      setError(true);
      playSound.pinError();
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError(false);
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      if (supabase && parentEmail) {
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
        const emailKey = parentEmail ? parentEmail.trim().toLowerCase() : '';
        const stored = localStorage.getItem('RCH_LOCAL_CREDENTIALS');
        const creds = stored ? JSON.parse(stored) : {};
        const savedPass = creds[emailKey];

        const isCorrect = (savedPass && savedPass === password);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm"
      id="lock-screen-container"
    >

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-xl relative"
        id="lock-panel"
      >
        {/* Vault Frame Header */}
        <div className="bg-stone-50 dark:bg-stone-950/50 p-6 text-center border-b border-stone-100 dark:border-stone-800 relative">
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose} 
            className="absolute top-4 left-4"
            id="lock-back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 shadow-sm">
            <Lock className="w-6 h-6 text-stone-900 dark:text-stone-50" />
          </div>
          <Typography variant="h2">{title}</Typography>
          {parentEmail && (
            <div className="mt-2.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 max-w-xs truncate" title={parentEmail}>
                {parentEmail}
              </span>
            </div>
          )}
          <p className="text-xs mt-2 text-stone-500 dark:text-stone-400">{subtitle}</p>
        </div>

        {/* Password Entry Form */}
        <form onSubmit={handleVerify} className="p-8 flex flex-col items-center w-full">
          <div className="w-full max-w-sm mb-6 relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Enter Password"
              autoFocus
              inputClassName="!pr-12"
            />
            <Button
              variant="none"
              size="none"
              type="button"
              onClick={() => {
                playSound.click();
                setShowPassword(!showPassword);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1 cursor-pointer transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </Button>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 font-sans font-bold text-[10px] mb-6 flex items-center justify-center gap-1.5 uppercase tracking-wider bg-red-50 px-3 py-2 rounded-xl border border-red-100 w-full max-w-sm"
            >
              <ShieldAlert className="w-4 h-4" /> Incorrect Password
            </motion.p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 w-full max-w-sm">
            <Button
              variant="secondary"
              fullWidth
              className="flex-1"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="dark"
              fullWidth
              className="flex-1"
              type="submit"
              isLoading={loading}
              disabled={!password}
            >
              Unlock
            </Button>
          </div>

          {resetEmailSent && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 font-sans font-bold text-[10px] mt-4 flex items-center justify-center gap-1.5 uppercase tracking-wider bg-green-50 px-3 py-2 rounded-xl border border-green-100 w-full max-w-sm"
            >
              Reset link sent to your email
            </motion.p>
          )}

          <div className="flex items-center justify-between w-full max-w-sm mt-6 text-sm">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resetLoading || resetEmailSent}
              className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 disabled:opacity-50 transition-colors"
            >
              {resetLoading ? 'Sending...' : 'Forgot Password?'}
            </button>
            
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
              >
                Log Out
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
