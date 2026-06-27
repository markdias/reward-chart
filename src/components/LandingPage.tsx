import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Gamepad2, Play, ArrowRight, Heart, Award, Zap, CircleDot, PiggyBank, Coins, Target, Utensils } from 'lucide-react';
import { playSound } from '../utils/sound';
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { getCharacterStage } from '../data/characters';

interface LandingPageProps {
  onEnterArcade: (role: 'parent' | 'child') => void;
  theme: ThemeId;
  onSignIn?: () => void;
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

export default function LandingPage({ onEnterArcade, theme, onSignIn }: LandingPageProps) {
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

  const handleEnterClick = (role: 'parent' | 'child') => {
    playSound.levelUp();
    onEnterArcade(role);
  };

  return (
    <div className={`min-h-screen ${styles.bodyBg} flex flex-col font-sans relative overflow-hidden transition-colors duration-300`} id="landing-page-root">
      {/* High-Tech Animated Background */}
      <div className={`absolute inset-0 ${styles.gridStyle} pointer-events-none`} />
      <div className="absolute top-10 left-10 w-96 h-96 bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl pointer-events-none" />

      {/* Retro Header Console */}
      <header className={`w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b ${styles.divider} relative z-20`}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Gamepad2 className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <span className={`text-2xl font-black font-display tracking-wider ${styles.titleGradient}`}>
              REWARD CHART
            </span>
            <span className="block text-[9px] text-[#78716C] font-mono tracking-widest font-extrabold">MAKE CHORES FUN</span>
          </div>
        </div>

        <button
          onClick={() => {
            playSound.click();
            if (onSignIn) {
              onSignIn();
            } else {
              handleEnterClick('parent');
            }
          }}
          className={`gamepad-button ${styles.btnPrimary} py-2 px-5 rounded-xl text-xs uppercase font-display tracking-wide flex items-center gap-1.5`}
          id="landing-signin-btn"
        >
          Sign In
        </button>
      </header>

      {/* Main Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center relative z-20">
        {/* Left Column: Marketing Info and CTA */}
        <div className="lg:col-span-6 flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-widest font-mono">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" /> HOLOGRAPHIC LAUNCHER
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
              A Chore Chart That Feels Like a <br className="hidden sm:block" />
              <span className={styles.titleGradient}>
                Magical Adventure
              </span>
            </h1>
            <p className={`${styles.textMuted} text-xs sm:text-base max-w-xl`}>
              Turn bed-making, tooth-brushing, and reading into gold coins. Power up, unlock legendary companions, learn money skills, and have fun!
            </p>
          </div>

          <div className="w-full max-w-md pt-2 pb-4">
            <h3 className={`text-sm font-bold uppercase tracking-widest font-mono mb-3 ${styles.textMuted}`}>Who is starting the adventure today?</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleEnterClick('parent')}
                className={`flex-1 gamepad-button bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm border border-indigo-200 cursor-pointer text-sm uppercase font-display tracking-wide transition-all`}
              >
                I'm a Grown-up
              </button>
              <button
                onClick={() => handleEnterClick('child')}
                className={`flex-1 gamepad-button ${styles.btnPrimary} py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg cursor-pointer text-sm uppercase font-display tracking-wide`}
              >
                I'm a Kid <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3 max-w-lg">
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
            <div className={`p-3 rounded-2xl ${styles.innerCard} flex items-center gap-3`}>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <span className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase`}>MONEY SKILLS</span>
                <span className={`text-[11px] font-bold ${styles.textColor}`}>Savings & Earning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Evolved Companion Showcase */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div className={`p-4 sm:p-6 rounded-3xl ${styles.cardBg} relative overflow-hidden flex flex-col md:flex-row gap-6 items-center`}>
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
                  <div className="absolute left-4 -top-2 w-3 h-3 bg-[#F5F2EA] border-t border-l border-stone-200 rotate-45" />
                  <p className="text-xs italic text-stone-700">
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
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden p-0.5 border border-stone-300">
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
                        ? 'bg-amber-100 border-2 border-stone-900 shadow-[0_3px_0_0_#1c1917]'
                        : 'bg-white border-2 border-[#E7E5E4] text-stone-700 hover:border-stone-300'
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

      {/* Financial Literacy Journey Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 relative z-20">
        <div className={`p-8 sm:p-12 rounded-[2.5rem] bg-white border-4 border-stone-200 shadow-xl relative overflow-hidden`}>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col items-center gap-10 md:gap-12">
            <div className="w-full space-y-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-200 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest font-mono">
                <PiggyBank className="w-4 h-4 text-amber-500" />
                LEARN REAL MONEY SKILLS
              </div>
              <h2 className="text-3xl md:text-5xl font-black font-display text-stone-900">
                A Financial Journey for Kids
              </h2>
              <p className="text-sm md:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
                Reward Chart isn't just about finishing chores. It's about teaching the value of patience, planning, and delayed gratification through a fun, game-like economy.
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-500 mb-5 border border-amber-200">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-stone-900 font-bold font-display text-lg mb-2">1. Earn & Manage</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Complete real-world tasks to earn Gold Coins into their main wallet, learning the direct connection between work and reward.
                </p>
              </div>
              
              <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 mb-5 border border-sky-200">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-stone-900 font-bold font-display text-lg mb-2">2. Save for Goals</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Move coins into the secure Savings Pot to protect them from impulse buys. Set big goals and track progress over time.
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 mb-5 border border-orange-200">
                  <Utensils className="w-6 h-6" />
                </div>
                <h3 className="text-stone-900 font-bold font-display text-lg mb-2">3. Weekly Budgeting</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Allocate coins weekly to the Food Pot to feed their digital pet. Teaches budgeting for recurring expenses and responsibility!
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
