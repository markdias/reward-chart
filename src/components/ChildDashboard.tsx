import { 
  FaStar, FaHeart, FaEgg, FaBurst, FaWandMagicSparkles, FaHeartCrack,
  FaFaceSadTear, FaBone, FaCartShopping, FaGamepad, FaFaceFrown, FaCircleCheck, FaTriangleExclamation,
  FaBullseye, FaGift, FaJar, FaCoins, FaPiggyBank, FaBowlFood, FaGlobe, FaCat, FaWater, FaBook,
  FaChildDress, FaChild, FaCrown, FaFire, FaShield, FaBullhorn, FaBroom, FaPen, FaBaby, FaBolt,
  FaPizzaSlice, FaPalette, FaBookOpen, FaInfinity, FaCalendar, FaHandPeace, FaScroll, FaRocket, FaPaw
} from 'react-icons/fa6';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Flame, Play, ChevronRight, Lock, Star,
  ArrowLeft, CheckCircle, Gift, Sparkles, Smile, Target, Zap, RotateCcw, AlertTriangle, HelpCircle, TrendingUp,
  PiggyBank, X, Plus, Minus, Utensils, ShieldAlert
} from 'lucide-react';
import { Child, Task, TaskCompletion, Reward, RewardRedemption, ParentProfile } from '../types';
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { CHARACTER_PACKS, getCharacterStage } from '../data/characters';
import { playSound } from '../utils/sound';
import WellDoneOverlay from './WellDoneOverlay';
import { getCurrentWeekKey, getStartOfDailyReset } from '../utils/date';

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

// Gold coin badge
// shape='circle' → solid gold circle with number inside (tasks)
// shape='square' → amber icon box with coin outline + number (rewards, matches Gift icon style)
const CoinBadge = ({
  points,
  prefix = '+',
  size = 'md',
  shape = 'circle',
}: {
  points: number;
  prefix?: string;
  size?: 'sm' | 'md';
  shape?: 'circle' | 'square';
}) => {
  const label = `${prefix}${points}`;
  const len = label.length;
  const mdFont = len <= 2 ? '13px' : len === 3 ? '11px' : len === 4 ? '9px' : '8px';
  const smFont = len <= 2 ? '11px' : len === 3 ? '9px' : '8px';

  if (shape === 'square') {
    // Coin outline icon + number — same container style as Gift icon
    const svgFontSize = len <= 2 ? 11 : len === 3 ? 9 : 8;
    return (
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 bg-warning/15 border border-warning/30">
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Coin outer ring */}
          <circle cx="12" cy="12" r="9.5" stroke="#D97706" strokeWidth="1.8" fill="#FEF3C7" />
          {/* Inner ring detail */}
          <circle cx="12" cy="12" r="7" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="2 1.5" fill="none" />
          {/* Number in centre */}
          <text
            x="12"
            y="12"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={svgFontSize}
            fontWeight="900"
            fontFamily="Nunito, sans-serif"
            fill="#92400e"
            letterSpacing="-0.5"
          >
            {label}
          </text>
        </svg>
      </div>
    );
  }

  // Circle variant — solid gold coin (tasks)
  return (
    <div
      className={`inline-flex items-center justify-center font-black shrink-0 rounded-full ${
        size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
      }`}
      style={{
        background: 'linear-gradient(145deg, #FFE566 0%, #F59E0B 55%, #D97706 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 0 #92400e',
        color: '#78350f',
        border: '1.5px solid #B45309',
        letterSpacing: '-0.03em',
        fontSize: size === 'sm' ? smFont : mdFont,
        lineHeight: 1,
      }}
    >
      {label}
    </div>
  );
};

interface ChildDashboardProps {
  parentProfile?: ParentProfile | null;
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
  onBuyPetFood: (childId: string) => void;
  onFoodPotUnlockSeen: (childId: string) => void;
  onGiftingRequestCharity: (childId: string, amount: number, charityId: string) => void;
  onGiftingRequestSibling: (childId: string, amount: number, siblingId: string) => void;
  onGiftingUnlockSeen: (childId: string) => void;
  onUpdateChildStats: (childId: string, updates: Partial<Child>) => void;
  lockedChildId?: string | null;
  onLockChild?: (childId: string) => void;
  theme: ThemeId;
}

export default function ChildDashboard({
  parentProfile,
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
  onBuyPetFood,
  onFoodPotUnlockSeen,
  onGiftingRequestCharity,
  onGiftingRequestSibling,
  onGiftingUnlockSeen,
  onUpdateChildStats,
  lockedChildId,
  onLockChild,
  theme
}: ChildDashboardProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(lockedChildId || null);

  // Helper to offset dates by 4 hours for a "4 AM daily reset"
  // This ensures tasks completed at 1 AM count towards the previous day
  const getLogicalDateString = (date: Date | string) => {
    const d = new Date(date);
    d.setHours(d.getHours() - 4);
    return d.toDateString();
  };

  useEffect(() => {
    if (lockedChildId) {
      setSelectedChildId(lockedChildId);
    } else {
      setSelectedChildId(null);
    }
  }, [lockedChildId]);

  const [activeChildTab, setActiveChildTab] = useState<'companion' | 'tasks' | 'rewards' | 'pots'>('companion');

  const [expandedGoal, setExpandedGoal] = useState<'streak' | 'weekly' | 'monthly' | null>(null);
  const [isFeeding, setIsFeeding] = useState(false);

  // Well Done celebration overlay
  const [showWellDone, setShowWellDone] = useState(false);
  const [wellDoneTaskName, setWellDoneTaskName] = useState<string | null>(null);

  // Savings Pot UI State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(5);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showReplayVideo, setShowReplayVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Food Pot UI State
  const [showFoodReplayVideo, setShowFoodReplayVideo] = useState(false);
  const [penaltyMessage, setPenaltyMessage] = useState<string | null>(null);
  const [showFeedReminder, setShowFeedReminder] = useState(false);

  // Gifting Pot UI State
  const [showGiftingReplayVideo, setShowGiftingReplayVideo] = useState(false);

  
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [charityAmount, setCharityAmount] = useState<number>(1);
  const [selectedCharityId, setSelectedCharityId] = useState<string>('');
  
  const [showSiblingModal, setShowSiblingModal] = useState(false);
  const [siblingAmount, setSiblingAmount] = useState<number>(1);
  const [selectedSiblingId, setSelectedSiblingId] = useState<string>('');
  
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
    const showUnlock = activeChild && isSavingsUnlocked && (!activeChild.savings_unlock_seen || showReplayVideo);
    const showFoodUnlock = activeChild && isFoodPotUnlocked && (!activeChild.food_pot_unlock_seen || showFoodReplayVideo);
    const showGiftingUnlock = activeChild && isGiftingUnlocked && (!activeChild.gifting_unlock_seen || showGiftingReplayVideo);
    if (!showUnlock && !showFoodUnlock && !showGiftingUnlock) {
      setIsVideoPlaying(false);
    }
  }, [activeChild, showReplayVideo, showFoodReplayVideo, showGiftingReplayVideo]);

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

  // Feed Reminder Check
  useEffect(() => {
    if (!selectedChildId || !activeChild) return;
    
    // Only check if they have the food pot unlocked, haven't fed today, and no penalty modal is showing
    if (isFoodPotUnlocked && activeChild.food_pot_unlock_seen && !activeChild.pet_fed_today && !penaltyMessage) {
      const todayStr = new Date().toISOString().split('T')[0];
      const storageKey = `feed_reminder_${activeChild.id}`;
      const lastAsked = localStorage.getItem(storageKey);
      
      if (lastAsked !== todayStr) {
        // We haven't asked them today yet!
        setShowFeedReminder(true);
      }
    }
  }, [selectedChildId, activeChild?.id, activeChild?.food_pot_unlocked, activeChild?.food_pot_unlock_seen, activeChild?.pet_fed_today, penaltyMessage]);

  const isSavingsUnlocked = activeChild ? (activeChild.savings_unlocked || activeChild.level >= (parentProfile?.savings_pot_unlock_level ?? 2)) : false;
  const isFoodPotUnlocked = activeChild ? (activeChild.food_pot_unlocked || activeChild.level >= (parentProfile?.food_pot_unlock_level ?? 4)) : false;
  const isGiftingUnlocked = activeChild ? (activeChild.gifting_unlocked || activeChild.level >= (parentProfile?.gifting_pot_unlock_level ?? 6)) : false;
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

  const handleTaskCheck = (taskId: string, taskName?: string) => {
    if (!selectedChildId) return;
    playSound.success();
    onCompleteTask(taskId, selectedChildId);
    setWellDoneTaskName(taskName || null);
    setShowWellDone(true);
    setTimeout(() => setShowWellDone(false), 2600);
  };

  const handleClaimReward = (rewardId: string, cost: number, paymentSource: 'main' | 'savings' = 'main') => {
    if (!activeChild) return;
    const available = paymentSource === 'savings' ? (activeChild.savings_pot || 0) : availablePoints;
    if (available < cost) {
      playSound.pinError();
      return;
    }
    playSound.success();
    onClaimReward(rewardId, activeChild.id, paymentSource);
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
    const startOfDay = getStartOfDailyReset(now);

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
    <div className={`min-h-screen bg-page flex flex-col font-sans relative overflow-x-hidden transition-colors duration-300`} id="child-root">
      
      {/* Sweeping Curved Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[88px] sm:h-[96px] bg-gradient-to-br from-warning to-warning-shadow rounded-b-2xl shadow-sm z-0 pointer-events-none transition-all duration-500"></div>

      {/* Immersive Starry Grid Backdrop */}
      <div className={`absolute inset-0 ${styles.gridStyle} pointer-events-none`} />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-warning/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 left-1/4 w-[600px] h-[600px] bg-warning/10 rounded-full blur-3xl pointer-events-none" />

      {/* Well Done celebration overlay (anime.js powered) */}
      <WellDoneOverlay show={showWellDone} taskName={wellDoneTaskName} />

      {/* Evolution Pop-up Milestone Cinematic Overlay */}
      <AnimatePresence>
        {evolvingStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 flex flex-col items-center justify-center p-6 text-center"
            id="evolution-cinematic"
          >
            <div className="absolute inset-0  opacity-30 pointer-events-none" />
            
            <motion.div
              initial={{ scale: 0.8, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 8 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative max-w-lg bg-white border-4 border-cyan-400 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.4)] space-y-6"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-ping pointer-events-none" />
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-full text-xs font-bold uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                {isHatching && hatchPhase !== 'reveal' ? 'EGG HATCHING...' : 'COMPANION UPGRADE'}
              </div>

              <h2 className="text-3xl font-black font-display bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent text-cyan-500">
                {isHatching && hatchPhase !== 'reveal' ? 'YOUR EGG IS HATCHING!' : 'EVOLUTION TRIGGERED!'}
              </h2>

              <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
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
                    className={`relative h-44 w-44 rounded-full ${evolvingStage.image_url ? 'bg-white' : 'bg-white'} border-4 border-cyan-400 flex items-center justify-center text-8xl shadow-2xl overflow-hidden z-10`}
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
                className={`w-full btn-primary py-4 bg-gradient-to-r ${
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
        {activeChild && isSavingsUnlocked && (!activeChild.savings_unlock_seen || showReplayVideo) && (
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
              className="relative w-full max-w-lg bg-white border-4 border-gray-200 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              {/* Sunburst background effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                NEW FEATURE UNLOCKED
              </div>

              <h2 className="text-3xl font-black font-display text-stone-900">
                <FaWandMagicSparkles className="inline-block mr-2 text-pink-500" /> SAVINGS POT UNLOCKED!
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
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform active:scale-[0.96] transition-transform">
                      <Play className="w-8 h-8 text-amber-500 fill-amber-500 ml-1" />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => { playSound.success(); onSavingsUnlockSeen(activeChild.id); setShowReplayVideo(false); }}
                className="w-full btn-primary w-full"
                id="savings-unlock-dismiss-btn"
              >
                GOT IT! <FaWandMagicSparkles className="inline-block ml-2 text-pink-500" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Pot Unlock Celebration Overlay */}
      <AnimatePresence>
        {activeChild && isFoodPotUnlocked && (!activeChild.food_pot_unlock_seen || showFoodReplayVideo) && (
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
              className="relative w-full max-w-lg bg-white border-4 border-gray-200 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              {/* Sunburst background effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-300 text-orange-700 rounded-full text-xs font-bold uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                NEW FEATURE UNLOCKED
              </div>

              <h2 className="text-3xl font-black font-display text-stone-900">
                <FaWandMagicSparkles className="inline-block mr-2 text-orange-500" /> FOOD POT UNLOCKED!
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
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform active:scale-[0.96] transition-transform">
                      <Play className="w-8 h-8 text-orange-500 fill-orange-500 ml-1" />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => { playSound.success(); onFoodPotUnlockSeen(activeChild.id); setShowFoodReplayVideo(false); }}
                className="w-full btn-primary w-full"
                id="food-pot-unlock-dismiss-btn"
              >
                GOT IT! <FaWandMagicSparkles className="inline-block ml-2 text-pink-500" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gifting Pot Unlock Celebration Overlay */}
      <AnimatePresence>
        {activeChild && isGiftingUnlocked && (!activeChild.gifting_unlock_seen || showGiftingReplayVideo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            id="gifting-pot-unlock-cinematic"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative w-full max-w-lg bg-white border-4 border-gray-200 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              {/* Sunburst background effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 border border-rose-300 text-rose-700 rounded-full text-xs font-bold uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
                NEW FEATURE UNLOCKED
              </div>

              <h2 className="text-3xl font-black font-display text-stone-900">
                <FaWandMagicSparkles className="inline-block mr-2 text-purple-500" /> GIFTING POT UNLOCKED!
              </h2>

              <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                You're so generous, <strong className="text-stone-900">{activeChild.name}</strong>! You've unlocked the <strong className="text-rose-600">Gifting Pot</strong>! You can now use your gold coins to help others by donating to charity or gifting to a sibling.
              </p>

              {/* Video Player */}
              <div className="relative w-full aspect-video rounded-2xl bg-stone-100 border-2 border-stone-200 overflow-hidden shadow-inner group">
                <video 
                  ref={videoRef}
                  src="/gifting-pot-video.mp4" 
                  controls 
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/gifting-pot-poster.jpg"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  <source src="/gifting-pot-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!isVideoPlaying && (
                  <div 
                    onClick={() => {
                      videoRef.current?.play();
                    }}
                    className="absolute inset-0 cursor-pointer flex items-center justify-center group-hover:opacity-0 transition-opacity bg-stone-900/20"
                  >
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform active:scale-[0.96] transition-transform">
                      <Play className="w-8 h-8 text-rose-500 fill-rose-500 ml-1" />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => { playSound.success(); onGiftingUnlockSeen(activeChild.id); setShowGiftingReplayVideo(false); }}
                className="w-full btn-danger w-full"
                id="gifting-pot-unlock-dismiss-btn"
              >
                GOT IT! <FaWandMagicSparkles className="inline-block ml-2 text-pink-500" />
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
              className="relative w-full max-w-md bg-white border-4 border-gray-200 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-rose-100 border border-rose-300 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-rose-600 animate-bounce" />
              </div>

              <h2 className="text-2.5xl font-black font-display text-rose-600">
                <FaHeartCrack className="inline-block mr-2 text-red-500" /> PET IS UNHAPPY!
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed">
                {penaltyMessage}
              </p>

              <button
                onClick={() => { playSound.success(); setPenaltyMessage(null); }}
                className="w-full btn-danger py-3 text-sm"
                id="pet-penalty-dismiss-btn"
              >
                I Promise to Feed Them! <FaFaceSadTear className="inline-block ml-2 text-yellow-500" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed Reminder Modal */}
      <AnimatePresence>
        {showFeedReminder && !penaltyMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            id="feed-reminder-modal"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="relative w-full max-w-md bg-white border-4 border-gray-200 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-orange-100 border border-orange-300 rounded-2xl flex items-center justify-center">
                <Utensils className="w-10 h-10 text-orange-500 animate-bounce" />
              </div>

              <h2 className="text-2.5xl font-black font-display text-orange-500">
                TIME TO FEED!
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed">
                Don't forget to feed <strong className="text-stone-900">{activeChildPack?.name.split(' the ')[0] || 'your pet'}</strong> today! A happy pet is a good companion.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { 
                    playSound.success(); 
                    setShowFeedReminder(false);
                    if (activeChild) {
                      localStorage.setItem(`feed_reminder_${activeChild.id}`, new Date().toISOString().split('T')[0]);
                    }
                    if ((activeChild?.pet_food || 0) > 0) {
                      handleFeedCompanion();
                    } else {
                      setActiveChildTab('pots');
                    }
                  }}
                  className="w-full btn-warning py-3 text-sm"
                >
                  {(activeChild?.pet_food || 0) > 0 ? <span>Feed Now! <FaBone className="inline-block ml-2" /></span> : <span>Get Food! <FaCartShopping className="inline-block ml-2" /></span>}
                </button>
                <button
                  onClick={() => { 
                    playSound.click(); 
                    setShowFeedReminder(false); 
                    if (activeChild) {
                      localStorage.setItem(`feed_reminder_${activeChild.id}`, new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className="w-full py-3 bg-transparent text-stone-500 font-bold rounded-2xl uppercase tracking-widest text-sm hover:text-stone-700 transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top-tier Console Navigation Bar */}
      <header className={`px-4 sm:px-6 pt-safe-top pt-6 pb-6 flex justify-between items-center relative z-40 bg-transparent border-none`}>
        <div className="flex items-center gap-2 sm:gap-3">
          {selectedChildId ? (
            lockedChildId ? (
              <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-white shadow-lg shadow-orange-500/20 flex items-center justify-center text-sm sm:text-lg`}>
                <Lock className="w-4 h-4 text-orange-500" />
              </div>
            ) : (
              <button
                onClick={() => { playSound.click(); setSelectedChildId(null); }}
                className={`p-2 rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-mono font-bold bg-white text-orange-600 hover:bg-orange-50 shadow-lg shadow-orange-500/20 border-none`}
                id="back-to-profiles-btn"
              >
                <ArrowLeft className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500`} /> <span className="hidden sm:inline">CHOOSE OPERATOR</span>
              </button>
            )
          ) : (
            <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-white shadow-lg shadow-orange-500/20 flex items-center justify-center text-sm sm:text-lg`}>
              🎮
            </div>
          )}
          <div className="flex flex-col ml-1">
            <span className={`text-[12px] sm:text-base font-black font-display tracking-widest uppercase text-amber-950 drop-shadow-sm`}>
              {activeChild ? `${activeChild.name}'S DASHBOARD` : 'KID CONTROL DECK'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedChildId && !lockedChildId && onLockChild && (
            <button
              onClick={() => { playSound.success(); onLockChild(selectedChildId); }}
              className={`hidden sm:flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-[9px] sm:text-xs font-bold font-mono cursor-pointer transition-all bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg shadow-orange-500/20 border-none`}
              title="Lock device to this child's profile"
            >
              <Lock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500`} /> <span>LOCK DEVICE</span>
            </button>
          )}
          <button
            onClick={() => { playSound.click(); onEnterParentMode(); }}
            className={`flex items-center gap-1 sm:gap-2 rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-[9px] sm:text-xs font-bold font-mono cursor-pointer transition-all bg-white text-rose-600 hover:bg-rose-50 shadow-lg shadow-orange-500/20 border-none`}
            id="parent-gate-lock-btn"
          >
            <Lock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500`} /> <span>SWITCH TO PARENT</span>
          </button>
        </div>
      </header>

      {/* Central HUD Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col relative z-20 overflow-y-auto mt-6 sm:mt-10 bg-white/90 backdrop-blur-md rounded-[2rem] shadow-xl shadow-orange-900/10 mb-24 lg:mb-8 border border-white/50" id="child-viewport">
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
                          <span className={`absolute -bottom-1 -right-1 sm:-bottom-1 sm:-right-1 h-5 w-5 sm:h-7 sm:w-7 rounded-full bg-rose-500 font-mono flex items-center justify-center text-[10px] sm:text-xs font-extrabold border-2 border-white text-white shadow-sm tabular-nums`}>
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
              
              /* ACTIVE CHILD ARCADE HUDS */
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
                      
                      <div className="absolute inset-0  opacity-15 pointer-events-none" />
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
                              <span className={`text-lg sm:text-xl font-mono font-black text-amber-600 tracking-tight leading-none tabular-nums`}>{activeChild.points}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isFoodPotUnlocked && (
                        <div className="mt-4 flex items-center justify-center w-full">
                          {activeChild.pet_unhappy ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-bold animate-pulse">
                              <FaFaceFrown className="inline-block mr-2 text-blue-500" /> Pet Unhappy & Hungry
                            </span>
                          ) : activeChild.pet_fed_today ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
                              <FaHeart className="inline-block mr-2 text-green-500" /> Pet Fed & Happy!
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold animate-bounce">
                              <FaBone className="inline-block mr-2 text-amber-700" /> Hungry! Needs Food
                            </span>
                          )}
                        </div>
                      )}

                      {/* Giant Levitating Pedestal */}
                      <div className="my-6 sm:my-10 relative flex items-center justify-center">
                        {/* Interactive floating particles */}
                        <div className="absolute h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-gradient-to-tr from-cyan-400/10 to-purple-500/10 animate-spin duration-[15s]" />
                        
                        <motion.div
                          animate={isFeeding ? { scale: [1, 1.25, 1.1, 1.3, 1], rotate: [0, 8, -8, 8, 0] } : {}}
                          transition={isFeeding ? { duration: 2.2, ease: "easeInOut" } : { duration: 1.2 }}
                          className={`h-32 w-32 sm:h-56 sm:w-56 rounded-full ${activeChildStage.image_url ? 'bg-white' : `bg-gradient-to-br ${activeChildStage.color_theme}`} flex items-center justify-center shadow-2xl border-4 border-stone-300 relative z-10 ${activeChildStage.animation_class} transition-colors duration-500 overflow-hidden`}
                        >
                          {activeChildStage.image_url ? (
                            <img src={activeChildStage.image_url} alt={activeChildStage.name} className="w-full h-full object-cover animate-float outline outline-1 -outline-offset-1 outline-black/10" />
                          ) : (
                            <span className="text-6xl sm:text-[9rem] leading-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                              {activeChildStage.emoji}
                            </span>
                          )}
                        </motion.div>
                      </div>
                      {/* Level and evolution progression */}
                      <div className={`w-full pt-5 mt-5 border-t ${styles.divider} space-y-2.5`}>
                        <div className={`flex justify-between text-xs ${styles.textMuted} font-mono`}>
                          <span>GOLD BAR</span>
                          <span className={`text-cyan-500 font-extrabold tabular-nums`}>LEVEL {activeChild.level}</span>
                        </div>
                        <div className={`w-full h-3 ${styles.cardBg} ${styles.borderStyle} rounded-full overflow-hidden mb-1 relative`}>
                          <motion.div 
                            className={`h-full ${activeChild.level >= 10 ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500' : 'bg-gradient-to-r from-cyan-400 to-purple-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (((activeChild.lifetime_points || 0) % (parentProfile?.points_to_level_up ?? 500)) / (parentProfile?.points_to_level_up ?? 500)) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex justify-between items-center w-full px-1">
                          <span className={`text-[10px] font-mono ${styles.textMuted} font-bold tabular-nums`}>GOLD BAR: {(activeChild.lifetime_points || 0) % (parentProfile?.points_to_level_up ?? 500)} / {parentProfile?.points_to_level_up ?? 500}</span>
                        </div>
                      </div>

                      {isFoodPotUnlocked && (
                        <div className="w-full pt-4 mt-4 border-t border-dashed border-stone-200 flex flex-col gap-2">
                          <button
                            onClick={handleFeedCompanion}
                            disabled={isFeeding || (activeChild.pet_food || 0) <= 0 || activeChild.pet_fed_today}
                            className={`w-full py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                              activeChild.pet_fed_today
                                ? 'bg-stone-100 text-stone-400 cursor-default border border-stone-200'
                                : (activeChild.pet_food || 0) > 0
                                  ? 'bg-warning border-2 border-neutral-border text-dark shadow-sm hover:translate-y-0.5 hover:shadow-[0_2px_0_0_var(--color-dark-shadow)] active:translate-y-1 active:shadow-none'
                                  : 'bg-stone-200 text-stone-400 border border-neutral-border cursor-not-allowed'
                            }`}
                          >
                            {isFeeding ? (
                              <span><FaBone className="inline-block mr-2 text-amber-700" /> Chomp Chomp...</span>
                            ) : activeChild.pet_fed_today ? (
                              <span><FaCircleCheck className="inline-block mr-2 text-green-500" /> Fed for Today!</span>
                            ) : (
                              <span><FaBone className="inline-block mr-2 text-amber-700" /> Feed Pet (1 Food)</span>
                            )}
                          </button>
                          <div className={`flex justify-between items-center text-[10px] font-mono ${styles.textMuted} font-bold`}>
                            <span>FOOD INVENTORY:</span>
                            <span className="text-orange-600 font-extrabold tabular-nums">{activeChild.pet_food || 0} pieces</span>
                          </div>
                          {(!activeChild.pet_fed_today && (activeChild.pet_food || 0) <= 0) && (
                            <span className="text-[9px] text-red-500 font-bold text-center mt-1">
                              <FaTriangleExclamation className="inline-block mr-2 text-yellow-500" /> No food left! Buy food from your Food Pot below.
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
                      const dispWeeklyPts = isWeeklyReset ? 0 : (activeChild.weekly_points || 0);
                      const weeklyPct = Math.min(100, Math.round((dispWeeklyPts / (parentProfile?.weekly_points_target || 300)) * 100));

                      const nextMonthly = activeChild.monthly_reset_date ? new Date(activeChild.monthly_reset_date) : null;
                      const isMonthlyReset = !nextMonthly || now >= nextMonthly;
                      const dispMonthlyPts = isMonthlyReset ? 0 : (activeChild.monthly_points || 0);
                      const monthlyPct = Math.min(100, Math.round((dispMonthlyPts / (parentProfile?.monthly_points_target || 1000)) * 100));

                      return (
                        <>
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                          {/* Streak Widget */}
                          <button 
                            onClick={() => { playSound.click(); setExpandedGoal('streak'); }}
                            className={`p-3 rounded-2xl ${styles.cardBg} ${styles.borderStyle} flex flex-col items-center justify-center text-center shadow-lg cursor-pointer hover:scale-105 active:scale-[0.96] transition-transform`}
                          >
                            <Flame className={`w-5 h-5 sm:w-7 sm:h-7 mb-1 ${activeChild.streak_days > 0 ? 'text-orange-500 flame-active' : 'text-stone-300'}`} />
                            <span className={`font-black text-sm sm:text-base ${activeChild.streak_days > 0 ? 'text-orange-600' : 'text-stone-400'}`}>{activeChild.streak_days}</span>
                            <span className="text-[8px] sm:text-[10px] font-mono font-bold text-stone-500 uppercase tracking-tighter mt-0.5">Day Streak</span>
                          </button>

                          {/* Weekly Widget */}
                          <button 
                            onClick={() => { playSound.click(); setExpandedGoal('weekly'); }}
                            className={`p-3 rounded-2xl ${styles.cardBg} ${styles.borderStyle} flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group cursor-pointer hover:scale-105 active:scale-[0.96] transition-transform`}
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
                            className={`p-3 rounded-2xl ${styles.cardBg} ${styles.borderStyle} flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group cursor-pointer hover:scale-105 active:scale-[0.96] transition-transform`}
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
                                        {parentProfile?.weekly_reward_points || 200} GOLD BONUS
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
                                      <span>{dispWeeklyPts} / {(parentProfile?.weekly_points_target || 300)} PTS</span>
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
                                        {parentProfile?.monthly_reward_points || 1000} GOLD BONUS
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
                                      <span>{dispMonthlyPts} / {(parentProfile?.monthly_points_target || 1000)} PTS</span>
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
                        <FaBullseye className="text-xl sm:text-base text-red-500" /> <span className="hidden sm:inline">QUESTS</span>
                      </button>
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('rewards'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'rewards'
                            ? 'bg-amber-400 border border-stone-950 text-stone-900 font-black shadow-sm'
                            : 'text-stone-600 hover:text-stone-900 font-bold'
                        }`}
                      >
                        <span className="text-xl sm:text-base"><FaGift className="text-purple-500" /></span> <span className="hidden sm:inline">PRIZES</span>
                      </button>
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('pots'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'pots'
                            ? 'bg-amber-400 border border-stone-950 text-stone-900 font-black shadow-sm'
                            : 'text-stone-600 hover:text-stone-900 font-bold'
                        }`}
                      >
                        <FaJar className="text-xl sm:text-base text-amber-500" /> <span className="hidden sm:inline">POTS</span>
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
                              <span className="text-5xl block animate-bounce-slow"><FaWandMagicSparkles className="text-pink-500" /></span>
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
                                compl = completions.find(c => c.task_id === task.id && c.child_id === activeChild.id && getLogicalDateString(c.completed_at) === getLogicalDateString(new Date()));
                              } else if (task.recurrence === 'weekly') {
                                // For weekly, we could also use logical date, but getCurrentWeekKey is fine for now
                                compl = completions.find(c => c.task_id === task.id && c.child_id === activeChild.id && getCurrentWeekKey(new Date(c.completed_at)) === getCurrentWeekKey(new Date()));
                              } else if (task.recurrence === 'one_time') {
                                compl = completions.find(c => c.task_id === task.id && c.child_id === activeChild.id);
                              }

                              const isPending = compl && compl.status === 'pending';
                              const isApproved = compl && compl.status === 'approved';

                              // Count how many times repeatable quest was completed today (using logical day)
                              const completedTodayCount = completions.filter(c => 
                                c.task_id === task.id && 
                                c.child_id === activeChild.id && 
                                getLogicalDateString(c.completed_at) === getLogicalDateString(new Date())
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

                              const isCompletable = !isApproved && !isPending && !isOnCooldown;

                              const cardContent = (
                                <>
                                  {/* Line 1: Tags */}
                                  <div className="flex flex-wrap items-center gap-1.5 w-full">
                                    <span className={`text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded`}>
                                      {task.category.toUpperCase()}
                                    </span>
                                    <span className={`text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded`}>
                                      {task.recurrence === 'one_time' ? 'ONE-OFF' : task.recurrence.toUpperCase()}
                                    </span>
                                    {isPending && (
                                      <span className={`text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded animate-pulse`}>
                                        PENDING
                                      </span>
                                    )}
                                    {task.recurrence === 'repeatable' && completedTodayCount > 0 && (
                                      <span className={`text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded`}>
                                        <GoldCoinIcon /> Completed {completedTodayCount}x
                                      </span>
                                    )}
                                  </div>

                                  {/* Line 2: Name + Coins + Button */}
                                  <div className="flex items-center justify-between gap-2 w-full">
                                    <h4 className={`font-black font-display text-sm sm:text-base tracking-wide truncate ${isApproved ? 'line-through text-gray-9000' : styles.titleColor}`}>
                                      {task.title}
                                    </h4>

                                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                      <CoinBadge points={task.points} prefix="+" shape="square" />

                                      {isApproved ? (
                                        <span className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl font-mono text-[9px] sm:text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700`}>
                                          VERIFIED
                                        </span>
                                      ) : isPending ? (
                                        <span className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl font-mono text-[9px] sm:text-[10px] font-bold uppercase animate-pulse bg-stone-100 text-stone-600`}>
                                          AWAITING
                                        </span>
                                      ) : isOnCooldown ? (
                                        <span className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl font-mono text-[9px] sm:text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200`}>
                                          COOLDOWN ({cooldownTimeLeftStr})
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </>
                              );

                              return isCompletable ? (
                                <button
                                  key={task.id}
                                  onClick={() => handleTaskCheck(task.id, task.title)}
                                  id={`claim-task-${task.id}`}
                                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all flex flex-col gap-1.5 sm:gap-2 cursor-pointer active:scale-[0.98] active:brightness-95 ${styles.cardBg} ${styles.borderStyle} hover:border-primary/40 hover:shadow-lg`}
                                >
                                  {cardContent}
                                </button>
                              ) : (
                                <div
                                  key={task.id}
                                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all flex flex-col gap-1.5 sm:gap-2 ${
                                    isApproved
                                      ? 'bg-white/40 border-slate-950/50 opacity-45'
                                      : isPending
                                        ? 'bg-indigo-950/25 border-indigo-500/30'
                                        : 'bg-amber-950/20 border-amber-500/20 opacity-75'
                                  }`}
                                >
                                  {cardContent}
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
                              <span className="text-5xl block animate-bounce-slow"><FaGift className="text-purple-500" /></span>
                              <h4 className={`font-extrabold ${styles.textColor}`}>SHOP EMPTY</h4>
                              <p className={`text-xs ${styles.textMuted}`}>Ask your parents to unlock custom prizes for you!</p>
                            </div>
                          ) : (
                            rewards.filter(r => r.child_id === activeChild.id).map((rew) => {
                              const availability = getRewardAvailability(rew, redemptions.filter(r => r.child_id === activeChild.id));
                              const isAffordable = availablePoints >= rew.cost_points;
                              const hasPendingRequest = redemptions.some(r => r.child_id === activeChild.id && r.reward_id === rew.id && r.status === 'requested');
                              const isSavingFor = isSavingsUnlocked && activeChild.savings_goal_reward_id === rew.id;
                              const canDispense = isAffordable && availability.available && !hasPendingRequest;
                              
                              // Hide claimed one_time rewards entirely
                              if (!rew.is_available && rew.limit_type === 'one_time') {
                                return null;
                              }

                              const cardInner = (
                                <>
                                  <div className="flex gap-2.5 sm:gap-3 items-center min-w-0">
                                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                                      canDispense
                                        ? 'bg-warning/15 border border-warning/30'
                                        : 'bg-stone-100 border border-stone-200'
                                    }`}>
                                      <Gift className={`w-5 h-5 sm:w-6 sm:h-6 ${canDispense ? 'text-warning' : 'text-stone-400'}`} />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className={`font-extrabold text-xs sm:text-sm ${styles.titleColor} font-display tracking-wide truncate`}>{rew.title}</h4>
                                      <p className={`text-[9px] sm:text-[10px] font-mono ${styles.textMuted} uppercase mt-0.5`}>COST: {rew.cost_points} GOLD</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-1.5 sm:gap-2 shrink-0">
                                    {isSavingsUnlocked && (
                                      isSavingFor ? (
                                        <span className="text-[10px] sm:text-xs text-emerald-700 font-black uppercase tracking-wider flex items-center gap-1 bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-300">
                                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Saving
                                        </span>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onSavingsGoal(activeChild.id, rew.id);
                                            playSound.success();
                                          }}
                                          className="text-[8px] text-emerald-600 hover:bg-emerald-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                                        >
                                          Set as Goal
                                        </button>
                                      )
                                    )}

                                    {/* Status / cost badge */}
                                    {hasPendingRequest ? (
                                      <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase px-2.5 py-1.5 rounded-lg animate-pulse bg-stone-100 text-stone-600">
                                        PENDING
                                      </span>
                                    ) : !availability.available ? (
                                      <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-400">
                                        {availability.reason}
                                      </span>
                                    ) : (
                                      <CoinBadge points={rew.cost_points} prefix="" shape="square" />
                                    )}
                                  </div>
                                </>
                              );

                              return canDispense ? (
                                <button
                                  key={rew.id}
                                  onClick={() => isSavingFor
                                    ? handleClaimReward(rew.id, rew.cost_points, 'savings')
                                    : handleClaimReward(rew.id, rew.cost_points)
                                  }
                                  id={`claim-reward-${rew.id}`}
                                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-1.5 sm:gap-2 cursor-pointer active:scale-[0.98] active:brightness-95 ${
                                    isSavingFor
                                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-lg'
                                      : `${styles.cardBg} ${styles.borderStyle} hover:border-warning/40 hover:shadow-lg`
                                  }`}
                                >
                                  {cardInner}
                                </button>
                              ) : (
                                <div
                                  key={rew.id}
                                  className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-1.5 sm:gap-2 opacity-60 ${styles.cardBg} border-slate-800/30`}
                                >
                                  {cardInner}
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
                          {isSavingsUnlocked && activeChild.savings_unlock_seen && (
                            <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${styles.cardBg} ${styles.borderStyle} relative overflow-hidden shadow-lg`}>
                              <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500`} />
                        
                              {/* Header */}
                              <div className="flex items-center justify-between mb-3 mt-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center">
                                    <PiggyBank className="w-5 h-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <span className={`text-[8px] font-mono tracking-widest uppercase ${styles.textMuted} font-extrabold`}>SAVINGS POT</span>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                      <h4 className={`font-black text-sm ${styles.titleColor} leading-none`}>Savings</h4>
                                      <button 
                                        onClick={() => setShowReplayVideo(true)}
                                        className="text-[9px] bg-emerald-105 text-emerald-700 hover:bg-emerald-200 px-2 py-0.5 rounded-full font-bold transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
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
                        
                              <p className={`text-[10px] ${styles.textMuted} mb-3 leading-relaxed`}>
                                Move gold coins here from your main pocket to save them safely. Coins in the savings pot can't be used to buy items in the Rewards shop until you withdraw them.
                              </p>

                              {activeChild.savings_goal_name && (
                                <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-emerald-850">
                                      Goal: {activeChild.savings_goal_name}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-emerald-700">
                                      {activeChild.savings_pot || 0} / {activeChild.savings_goal_amount}
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-emerald-200">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(100, Math.round(((activeChild.savings_pot || 0) / (activeChild.savings_goal_amount || 1)) * 100))}%` }}
                                      transition={{ duration: 0.8 }}
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                    />
                                  </div>
                                  {(activeChild.savings_pot || 0) >= (activeChild.savings_goal_amount || 0) && activeChild.savings_goal_reward_id && (
                                    <button
                                      onClick={() => handleClaimReward(activeChild.savings_goal_reward_id!, activeChild.savings_goal_amount!, 'savings')}
                                      className="mt-3 w-full py-2 bg-emerald-500 text-white font-black uppercase tracking-wider rounded-lg shadow-[0_3px_0_0_#047857] hover:bg-emerald-400 active:translate-y-1 active:shadow-none text-[10px] sm:text-xs transition-all"
                                    >
                                      <FaWandMagicSparkles className="inline-block mr-2" /> CLAIM GOAL!
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex gap-2 relative">
                                <button
                                  onClick={() => { setShowDepositModal(true); setDepositAmount(Math.min(5, activeChild.points)); playSound.click(); }}
                                  disabled={activeChild.points <= 0}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    activeChild.points > 0
                                      ? 'bg-emerald-500 border border-emerald-700 text-white shadow-[0_3px_0_0_#047857]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  <FaCoins className="inline-block mr-2 text-yellow-500" /> Deposit
                                </button>
                                <button
                                  onClick={() => { setShowWithdrawConfirm(true); playSound.click(); }}
                                  disabled={(activeChild.savings_pot || 0) <= 0}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    (activeChild.savings_pot || 0) > 0
                                      ? 'bg-white border border-stone-300 text-stone-700 shadow-[0_3px_0_0_#d6d3d1]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  Withdraw All
                                </button>
                              </div>

                              {/* Deposit Modal */}
                              <AnimatePresence>
                                {showDepositModal && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 relative z-20"
                                  >
                                    <label className="text-xs font-bold text-emerald-800 block text-center mb-1">Deposit how many coins?</label>
                                    <div className="flex items-center justify-center gap-4 py-2">
                                      <button
                                        onClick={() => { setDepositAmount(Math.max(1, depositAmount - 1)); playSound.click(); }}
                                        disabled={depositAmount <= 1}
                                        className="w-8 h-8 rounded-full bg-emerald-205 text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                
                                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-yellow-250 shadow-[0_4px_10px_rgba(245,158,11,0.4)]">
                                        <span className="text-xl font-black font-mono text-amber-900 drop-shadow-sm tabular-nums">{depositAmount}</span>
                                      </div>
                                
                                      <button
                                        onClick={() => { setDepositAmount(Math.min(activeChild.points, depositAmount + 1)); playSound.click(); }}
                                        disabled={depositAmount >= activeChild.points}
                                        className="w-8 h-8 rounded-full bg-emerald-205 text-emerald-755 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                      >
                                        <Plus className="w-4 h-4" />
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

                              {/* Withdraw Confirm Modal */}
                              <AnimatePresence>
                                {showWithdrawConfirm && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2 relative z-20"
                                  >
                                    <p className="text-xs font-bold text-rose-800 text-center">Are you sure you want to withdraw all {activeChild.savings_pot} coins back to your pocket?</p>
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => {
                                          onSavingsWithdraw(activeChild.id);
                                          setShowWithdrawConfirm(false);
                                          playSound.purchase();
                                        }}
                                        className="flex-1 py-2 rounded-lg bg-rose-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm hover:bg-rose-400 active:translate-y-0.5 transition-all"
                                      >
                                        Yes, Withdraw
                                      </button>
                                      <button
                                        onClick={() => { setShowWithdrawConfirm(false); playSound.click(); }}
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

                          {/* Savings Pot Locked Preview (Level 1 only, before unlock) */}
                          {!isSavingsUnlocked && activeChild.level < (parentProfile?.savings_pot_unlock_level ?? 2) && (
                            <div className={`p-4 rounded-2xl sm:rounded-3xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center text-center gap-2 opacity-70`}>
                              <div className="flex items-center gap-2 text-stone-500">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-black font-mono uppercase tracking-wider"><FaPiggyBank className="inline-block mr-2 text-pink-400" /> Savings Pot — Unlock at Level {parentProfile?.savings_pot_unlock_level ?? 2}!</span>
                              </div>
                              <div className="w-full max-w-[200px] h-2 bg-stone-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(() => {
                                      const goldReq = ((parentProfile?.savings_pot_unlock_level ?? 2) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                      return Math.min(100, Math.round(((activeChild.lifetime_points || 0) / Math.max(1, goldReq)) * 100));
                                    })()}%`
                                  }}
                                  className="h-full bg-stone-400"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-stone-400 font-bold">
                                {(() => {
                                  const goldReq = ((parentProfile?.savings_pot_unlock_level ?? 2) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return `${(activeChild.lifetime_points || 0)} / ${goldReq} GOLD`;
                                })()}
                              </span>
                            </div>
                          )}                          {/* === FOOD POT SECTION === */}

                          {/* Food Pot Unlocked Card */}
                          {isFoodPotUnlocked && activeChild.food_pot_unlock_seen && (
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
                                  <span className="text-lg font-mono font-black text-orange-700">{(activeChild as any).food_pot || 0}</span>
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
                                    ? <span><FaCircleCheck className="inline-block mr-2 text-green-500" /> Weekly contribution requirement met! Great job.</span> 
                                    : <span><FaTriangleExclamation className="inline-block mr-2 text-yellow-500" /> Need {7 - (activeChild.food_pot_weekly_contribution || 0)} more gold coins in the pot this week.</span>
                                  }
                                </span>
                              </div>

                              <p className={`text-[10px] ${styles.textMuted} mb-3 leading-relaxed`}>
                                Add gold coins to your Food Pot to fund your pet's food. Once in the pot, use them to buy food pieces!
                              </p>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { onBuyPetFood(activeChild.id); playSound.purchase(); }}
                                  disabled={(activeChild.points || 0) < 1}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    (activeChild.points || 0) >= 1
                                      ? 'bg-amber-100 border border-amber-300 text-amber-800 shadow-[0_3px_0_0_#d97706]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  <FaBone className="inline-block mr-2" /> Buy Food (1g)
                                </button>
                              </div>

                            </div>
                          )}

                          {/* Food Pot Locked Preview */}
                          {!isFoodPotUnlocked && activeChild.level < (parentProfile?.food_pot_unlock_level ?? 4) && (
                            <div className={`p-4 rounded-2xl sm:rounded-3xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center text-center gap-2 opacity-70`}>
                              <div className="flex items-center gap-2 text-stone-500">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-black font-mono uppercase tracking-wider"><FaBowlFood className="inline-block mr-2 text-orange-400" /> Food Pot — Unlock at Level {parentProfile?.food_pot_unlock_level ?? 4}!</span>
                              </div>
                              <div className="w-full max-w-[200px] h-2 bg-stone-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(() => {
                                      const goldReq = ((parentProfile?.food_pot_unlock_level ?? 4) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                      return Math.min(100, Math.round(((activeChild.lifetime_points || 0) / Math.max(1, goldReq)) * 100));
                                    })()}%`
                                  }}
                                  className="h-full bg-stone-400"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-stone-400 font-bold">
                                {(() => {
                                  const goldReq = ((parentProfile?.food_pot_unlock_level ?? 4) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return `${(activeChild.lifetime_points || 0)} / ${goldReq} GOLD`;
                                })()}
                              </span>
                            </div>
                          )}

                          {/* === GIFTING POT SECTION === */}

                          {/* Gifting Pot Unlocked Card */}
                          {isGiftingUnlocked && activeChild.gifting_unlock_seen && (
                            <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${styles.cardBg} ${styles.borderStyle} relative overflow-hidden shadow-lg`}>
                              <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-500`} />
                        
                              {/* Header */}
                              <div className="flex items-center justify-between mb-3 mt-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200 flex items-center justify-center">
                                    <Gift className="w-5 h-5 text-rose-600" />
                                  </div>
                                  <div>
                                    <span className={`text-[8px] font-mono tracking-widest uppercase ${styles.textMuted} font-extrabold`}>GIFTING POT</span>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                      <h4 className={`font-black text-sm ${styles.titleColor} leading-none`}>Gifting Pot</h4>
                                      <button 
                                        onClick={() => setShowGiftingReplayVideo(true)}
                                        className="text-[9px] bg-rose-100 text-rose-700 hover:bg-rose-200 px-2 py-0.5 rounded-full font-bold transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                                      >
                                        <Play className="w-2.5 h-2.5 fill-rose-700" /> Play Video
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <p className={`text-[10px] ${styles.textMuted} mb-3 leading-relaxed`}>
                                Donate to charity or gift to a sibling directly from your Main Gold Pot. It feels good to give!
                              </p>

                              {/* Gifting Reminder */}
                              {(() => {
                                const lastGiftingDate = activeChild.last_gifting_date ? new Date(activeChild.last_gifting_date) : null;
                                const daysSinceGifting = lastGiftingDate ? Math.floor((new Date().getTime() - lastGiftingDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
                                if (daysSinceGifting > 14) {
                                  return (
                                    <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                                      <span className="text-rose-500"><FaHeart /></span>
                                      <p className="text-[10px] text-rose-700 font-bold uppercase tracking-wider">
                                        It's been a while since your last gift! Giving makes everyone happy.
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              })()}

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => { setShowCharityModal(true); setCharityAmount(Math.min(5, activeChild.points || 0)); setSelectedCharityId('CH-WILDLIFE'); playSound.click(); }}
                                  disabled={activeChild.points <= 0}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    activeChild.points > 0
                                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-[0_3px_0_0_#059669]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  <FaGlobe className="inline-block mr-2" /> Donate
                                </button>
                                <button
                                  onClick={() => { setShowSiblingModal(true); setSiblingAmount(Math.min(5, activeChild.points || 0)); setSelectedSiblingId(children.filter(c => c.id !== activeChild.id)[0]?.id || ''); playSound.click(); }}
                                  disabled={activeChild.points <= 0 || children.length <= 1}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    activeChild.points > 0 && children.length > 1
                                      ? 'bg-pink-100 border border-pink-300 text-pink-800 shadow-[0_3px_0_0_#be185d]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  <FaGift className="inline-block mr-2" /> Gift Sibling
                                </button>
                              </div>

                              {/* Charity Modal */}
                              <AnimatePresence>
                                {showCharityModal && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2"
                                  >
                                    <label className="text-xs font-bold text-emerald-800 block text-center mb-1">Donate to Charity (requires parent approval)</label>
                                    <select
                                      value={selectedCharityId}
                                      onChange={(e) => setSelectedCharityId(e.target.value)}
                                      className="w-full bg-white border border-emerald-200 text-stone-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    >
                                      <option value="CH-WILDLIFE"><FaCat className="inline-block mr-2" /> Global Wildlife Fund</option>
                                      <option value="CH-OCEAN"><FaWater className="inline-block mr-2" /> Save the Oceans</option>
                                      <option value="CH-CHILDREN"><FaBook className="inline-block mr-2" /> Kids Education Charity</option>
                                    </select>
                                    <div className="flex items-center justify-center gap-4 py-2">
                                      <button
                                        onClick={() => { setCharityAmount(Math.max(1, charityAmount - 1)); playSound.click(); }}
                                        disabled={charityAmount <= 1}
                                        className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-yellow-200 shadow-[0_4px_10px_rgba(245,158,11,0.4)]">
                                        <span className="text-xl font-black font-mono text-amber-900 drop-shadow-sm tabular-nums">{charityAmount}</span>
                                      </div>
                                      <button
                                        onClick={() => { setCharityAmount(Math.min(((activeChild as any).gifting_pot || 0), charityAmount + 1)); playSound.click(); }}
                                        disabled={charityAmount >= ((activeChild as any).gifting_pot || 0)}
                                        className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => {
                                          if (charityAmount > 0 && charityAmount <= ((activeChild as any).gifting_pot || 0) && selectedCharityId) {
                                            onGiftingRequestCharity(activeChild.id, charityAmount, selectedCharityId);
                                            setShowCharityModal(false);
                                            playSound.success();
                                          }
                                        }}
                                        disabled={charityAmount <= 0 || charityAmount > ((activeChild as any).gifting_pot || 0) || !selectedCharityId}
                                        className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-emerald-400 active:translate-y-0.5 transition-all"
                                      >
                                        Ask to Donate
                                      </button>
                                      <button
                                        onClick={() => { setShowCharityModal(false); playSound.click(); }}
                                        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Sibling Modal */}
                              <AnimatePresence>
                                {showSiblingModal && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-3 p-3 rounded-xl bg-pink-50 border border-pink-200 space-y-2"
                                  >
                                    <label className="text-xs font-bold text-pink-800 block text-center mb-1">Gift to Sibling (requires parent approval)</label>
                                    <select
                                      value={selectedSiblingId}
                                      onChange={(e) => setSelectedSiblingId(e.target.value)}
                                      className="w-full bg-white border border-pink-200 text-stone-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                                    >
                                      {children.filter(c => c.id !== activeChild.id).map(c => (
                                        <option key={c.id} value={c.id}><FaChildDress className="inline-block mr-1" /><FaChild className="inline-block mr-2" /> {c.name}</option>
                                      ))}
                                    </select>
                                    <div className="flex items-center justify-center gap-4 py-2">
                                      <button
                                        onClick={() => { setSiblingAmount(Math.max(1, siblingAmount - 1)); playSound.click(); }}
                                        disabled={siblingAmount <= 1}
                                        className="w-8 h-8 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center cursor-pointer hover:bg-pink-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-yellow-200 shadow-[0_4px_10px_rgba(245,158,11,0.4)]">
                                        <span className="text-xl font-black font-mono text-amber-900 drop-shadow-sm tabular-nums">{siblingAmount}</span>
                                      </div>
                                      <button
                                        onClick={() => { setSiblingAmount(Math.min(((activeChild as any).gifting_pot || 0), siblingAmount + 1)); playSound.click(); }}
                                        disabled={siblingAmount >= ((activeChild as any).gifting_pot || 0)}
                                        className="w-8 h-8 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center cursor-pointer hover:bg-pink-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => {
                                          if (siblingAmount > 0 && siblingAmount <= ((activeChild as any).gifting_pot || 0) && selectedSiblingId) {
                                            onGiftingRequestSibling(activeChild.id, siblingAmount, selectedSiblingId);
                                            setShowSiblingModal(false);
                                            playSound.success();
                                          }
                                        }}
                                        disabled={siblingAmount <= 0 || siblingAmount > ((activeChild as any).gifting_pot || 0) || !selectedSiblingId}
                                        className="flex-1 py-2 rounded-lg bg-pink-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-pink-400 active:translate-y-0.5 transition-all"
                                      >
                                        Ask to Gift
                                      </button>
                                      <button
                                        onClick={() => { setShowSiblingModal(false); playSound.click(); }}
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

                          {/* Gifting Pot Locked Preview */}
                          {!isGiftingUnlocked && activeChild.level < (parentProfile?.gifting_pot_unlock_level ?? 6) && (
                            <div className={`p-4 rounded-2xl sm:rounded-3xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center text-center gap-2 opacity-70`}>
                              <div className="flex items-center gap-2 text-stone-500">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-black font-mono uppercase tracking-wider"><FaHeart className="inline-block mr-2 text-pink-500" /> Gifting Pot — Unlock at Level {parentProfile?.gifting_pot_unlock_level ?? 6}!</span>
                              </div>
                              <div className="w-full max-w-[200px] h-2 bg-stone-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(() => {
                                      const goldReq = ((parentProfile?.gifting_pot_unlock_level ?? 6) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                      return Math.min(100, Math.round(((activeChild.lifetime_points || 0) / Math.max(1, goldReq)) * 100));
                                    })()}%`
                                  }}
                                  className="h-full bg-stone-400"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-stone-400 font-bold">
                                {(() => {
                                  const goldReq = ((parentProfile?.gifting_pot_unlock_level ?? 6) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return `${(activeChild.lifetime_points || 0)} / ${goldReq} GOLD`;
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
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-50 flex justify-around items-center px-4 py-3 pb-safe rounded-t-[2rem]">
            {[
              { id: 'companion', label: 'PET', icon: FaPaw },
              { id: 'tasks', label: 'QUESTS', icon: FaBullseye },
              { id: 'rewards', label: 'PRIZES', icon: FaGift },
              { id: 'pots', label: 'POTS', icon: FaJar }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeChildTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { playSound.click(); setActiveChildTab(tab.id as any); }}
                  className={`relative p-3 rounded-2xl transition-all flex flex-col items-center justify-center duration-300 w-full max-w-[80px] ${
                    isSelected
                      ? 'text-white bg-cyan-400 shadow-md shadow-cyan-400/40 scale-110'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6" />}
                  {/* Optional label for mobile? The screenshot had labels removed. We'll keep them but hidden if not active or just smaller */}
                  <span className={`text-[8px] font-bold font-mono tracking-widest uppercase mt-1 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
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
