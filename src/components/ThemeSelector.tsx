import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Paintbrush, X, Check, Heart, HelpCircle, Palette } from 'lucide-react';
import { ThemeId, THEME_PRESETS, ThemeStyles } from '../utils/theme';
import { playSound } from '../utils/sound';

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onThemeChange: (themeId: ThemeId) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: ThemeId) => {
    playSound.levelUp();
    onThemeChange(id);
  };

  const currentStyles = THEME_PRESETS[currentTheme];

  return (
    <div className="fixed bottom-4 left-4 z-50 font-sans" id="theme-selector-root">
      
      {/* Interactive Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 12 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          playSound.click();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-2 p-3.5 rounded-full font-mono text-xs font-black uppercase tracking-wider cursor-pointer shadow-xl border transition-all ${
          currentTheme === 'cosmic_dark'
            ? 'bg-slate-900 border-indigo-500/40 text-cyan-400 hover:text-cyan-300 shadow-cyan-500/10'
            : currentTheme === 'sunny_toybox'
              ? 'bg-amber-400 border-2 border-stone-900 text-stone-900 shadow-[0_4px_0_0_#1c1917]'
              : 'bg-white border border-slate-200 text-slate-800 shadow-slate-200/50'
        }`}
        title="Choose Theme Style"
      >
        <Palette className="w-5 h-5" />
        <span className="hidden sm:inline font-bold">Design Style</span>
      </motion.button>

      {/* Pop-up panel selection panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close click-away */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40" 
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.92 }}
              className={`fixed bottom-20 left-4 w-80 rounded-3xl p-5 border shadow-2xl z-50 ${
                currentTheme === 'cosmic_dark'
                  ? 'bg-[#090c23] border-indigo-950 text-slate-100'
                  : currentTheme === 'sunny_toybox'
                    ? 'bg-white border-3 border-[#E7E5E4] shadow-[0_6px_0_0_#E7E5E4] text-stone-800'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/50 mb-4">
                <div>
                  <h3 className="font-extrabold font-display text-sm uppercase tracking-wide">
                    CHOOSE APP DESIGN
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-mono">
                    3 CUSTOM PRESETS AVAILABLE
                  </p>
                </div>
                <button
                  onClick={() => {
                    playSound.click();
                    setIsOpen(false);
                  }}
                  className={`p-1 rounded-lg hover:opacity-80 cursor-pointer ${
                    currentTheme === 'cosmic_dark' ? 'text-slate-500' : 'text-stone-400'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Theme option buttons */}
              <div className="space-y-3">
                {(Object.keys(THEME_PRESETS) as ThemeId[]).map((themeId) => {
                  const theme = THEME_PRESETS[themeId];
                  const isSelected = themeId === currentTheme;
                  return (
                    <button
                      key={themeId}
                      onClick={() => handleSelect(themeId)}
                      className={`w-full text-left p-3.5 rounded-2xl flex items-start gap-3 border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? themeId === 'cosmic_dark'
                            ? 'bg-indigo-950/40 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                            : themeId === 'sunny_toybox'
                              ? 'bg-[#FDFBF7] border-amber-400 shadow-sm'
                              : 'bg-slate-50 border-cyan-500/80 shadow-sm'
                          : themeId === 'cosmic_dark'
                            ? 'bg-slate-950/40 border-transparent hover:border-slate-800 text-slate-400'
                            : 'bg-stone-50/50 border-transparent hover:border-stone-200 text-stone-600'
                      }`}
                    >
                      <span className="text-3xl shrink-0 p-1 bg-stone-100/50 rounded-xl">{theme.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs uppercase tracking-wide">
                            {theme.name}
                          </span>
                          {isSelected && (
                            <span className="h-4 w-4 bg-emerald-500 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white stroke-[4px]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          {theme.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/50 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Active: {currentStyles.name}</span>
                <span className="text-amber-500 font-bold">100% RESPONSIVE</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
