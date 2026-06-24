import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, Play, ShieldAlert, ArrowLeft, Terminal } from 'lucide-react';
import { playSound } from '../utils/sound';
import { ThemeId } from '../utils/theme';

interface LockScreenProps {
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  theme: ThemeId;
}

export default function LockScreen({
  correctPin,
  onSuccess,
  onClose,
  title = "SECURE DECRYPTION CHECK",
  subtitle = "Provide your 4-digit parent clearance PIN to unlock mission variables",
  theme
}: LockScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      playSound.click();
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setTimeout(() => {
            playSound.pinSuccess();
            onSuccess();
          }, 150);
        } else {
          setTimeout(() => {
            playSound.pinError();
            setError(true);
            setPin('');
            setTimeout(() => setError(false), 600);
          }, 150);
        }
      }
    }
  };

  const handleClear = () => {
    playSound.click();
    setPin('');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${theme === 'cosmic_dark' ? 'bg-[#03050c]/95' : 'bg-stone-950/80'} p-4 backdrop-blur-md`} id="lock-screen-container">
      
      {/* Background neon elements */}
      <div className={`absolute inset-0 ${theme === 'cosmic_dark' ? 'scrolling-grid opacity-10' : 'opacity-[0.03] bg-[radial-gradient(#1c1917_1.5px,transparent_1.5px)] [background-size:24px_24px]'} pointer-events-none`} />
      {theme === 'cosmic_dark' && (
        <div className="absolute h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-md overflow-hidden rounded-3xl border-2 ${
          theme === 'cosmic_dark'
            ? 'border-fuchsia-500/80 bg-[#090c23] shadow-[0_0_40px_rgba(217,70,239,0.3)]'
            : theme === 'sunny_toybox'
              ? 'border-stone-900 bg-[#FCFBF9] shadow-[0_4px_0_0_#1c1917]'
              : 'border-slate-300 bg-white shadow-lg'
        } relative`}
        id="lock-panel"
      >
        <div className="absolute inset-0 crt-overlay opacity-25 pointer-events-none" />

        {/* Vault Frame Header */}
        <div className={`${theme === 'cosmic_dark' ? 'bg-gradient-to-r from-fuchsia-600/20 to-purple-800/20' : 'bg-stone-50'} p-6 text-center border-b ${theme === 'cosmic_dark' ? 'border-fuchsia-950/60' : 'border-stone-200'} relative`}>
          <button 
            onClick={onClose} 
            className={`absolute top-4 left-4 p-2 rounded-xl border transition-all cursor-pointer ${
              theme === 'cosmic_dark'
                ? 'bg-slate-950 border-indigo-950 hover:border-fuchsia-500/30 text-slate-300'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 shadow-sm'
            }`}
            id="lock-back-btn"
          >
            <ArrowLeft className={`w-4 h-4 ${theme === 'cosmic_dark' ? 'text-fuchsia-400' : 'text-stone-700'}`} />
          </button>
          
          <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border ${
            theme === 'cosmic_dark'
              ? 'bg-[#03050c] border-fuchsia-500/40 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.2)]'
              : 'bg-amber-100 border-stone-900 text-stone-900 shadow-[0_3px_0_0_#1c1917]'
          }`}>
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className={`text-xl font-black font-display tracking-wider uppercase ${theme === 'cosmic_dark' ? 'text-white' : 'text-stone-900'}`}>{title}</h2>
          <p className={`font-mono text-[9px] tracking-widest mt-1 uppercase ${theme === 'cosmic_dark' ? 'text-fuchsia-300/80' : 'text-stone-500 font-bold'}`}>{subtitle}</p>
        </div>

        {/* PIN Indicators */}
        <div className="p-8 flex flex-col items-center">
          <motion.div 
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.3 }}
            className="flex gap-4 justify-center mb-6"
            id="pin-dots"
          >
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  error 
                    ? 'bg-rose-500 border-rose-500 scale-125' 
                    : idx < pin.length 
                      ? theme === 'cosmic_dark'
                        ? 'bg-cyan-400 border-cyan-400 scale-125 shadow-[0_0_12px_#22d3ee]'
                        : 'bg-amber-400 border-stone-900 scale-125 shadow-sm' 
                      : theme === 'cosmic_dark'
                        ? 'border-slate-800 bg-slate-950'
                        : 'border-stone-200 bg-stone-100'
                }`}
              />
            ))}
          </motion.div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-400 font-mono font-bold text-xs mb-4 flex items-center gap-1.5 uppercase tracking-wide bg-rose-950/20 px-3 py-1 rounded-lg border border-rose-900/30"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" /> PASSWORD DECRYPTION FAILURE
            </motion.p>
          )}

          {!error && (
            <div className={`font-mono text-[10px] mb-5 tracking-wide px-3 py-1.5 rounded-lg flex items-center gap-1 border ${
              theme === 'cosmic_dark'
                ? 'text-slate-400 bg-slate-950/80 border-indigo-950'
                : 'text-stone-600 bg-stone-100 border-stone-200 font-bold'
            }`}>
              <Terminal className={`w-3.5 h-3.5 ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-amber-500'}`} />
              <span>TEST BYPASS KEY: <span className="font-extrabold text-amber-500 text-xs">{correctPin}</span></span>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs" id="keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={num}
                onClick={() => handleKeyPress(num)}
                className={`h-16 rounded-2xl text-xl font-bold font-mono transition-all flex items-center justify-center cursor-pointer border ${
                  theme === 'cosmic_dark'
                    ? 'bg-slate-950 border-indigo-950/80 text-white shadow-md hover:border-fuchsia-500/40 active:bg-fuchsia-600 active:text-slate-950'
                    : 'bg-white border-stone-900 text-stone-900 shadow-[0_3px_0_0_#1c1917] hover:bg-stone-50 active:translate-y-0.5 active:shadow-[0_1px_0_0_#1c1917]'
                }`}
              >
                {num}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className={`h-16 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                theme === 'cosmic_dark'
                  ? 'bg-slate-950 border-indigo-950/50 hover:border-indigo-800/80 text-slate-500 hover:text-white'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-900 font-bold hover:bg-stone-100'
              }`}
            >
              CLEAR
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress('0')}
              className={`h-16 rounded-2xl text-xl font-bold font-mono transition-all flex items-center justify-center cursor-pointer border ${
                theme === 'cosmic_dark'
                  ? 'bg-slate-950 border-indigo-950/80 text-white shadow-md hover:border-fuchsia-500/40 active:bg-fuchsia-600 active:text-slate-950'
                  : 'bg-white border-stone-900 text-stone-900 shadow-[0_3px_0_0_#1c1917] hover:bg-stone-50 active:translate-y-0.5 active:shadow-[0_1px_0_0_#1c1917]'
              }`}
            >
              0
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`h-16 rounded-2xl border transition-all cursor-pointer flex items-center justify-center text-xs font-mono font-bold ${
                theme === 'cosmic_dark'
                  ? 'bg-rose-950/15 border-rose-950 text-rose-400 hover:bg-rose-950/30'
                  : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 shadow-[0_3px_0_0_#f43f5e]'
              }`}
            >
              ABORT
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
