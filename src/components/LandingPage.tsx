import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Gamepad2, Play, ArrowRight, Heart, Award, Zap, CircleDot } from 'lucide-react';
import { playSound } from '../utils/sound';
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { getCharacterStage } from '../data/characters';

interface LandingPageProps {
  onEnterArcade: () => void;
  theme: ThemeId;
}

const CAROUSEL_CHARACTERS = [
  { 
    id: 'dragon', 
    name: 'Ember - Inferno Emperor', 
    emoji: '🐉👑🔥', 
    type: 'Fire', 
    color: 'from-red-600 via-orange-600 to-rose-700', 
    glow: 'shadow-red-600/30 border-red-600/40', 
    stats: { power: 99, fun: 95, brains: 85 }, 
    greeting: 'A magnificent dragon that breathes rainbow sparks and floats with majestic wings!' 
  },
  { 
    id: 'unicorn', 
    name: 'Starry - Celestial Alicorn', 
    emoji: '👑🦄🌌', 
    type: 'Celestial', 
    color: 'from-fuchsia-600 via-indigo-600 to-pink-500', 
    glow: 'shadow-pink-500/30 border-pink-500/40', 
    stats: { power: 85, fun: 99, brains: 95 }, 
    greeting: 'The supreme form of Starry, boasting grand wings of starfire. Supercharged by good behavior!' 
  },
  { 
    id: 'robot', 
    name: 'Sparky - Mecha-Guardian Alpha', 
    emoji: '🦁🤖⚡', 
    type: 'Tech', 
    color: 'from-blue-600 via-cyan-600 to-violet-700', 
    glow: 'shadow-cyan-500/30 border-cyan-500/40', 
    stats: { power: 90, fun: 88, brains: 99 }, 
    greeting: 'Armed with helpful tools and protective forcefields, powered entirely by child responsibility.' 
  },
  { 
    id: 'dino', 
    name: 'Barnaby - Stegosaurus Overlord', 
    emoji: '🦕👑🌿', 
    type: 'Nature', 
    color: 'from-green-600 via-emerald-600 to-teal-700', 
    glow: 'shadow-emerald-500/30 border-emerald-500/40', 
    stats: { power: 98, fun: 90, brains: 85 }, 
    greeting: 'A giant, gentle dinosaur sporting glowing rainbow-colored tail plates!' 
  },
  { 
    id: 'cat', 
    name: 'Pippin - Archmage Familiar', 
    emoji: '🌌🧙‍♂️🐈‍⬛', 
    type: 'Magic', 
    color: 'from-purple-600 via-indigo-700 to-blue-600', 
    glow: 'shadow-purple-500/30 border-purple-500/40', 
    stats: { power: 85, fun: 95, brains: 99 }, 
    greeting: 'Surrounded by floating magical scrolls, holding a glowing star-tipped wand.' 
  },
  { 
    id: 'bunny', 
    name: 'Nebula - Galaxy Vanguard', 
    emoji: '🐰🌟🛰️', 
    type: 'Cosmic', 
    color: 'from-violet-600 via-indigo-600 to-fuchsia-700', 
    glow: 'shadow-violet-500/30 border-violet-500/40', 
    stats: { power: 92, fun: 95, brains: 90 }, 
    greeting: 'Riding a mini cosmic speeder, charting new chore systems across the universe.' 
  },
];

export default function LandingPage({ onEnterArcade, theme }: LandingPageProps) {
  const [selectedCharIndex, setSelectedCharIndex] = useState(0);
  
  const charactersWithImages = CAROUSEL_CHARACTERS.map(char => {
    const stage = getCharacterStage(char.id, 4);
    return {
      ...char,
      image: stage.image_url
    };
  });

  const activeChar = charactersWithImages[selectedCharIndex];
  const styles = THEME_PRESETS[theme];

  const handleCharacterSelect = (index: number) => {
    setSelectedCharIndex(index);
    playSound.click();
  };

  const handleEnterClick = () => {
    playSound.levelUp();
    onEnterArcade();
  };

  return (
    <div className={`min-h-screen ${styles.bodyBg} flex flex-col font-sans relative overflow-hidden transition-colors duration-300`} id="landing-page-root">
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

        <button
          onClick={handleEnterClick}
          className={`gamepad-button ${styles.btnPrimary} py-2 px-5 rounded-xl text-xs uppercase font-display tracking-wide flex items-center gap-1.5`}
          id="landing-signin-btn"
        >
          Sign In
        </button>
      </header>

      {/* Main Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-20">
        {/* Left Column: Marketing Info and CTA */}
        <div className="lg:col-span-6 flex flex-col space-y-8">
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

          <button
            onClick={handleEnterClick}
            className={`w-full max-w-md gamepad-button ${styles.btnPrimary} py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg cursor-pointer text-base uppercase font-display tracking-wide`}
            id="landing-cta-btn"
          >
            <Play className="w-5 h-5 fill-current" /> ENTER THE ARCADE
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Value Badges */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
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

        {/* Right Column: Evolved Companion Showcase */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
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
                {activeChar.image ? (
                  <img 
                    src={activeChar.image} 
                    alt={activeChar.name} 
                    className="w-full h-full object-contain p-2 animate-bounce-slow drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" 
                  />
                ) : (
                  <span className="text-6xl md:text-8xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] animate-bounce-slow">
                    {activeChar.emoji}
                  </span>
                )}
                
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
              TAP TO SWITCH COMPANIONS (FULLY EVOLVED)
            </span>
            <div className="grid grid-cols-6 gap-2" id="character-carousel-list">
              {charactersWithImages.map((char, index) => {
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
                    {char.image ? (
                      <img 
                        src={char.image} 
                        alt={char.name} 
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl">{char.emoji}</span>
                    )}
                    {isSelected && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400" />
                    )}
                  </motion.button>
                );
              })}
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
