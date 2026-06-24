import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Flame, Play, Star, ChevronRight, Lock, 
  ArrowLeft, CheckCircle, Gift, Sparkles, Smile, Target, Zap, RotateCcw, AlertTriangle, HelpCircle
} from 'lucide-react';
import { Child, Task, TaskCompletion, Reward } from '../types';
import { CHARACTER_PACKS, getCharacterStage } from '../data/characters';
import { playSound } from '../utils/sound';
import { ThemeId, THEME_PRESETS } from '../utils/theme';

interface ChildDashboardProps {
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  onCompleteTask: (taskId: string, childId: string) => void;
  onClaimReward: (rewardId: string, childId: string) => void;
  onEnterParentMode: () => void;
  theme: ThemeId;
}

export default function ChildDashboard({
  children,
  tasks,
  completions,
  rewards,
  onCompleteTask,
  onClaimReward,
  onEnterParentMode,
  theme
}: ChildDashboardProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeChildTab, setActiveChildTab] = useState<'tasks' | 'rewards'>('tasks');
  const [isFeeding, setIsFeeding] = useState(false);
  const [feedPowerups, setFeedPowerups] = useState<number>(3);
  
  // Character Evolution Special Cinematic State
  const [evolvingStage, setEvolvingStage] = useState<{
    childName: string;
    charName: string;
    fromStage: string;
    toStage: string;
    emoji: string;
  } | null>(null);

  const activeChild = children.find(c => c.id === selectedChildId);
  const activeChildStage = activeChild ? getCharacterStage(activeChild.character_id, activeChild.points) : null;
  const activeChildPack = activeChild ? CHARACTER_PACKS.find(cp => cp.id === activeChild.character_id) : null;

  const handleSelectChild = (id: string) => {
    playSound.click();
    setSelectedChildId(id);
    setFeedPowerups(3); // Reset powerups for feeding
  };

  const handleTaskCheck = (taskId: string) => {
    if (!selectedChildId) return;
    playSound.success();
    onCompleteTask(taskId, selectedChildId);
  };

  const handleClaimReward = (rewardId: string, cost: number) => {
    if (!activeChild) return;
    if (activeChild.points < cost) {
      playSound.pinError();
      return;
    }
    playSound.success();
    onClaimReward(rewardId, activeChild.id);
  };

  // Fun interactive "Feed Companion" action with sound & scaling state!
  const handleFeedCompanion = () => {
    if (feedPowerups <= 0) {
      playSound.pinError();
      return;
    }
    playSound.evolution();
    setIsFeeding(true);
    setFeedPowerups(prev => prev - 1);
    setTimeout(() => {
      setIsFeeding(false);
    }, 1200);
  };

  // Test Evolution manually to let kids experience the high-quality character milestone!
  const triggerManualEvolution = () => {
    if (!activeChild || !activeChildStage || !activeChildPack) return;
    
    // Find next stage
    const currentIdx = activeChildPack.stages.findIndex(s => s.stage_number === activeChildStage.stage_number);
    const nextStage = activeChildPack.stages[currentIdx + 1] || activeChildPack.stages[0];

    playSound.levelUp();
    setEvolvingStage({
      childName: activeChild.name,
      charName: activeChildPack.name.split(' the ')[0],
      fromStage: activeChildStage.name,
      toStage: nextStage.name,
      emoji: nextStage.emoji
    });
  };

  const styles = THEME_PRESETS[theme];

  return (
    <div className={`min-h-screen ${styles.bodyBg} flex flex-col font-sans relative overflow-hidden transition-colors duration-300`} id="child-root">
      
      {/* Immersive Starry Grid Backdrop */}
      <div className={`absolute inset-0 ${styles.gridStyle} pointer-events-none`} />
      {theme === 'cosmic_dark' ? (
        <>
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] ambient-glow-cyan pointer-events-none" />
          <div className="absolute bottom-12 left-1/4 w-[600px] h-[600px] ambient-glow-purple pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-12 left-1/4 w-[600px] h-[600px] bg-orange-200/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Evolution Pop-up Milestone Cinematic Overlay */}
      <AnimatePresence>
        {evolvingStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#040610]/95 flex flex-col items-center justify-center p-6 text-center"
            id="evolution-cinematic"
          >
            <div className="absolute inset-0 crt-overlay opacity-30 pointer-events-none" />
            
            <motion.div
              initial={{ scale: 0.8, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 8 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative max-w-lg bg-[#0b0f2a] border-4 border-cyan-400 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.4)] space-y-6"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-ping pointer-events-none" />
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-full text-xs font-bold uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> COMPANION UPGRADE
              </div>

              <h2 className="text-3xl font-black font-display bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent neon-glow-cyan">
                EVOLUTION TRIGGERED!
              </h2>

              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Spectacular progress! Companion <strong className="text-white">{evolvingStage.charName}</strong> is transmuting into a more powerful form!
              </p>

              {/* Evolution Pedestal Card */}
              <div className="my-8 relative flex items-center justify-center">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 blur-md opacity-75 animate-spin duration-[10s]" />
                <div className="relative h-44 w-44 rounded-full bg-slate-950 border-4 border-cyan-400 flex items-center justify-center text-8xl shadow-2xl animate-bounce-slow">
                  {evolvingStage.emoji}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">UPGRADED FORM SPEC</p>
                <h3 className="text-2xl font-black text-white mt-1 uppercase tracking-wide">{evolvingStage.toStage}</h3>
              </div>

              <button
                onClick={() => { playSound.success(); setEvolvingStage(null); }}
                className="w-full gamepad-button py-4 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-sm cursor-pointer shadow-lg"
                id="evolution-dismiss-btn"
              >
                HELL YEAH!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top-tier Console Navigation Bar */}
      <header className={`p-5 border-b ${styles.divider} flex justify-between items-center ${styles.headerBg} relative z-30`}>
        <div className="flex items-center gap-3">
          {selectedChildId ? (
            <button
              onClick={() => { playSound.click(); setSelectedChildId(null); }}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-mono font-bold ${
                theme === 'cosmic_dark'
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  : theme === 'sunny_toybox'
                    ? 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 shadow-sm font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm font-bold'
              }`}
              id="back-to-profiles-btn"
            >
              <ArrowLeft className={`w-4 h-4 ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-amber-500'}`} /> CHOOSE OPERATOR
            </button>
          ) : (
            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${theme === 'cosmic_dark' ? 'from-cyan-400 to-indigo-600' : 'from-amber-400 to-orange-500'} flex items-center justify-center text-lg shadow-md`}>
              🎮
            </div>
          )}
          <div>
            <span className={`text-sm font-black font-display tracking-widest uppercase ${styles.titleGradient}`}>
              KID CONTROL DECK
            </span>
            <span className={`hidden md:block text-[8px] font-mono tracking-widest ${styles.textMuted} font-bold`}>CABINET INTERFACE V2.5</span>
          </div>
        </div>

        <button
          onClick={() => { playSound.click(); onEnterParentMode(); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold font-mono cursor-pointer transition-all border ${
            theme === 'cosmic_dark'
              ? 'border-fuchsia-800/40 hover:border-fuchsia-400/40 bg-fuchsia-950/15 text-fuchsia-400 hover:text-fuchsia-300 shadow-sm shadow-fuchsia-500/5'
              : 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-sm font-bold'
          }`}
          id="parent-gate-lock-btn"
        >
          <Lock className={`w-3.5 h-3.5 ${theme === 'cosmic_dark' ? 'text-fuchsia-400 animate-pulse' : 'text-rose-500'}`} /> PARENT ACCESS
        </button>
      </header>

      {/* Central HUD Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center relative z-20" id="child-viewport">
        <AnimatePresence mode="wait">
          
          {/* PROFILE SELECTION GRID - Looks like an arcade game select screen */}
          {!selectedChildId ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              key="profile-selector"
              className="space-y-8 text-center"
              id="profile-picker"
            >
              <div className="space-y-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${styles.tagCategory} text-xs font-bold font-mono uppercase tracking-widest`}>
                  <Zap className="w-3.5 h-3.5 animate-pulse" /> INSERT PLAYER CHIP
                  </div>
                  <h1 className={`text-4xl md:text-5xl font-black font-display uppercase tracking-tight ${styles.titleColor}`}>
                    SELECT CHORE PILOT
                  </h1>
                  <p className={`text-xs sm:text-sm ${styles.textMuted} max-w-md mx-auto leading-relaxed`}>
                    Choose your family operator to access your quest diary, feed energy cells, and claim your physical prizes!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto pt-4" id="kids-deck">
                  {children.map((child) => {
                    const stage = getCharacterStage(child.character_id, child.points);
                    return (
                      <motion.div
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        key={child.id}
                        onClick={() => handleSelectChild(child.id)}
                        className={`cursor-pointer overflow-hidden rounded-3xl ${styles.cardBg} ${styles.borderStyle} p-6 flex flex-col items-center gap-5 text-center hover:border-cyan-500/50 transition-all shadow-xl relative group`}
                      >
                        {/* Upper fluorescent stripe */}
                        <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${stage.color_theme}`} />
                        
                        {/* Interactive Kid Avatar frame */}
                        <div className="relative mt-2">
                          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition-opacity" />
                          <img
                            src={child.avatar_url}
                            alt={child.name}
                            className={`w-24 h-24 rounded-2xl bg-slate-950 p-1.5 border-2 ${styles.divider} group-hover:border-white transition-all relative z-10 object-cover`}
                            referrerPolicy="no-referrer"
                          />
                          <span className={`absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-cyan-500 font-mono flex items-center justify-center text-xs font-extrabold border-2 ${theme === 'cosmic_dark' ? 'border-slate-950 text-slate-950' : 'border-white text-white'} z-20`}>
                            {child.level}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className={`font-black font-display text-xl ${styles.titleColor} tracking-wide group-hover:text-cyan-400 transition-colors`}>
                            {child.name}
                          </h3>
                          <div className="inline-flex items-center gap-1.5 text-xs text-orange-500 font-mono font-bold bg-orange-950/20 px-2.5 py-1 rounded-lg border border-orange-900/30">
                            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                            <span>STREAK: {child.streak_days} DAYS</span>
                          </div>
                        </div>

                        {/* Pet info banner */}
                        <div className={`w-full p-3 ${styles.innerCard} flex justify-between items-center`}>
                          <div className="text-left">
                            <span className={`block text-[8px] ${styles.textMuted} font-mono tracking-widest font-extrabold uppercase`}>ACTIVE PET</span>
                            <span className={`text-xs font-black ${styles.textColor} uppercase`}>{stage.name}</span>
                          </div>
                          <span className="text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{stage.emoji}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectChild(child.id);
                          }}
                          className={`w-full gamepad-button ${styles.btnPrimary} font-black py-3 rounded-xl text-xs uppercase tracking-widest cursor-pointer font-mono`}
                        >
                          INITIALIZE PILOT
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              
              /* ACTIVE PILOT ARCADE HUDS */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                key="kid-kiosk"
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                id="kid-dashboard-grid"
              >
                
                {/* Left Column: Star-Pet Feeding Station */}
                {activeChild && activeChildStage && activeChildPack && (
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Holo Pedestal */}
                    <div className={`p-6 rounded-3xl ${styles.cardBg} ${styles.borderStyle} flex flex-col items-center text-center relative overflow-hidden shadow-2xl`}>
                      
                      <div className="absolute inset-0 crt-overlay opacity-15 pointer-events-none" />
                      <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${activeChildStage.color_theme}`} />

                      <div className="flex justify-between w-full items-start mt-1">
                        <div className="text-left">
                          <span className={`text-[8px] font-mono tracking-widest uppercase ${styles.textMuted} font-extrabold`}>PET SPECIES</span>
                          <h3 className={`font-black ${styles.textColor} text-xs mt-0.5 uppercase tracking-wider`}>{activeChildStage.name}</h3>
                        </div>
                        <div className={`flex items-center gap-1.5 ${styles.tagCategory} px-3 py-1 rounded-lg`}>
                          <Star className={`w-3.5 h-3.5 ${theme === 'cosmic_dark' ? 'text-cyan-400 fill-current' : 'text-amber-500 fill-current'}`} />
                          <span className={`text-xs font-mono font-black ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-amber-600'}`}>{activeChild.points} GOLD</span>
                        </div>
                      </div>

                      {/* Giant Levitating Pedestal */}
                      <div className="my-8 relative flex items-center justify-center">
                        {/* Interactive floating particles */}
                        <div className="absolute h-40 w-40 rounded-full bg-gradient-to-tr from-cyan-400/10 to-purple-500/10 animate-spin duration-[15s]" />
                        
                        <motion.div
                          animate={isFeeding ? { scale: [1, 1.4, 0.9, 1.1, 1], rotate: [0, 15, -15, 0] } : {}}
                          transition={{ duration: 0.8 }}
                          className={`h-32 w-32 rounded-full bg-gradient-to-br ${activeChildStage.color_theme} flex items-center justify-center text-7xl shadow-2xl border-4 border-slate-950 relative z-10 cursor-pointer ${activeChildStage.animation_class}`}
                          onClick={handleFeedCompanion}
                        >
                          <span className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                            {activeChildStage.emoji}
                          </span>
                        </motion.div>

                        {/* Sparkle bursts when feeding */}
                        {isFeeding && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <span className="text-4xl animate-ping absolute">✨</span>
                            <span className="text-5xl animate-bounce absolute text-yellow-300">🍎</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 w-full">
                        <h4 className={`text-xl font-black font-display ${styles.titleColor}`}>{activeChildPack.name}</h4>
                        <p className={`text-xs ${styles.textMuted} leading-relaxed max-w-xs mx-auto`}>
                          "{activeChildStage.description}"
                        </p>
                      </div>

                      {/* Feed Active companion */}
                      <div className={`w-full mt-5 pt-5 border-t ${styles.divider} space-y-3`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-mono ${styles.textMuted}`}>FEED ENERGY PILLS:</span>
                          <span className={`font-mono ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-amber-600'} font-extrabold`}>{feedPowerups} LEFT</span>
                        </div>
                        <button
                          onClick={handleFeedCompanion}
                          disabled={feedPowerups <= 0}
                          className={`w-full py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            feedPowerups > 0
                              ? theme === 'cosmic_dark'
                                ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-slate-950 hover:from-orange-300 hover:to-amber-400 gamepad-button shadow-lg'
                                : 'bg-amber-400 border border-stone-950 text-stone-900 shadow-[0_3px_0_0_#1c1917]'
                              : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                          }`}
                        >
                          ⚡ INJECT PET FOOD CELL
                        </button>
                      </div>

                      {/* Level and evolution progression */}
                      <div className={`w-full pt-5 mt-5 border-t ${styles.divider} space-y-2.5`}>
                        <div className={`flex justify-between text-xs ${styles.textMuted} font-mono`}>
                          <span>XP PROGRESS</span>
                          <span className={`text-cyan-500 font-extrabold`}>LEVEL {activeChild.level}</span>
                        </div>
                        <div className={`w-full h-3 ${styles.innerCard} rounded-full overflow-hidden p-0.5`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${activeChild.xp_in_level}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full rounded-full bg-gradient-to-r ${activeChildStage.color_theme}`}
                          />
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className={`text-[10px] font-mono ${styles.textMuted} font-bold`}>XP BAR: {activeChild.xp_in_level} / 100</span>
                          
                          <button
                            onClick={triggerManualEvolution}
                            className={`text-[10px] font-black font-mono flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-lg border ${
                              theme === 'cosmic_dark'
                                ? 'text-pink-400 bg-pink-950/15 border-pink-900/20 hover:text-pink-300'
                                : 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100 font-bold shadow-sm'
                            }`}
                            id="evolve-test-btn"
                          >
                            ⭐ TEST EVOLVE
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Streak flame indicator */}
                    <div className={`p-4 rounded-3xl ${styles.cardBg} ${styles.borderStyle} flex items-center gap-4 shadow-xl`}>
                      <div className="h-12 w-12 rounded-2xl bg-orange-950/40 border border-orange-900/30 flex items-center justify-center relative">
                        <Flame className="w-7 h-7 text-orange-500 flame-active" />
                      </div>
                      <div>
                        <h4 className={`font-extrabold text-sm font-display ${styles.titleColor}`}>Daily Streak Active!</h4>
                        <p className={`text-xs ${styles.textMuted} leading-normal`}>
                          You've locked in a <span className="text-orange-500 font-mono font-bold">{activeChild.streak_days} Day Streak</span> by keeping chores up to speed!
                        </p>
                      </div>
                    </div>

                  </div>
                )}

                {/* Right Column: Chores / Prize Cabinet */}
                {activeChild && (
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Gamepad style switcher tabs */}
                    <div className={`flex gap-2 p-1 ${theme === 'cosmic_dark' ? 'bg-slate-950 border border-indigo-950/80' : 'bg-stone-100 border border-stone-200'} rounded-2xl`} id="kid-dashboard-tabs">
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('tasks'); }}
                        className={`flex-1 py-3.5 rounded-xl font-black text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'tasks'
                            ? theme === 'cosmic_dark'
                              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-md'
                              : 'bg-amber-400 border border-stone-950 text-stone-900 font-black shadow-sm'
                            : theme === 'cosmic_dark'
                              ? 'text-slate-400 hover:text-slate-200'
                              : 'text-stone-600 hover:text-stone-900 font-bold'
                        }`}
                      >
                        <Target className="w-4 h-4" /> QUEST LIST LISTING
                      </button>
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('rewards'); }}
                        className={`flex-1 py-3.5 rounded-xl font-black text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'rewards'
                            ? theme === 'cosmic_dark'
                              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-md'
                              : 'bg-amber-400 border border-stone-950 text-stone-900 font-black shadow-sm'
                            : theme === 'cosmic_dark'
                              ? 'text-slate-400 hover:text-slate-200'
                              : 'text-stone-600 hover:text-stone-900 font-bold'
                        }`}
                      >
                        <Gift className="w-4 h-4" /> PRIZE DISPENSER
                      </button>
                    </div>

                    {/* Active Screen Frame */}
                    <AnimatePresence mode="wait">
                      {activeChildTab === 'tasks' ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          key="child-tasks-tab"
                          className="space-y-4"
                          id="child-tasks-deck"
                        >
                          {tasks.filter(t => t.child_id === activeChild.id).length === 0 ? (
                            <div className={`p-10 text-center ${styles.cardBg} ${styles.borderStyle} rounded-3xl space-y-3`}>
                              <span className="text-5xl block animate-bounce-slow">🎉</span>
                              <h4 className={`font-extrabold ${styles.textColor} text-base`}>ALL QUESTS CRUSHED!</h4>
                              <p className={`text-xs ${styles.textMuted} max-w-xs mx-auto leading-relaxed`}>
                                You have conquered all assigned chores. Ask your parent to broadcast new missions!
                              </p>
                            </div>
                          ) : (
                            tasks.filter(t => t.child_id === activeChild.id).map((task) => {
                              const compl = completions.find(c => c.task_id === task.id);
                              const isPending = compl && compl.status === 'pending';
                              const isApproved = compl && compl.status === 'approved';

                              return (
                                <div
                                  key={task.id}
                                  className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                    isApproved 
                                      ? 'bg-slate-900/40 border-slate-950/50 opacity-45' 
                                      : isPending 
                                        ? 'bg-indigo-950/25 border-indigo-500/30' 
                                        : `${styles.cardBg} ${styles.borderStyle} hover:border-cyan-500/30 hover:shadow-lg`
                                  }`}
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${theme === 'cosmic_dark' ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-900/30' : 'text-amber-700 bg-amber-50 border border-amber-200'} px-2.5 py-0.5 rounded`}>
                                        {task.category.toUpperCase()}
                                      </span>
                                      {isPending && (
                                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${theme === 'cosmic_dark' ? 'text-indigo-400 bg-indigo-950/60 border border-indigo-900/30' : 'text-stone-700 bg-stone-100 border border-stone-200'} px-2.5 py-0.5 rounded animate-pulse`}>
                                          PENDING VERIFICATION
                                        </span>
                                      )}
                                    </div>
                                    <h4 className={`font-black font-display text-base tracking-wide ${isApproved ? 'line-through text-slate-500' : styles.titleColor}`}>
                                      {task.title}
                                    </h4>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                                    <span className={`font-mono font-extrabold text-xs px-3 py-1.5 rounded-xl border ${theme === 'cosmic_dark' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                                      +{task.points} GOLD
                                    </span>

                                    {isApproved ? (
                                      <span className={`px-3.5 py-2 rounded-xl font-mono text-[10px] font-bold uppercase ${theme === 'cosmic_dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                                        VERIFIED
                                      </span>
                                    ) : isPending ? (
                                      <span className={`px-3.5 py-2 rounded-xl font-mono text-[10px] font-bold uppercase animate-pulse ${theme === 'cosmic_dark' ? 'bg-indigo-500/10 text-indigo-300' : 'bg-stone-100 text-stone-600'}`}>
                                        AWAITING CHECK
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleTaskCheck(task.id)}
                                        className={`bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all font-mono ${theme === 'cosmic_dark' ? '' : 'bg-stone-900 hover:bg-stone-800 shadow-[0_3px_0_0_#1c1917]'}`}
                                        id={`claim-task-${task.id}`}
                                      >
                                        COMPLETE QUEST!
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </motion.div>
                      ) : (
                        
                        /* PRIZE CABINET CONTENT */
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          key="child-rewards-tab"
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          id="child-rewards-deck"
                        >
                          {rewards.filter(r => r.child_id === activeChild.id).length === 0 ? (
                            <div className={`col-span-2 p-10 text-center ${styles.cardBg} ${styles.borderStyle} rounded-3xl space-y-2`}>
                              <span className="text-5xl block animate-bounce-slow">🎁</span>
                              <h4 className={`font-extrabold ${styles.textColor}`}>DISPENSER EMPTY</h4>
                              <p className={`text-xs ${styles.textMuted}`}>Ask your parents to unlock custom prizes for you!</p>
                            </div>
                          ) : (
                            rewards.filter(r => r.child_id === activeChild.id).map((rew) => {
                              const isAffordable = activeChild.points >= rew.cost_points;
                              return (
                                <div
                                  key={rew.id}
                                  className={`p-5 rounded-3xl ${styles.cardBg} border transition-all flex items-center justify-between gap-4 ${
                                    isAffordable 
                                      ? `${styles.borderStyle} hover:border-cyan-500/30 hover:shadow-lg` 
                                      : 'opacity-60 border-slate-800/30'
                                  }`}
                                >
                                  <div className="flex gap-3.5 items-center">
                                    <div className={`h-12 w-12 rounded-2xl ${theme === 'cosmic_dark' ? 'bg-slate-950' : 'bg-stone-150 border border-stone-200'} flex items-center justify-center text-3xl`}>
                                      🎁
                                    </div>
                                    <div>
                                      <h4 className={`font-extrabold text-sm ${styles.titleColor} font-display tracking-wide`}>{rew.title}</h4>
                                      <p className={`text-[10px] font-mono ${styles.textMuted} uppercase mt-0.5`}>COST: {rew.cost_points} PTS</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className={`text-[10px] font-mono font-black ${isAffordable ? theme === 'cosmic_dark' ? 'text-amber-400' : 'text-amber-700' : 'text-slate-500'}`}>
                                      ⭐ {rew.cost_points} PTS
                                    </span>

                                    <button
                                      disabled={!isAffordable}
                                      onClick={() => handleClaimReward(rew.id, rew.cost_points)}
                                      className={`font-black font-mono py-2 px-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all ${
                                        isAffordable
                                          ? theme === 'cosmic_dark'
                                            ? 'bg-amber-400 hover:bg-amber-300 hover:scale-105 text-slate-950 font-black'
                                            : 'bg-amber-400 hover:bg-amber-300 border border-stone-950 text-stone-900 font-black shadow-[0_3px_0_0_#1c1917]'
                                          : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                      }`}
                                      id={`claim-reward-${rew.id}`}
                                    >
                                      DISPENSE
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    );
}
