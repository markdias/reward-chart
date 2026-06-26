import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Flame, Play, Star, ChevronRight, Lock, 
  ArrowLeft, CheckCircle, Gift, Sparkles, Smile, Target, Zap, RotateCcw, AlertTriangle, HelpCircle, TrendingUp
} from 'lucide-react';
import { Child, Task, TaskCompletion, Reward, RewardRedemption } from '../types';
import { CHARACTER_PACKS, getCharacterStage } from '../data/characters';
import { playSound } from '../utils/sound';
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { getCurrentWeekKey } from '../utils/date';

interface ChildDashboardProps {
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  onCompleteTask: (taskId: string, childId: string) => void;
  onClaimReward: (rewardId: string, childId: string) => void;
  onEnterParentMode: () => void;
  onFeedPet: (childId: string) => void;
  theme: ThemeId;
}

export default function ChildDashboard({
  children,
  tasks,
  completions,
  rewards,
  redemptions,
  onCompleteTask,
  onClaimReward,
  onEnterParentMode,
  onFeedPet,
  theme
}: ChildDashboardProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeChildTab, setActiveChildTab] = useState<'tasks' | 'rewards' | 'history'>('tasks');
  const [isFeeding, setIsFeeding] = useState(false);
  
  // Character Evolution Special Cinematic State
  const [evolvingStage, setEvolvingStage] = useState<{
    childName: string;
    charName: string;
    fromStage: string;
    toStage: string;
    emoji: string;
    image_url?: string;
    fromStageNumber?: number;
    fromImage?: string;
  } | null>(null);

  // Hatching animation phase state machine
  const [hatchPhase, setHatchPhase] = useState<'idle' | 'wobble' | 'crack' | 'split' | 'reveal'>('idle');
  const isHatching = evolvingStage?.fromStageNumber === 1;

  // Drive hatching animation sequence when evolution from egg is triggered
  useEffect(() => {
    if (!evolvingStage || !isHatching) {
      setHatchPhase('idle');
      return;
    }
    // Phase timeline: wobble → crack → split → reveal
    setHatchPhase('wobble');
    const t1 = setTimeout(() => setHatchPhase('crack'), 1500);
    const t2 = setTimeout(() => setHatchPhase('split'), 2800);
    const t3 = setTimeout(() => setHatchPhase('reveal'), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [evolvingStage, isHatching]);

  const activeChild = children.find(c => c.id === selectedChildId);
  const activeChildStage = activeChild ? getCharacterStage(activeChild.character_id, activeChild.level) : null;
  const activeChildPack = activeChild ? CHARACTER_PACKS.find(cp => cp.id === activeChild.character_id) : null;

  const pendingRedemptionsCost = activeChild ? redemptions
    .filter(r => r.child_id === activeChild.id && r.status === 'requested')
    .reduce((total, r) => {
      const rew = rewards.find(rw => rw.id === r.reward_id);
      return total + (rew ? rew.cost_points : 0);
    }, 0) : 0;

  const availablePoints = activeChild ? activeChild.points - pendingRedemptionsCost : 0;

  const handleSelectChild = (id: string) => {
    playSound.click();
    setSelectedChildId(id);
  };

  const handleTaskCheck = (taskId: string) => {
    if (!selectedChildId) return;
    playSound.success();
    onCompleteTask(taskId, selectedChildId);
  };

  const handleClaimReward = (rewardId: string, cost: number) => {
    if (!activeChild) return;
    if (availablePoints < cost) {
      playSound.pinError();
      return;
    }
    playSound.success();
    onClaimReward(rewardId, activeChild.id);
  };

  // Fun interactive "Feed Companion" action with sound & scaling state!
  const handleFeedCompanion = () => {
    if (!activeChild || (activeChild.pet_food || 0) <= 0) {
      playSound.pinError();
      return;
    }
    playSound.evolution();
    setIsFeeding(true);
    onFeedPet(activeChild.id);
    setTimeout(() => {
      setIsFeeding(false);
    }, 2500); // give it more time to show the happy animation
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
      emoji: nextStage.emoji,
      image_url: nextStage.image_url,
      fromStageNumber: activeChildStage.stage_number,
      fromImage: activeChildStage.image_url
    });
  };

  const styles = THEME_PRESETS[theme];

  const getRewardAvailability = (reward: Reward, childRedemptions: RewardRedemption[]) => {
    if (!reward.is_available) return { available: false, reason: 'CLAIMED' };
    if (!reward.limit_type || reward.limit_type === 'unlimited') return { available: true };

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (reward.limit_type === 'daily') {
      const todayClaims = childRedemptions.filter(r => 
        r.reward_id === reward.id && new Date(r.redeemed_at).getTime() >= startOfDay
      );
      if (todayClaims.length >= 1) return { available: false, reason: 'TOMORROW' };
    }

    if (reward.limit_type === 'twice_daily') {
      const todayClaims = childRedemptions.filter(r => 
        r.reward_id === reward.id && new Date(r.redeemed_at).getTime() >= startOfDay
      );
      if (todayClaims.length >= 2) return { available: false, reason: 'TOMORROW' };
      if (todayClaims.length === 1) {
        const lastClaimTime = new Date(todayClaims[0].redeemed_at).getTime();
        const hoursSinceLast = (now.getTime() - lastClaimTime) / (1000 * 60 * 60);
        if (hoursSinceLast < 6) return { available: false, reason: 'COOLDOWN' };
      }
    }

    return { available: true };
  };

  return (
    <div className={`min-h-screen ${styles.bodyBg} flex flex-col font-sans relative overflow-hidden transition-colors duration-300`} id="child-root">
      
      {/* Immersive Starry Grid Backdrop */}
      <div className={`absolute inset-0 ${styles.gridStyle} pointer-events-none`} />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 left-1/4 w-[600px] h-[600px] bg-orange-200/10 rounded-full blur-3xl pointer-events-none" />

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
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                {isHatching && hatchPhase !== 'reveal' ? 'EGG HATCHING...' : 'COMPANION UPGRADE'}
              </div>

              <h2 className="text-3xl font-black font-display bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent neon-glow-cyan">
                {isHatching && hatchPhase !== 'reveal' ? 'YOUR EGG IS HATCHING!' : 'EVOLUTION TRIGGERED!'}
              </h2>

              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {isHatching && hatchPhase !== 'reveal' ? (
                  <>Something magical is happening! <strong className="text-white">{evolvingStage.charName}</strong> is about to be born!</>
                ) : (
                  <>Spectacular progress! Companion <strong className="text-white">{evolvingStage.charName}</strong> is transmuting into a more powerful form!</>
                )}
              </p>

              {/* Evolution / Hatching Pedestal */}
              <div className="my-8 relative flex items-center justify-center" style={{ minHeight: '200px' }}>
                <div className={`absolute -inset-2 rounded-full bg-gradient-to-r ${
                  isHatching && hatchPhase !== 'reveal'
                    ? 'from-amber-400 via-pink-400 to-fuchsia-500'
                    : 'from-cyan-400 via-pink-500 to-purple-500'
                } blur-md opacity-75 animate-spin duration-[10s]`} />

                {/* Hatching sparkle particles */}
                {isHatching && (hatchPhase === 'crack' || hatchPhase === 'split') && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={`spark-${i}`}
                        initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.5, 0],
                          x: Math.cos((i / 8) * Math.PI * 2) * 120,
                          y: Math.sin((i / 8) * Math.PI * 2) * 120,
                        }}
                        transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' }}
                        className="absolute text-2xl pointer-events-none z-30"
                      >
                        {['✨', '⭐', '💫', '🌟', '✨', '💛', '⭐', '💫'][i]}
                      </motion.div>
                    ))}
                  </>
                )}

                {/* EGG phase — shows the egg wobbling and cracking */}
                {isHatching && hatchPhase !== 'reveal' && evolvingStage.fromImage && (
                  <motion.div
                    animate={
                      hatchPhase === 'wobble'
                        ? { rotate: [0, -8, 8, -12, 12, -6, 6, 0], scale: [1, 1.02, 1, 1.04, 1, 1.02, 1] }
                        : hatchPhase === 'crack'
                          ? { rotate: [0, -15, 15, -20, 20, -10, 10, 0], scale: [1, 1.08, 0.96, 1.1, 0.98, 1.06, 1] }
                          : { scale: [1, 1.3, 0], opacity: [1, 0.8, 0] } // split
                    }
                    transition={
                      hatchPhase === 'wobble'
                        ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                        : hatchPhase === 'crack'
                          ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                          : { duration: 1, ease: 'easeOut' }
                    }
                    className="relative h-44 w-44 rounded-full bg-white border-4 border-amber-400 flex items-center justify-center shadow-2xl overflow-hidden z-10"
                  >
                    <img src={evolvingStage.fromImage} alt="Egg" className="w-full h-full object-cover" />
                    {/* Crack overlay */}
                    {(hatchPhase === 'crack' || hatchPhase === 'split') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                          <motion.path
                            d="M50 10 L48 25 L55 35 L45 45 L52 55 L47 65 L50 80"
                            stroke="#1e1b4b"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                          <motion.path
                            d="M35 30 L42 38 L38 48 L45 52"
                            stroke="#1e1b4b"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                          />
                          <motion.path
                            d="M65 25 L58 35 L62 48"
                            stroke="#1e1b4b"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
                          />
                        </svg>
                        {/* Golden glow through cracks */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.6, 0.3, 0.8, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute inset-0 bg-gradient-to-tr from-amber-400/30 via-yellow-200/20 to-amber-400/30 rounded-full"
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* REVEAL phase — shows the hatched creature */}
                {(!isHatching || hatchPhase === 'reveal') && (
                  <motion.div
                    initial={isHatching ? { scale: 0.3, opacity: 0, y: 30 } : { scale: 1, opacity: 1 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={isHatching ? { type: 'spring', damping: 10, stiffness: 150, duration: 0.8 } : {}}
                    className={`relative h-44 w-44 rounded-full ${evolvingStage.image_url ? 'bg-white' : 'bg-slate-950'} border-4 border-cyan-400 flex items-center justify-center text-8xl shadow-2xl overflow-hidden z-10`}
                  >
                    {evolvingStage.image_url ? (
                      <img src={evolvingStage.image_url} alt={evolvingStage.toStage} className="w-full h-full object-cover" />
                    ) : (
                      <span>{evolvingStage.emoji}</span>
                    )}
                  </motion.div>
                )}

                {/* Burst effect on reveal */}
                {isHatching && hatchPhase === 'reveal' && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute w-44 h-44 rounded-full bg-gradient-to-r from-amber-300 via-pink-300 to-fuchsia-300 pointer-events-none z-0"
                  />
                )}
              </div>

              <div>
                <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                  {isHatching && hatchPhase !== 'reveal' ? 'HATCHING IN PROGRESS...' : 'UPGRADED FORM SPEC'}
                </p>
                <h3 className="text-2xl font-black text-white mt-1 uppercase tracking-wide">
                  {isHatching && hatchPhase !== 'reveal'
                    ? ['🥚 Wobbling...', '💥 Cracking!', '✨ Splitting open!'][['wobble', 'crack', 'split'].indexOf(hatchPhase)] || evolvingStage.toStage
                    : evolvingStage.toStage
                  }
                </h3>
              </div>

              <button
                onClick={() => { playSound.success(); setEvolvingStage(null); setHatchPhase('idle'); }}
                className={`w-full gamepad-button py-4 bg-gradient-to-r ${
                  isHatching && hatchPhase !== 'reveal'
                    ? 'from-amber-400 via-orange-500 to-pink-500 opacity-50 cursor-not-allowed'
                    : 'from-cyan-400 via-indigo-500 to-purple-600 cursor-pointer'
                } text-slate-950 font-black rounded-2xl uppercase tracking-widest text-sm shadow-lg`}
                id="evolution-dismiss-btn"
                disabled={isHatching && hatchPhase !== 'reveal'}
              >
                {isHatching && hatchPhase !== 'reveal' ? 'HATCHING...' : 'HELL YEAH!'}
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
                'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 shadow-sm font-bold'
              }`}
              id="back-to-profiles-btn"
            >
              <ArrowLeft className={`w-4 h-4 text-amber-500`} /> CHOOSE OPERATOR
            </button>
          ) : (
            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-md`}>
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
            'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-sm font-bold'
          }`}
          id="parent-gate-lock-btn"
        >
          <Lock className={`w-3.5 h-3.5 text-rose-500`} /> PARENT ACCESS
        </button>
      </header>

      {/* Central HUD Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col relative z-20 overflow-y-auto" id="child-viewport">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto pt-4" id="kids-deck">
                  {children.map((child) => {
                    const stage = getCharacterStage(child.character_id, child.level);
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
                          <span className={`absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-cyan-500 font-mono flex items-center justify-center text-xs font-extrabold border-2 border-white text-white z-20`}>
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
                          {stage.image_url ? (
                            <img src={stage.image_url} alt={stage.name} className="w-14 h-14 object-cover rounded-lg" />
                          ) : (
                            <span className="text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{stage.emoji}</span>
                          )}
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
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start pb-12"
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
                          <Star className={`w-3.5 h-3.5 text-amber-500 fill-current`} />
                          <span className={`text-xs font-mono font-black text-amber-600`}>{activeChild.points} GOLD</span>
                        </div>
                      </div>

                      {/* Giant Levitating Pedestal */}
                      <div className="my-8 relative flex items-center justify-center">
                        {/* Interactive floating particles */}
                        <div className="absolute h-40 w-40 rounded-full bg-gradient-to-tr from-cyan-400/10 to-purple-500/10 animate-spin duration-[15s]" />
                        
                        <motion.div
                          animate={isFeeding ? { scale: [1, 1.4, 0.9, 1.2, 1], rotate: [0, 20, -20, 10, -10, 0] } : {}}
                          transition={{ duration: 1.2 }}
                          className={`h-36 w-36 rounded-full ${activeChildStage.image_url ? 'bg-white' : `bg-gradient-to-br ${activeChildStage.color_theme}`} flex items-center justify-center shadow-2xl border-4 ${isFeeding ? 'border-pink-500 shadow-pink-500/50' : 'border-stone-300'} relative z-10 cursor-pointer ${activeChildStage.animation_class} transition-colors duration-500 overflow-hidden`}
                          onClick={handleFeedCompanion}
                        >
                          {activeChildStage.image_url ? (
                            <img src={activeChildStage.image_url} alt={activeChildStage.name} className="w-full h-full object-cover animate-float" />
                          ) : (
                            <span className="text-7xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                              {activeChildStage.emoji}
                            </span>
                          )}
                        </motion.div>

                        {/* Sparkle bursts when feeding */}
                        <AnimatePresence>
                          {isFeeding && (
                            <>
                              <motion.div 
                                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                animate={{ opacity: 0, y: -100, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="absolute text-5xl pointer-events-none z-20 text-red-500"
                              >
                                ❤️
                              </motion.div>
                              <motion.div 
                                initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 0, x: -60, y: -80, scale: 2 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                                className="absolute text-4xl pointer-events-none z-20 text-yellow-300"
                              >
                                ✨
                              </motion.div>
                              <motion.div 
                                initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 0, x: 60, y: -90, scale: 1.8 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
                                className="absolute text-4xl pointer-events-none z-20"
                              >
                                🍎
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
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
                          <span className={`font-mono text-amber-600 font-extrabold`}>{activeChild.pet_food || 0} LEFT</span>
                        </div>
                        <button
                          onClick={handleFeedCompanion}
                          disabled={(activeChild.pet_food || 0) <= 0}
                          className={`w-full py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            (activeChild.pet_food || 0) > 0
                              ? 'bg-amber-400 border border-stone-950 text-stone-900 shadow-[0_3px_0_0_#1c1917]'
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

                    {/* Weekly & Monthly Goals */}
                    {(() => {
                      const now = new Date();
                      const nextWeekly = activeChild.weekly_reset_date ? new Date(activeChild.weekly_reset_date) : null;
                      const isWeeklyReset = !nextWeekly || now >= nextWeekly;
                      const dispWeeklyXp = isWeeklyReset ? 0 : (activeChild.weekly_xp || 0);
                      const weeklyPct = Math.min(100, Math.round((dispWeeklyXp / (activeChild.weekly_xp_target || 300)) * 100));

                      const nextMonthly = activeChild.monthly_reset_date ? new Date(activeChild.monthly_reset_date) : null;
                      const isMonthlyReset = !nextMonthly || now >= nextMonthly;
                      const dispMonthlyXp = isMonthlyReset ? 0 : (activeChild.monthly_xp || 0);
                      const monthlyPct = Math.min(100, Math.round((dispMonthlyXp / (activeChild.monthly_xp_target || 1000)) * 100));

                      return (
                        <div className="space-y-4">
                          {/* Weekly Goal */}
                          <div className={`p-4 rounded-3xl ${styles.cardBg} ${styles.borderStyle} flex flex-col gap-3 shadow-xl`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className={`font-extrabold text-sm font-display ${styles.titleColor}`}>Weekly Target</h4>
                                {nextWeekly && <p className={`text-[9px] font-mono ${styles.textMuted}`}>Resets: {nextWeekly.toLocaleDateString()}</p>}
                              </div>
                              <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200`}>
                                {activeChild.weekly_reward_points || 200} GOLD BONUS
                              </span>
                            </div>
                            <div className={`w-full h-2 rounded-full overflow-hidden border bg-stone-100 border-stone-200`}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${weeklyPct}%` }}
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                              />
                            </div>
                            <div className={`flex justify-between text-[10px] font-mono font-bold ${styles.textMuted}`}>
                              <span>{dispWeeklyXp} / {(activeChild.weekly_xp_target || 300)} XP</span>
                              <span>{weeklyPct}% COMPLETED</span>
                            </div>
                          </div>

                          {/* Monthly Goal */}
                          <div className={`p-4 rounded-3xl ${styles.cardBg} ${styles.borderStyle} flex flex-col gap-3 shadow-xl`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className={`font-extrabold text-sm font-display ${styles.titleColor}`}>Monthly Target</h4>
                                {nextMonthly && <p className={`text-[9px] font-mono ${styles.textMuted}`}>Resets: {nextMonthly.toLocaleDateString()}</p>}
                              </div>
                              <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200`}>
                                {activeChild.monthly_reward_points || 1000} GOLD BONUS
                              </span>
                            </div>
                            <div className={`w-full h-2 rounded-full overflow-hidden border bg-stone-100 border-stone-200`}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${monthlyPct}%` }}
                                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
                              />
                            </div>
                            <div className={`flex justify-between text-[10px] font-mono font-bold ${styles.textMuted}`}>
                              <span>{dispMonthlyXp} / {(activeChild.monthly_xp_target || 1000)} XP</span>
                              <span>{monthlyPct}% COMPLETED</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                )}

                {/* Right Column: Chores / Prize Cabinet */}
                {activeChild && (
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Gamepad style switcher tabs */}
                    <div className={`flex gap-2 p-1 bg-stone-100 border border-stone-200 rounded-2xl`} id="kid-dashboard-tabs">
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('tasks'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'tasks'
                            ? 'bg-amber-400 border border-stone-950 text-stone-900 font-black shadow-sm'
                            : 'text-stone-600 hover:text-stone-900 font-bold'
                        }`}
                      >
                        <Target className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">QUESTS</span>
                      </button>
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('rewards'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'rewards'
                            ? 'bg-amber-400 border border-stone-950 text-stone-900 font-black shadow-sm'
                            : 'text-stone-600 hover:text-stone-900 font-bold'
                        }`}
                      >
                        <Gift className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">PRIZES</span>
                      </button>
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('history'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'history'
                            ? 'bg-amber-400 border border-stone-950 text-stone-900 font-black shadow-sm'
                            : 'text-stone-600 hover:text-stone-900 font-bold'
                        }`}
                      >
                        <span className="text-xl sm:text-base">📜</span> <span className="hidden sm:inline">HISTORY</span>
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
                          {tasks.filter(t => {
                            if (t.child_id !== activeChild.id) return false;
                            if (t.recurrence === 'one_time') {
                              return !completions.some(c => c.task_id === t.id && c.child_id === activeChild.id && c.status === 'approved');
                            }
                            return true;
                          }).length === 0 ? (
                            <div className={`p-10 text-center ${styles.cardBg} ${styles.borderStyle} rounded-3xl space-y-3`}>
                              <span className="text-5xl block animate-bounce-slow">🎉</span>
                              <h4 className={`font-extrabold ${styles.textColor} text-base`}>ALL QUESTS CRUSHED!</h4>
                              <p className={`text-xs ${styles.textMuted} max-w-xs mx-auto leading-relaxed`}>
                                You have conquered all assigned chores. Ask your parent to broadcast new missions!
                              </p>
                            </div>
                          ) : (
                            tasks.filter(t => {
                              if (t.child_id !== activeChild.id) return false;
                              if (t.recurrence === 'one_time') {
                                return !completions.some(c => c.task_id === t.id && c.child_id === activeChild.id && c.status === 'approved');
                              }
                              return true;
                            }).map((task) => {
                              // Filter completions by recurrence type
                              let compl = null;
                              if (task.recurrence === 'daily') {
                                compl = completions.find(c => c.task_id === task.id && c.child_id === activeChild.id && new Date(c.completed_at).toDateString() === new Date().toDateString());
                              } else if (task.recurrence === 'weekly') {
                                compl = completions.find(c => c.task_id === task.id && c.child_id === activeChild.id && getCurrentWeekKey(new Date(c.completed_at)) === getCurrentWeekKey(new Date()));
                              } else if (task.recurrence === 'one_time') {
                                compl = completions.find(c => c.task_id === task.id && c.child_id === activeChild.id);
                              }

                              const isPending = compl && compl.status === 'pending';
                              const isApproved = compl && compl.status === 'approved';

                              // Count how many times repeatable quest was completed today
                              const completedTodayCount = completions.filter(c => 
                                c.task_id === task.id && 
                                c.child_id === activeChild.id && 
                                new Date(c.completed_at).toDateString() === new Date().toDateString()
                              ).length;

                              // Cooldown logic
                              let isOnCooldown = false;
                              let cooldownTimeLeftStr = '';
                              if (task.recurrence === 'repeatable' && task.cooldown_minutes) {
                                const taskComps = completions
                                  .filter(c => c.task_id === task.id && c.child_id === activeChild.id)
                                  .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
                                
                                if (taskComps.length > 0) {
                                  const msSince = new Date().getTime() - new Date(taskComps[0].completed_at).getTime();
                                  const cooldownMs = task.cooldown_minutes * 60 * 1000;
                                  if (msSince < cooldownMs) {
                                    isOnCooldown = true;
                                    const minsLeft = Math.ceil((cooldownMs - msSince) / 60000);
                                    cooldownTimeLeftStr = `${minsLeft}m`;
                                  }
                                }
                              }

                              return (
                                <div
                                  key={task.id}
                                  className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                    isApproved 
                                      ? 'bg-slate-900/40 border-slate-950/50 opacity-45' 
                                      : isPending 
                                        ? 'bg-indigo-950/25 border-indigo-500/30' 
                                        : isOnCooldown
                                          ? 'bg-amber-950/20 border-amber-500/20 opacity-75'
                                          : `${styles.cardBg} ${styles.borderStyle} hover:border-cyan-500/30 hover:shadow-lg`
                                  }`}
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded`}>
                                        {task.category.toUpperCase()}
                                      </span>
                                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded`}>
                                        {task.recurrence === 'one_time' ? 'ONE-OFF' : task.recurrence.toUpperCase()}
                                      </span>
                                      {isPending && (
                                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider text-stone-700 bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded animate-pulse`}>
                                          PENDING VERIFICATION
                                        </span>
                                      )}
                                      {task.recurrence === 'repeatable' && completedTodayCount > 0 && (
                                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded`}>
                                          ⭐ Completed {completedTodayCount}x today
                                        </span>
                                      )}
                                    </div>
                                    <h4 className={`font-black font-display text-base tracking-wide ${isApproved ? 'line-through text-slate-500' : styles.titleColor}`}>
                                      {task.title}
                                    </h4>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                                    <div className="flex gap-2">
                                      <span className={`flex items-center gap-1 font-mono font-extrabold text-xs px-3 py-1.5 rounded-xl border text-yellow-700 bg-yellow-50 border-yellow-200`}>
                                        <Star className="w-3.5 h-3.5" /> +{task.points}
                                      </span>
                                      <span className={`flex items-center gap-1 font-mono font-extrabold text-xs px-3 py-1.5 rounded-xl border text-cyan-700 bg-cyan-50 border-cyan-200`}>
                                        <TrendingUp className="w-3.5 h-3.5" /> +{task.xp ?? task.points}
                                      </span>
                                    </div>

                                    {isApproved ? (
                                      <span className={`px-3.5 py-2 rounded-xl font-mono text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700`}>
                                        VERIFIED
                                      </span>
                                    ) : isPending ? (
                                      <span className={`px-3.5 py-2 rounded-xl font-mono text-[10px] font-bold uppercase animate-pulse bg-stone-100 text-stone-600`}>
                                        AWAITING CHECK
                                      </span>
                                    ) : isOnCooldown ? (
                                      <span className={`px-3.5 py-2 rounded-xl font-mono text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200`}>
                                        COOLDOWN ({cooldownTimeLeftStr})
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleTaskCheck(task.id)}
                                        className={`bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all font-mono bg-stone-900 hover:bg-stone-800 shadow-[0_3px_0_0_#1c1917]`}
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
                      ) : activeChildTab === 'rewards' ? (
                        
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
                              const availability = getRewardAvailability(rew, redemptions.filter(r => r.child_id === activeChild.id));
                              const isAffordable = availablePoints >= rew.cost_points;
                              const hasPendingRequest = redemptions.some(r => r.child_id === activeChild.id && r.reward_id === rew.id && r.status === 'requested');
                              const canDispense = isAffordable && availability.available && !hasPendingRequest;
                              
                              // Hide claimed one_time rewards entirely
                              if (!rew.is_available && rew.limit_type === 'one_time') {
                                return null;
                              }

                              return (
                                <div
                                  key={rew.id}
                                  className={`p-5 rounded-3xl ${styles.cardBg} border transition-all flex items-center justify-between gap-4 ${
                                    canDispense 
                                      ? `${styles.borderStyle} hover:border-cyan-500/30 hover:shadow-lg` 
                                      : 'opacity-60 border-slate-800/30'
                                  }`}
                                >
                                  <div className="flex gap-3.5 items-center">
                                    <div className={`h-12 w-12 rounded-2xl bg-stone-150 border border-stone-200 flex items-center justify-center text-3xl`}>
                                      🎁
                                    </div>
                                    <div>
                                      <h4 className={`font-extrabold text-sm ${styles.titleColor} font-display tracking-wide`}>{rew.title}</h4>
                                      <p className={`text-[10px] font-mono ${styles.textMuted} uppercase mt-0.5`}>COST: {rew.cost_points} PTS</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className={`text-[10px] font-mono font-black ${isAffordable ? 'text-amber-700' : 'text-slate-500'}`}>
                                      ⭐ {rew.cost_points} PTS
                                    </span>

                                    <button
                                      disabled={!canDispense}
                                      onClick={() => handleClaimReward(rew.id, rew.cost_points)}
                                      className={`font-black font-mono py-2 px-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all ${
                                        canDispense
                                          ? 'bg-amber-400 hover:bg-amber-300 border border-stone-950 text-stone-900 font-black shadow-[0_3px_0_0_#1c1917]'
                                          : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                      }`}
                                      id={`claim-reward-${rew.id}`}
                                    >
                                      {!availability.available ? availability.reason : hasPendingRequest ? 'AWAITING APPROVAL' : 'DISPENSE'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </motion.div>
                      ) : activeChildTab === 'history' ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          key="child-history-tab"
                          className="space-y-4"
                        >
                          {redemptions.filter(r => r.child_id === activeChild.id && r.status === 'delivered').length === 0 ? (
                            <div className={`p-10 text-center ${styles.cardBg} ${styles.borderStyle} rounded-3xl space-y-3`}>
                              <span className="text-5xl block animate-pulse">🕵️‍♂️</span>
                              <h4 className={`font-extrabold ${styles.textColor} text-base`}>NO PRIZES YET</h4>
                              <p className={`text-xs ${styles.textMuted} max-w-xs mx-auto leading-relaxed`}>
                                When you earn and receive a prize, it will appear in this log for you to remember!
                              </p>
                            </div>
                          ) : (
                            redemptions
                              .filter(r => r.child_id === activeChild.id && r.status === 'delivered')
                              .sort((a, b) => new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime())
                              .map(delivery => {
                                const reward = rewards.find(r => r.id === delivery.reward_id);
                                return (
                                  <div
                                    key={delivery.id}
                                    className={`p-5 rounded-3xl border transition-all flex items-center justify-between gap-4 ${styles.cardBg} ${styles.borderStyle}`}
                                  >
                                    <div className="space-y-1">
                                      <h4 className={`font-black font-display text-base tracking-wide ${styles.titleColor}`}>
                                        {reward?.title || "Unknown Prize"}
                                      </h4>
                                      <p className={`text-xs font-mono font-bold ${styles.textMuted}`}>
                                        Delivered on {new Date(delivery.redeemed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                      </p>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-stone-100 border-stone-300 text-stone-600`}>
                                      <CheckCircle className="w-4 h-4" />
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider">RECEIVED</span>
                                    </div>
                                  </div>
                                );
                              })
                          )}
                        </motion.div>
                      ) : null}
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
