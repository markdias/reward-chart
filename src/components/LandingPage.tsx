import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Gamepad2, Play, ArrowRight, Heart, Award, Zap, CircleDot, PiggyBank, Target, Utensils, Wrench } from 'lucide-react';
import { Button } from './ui/Button';
import { CoinBadge } from './CoinBadge';
import { playSound } from '../utils/sound';

import { getCharacterStage } from '../data/characters';
import pkg from '../../package.json';

interface LandingPageProps {
  onEnterArcade: () => void;
  onSignIn?: () => void;
  onJoinCode?: () => void;
}

const CAROUSEL_CHARACTERS = [
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
    id: 'dino', 
    name: 'Barnaby - Stegosaurus Overlord', 
    emoji: '🦕👑🌿', 
    type: 'Nature', 
    color: 'from-green-600 via-emerald-600 to-teal-700', 
    glow: 'shadow-emerald-500/30 border-emerald-500/40', 
    stats: { power: 98, fun: 90, brains: 85 }, 
    greeting: 'A giant, gentle dinosaur sporting glowing rainbow-colored tail plates!' 
  },
];

export default function LandingPage({ onEnterArcade, onSignIn, onJoinCode }: LandingPageProps) {
  const [selectedCharIndex, setSelectedCharIndex] = useState(0);
  
  const charactersWithImages = CAROUSEL_CHARACTERS.map(char => {
    const stage = getCharacterStage(char.id, 99);
    return {
      ...char,
      image: stage.image_url
    };
  });

  const activeChar = charactersWithImages[selectedCharIndex];
  const styles = {
    text: 'text-stone-900 dark:text-stone-50',
    textMuted: 'text-stone-500 dark:text-stone-400',
    bodyBg: 'bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-50',
    cardBg: 'bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-50',
    headerBg: 'bg-white/90 dark:bg-stone-900/90 border-b border-stone-100 dark:border-stone-800 backdrop-blur-md',
    btnPrimary: 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all uppercase tracking-wider rounded-2xl border-none',
    btnSecondary: 'bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-200 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[0.98] transition-all rounded-2xl',
    tabActive: 'bg-rose-400 text-white shadow-md shadow-rose-400/30 font-bold rounded-2xl',
    tabInactive: 'text-stone-400 hover:text-stone-600 bg-transparent',
    inputBg: 'bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl text-stone-900 dark:text-stone-50 placeholder-[#A8A29E] focus:bg-white dark:focus:bg-stone-900 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:outline-none transition-all',
    accentGlow: 'bg-orange-100/40 opacity-50',
    tagCategory: 'text-orange-600 bg-orange-50 border border-orange-100 font-bold uppercase rounded-full',
    gridStyle: 'scrolling-grid opacity-[0.03]',
    innerCard: 'bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl',
    titleGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent',
    divider: 'border-stone-100 dark:border-stone-800',
    overlayCrt: 'hidden',
    titleColor: 'text-[#1C1917] dark:text-stone-50',
    borderStyle: 'border-stone-100 dark:border-stone-800'
};

  const handleCharacterSelect = (index: number) => {
    setSelectedCharIndex(index);
    playSound.click();
  };

  const handleEnterClick = () => {
    playSound.click();
    onEnterArcade();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 flex flex-col font-sans relative overflow-x-hidden transition-colors duration-300" id="landing-page-root">
      
      {/* Clean White Header */}
      <header 
        className="w-full bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 relative z-40"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-3 sm:pb-4 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shadow-sm">
              <Gamepad2 className="w-6 h-6 text-orange-500 animate-pulse" />
            </div>
            <div>
              <Typography variant="h2" as="span">
                REWARD CHART
              </Typography>
              <span className="block text-[9px] sm:text-[10px] text-stone-600 dark:text-stone-300 font-sans tracking-widest font-extrabold uppercase mt-0.5">MAKE HABITS FUN</span>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <Button
              variant="warning"
              size="sm"
              onClick={() => {
                playSound.click();
                if (onSignIn) {
                  onSignIn();
                } else {
                  handleEnterClick();
                }
              }}
              id="landing-signin-btn"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-20 mt-6 sm:mt-10">
        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-sm border border-stone-200 dark:border-stone-700 p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Left Column: Marketing Info and CTA */}
          <div className="lg:col-span-6 flex flex-col space-y-8">
            <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-tight">
              A Reward System That Feels Like a <br className="hidden sm:block" />
              <span className={styles.titleGradient}>
                Magical Adventure
              </span>
            </h1>
            <p className={`${styles.textMuted} text-sm sm:text-base max-w-xl`}>
              Turn bed-making, tooth-brushing, and reading into gold coins. Power up, unlock legendary companions, learn money skills, and have fun!
            </p>
          </div>

          <div className="w-full pt-2 pb-4 flex justify-center">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={handleEnterClick}
            >
              Get Started
            </Button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase`}>SECURE CLOUD</span>
                <span className={`text-[11px] font-bold ${styles.textColor}`}>Cross-Device Sync</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <span className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase`}>MONEY SKILLS</span>
                <span className={`text-[11px] font-bold ${styles.textColor}`}>Savings & Earning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Evolved Companion Showcase */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
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
                    className="w-full h-full object-contain p-2 animate-bounce-slow drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] outline outline-1 -outline-offset-1 outline-black/10" 
                  />
                ) : (
                  <span className="text-6xl md:text-8xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] animate-bounce-slow">
                    {activeChar.emoji}
                  </span>
                )}
                
                {/* Floating energy star */}
                <div className="absolute top-2 right-2 text-yellow-300 animate-pulse text-lg">⭐</div>
              </motion.div>
              <span className={`mt-3 text-xs font-bold font-sans tracking-widest uppercase px-3 py-1 rounded-full ${styles.tagCategory}`}>
                CLASS: {activeChar.type}
              </span>
            </div>

            {/* Interactive Stats Panel & Speech Bubble */}
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-1">
                <h3 className={`text-xl font-black font-display tracking-wide ${styles.titleColor}`}>
                  {activeChar.name}
                </h3>
                <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl relative">
                  <div className="absolute left-4 -top-2 w-3 h-3 bg-[#F5F2EA] border-t border-l border-stone-200 dark:border-stone-700 rotate-45" />
                  <p className="text-xs italic text-stone-700 dark:text-stone-200">
                    "{activeChar.greeting}"
                  </p>
                </div>
              </div>

              {/* Progression Preview */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 space-y-3 mt-2">
                <div className="flex justify-between items-end">
                  <div>
                    <span className={`block text-[10px] font-sans font-bold tracking-wider ${styles.textMuted} uppercase mb-1`}>
                      LEVEL UP TO EVOLVE
                    </span>
                    <span className={`text-sm font-bold font-display ${styles.textColor}`}>
                      Level 4 <ArrowRight className="inline w-3 h-3 mx-1 text-stone-400" /> Level 5
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end animate-pulse">
                      <CoinBadge points={50} size="sm" />
                    </div>
                  </div>
                </div>
                
                <div className="h-3 bg-stone-200/80 rounded-full overflow-hidden p-0.5 border border-stone-300/50 relative">
                  <motion.div
                    initial={{ width: '40%' }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                  />
                  {/* Subtle shine effect on the bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white dark:bg-stone-900/20 rounded-t-full" />
                </div>
                
                <p className={`text-[11px] leading-tight ${styles.textMuted}`}>
                  Complete real-world tasks to earn Gold Coins. Leveling up unlocks new pots and evolves your companion!
                </p>
              </div>
            </div>
          </div>

          {/* Quick Select Character Carousel Grid */}
          <div className="space-y-2">
            <span className={`text-[10px] font-sans font-bold ${styles.textMuted} tracking-wider uppercase block`}>
              TAP TO PREVIEW COMPANIONS
            </span>
            <div className="grid grid-cols-6 gap-2" id="character-carousel-list">
              {charactersWithImages.map((char, index) => {
                const isSelected = selectedCharIndex === index;
                return (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleCharacterSelect(index)}
                    key={char.id}
                    className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected 
                        ? 'bg-warning/15 border-2 border-neutral-border shadow-[0_3px_0_0_var(--color-dark-shadow)]'
                        : 'bg-surface border-2 border-neutral-border text-dark dark:text-white hover:border-dark'
                    }`}
                  >
                    {char.image ? (
                      <img 
                        src={char.image} 
                        alt={char.name} 
                        className="w-full h-full object-contain p-1 outline outline-1 -outline-offset-1 outline-black/10"
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
        </div>
      </main>

      {/* Financial Literacy Journey Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 relative z-20">
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col items-center gap-10 md:gap-12">
            <div className="w-full space-y-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-200 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest font-sans">
                <PiggyBank className="w-4 h-4 text-amber-500" />
                LEARN REAL MONEY SKILLS
              </div>
              <Typography variant="h1" as="h2">
                A Financial Journey for Kids
              </Typography>
              <p className="text-sm md:text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto">
                Reward Chart isn't just about finishing tasks. It's about teaching the value of patience, planning, and delayed gratification through a fun, game-like economy.
              </p>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
              <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-5">
                  <CoinBadge iconOnly size="lg" />
                </div>
                <h3 className="text-stone-900 dark:text-stone-50 font-bold font-display text-lg mb-2">1. Earn & Manage</h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Complete real-world tasks to earn Gold Coins into their main wallet, learning the direct connection between work and reward.
                </p>
              </div>
              
              <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 mb-5 border border-sky-200">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-stone-900 dark:text-stone-50 font-bold font-display text-lg mb-2">2. Save for Goals</h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Unlock the Savings Pot as you level up! Move coins to protect them from impulse buys, set big goals, and track progress over time.
                </p>
              </div>

              <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 mb-5 border border-orange-200">
                  <Utensils className="w-6 h-6" />
                </div>
                <h3 className="text-stone-900 dark:text-stone-50 font-bold font-display text-lg mb-2">3. Weekly Budgeting</h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Level up to unlock the Food Pot and feed your digital pet! Teaches budgeting for recurring expenses and daily responsibility.
                </p>
              </div>

              <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-5 border border-rose-200">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-stone-900 dark:text-stone-50 font-bold font-display text-lg mb-2">4. Gifting & Generosity</h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Reach higher levels to unlock the Gifting Pot. Donate coins to charity or gift them to a sibling to learn the value of giving back!
                </p>
              </div>

              <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-500 mb-5 border border-amber-200">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-stone-900 dark:text-stone-50 font-bold font-display text-lg mb-2">5. Maintenance</h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Protect your wealth! Higher levels introduce the Gold Pot Maintenance cost. Keep it fixed or risk losing your hard-earned coins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Console */}
      <footer className={`w-full max-w-7xl mx-auto px-6 py-6 border-t ${styles.divider} text-center text-xs ${styles.textMuted} mt-auto flex flex-col sm:flex-row justify-between items-center gap-4 relative z-20`}>
        <div>
          © 2026 Reward Chart. Transforming family responsibilities into magical digital conquests.
        </div>
        <div className="flex gap-4 font-sans text-[10px]">
          <a href="#privacy" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">PRIVACY POLICY</a>
          <a href="#terms" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">TERMS OF SERVICE</a>
          <span className="text-stone-600 dark:text-stone-300">|</span>
          <span className="text-emerald-600 font-bold animate-pulse uppercase">● SYSTEM ONLINE (v{pkg.version})</span>
        </div>
      </footer>
    </div>
  );
}
