import { 
  FaStar, FaHeart, FaEgg, FaBurst, FaWandMagicSparkles, FaHeartCrack,
  FaFaceSadTear, FaBone, FaCartShopping, FaGamepad, FaFaceFrown, FaCircleCheck, FaTriangleExclamation,
  FaBullseye, FaGift, FaJar, FaCoins, FaPiggyBank, FaBowlFood, FaGlobe, FaCat, FaWater, FaBook,
  FaWrench,
  FaChildDress, FaChild, FaCrown, FaFire, FaShield, FaBullhorn, FaBroom, FaPen, FaBaby, FaBolt,
  FaPizzaSlice, FaPalette, FaBookOpen, FaInfinity, FaCalendar, FaHandPeace, FaScroll, FaRocket, FaPaw
} from 'react-icons/fa6';
import React, { useState, useEffect, useRef } from 'react';
import { Typography } from './ui/Typography';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Flame, Play, ChevronRight, Lock, Star,
  ArrowLeft, CheckCircle, Gift, Sparkles, Smile, Target, Zap, RotateCcw, AlertTriangle, HelpCircle, TrendingUp,
  PiggyBank, X, Plus, Minus, Utensils, ShieldAlert, BookOpen, Dumbbell, Palette, Heart, Home, ChevronDown, Bell, Coins, Plane
} from 'lucide-react';
import { ChildHomeTab } from './ChildHomeTab';
import { CATEGORY_ICON_MAP } from '../utils/categories';
import { Child, Task, TaskCompletion, Reward, RewardRedemption, ParentProfile } from '../types';
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { CHARACTER_PACKS, getCharacterStage } from '../data/characters';
import { playSound } from '../utils/sound';
import WellDoneOverlay from './WellDoneOverlay';
import { getLogicalDateString, getCurrentWeekKey, getStartOfDailyReset } from '../utils/date';
import { CoinBadge } from './CoinBadge';
import { ChildAvatar } from './ChildAvatar';
import { LinearProgressBar } from './ProgressBar';
import { Button } from './ui/Button';
import { BadgesModal } from './BadgesModal';
import { getSupabaseClient } from '../utils/supabase';
import { checkAndUnlockBadges } from '../utils/badgeService';

const RECURRENCE_LABEL: Record<string, string> = {
  daily:      'Daily',
  weekly:     'Weekly',
  one_time:   'One-off',
  repeatable: 'Repeatable',
};

interface ChildDashboardProps {
  parentProfile?: ParentProfile | null;
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  onCompleteTask: (taskId: string, childId: string) => void;
  onClaimReward: (rewardId: string, childId: string, paymentSource?: 'main' | 'savings' | 'badge_freebie') => void;
  onEnterParentMode: () => void;
  onFeedPet: (childId: string) => void;
  onSavingsDeposit: (childId: string, amount: number) => void;
  onSavingsWithdraw: (childId: string) => void;
  onSavingsGoal: (childId: string, rewardId: string) => void;
  onClearSavingsGoal: (childId: string) => void;
  onSavingsUnlockSeen: (childId: string) => void;
  onAppIntroSeen: (childId: string) => void;
  onBuyPetFood: (childId: string) => void;
  onSellPetFood: (childId: string) => void;
  onFoodPotUnlockSeen: (childId: string) => void;
  onGiftingRequestCharity: (childId: string, amount: number, charityId: string) => void;
  onGiftingRequestSibling: (childId: string, amount: number, siblingId: string) => void;
  onGiftingUnlockSeen: (childId: string) => void;
  onGoldPotMaintenanceUnlockSeen: (childId: string) => void;
  onUpdateChildStats: (childId: string, updates: Partial<Child>) => void;
  onEditChild: (childId: string, updates: Partial<Child>) => void;
  lockedChildId?: string | null;
  onLockChild?: (childId: string | null) => void;
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
  onAppIntroSeen,
  onBuyPetFood,
  onSellPetFood,
  onFoodPotUnlockSeen,
  onGiftingRequestCharity,
  onGiftingRequestSibling,
  onGiftingUnlockSeen,
  onGoldPotMaintenanceUnlockSeen,
  onUpdateChildStats,
  onEditChild,
  lockedChildId,
  onLockChild,
  theme
}: ChildDashboardProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(lockedChildId || null);
  const isPlayfulPop = parentProfile?.dashboard_style === 'playful_pop';

  // Helper to offset dates by 4 hours for a "4 AM daily reset"
  // This ensures tasks completed at 1 AM count towards the previous day


  useEffect(() => {
    if (lockedChildId) {
      setSelectedChildId(lockedChildId);
    } else {
      setSelectedChildId(null);
    }
  }, [lockedChildId]);

  const [activeChildTab, setActiveChildTab] = useState<'home' | 'companion' | 'tasks' | 'rewards' | 'pots'>('home');
  const [expandedPot, setExpandedPot] = useState<'savings' | 'food' | 'gifting' | 'maintenance' | null>(null);

  // Scroll to top when switching tabs
  useEffect(() => {
    const viewport = document.getElementById('child-viewport');
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeChildTab]);

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
  const [showAppIntroVideo, setShowAppIntroVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Food Pot UI State
  const [showFoodReplayVideo, setShowFoodReplayVideo] = useState(false);
  const [showGoldPotMaintenanceVideo, setShowGoldPotMaintenanceVideo] = useState(false);
  const [penaltyMessage, setPenaltyMessage] = useState<string | null>(null);
  const [goldPotPenaltyMessage, setGoldPotPenaltyMessage] = useState<string | null>(null);
  const [showFeedReminder, setShowFeedReminder] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMessage, setConfettiMessage] = useState('');

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

  // Badge Evaluation Effect
  useEffect(() => {
    if (activeChild) {
      checkAndUnlockBadges(activeChild).then(newUnlocks => {
        if (newUnlocks && newUnlocks.length > 0) {
          setShowConfetti(true);
          setConfettiMessage(`You earned ${newUnlocks.length} new badge${newUnlocks.length > 1 ? 's' : ''}! Check your badges.`);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }).catch(err => console.error("Error evaluating badges", err));
    }
  }, [
    activeChild?.id, 
    activeChild?.points, 
    activeChild?.level, 
    activeChild?.streak_days, 
    activeChild?.pet_fed_total, 
    activeChild?.savings_deposits, 
    activeChild?.gifts_made, 
    activeChild?.gold_pot_fixes, 
    activeChild?.gold_pot_unbroken_days,
    completions.length
  ]);

  // Reset video play state when popup is closed
  useEffect(() => {
    const showAppIntro = activeChild && (!activeChild.gold_pot_intro_seen || showAppIntroVideo);
    const showUnlock = activeChild && isSavingsUnlocked && (!activeChild.savings_unlock_seen || showReplayVideo);
    const showFoodUnlock = activeChild && isFoodPotUnlocked && (!activeChild.food_pot_unlock_seen || showFoodReplayVideo);
    const showGiftingUnlock = activeChild && isGiftingUnlocked && (!activeChild.gifting_unlock_seen || showGiftingReplayVideo);
    const showGoldUnlock = activeChild && isGoldPotMaintenanceUnlocked && (!activeChild.gold_pot_maintenance_unlock_seen || showGoldPotMaintenanceVideo);
    if (!showAppIntro && !showUnlock && !showFoodUnlock && !showGiftingUnlock && !showGoldUnlock) {
      setIsVideoPlaying(false);
    }
  }, [activeChild, showAppIntroVideo, showReplayVideo, showFoodReplayVideo, showGiftingReplayVideo, showGoldPotMaintenanceVideo]);

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
  const isGoldPotMaintenanceUnlocked = activeChild ? (activeChild.level >= (parentProfile?.gold_pot_maintenance_unlock_level ?? 8)) : false;

  // Gold Pot Maintenance daily check
  useEffect(() => {
    if (!selectedChildId || !activeChild) return;
    if (!isGoldPotMaintenanceUnlocked) return;
    if (!activeChild.gold_pot_maintenance_unlock_seen) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentWeekKey = getCurrentWeekKey();
    
    if (activeChild.gold_pot_last_check_date !== todayStr) {
      let updates: Partial<Child> = {
        gold_pot_last_check_date: todayStr
      };
      
      let broken = activeChild.gold_pot_broken || false;
      let breakCount = activeChild.gold_pot_break_count_this_week || 0;
      let breakWeek = activeChild.gold_pot_break_week;
      let points = activeChild.points || 0;
      
      if (breakWeek !== currentWeekKey) {
        breakCount = 0;
        breakWeek = currentWeekKey;
        updates.gold_pot_break_week = breakWeek;
        updates.gold_pot_break_count_this_week = 0;
      }
      
      if (broken) {
        if (points > 0) {
          points = Math.max(0, points - 1);
          updates.points = points;
          updates.gold_pot_last_leak_date = todayStr;
          updates.gold_pot_total_leaked = (activeChild.gold_pot_total_leaked || 0) + 1;
          setGoldPotPenaltyMessage(`Oh no! Your broken Gold Pot just leaked a coin! You need to go to the POTS tab and fix it before it leaks all your gold.`);
          setTimeout(() => playSound.pinError(), 800);
        }
      } else {
        if (breakCount < 2) {
          if (Math.random() < 0.28) {
            broken = true;
            breakCount += 1;
            updates.gold_pot_broken = true;
            updates.gold_pot_break_count_this_week = breakCount;
            setGoldPotPenaltyMessage(`Oh no! Your Gold Pot is broken and leaking coins! You need to go to the POTS tab and fix it before it leaks all your gold.`);
            setTimeout(() => playSound.pinError(), 800);
          }
        }
      }
      
      onUpdateChildStats(activeChild.id, updates);
    }
  }, [selectedChildId, activeChild?.id, activeChild?.gold_pot_last_check_date, isGoldPotMaintenanceUnlocked, onUpdateChildStats]);

  const isSavingsUnlocked = activeChild ? (activeChild.savings_unlocked || activeChild.level >= (parentProfile?.savings_pot_unlock_level ?? 2)) : false;
  const isFoodPotUnlocked = activeChild ? (activeChild.food_pot_unlocked || activeChild.level >= (parentProfile?.food_pot_unlock_level ?? 4)) : false;
  const isGiftingUnlocked = activeChild ? (activeChild.gifting_unlocked || activeChild.level >= (parentProfile?.gifting_pot_unlock_level ?? 6)) : false;

  const potReminders: string[] = [];
  const now = new Date();
  if (activeChild) {
    if (isSavingsUnlocked) {
      const lastSaved = activeChild.last_saved_date ? new Date(activeChild.last_saved_date) : null;
      const daysSinceSaved = lastSaved ? Math.floor((now.getTime() - lastSaved.getTime()) / (1000 * 3600 * 24)) : Infinity;
      const savedToday = activeChild.last_saved_date?.startsWith(now.toISOString().split('T')[0]);
      if (daysSinceSaved >= 7 && !savedToday) {
        potReminders.push("Savings Pot: Time to deposit some coins!");
      }
    }
    if (isFoodPotUnlocked) {
      const lastFed = activeChild.last_fed_date ? new Date(activeChild.last_fed_date) : null;
      const daysSinceFed = lastFed ? Math.floor((now.getTime() - lastFed.getTime()) / (1000 * 3600 * 24)) : Infinity;
      if (daysSinceFed >= 3 && !activeChild.pet_fed_today) {
        potReminders.push("Food Pot: Your pet might be hungry!");
      }
    }
    if (isGiftingUnlocked) {
      const lastGifted = activeChild.last_gifting_date ? new Date(activeChild.last_gifting_date) : null;
      const daysSinceGifted = lastGifted ? Math.floor((now.getTime() - lastGifted.getTime()) / (1000 * 3600 * 24)) : Infinity;
      const giftedToday = activeChild.last_gifting_date?.startsWith(now.toISOString().split('T')[0]);
      if (daysSinceGifted >= 14 && !giftedToday) {
        potReminders.push("Gifting Pot: Consider gifting some coins!");
      }
    }
  }

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
    setActiveChildTab('home');
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

  // Claim Free Reward from Badge
  const handleClaimFreeReward = async (badgeId: string, rewardId: string) => {
    if (!activeChild) return;
    
    // 1. Trigger the reward claim (freebie)
    onClaimReward(rewardId, activeChild.id, 'badge_freebie');
    
    // 2. Update the child_badges table to mark as claimed
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase
        .from('child_badges')
        .update({ reward_claimed: true })
        .eq('child_id', activeChild.id)
        .eq('badge_id', badgeId);
      if (error) {
        console.error('Error updating badge claimed state:', error);
      }
    }
    
    setShowConfetti(true);
    setConfettiMessage('Free Prize Claimed! Enjoy!');
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <div className={`min-h-screen bg-white flex flex-col font-sans relative overflow-x-hidden ${selectedChildId ? 'pt-[calc(max(env(safe-area-inset-top),0.5rem)+64px)] sm:pt-[calc(max(env(safe-area-inset-top),0.5rem)+72px)]' : ''}`} id="child-root" data-theme={parentProfile?.dashboard_style || 'modern'}>
      
      {/* Fixed Top Bar (Dashboard Only) */}
      {selectedChildId && (
        <header 
          className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-4 sm:px-8 pb-3 sm:pb-4"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
        >
          <div className="flex items-center flex-1 gap-3 sm:gap-4">
            {!lockedChildId && (
              <button
                onClick={() => setSelectedChildId(null)}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-row items-center justify-between flex-1 pr-2 sm:pr-4 gap-2 sm:gap-0">
              <h1 className="text-lg sm:text-3xl font-black tracking-tight truncate font-display text-slate-800 flex items-center gap-2">
                {activeChild?.name ? `${activeChild.name}'s Dashboard` : 'Dashboard'}
                {activeChild?.age && <span className="text-sm sm:text-xl text-slate-500 font-normal">({activeChild.age})</span>}
              </h1>
              <div className="flex items-center bg-slate-50/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm p-1 sm:p-1.5 gap-1 shrink-0">
                <CoinBadge points={activeChild?.points || 0} />
                <button 
                  onClick={() => { playSound.click(); onEnterParentMode(); }}
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
                  title="Parent Dashboard"
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Nudge Banner */}
      <AnimatePresence>
        {activeChild?.has_pending_nudge && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="mx-2 sm:mx-8 mt-2 sm:mt-4 p-4 rounded-3xl bg-indigo-50 border-[3px] border-indigo-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 z-30 relative"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-indigo-500 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">You have a message!</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Your parent sent you a friendly reminder to complete your tasks today!</p>
              </div>
            </div>
            <button
              onClick={() => {
                playSound.click();
                onEditChild(activeChild.id, { has_pending_nudge: false });
              }}
              className="px-6 py-3 rounded-full bg-indigo-500 text-white font-bold text-xs sm:text-sm tracking-widest uppercase hover:bg-indigo-600 hover:-translate-y-0.5 transition-all active:scale-95 shadow-md shadow-indigo-500/20 whitespace-nowrap w-full sm:w-auto"
            >
              I'm on it!
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Well Done celebration overlay (anime.js powered) */}
      <WellDoneOverlay show={showWellDone} taskName={wellDoneTaskName} companionId={activeChild?.character_id} />

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

              <Button
                variant="primary"
                fullWidth
                onClick={() => { playSound.success(); setEvolvingStage(null); setHatchPhase('idle'); }}
                id="evolution-dismiss-btn"
                disabled={isHatching && hatchPhase !== 'reveal'}
              >
                {isHatching && hatchPhase !== 'reveal' ? 'HATCHING...' : 'HELL YEAH!'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Intro Video Overlay */}
      <AnimatePresence>
        {activeChild && (!activeChild.gold_pot_intro_seen || showAppIntroVideo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            id="app-intro-cinematic"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden"
            >
              {/* Confetti Background */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

              <div className="relative z-10 space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-200 to-yellow-400 border-4 border-yellow-200 flex items-center justify-center shadow-lg transform rotate-12">
                    <FaCoins className="w-10 h-10 text-amber-700" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-amber-500 font-extrabold">Welcome!</span>
                  <h3 className="font-black font-display text-2xl text-slate-800 uppercase tracking-wide leading-none">
                    How it Works
                  </h3>
                </div>

                <p className="text-sm font-bold text-slate-600 leading-relaxed px-4">
                  Watch this quick video to learn how to earn gold coins and unlock awesome prizes!
                </p>

                {/* Video Player */}
                <div className="relative w-full aspect-video rounded-2xl bg-stone-100 border-2 border-stone-200 overflow-hidden shadow-inner group">
                  <video 
                    ref={videoRef}
                    src="/app-intro-video.mp4" 
                    className="w-full h-full object-cover"
                    controls={isVideoPlaying}
                    playsInline
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onEnded={() => setIsVideoPlaying(false)}
                  >
                    <source src="/app-intro-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {!isVideoPlaying && (
                    <button
                      onClick={() => {
                        videoRef.current?.play();
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-amber-600 ml-1" />
                      </div>
                    </button>
                  )}
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  className="mt-4 shadow-md bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950"
                  onClick={() => { playSound.success(); onAppIntroSeen(activeChild.id); setShowAppIntroVideo(false); }}
                  id="app-intro-dismiss-btn"
                >
                  GOT IT!
                </Button>
              </div>
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

              <Typography variant="h1" as="h2">
                <FaWandMagicSparkles className="inline-block mr-2 text-pink-500" /> SAVINGS POT UNLOCKED!
              </Typography>

              <Typography variant="body">
                Well done, <strong className="text-stone-900">{activeChild.name}</strong>! You've earned a brand new feature — the <strong className="text-amber-600">Savings Pot</strong>!
              </Typography>

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

              <Button
                variant="primary"
                fullWidth
                onClick={() => { playSound.success(); onSavingsUnlockSeen(activeChild.id); setShowReplayVideo(false); }}
                id="savings-unlock-dismiss-btn"
              >
                GOT IT! <FaWandMagicSparkles className="inline-block ml-2 text-pink-500" />
              </Button>
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

              <Typography variant="h1" as="h2">
                <FaWandMagicSparkles className="inline-block mr-2 text-orange-500" /> FOOD POT UNLOCKED!
              </Typography>

              <Typography variant="body">
                Awesome job, <strong className="text-stone-900">{activeChild.name}</strong>! You've unlocked the <strong className="text-orange-600">Food Pot</strong>! Remember to deposit 7 gold coins per week and feed your pet every day.
              </Typography>

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

              <Button
                variant="primary"
                fullWidth
                onClick={() => { playSound.success(); onFoodPotUnlockSeen(activeChild.id); setShowFoodReplayVideo(false); }}
                id="food-pot-unlock-dismiss-btn"
              >
                GOT IT! <FaWandMagicSparkles className="inline-block ml-2 text-pink-500" />
              </Button>
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

              <Typography variant="h1" as="h2">
                <FaWandMagicSparkles className="inline-block mr-2 text-purple-500" /> GIFTING POT UNLOCKED!
              </Typography>

              <Typography variant="body">
                You're so generous, <strong className="text-stone-900">{activeChild.name}</strong>! You've unlocked the <strong className="text-rose-600">Gifting Pot</strong>! You can now use your gold coins to help others by donating to charity or gifting to a sibling.
              </Typography>

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

              <Button
                variant="danger"
                fullWidth
                onClick={() => { playSound.success(); onGiftingUnlockSeen(activeChild.id); setShowGiftingReplayVideo(false); }}
                id="gifting-pot-unlock-dismiss-btn"
              >
                GOT IT! <FaWandMagicSparkles className="inline-block ml-2 text-pink-500" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gold Pot Maintenance Unlock Celebration Overlay */}
      <AnimatePresence>
        {activeChild && isGoldPotMaintenanceUnlocked && (!activeChild.gold_pot_maintenance_unlock_seen || showGoldPotMaintenanceVideo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            id="gold-pot-maintenance-unlock-cinematic"
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
                NEW RESPONSIBILITY
              </div>

              <Typography variant="h1" as="h2">
                <FaTriangleExclamation className="inline-block mr-2 text-amber-500" /> POT MAINTENANCE!
              </Typography>

              <Typography variant="body">
                Great progress, <strong className="text-stone-900">{activeChild.name}</strong>! You've reached a level where your <strong className="text-amber-600">Gold Pot</strong> needs maintenance! Sometimes it might crack, and you'll need to spend gold coins to fix it so it doesn't leak. Keep an eye on it!
              </Typography>

              {/* Video Player */}
              <div className="relative w-full aspect-video rounded-2xl bg-stone-100 border-2 border-stone-200 overflow-hidden shadow-inner group">
                <video 
                  ref={videoRef}
                  src="/gold-pot-video.mp4" 
                  controls 
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/gold-pot-poster.jpg"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  <source src="/gold-pot-video.mp4" type="video/mp4" />
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

              <Button
                variant="primary"
                fullWidth
                onClick={() => { playSound.success(); onGoldPotMaintenanceUnlockSeen(activeChild.id); setShowGoldPotMaintenanceVideo(false); }}
                id="gold-pot-maintenance-unlock-dismiss-btn"
              >
                GOT IT! <FaWandMagicSparkles className="inline-block ml-2 text-pink-500" />
              </Button>
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

              <Typography variant="body">
                {penaltyMessage}
              </Typography>

              <Button
                variant="danger"
                fullWidth
                onClick={() => { playSound.success(); setPenaltyMessage(null); }}
                id="pet-penalty-dismiss-btn"
              >
                I Promise to Feed Them! <FaFaceSadTear className="inline-block ml-2 text-yellow-500" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broken Gold Pot Warning Modal */}
      <AnimatePresence>
        {goldPotPenaltyMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            id="gold-pot-penalty-modal"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="relative w-full max-w-md bg-white border-4 border-gray-200 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center">
                <FaTriangleExclamation className="w-10 h-10 text-amber-600 animate-pulse" />
              </div>

              <h2 className="text-2.5xl font-black font-display text-amber-600">
                GOLD POT BROKEN!
              </h2>

              <Typography variant="body">
                {goldPotPenaltyMessage}
              </Typography>

              <Button
                variant="warning"
                fullWidth
                onClick={() => { 
                  playSound.click(); 
                  setGoldPotPenaltyMessage(null); 
                  setActiveChildTab('pots');
                }}
                id="gold-pot-penalty-dismiss-btn"
              >
                GO TO POTS <FaCoins className="inline-block ml-2 text-yellow-100" />
              </Button>
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

              <Typography variant="body">
                Don't forget to feed <strong className="text-stone-900">{activeChildPack?.name.split(' the ')[0] || 'your pet'}</strong> today! A happy pet is a good companion.
              </Typography>

              <div className="flex flex-col gap-3">
                <Button
                  variant="warning"
                  fullWidth
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
                >
                  {(activeChild?.pet_food || 0) > 0 ? <span>Feed Now! <FaBone className="inline-block ml-2" /></span> : <span>Get Food! <FaCartShopping className="inline-block ml-2" /></span>}
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => { 
                    playSound.click(); 
                    setShowFeedReminder(false); 
                    if (activeChild) {
                      localStorage.setItem(`feed_reminder_${activeChild.id}`, new Date().toISOString().split('T')[0]);
                    }
                  }}
                >
                  Maybe Later
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simple Navigation for Profile Selection */}
      {!selectedChildId && (
        <header 
          className="px-4 sm:px-6 pb-2 flex justify-end items-center relative z-40 bg-transparent"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => { playSound.click(); onEnterParentMode(); }}
            leftIcon={<Lock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400`} />}
          >
            PARENT MODE
          </Button>
        </header>
      )}

      {/* Central HUD Viewport */}
      <div className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 flex flex-col relative z-20 overflow-y-auto mb-24 lg:mb-8 ${!selectedChildId ? 'bg-transparent mt-0 pt-0 pb-0' : 'bg-white mt-2 sm:mt-4 py-4 sm:py-6'}`} id="child-viewport">
        <AnimatePresence mode="wait">
          
          {/* PROFILE SELECTION GRID - Looks like an arcade game select screen */}
          {!selectedChildId ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              key="profile-selector"
              className="space-y-6 sm:space-y-8 text-center mt-6 sm:mt-8"
              id="profile-picker"
            >
              <div className="space-y-1 sm:space-y-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono uppercase tracking-widest`}>
                  <Plane className="w-3.5 h-3.5" /> BOARDING NOW
                </div>
                <h1 className={`text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-slate-800`}>
                  Grab your ticket!
                </h1>
                <p className={`text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed`}>
                  Select your boarding pass to start your adventure and claim your rewards!
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl mx-auto pt-4 w-full text-left" id="kids-deck">
                {children.map((child) => {
                  const stage = getCharacterStage(child.character_id, child.level);
                  return (
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      key={child.id}
                      onClick={() => {
                        handleSelectChild(child.id);
                      }}
                      className="w-full cursor-pointer group flex shadow-lg hover:shadow-xl transition-shadow rounded-2xl overflow-hidden relative"
                    >
                      {/* Main Pass Body */}
                      <div className="flex-[3] bg-white border border-slate-200 border-r-0 flex flex-col relative z-10">
                        {/* Header */}
                        <div className="h-8 sm:h-10 bg-[#0033A0] flex items-center justify-between px-3 sm:px-6 border-b border-[#002277]">
                          <div className="flex items-center gap-2 text-white font-bold tracking-widest text-xs uppercase">
                            <Plane className="w-4 h-4" /> <span>Reward Airways</span>
                          </div>
                          <div className="text-blue-200 font-mono text-[10px] tracking-widest uppercase">
                            First Class
                          </div>
                        </div>
                        
                        <div className="p-2 sm:p-6 flex justify-between items-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
                          
                          <div className="flex items-center gap-2 sm:gap-6">
                            <div className="w-12 h-12 sm:w-24 sm:h-24 shrink-0 rounded-lg bg-slate-100 border-2 border-white shadow-md overflow-hidden bg-white">
                              <ChildAvatar iconName={child.avatar_url} className="w-full h-full !rounded-none border-none" />
                            </div>
                            
                            <div className="flex flex-col justify-center py-1 sm:py-2">
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5 sm:mb-1 block">Name of Passenger</span>
                                <h3 className="text-xl sm:text-3xl font-black font-display text-slate-900 uppercase tracking-tight leading-none">
                                  {child.name}
                                  {child.age && <span className="text-sm sm:text-xl text-slate-500 font-normal ml-2">({child.age})</span>}
                                </h3>
                              </div>
                              
                              <div className="flex gap-2 sm:gap-10 mt-2 sm:mt-4">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Flight</span>
                                <span className="font-mono font-bold text-slate-800 text-sm sm:text-lg">RW-{child.level.toString().padStart(3, '0')}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Gate</span>
                                <span className="font-mono font-bold text-slate-800 text-sm sm:text-lg">{child.streak_days > 0 ? child.streak_days : 'TBD'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Seat</span>
                                <span className="font-mono font-bold text-[#0033A0] text-sm sm:text-lg">{child.points || '00'}A</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 ml-2 sm:ml-4">
                          <div className="w-16 sm:w-32 h-8 sm:h-16 flex justify-between items-end opacity-60">
                            <div className="w-0.5 sm:w-1 h-full bg-slate-800" />
                            <div className="w-1 sm:w-2 h-full bg-slate-800" />
                            <div className="w-0.5 sm:w-1 h-full bg-slate-800" />
                            <div className="w-1.5 sm:w-3 h-full bg-slate-800" />
                            <div className="w-px sm:w-0.5 h-full bg-slate-800" />
                            <div className="w-0.5 sm:w-1 h-full bg-slate-800" />
                            <div className="w-1 sm:w-2 h-full bg-slate-800" />
                            <div className="w-1 sm:w-1.5 h-full bg-slate-800" />
                            <div className="w-0.5 sm:w-1 h-full bg-slate-800" />
                            <div className="w-px sm:w-0.5 h-full bg-slate-800" />
                            <div className="w-1 sm:w-2 h-full bg-slate-800" />
                            <div className="w-0.5 sm:w-1 h-full bg-slate-800" />
                            <div className="w-px sm:w-0.5 h-full bg-slate-800" />
                          </div>
                          <span className="font-mono text-[7px] sm:text-[9px] mt-1 text-slate-500 tracking-widest uppercase">TKT-{child.id.substring(0,8)}</span>
                        </div>
                        
                      </div>
                    </div>
                    
                    {/* Divider with Notches */}
                    <div className="w-4 sm:w-6 shrink-0 bg-white relative flex flex-col justify-between border-y border-slate-200 z-0">
                      {/* Top Notch */}
                      <div className="w-4 h-4 sm:w-6 sm:h-6 bg-slate-100 rounded-b-full absolute top-0 left-0 border-b border-slate-200 shadow-inner" />
                      
                      {/* Perforation Line */}
                      <div className="absolute top-6 bottom-6 sm:top-8 sm:bottom-8 left-1/2 -translate-x-1/2 w-px border-l-2 sm:border-l-[3px] border-dotted border-slate-300" />
                      
                      {/* Bottom Notch */}
                      <div className="w-4 h-4 sm:w-6 sm:h-6 bg-slate-100 rounded-t-full absolute bottom-0 left-0 border-t border-slate-200 shadow-inner" />
                    </div>
                    
                    {/* Tear-off Stub */}
                    <div className="flex-1 shrink-0 bg-slate-50 border border-slate-200 border-l-0 flex flex-col relative overflow-hidden z-10">
                        <div className="h-10 bg-[#0033A0] w-full border-b border-[#002277]" />
                        <div className="p-4 sm:p-6 flex flex-col h-full justify-between items-center relative overflow-hidden">
                          
                          <Plane className="absolute -right-8 -bottom-8 w-24 h-24 sm:w-32 sm:h-32 text-slate-200 opacity-40 -rotate-45 pointer-events-none z-0" />

                          <div className="w-full text-center mb-2 sm:mb-4 relative z-10">
                            <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5 sm:mb-1">Boarding Time</span>
                            <span className="font-mono font-black text-[#0033A0] text-lg sm:text-xl">NOW</span>
                          </div>

                          <div className="w-full flex justify-between relative z-10">
                            <div className="flex flex-col text-center w-1/2">
                              <span className="text-[9px] text-slate-500 font-bold uppercase">Zone</span>
                              <span className="font-black text-3xl text-slate-800 leading-none mt-1">1</span>
                            </div>
                            <div className="flex flex-col text-center w-1/2">
                              <span className="text-[9px] text-slate-500 font-bold uppercase">Class</span>
                              <span className="font-black text-3xl text-slate-800 leading-none mt-1">F</span>
                            </div>
                          </div>
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

                      <div className="flex justify-between w-full items-start mt-1">
                        <div className="text-left">
                          <span className={`text-[8px] font-mono tracking-widest uppercase ${styles.textMuted} font-extrabold`}>PET SPECIES</span>
                          <h3 className={`font-black ${styles.textColor} text-xs mt-0.5 uppercase tracking-wider`}>{activeChildStage.name}</h3>
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
                        <LinearProgressBar 
                          progress={(((activeChild.lifetime_points || 0) % (parentProfile?.points_to_level_up ?? 500)) / (parentProfile?.points_to_level_up ?? 500)) * 100}
                          heightClass="h-3"
                          className={`${styles.cardBg} ${styles.borderStyle} mb-1 relative`}
                        />
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
                                    <LinearProgressBar 
                                      progress={weeklyPct}
                                      heightClass="h-3"
                                      className="mt-2"
                                    />
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
                                    <LinearProgressBar 
                                      progress={monthlyPct}
                                      heightClass="h-3"
                                      className="mt-2"
                                    />
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
                  <div className={`lg:col-span-8 space-y-2 sm:space-y-3 ${activeChildTab === 'companion' ? 'hidden lg:block' : ''}`}>
                    
                    {/* Desktop style switcher tabs (Hidden on mobile) */}
                    <div className={`hidden lg:flex gap-2 p-1 bg-gray-50 border border-gray-100 rounded-2xl`} id="kid-dashboard-tabs">
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('home'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'home' || activeChildTab === 'companion'
                            ? 'bg-white shadow-sm text-slate-900 border border-gray-200'
                            : 'text-gray-400 hover:text-slate-600'
                        }`}
                      >
                        <Home className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" /> <span className="hidden sm:inline">HOME</span>
                      </button>
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('tasks'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'tasks'
                            ? 'bg-white shadow-sm text-slate-900 border border-gray-200'
                            : 'text-gray-400 hover:text-slate-600'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> <span className="hidden sm:inline">TASKS</span>
                      </button>
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('rewards'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'rewards'
                            ? 'bg-white shadow-sm text-slate-900 border border-gray-200'
                            : 'text-gray-400 hover:text-slate-600'
                        }`}
                      >
                        <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" /> <span className="hidden sm:inline">PRIZES</span>
                      </button>
                      <button
                        onClick={() => { playSound.click(); setActiveChildTab('pots'); }}
                        className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeChildTab === 'pots'
                            ? 'bg-white shadow-sm text-slate-900 border border-gray-200'
                            : 'text-gray-400 hover:text-slate-600'
                        }`}
                      >
                        <FaJar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> <span className="hidden sm:inline">POTS</span>
                      </button>
                    </div>

                    {/* Active Screen Frame */}
                    <AnimatePresence mode="wait">
                      {activeChildTab === 'home' || activeChildTab === 'companion' ? (
                        <ChildHomeTab
                          activeChild={activeChild}
                          tasks={tasks}
                          completions={completions}
                          redemptions={redemptions}
                          rewards={rewards}
                          handleTaskCheck={handleTaskCheck}
                          potReminders={potReminders}
                          onOpenBadges={() => setShowBadgesModal(true)}
                          parentProfile={parentProfile}
                        />
                      ) : activeChildTab === 'tasks' ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          key="child-tasks-tab"
                          className="flex flex-col"
                        >
                          <div className={`p-4 rounded-xl sm:rounded-2xl bg-white border-gray-200 border flex items-center justify-between mb-3 sm:mb-4`}>
                            <div>
                              <h3 className={`font-black font-display text-base sm:text-lg uppercase tracking-wider text-slate-900`}>Daily Quests</h3>
                              <p className={`text-[10px] sm:text-xs font-mono text-gray-400`}>Complete tasks to earn more gold coins!</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4" id="child-tasks-deck">
                          {tasks.filter(t => {
                            if (t.child_id !== activeChild.id) return false;
                            if (t.recurrence === 'one_time') {
                              return !completions.some(c => c.task_id === t.id && c.child_id === activeChild.id && c.status === 'approved');
                            }
                            return true;
                          }).length === 0 ? (
                            <div className={`col-span-2 sm:col-span-3 md:col-span-4 p-10 text-center ${styles.cardBg} border-2 border-dashed border-slate-300 rounded-3xl space-y-3`}>
                              <span className="text-5xl block animate-bounce-slow"><FaWandMagicSparkles className="text-pink-500 mx-auto" /></span>
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

                              const catMeta = CATEGORY_ICON_MAP[task.category] ?? CATEGORY_ICON_MAP.other;
                              const recLabel = RECURRENCE_LABEL[task.recurrence] ?? task.recurrence;
                              const subtitleParts = [catMeta.label, recLabel, ...(completedTodayCount > 0 ? [`Done ${completedTodayCount}×`] : [])];

                              const cardContent = (
                                <>
                                  <div className="absolute top-3 right-3">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm ${isApproved ? 'bg-gray-200 text-gray-500' : 'bg-sky-100 text-sky-600 font-black text-xs'}`}>
                                      <catMeta.Icon className="w-4 h-4" />
                                    </div>
                                  </div>
                                  <div className={`mt-2 ${isCompletable ? 'group-hover:scale-110 transition-transform' : 'opacity-50'}`}>
                                    <CoinBadge points={task.points} disabled={isApproved} />
                                  </div>
                                  <div className="w-full">
                                    <h4 className={`font-extrabold text-xs sm:text-sm text-slate-800 font-display leading-tight ${isApproved ? 'line-through opacity-50' : ''}`}>
                                      {task.title}
                                    </h4>
                                    <div className="mt-2 min-h-[24px] flex items-center justify-center">
                                      {isApproved ? (
                                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-full">
                                          <FaCircleCheck className="w-3 h-3" /> DONE
                                        </div>
                                      ) : isPending ? (
                                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-500 text-[9px] font-black uppercase tracking-wider rounded-full">
                                          AWAITING
                                        </div>
                                      ) : isOnCooldown ? (
                                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-full border border-amber-200">
                                          {cooldownTimeLeftStr}
                                        </div>
                                      ) : (
                                        <div className="inline-block px-3 py-1 bg-stone-100 text-stone-500 text-[9px] font-black uppercase tracking-wider rounded-full group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                                          {recLabel}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </>
                              );

                              const baseCardClasses = "relative p-4 rounded-[1.5rem] border-2 shadow-sm transition-all flex flex-col items-center text-center gap-3";

                              return isCompletable ? (
                                <button
                                  key={task.id}
                                  onClick={() => handleTaskCheck(task.id, task.title)}
                                  id={`claim-task-${task.id}`}
                                  className={`${baseCardClasses} bg-white border-stone-100 hover:shadow-xl hover:border-amber-300 group cursor-pointer active:scale-[0.98] task-card`}
                                >
                                  {cardContent}
                                </button>
                              ) : (
                                <div
                                  key={task.id}
                                  className={`${baseCardClasses} ${
                                    isApproved
                                      ? `bg-gray-50 border-gray-100`
                                      : isPending
                                        ? 'bg-indigo-50 border-indigo-100'
                                        : 'bg-amber-50 border-amber-100 opacity-75'
                                  } task-card`}
                                >
                                  {cardContent}
                                </div>
                              );
                            })
                          )}
                          </div>
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
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4" id="child-rewards-deck">
                          {rewards.filter(r => r.child_id === activeChild.id).length === 0 ? (
                            <div className={`col-span-2 sm:col-span-3 md:col-span-4 p-10 text-center ${styles.cardBg} border-2 border-dashed border-slate-300 rounded-3xl space-y-2`}>
                              <span className="text-5xl block animate-bounce-slow"><FaGift className="text-purple-500 mx-auto" /></span>
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

                              let statusBadge = null;
                              if (hasPendingRequest) {
                                statusBadge = <span className="text-[9px] font-black uppercase tracking-wider text-stone-500">Pending</span>;
                              } else if (!availability.available && !isSavingFor) {
                                statusBadge = <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 truncate px-2">{availability.reason}</span>;
                              } else if (isSavingsUnlocked) {
                                if (isSavingFor) {
                                  statusBadge = (
                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-full border border-emerald-200">
                                      <CheckCircle className="w-3 h-3" /> Saving
                                    </div>
                                  );
                                } else {
                                  statusBadge = (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSavingsGoal(activeChild.id, rew.id);
                                        playSound.success();
                                      }}
                                      className="inline-block px-3 py-1 bg-stone-100 text-stone-500 text-[9px] font-black uppercase tracking-wider rounded-full hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                                    >
                                      Set Goal
                                    </button>
                                  );
                                }
                              }

                              const baseCardClasses = "relative p-4 rounded-[1.5rem] border-2 shadow-sm transition-all flex flex-col items-center text-center gap-3";
                              
                              let wrapperClasses = "";
                              let iconBg = "";
                              if (isSavingFor) {
                                wrapperClasses = `${baseCardClasses} bg-emerald-50 border-emerald-300 shadow-[0_4px_20px_rgba(52,211,153,0.2)] hover:shadow-[0_8px_25px_rgba(52,211,153,0.3)] group cursor-pointer reward-card-saving`;
                                iconBg = "bg-emerald-100 text-emerald-600";
                              } else if (canDispense) {
                                wrapperClasses = `${baseCardClasses} bg-white border-stone-100 hover:shadow-xl hover:border-amber-300 group cursor-pointer active:scale-[0.98] reward-card`;
                                iconBg = "bg-orange-100 text-orange-500";
                              } else {
                                wrapperClasses = `${baseCardClasses} bg-white border-stone-100 opacity-60 grayscale-[0.3] reward-card-disabled`;
                                iconBg = "bg-stone-100 text-stone-400";
                              }

                              const cardContent = (
                                <>
                                  <div className="absolute top-3 right-3">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm ${iconBg}`}>
                                      <Gift className="w-4 h-4" />
                                    </div>
                                  </div>
                                  <div className={`mt-2 ${canDispense ? 'group-hover:scale-110 transition-transform' : ''}`}>
                                    <CoinBadge points={rew.cost_points} />
                                  </div>
                                  <div className="w-full">
                                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 font-display leading-tight">{rew.title}</h4>
                                    <div className="mt-2 min-h-[24px] flex items-center justify-center">
                                      {statusBadge}
                                    </div>
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
                                  className={wrapperClasses}
                                >
                                  {cardContent}
                                </button>
                              ) : (
                                <div key={rew.id} className={wrapperClasses}>
                                  {cardContent}
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
                          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 shadow-sm text-left mb-4">
                            <h2 className="font-black font-display text-base sm:text-lg uppercase tracking-wider text-slate-900">POTS</h2>
                            <p className="text-[10px] sm:text-xs font-mono text-stone-500">Manage your savings, food and gifting pots!</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-start">
                          
                          {/* === MAIN GOLD POT SECTION === */}
                          <div 
                            onClick={() => setExpandedPot(expandedPot === 'gold' ? null : 'gold')}
                            className={`bg-white border-2 rounded-[2rem] p-4 sm:p-5 flex flex-col transition-all cursor-pointer group h-full pot-card pot-gold ${expandedPot === 'gold' ? 'border-amber-500 shadow-md' : 'border-slate-200 hover:border-amber-300 hover:shadow-lg'}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${activeChild.gold_pot_broken ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'}`}>
                                {activeChild.gold_pot_broken ? <FaTriangleExclamation className="w-6 h-6" /> : <Coins className="w-6 h-6" />}
                              </div>
                              <CoinBadge points={activeChild.points || 0} size="sm" />
                            </div>
                            <div>
                              <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${activeChild.gold_pot_broken ? 'text-red-500' : 'text-amber-500'}`}>Main Pocket</div>
                              <h3 className={`font-extrabold text-lg leading-tight ${activeChild.gold_pot_broken ? 'text-red-900' : 'text-slate-900'}`}>Gold Pot</h3>
                              <div className="flex gap-2 mt-3 flex-wrap">
                                <button className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${expandedPot === 'gold' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedPot === 'gold' ? 'rotate-180' : ''}`} /> Manage
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setShowAppIntroVideo(true); }}
                                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${activeChild.gold_pot_broken ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                                >
                                  <Play className="w-3 h-3" fill="currentColor" /> Video
                                </button>
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {expandedPot === 'gold' && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden mt-4 pt-4 border-t-2 border-slate-100 flex-1 flex flex-col"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <p className="text-[10px] text-slate-500 leading-relaxed">
                                    This is your main pocket where all the gold coins you earn are kept. You can use these coins to buy rewards, save them in your Savings Pot, or spend them on your pets!
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* === SAVINGS POT SECTION === */}

                          {/* Savings Pot Unlocked Card */}
                          {isSavingsUnlocked && activeChild.savings_unlock_seen && (
                            <div 
                              onClick={() => setExpandedPot(expandedPot === 'savings' ? null : 'savings')}
                              className={`bg-white border-2 rounded-[2rem] p-4 sm:p-5 flex flex-col transition-all cursor-pointer group h-full pot-card pot-savings ${expandedPot === 'savings' ? 'border-emerald-400 shadow-md' : 'border-slate-200 hover:border-emerald-300 hover:shadow-lg'}`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                  <PiggyBank className="w-6 h-6" />
                                </div>
                                <CoinBadge points={activeChild.savings_pot || 0} size="sm" />
                              </div>
                              <div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1">Savings Pot</div>
                                <h3 className="font-extrabold text-lg text-slate-900 leading-tight">Savings</h3>
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  <button className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${expandedPot === 'savings' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedPot === 'savings' ? 'rotate-180' : ''}`} /> Manage
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setShowReplayVideo(true); }}
                                    className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-200 transition-colors"
                                  >
                                    <Play className="w-3 h-3" fill="currentColor" /> Video
                                  </button>
                                </div>
                              </div>

                              <AnimatePresence>
                                {expandedPot === 'savings' && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-4 pt-4 border-t-2 border-slate-100 flex-1 flex flex-col"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
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
                                  <LinearProgressBar
                                    progress={Math.round(((activeChild.savings_pot || 0) / (activeChild.savings_goal_amount || 1)) * 100)}
                                    className="bg-white border-emerald-200"
                                  />
                                  {(activeChild.savings_pot || 0) >= (activeChild.savings_goal_amount || 0) && activeChild.savings_goal_reward_id && (
                                    <Button
                                      variant="primary"
                                      fullWidth
                                      className="mt-3"
                                      onClick={() => handleClaimReward(activeChild.savings_goal_reward_id!, activeChild.savings_goal_amount!, 'savings')}
                                      leftIcon={<FaWandMagicSparkles className="w-4 h-4" />}
                                    >
                                      CLAIM GOAL!
                                    </Button>
                                  )}
                                </div>
                              )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 relative mt-auto">
                                      <button
                                        onClick={() => { setShowDepositModal(true); setDepositAmount(Math.min(5, activeChild.points)); playSound.click(); }}
                                        disabled={activeChild.points <= 0}
                                        className="flex-1 flex items-center justify-center gap-1 bg-[#FDF6CD] text-amber-900 py-2.5 rounded-xl font-bold text-xs border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <FaCoins /> Deposit
                                      </button>
                                      <button
                                        onClick={() => { setShowWithdrawConfirm(true); playSound.click(); }}
                                        disabled={(activeChild.savings_pot || 0) <= 0}
                                        className="flex-1 bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        onClick={() => { setDepositAmount(Math.max(1, depositAmount - 5)); playSound.click(); }}
                                        disabled={depositAmount <= 1}
                                        className="w-8 h-8 rounded-full bg-emerald-205 text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                
                                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-yellow-200 shadow-[0_4px_10px_rgba(245,158,11,0.4)]">
                                        <Typography variant="number">{depositAmount}</Typography>
                                      </div>
                                
                                      <button
                                        onClick={() => { setDepositAmount(Math.min(activeChild.points, depositAmount + 5)); playSound.click(); }}
                                        disabled={depositAmount >= activeChild.points}
                                        className="w-8 h-8 rounded-full bg-emerald-205 text-emerald-755 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-2">
                                      <Button
                                        variant="primary"
                                        className="w-full"
                                        onClick={() => {
                                          if (depositAmount > 0 && depositAmount <= activeChild.points) {
                                            onSavingsDeposit(activeChild.id, depositAmount);
                                            setShowDepositModal(false);
                                            playSound.purchase();
                                          }
                                        }}
                                        disabled={depositAmount <= 0 || depositAmount > activeChild.points}
                                      >
                                        Confirm
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => { setShowDepositModal(false); playSound.click(); }}
                                      >
                                        Cancel
                                      </Button>
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
                                    <div className="flex flex-col gap-2 mt-2">
                                      <Button
                                        variant="danger"
                                        className="w-full"
                                        onClick={() => {
                                          onSavingsWithdraw(activeChild.id);
                                          setShowWithdrawConfirm(false);
                                          playSound.purchase();
                                        }}
                                      >
                                        Yes, Withdraw
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => { setShowWithdrawConfirm(false); playSound.click(); }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Savings Pot Locked Preview (Level 1 only, before unlock) */}
                          {!isSavingsUnlocked && activeChild.level < (parentProfile?.savings_pot_unlock_level ?? 2) && (
                            <div className="p-4 sm:p-5 rounded-[2rem] bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-center gap-2 opacity-70 h-full">
                              <div className="flex items-center gap-2 text-stone-500">
                                <Lock className="w-4 h-4" />
                                <Typography variant="label"><FaPiggyBank className="inline-block mr-2 text-pink-400" /> Savings Pot — Unlock at Level {parentProfile?.savings_pot_unlock_level ?? 2}!</Typography>
                              </div>
                              <LinearProgressBar
                                progress={(() => {
                                  const goldReq = ((parentProfile?.savings_pot_unlock_level ?? 2) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return Math.round(((activeChild.lifetime_points || 0) / Math.max(1, goldReq)) * 100);
                                })()}
                                className="max-w-[200px]"
                              />
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
                            <div 
                              onClick={() => setExpandedPot(expandedPot === 'food' ? null : 'food')}
                              className={`bg-white border-2 rounded-[2rem] p-4 sm:p-5 flex flex-col transition-all cursor-pointer group h-full pot-card pot-food ${expandedPot === 'food' ? 'border-orange-400 shadow-md' : 'border-slate-200 hover:border-orange-300 hover:shadow-lg'}`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                  <Utensils className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl">
                                  <FaBone className="w-4 h-4 text-orange-500" />
                                  <Typography variant="number">{activeChild.pet_food || 0}</Typography>
                                </div>
                              </div>
                              <div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-orange-500 mb-1">Food Pot</div>
                                <h3 className="font-extrabold text-lg text-slate-900 leading-tight">Food</h3>
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  <button className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${expandedPot === 'food' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedPot === 'food' ? 'rotate-180' : ''}`} /> Manage
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setShowFoodReplayVideo(true); }}
                                    className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-orange-200 transition-colors"
                                  >
                                    <Play className="w-3 h-3" fill="currentColor" /> Video
                                  </button>
                                </div>
                              </div>

                              <AnimatePresence>
                                {expandedPot === 'food' && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-4 pt-4 border-t-2 border-slate-100 flex-1 flex flex-col"
                                    onClick={(e) => e.stopPropagation()}
                                  >

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
                                <LinearProgressBar
                                  progress={Math.round(((activeChild.food_pot_weekly_contribution || 0) / 7) * 100)}
                                  heightClass="h-2.5"
                                  className="bg-white border-orange-200"
                                />
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
                                    <div className="flex gap-2 mt-auto relative">
                                      <button
                                        onClick={() => { onBuyPetFood(activeChild.id); playSound.purchase(); }}
                                        disabled={(activeChild.points || 0) < 1}
                                        className="flex-1 flex items-center justify-center gap-1 bg-orange-50 text-orange-700 py-2.5 rounded-xl font-bold text-xs border border-orange-200 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <FaBone /> Buy (1g)
                                      </button>
                                      <button
                                        onClick={() => { onSellPetFood(activeChild.id); playSound.purchase(); }}
                                        disabled={(activeChild.pet_food || 0) < 1}
                                        className="flex-1 bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        Sell (+1g)
                                      </button>
                                    </div>

                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Food Pot Locked Preview */}
                          {!isFoodPotUnlocked && activeChild.level < (parentProfile?.food_pot_unlock_level ?? 4) && (
                            <div className="p-4 sm:p-5 rounded-[2rem] bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-center gap-2 opacity-70 h-full">
                              <div className="flex items-center gap-2 text-stone-500">
                                <Lock className="w-4 h-4" />
                                <Typography variant="label"><FaBowlFood className="inline-block mr-2 text-orange-400" /> Food Pot — Unlock at Level {parentProfile?.food_pot_unlock_level ?? 4}!</Typography>
                              </div>
                              <LinearProgressBar
                                progress={(() => {
                                  const goldReq = ((parentProfile?.food_pot_unlock_level ?? 4) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return Math.round(((activeChild.lifetime_points || 0) / Math.max(1, goldReq)) * 100);
                                })()}
                                className="max-w-[200px]"
                              />
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
                            <div 
                              onClick={() => setExpandedPot(expandedPot === 'gifting' ? null : 'gifting')}
                              className={`bg-white border-2 rounded-[2rem] p-4 sm:p-5 flex flex-col transition-all cursor-pointer group h-full pot-card pot-gifting ${expandedPot === 'gifting' ? 'border-purple-400 shadow-md' : 'border-slate-200 hover:border-purple-300 hover:shadow-lg'}`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                                  <Gift className="w-6 h-6" />
                                </div>
                              </div>
                              <div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1">Gifting Pot</div>
                                <h3 className="font-extrabold text-lg text-slate-900 leading-tight">Gifting</h3>
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  <button className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${expandedPot === 'gifting' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedPot === 'gifting' ? 'rotate-180' : ''}`} /> Manage
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setShowGiftingReplayVideo(true); }}
                                    className="flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-rose-200 transition-colors"
                                  >
                                    <Play className="w-3 h-3" fill="currentColor" /> Video
                                  </button>
                                </div>
                              </div>

                              <AnimatePresence>
                                {expandedPot === 'gifting' && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-4 pt-4 border-t-2 border-slate-100 flex-1 flex flex-col"
                                    onClick={(e) => e.stopPropagation()}
                                  >

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
                                    <div className="flex flex-col gap-2 mt-auto relative">
                                      <button
                                        onClick={() => { setShowCharityModal(true); setCharityAmount(Math.min(5, activeChild.points || 0)); setSelectedCharityId('CH-WILDLIFE'); playSound.click(); }}
                                        disabled={activeChild.points <= 0}
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-2.5 rounded-xl font-bold text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <FaGlobe /> Charity
                                      </button>
                                      <button
                                        onClick={() => { setShowSiblingModal(true); setSiblingAmount(Math.min(5, activeChild.points || 0)); setSelectedSiblingId(children.filter(c => c.id !== activeChild.id)[0]?.id || ''); playSound.click(); }}
                                        disabled={activeChild.points <= 0 || children.length <= 1}
                                        className="flex-1 flex items-center justify-center gap-2 bg-pink-50 text-pink-700 py-2.5 rounded-xl font-bold text-xs hover:bg-pink-100 transition-colors border border-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <FaGift /> Sibling
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
                                        <Typography variant="number">{charityAmount}</Typography>
                                      </div>
                                      <button
                                        onClick={() => { setCharityAmount(Math.min((activeChild.points || 0), charityAmount + 1)); playSound.click(); }}
                                        disabled={charityAmount >= (activeChild.points || 0)}
                                        className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-2">
                                      <Button
                                        variant="primary"
                                        className="w-full"
                                        onClick={() => {
                                          if (charityAmount > 0 && charityAmount <= (activeChild.points || 0) && selectedCharityId) {
                                            onGiftingRequestCharity(activeChild.id, charityAmount, selectedCharityId);
                                            setShowCharityModal(false);
                                            playSound.success();
                                          }
                                        }}
                                        disabled={charityAmount <= 0 || charityAmount > (activeChild.points || 0) || !selectedCharityId}
                                      >
                                        Ask to Donate
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => { setShowCharityModal(false); playSound.click(); }}
                                      >
                                        Cancel
                                      </Button>
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
                                        <Typography variant="number">{siblingAmount}</Typography>
                                      </div>
                                      <button
                                        onClick={() => { setSiblingAmount(Math.min((activeChild.points || 0), siblingAmount + 1)); playSound.click(); }}
                                        disabled={siblingAmount >= (activeChild.points || 0)}
                                        className="w-8 h-8 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center cursor-pointer hover:bg-pink-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-2">
                                      <Button
                                        variant="primary"
                                        className="w-full"
                                        onClick={() => {
                                          if (siblingAmount > 0 && siblingAmount <= (activeChild.points || 0) && selectedSiblingId) {
                                            onGiftingRequestSibling(activeChild.id, siblingAmount, selectedSiblingId);
                                            setShowSiblingModal(false);
                                            playSound.success();
                                          }
                                        }}
                                        disabled={siblingAmount <= 0 || siblingAmount > (activeChild.points || 0) || !selectedSiblingId}
                                      >
                                        Ask to Gift
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => { setShowSiblingModal(false); playSound.click(); }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Gifting Pot Locked Preview */}
                          {!isGiftingUnlocked && activeChild.level < (parentProfile?.gifting_pot_unlock_level ?? 6) && (
                            <div className="p-4 sm:p-5 rounded-[2rem] bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-center gap-2 opacity-70 h-full">
                              <div className="flex items-center gap-2 text-stone-500">
                                <Lock className="w-4 h-4" />
                                <Typography variant="label"><FaHeart className="inline-block mr-2 text-pink-500" /> Gifting Pot — Unlock at Level {parentProfile?.gifting_pot_unlock_level ?? 6}!</Typography>
                              </div>
                              <LinearProgressBar
                                progress={(() => {
                                  const goldReq = ((parentProfile?.gifting_pot_unlock_level ?? 6) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return Math.round(((activeChild.lifetime_points || 0) / Math.max(1, goldReq)) * 100);
                                })()}
                                className="max-w-[200px]"
                              />
                              <span className="text-[10px] font-mono text-stone-400 font-bold">
                                {(() => {
                                  const goldReq = ((parentProfile?.gifting_pot_unlock_level ?? 6) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return `${(activeChild.lifetime_points || 0)} / ${goldReq} GOLD`;
                                })()}
                              </span>
                            </div>
                          )}

                          {/* === GOLD POT MAINTENANCE SECTION === */}
                          {isGoldPotMaintenanceUnlocked && activeChild.gold_pot_maintenance_unlock_seen && (
                            <div 
                              onClick={() => setExpandedPot(expandedPot === 'maintenance' ? null : 'maintenance')}
                              className={`bg-white border-2 rounded-[2rem] p-4 sm:p-5 flex flex-col transition-all cursor-pointer group h-full pot-card pot-maintenance ${expandedPot === 'maintenance' ? 'border-amber-500 shadow-md' : 'border-slate-200 hover:border-amber-300 hover:shadow-lg'}`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${activeChild.gold_pot_broken ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'}`}>
                                  <FaWrench className="w-6 h-6" />
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${activeChild.gold_pot_broken ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                  {activeChild.gold_pot_broken ? 'NEEDS REPAIR' : 'SAFE'}
                                </div>
                              </div>
                              <div>
                                <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${activeChild.gold_pot_broken ? 'text-red-500' : 'text-amber-500'}`}>Gold Pot</div>
                                <h3 className={`font-extrabold text-lg leading-tight ${activeChild.gold_pot_broken ? 'text-red-900' : 'text-slate-900'}`}>Maintenance</h3>
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  <button className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${expandedPot === 'maintenance' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedPot === 'maintenance' ? 'rotate-180' : ''}`} /> Manage
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setShowGoldPotMaintenanceVideo(true); }}
                                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${activeChild.gold_pot_broken ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                                  >
                                    <Play className="w-3 h-3" fill="currentColor" /> Video
                                  </button>
                                </div>
                              </div>

                              <AnimatePresence>
                                {expandedPot === 'maintenance' && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-4 pt-4 border-t-2 border-slate-100">
                                      <p className={`text-xs font-bold leading-relaxed mb-4 ${activeChild.gold_pot_broken ? 'text-red-800' : 'text-slate-500'}`}>
                                        Randomly, your Gold Pot may break and leak coins. Make sure to keep it fixed!
                                      </p>

                                      {/* Status Info */}
                                      <div className={`grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 mb-3 border ${activeChild.gold_pot_broken ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                                        <div className="text-center">
                                          <div className={`text-[9px] font-black ${activeChild.gold_pot_broken ? 'text-red-900/60' : 'text-slate-400'} uppercase tracking-widest mb-0.5`}>Last Fixed</div>
                                          <div className={`text-xs font-bold ${activeChild.gold_pot_broken ? 'text-red-900' : 'text-slate-700'}`}>
                                            {activeChild.gold_pot_last_fix_date ? new Date(activeChild.gold_pot_last_fix_date).toLocaleDateString() : 'Never'}
                                          </div>
                                        </div>
                                        <div className="text-center border-l border-slate-200">
                                          <div className={`text-[9px] font-black ${activeChild.gold_pot_broken ? 'text-red-900/60' : 'text-slate-400'} uppercase tracking-widest mb-0.5`}>Total Leaked</div>
                                          <div className={`text-xs font-bold ${activeChild.gold_pot_broken ? 'text-red-900' : 'text-slate-700'}`}>
                                            {activeChild.gold_pot_total_leaked || 0} Coins
                                          </div>
                                        </div>
                                      </div>

                              {activeChild.gold_pot_broken && (
                                <>
                                  <p className="text-[10px] text-red-700 mb-3 leading-relaxed font-bold">
                                    Oh no! Your Gold Pot is cracked and leaking coins! You must fix it or you will lose a coin every day.
                                  </p>
                                  <Button
                                    variant="danger"
                                    fullWidth
                                    disabled={(activeChild.points || 0) < (parentProfile?.gold_pot_maintenance_cost ?? 2)}
                                    onClick={() => {
                                      const cost = parentProfile?.gold_pot_maintenance_cost ?? 2;
                                      if ((activeChild.points || 0) >= cost) {
                                        playSound.success();
                                        onUpdateChildStats(activeChild.id, {
                                          points: activeChild.points - cost,
                                          gold_pot_broken: false,
                                          gold_pot_last_fix_date: new Date().toISOString().split('T')[0]
                                        });
                                      } else {
                                        playSound.pinError();
                                      }
                                    }}
                                    leftIcon={<FaWandMagicSparkles className="w-4 h-4" />}
                                  >
                                    FIX POT (-{parentProfile?.gold_pot_maintenance_cost ?? 2} COINS)
                                  </Button>
                                </>
                              )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                        </div>
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
          <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/60 backdrop-blur-xl rounded-[2rem] p-1.5 flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 z-50">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle },
              { id: 'rewards', label: 'Prizes', icon: Gift },
              { id: 'companion', label: 'Pet', icon: FaCat },
              { id: 'pots', label: 'Pots', icon: FaJar }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeChildTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { playSound.click(); setActiveChildTab(tab.id as any); }}
                  className={`relative w-[4.5rem] h-14 flex flex-col items-center justify-center transition-all duration-300 rounded-[1.25rem] ${
                    isSelected ? 'bg-sky-50 text-sky-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-0.5 transition-transform ${isSelected ? 'scale-105' : ''}`} strokeWidth={isSelected ? 2.5 : 2} />}
                  <span className={`text-[9px] font-bold tracking-tight`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      {/* Badges Modal */}
      <AnimatePresence>
        {showBadgesModal && activeChild && (
          <BadgesModal
            child={activeChild}
            rewards={rewards}
            onClose={() => setShowBadgesModal(false)}
            onClaimFreeReward={handleClaimFreeReward}
          />
        )}
      </AnimatePresence>

      </div>
    );
}
