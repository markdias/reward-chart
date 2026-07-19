import {
  FaStar, FaHeart, FaEgg, FaBurst, FaWandMagicSparkles, FaHeartCrack,
  FaFaceSadTear, FaBone, FaCartShopping, FaGamepad, FaFaceFrown, FaCircleCheck, FaTriangleExclamation, FaCheck,
  FaBullseye, FaGift, FaJar, FaCoins, FaPiggyBank, FaBowlFood, FaGlobe, FaCat, FaWater, FaBook,
  FaWrench,
  FaChildDress, FaChild, FaCrown, FaFire, FaShield, FaBullhorn, FaBroom, FaPen, FaBaby, FaBolt,
  FaPizzaSlice, FaPalette, FaBookOpen, FaInfinity, FaCalendar, FaHandPeace, FaScroll, FaRocket, FaPaw
} from 'react-icons/fa6';
import React, { useState, useEffect, useRef } from 'react';
import { Typography } from './ui/Typography';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy, Flame, Play, ChevronRight, Lock, Star, Check, ThumbsUp,
  ArrowLeft, CheckCircle, CheckCircle2, Gift, Sparkles, Smile, Target, Zap, RotateCcw, AlertTriangle, HelpCircle, TrendingUp,
  PiggyBank, X, Plus, Minus, Utensils, ShieldAlert, BookOpen, Dumbbell, Palette, Heart, Home, ChevronDown, Bell, Coins, Plane, Smartphone, Gamepad2, PlayCircle
} from 'lucide-react';
import { ChildHomeTab } from './ChildHomeTab';
import { CATEGORY_ICON_MAP } from '../utils/categories';
import { Child, Task, TaskCompletion, Reward, RewardRedemption, ParentProfile } from '../types';

import { CHARACTER_PACKS, getCharacterStage } from '../data/characters';
import { playSound } from '../utils/sound';
import WellDoneOverlay from './WellDoneOverlay';
import { getLogicalDateString, getCurrentWeekKey, getStartOfDailyReset } from '../utils/date';
import { CoinBadge } from './CoinBadge';
import { Tooltip } from './ui/Tooltip';
import { ChildAvatar } from './ChildAvatar';
import { LinearProgressBar } from './ProgressBar';
import { Button } from './ui/Button';
import { BottomTabBar } from './ui/BottomTabBar';
import { Walkthrough } from './Walkthrough';
import { Step } from 'react-joyride';
import { PullToRefresh } from './PullToRefresh';
import { ArcadeTicketCard } from './ArcadeTicketCard';
import { BadgesModal } from './BadgesModal';
import { getSupabaseClient } from '../utils/supabase';
import { checkAndUnlockBadges } from '../utils/badgeService';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

const RECURRENCE_LABEL: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  one_time: 'One-off',
  repeatable: 'Repeatable',
};

const getPetStripeBackground = (characterId: string) => {
  return 'repeating-linear-gradient(45deg, #10b981, #10b981 15px, #059669 15px, #059669 30px, #047857 30px, #047857 45px)';
};

interface ChildDashboardProps {
  parentProfile?: ParentProfile | null;
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  onCompleteTask: (taskId: string, childId: string) => void;
  onClaimReward: (rewardId: string, childId: string, paymentSource?: string) => void;
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
  isLoading?: boolean;
  isChildAuth?: boolean;
  onLogout?: () => void;
  onRefresh?: () => Promise<void>;
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
  isLoading = false,
  isChildAuth = false,
  onLogout,
  onRefresh
}: ChildDashboardProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(lockedChildId || null);
  const [activeChildTab, setActiveChildTab] = useState<'home' | 'companion' | 'tasks' | 'rewards' | 'pots'>('home');

  // Walkthrough State
  const [runTour, setRunTour] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleResize = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    setHasAutoStarted(false);
  }, [selectedChildId]);

  useEffect(() => {
    // Only run tour if a child is selected
    if (selectedChildId) {
      const activeChild = children.find(c => c.id === selectedChildId);
      const localSeen = localStorage.getItem(`RCH_TOUR_SEEN_CHILD_${selectedChildId}`) === 'true';
      if (activeChild && !activeChild.tour_seen && !localSeen && !isLoading && !runTour && !hasAutoStarted) {
        setHasAutoStarted(true);
        setTourStepIndex(0);
        setActiveChildTab('home');
        setTimeout(() => setRunTour(true), 1000);
      }
    }
  }, [selectedChildId, isLoading, children, runTour, hasAutoStarted]);

  const handleTourFinish = () => {
    setRunTour(false);
    if (selectedChildId) {
      localStorage.setItem(`RCH_TOUR_SEEN_CHILD_${selectedChildId}`, 'true');
      const activeChild = children.find(c => c.id === selectedChildId);
      if (activeChild && !activeChild.tour_seen) {
        onUpdateChildStats(selectedChildId, { tour_seen: true });
      }
    }
  };

  const handleBeforeTourStepChange = (nextStepIndex: number) => {
    // All steps in the child tour change the main tab, so we always scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Called by Walkthrough when advancing to the NEXT or PREV step index
  const handleTourStepChange = (nextStepIndex: number) => {
    if (nextStepIndex === 0 || nextStepIndex === 1) {
      setActiveChildTab('home');
    } else if (nextStepIndex === 2) {
      setActiveChildTab('companion');
    } else if (nextStepIndex === 3 || nextStepIndex === 4) {
      setActiveChildTab('tasks');
    } else if (nextStepIndex === 5 || nextStepIndex === 6) {
      setActiveChildTab('rewards');
    } else if (nextStepIndex >= 7 && nextStepIndex <= 12) {
      setActiveChildTab('pots');
    } else if (nextStepIndex === 13) {
      setActiveChildTab('home');
    }

    // Delay updating the stepIndex to allow active tab mount / layout adjustments
    setTimeout(() => {
      setTourStepIndex(nextStepIndex);
      
      // Smart manual scroll: only scroll enough to push the target into the safe viewing area
      setTimeout(() => {
        const step = tourSteps[nextStepIndex];
        if (step && typeof step.target === 'string') {
          const targetEl = document.querySelector(step.target);
          if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            const topBoundary = 120; // Clear the top header
            const bottomBoundary = window.innerHeight - 150; // Clear bottom tab bar + tooltip

            let scrollDiff = 0;
            if (rect.top < topBoundary) {
              scrollDiff = rect.top - topBoundary;
            } else if (rect.bottom > bottomBoundary) {
              scrollDiff = rect.bottom - bottomBoundary;
            }

            if (scrollDiff !== 0) {
              window.scrollBy({ top: scrollDiff, behavior: 'smooth' });
            }
          }
        }
      }, 50);
    }, 300);
  };

  const tourSteps: Step[] = [
    {
      target: '.joyride-target-home',
      content: 'Welcome! This is your Home base. Check your streak, coins, and badges here!',
      placement: 'bottom',
      skipScroll: true,
    },
    {
      target: '.joyride-target-first-routine',
      content: 'Here are your routines! Complete them every day to earn extra coins.',
      placement: 'bottom',
    },
    {
      target: '.joyride-target-companion',
      content: 'Meet your Pet! Complete quests to keep it happy and earn coins to evolve it!',
      placement: 'bottom',
    },
    {
      target: '.joyride-target-tasks',
      content: 'Your Quests! Tap here to see your daily chores.',
      placement: 'bottom',
    },
    {
      target: '.joyride-target-first-task',
      content: 'Tap a quest to request approval and earn coins!',
      placement: 'bottom',
    },
    {
      target: '.joyride-target-rewards',
      content: 'The Treasure Shop! Exchange your coins for awesome prizes.',
      placement: 'bottom',
    },
    {
      target: '.joyride-target-first-reward',
      content: 'Tap a prize to claim it when you have enough coins!',
      placement: 'bottom',
    },
    {
      target: '.joyride-target-pots',
      content: 'Your Pots! Check here to see your spending, saving, and giving pots!',
      placement: 'bottom',
    },
    {
      target: '.joyride-target-pot-gold',
      content: 'This is your Gold Pot! It holds all your spending money.',
      placement: 'bottom',
    },
    {
      target: '.joyride-target-pot-savings',
      content: 'Your Savings Pot! Keep your coins safe here to reach big goals.',
      placement: 'bottom',
    },
    {
      target: '.joyride-target-pot-food',
      content: 'Your Food Pot! Buy food here to keep your pet fed and happy.',
      placement: 'bottom',
    },
    {
      target: '.joyride-target-pot-gifting',
      content: 'Your Gifting Pot! Send coins to your family as a nice gift!',
      placement: 'bottom',
    },
    {
      target: '.joyride-target-pot-maintenance',
      content: 'The Maintenance Pot! Keep your Gold Pot repaired so it does not leak coins.',
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div className="flex flex-col gap-4">
          <p className="font-bold">You're all set! Go crush those quests!</p>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="child-tour-dont-show" className="rounded text-indigo-600 w-5 h-5" onChange={(e) => {
              if (e.target.checked && selectedChildId) {
                localStorage.setItem(`RCH_TOUR_SEEN_CHILD_${selectedChildId}`, 'true');
                onUpdateChildStats(selectedChildId, { tour_seen: true });
              }
            }} />
            <label htmlFor="child-tour-dont-show" className="text-sm cursor-pointer">Don't show this tour again</label>
          </div>
        </div>
      ),
      placement: 'center',
    }
  ];


  // Helper to offset dates by 4 hours for a "4 AM daily reset"
  // This ensures tasks completed at 1 AM count towards the previous day


  useEffect(() => {
    if (lockedChildId) {
      setSelectedChildId(lockedChildId);
    } else {
      setSelectedChildId(null);
    }
  }, [lockedChildId]);

  const [flippedPot, setFlippedPot] = useState<string | null>(null);

  // Scroll to top when switching tabs
  useEffect(() => {
    const viewport = document.getElementById('child-viewport');
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeChildTab]);

  const [expandedGoal, setExpandedGoal] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  const [isFeeding, setIsFeeding] = useState(false);

  // Well Done celebration overlay
  const [showWellDone, setShowWellDone] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
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
    model_url?: string;
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
          setGoldPotPenaltyMessage(`Oh no! Your broken Gold Pot just leaked a coin! You need to go to the Pots tab and fix it before it leaks all your gold.`);
          setTimeout(() => playSound.pinError(), 800);
        }
      } else {
        if (breakCount < 2) {
          if (Math.random() < 0.28) {
            broken = true;
            breakCount += 1;
            updates.gold_pot_broken = true;
            updates.gold_pot_break_count_this_week = breakCount;
            setGoldPotPenaltyMessage(`Oh no! Your Gold Pot is broken and leaking coins! You need to go to the Pots tab and fix it before it leaks all your gold.`);
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

  const activeChildStage = activeChild ? getCharacterStage(activeChild.character_id, activeChild.level, parentProfile) : null;
  const activeChildPack = activeChild ? (CHARACTER_PACKS.find(cp => cp.id === activeChild.character_id) || CHARACTER_PACKS[0]) : null;

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
      model_url: nextStage.model_url,
      toImage: nextStage.model_url,
      fromImage: activeChildStage.model_url,
      model_scale: nextStage.model_scale
    });
  };

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
    onClaimReward(rewardId, activeChild.id, `badge_freebie:${badgeId}`);

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
    <div className={`min-h-screen flex flex-col font-sans relative overflow-x-hidden transition-colors duration-700 ${!selectedChildId ? 'bg-transparent' : 'bg-stone-100 dark:bg-stone-950 pt-[calc(max(env(safe-area-inset-top,0px),0.5rem)+68px)] sm:pt-[calc(max(env(safe-area-inset-top,0px),0.5rem)+88px)]'}`} id="child-dashboard-root" >

      {selectedChildId && (
        <Walkthrough
          steps={tourSteps}
          run={runTour}
          stepIndex={tourStepIndex}
          onFinish={handleTourFinish}
          onStepChange={handleTourStepChange}
          onBeforeStepChange={handleBeforeTourStepChange}
        />
      )}

      {/* Fixed Top Bar (Dashboard Only) */}
      {selectedChildId && (
        <header
          className="fixed top-0 left-0 right-0 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 z-50 pb-2 sm:pb-3"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
        >
          <div className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              {activeChild && (
                <ChildAvatar
                  iconName={activeChild.avatar_url}
                  className="w-11 h-11 sm:w-14 sm:h-14 shadow-sm shrink-0"
                />
              )}
              <div className="flex flex-col justify-center min-w-0">
                <Typography variant="h1" as="h1" className="text-xl sm:text-3xl font-black text-stone-900 dark:text-stone-50 leading-none tracking-tight font-display whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                  {activeChild?.name ? `${activeChild.name}'s Dashboard` : 'Dashboard'}
                </Typography>
                <div className="flex items-center gap-1.5 text-xs sm:text-base text-stone-500 dark:text-stone-400 font-semibold mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                  {parentProfile?.family_name ? `${parentProfile.family_name} Family` : parentProfile?.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div
                className="flex items-center p-1 rounded-full shadow-md shrink-0"
                style={{ background: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #f59e0b 10px, #f59e0b 20px, #d97706 20px, #d97706 30px)' }}
              >
                <div className="flex items-center bg-white dark:bg-stone-900 border-2 border-stone-900 rounded-full p-1 sm:p-1.5 gap-1 w-full h-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                  {activeChildTab !== 'home' && (
                    <Tooltip content="Current Gold Coins" position="bottom">
                      <div className="cursor-help ml-1.5 sm:ml-2.5">
                        <CoinBadge points={activeChild?.points || 0} />
                      </div>
                    </Tooltip>
                  )}
                  {!lockedChildId && (
                    <Tooltip content="Go Back" position="bottom">
                      <Button
                        variant="none"
                        size="none"
                        onClick={() => { playSound.click(); setSelectedChildId(null); }}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 transition-colors shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </Tooltip>
                  )}

                  {/* Help Button */}
                  <Tooltip content="Help & Guide" position="bottom" align="right">
                    <Button
                      variant="none"
                      size="none"
                      onClick={() => { playSound.click(); setShowHelpModal(true); }}
                      className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 transition-colors shrink-0"
                    >
                      <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </Tooltip>

                  {isChildAuth && onLogout ? (
                    <Tooltip content="Log Out" position="bottom">
                      <Button
                        variant="none"
                        size="none"
                        onClick={() => { playSound.click(); onLogout(); }}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </Tooltip>
                  ) : (
                    <Tooltip content="Parent Dashboard" position="bottom" align="right">
                      <Button
                        variant="none"
                        size="none"
                        onClick={() => { playSound.click(); onEnterParentMode(); }}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 transition-colors shrink-0"
                      >
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </Tooltip>
                  )}

                  {!lockedChildId && onLockChild && activeChild && (
                    <Tooltip content="Lock Device to Child" position="bottom" align="right">
                      <Button
                        variant="none"
                        size="none"
                        onClick={() => { playSound.click(); onLockChild(activeChild.id); }}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-stone-400 hover:text-sky-600 hover:bg-sky-100 transition-colors shrink-0"
                      >
                        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </Tooltip>
                  )}
                </div>
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
            className="mx-2 sm:mx-8 mt-2 sm:mt-4 p-[3px] rounded-3xl shadow-sm z-30 relative"
            style={{ background: 'repeating-linear-gradient(45deg, #22d3ee, #22d3ee 10px, #f472b6 10px, #f472b6 20px, #c084fc 20px, #c084fc 30px)' }}
          >
            <div className="bg-indigo-50 dark:bg-stone-900 border-2 border-stone-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] rounded-[21px] p-3 sm:p-4 flex flex-row items-center justify-between gap-3 w-full h-full">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-indigo-500 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-50 text-sm sm:text-base truncate">You have a message!</Typography>
                  <Typography variant="body" className="text-xs text-stone-600 dark:text-stone-300 font-medium leading-tight line-clamp-2">Your parent sent you a friendly reminder to complete your tasks today!</Typography>
                </div>
              </div>
              <Button
                variant="none"
                size="none"
                onClick={() => {
                  playSound.click();
                  onEditChild(activeChild.id, { has_pending_nudge: false });
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0 shadow-sm border border-stone-200 dark:border-stone-700 transition-transform active:scale-95"
              >
                <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </Button>
            </div>
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
            className="fixed inset-0 z-50 bg-white dark:bg-stone-900/95 flex flex-col items-center justify-center p-6 text-center"
            id="evolution-cinematic"
          >
            <div className="absolute inset-0  opacity-30 pointer-events-none" />

            <motion.div
              initial={{ scale: 0.8, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 8 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative max-w-lg bg-white dark:bg-stone-900 border-4 border-cyan-400 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.4)] space-y-6"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-ping pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-full text-xs font-bold uppercase tracking-widest font-sans">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                {isHatching && hatchPhase !== 'reveal' ? 'EGG HATCHING...' : 'COMPANION UPGRADE'}
              </div>

              <Typography variant="h2" className="text-3xl font-black font-display bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent text-cyan-500">
                {isHatching && hatchPhase !== 'reveal' ? 'YOUR EGG IS HATCHING!' : 'EVOLUTION TRIGGERED!'}
              </Typography>

              <Typography variant="body" className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                {isHatching && hatchPhase !== 'reveal' ? (
                  <>Something magical is happening! <strong className="text-white">{evolvingStage.charName}</strong> is about to be born!</>
                ) : (
                  <>Spectacular progress! Companion <strong className="text-white">{evolvingStage.charName}</strong> is transmuting into a more powerful form!</>
                )}
              </Typography>

              {/* Evolution / Hatching Pedestal */}
              <div className="my-8 relative flex items-center justify-center" style={{ minHeight: '200px' }}>
                <div className={`absolute -inset-2 rounded-full bg-gradient-to-r ${isHatching && hatchPhase !== 'reveal'
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
                    className="relative h-44 w-44 rounded-full bg-white dark:bg-stone-900 border-4 border-amber-400 flex items-center justify-center shadow-2xl overflow-hidden z-10"
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
                    className={`relative h-44 w-44 rounded-full ${evolvingStage.model_url ? 'bg-white dark:bg-stone-900' : 'bg-white dark:bg-stone-900'} border-4 border-cyan-400 flex items-center justify-center text-8xl shadow-2xl overflow-hidden z-10`}
                  >
                    {evolvingStage.model_url ? (
                      <div className="w-full h-full" style={{ transform: `scale(${evolvingStage.model_scale || 1.35})` }}>
                        <model-viewer 
                          src={evolvingStage.model_url} 
                          alt={evolvingStage.toStage} 
                          auto-rotate 
                          camera-controls 
                          class="w-full h-full object-cover"
                        >
                          <div slot="progress-bar"></div>
                        </model-viewer>
                      </div>
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
                <Typography variant="body" className="text-[10px] text-cyan-400 font-sans tracking-widest uppercase">
                  {isHatching && hatchPhase !== 'reveal' ? 'HATCHING IN PROGRESS...' : 'UPGRADED FORM SPEC'}
                </Typography>
                <Typography variant="h3" className="text-2xl font-black text-white mt-1">
                  {isHatching && hatchPhase !== 'reveal'
                    ? ['🥚 Wobbling...', '💥 Cracking!', '✨ Splitting open!'][['wobble', 'crack', 'split'].indexOf(hatchPhase)] || evolvingStage.toStage
                    : evolvingStage.toStage
                  }
                </Typography>
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
              className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden"
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
                  <span className="text-[10px] font-sans tracking-widest uppercase text-amber-500 font-extrabold">Welcome!</span>
                  <Typography variant="h3" className="uppercase tracking-wide leading-none">
                    How it Works
                  </Typography>
                </div>

                <Typography variant="body" className="text-sm font-bold text-stone-600 dark:text-stone-300 leading-relaxed px-4">
                  Watch this quick video to learn how to earn gold coins and unlock awesome prizes!
                </Typography>

                {/* Video Player */}
                <div className="relative w-full aspect-video rounded-2xl bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 overflow-hidden shadow-inner group">
                  <video
                    ref={videoRef}
                    src="/01_GoldPot_LevelUp.mp4"
                    className="w-full h-full object-cover"
                    controls={isVideoPlaying}
                    playsInline
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onEnded={() => setIsVideoPlaying(false)}
                  >
                    <source src="/01_GoldPot_LevelUp.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {!isVideoPlaying && (
                    <Button
                      variant="none"
                      size="none"
                      onClick={() => {
                        videoRef.current?.play();
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-white dark:bg-stone-900/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-amber-600 ml-1" />
                      </div>
                    </Button>
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
              className="relative w-full max-w-lg bg-white dark:bg-stone-900 border-4 border-stone-200 dark:border-stone-700 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              {/* Sunburst background effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest font-sans">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                NEW FEATURE UNLOCKED
              </div>

              <Typography variant="h1" as="h2">
                <FaWandMagicSparkles className="inline-block mr-2 text-pink-500" /> SAVINGS POT UNLOCKED!
              </Typography>

              <Typography variant="body">
                Well done, <strong className="text-stone-900 dark:text-stone-50">{activeChild.name}</strong>! You've earned a brand new feature — the <strong className="text-amber-600">Savings Pot</strong>!
              </Typography>

              {/* Video Player */}
              <div className="relative w-full aspect-video rounded-2xl bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 overflow-hidden shadow-inner group">
                <video
                  ref={videoRef}
                  src="/02_SavingsPot_BigGoals.mp4"
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/savings-poster.jpg"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  <source src="/02_SavingsPot_BigGoals.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!isVideoPlaying && (
                  <div
                    onClick={() => {
                      videoRef.current?.play();
                    }}
                    className="absolute inset-0 cursor-pointer flex items-center justify-center group-hover:opacity-0 transition-opacity bg-stone-900/20"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-stone-900/90 rounded-full flex items-center justify-center shadow-lg transform active:scale-[0.96] transition-transform">
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
              className="relative w-full max-w-lg bg-white dark:bg-stone-900 border-4 border-stone-200 dark:border-stone-700 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              {/* Sunburst background effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-300 text-orange-700 rounded-full text-xs font-bold uppercase tracking-widest font-sans">
                <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                NEW FEATURE UNLOCKED
              </div>

              <Typography variant="h1" as="h2">
                <FaWandMagicSparkles className="inline-block mr-2 text-orange-500" /> FOOD POT UNLOCKED!
              </Typography>

              <Typography variant="body">
                Awesome job, <strong className="text-stone-900 dark:text-stone-50">{activeChild.name}</strong>! You've unlocked the <strong className="text-orange-600">Food Pot</strong>! Remember to deposit 7 gold coins per week and feed your pet every day.
              </Typography>

              {/* Video Player */}
              <div className="relative w-full aspect-video rounded-2xl bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 overflow-hidden shadow-inner group">
                <video
                  ref={videoRef}
                  src="/03_FoodPot_PetCare.mp4"
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/food-pot-poster.jpg"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  <source src="/03_FoodPot_PetCare.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!isVideoPlaying && (
                  <div
                    onClick={() => {
                      videoRef.current?.play();
                    }}
                    className="absolute inset-0 cursor-pointer flex items-center justify-center group-hover:opacity-0 transition-opacity bg-stone-900/20"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-stone-900/90 rounded-full flex items-center justify-center shadow-lg transform active:scale-[0.96] transition-transform">
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
              className="relative w-full max-w-lg bg-white dark:bg-stone-900 border-4 border-stone-200 dark:border-stone-700 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              {/* Sunburst background effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 border border-rose-300 text-rose-700 rounded-full text-xs font-bold uppercase tracking-widest font-sans">
                <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
                NEW FEATURE UNLOCKED
              </div>

              <Typography variant="h1" as="h2">
                <FaWandMagicSparkles className="inline-block mr-2 text-purple-500" /> GIFTING POT UNLOCKED!
              </Typography>

              <Typography variant="body">
                You're so generous, <strong className="text-stone-900 dark:text-stone-50">{activeChild.name}</strong>! You've unlocked the <strong className="text-rose-600">Gifting Pot</strong>! You can now use your gold coins to help others by donating to charity or gifting to a sibling.
              </Typography>

              {/* Video Player */}
              <div className="relative w-full aspect-video rounded-2xl bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 overflow-hidden shadow-inner group">
                <video
                  ref={videoRef}
                  src="/04_GiftingPot_Charity.mp4"
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/gifting-pot-poster.jpg"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  <source src="/04_GiftingPot_Charity.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!isVideoPlaying && (
                  <div
                    onClick={() => {
                      videoRef.current?.play();
                    }}
                    className="absolute inset-0 cursor-pointer flex items-center justify-center group-hover:opacity-0 transition-opacity bg-stone-900/20"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-stone-900/90 rounded-full flex items-center justify-center shadow-lg transform active:scale-[0.96] transition-transform">
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
              className="relative w-full max-w-lg bg-white dark:bg-stone-900 border-4 border-stone-200 dark:border-stone-700 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              {/* Sunburst background effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest font-sans">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                NEW RESPONSIBILITY
              </div>

              <Typography variant="h1" as="h2">
                <FaTriangleExclamation className="inline-block mr-2 text-amber-500" /> POT MAINTENANCE!
              </Typography>

              <Typography variant="body">
                Great progress, <strong className="text-stone-900 dark:text-stone-50">{activeChild.name}</strong>! You've reached a level where your <strong className="text-amber-600">Gold Pot</strong> needs maintenance! Sometimes it might crack, and you'll need to spend gold coins to fix it so it doesn't leak. Keep an eye on it!
              </Typography>

              {/* Video Player */}
              <div className="relative w-full aspect-video rounded-2xl bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 overflow-hidden shadow-inner group">
                <video
                  ref={videoRef}
                  src="/05_MaintenancePot.mp4"
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/gold-pot-poster.jpg"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  <source src="/05_MaintenancePot.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!isVideoPlaying && (
                  <div
                    onClick={() => {
                      videoRef.current?.play();
                    }}
                    className="absolute inset-0 cursor-pointer flex items-center justify-center group-hover:opacity-0 transition-opacity bg-stone-900/20"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-stone-900/90 rounded-full flex items-center justify-center shadow-lg transform active:scale-[0.96] transition-transform">
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
              className="relative w-full max-w-md bg-white dark:bg-stone-900 border-4 border-stone-200 dark:border-stone-700 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-rose-100 border border-rose-300 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-rose-600 animate-bounce" />
              </div>

              <Typography variant="h2" className="text-2.5xl font-black font-display text-rose-600">
                <FaHeartCrack className="inline-block mr-2 text-red-500" /> PET IS UNHAPPY!
              </Typography>

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
              className="relative w-full max-w-md bg-white dark:bg-stone-900 border-4 border-stone-200 dark:border-stone-700 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center">
                <FaTriangleExclamation className="w-10 h-10 text-amber-600 animate-pulse" />
              </div>

              <Typography variant="h2" className="text-2.5xl font-black font-display text-amber-600">
                GOLD POT BROKEN!
              </Typography>

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
                GO TO Pots <FaCoins className="inline-block ml-2 text-yellow-100" />
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
              className="relative w-full max-w-md bg-white dark:bg-stone-900 border-4 border-stone-200 dark:border-stone-700 rounded-[2.5rem] p-8 shadow-sm space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-orange-100 border border-orange-300 rounded-2xl flex items-center justify-center">
                <Utensils className="w-10 h-10 text-orange-500 animate-bounce" />
              </div>

              <Typography variant="h2" className="text-2.5xl font-black font-display text-orange-500">
                TIME TO FEED!
              </Typography>

              <Typography variant="body">
                Don't forget to feed <strong className="text-stone-900 dark:text-stone-50">{activeChildPack?.name.split(' the ')[0] || 'your pet'}</strong> today! A happy pet is a good companion.
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
          <div className="relative flex items-center bg-stone-50 dark:bg-stone-950/80 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-full shadow-sm p-1 sm:p-1.5 shrink-0 z-50">
            <Button
              variant="none"
              size="none"
              onClick={() => { playSound.click(); onEnterParentMode(); }}
              className="flex items-center gap-2 px-4 sm:px-6 h-12 sm:h-14 rounded-full text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors font-bold text-xs sm:text-sm tracking-wide"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
              PARENT MODE
            </Button>
          </div>
        </header>
      )}

      {/* Central HUD Viewport */}
      <div className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 flex flex-col relative z-20 overflow-y-auto mb-40 lg:mb-8 ${!selectedChildId ? 'bg-transparent mt-0 pt-0 pb-0' : 'bg-transparent mt-2 sm:mt-4 py-4 sm:py-6'}`} id="child-viewport">
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
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold font-sans uppercase tracking-widest`}>
                  <Gamepad2 className="w-3.5 h-3.5" /> PLAYER SELECT
                </div>
                <Typography variant="h1" className={`text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-stone-800 dark:text-stone-100`}>
                  Grab your pass!
                </Typography>
                <Typography variant="body" className={`text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed`}>
                  Select your arcade access ticket to start your adventure and claim your rewards!
                </Typography>
              </div>

              <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl mx-auto pt-4 w-full text-left" id="kids-deck">
                {isLoading ? (
                  <>
                    {[1, 2].map((i) => (
                      <ArcadeTicketCard key={`skel-${i}`} child={{ id: '', name: '', avatar_url: '', level: 0, streak_days: 0, points: 0 }} isLoading />
                    ))}
                  </>
                ) : children.map((child) => {
                  const stage = getCharacterStage(child.character_id, child.level, parentProfile);
                  return (
                    <ArcadeTicketCard
                      key={child.id}
                      child={child}
                      onClick={() => handleSelectChild(child.id)}
                    />
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

              {/* Left Sidebar (Desktop Only) */}
              {isDesktop && (
                <aside className="hidden lg:flex lg:flex-col lg:col-span-3 space-y-6 self-start">
                  <nav className="flex flex-col gap-2">
                    {[
                      { id: 'home', label: 'Home', icon: Home },
                      { id: 'companion', label: 'Pets', icon: FaPaw },
                      { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
                      { id: 'rewards', label: 'Rewards', icon: Gift },
                      { id: 'pots', label: 'Pots', icon: FaJar }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isSelected = activeChildTab === tab.id;
                      return (
                        <Button
                          variant="none"
                          size="none"
                          key={tab.id}
                          id={`tour-child-desktop-tab-${tab.id}`}
                          onClick={() => { playSound.click(); setActiveChildTab(tab.id as any); }}
                          className={`joyride-target-${tab.id} w-full flex items-center justify-between p-4 rounded-2xl text-[11px] font-sans font-bold uppercase tracking-widest transition-all cursor-pointer duration-300 ${isSelected
                            ? 'bg-stone-900 text-white shadow-md shadow-stone-900/10 scale-[1.02]'
                            : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-50 hover:scale-[1.01]'
                            }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-stone-400'}`} strokeWidth={isSelected ? 2.5 : 2} />
                            {tab.label}
                          </span>
                        </Button>
                      );
                    })}
                  </nav>
                </aside>
              )}

              <main className="lg:col-span-9 space-y-6">
                {/* Active Screen Frame */}
                <AnimatePresence mode="wait">

                  {/* Pet / Companion Tab */}
                  {activeChildTab === 'companion' && activeChild && activeChildStage && activeChildPack && (
                    <motion.div
                      key="companion-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      {/* Holo Pedestal */}
                      <div
                        className="relative p-2 rounded-3xl transition-transform duration-200 flex flex-col items-center text-center shadow-2xl overflow-hidden"
                        style={{ background: getPetStripeBackground(activeChild.character_id || 'unicorn') }}
                      >
                        {/* Inner Cutout */}
                        <div
                          className="relative z-10 w-full h-full rounded-[1rem] p-4 sm:p-6 flex flex-col items-center border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] overflow-hidden"
                          style={{
                            backgroundImage: "url('/field_stand_bg.png')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center 55%'
                          }}
                        >

                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent rounded-[1rem]" />

                          <div className="flex justify-between w-full items-start mt-1 relative z-20">
                            {/* Pet Species Pill (Top Left) */}
                            <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg border border-stone-200/50 dark:border-stone-700/50 text-center flex flex-col items-center">
                              <span className={`text-[9px] font-sans tracking-widest uppercase text-stone-500 font-extrabold mb-0.5`}>PET SPECIES</span>
                              <Typography variant="h3" className={`font-black text-stone-900 dark:text-white text-sm uppercase tracking-wider leading-none`}>{activeChildStage.name}</Typography>
                            </div>
                            
                            {/* Pet Status Pill (Top Right) */}
                            <div className={`transition-opacity duration-300 ${!isFoodPotUnlocked ? 'opacity-0 pointer-events-none' : ''}`}>
                              {activeChild.pet_unhappy ? (
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50/90 backdrop-blur-md border border-rose-200 text-rose-700 rounded-full text-xs font-extrabold animate-pulse shadow-sm">
                                  <FaFaceFrown className="inline-block text-blue-500 text-sm" /> Unhappy & Hungry
                                </span>
                              ) : activeChild.pet_fed_today ? (
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50/90 backdrop-blur-md border border-emerald-200 text-emerald-700 rounded-full text-xs font-extrabold shadow-sm">
                                  <FaHeart className="inline-block text-green-500 text-sm" /> Fed & Happy!
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50/90 backdrop-blur-md border border-amber-200 text-amber-800 rounded-full text-xs font-extrabold animate-bounce shadow-sm">
                                  <FaBone className="inline-block text-amber-700 text-sm" /> Hungry!
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Giant Levitating Pedestal */}
                          <div className="my-6 sm:my-10 relative flex items-center justify-center">

                            <motion.div
                              animate={isFeeding ? { scale: [1, 1.25, 1.1, 1.3, 1], rotate: [0, 8, -8, 8, 0] } : {}}
                              transition={isFeeding ? { duration: 2.2, ease: "easeInOut" } : { duration: 1.2 }}
                              className={`h-48 w-48 sm:h-80 sm:w-80 flex items-center justify-center relative z-10 ${activeChildStage.animation_class} transition-colors duration-500 -translate-y-10`}
                            >
                              {(() => {
                                const modelUrl = activeChildStage.model_url_fed && activeChildStage.model_url_not_fed
                                  ? (activeChild.pet_fed_today ? activeChildStage.model_url_fed : activeChildStage.model_url_not_fed)
                                  : activeChildStage.model_url;
                                return modelUrl ? (
                                  <div className="w-full h-full" style={{ transform: `scale(${activeChildStage.model_scale || 1.35})` }}>
                                    <model-viewer 
                                      src={modelUrl} 
                                      alt={activeChildStage.name} 
                                      camera-controls 
                                      class="w-full h-full animate-float"
                                    >
                                      <div slot="progress-bar"></div>
                                    </model-viewer>
                                  </div>
                                ) : (
                                  <span className="text-9xl sm:text-[16rem] leading-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] absolute">
                                    {activeChildStage.emoji}
                                  </span>
                                );
                              })()}
                            </motion.div>
                          </div>
                          {/* Unified Level and Feed progression */}
                          <div className={`w-full mt-6 relative z-30 transition-opacity duration-300 ${!isFoodPotUnlocked ? 'opacity-0 pointer-events-none' : ''}`}>
                            <div className="w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-[2.5rem] p-4 pr-5 flex items-stretch border-2 border-white/50 dark:border-stone-700/50 shadow-2xl">
                              
                              {/* Left Side: Level Progress */}
                              <div className="flex-1 pl-4 pr-6 py-3 flex flex-col justify-center border-r-2 border-stone-200 dark:border-stone-800 border-dashed">
                                <div className="flex justify-between items-end mb-2">
                                  <span className="text-[16px] sm:text-[18px] font-black text-stone-900 dark:text-white uppercase tracking-widest">Level {activeChild.level}</span>
                                  <span className="text-[11px] sm:text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                    {(activeChild.lifetime_points || 0) % (parentProfile?.points_to_level_up ?? 500)} / {parentProfile?.points_to_level_up ?? 500} coins
                                  </span>
                                </div>
                                <LinearProgressBar
                                  progress={(((activeChild.lifetime_points || 0) % (parentProfile?.points_to_level_up ?? 500)) / (parentProfile?.points_to_level_up ?? 500)) * 100}
                                  heightClass="h-3.5 sm:h-4"
                                  className="!bg-stone-200 dark:!bg-stone-800"
                                />
                                
                                {/* Show warning text inline if no food */}
                                {(!activeChild.pet_fed_today && (activeChild.pet_food || 0) <= 0) && (
                                  <span className="text-[13px] sm:text-[15px] text-red-500 dark:text-red-400 font-black mt-3 leading-tight flex items-center">
                                    <FaTriangleExclamation className="mr-1.5 shrink-0" />
                                    No food left!
                                  </span>
                                )}
                              </div>

                              {/* Right Side: Feed Button */}
                              <div className="w-[110px] shrink-0 pl-5 flex items-center">
                                <div className="relative w-full">
                                  {/* Inventory Badge */}
                                  <div className={`absolute -top-3 -right-3 text-white text-[11px] sm:text-xs font-black w-8 h-8 rounded-full border-[3px] shadow-lg z-20 flex items-center justify-center
                                    ${(activeChild.pet_food || 0) > 0 ? 'bg-orange-500 border-white dark:border-stone-900' : 'bg-stone-400 border-white dark:border-stone-900'}`}>
                                    {activeChild.pet_food || 0}
                                  </div>
                                  
                                  {/* Button */}
                                  <Button
                                    variant="none"
                                    size="none"
                                    onClick={handleFeedCompanion}
                                    disabled={!isFoodPotUnlocked || isFeeding || (activeChild.pet_food || 0) <= 0 || activeChild.pet_fed_today}
                                    className={`w-full h-[88px] rounded-3xl font-sans text-xs sm:text-[13px] font-black uppercase flex flex-col items-center justify-center gap-1 transition-all
                                      ${activeChild.pet_fed_today
                                        ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 border-2 border-stone-200 dark:border-stone-700 cursor-default'
                                        : (activeChild.pet_food || 0) > 0
                                          ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white border-b-[5px] border-orange-700 hover:border-b-[3px] hover:translate-y-[2px] shadow-lg cursor-pointer'
                                          : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-2 border-stone-300 dark:border-stone-700 shadow-sm !opacity-100 cursor-not-allowed'
                                      }`}
                                  >
                                    {isFeeding ? (
                                      <>
                                        <FaBone className="text-3xl drop-shadow-sm mb-0.5 animate-bounce" />
                                        Chomp...
                                      </>
                                    ) : activeChild.pet_fed_today ? (
                                      <>
                                        <FaCircleCheck className="text-3xl drop-shadow-sm mb-0.5 text-green-500" />
                                        Fed
                                      </>
                                    ) : (
                                      <>
                                        <FaBone className="text-3xl drop-shadow-sm mb-0.5" />
                                        Feed
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>

                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Streak & Goals Grid */}
                      {(() => {
                        const now = new Date();

                        const todayLogicalDate = getLogicalDateString(now);
                        const todayCompletions = completions.filter(c =>
                          c.child_id === activeChild.id &&
                          c.status === 'approved' &&
                          getLogicalDateString(c.completed_at) === todayLogicalDate
                        );
                        const pointsEarnedToday = todayCompletions.reduce((acc, c) => acc + (c.points_awarded > 0 ? c.points_awarded : 0), 0);
                        const dailyTarget = parentProfile?.daily_points_target || 50;
                        const dailyPct = Math.min(100, Math.round((pointsEarnedToday / dailyTarget) * 100));

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
                              {/* Daily Goal Widget */}
                              <button
                                onClick={() => { playSound.click(); setExpandedGoal('daily'); }}
                                className="relative p-1.5 rounded-[1.75rem] transition-transform duration-200 flex shadow-lg overflow-hidden cursor-pointer hover:-translate-y-1 active:scale-[0.96] text-center w-full focus:outline-none"
                                style={{ background: 'repeating-linear-gradient(45deg, #fb923c, #fb923c 8px, #f97316 8px, #f97316 16px)' }}
                              >
                                <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[1.4rem] p-2.5 sm:p-3 flex flex-col items-center justify-center border-[3px] border-stone-900 shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)] overflow-hidden">
                                  <div className="absolute bottom-0 inset-x-0 w-full bg-orange-100/30 z-0">
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${dailyPct}%` }} className="bg-orange-200/50 absolute bottom-0 inset-x-0 w-full" />
                                  </div>
                                  <Zap className={`w-5 h-5 sm:w-7 sm:h-7 mb-1 relative z-10 ${dailyPct >= 100 ? 'text-emerald-500' : 'text-orange-500'}`} />
                                  <span className={`font-black text-sm sm:text-base relative z-10 ${dailyPct >= 100 ? 'text-emerald-600' : 'text-orange-600'}`}>{dailyPct}%</span>
                                  <span className="text-[8px] sm:text-[10px] font-sans font-bold text-stone-500 dark:text-stone-400 uppercase tracking-tighter mt-0.5 relative z-10">Daily</span>
                                </div>
                              </button>

                              {/* Weekly Widget */}
                              <button
                                onClick={() => { playSound.click(); setExpandedGoal('weekly'); }}
                                className="relative p-1.5 rounded-[1.75rem] transition-transform duration-200 flex shadow-lg overflow-hidden cursor-pointer hover:-translate-y-1 active:scale-[0.96] text-center w-full focus:outline-none"
                                style={{ background: 'repeating-linear-gradient(45deg, #22d3ee, #22d3ee 8px, #06b6d4 8px, #06b6d4 16px)' }}
                              >
                                <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[1.4rem] p-2.5 sm:p-3 flex flex-col items-center justify-center border-[3px] border-stone-900 shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)] overflow-hidden">
                                  <div className="absolute bottom-0 inset-x-0 w-full bg-cyan-100/30 z-0">
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${weeklyPct}%` }} className="bg-cyan-200/50 absolute bottom-0 inset-x-0 w-full" />
                                  </div>
                                  <Target className={`w-5 h-5 sm:w-7 sm:h-7 mb-1 relative z-10 ${weeklyPct >= 100 ? 'text-emerald-500' : 'text-cyan-500'}`} />
                                  <span className={`font-black text-sm sm:text-base relative z-10 ${weeklyPct >= 100 ? 'text-emerald-600' : 'text-cyan-600'}`}>{weeklyPct}%</span>
                                  <span className="text-[8px] sm:text-[10px] font-sans font-bold text-stone-500 dark:text-stone-400 uppercase tracking-tighter mt-0.5 relative z-10">Weekly</span>
                                </div>
                              </button>

                              {/* Monthly Widget */}
                              <button
                                onClick={() => { playSound.click(); setExpandedGoal('monthly'); }}
                                className="relative p-1.5 rounded-[1.75rem] transition-transform duration-200 flex shadow-lg overflow-hidden cursor-pointer hover:-translate-y-1 active:scale-[0.96] text-center w-full focus:outline-none"
                                style={{ background: 'repeating-linear-gradient(45deg, #c084fc, #c084fc 8px, #a855f7 8px, #a855f7 16px)' }}
                              >
                                <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[1.4rem] p-2.5 sm:p-3 flex flex-col items-center justify-center border-[3px] border-stone-900 shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)] overflow-hidden">
                                  <div className="absolute bottom-0 inset-x-0 w-full bg-purple-100/30 z-0">
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${monthlyPct}%` }} className="bg-purple-200/50 absolute bottom-0 inset-x-0 w-full" />
                                  </div>
                                  <Zap className={`w-5 h-5 sm:w-7 sm:h-7 mb-1 relative z-10 ${monthlyPct >= 100 ? 'text-emerald-500' : 'text-purple-500'}`} />
                                  <span className={`font-black text-sm sm:text-base relative z-10 ${monthlyPct >= 100 ? 'text-emerald-600' : 'text-purple-600'}`}>{monthlyPct}%</span>
                                  <span className="text-[8px] sm:text-[10px] font-sans font-bold text-stone-500 dark:text-stone-400 uppercase tracking-tighter mt-0.5 relative z-10">Monthly</span>
                                </div>
                              </button>
                            </div>

                            <AnimatePresence>
                              {expandedGoal && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 px-4 -mx-4 pb-6 -mb-6 pt-2 -mt-2 overflow-hidden"
                                >
                                  <div
                                    className="relative p-2 rounded-[2rem] shadow-xl overflow-hidden mt-2"
                                    style={{
                                      background: expandedGoal === 'daily' ? 'repeating-linear-gradient(45deg, #fb923c, #fb923c 10px, #f97316 10px, #f97316 20px, #ea580c 20px, #ea580c 30px)' :
                                        expandedGoal === 'weekly' ? 'repeating-linear-gradient(45deg, #06b6d4, #06b6d4 10px, #22d3ee 10px, #22d3ee 20px, #0891b2 20px, #0891b2 30px)' :
                                          'repeating-linear-gradient(45deg, #c084fc, #c084fc 10px, #a855f7 10px, #a855f7 20px, #9333ea 20px, #9333ea 30px)'
                                    }}
                                  >
                                    <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[1.6rem] p-5 flex flex-col gap-3 border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]">
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setExpandedGoal(null)}
                                        className="absolute top-4 right-4 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 z-20"
                                      >
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                      </Button>

                                      {expandedGoal === 'daily' && (
                                        <>
                                          <div className="flex justify-between items-center pr-14">
                                            <div>
                                              <Typography variant="h4" className="font-extrabold text-lg text-stone-900 dark:text-stone-50">Daily Goal</Typography>
                                              <Typography variant="body" className={`text-[10px] font-sans ${styles.textMuted}`}>Resets: Midnight</Typography>
                                            </div>
                                            {dailyPct >= 100 ? (
                                              <span className={`text-xs font-sans font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200`}>
                                                COMPLETED
                                              </span>
                                            ) : (parentProfile?.daily_reward_points && parentProfile.daily_reward_points > 0) ? (
                                              <span className={`text-xs font-sans font-bold px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200`}>
                                                {parentProfile.daily_reward_points} GOLD BONUS
                                              </span>
                                            ) : null}
                                          </div>
                                          <div className="mt-4">
                                            <div className="flex justify-between items-center mb-1.5">
                                              <span className="text-[14px] font-bold text-black dark:text-white tracking-tight">{pointsEarnedToday} / {dailyTarget} gold coins</span>
                                              <span className="text-[12px] font-semibold text-stone-500 dark:text-stone-400">{dailyPct}% COMPLETED</span>
                                            </div>
                                            <LinearProgressBar
                                              progress={dailyPct}
                                              heightClass="h-2"
                                              className="!bg-stone-200/60 border-none shadow-inner"
                                            />
                                          </div>
                                        </>
                                      )}

                                      {expandedGoal === 'weekly' && (
                                        <>
                                          <div className="flex justify-between items-center pr-14">
                                            <div>
                                              <Typography variant="h4" className="font-extrabold text-lg text-stone-900 dark:text-stone-50">Weekly Target</Typography>
                                              {nextWeekly && <Typography variant="body" className={`text-[10px] font-sans ${styles.textMuted}`}>Resets: {nextWeekly.toLocaleDateString()}</Typography>}
                                            </div>
                                            <span className={`text-xs font-sans font-bold px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200`}>
                                              {parentProfile?.weekly_reward_points || 200} GOLD BONUS
                                            </span>
                                          </div>
                                          <div className="mt-4">
                                            <div className="flex justify-between items-center mb-1.5">
                                              <span className="text-[14px] font-bold text-black dark:text-white tracking-tight">{dispWeeklyPts} / {(parentProfile?.weekly_points_target || 300)} gold coins</span>
                                              <span className="text-[12px] font-semibold text-stone-500 dark:text-stone-400">{weeklyPct}% COMPLETED</span>
                                            </div>
                                            <LinearProgressBar
                                              progress={weeklyPct}
                                              heightClass="h-2"
                                              className="!bg-stone-200/60 border-none shadow-inner"
                                            />
                                          </div>
                                        </>
                                      )}

                                      {expandedGoal === 'monthly' && (
                                        <>
                                          <div className="flex justify-between items-center pr-14">
                                            <div>
                                              <Typography variant="h4" className="font-extrabold text-lg text-stone-900 dark:text-stone-50">Monthly Target</Typography>
                                              {nextMonthly && <Typography variant="body" className={`text-[10px] font-sans ${styles.textMuted}`}>Resets: {nextMonthly.toLocaleDateString()}</Typography>}
                                            </div>
                                            <span className={`text-xs font-sans font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200`}>
                                              {parentProfile?.monthly_reward_points || 1000} GOLD BONUS
                                            </span>
                                          </div>
                                          <div className="mt-4">
                                            <div className="flex justify-between items-center mb-1.5">
                                              <span className="text-[14px] font-bold text-black dark:text-white tracking-tight">{dispMonthlyPts} / {(parentProfile?.monthly_points_target || 1000)} gold coins</span>
                                              <span className="text-[12px] font-semibold text-stone-500 dark:text-stone-400">{monthlyPct}% COMPLETED</span>
                                            </div>
                                            <LinearProgressBar
                                              progress={monthlyPct}
                                              heightClass="h-2"
                                              className="!bg-stone-200/60 border-none shadow-inner"
                                            />
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {showHelpModal && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className={`w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 bg-white dark:bg-stone-900 z-10 pb-4 pt-2 border-b border-stone-100 dark:border-stone-800 gap-4">
                            <div className="flex justify-between w-full sm:w-auto items-center">
                              <Typography variant="h2" className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-50">
                                How to Use the App
                              </Typography>
                              <Button variant="none" size="none" onClick={() => { playSound.click(); setShowHelpModal(false); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition-colors sm:hidden">
                                <X className="w-5 h-5" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-3">
                              <Button variant="secondary" onClick={() => { playSound.click(); setShowHelpModal(false); setActiveChildTab('home'); setTourStepIndex(0); setRunTour(true); }} className="flex items-center gap-2 shrink-0">
                                <PlayCircle className="w-4 h-4" />
                                Replay Child Tutorial
                              </Button>
                              <Button variant="none" size="none" onClick={() => { playSound.click(); setShowHelpModal(false); }} className="w-8 h-8 rounded-full hidden sm:flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition-colors">
                                <X className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-6 text-left pb-4">
                            <section>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                  <Gamepad2 className="w-5 h-5" />
                                </div>
                                <Typography variant="h3" className="text-lg font-bold text-stone-800 dark:text-stone-100">Welcome to your Dashboard</Typography>
                              </div>
                              <Typography variant="body" className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-4">
                                This is your space to see your progress, interact with your virtual pet, and earn rewards!
                              </Typography>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4 border border-stone-100 dark:border-stone-800">
                                  <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-2">Daily Quests (Tasks)</h4>
                                  <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2 list-disc pl-4">
                                    <li><strong>To-Do List:</strong> See daily tasks categorized by their Pots.</li>
                                    <li><strong>Completing Tasks:</strong> Tapping a task marks it as "Pending Approval." Once approved, coins rain down!</li>
                                  </ul>
                                </div>

                                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4 border border-stone-100 dark:border-stone-800">
                                  <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-2">Claiming Rewards</h4>
                                  <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2 list-disc pl-4">
                                    <li><strong>The Shop:</strong> Browse available rewards.</li>
                                    <li><strong>Redeeming:</strong> "Buy" a reward to deduct coins and send a request to your parent's inbox.</li>
                                  </ul>
                                </div>

                                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4 border border-stone-100 dark:border-stone-800 sm:col-span-2">
                                  <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-2">Pet Ecosystem & Leveling Up</h4>
                                  <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2 list-disc pl-4">
                                    <li><strong>Virtual Pet:</strong> You have a virtual companion (like the Emerald Dragon) to take care of.</li>
                                    <li><strong>Feeding & Maintenance:</strong> Completing tasks keeps your pet fed and happy. If neglected, the pet gets hungry!</li>
                                    <li><strong>Leveling Up:</strong> Earning gold coins fills up the XP bar. Reaching a new level triggers an exciting evolution sequence where your pet grows!</li>
                                  </ul>
                                </div>
                              </div>
                            </section>


                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Home Tab */}
                  {activeChildTab === 'home' && activeChild && (
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
                      onEnterParentMode={onEnterParentMode}
                    />
                  )}
                  {/* Tasks Tab */}
                  {activeChildTab === 'tasks' && activeChild && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      key="child-tasks-tab"
                      className="flex flex-col"
                    >
                      <div
                        className="relative p-[3px] rounded-2xl sm:rounded-3xl mb-3 sm:mb-4 shadow-sm"
                        style={{ background: 'repeating-linear-gradient(45deg, #38bdf8, #38bdf8 10px, #0ea5e9 10px, #0ea5e9 20px)' }}
                      >
                        <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 rounded-xl sm:rounded-[1.6rem] p-3 sm:p-4 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                          <div>
                            <Typography variant="h3" className="text-2xl font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">Daily Quests</Typography>
                            <Typography variant="body" className="text-[10px] sm:text-xs font-sans text-stone-500 dark:text-stone-400 px-1">Complete tasks to earn more gold coins!</Typography>
                          </div>
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
                          <div className={`joyride-target-first-task col-span-2 sm:col-span-3 md:col-span-4 p-10 text-center ${styles.cardBg} border-2 border-dashed border-stone-300 rounded-3xl space-y-3`}>
                            <span className="text-5xl block animate-bounce-slow"><FaWandMagicSparkles className="text-pink-500 mx-auto" /></span>
                            <Typography variant="h4" className={`font-extrabold ${styles.textColor} text-base`}>ALL QUESTS CRUSHED!</Typography>
                            <Typography variant="body" className={`text-xs ${styles.textMuted} max-w-xs mx-auto leading-relaxed`}>
                              You have conquered all assigned chores. Ask your parent to broadcast new missions!
                            </Typography>
                          </div>
                        ) : (
                          tasks.filter(t => {
                            if (t.child_id !== activeChild.id) return false;
                            if (t.recurrence === 'one_time') {
                              return !completions.some(c => c.task_id === t.id && c.child_id === activeChild.id && c.status === 'approved');
                            }
                            return true;
                          }).map((task, index) => {
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

                            const baseCardClasses = "relative p-2 rounded-3xl transition-transform duration-200 flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 hover:scale-105 shadow-xl overflow-hidden";
                            const taskBgStyle = {
                              background: 'repeating-linear-gradient(45deg, #38bdf8, #38bdf8 15px, #facc15 15px, #facc15 30px, #fb923c 30px, #fb923c 45px)',
                            };

                            const innerContentClasses = "relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[1.25rem] p-4 flex flex-col items-center gap-2 border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]";

                            const cardContent = (
                              <div className={innerContentClasses}>
                                <div className="absolute top-2 right-2 z-10">
                                  <catMeta.Icon className={`w-5 h-5 ${isApproved ? 'text-stone-300' : 'text-amber-400 drop-shadow-sm group-hover:scale-125 transition-transform'}`} />
                                </div>
                                <div className="mt-2 relative z-10">
                                  <CoinBadge points={task.points} disabled={isApproved} />
                                </div>
                                <div className="w-full relative z-10 mt-1">
                                  <Typography variant="h4" className={`font-black text-xs sm:text-sm font-display leading-tight uppercase tracking-wider ${isApproved ? 'text-stone-400' : 'text-stone-800 dark:text-stone-100'}`}>
                                    {task.title}
                                  </Typography>
                                  <div className="mt-2 flex items-center justify-center">
                                    {isApproved ? (
                                      <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-200">
                                        <FaCircleCheck className="w-3 h-3 mr-1" /> DONE
                                      </div>
                                    ) : isPending ? (
                                      <div className="inline-flex px-3 py-1 bg-stone-200 text-stone-600 dark:text-stone-300 text-xs font-black uppercase tracking-widest rounded-full">
                                        AWAITING
                                      </div>
                                    ) : isOnCooldown ? (
                                      <div className="inline-flex px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest rounded-full border border-amber-200">
                                        {cooldownTimeLeftStr}
                                      </div>
                                    ) : (
                                      <div className="inline-flex px-3 py-1 bg-stone-900 text-white text-xs font-black uppercase tracking-widest rounded-full">
                                        {recLabel}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );

                            return isCompletable ? (
                              <Button
                                variant="none"
                                size="none"
                                key={task.id}
                                onClick={() => handleTaskCheck(task.id, task.title)}
                                id={`claim-task-${task.id}`}
                                className={`${baseCardClasses} task-card ${index === 0 ? 'joyride-target-first-task' : ''}`}
                                style={taskBgStyle}
                              >
                                {cardContent}
                              </Button>
                            ) : (
                              <div
                                key={task.id}
                                className={`${baseCardClasses} shadow-md overflow-hidden opacity-60 grayscale task-card-disabled ${index === 0 ? 'joyride-target-first-task' : ''}`}
                                style={taskBgStyle}
                              >
                                {cardContent}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                  {/* Rewards Tab */}
                  {activeChildTab === 'rewards' && activeChild && (

                    /* PRIZE CABINET CONTENT */
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      key="child-rewards-tab"
                      className="space-y-4"
                    >
                      <div
                        className="relative p-[3px] rounded-2xl sm:rounded-3xl mb-4 shadow-sm"
                        style={{ background: 'repeating-linear-gradient(45deg, #c084fc, #c084fc 10px, #a855f7 10px, #a855f7 20px)' }}
                      >
                        <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 rounded-xl sm:rounded-[1.6rem] p-3 sm:p-4 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                          <div>
                            <Typography variant="h3" className="text-2xl font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">Reward Shop</Typography>
                            <Typography variant="body" className="text-[10px] sm:text-xs font-sans text-stone-500 dark:text-stone-400 px-1">Trade your gold coins for real-world prizes!</Typography>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4" id="child-rewards-deck">
                        {rewards.filter(r => r.child_id === activeChild.id).length === 0 ? (
                          <div className={`joyride-target-first-reward col-span-2 sm:col-span-3 md:col-span-4 p-10 text-center ${styles.cardBg} border-2 border-dashed border-stone-300 rounded-3xl space-y-2`}>
                            <span className="text-5xl block animate-bounce-slow"><FaGift className="text-purple-500 mx-auto" /></span>
                            <Typography variant="h4" className={`font-extrabold ${styles.textColor}`}>SHOP EMPTY</Typography>
                            <Typography variant="body" className={`text-xs ${styles.textMuted}`}>Ask your parents to unlock custom prizes for you!</Typography>
                          </div>
                        ) : (
                          rewards.filter(r => r.child_id === activeChild.id).map((rew, index) => {
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
                              statusBadge = <div className="inline-flex px-3 py-1 bg-stone-200 text-stone-600 dark:text-stone-300 text-xs font-black uppercase tracking-widest rounded-full">PENDING</div>;
                            } else if (!availability.available && !isSavingFor) {
                              statusBadge = <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 truncate px-2">{availability.reason}</span>;
                            } else if (isSavingsUnlocked) {
                              if (isSavingFor) {
                                statusBadge = (
                                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-full border border-emerald-200">
                                    <CheckCircle className="w-3 h-3" /> SAVING
                                  </div>
                                );
                              } else {
                                statusBadge = (
                                  <Button
                                    variant="none"
                                    size="none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSavingsGoal(activeChild.id, rew.id);
                                      playSound.success();
                                    }}
                                    className="inline-flex px-3 py-1 bg-stone-900 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-stone-700 transition-colors"
                                  >
                                    SET GOAL
                                  </Button>
                                );
                              }
                            }

                            const baseCardClasses = "relative p-2 rounded-3xl transition-transform duration-200 flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 hover:scale-105 shadow-xl overflow-hidden";
                            const rewardBgStyle = {
                              background: 'repeating-linear-gradient(-45deg, #f472b6, #f472b6 15px, #34d399 15px, #34d399 30px, #818cf8 30px, #818cf8 45px)',
                            };

                            const innerContentClasses = "relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[1.25rem] p-4 flex flex-col items-center gap-2 border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]";

                            const cardContent = (
                              <div className={innerContentClasses}>
                                <div className="absolute top-2 right-2 z-10">
                                  <Gift className={`w-5 h-5 ${(canDispense || isSavingFor) ? 'text-pink-400 drop-shadow-sm group-hover:scale-125 transition-transform' : 'text-stone-300'}`} />
                                </div>
                                <div className="mt-2 relative z-10">
                                  <CoinBadge points={rew.cost_points} />
                                </div>
                                <div className="w-full relative z-10 mt-1">
                                  <Typography variant="h4" className={`font-black text-xs sm:text-sm font-display leading-tight uppercase tracking-wider ${(canDispense || isSavingFor) ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'}`}>
                                    {rew.title}
                                  </Typography>
                                  <div className="mt-2 flex items-center justify-center">
                                    {statusBadge}
                                  </div>
                                </div>
                              </div>
                            );

                            return canDispense ? (
                              <Button
                                variant="none"
                                size="none"
                                key={rew.id}
                                onClick={() => isSavingFor
                                  ? handleClaimReward(rew.id, rew.cost_points, 'savings')
                                  : handleClaimReward(rew.id, rew.cost_points)
                                }
                                id={`claim-reward-${rew.id}`}
                                className={`${baseCardClasses} reward-card ${index === 0 ? 'joyride-target-first-reward' : ''}`}
                                style={rewardBgStyle}
                              >
                                {cardContent}
                              </Button>
                            ) : (
                              <div key={rew.id} className={isSavingFor ? `${baseCardClasses} reward-card-saving ${index === 0 ? 'joyride-target-first-reward' : ''}` : `relative p-2 rounded-3xl transition-transform duration-200 flex flex-col items-center justify-center text-center shadow-md overflow-hidden opacity-60 grayscale reward-card-disabled ${index === 0 ? 'joyride-target-first-reward' : ''}`} style={rewardBgStyle}>
                                {cardContent}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                  {/* Pots Tab */}
                  {activeChildTab === 'pots' && activeChild && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      key="child-pots-tab"
                      className="space-y-4"
                    >
                      <div
                        className="relative p-[3px] rounded-2xl sm:rounded-3xl mb-4 shadow-sm"
                        style={{ background: 'repeating-linear-gradient(45deg, #10b981, #10b981 10px, #059669 10px, #059669 20px)' }}
                      >
                        <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 rounded-xl sm:rounded-[1.6rem] p-3 sm:p-4 text-left shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                          <Typography variant="h3" className="text-2xl font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">Pots</Typography>
                          <Typography variant="body" className="text-[10px] sm:text-xs font-sans text-stone-500 dark:text-stone-400 px-1">Manage your savings, food and gifting pots!</Typography>
                        </div>
                      </div>

                      <style>{`
                            .pot-flip-inner {
                              transition: transform 0.6s;
                              transform-style: preserve-3d;
                            }
                            .pot-flip-card.flipped .pot-flip-inner {
                              transform: rotateY(180deg);
                            }
                            .pot-flip-front, .pot-flip-back {
                              backface-visibility: hidden;
                              -webkit-backface-visibility: hidden;
                            }
                            .pot-flip-front {
                              transform: rotateY(0deg);
                            }
                            .pot-flip-back {
                              transform: rotateY(180deg);
                            }
                          `}</style>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-start">

                        {/* === MAIN GOLD POT SECTION === */}
                        <div className={`joyride-target-pot-gold relative h-[210px] pot-flip-card cursor-pointer group ${flippedPot === 'gold' ? 'flipped' : ''}`} style={{ perspective: '1000px' }} onClick={() => setFlippedPot(flippedPot === 'gold' ? null : 'gold')}>
                          <div className="relative w-full h-full pot-flip-inner">

                            {/* Front Side */}
                            <div className="absolute inset-0 p-2 rounded-[2.5rem] flex flex-col shadow-xl pot-flip-front" style={{ background: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #f59e0b 10px, #f59e0b 20px, #d97706 20px, #d97706 30px)' }}>
                              <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[2rem] p-4 sm:p-5 flex flex-col border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left group-hover:scale-[1.02] transition-transform duration-300">
                                <div className="flex justify-between items-start mb-4">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${activeChild.gold_pot_broken ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'}`}>
                                    {activeChild.gold_pot_broken ? <FaTriangleExclamation className="w-6 h-6" /> : <FaJar className="w-6 h-6" />}
                                  </div>
                                  <CoinBadge points={activeChild.points || 0} size="sm" />
                                </div>
                                <div>
                                  <div className={`text-xs font-black uppercase tracking-widest mb-1 ${activeChild.gold_pot_broken ? 'text-red-500' : 'text-amber-500'}`}>Main Pot</div>
                                  <Typography variant="h3" className="text-2xl font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">Gold Pot</Typography>
                                </div>
                                <div className="mt-auto flex justify-center">
                                  <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                                    <span>Tap to Flip</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Back Side */}
                            <div className="absolute inset-0 p-2 rounded-[2.5rem] flex flex-col shadow-xl pot-flip-back" style={{ background: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #f59e0b 10px, #f59e0b 20px, #d97706 20px, #d97706 30px)' }}>
                              <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[2rem] p-4 flex flex-col justify-between border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left">
                                <div>
                                  <Typography variant="body" className="text-base text-stone-500 dark:text-stone-400 leading-snug">
                                    This is where you keep your gold coins! Use them to get rewards, save up, or feed your pets.
                                  </Typography>
                                </div>
                                <div className="w-full flex flex-col gap-1.5 mt-2">
                                  <Button
                                    variant="none"
                                    size="none"
                                    onClick={(e) => { e.stopPropagation(); setShowAppIntroVideo(true); }}
                                    className={`flex items-center justify-center gap-1 w-full py-2.5 rounded-xl text-base font-bold uppercase transition-colors border ${activeChild.gold_pot_broken ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}
                                  >
                                    <Play className="w-4 h-4" fill="currentColor" /> Play Video
                                  </Button>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* === SAVINGS POT SECTION === */}

                        {/* Savings Pot Unlocked Card */}
                        {isSavingsUnlocked && activeChild.savings_unlock_seen && (
                          <div className={`joyride-target-pot-savings relative h-[210px] pot-flip-card cursor-pointer group ${flippedPot === 'savings' ? 'flipped' : ''}`} style={{ perspective: '1000px' }} onClick={() => setFlippedPot(flippedPot === 'savings' ? null : 'savings')}>
                            <div className="relative w-full h-full pot-flip-inner">

                              {/* Front Side */}
                              <div className="absolute inset-0 p-2 rounded-[2.5rem] flex flex-col shadow-xl pot-flip-front" style={{ background: 'repeating-linear-gradient(-45deg, #34d399, #34d399 10px, #10b981 10px, #10b981 20px, #059669 20px, #059669 30px)' }}>
                                <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[2rem] p-4 sm:p-5 flex flex-col border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left group-hover:scale-[1.02] transition-transform duration-300">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-500">
                                      <PiggyBank className="w-6 h-6" />
                                    </div>
                                    <CoinBadge points={activeChild.savings_pot || 0} size="sm" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-1">Savings Pot</div>
                                    <Typography variant="h3" className="text-2xl font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">Savings</Typography>
                                  </div>
                                  <div className="mt-auto flex justify-center">
                                    <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                                      <span>Tap to Flip</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Back Side */}
                              <div className="absolute inset-0 p-2 rounded-[2.5rem] flex flex-col shadow-xl pot-flip-back" style={{ background: 'repeating-linear-gradient(-45deg, #34d399, #34d399 10px, #10b981 10px, #10b981 20px, #059669 20px, #059669 30px)' }}>
                                <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[2rem] p-4 flex flex-col border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left overflow-y-auto no-scrollbar">

                                  {!showDepositModal && !showWithdrawConfirm && (
                                    <div className="flex flex-col h-full">
                                      {activeChild.savings_goal_name ? (
                                        <div className="mb-2">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-emerald-850 dark:text-emerald-400">Goal: {activeChild.savings_goal_name}</span>
                                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-stone-800 px-1.5 py-0.5 rounded-md">
                                              {activeChild.savings_pot || 0}/{activeChild.savings_goal_amount}
                                            </span>
                                          </div>
                                          <LinearProgressBar
                                            progress={Math.round(((activeChild.savings_pot || 0) / (activeChild.savings_goal_amount || 1)) * 100)}
                                            className="bg-stone-100 dark:bg-stone-800 border-emerald-200 h-2"
                                          />
                                          {(activeChild.savings_pot || 0) >= (activeChild.savings_goal_amount || 0) && activeChild.savings_goal_reward_id && (
                                            <Button
                                              variant="primary"
                                              size="none"
                                              className="w-full mt-2 py-1.5 text-[10px]"
                                              onClick={(e) => { e.stopPropagation(); handleClaimReward(activeChild.savings_goal_reward_id!, activeChild.savings_goal_amount!, 'savings'); }}
                                              leftIcon={<FaWandMagicSparkles className="w-3 h-3" />}
                                            >
                                              CLAIM GOAL!
                                            </Button>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="mb-2">
                                          <Typography variant="body" className="text-sm text-stone-500 dark:text-stone-400 leading-snug">
                                            Keep your gold coins safe here! You can't spend them until you take them out.
                                          </Typography>
                                        </div>
                                      )}

                                      <div className="mt-auto flex flex-col gap-1.5">
                                        <div className="flex gap-1.5">
                                          <Button variant="none" size="none"
                                            onClick={(e) => { e.stopPropagation(); setShowDepositModal(true); setDepositAmount(Math.min(5, activeChild.points)); playSound.click(); }}
                                            disabled={activeChild.points <= 0}
                                            className="flex-1 flex items-center justify-center gap-1 bg-[#FDF6CD] text-amber-900 py-2 rounded-xl font-bold text-sm border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
                                          >
                                            <FaCoins className="w-3 h-3" /> Deposit
                                          </Button>
                                          <Button variant="none" size="none"
                                            onClick={(e) => { e.stopPropagation(); setShowWithdrawConfirm(true); playSound.click(); }}
                                            disabled={(activeChild.savings_pot || 0) <= 0}
                                            className="flex-1 bg-stone-50 dark:bg-stone-950 text-stone-600 dark:text-stone-300 py-2 rounded-xl font-bold text-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 disabled:opacity-50"
                                          >
                                            Withdraw
                                          </Button>
                                        </div>
                                        <Button
                                          variant="none"
                                          size="none"
                                          onClick={(e) => { e.stopPropagation(); setShowReplayVideo(true); }}
                                          className="flex items-center justify-center gap-1 bg-emerald-100 text-emerald-700 w-full py-2 rounded-xl font-bold text-sm hover:bg-emerald-200 transition-colors"
                                        >
                                          <Play className="w-3 h-3" fill="currentColor" /> Play Video
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Inline Deposit Modal (Replaces content when active) */}
                                  {showDepositModal && (
                                    <div className="flex flex-col h-full justify-center" onClick={(e) => e.stopPropagation()}>
                                      <label className="text-xs font-bold text-emerald-800 dark:text-emerald-400 block text-center mb-2">Deposit how many coins?</label>
                                      <div className="flex items-center justify-center gap-3 py-2">
                                        <Button variant="none" size="none"
                                          onClick={() => { setDepositAmount(Math.max(1, depositAmount - 5)); playSound.click(); }}
                                          disabled={depositAmount <= 1}
                                          className="w-8 h-8 rounded-full bg-emerald-205 text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                        >
                                          <Minus className="w-4 h-4" />
                                        </Button>

                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-yellow-200 shadow-[0_4px_10px_rgba(245,158,11,0.4)]">
                                          <Typography variant="number" className="text-lg">{depositAmount}</Typography>
                                        </div>

                                        <Button variant="none" size="none"
                                          onClick={() => { setDepositAmount(Math.min(activeChild.points, depositAmount + 5)); playSound.click(); }}
                                          disabled={depositAmount >= activeChild.points}
                                          className="w-8 h-8 rounded-full bg-emerald-205 text-emerald-755 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.96] transition-[background-color,transform]"
                                        >
                                          <Plus className="w-4 h-4" />
                                        </Button>
                                      </div>
                                      <div className="flex gap-2 mt-auto">
                                        <Button variant="ghost" size="none" className="flex-1 py-2 text-xs" onClick={() => { setShowDepositModal(false); playSound.click(); }}>
                                          Cancel
                                        </Button>
                                        <Button variant="primary" size="none" className="flex-1 py-2 text-xs" disabled={depositAmount <= 0 || depositAmount > activeChild.points}
                                          onClick={() => {
                                            if (depositAmount > 0 && depositAmount <= activeChild.points) {
                                              onSavingsDeposit(activeChild.id, depositAmount);
                                              setShowDepositModal(false);
                                              playSound.purchase();
                                            }
                                          }}>
                                          Confirm
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Inline Withdraw Modal */}
                                  {showWithdrawConfirm && (
                                    <div className="flex flex-col h-full justify-center" onClick={(e) => e.stopPropagation()}>
                                      <Typography variant="body" className="text-xs font-bold text-rose-800 dark:text-rose-400 text-center mb-4">
                                        Are you sure you want to withdraw all {activeChild.savings_pot} coins back to your pocket?
                                      </Typography>
                                      <div className="flex flex-col gap-2 mt-auto">
                                        <Button variant="danger" size="none" className="w-full py-2 text-xs"
                                          onClick={() => {
                                            onSavingsWithdraw(activeChild.id);
                                            setShowWithdrawConfirm(false);
                                            playSound.purchase();
                                          }}>
                                          Yes, Withdraw
                                        </Button>
                                        <Button variant="ghost" size="none" className="w-full py-2 text-xs" onClick={() => { setShowWithdrawConfirm(false); playSound.click(); }}>
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Savings Pot Locked Preview (Level 1 only, before unlock) */}
                        {!isSavingsUnlocked && activeChild.level < (parentProfile?.savings_pot_unlock_level ?? 2) && (
                          <div
                            className="joyride-target-pot-savings relative p-2 rounded-[2.5rem] flex flex-col shadow-xl overflow-hidden h-full grayscale opacity-70"
                            style={{ background: 'repeating-linear-gradient(45deg, #e7e5e4, #e7e5e4 10px, #d6d3d1 10px, #d6d3d1 20px)' }}
                          >
                            <div className="relative z-10 w-full h-full bg-stone-50 dark:bg-stone-950 rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2 text-stone-500 dark:text-stone-400">
                              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
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
                              <span className="text-[10px] font-sans text-stone-400 font-bold">
                                {(() => {
                                  const goldReq = ((parentProfile?.savings_pot_unlock_level ?? 2) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return `${(activeChild.lifetime_points || 0)} / ${goldReq} GOLD`;
                                })()}
                              </span>
                            </div>
                          </div>
                        )}                          {/* === FOOD POT SECTION === */}

                        {/* Food Pot Unlocked Card */}
                        {isFoodPotUnlocked && activeChild.food_pot_unlock_seen && (
                          <div className={`joyride-target-pot-food relative h-[210px] pot-flip-card cursor-pointer group ${flippedPot === 'food' ? 'flipped' : ''}`} style={{ perspective: '1000px' }} onClick={() => setFlippedPot(flippedPot === 'food' ? null : 'food')}>
                            <div className="relative w-full h-full pot-flip-inner">

                              {/* Front Side */}
                              <div className="absolute inset-0 p-2 rounded-[2.5rem] flex flex-col shadow-xl pot-flip-front" style={{ background: 'repeating-linear-gradient(45deg, #fb923c, #fb923c 10px, #f97316 10px, #f97316 20px, #ea580c 20px, #ea580c 30px)' }}>
                                <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[2rem] p-4 sm:p-5 flex flex-col border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left group-hover:scale-[1.02] transition-transform duration-300">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500">
                                      <Utensils className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl">
                                      <FaBone className="w-4 h-4 text-orange-500" />
                                      <Typography variant="number">{activeChild.pet_food || 0}</Typography>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-orange-500 mb-1">Food Pot</div>
                                    <Typography variant="h3" className="text-2xl font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">Food</Typography>
                                  </div>
                                  <div className="mt-auto flex justify-center">
                                    <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                                      <span>Tap to Flip</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Back Side */}
                              <div className="absolute inset-0 p-2 rounded-[2.5rem] flex flex-col shadow-xl pot-flip-back" style={{ background: 'repeating-linear-gradient(45deg, #fb923c, #fb923c 10px, #f97316 10px, #f97316 20px, #ea580c 20px, #ea580c 30px)' }}>
                                <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[2rem] p-4 flex flex-col border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left overflow-y-auto no-scrollbar">
                                  <div className="flex flex-col h-full justify-between">
                                    <div>
                                      {/* Weekly Contribution Progress */}
                                      <div className="mb-2">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-xs font-bold text-orange-850 dark:text-orange-400">Weekly Goal</span>
                                          <span className="text-xs font-black text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-stone-800 px-1.5 py-0.5 rounded-md">
                                            {activeChild.food_pot_weekly_contribution || 0}/7
                                          </span>
                                        </div>
                                        <LinearProgressBar
                                          progress={Math.round(((activeChild.food_pot_weekly_contribution || 0) / 7) * 100)}
                                          className="bg-stone-100 dark:bg-stone-800 border-orange-200 h-2"
                                        />
                                        <span className={`text-[10px] font-sans ${styles.textMuted} mt-1.5 block`}>
                                          {activeChild.food_pot_weekly_contribution >= 7
                                            ? <span><FaCircleCheck className="inline-block mr-1 text-green-500" /> Goal met!</span>
                                            : <span>Need {7 - (activeChild.food_pot_weekly_contribution || 0)} more coins.</span>
                                          }
                                        </span>
                                      </div>

                                      <Typography variant="body" className={`text-sm ${styles.textMuted} leading-snug mb-2`}>
                                        Put coins here to feed your pet! Use them to buy yummy food.
                                      </Typography>
                                    </div>

                                    <div className="flex flex-col gap-1.5 mt-auto">
                                      <div className="flex gap-1.5">
                                        <Button variant="none" size="none"
                                          onClick={(e) => { e.stopPropagation(); onBuyPetFood(activeChild.id); playSound.purchase(); }}
                                          disabled={(activeChild.points || 0) < 1}
                                          className="flex-1 flex items-center justify-center gap-1 bg-orange-50 text-orange-700 py-2 rounded-xl font-bold text-sm border border-orange-200 hover:bg-orange-100 transition-colors disabled:opacity-50"
                                        >
                                          <FaBone className="w-3 h-3" /> Buy (1g)
                                        </Button>
                                        <Button variant="none" size="none"
                                          onClick={(e) => { e.stopPropagation(); onSellPetFood(activeChild.id); playSound.purchase(); }}
                                          disabled={(activeChild.pet_food || 0) < 1}
                                          className="flex-1 bg-stone-50 dark:bg-stone-950 text-stone-600 dark:text-stone-300 py-2 rounded-xl font-bold text-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 disabled:opacity-50"
                                        >
                                          Sell (+1g)
                                        </Button>
                                      </div>
                                      <Button
                                        variant="none"
                                        size="none"
                                        onClick={(e) => { e.stopPropagation(); setShowFoodReplayVideo(true); }}
                                        className="flex items-center justify-center gap-1 bg-orange-100 text-orange-700 w-full py-2 rounded-xl font-bold text-sm hover:bg-orange-200 transition-colors"
                                      >
                                        <Play className="w-3 h-3" fill="currentColor" /> Play Video
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Food Pot Locked Preview */}
                        {!isFoodPotUnlocked && activeChild.level < (parentProfile?.food_pot_unlock_level ?? 4) && (
                          <div
                            className="joyride-target-pot-food relative p-2 rounded-[2.5rem] flex flex-col shadow-xl overflow-hidden h-full grayscale opacity-70"
                            style={{ background: 'repeating-linear-gradient(45deg, #e7e5e4, #e7e5e4 10px, #d6d3d1 10px, #d6d3d1 20px)' }}
                          >
                            <div className="relative z-10 w-full h-full bg-stone-50 dark:bg-stone-950 rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2 text-stone-500 dark:text-stone-400">
                              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
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
                              <span className="text-[10px] font-sans text-stone-400 font-bold">
                                {(() => {
                                  const goldReq = ((parentProfile?.food_pot_unlock_level ?? 4) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return `${(activeChild.lifetime_points || 0)} / ${goldReq} GOLD`;
                                })()}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* === GIFTING POT SECTION === */}

                        {/* Gifting Pot Unlocked Card */}
                        {isGiftingUnlocked && activeChild.gifting_unlock_seen && (
                          <div className={`joyride-target-pot-gifting relative h-[210px] pot-flip-card cursor-pointer group ${flippedPot === 'gifting' ? 'flipped' : ''}`} style={{ perspective: '1000px' }} onClick={() => setFlippedPot(flippedPot === 'gifting' ? null : 'gifting')}>
                            <div className="relative w-full h-full pot-flip-inner">

                              {/* Front Side */}
                              <div className="absolute inset-0 p-2 rounded-[2.5rem] flex flex-col shadow-xl pot-flip-front" style={{ background: 'repeating-linear-gradient(-45deg, #fb7185, #fb7185 10px, #f43f5e 10px, #f43f5e 20px, #e11d48 20px, #e11d48 30px)' }}>
                                <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[2rem] p-4 sm:p-5 flex flex-col border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left group-hover:scale-[1.02] transition-transform duration-300">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500">
                                      <Gift className="w-6 h-6" />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-rose-500 mb-1">Gifting Pot</div>
                                    <Typography variant="h3" className="text-2xl font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">Gifting</Typography>
                                  </div>
                                  <div className="mt-auto flex justify-center">
                                    <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                                      <span>Tap to Flip</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Back Side */}
                              <div className="absolute inset-0 p-2 rounded-[2.5rem] flex flex-col shadow-xl pot-flip-back" style={{ background: 'repeating-linear-gradient(-45deg, #fb7185, #fb7185 10px, #f43f5e 10px, #f43f5e 20px, #e11d48 20px, #e11d48 30px)' }}>
                                <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[2rem] p-4 flex flex-col border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left overflow-y-auto no-scrollbar">

                                  {!showCharityModal && !showSiblingModal && (
                                    <div className="flex flex-col h-full">
                                      <Typography variant="body" className={`text-sm ${styles.textMuted} mb-2 leading-snug`}>
                                        Share your coins to help others or give a gift to your sibling! It feels good to give.
                                      </Typography>

                                      {/* Gifting Reminder */}
                                      {(() => {
                                        const lastGiftingDate = activeChild.last_gifting_date ? new Date(activeChild.last_gifting_date) : null;
                                        const daysSinceGifting = lastGiftingDate ? Math.floor((new Date().getTime() - lastGiftingDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
                                        if (daysSinceGifting > 14) {
                                          return (
                                            <div className="mb-2 p-1.5 bg-rose-50 dark:bg-stone-800 border border-rose-200 dark:border-stone-700 rounded-lg flex items-center gap-1.5">
                                              <span className="text-rose-500"><FaHeart className="w-3 h-3" /></span>
                                              <Typography variant="body" className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider leading-tight">
                                                You haven't given a gift in a while!
                                              </Typography>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}

                                      <div className="mt-auto flex flex-col gap-1.5">
                                        <div className="flex gap-1.5">
                                          <Button variant="none" size="none"
                                            onClick={(e) => { e.stopPropagation(); setShowCharityModal(true); setCharityAmount(Math.min(5, activeChild.points || 0)); setSelectedCharityId('CH-WILDLIFE'); playSound.click(); }}
                                            disabled={activeChild.points <= 0}
                                            className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 py-2 rounded-xl font-bold text-sm border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                          >
                                            <FaGlobe className="w-3 h-3" /> Charity
                                          </Button>
                                          <Button variant="none" size="none"
                                            onClick={(e) => { e.stopPropagation(); setShowSiblingModal(true); setSiblingAmount(Math.min(5, activeChild.points || 0)); setSelectedSiblingId(children.filter(c => c.id !== activeChild.id)[0]?.id || ''); playSound.click(); }}
                                            disabled={activeChild.points <= 0 || children.length <= 1}
                                            className="flex-1 flex items-center justify-center gap-1 bg-pink-50 text-pink-700 py-2 rounded-xl font-bold text-sm border border-pink-200 hover:bg-pink-100 transition-colors disabled:opacity-50"
                                          >
                                            <FaGift className="w-3 h-3" /> Sibling
                                          </Button>
                                        </div>
                                        <Button
                                          variant="none"
                                          size="none"
                                          onClick={(e) => { e.stopPropagation(); setShowGiftingReplayVideo(true); }}
                                          className="flex items-center justify-center gap-1 bg-rose-100 text-rose-700 w-full py-2 rounded-xl font-bold text-sm hover:bg-rose-200 transition-colors"
                                        >
                                          <Play className="w-3 h-3" fill="currentColor" /> Play Video
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Inline Charity Modal */}
                                  {showCharityModal && (
                                    <div className="flex flex-col h-full justify-center" onClick={(e) => e.stopPropagation()}>
                                      <label className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 block text-center mb-1">Donate to Charity (requires parent approval)</label>
                                      <Select
                                        value={selectedCharityId}
                                        onChange={(e) => setSelectedCharityId(e.target.value)}
                                        className="text-xs py-1"
                                      >
                                        <option value="CH-WILDLIFE">Global Wildlife Fund</option>
                                        <option value="CH-OCEAN">Save the Oceans</option>
                                        <option value="CH-CHILDREN">Kids Education Charity</option>
                                      </Select>
                                      <div className="flex items-center justify-center gap-2 py-1.5">
                                        <Button variant="none" size="none"
                                          onClick={() => { setCharityAmount(Math.max(1, charityAmount - 1)); playSound.click(); }}
                                          disabled={charityAmount <= 1}
                                          className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 transition-colors"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </Button>
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-yellow-200 shadow-sm">
                                          <Typography variant="number" className="text-sm">{charityAmount}</Typography>
                                        </div>
                                        <Button variant="none" size="none"
                                          onClick={() => { setCharityAmount(Math.min((activeChild.points || 0), charityAmount + 1)); playSound.click(); }}
                                          disabled={charityAmount >= (activeChild.points || 0)}
                                          className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 transition-colors"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div className="flex gap-2 mt-auto">
                                        <Button variant="ghost" size="none" className="flex-1 py-1.5 text-xs" onClick={() => { setShowCharityModal(false); playSound.click(); }}>
                                          Cancel
                                        </Button>
                                        <Button variant="primary" size="none" className="flex-1 py-1.5 text-xs" disabled={charityAmount <= 0 || charityAmount > (activeChild.points || 0) || !selectedCharityId}
                                          onClick={() => {
                                            if (charityAmount > 0 && charityAmount <= (activeChild.points || 0) && selectedCharityId) {
                                              onGiftingRequestCharity(activeChild.id, charityAmount, selectedCharityId);
                                              setShowCharityModal(false);
                                              playSound.success();
                                            }
                                          }}>
                                          Donate
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Inline Sibling Modal */}
                                  {showSiblingModal && (
                                    <div className="flex flex-col h-full justify-center" onClick={(e) => e.stopPropagation()}>
                                      <label className="text-[10px] font-bold text-pink-800 dark:text-pink-400 block text-center mb-1">Gift to Sibling (requires parent approval)</label>
                                      <Select
                                        value={selectedSiblingId}
                                        onChange={(e) => setSelectedSiblingId(e.target.value)}
                                        className="text-xs py-1"
                                      >
                                        {children.filter(c => c.id !== activeChild.id).map(c => (
                                          <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                      </Select>
                                      <div className="flex items-center justify-center gap-2 py-1.5">
                                        <Button variant="none" size="none"
                                          onClick={() => { setSiblingAmount(Math.max(1, siblingAmount - 1)); playSound.click(); }}
                                          disabled={siblingAmount <= 1}
                                          className="w-6 h-6 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center cursor-pointer hover:bg-pink-300 disabled:opacity-50 transition-colors"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </Button>
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-yellow-200 shadow-sm">
                                          <Typography variant="number" className="text-sm">{siblingAmount}</Typography>
                                        </div>
                                        <Button variant="none" size="none"
                                          onClick={() => { setSiblingAmount(Math.min((activeChild.points || 0), siblingAmount + 1)); playSound.click(); }}
                                          disabled={siblingAmount >= (activeChild.points || 0)}
                                          className="w-6 h-6 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center cursor-pointer hover:bg-pink-300 disabled:opacity-50 transition-colors"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div className="flex gap-2 mt-auto">
                                        <Button variant="ghost" size="none" className="flex-1 py-1.5 text-xs" onClick={() => { setShowSiblingModal(false); playSound.click(); }}>
                                          Cancel
                                        </Button>
                                        <Button variant="primary" size="none" className="flex-1 py-1.5 text-xs" disabled={siblingAmount <= 0 || siblingAmount > (activeChild.points || 0) || !selectedSiblingId}
                                          onClick={() => {
                                            if (siblingAmount > 0 && siblingAmount <= (activeChild.points || 0) && selectedSiblingId) {
                                              onGiftingRequestSibling(activeChild.id, siblingAmount, selectedSiblingId);
                                              setShowSiblingModal(false);
                                              playSound.success();
                                            }
                                          }}>
                                          Gift
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Gifting Pot Locked Preview */}
                        {!isGiftingUnlocked && activeChild.level < (parentProfile?.gifting_pot_unlock_level ?? 6) && (
                          <div
                            className="joyride-target-pot-gifting relative p-2 rounded-[2.5rem] flex flex-col shadow-xl overflow-hidden h-full grayscale opacity-70"
                            style={{ background: 'repeating-linear-gradient(45deg, #e7e5e4, #e7e5e4 10px, #d6d3d1 10px, #d6d3d1 20px)' }}
                          >
                            <div className="relative z-10 w-full h-full bg-stone-50 dark:bg-stone-950 rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2 text-stone-500 dark:text-stone-400">
                              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
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
                              <span className="text-[10px] font-sans text-stone-400 font-bold">
                                {(() => {
                                  const goldReq = ((parentProfile?.gifting_pot_unlock_level ?? 6) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return `${(activeChild.lifetime_points || 0)} / ${goldReq} GOLD`;
                                })()}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* === GOLD POT MAINTENANCE SECTION === */}
                        {isGoldPotMaintenanceUnlocked && activeChild.gold_pot_maintenance_unlock_seen && (
                          <div className={`joyride-target-pot-maintenance relative h-[210px] pot-flip-card cursor-pointer group ${flippedPot === 'maintenance' ? 'flipped' : ''}`} style={{ perspective: '1000px' }} onClick={() => setFlippedPot(flippedPot === 'maintenance' ? null : 'maintenance')}>
                            <div className="relative w-full h-full pot-flip-inner">

                              {/* Front Side */}
                              <div className="absolute inset-0 p-2 rounded-[2.5rem] flex flex-col shadow-xl pot-flip-front" style={{ background: 'repeating-linear-gradient(45deg, #94a3b8, #94a3b8 10px, #64748b 10px, #64748b 20px, #475569 20px, #475569 30px)' }}>
                                <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[2rem] p-4 sm:p-5 flex flex-col border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left group-hover:scale-[1.02] transition-transform duration-300">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeChild.gold_pot_broken ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'}`}>
                                      <FaWrench className="w-6 h-6" />
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${activeChild.gold_pot_broken ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                      {activeChild.gold_pot_broken ? 'NEEDS REPAIR' : 'SAFE'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className={`text-xs font-black uppercase tracking-widest mb-1 ${activeChild.gold_pot_broken ? 'text-red-500' : 'text-amber-500'}`}>Gold Pot</div>
                                    <Typography variant="h3" className="text-2xl font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">Maintenance</Typography>
                                  </div>
                                  <div className="mt-auto flex justify-center">
                                    <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                                      <span>Tap to Flip</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Back Side */}
                              <div className="absolute inset-0 p-2 rounded-[2.5rem] flex flex-col shadow-xl pot-flip-back" style={{ background: 'repeating-linear-gradient(45deg, #94a3b8, #94a3b8 10px, #64748b 10px, #64748b 20px, #475569 20px, #475569 30px)' }}>
                                <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[2rem] p-4 flex flex-col border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left overflow-y-auto no-scrollbar">
                                  <div className="flex flex-col h-full justify-between">
                                    <div>
                                      <Typography variant="body" className={`text-sm font-bold leading-snug mb-3 ${activeChild.gold_pot_broken ? 'text-red-800 dark:text-red-400' : 'text-stone-500 dark:text-stone-400'}`}>
                                        Oh no! Sometimes your pot cracks and loses coins. Fix it quick!
                                      </Typography>

                                      {/* Status Info */}
                                      <div className={`grid grid-cols-2 gap-2 bg-stone-50 dark:bg-stone-950 rounded-xl p-2 mb-2 border ${activeChild.gold_pot_broken ? 'border-red-200 bg-red-50' : 'border-stone-200 dark:border-stone-700'}`}>
                                        <div className="text-center">
                                          <div className={`text-[10px] font-black ${activeChild.gold_pot_broken ? 'text-red-900/60' : 'text-stone-400'} uppercase tracking-widest mb-0.5`}>Last Fixed</div>
                                          <div className={`text-sm font-bold ${activeChild.gold_pot_broken ? 'text-red-900' : 'text-stone-700 dark:text-stone-200'}`}>
                                            {activeChild.gold_pot_last_fix_date ? new Date(activeChild.gold_pot_last_fix_date).toLocaleDateString() : 'Never'}
                                          </div>
                                        </div>
                                        <div className="text-center border-l border-stone-200 dark:border-stone-700">
                                          <div className={`text-[10px] font-black ${activeChild.gold_pot_broken ? 'text-red-900/60' : 'text-stone-400'} uppercase tracking-widest mb-0.5`}>Total Leaked</div>
                                          <div className={`text-sm font-bold ${activeChild.gold_pot_broken ? 'text-red-900' : 'text-stone-700 dark:text-stone-200'}`}>
                                            {activeChild.gold_pot_total_leaked || 0} Coins
                                          </div>
                                        </div>
                                      </div>

                                      {activeChild.gold_pot_broken && (
                                        <Typography variant="body" className="text-xs text-red-700 dark:text-red-400 mb-2 leading-tight font-bold">
                                          Your pot is broken! Fix it now or you will lose a coin every day.
                                        </Typography>
                                      )}
                                    </div>

                                    <div className="flex flex-col gap-1.5 mt-auto">
                                      {activeChild.gold_pot_broken && (
                                        <Button
                                          variant="danger"
                                          size="sm"
                                          fullWidth
                                          disabled={(activeChild.points || 0) < (parentProfile?.gold_pot_maintenance_cost ?? 2)}
                                          onClick={(e) => {
                                            e.stopPropagation();
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
                                          leftIcon={<FaWandMagicSparkles className="w-3 h-3" />}
                                          className="text-xs py-2 rounded-xl"
                                        >
                                          FIX (-{parentProfile?.gold_pot_maintenance_cost ?? 2} COINS)
                                        </Button>
                                      )}
                                      <Button
                                        variant="none"
                                        size="none"
                                        onClick={(e) => { e.stopPropagation(); setShowGoldPotMaintenanceVideo(true); }}
                                        className={`flex items-center justify-center gap-1 w-full py-2 rounded-xl font-bold text-sm transition-colors ${activeChild.gold_pot_broken ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                                      >
                                        <Play className="w-3 h-3" fill="currentColor" /> Play Video
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Gold Pot Maintenance Locked Preview */}
                        {!isGoldPotMaintenanceUnlocked && activeChild.level < (parentProfile?.gold_pot_maintenance_unlock_level ?? 8) && (
                          <div
                            className="joyride-target-pot-maintenance relative p-2 rounded-[2.5rem] flex flex-col shadow-xl overflow-hidden h-full grayscale opacity-70"
                            style={{ background: 'repeating-linear-gradient(45deg, #e7e5e4, #e7e5e4 10px, #d6d3d1 10px, #d6d3d1 20px)' }}
                          >
                            <div className="relative z-10 w-full h-full bg-stone-50 dark:bg-stone-950 rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2 text-stone-500 dark:text-stone-400">
                              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                                <Lock className="w-4 h-4" />
                                <Typography variant="label"><FaWrench className="inline-block mr-2 text-amber-500" /> Maintenance — Unlock at Level {parentProfile?.gold_pot_maintenance_unlock_level ?? 8}!</Typography>
                              </div>
                              <LinearProgressBar
                                progress={(() => {
                                  const goldReq = ((parentProfile?.gold_pot_maintenance_unlock_level ?? 8) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return Math.round(((activeChild.lifetime_points || 0) / Math.max(1, goldReq)) * 100);
                                })()}
                                className="max-w-[200px]"
                              />
                              <span className="text-[10px] font-sans text-stone-400 font-bold">
                                {(() => {
                                  const goldReq = ((parentProfile?.gold_pot_maintenance_unlock_level ?? 8) - 1) * (parentProfile?.points_to_level_up ?? 500);
                                  return `${(activeChild.lifetime_points || 0)} / ${goldReq} GOLD`;
                                })()}
                              </span>
                            </div>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>

            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Mobile Sticky Bottom Nav for Child Dashboard */}
      {selectedChildId && !isDesktop && (
        <BottomTabBar
          tabs={[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'companion', label: 'Pets', icon: FaPaw },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
            { id: 'rewards', label: 'Rewards', icon: Gift },
            { id: 'pots', label: 'Pots', icon: FaJar }
          ]}
          activeTab={activeChildTab}
          onTabChange={(id) => { playSound.click(); setActiveChildTab(id as any); }}
          layoutId="child-nav-pill"
        />
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
