import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Flame, Play, Coins, ChevronRight, Lock, Star,
  ArrowLeft, CheckCircle, Gift, Sparkles, Smile, Target, Zap, RotateCcw, AlertTriangle, HelpCircle, TrendingUp,
  PiggyBank, X, Plus, Minus, Utensils
} from 'lucide-react';
import { Child, Task, TaskCompletion, Reward, RewardRedemption } from '../types';
import { CHARACTER_PACKS, getCharacterStage } from '../data/characters';
import { playSound } from '../utils/sound';
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { getCurrentWeekKey } from '../utils/date';

const GoldCoinIcon = ({ className = "w-[1em] h-[1em]" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`inline-block drop-shadow-sm ${className}`}>
    <circle cx="12" cy="12" r="10" fill="url(#goldGradient)" stroke="#B45309" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7" stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" />
    <path d="M12 6L13.5 10.5H18L14.5 13.5L16 18L12 15.5L8 18L9.5 13.5L6 10.5H10.5L12 6Z" fill="#B45309" />
    <defs>
      <linearGradient id="goldGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="0.5" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

interface ChildDashboardProps {
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  onCompleteTask: (taskId: string, childId: string) => void;
  onClaimReward: (rewardId: string, childId: string, paymentSource?: 'main' | 'savings') => void;
  onEnterParentMode: () => void;
  onFeedPet: (childId: string) => void;
  onSavingsDeposit: (childId: string, amount: number) => void;
  onSavingsWithdraw: (childId: string) => void;
  onSavingsGoal: (childId: string, rewardId: string) => void;
  onClearSavingsGoal: (childId: string) => void;
  onSavingsUnlockSeen: (childId: string) => void;
  onFoodPotDeposit: (childId: string, amount: number) => void;
  onBuyPetFood: (childId: string) => void;
  onFoodPotUnlockSeen: (childId: string) => void;
  onUpdateChildStats: (childId: string, updates: Partial<Child>) => void;
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
  onSavingsDeposit,
  onSavingsWithdraw,
  onSavingsGoal,
  onClearSavingsGoal,
  onSavingsUnlockSeen,
  onFoodPotDeposit,
  onBuyPetFood,
  onFoodPotUnlockSeen,
  onUpdateChildStats,
  theme
}: ChildDashboardProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeChildTab, setActiveChildTab] = useState<'companion' | 'tasks' | 'rewards' | 'pots'>('companion');
  const [expandedGoal, setExpandedGoal] = useState<'streak' | 'weekly' | 'monthly' | null>(null);
  const [isFeeding, setIsFeeding] = useState(false);

  // Savings Pot UI State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(5);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showReplayVideo, setShowReplayVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Food Pot UI State
  const [showFoodDepositModal, setShowFoodDepositModal] = useState(false);
  const [foodDepositAmount, setFoodDepositAmount] = useState<number>(7);
  const [showFoodReplayVideo, setShowFoodReplayVideo] = useState(false);
  const [penaltyMessage, setPenaltyMessage] = useState<string | null>(null);
  
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

  // Reset video play state when popup is closed
  useEffect(() => {
    const showUnlock = activeChild && activeChild.savings_unlocked && (!activeChild.savings_unlock_seen || showReplayVideo);
    const showFoodUnlock = activeChild && activeChild.food_pot_unlocked && (!activeChild.food_pot_unlock_seen || showFoodReplayVideo);
    if (!showUnlock && !showFoodUnlock) {
      setIsVideoPlaying(false);
    }
  }, [activeChild, showReplayVideo, showFoodReplayVideo]);

  // Daily hunger check & penalty check hook
  useEffect(() => {
    if (!selectedChildId) return;
    const child = children.find(c => c.id === selectedChildId);
    if (!child) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const lastCheck = child.last_hunger_check_date;

    if (lastCheck !== todayStr) {
      let points = child.points || 0;
      let petUnhappy = child.pet_unhappy || false;
      let petFedToday = child.pet_fed_today;
      
      let updates: Partial<Child> = {
        last_hunger_check_date: todayStr
      };

      if (!lastCheck) {
        // First time initialization
        updates.pet_fed_today = child.food_pot_unlocked ? false : true;
        updates.pet_hunger_time = child.food_pot_unlocked ? new Date().toISOString() : null;
        updates.pet_unhappy = false;
      } else {
        // Daily rollover
        if (child.food_pot_unlocked) {
          if (petFedToday === false) {
            petUnhappy = true;
            points = Math.max(0, points - 1);
            setPenaltyMessage(`Oh no! You forgot to feed your pet yesterday. Your pet is unhappy and you lost 1 gold coin! Buy some food and feed your pet to make them happy again.`);
            setTimeout(() => playSound.pinError(), 800);
          }
          
          updates.pet_fed_today = false;
          updates.pet_unhappy = petUnhappy;
          updates.points = points;
          updates.pet_hunger_time = new Date().toISOString();
        } else {
          updates.pet_fed_today = true;
          updates.pet_hunger_time = null;
        }
      }

      onUpdateChildStats(child.id, updates);
    }
  }, [selectedChildId, children, onUpdateChildStats]);

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
    playSound.purchase();
    setSelectedChildId(id);
    setActiveChildTab('companion');
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

      {/* Savings Pot Unlock Celebration Overlay */}
      <AnimatePresence>
        {activeChild && activeChild.savings_unlocked && (!activeChild.savings_unlock_seen || showReplayVideo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            id="savings-unlock-cinematic"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative w-full max-w-lg bg-white border-4 border-stone-900 rounded-[2.5rem] p-8 shadow-[0_10px_0_0_rgba(28,25,23,1)] space-y-6"
            >
              {/* Sunburst background effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                NEW FEATURE UNLOCKED
              </div>

              <h2 className="text-3xl font-black font-display text-stone-900">
                🎉 SAVINGS POT UNLOCKED!
              </h2>

              <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Well done, <strong className="text-stone-900">{activeChild.name}</strong>! You've earned a brand new feature — the <strong className="text-amber-600">Savings Pot</strong>!
              </p>

              {/* Video Player */}
              <div className="relative w-full aspect-video rounded-2xl bg-stone-100 border-2 border-stone-200 overflow-hidden shadow-inner group">
                <video 
                  ref={videoRef}
                  src="/savings-video.mp4" 
                  controls 
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/savings-poster.jpg"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  <source src="/savings-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!isVideoPlaying && (
                  <div 
                    onClick={() => {
                      videoRef.current?.play();
                    }}
                    className="absolute inset-0 cursor-pointer flex items-center justify-center group-hover:opacity-0 transition-opacity bg-stone-900/20"
                  >
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-transform">
                      <Play className="w-8 h-8 text-amber-500 fill-amber-500 ml-1" />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => { playSound.success(); onSavingsUnlockSeen(activeChild.id); setShowReplayVideo(false); }}
                className="w-full gamepad-button py-4 bg-amber-400 hover:bg-amber-300 border-2 border-stone-900 text-stone-950 font-black rounded-2xl uppercase tracking-widest text-sm shadow-[0_4px_0_0_#1c1917] hover:translate-y-1 hover:shadow-[0_0px_0_0_#1c1917] cursor-pointer transition-all"
                id="savings-unlock-dismiss-btn"
              >
                GOT IT! 🎉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Pot Unlock Celebration Overlay */}
      <AnimatePresence>
        {activeChild && activeChild.food_pot_unlocked && (!activeChild.food_pot_unlock_seen || showFoodReplayVideo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            id="food-pot-unlock-cinematic"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative w-full max-w-lg bg-white border-4 border-stone-900 rounded-[2.5rem] p-8 shadow-[0_10px_0_0_rgba(28,25,23,1)] space-y-6"
            >
              {/* Sunburst background effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-300 text-orange-700 rounded-full text-xs font-bold uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                NEW FEATURE UNLOCKED
              </div>

              <h2 className="text-3xl font-black font-display text-stone-900">
                🎉 FOOD POT UNLOCKED!
              </h2>

              <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Awesome job, <strong className="text-stone-900">{activeChild.name}</strong>! You've unlocked the <strong className="text-orange-600">Food Pot</strong>! Remember to deposit 7 gold coins per week and feed your pet every day.
              </p>

              {/* Video Player */}
              <div className="relative w-full aspect-video rounded-2xl bg-stone-100 border-2 border-stone-200 overflow-hidden shadow-inner group">
                <video 
                  ref={videoRef}
                  src="/food-pot-video.mp4" 
                  controls 
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/food-pot-poster.jpg"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  <source src="/food-pot-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!isVideoPlaying && (
                  <div 
                    onClick={() => {
                      videoRef.current?.play();
                    }}
                    className="absolute inset-0 cursor-pointer flex items-center justify-center group-hover:opacity-0 transition-opacity bg-stone-900/20"
                  >
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-transform">
                      <Play className="w-8 h-8 text-orange-500 fill-orange-500 ml-1" />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => { playSound.success(); onFoodPotUnlockSeen(activeChild.id); setShowFoodReplayVideo(false); }}
                className="w-full gamepad-button py-4 bg-orange-400 hover:bg-orange-300 border-2 border-stone-900 text-stone-950 font-black rounded-2xl uppercase tracking-widest text-sm shadow-[0_4px_0_0_#1c1917] hover:translate-y-1 hover:shadow-[0_0px_0_0_#1c1917] cursor-pointer transition-all"
                id="food-pot-unlock-dismiss-btn"
              >
                GOT IT! 🎉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unhappy Pet Warning Modal */}
      <AnimatePresence>
        {penaltyMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            id="pet-penalty-modal"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="relative w-full max-w-md bg-white border-4 border-stone-900 rounded-[2.5rem] p-8 shadow-[0_10px_0_0_rgba(28,25,23,1)] space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-rose-100 border border-rose-300 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-rose-600 animate-bounce" />
              </div>

              <h2 className="text-2.5xl font-black font-display text-rose-600">
                💔 PET IS UNHAPPY!
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed">
                {penaltyMessage}
              </p>

              <button
                onClick={() => { playSound.success(); setPenaltyMessage(null); }}
                className="w-full gamepad-button py-3 bg-rose-500 hover:bg-rose-450 border-2 border-stone-900 text-white font-black rounded-2xl uppercase tracking-widest text-sm shadow-[0_4px_0_0_#1c1917] hover:translate-y-1 hover:shadow-[0_0px_0_0_#1c1917] cursor-pointer transition-all"
                id="pet-penalty-dismiss-btn"
              >
                I Promise to Feed Them! 🥺
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top-tier Console Navigation Bar */}
      <header className={`p-3 sm:p-5 border-b ${styles.divider} flex justify-between items-center ${styles.headerBg} relative z-30`}>
        <div className="flex items-center gap-2 sm:gap-3">
          {selectedChildId ? (
            <button
              onClick={() => { playSound.click(); setSelectedChildId(null); }}
              className={`p-2 rounded-lg sm:rounded-xl border transition-all cursor-pointer flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-mono font-bold ${
                'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 shadow-sm font-bold'
              }`}
              id="back-to-profiles-btn"
            >
              <ArrowLeft className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500`} /> <span className="hidden sm:inline">CHOOSE OPERATOR</span>
            </button>
          ) : (
            <div className={`h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm sm:text-lg shadow-md`}>
              🎮
            </div>
          )}
          <div className="flex flex-col">
            <span className={`text-[12px] sm:text-sm font-black font-display tracking-widest uppercase ${styles.titleGradient}`}>
              {activeChild ? `${activeChild.name}'S DASHBOARD` : 'KID CONTROL DECK'}
            </span>
            <span className={`hidden md:block text-[8px] font-mono tracking-widest ${styles.textMuted} font-bold`}>CABINET INTERFACE V2.5</span>
          </div>
        </div>

        <button
          onClick={() => { playSound.click(); onEnterParentMode(); }}
          className={`flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-[9px] sm:text-xs font-bold font-mono cursor-pointer transition-all border ${
            'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-sm font-bold'
          }`}
          id="parent-gate-lock-btn"
        >
          <Lock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500`} /> <span className="text-rose-600">SWITCH TO PARENT</span>
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
                    Select your player coin
                  </h1>
                  <p className={`text-xs sm:text-sm ${styles.textMuted} max-w-md mx-auto leading-relaxed`}>
                    Choose your family operator to access your quest diary, feed energy cells, and claim your physical prizes!
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 sm:gap-8 max-w-4xl mx-auto pt-4" id="kids-deck">
                  {children.map((child) => {
                    const stage = getCharacterStage(child.character_id, child.level);
                    return (
                      <motion.div
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        key={child.id}
                        onClick={() => {
                          handleSelectChild(child.id);
                        }}
                        className={`w-40 sm:w-52 md:w-64 shrink-0 cursor-pointer overflow-hidden aspect-square rounded-full border-4 sm:border-8 border-yellow-200 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 p-2 flex flex-col items-center justify-center gap-1 sm:gap-2 text-center transition-all shadow-[0_6px_0_0_#b45309,0_15px_20px_rgba(0,0,0,0.2)] sm:shadow-[0_8px_0_0_#b45309,0_15px_20px_rgba(0,0,0,0.2)] relative group hover:shadow-[0_0_30px_rgba(251,191,36,0.8)]`}
                      >
                        {/* Inner ring for coin effect */}
                        <div className="absolute inset-2 sm:inset-3 rounded-full border border-yellow-200/60 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Interactive Kid Avatar frame */}
                        <div className="relative mt-2 z-10">
                          <img
                            src={child.avatar_url}
                            alt={child.name}
                            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-amber-100 p-0.5 sm:p-1 border-2 border-amber-600 group-hover:border-white transition-all object-cover shadow-inner`}
                            referrerPolicy="no-referrer"
                          />
                          <span className={`absolute -bottom-1 -right-1 sm:-bottom-1 sm:-right-1 h-5 w-5 sm:h-7 sm:w-7 rounded-full bg-rose-500 font-mono flex items-center justify-center text-[10px] sm:text-xs font-extrabold border-2 border-white text-white shadow-sm`}>
                            {child.level}
                          </span>
                        </div>

                        <div className="space-y-0.5 z-10 mt-1">
                          <h3 className={`font-black font-display text-sm sm:text-xl text-amber-950 tracking-wide drop-shadow-sm`}>
                            {child.name}
                          </h3>
                          <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-900 font-mono font-bold bg-amber-200/50 px-1.5 py-0.5 rounded-full border border-amber-500/30 shadow-inner">
                            <Flame className="w-3 h-3 text-rose-600 animate-pulse" />
                            <span>{child.streak_days} <span className="hidden sm:inline">DAYS</span><span className="sm:hidden">D</span></span>
                          </div>
                        </div>
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
                
                {/* Left Column: Star-Pet Feeding Station (Hidden on mobile unless 'companion' tab is active) */}
                {activeChild && activeChildStage && activeChildPack && (
                  <div className={`lg:col-span-4 space-y-4 sm:space-y-6 ${activeChildTab !== 'companion' ? 'hidden lg:block' : ''}`}>
                    
                    {/* Holo Pedestal */}
                    <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl ${styles.cardBg} ${styles.borderStyle} flex flex-col items-center text-center relative overflow-hidden shadow-2xl`}>
                      
                      <div className="absolute inset-0 crt-overlay opacity-15 pointer-events-none" />
                      <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${activeChildStage.color_theme}`} />

                      <div className="flex justify-between w-full items-start mt-1">
                        <div className="text-left">
                          <span className={`text-[8px] font-mono tracking-widest uppercase ${styles.textMuted} font-extrabold`}>PET SPECIES</span>
                          <h3 className={`font-black ${styles.textColor} text-xs mt-0.5 uppercase tracking-wider`}>{activeChildStage.name}</h3>
                        </div>
                        {/* Gold Coins Visual */}
                        <div className="relative group cursor-default">
                          <div className={`flex items-center gap-2 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 px-4 py-2.5 rounded-2xl shadow-md border-2 border-amber-300 relative overflow-hidden`}>
                            {/* Shine animation */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="relative">
                              <span className="text-2xl sm:text-3xl"><GoldCoinIcon /></span>
                              <motion.div
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -top-1 -right-1 text-xs"
                              >
                                ✨
                              </motion.div>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className={`text-[8px] font-mono font-bold text-amber-700 uppercase tracking-wider`}>GOLD COINS</span>
                              <span className={`text-lg sm:text-xl font-mono font-black text-amber-600 tracking-tight leading-none`}>{activeChild.points}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {activeChild.food_pot_unlocked && (
                        <div className="mt-4 flex items-center justify-center w-full">
                          {activeChild.pet_unhappy ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-bold animate-pulse">
                              😢 Pet Unhappy & Hungry
                            </span>
                          ) : activeChild.pet_fed_today ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
                              💚 Pet Fed & Happy!
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold animate-bounce">
                              🍖 Hungry! Needs Food
                            </span>
                          )}
                        </div>
                      )}

                      {/* Giant Levitating Pedestal */}
                      <div className="my-4 sm:my-8 relative flex items-center justify-center">
                        {/* Interactive floating particles */}
                        <div className="absolute h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-gradient-to-tr from-cyan-400/10 to-purple-500/10 animate-spin duration-[15s]" />
                        
                        <motion.div
                          animate={isFeeding ? { scale: [1, 1.25, 1.1, 1.3, 1], rotate: [0, 8, -8, 8, 0] } : {}}
                          transition={isFeeding ? { duration: 2.2, ease: "easeInOut" } : { duration: 1.2 }}
                          className={`h-20 w-20 sm:h-36 sm:w-36 rounded-full ${activeChildStage.image_url ? 'bg-white' : `bg-gradient-to-br ${activeChildStage.color_theme}`} flex items-center justify-center shadow-2xl border-4 border-stone-300 relative z-10 ${activeChildStage.animation_class} transition-colors duration-500 overflow-hidden`}
                        >
                          {activeChildStage.image_url ? (
                            <img src={activeChildStage.image_url} alt={activeChildStage.name} className="w-full h-full object-cover animate-float" />
                          ) : (
                            <span className="text-4xl sm:text-7xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                              {activeChildStage.emoji}
                            </span>
                          )}
                        </motion.div>
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

                      {activeChild.food_pot_unlocked && (
                        <div className="w-full pt-4 mt-4 border-t border-dashed border-stone-200 flex flex-col gap-2">
                          <button
                            onClick={handleFeedCompanion}
                            disabled={isFeeding || (activeChild.pet_food || 0) <= 0 || activeChild.pet_fed_today}
                            className={`w-full py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                              activeChild.pet_fed_today
                                ? 'bg-stone-100 text-stone-400 cursor-default border border-stone-200'
                                : (activeChild.pet_food || 0) > 0
                                  ? 'bg-orange-500 border-2 border-stone-900 text-white shadow-[0_4px_0_0_#1c1917] hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#1c1917] active:translate-y-1 active:shadow-none'
                                  : 'bg-stone-200 text-stone-400 border border-stone-300 cursor-not-allowed'
                            }`}
                          >
                            {isFeeding ? (
                              <span>🍖 Chomp Chomp...</span>
                            ) : activeChild.pet_fed_today ? (
                              <span>✅ Fed for Today!</span>
                            ) : (
                              <span>🍖 Feed Pet (1 Food)</span>
                            )}
                          </button>
                          <div className={`flex justify-between items-center text-[10px] font-mono ${styles.textMuted} font-bold`}>
                            <span>FOOD INVENTORY:</span>
                            <span className="text-orange-600 font-extrabold">{activeChild.pet_food || 0} pieces</span>
                          </div>
                          {(!activeChild.pet_fed_today && (activeChild.pet_food || 0) <= 0) && (
                            <span className="text-[9px] text-red-500 font-bold text-center mt-1">
                              ⚠️ No food left! Buy food from your Food Pot below.
                            </span>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Streak & Goals Grid */}
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
                        <>
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                          {/* Streak Widget */}
                          <button 
                            onClick={() => { playSound.click(); setExpandedGoal('streak'); }}
                            className={`p-3 rounded-2xl ${styles.cardBg} ${styles.borderStyle} flex flex-col items-center justify-center text-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform`}
                          >
                            <Flame className={`w-5 h-5 sm:w-7 sm:h-7 mb-1 ${activeChild.streak_days > 0 ? 'text-orange-500 flame-active' : 'text-stone-300'}`} />
                            <span className={`font-black text-sm sm:text-base ${activeChild.streak_days > 0 ? 'text-orange-600' : 'text-stone-400'}`}>{activeChild.streak_days}</span>
                            <span className="text-[8px] sm:text-[10px] font-mono font-bold text-stone-500 uppercase tracking-tighter mt-0.5">Day Streak</span>
                          </button>

                          {/* Weekly Widget */}
                          <button 
                            onClick={() => { playSound.click(); setExpandedGoal('weekly'); }}
                            className={`p-3 rounded-2xl ${styles.cardBg} ${styles.borderStyle} flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group cursor-pointer hover:scale-105 active:scale-95 transition-transform`}
                          >
                            <div className="absolute bottom-0 inset-x-0 w-full bg-cyan-100/30 z-0">
                              <motion.div initial={{ height: 0 }} animate={{ height: `${weeklyPct}%` }} className="bg-cyan-200/50 absolute bottom-0 inset-x-0 w-full" />
                            </div>
                            <Target className={`w-5 h-5 sm:w-7 sm:h-7 mb-1 relative z-10 ${weeklyPct >= 100 ? 'text-emerald-500' : 'text-cyan-500'}`} />
                            <span className={`font-black text-sm sm:text-base relative z-10 ${weeklyPct >= 100 ? 'text-emerald-600' : 'text-cyan-600'}`}>{weeklyPct}%</span>
                            <span className="text-[8px] sm:text-[10px] font-mono font-bold text-stone-500 uppercase tracking-tighter mt-0.5 relative z-10">Weekly</span>
                          </button>

                          {/* Monthly Widget */}
                          <button 
                            onClick={() => { playSound.click(); setExpandedGoal('monthly'); }}
                            className={`p-3 rounded-2xl ${styles.cardBg} ${styles.borderStyle} flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group cursor-pointer hover:scale-105 active:scale-95 transition-transform`}
                          >
                            <div className="absolute bottom-0 inset-x-0 w-full bg-purple-100/30 z-0">
                              <motion.div initial={{ height: 0 }} animate={{ height: `${monthlyPct}%` }} className="bg-purple-200/50 absolute bottom-0 inset-x-0 w-full" />
                            </div>
                            <Zap className={`w-5 h-5 sm:w-7 sm:h-7 mb-1 relative z-10 ${monthlyPct >= 100 ? 'text-emerald-500' : 'text-purple-500'}`} />
                            <span className={`font-black text-sm sm:text-base relative z-10 ${monthlyPct >= 100 ? 'text-emerald-600' : 'text-purple-600'}`}>{monthlyPct}%</span>
                            <span className="text-[8px] sm:text-[10px] font-mono font-bold text-stone-500 uppercase tracking-tighter mt-0.5 relative z-10">Monthly</span>
                          </button>
                        </div>
                        
                        <AnimatePresence>
                          {expandedGoal && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 overflow-hidden"
                            >
                              <div className={`p-5 rounded-3xl ${styles.cardBg} ${styles.borderStyle} flex flex-col gap-3 shadow-xl relative`}>
                                <button 
                                  onClick={() => setExpandedGoal(null)}
                                  className={`absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200`}
                                >
                                  <ChevronRight className="w-4 h-4 rotate-90" />
                                </button>
                                
                                {expandedGoal === 'streak' && (
                                  <>
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-orange-950/40 border border-orange-900/30 flex items-center justify-center">
                                        <Flame className="w-5 h-5 text-orange-500 flame-active" />
                                      </div>
                                      <h4 className={`font-extrabold text-lg font-display ${styles.titleColor}`}>Daily Streak</h4>
                                    </div>
                                    <p className={`text-sm ${styles.textMuted} leading-normal mt-1`}>
                                      You've locked in a <span className="text-orange-500 font-mono font-bold">{activeChild.streak_days} Day Streak</span> by keeping chores up to speed! Keep completing your daily quests to grow the streak.
                                    </p>
                                  </>
                                )}
                                
                                {expandedGoal === 'weekly' && (
                                  <>
                                    <div className="flex justify-between items-center pr-8">
                                      <div>
                                        <h4 className={`font-extrabold text-lg font-display ${styles.titleColor}`}>Weekly Target</h4>
                                        {nextWeekly && <p className={`text-[10px] font-mono ${styles.textMuted}`}>Resets: {nextWeekly.toLocaleDateString()}</p>}
                                      </div>
                                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200`}>
                                        {activeChild.weekly_reward_points || 200} GOLD BONUS
                                      </span>
                                    </div>
                                    <div className={`w-full h-3 rounded-full overflow-hidden border bg-stone-100 border-stone-200 mt-2`}>
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${weeklyPct}%` }}
                                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                                      />
                                    </div>
                                    <div className={`flex justify-between text-xs font-mono font-bold ${styles.textMuted}`}>
                                      <span>{dispWeeklyXp} / {(activeChild.weekly_xp_target || 300)} XP</span>
                                      <span>{weeklyPct}% COMPLETED</span>
                                    </div>
                                  </>
                                )}
                                
                                {expandedGoal === 'monthly' && (
                                  <>
                                    <div className="flex justify-between items-center pr-8">
                                      <div>
                                        <h4 className={`font-extrabold text-lg font-display ${styles.titleColor}`}>Monthly Target</h4>
                                        {nextMonthly && <p className={`text-[10px] font-mono ${styles.textMuted}`}>Resets: {nextMonthly.toLocaleDateString()}</p>}
                                      </div>
                                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200`}>
                                        {activeChild.monthly_reward_points || 1000} GOLD BONUS
                                      </span>
                                    </div>
                                    <div className={`w-full h-3 rounded-full overflow-hidden border bg-stone-100 border-stone-200 mt-2`}>
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${monthlyPct}%` }}
                                        className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
                                      />
                                    </div>
                                    <div className={`flex justify-between text-xs font-mono font-bold ${styles.textMuted}`}>
                                      <span>{dispMonthlyXp} / {(activeChild.monthly_xp_target || 1000)} XP</span>
                                      <span>{monthlyPct}% COMPLETED</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        </>
                      );
                    })()}

                  </div>
                )}

                {/* Right Column: Chores / Prize Cabinet (Hidden on mobile if 'companion' tab is active) */}
                {activeChild && (
                  <div className={`lg:col-span-8 space-y-4 sm:space-y-6 ${activeChildTab === 'companion' ? 'hidden lg:block' : ''}`}>
                    
                    {/* Gamepad style switcher tabs (Hidden on mobile) */}
                    <div className={`hidden lg:flex gap-2 p-1 bg-stone-100 border border-stone-200 rounded-2xl`} id="kid-dashboard-tabs">
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('tasks'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'tasks' || activeChildTab === 'companion'
                            ? 'bg-amber-400 border border-stone-950 text-stone-900 font-black shadow-sm'
                            : 'text-stone-600 hover:text-stone-900 font-bold'
                        }`}
                      >
                        <span className="text-xl sm:text-base">🎯</span> <span className="hidden sm:inline">QUESTS</span>
                      </button>
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('rewards'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'rewards'
                            ? 'bg-amber-400 border border-stone-950 text-stone-900 font-black shadow-sm'
                            : 'text-stone-600 hover:text-stone-900 font-bold'
                        }`}
                      >
                        <span className="text-xl sm:text-base">🎁</span> <span className="hidden sm:inline">PRIZES</span>
                      </button>
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('pots'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'pots'
                            ? 'bg-amber-400 border border-stone-950 text-stone-900 font-black shadow-sm'
                            : 'text-stone-600 hover:text-stone-900 font-bold'
                        }`}
                      >
                        <span className="text-xl sm:text-base">🍯</span> <span className="hidden sm:inline">POTS</span>
                      </button>
                    </div>

                    {/* Active Screen Frame */}
                    <AnimatePresence mode="wait">
                      {activeChildTab === 'tasks' || activeChildTab === 'companion' ? (
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
                                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3 ${
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
                                          <GoldCoinIcon /> Completed {completedTodayCount}x today
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
                                        <Coins className="w-3.5 h-3.5" /> +{task.points}
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
                                        className={`bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 text-white font-extrabold px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all font-mono bg-stone-900 hover:bg-stone-800 shadow-[0_3px_0_0_#1c1917]`}
                                        id={`claim-task-${task.id}`}
                                      >
                                        COMPLETE!
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
                          className="space-y-4"
                        >
                          <div className={`p-4 rounded-xl sm:rounded-2xl ${styles.cardBg} ${styles.borderStyle} border flex items-center justify-between`}>
                            <div>
                              <h3 className={`font-black font-display text-base sm:text-lg uppercase tracking-wider ${styles.titleColor}`}>Reward Shop</h3>
                              <p className={`text-[10px] sm:text-xs font-mono ${styles.textMuted}`}>Trade your gold coins for real-world prizes!</p>
                            </div>
                            <div className="text-right">
                              <span className="block text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600">Available Balance</span>
                              <span className="text-xl sm:text-2xl font-black font-mono text-amber-500"><GoldCoinIcon /> {availablePoints} <span className="text-[10px] sm:text-xs text-amber-600">GOLD COINS</span></span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" id="child-rewards-deck">
                          {rewards.filter(r => r.child_id === activeChild.id).length === 0 ? (
                            <div className={`col-span-2 p-10 text-center ${styles.cardBg} ${styles.borderStyle} rounded-3xl space-y-2`}>
                              <span className="text-5xl block animate-bounce-slow">🎁</span>
                              <h4 className={`font-extrabold ${styles.textColor}`}>SHOP EMPTY</h4>
                              <p className={`text-xs ${styles.textMuted}`}>Ask your parents to unlock custom prizes for you!</p>
                            </div>
                          ) : (
                            rewards.filter(r => r.child_id === activeChild.id).map((rew) => {
                              const availability = getRewardAvailability(rew, redemptions.filter(r => r.child_id === activeChild.id));
                              const isAffordable = availablePoints >= rew.cost_points;
                              const hasPendingRequest = redemptions.some(r => r.child_id === activeChild.id && r.reward_id === rew.id && r.status === 'requested');
                              const isSavingFor = activeChild.savings_unlocked && activeChild.savings_goal_reward_id === rew.id;
                              const canDispense = isAffordable && availability.available && !hasPendingRequest;
                              
                              // Hide claimed one_time rewards entirely
                              if (!rew.is_available && rew.limit_type === 'one_time') {
                                return null;
                              }

                              return (
                                <div
                                  key={rew.id}
                                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-2 sm:gap-3 ${
                                    isSavingFor
                                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                                      : `${styles.cardBg} ${canDispense ? `${styles.borderStyle} hover:border-cyan-500/30 hover:shadow-lg` : 'opacity-60 border-slate-800/30'}`
                                  }`}
                                >
                                  <div className="flex gap-3.5 items-center">
                                    <div className={`h-12 w-12 rounded-2xl bg-stone-150 border border-stone-200 flex items-center justify-center text-3xl`}>
                                      🎁
                                    </div>
                                    <div>
                                      <h4 className={`font-extrabold text-sm ${styles.titleColor} font-display tracking-wide`}>{rew.title}</h4>
                                      <p className={`text-[10px] font-mono ${styles.textMuted} uppercase mt-0.5`}>COST: {rew.cost_points} GOLD COINS</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className={`text-[10px] font-mono font-black ${isAffordable ? 'text-amber-700' : 'text-slate-500'}`}>
                                      <GoldCoinIcon /> {rew.cost_points} GOLD COINS
                                    </span>

                                    <div className="flex flex-col gap-1.5 items-end">
                                      {isSavingFor ? null : (
                                        <button
                                          disabled={!canDispense}
                                          onClick={() => handleClaimReward(rew.id, rew.cost_points)}
                                          className={`font-black font-mono py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl text-[9px] sm:text-xs uppercase tracking-wider cursor-pointer transition-all ${
                                            canDispense
                                              ? 'bg-amber-400 hover:bg-amber-300 border border-stone-950 text-stone-900 font-black shadow-[0_3px_0_0_#1c1917]'
                                              : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                          }`}
                                          id={`claim-reward-${rew.id}`}
                                        >
                                          {!availability.available ? availability.reason : hasPendingRequest ? 'AWAITING APPROVAL' : 'BUY'}
                                        </button>
                                      )}
                                      
                                      {activeChild.savings_unlocked && (
                                        isSavingFor ? (
                                          <span className="text-[10px] sm:text-xs text-emerald-700 font-black uppercase tracking-wider flex items-center gap-1.5 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 shadow-sm mt-1">
                                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> SAVING FOR
                                          </span>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              onSavingsGoal(activeChild.id, rew.id);
                                              playSound.success();
                                            }}
                                            className="text-[8px] text-emerald-600 hover:bg-emerald-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                                          >
                                            Set as Goal
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          </div>
                        </motion.div>
                      ) : activeChildTab === 'pots' ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          key="child-pots-tab"
                          className="space-y-4"
                        >
                          {/* === SAVINGS POT SECTION === */}

                          {/* Savings Pot Unlocked Card */}
                          {activeChild.savings_unlocked && activeChild.savings_unlock_seen && (
                            <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${styles.cardBg} ${styles.borderStyle} relative overflow-hidden shadow-lg`}>
                              <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400`} />
                        
                              {/* Header */}
                              <div className="flex items-center justify-between mb-3 mt-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center">
                                    <PiggyBank className="w-5 h-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <span className={`text-[8px] font-mono tracking-widest uppercase ${styles.textMuted} font-extrabold`}>SAVINGS POT</span>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                      <h4 className={`font-black text-sm ${styles.titleColor} leading-none`}>Savings Pot</h4>
                                      <button 
                                        onClick={() => setShowReplayVideo(true)}
                                        className="text-[9px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-0.5 rounded-full font-bold transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                                      >
                                        <Play className="w-2.5 h-2.5 fill-emerald-700" /> Play Video
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                                  <span className="text-lg"><GoldCoinIcon /></span>
                                  <span className="text-lg font-mono font-black text-emerald-700">{activeChild.savings_pot || 0}</span>
                                </div>
                              </div>

                              {/* Optional Savings Goal */}
                              {activeChild.savings_goal_name && activeChild.savings_goal_amount ? (
                                <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                                  <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                      🎯 {activeChild.savings_goal_name}
                                    </span>
                                    <button 
                                      onClick={() => { onClearSavingsGoal(activeChild.id); playSound.click(); }}
                                      className="p-1 rounded-full hover:bg-emerald-200 text-emerald-500 transition-all cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-emerald-200 mb-1">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(100, Math.round(((activeChild.savings_pot || 0) / activeChild.savings_goal_amount) * 100))}%` }}
                                      transition={{ duration: 0.8 }}
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                                    />
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-mono font-bold text-emerald-600 mt-1 block">
                                      {activeChild.savings_pot || 0} / {activeChild.savings_goal_amount} gold coins ({Math.min(100, Math.round(((activeChild.savings_pot || 0) / activeChild.savings_goal_amount) * 100))}%)
                                    </span>
                                    {activeChild.savings_goal_reward_id && (activeChild.savings_pot || 0) >= activeChild.savings_goal_amount && (
                                      <button
                                        onClick={() => {
                                          onClaimReward(activeChild.savings_goal_reward_id!, activeChild.id, 'savings');
                                          onClearSavingsGoal(activeChild.id);
                                          playSound.purchase();
                                        }}
                                        className="text-[9px] bg-amber-400 text-stone-900 px-2 py-1 rounded font-bold uppercase tracking-wider shadow-sm hover:bg-amber-300 cursor-pointer"
                                      >
                                        Purchase!
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setActiveChildTab('rewards'); playSound.click(); }}
                                  className="mb-3 w-full py-2 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-600 text-xs font-bold font-mono uppercase tracking-wider hover:bg-emerald-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <Target className="w-4 h-4" /> Pick a Goal from Rewards
                                </button>
                              )}

                              <p className={`text-[10px] ${styles.textMuted} mb-3 leading-relaxed`}>
                                Save your gold coins here for bigger prizes! Gold coins in the Savings Pot can't be spent until you take them out.
                              </p>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setShowDepositModal(true); setDepositAmount(Math.min(5, activeChild.points || 5)); playSound.click(); }}
                                  disabled={activeChild.points <= 0}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                    activeChild.points > 0
                                      ? 'bg-emerald-500 border border-emerald-700 text-white shadow-[0_3px_0_0_#047857]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  💰 Save Gold Coins
                                </button>
                                <button
                                  onClick={() => { setShowWithdrawConfirm(true); playSound.click(); }}
                                  disabled={(activeChild.savings_pot || 0) <= 0}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                    (activeChild.savings_pot || 0) > 0
                                      ? 'bg-amber-100 border border-amber-300 text-amber-800 shadow-[0_3px_0_0_#d97706]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  🔓 Take Out
                                </button>
                              </div>

                              {/* Deposit Modal */}
                              <AnimatePresence>
                                {showDepositModal && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2"
                                  >
                                    <label className="text-xs font-bold text-emerald-800 block text-center mb-1">How many gold coins to save?</label>
                                    <div className="flex items-center justify-center gap-4 py-2">
                                      <button
                                        onClick={() => { setDepositAmount(Math.max(1, depositAmount - 5)); playSound.click(); }}
                                        disabled={depositAmount <= 1}
                                        className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                                      >
                                        <Minus className="w-5 h-5" />
                                      </button>
                                
                                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-yellow-200 shadow-[0_4px_10px_rgba(245,158,11,0.4)]">
                                        <span className="text-2xl font-black font-mono text-amber-900 drop-shadow-sm">{depositAmount}</span>
                                      </div>
                                
                                      <button
                                        onClick={() => { setDepositAmount(Math.min(activeChild.points, depositAmount + 5)); playSound.click(); }}
                                        disabled={depositAmount >= activeChild.points}
                                        className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                                      >
                                        <Plus className="w-5 h-5" />
                                      </button>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => {
                                          if (depositAmount > 0 && depositAmount <= activeChild.points) {
                                            onSavingsDeposit(activeChild.id, depositAmount);
                                            setShowDepositModal(false);
                                            playSound.purchase();
                                          }
                                        }}
                                        disabled={depositAmount <= 0 || depositAmount > activeChild.points}
                                        className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-emerald-400 active:translate-y-0.5 transition-all"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => { setShowDepositModal(false); playSound.click(); }}
                                        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Withdraw Confirmation */}
                              <AnimatePresence>
                                {showWithdrawConfirm && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2"
                                  >
                                    <p className="text-xs font-bold text-amber-800">
                                      Take out all {activeChild.savings_pot || 0} gold coins from your Savings Pot?
                                    </p>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          onSavingsWithdraw(activeChild.id);
                                          setShowWithdrawConfirm(false);
                                          playSound.success();
                                        }}
                                        className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        Yes, Take Out
                                      </button>
                                      <button
                                        onClick={() => { setShowWithdrawConfirm(false); playSound.click(); }}
                                        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        Keep Saving
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Savings Pot Locked Preview (Level 1 only, before unlock) */}
                          {!activeChild.savings_unlocked && activeChild.level === 1 && (
                            <div className={`p-4 rounded-2xl sm:rounded-3xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center text-center gap-2 opacity-70`}>
                              <div className="flex items-center gap-2 text-stone-500">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-black font-mono uppercase tracking-wider">🐷 Savings Pot — Unlock at 50 XP!</span>
                              </div>
                              <div className="w-full max-w-[200px] h-2 bg-stone-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (activeChild.xp_in_level / 50) * 100)}%` }}
                                  transition={{ duration: 0.8 }}
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-stone-500 font-bold">
                                {activeChild.xp_in_level} / 50 XP
                              </span>
                            </div>
                          )}

                          {/* === FOOD POT SECTION === */}

                          {/* Food Pot Unlocked Card */}
                          {activeChild.food_pot_unlocked && activeChild.food_pot_unlock_seen && (
                            <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${styles.cardBg} ${styles.borderStyle} relative overflow-hidden shadow-lg`}>
                              <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-500`} />
                        
                              {/* Header */}
                              <div className="flex items-center justify-between mb-3 mt-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200 flex items-center justify-center">
                                    <Utensils className="w-5 h-5 text-orange-600" />
                                  </div>
                                  <div>
                                    <span className={`text-[8px] font-mono tracking-widest uppercase ${styles.textMuted} font-extrabold`}>FOOD POT</span>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                      <h4 className={`font-black text-sm ${styles.titleColor} leading-none`}>Food Pot</h4>
                                      <button 
                                        onClick={() => setShowFoodReplayVideo(true)}
                                        className="text-[9px] bg-orange-105 text-orange-700 hover:bg-orange-200 px-2 py-0.5 rounded-full font-bold transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                                      >
                                        <Play className="w-2.5 h-2.5 fill-orange-700" /> Play Video
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl">
                                  <span className="text-lg"><GoldCoinIcon /></span>
                                  <span className="text-lg font-mono font-black text-orange-700">{activeChild.food_pot || 0}</span>
                                </div>
                              </div>

                              {/* Weekly Contribution Progress */}
                              <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-orange-850">
                                    Weekly Contribution
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-orange-700">
                                    {activeChild.food_pot_weekly_contribution || 0} / 7 coins
                                  </span>
                                </div>
                                <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-orange-200">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, Math.round(((activeChild.food_pot_weekly_contribution || 0) / 7) * 100))}%` }}
                                    transition={{ duration: 0.8 }}
                                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                                  />
                                </div>
                                <span className={`text-[9px] font-mono ${styles.textMuted} mt-1.5 block`}>
                                  {activeChild.food_pot_weekly_contribution >= 7 
                                    ? "✅ Weekly contribution requirement met! Great job." 
                                    : `⚠️ Need ${7 - (activeChild.food_pot_weekly_contribution || 0)} more gold coins in the pot this week.`
                                  }
                                </span>
                              </div>

                              <p className={`text-[10px] ${styles.textMuted} mb-3 leading-relaxed`}>
                                Add gold coins to your Food Pot to fund your pet's food. Once in the pot, use them to buy food pieces!
                              </p>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setShowFoodDepositModal(true); setFoodDepositAmount(Math.min(7, activeChild.points || 7)); playSound.click(); }}
                                  disabled={activeChild.points <= 0}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    activeChild.points > 0
                                      ? 'bg-orange-500 border border-orange-700 text-white shadow-[0_3px_0_0_#c2410c]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  💰 Add Gold
                                </button>
                                <button
                                  onClick={() => { onBuyPetFood(activeChild.id); playSound.purchase(); }}
                                  disabled={(activeChild.food_pot || 0) < 1}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    (activeChild.food_pot || 0) >= 1
                                      ? 'bg-amber-100 border border-amber-300 text-amber-800 shadow-[0_3px_0_0_#d97706]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  🍖 Buy Food (1g)
                                </button>
                              </div>

                              {/* Food Pot Deposit Modal */}
                              <AnimatePresence>
                                {showFoodDepositModal && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200 space-y-2"
                                  >
                                    <label className="text-xs font-bold text-orange-800 block text-center mb-1">Add how many gold coins to Food Pot?</label>
                                    <div className="flex items-center justify-center gap-4 py-2">
                                      <button
                                        onClick={() => { setFoodDepositAmount(Math.max(1, foodDepositAmount - 1)); playSound.click(); }}
                                        disabled={foodDepositAmount <= 1}
                                        className="w-8 h-8 rounded-full bg-orange-205 text-orange-700 flex items-center justify-center cursor-pointer hover:bg-orange-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                
                                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-yellow-250 shadow-[0_4px_10px_rgba(245,158,11,0.4)]">
                                        <span className="text-xl font-black font-mono text-amber-900 drop-shadow-sm">{foodDepositAmount}</span>
                                      </div>
                                
                                      <button
                                        onClick={() => { setFoodDepositAmount(Math.min(activeChild.points, foodDepositAmount + 1)); playSound.click(); }}
                                        disabled={foodDepositAmount >= activeChild.points}
                                        className="w-8 h-8 rounded-full bg-orange-205 text-orange-755 flex items-center justify-center cursor-pointer hover:bg-orange-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => {
                                          if (foodDepositAmount > 0 && foodDepositAmount <= activeChild.points) {
                                            onFoodPotDeposit(activeChild.id, foodDepositAmount);
                                            setShowFoodDepositModal(false);
                                            playSound.purchase();
                                          }
                                        }}
                                        disabled={foodDepositAmount <= 0 || foodDepositAmount > activeChild.points}
                                        className="flex-1 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-orange-400 active:translate-y-0.5 transition-all"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => { setShowFoodDepositModal(false); playSound.click(); }}
                                        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Food Pot Locked Preview */}
                          {!activeChild.food_pot_unlocked && (activeChild.level < 2 || (activeChild.level === 2 && activeChild.xp_in_level < 50)) && (
                            <div className={`p-4 rounded-2xl sm:rounded-3xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center text-center gap-2 opacity-70`}>
                              <div className="flex items-center gap-2 text-stone-500">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-black font-mono uppercase tracking-wider">🥣 Food Pot — Unlock at Level 2, 50 XP!</span>
                              </div>
                              <div className="w-full max-w-[200px] h-2 bg-stone-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(() => {
                                      const xpEarned = activeChild.level === 1 ? activeChild.xp_in_level : (activeChild.level === 2 ? 100 + activeChild.xp_in_level : 150);
                                      return Math.min(100, Math.round((xpEarned / 150) * 100));
                                    })()}%`
                                  }}
                                  transition={{ duration: 0.8 }}
                                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-stone-500 font-bold">
                                {(() => {
                                  const xpEarned = activeChild.level === 1 ? activeChild.xp_in_level : (activeChild.level === 2 ? 100 + activeChild.xp_in_level : 150);
                                  return `${xpEarned} / 150 XP`;
                                })()}
                              </span>
                            </div>
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

        {/* Mobile Sticky Bottom Nav for Child Dashboard */}
        {selectedChildId && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center px-2 py-2 pb-safe">
            {[
              { id: 'companion', label: 'PET', icon: null, emoji: '✨' },
              { id: 'tasks', label: 'QUESTS', icon: null, emoji: '🎯' },
              { id: 'rewards', label: 'PRIZES', icon: null, emoji: '🎁' },
              { id: 'pots', label: 'POTS', icon: null, emoji: '🍯' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeChildTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { playSound.click(); setActiveChildTab(tab.id as any); }}
                  className={`relative p-3 rounded-xl transition-all flex flex-col items-center gap-1 w-full max-w-[80px] ${
                    isSelected
                      ? 'text-cyan-600 bg-cyan-50'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {Icon ? (
                    <Icon className="w-6 h-6" />
                  ) : (
                    <span className="text-2xl">{tab.emoji}</span>
                  )}
                  <span className={`text-[9px] font-bold font-mono tracking-widest uppercase ${isSelected ? 'text-cyan-600' : 'text-stone-500'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
}
