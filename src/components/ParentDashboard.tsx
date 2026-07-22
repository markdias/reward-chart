import {
  FaStar, FaHeart, FaEgg, FaBurst, FaWandMagicSparkles, FaHeartCrack,
  FaFaceSadTear, FaBone, FaCartShopping, FaGamepad, FaFaceFrown, FaCircleCheck, FaTriangleExclamation,
  FaBullseye, FaGift, FaJar, FaCoins, FaPiggyBank, FaBowlFood, FaGlobe, FaCat, FaWater, FaBook,
  FaChildDress, FaChild, FaCrown, FaFire, FaShield, FaBullhorn, FaBroom, FaPen, FaBaby, FaBolt,
  FaPizzaSlice, FaPalette, FaBookOpen, FaInfinity, FaCalendar, FaHandPeace, FaScroll, FaRocket
} from 'react-icons/fa6';
import React, { useState, useEffect, useMemo } from 'react';
import { Typography } from './ui/Typography';
import { motion, AnimatePresence } from 'motion/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTaskItem } from './ui/SortableTaskItem';
import {
  Users, CheckSquare, Trophy, Bell, ShieldAlert, Sparkles, Plus,
  Trash2, LogOut, Check, X, ShieldCheck, Heart, UserPlus,
  BookOpen, Lock, RefreshCw, Coins, Info, Activity, Award, Settings, CheckCircle2, Edit2, TrendingUp, ArrowUpCircle, ArrowDownCircle, PlusCircle, MinusCircle, Eye, EyeOff, RotateCcw, ChevronDown, MessageSquare, Send, Target, Gift, ScrollText, Home, Calendar, ChevronRight, Star, Flame, PiggyBank, Utensils, MoreHorizontal, HelpCircle, Link as LinkIcon, FlaskConical
} from 'lucide-react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { ActivityFeed } from './ui/ActivityFeed';
import { Child, Task, TaskCompletion, Reward, RewardRedemption, GiftingRequest } from '../types';
import { CHARACTER_PACKS, getCharacterStage, PRECANNED_AVATARS } from '../data/characters';
import { playSound } from '../utils/sound';
import { PREMADE_TASKS, PREMADE_REWARDS } from '../data/premadeTemplates';
import { EXTENDED_TASKS, EXTENDED_REWARDS } from '../data/extendedTemplates';

import { ParentProfile } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import { generateShortCode } from '../utils/security';
import { Capacitor } from '@capacitor/core';
import SettingsTab from './SettingsTab';
import { HelpTab } from './HelpTab';
import TargetsTab from './TargetsTab';
import { WeeklyRewardChart } from './WeeklyRewardChart';
import { InsightsTab } from './InsightsTab';
import { ActionShowcase } from './ActionShowcase';
import { CoinBadge } from './CoinBadge';
import { Tooltip } from './ui/Tooltip';
import { Walkthrough } from './Walkthrough';
import { Step } from 'react-joyride';
import { ChildAvatar } from './ChildAvatar';
import { LinearProgressBar } from './ProgressBar';
import { Button } from './ui/Button';
import { StackedIconButton } from './ui/StackedIconButton';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { BottomTabBar } from './ui/BottomTabBar';

const getPetStripeBackground = (characterId?: string) => {
  switch (characterId) {
    case 'unicorn': return 'repeating-linear-gradient(45deg, #a855f7, #a855f7 15px, #f472b6 15px, #f472b6 30px, #e879f9 30px, #e879f9 45px)';

    case 'dino': return 'repeating-linear-gradient(45deg, #10b981, #10b981 15px, #84cc16 15px, #84cc16 30px, #14b8a6 30px, #14b8a6 45px)';

    default: return 'repeating-linear-gradient(45deg, #22d3ee, #22d3ee 15px, #a855f7 15px, #a855f7 30px, #38bdf8 30px, #38bdf8 45px)';
  }
};

interface ParentDashboardProps {
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  onAddChild: (name: string, characterId: string, avatarUrl: string, age?: number) => void;
  onEditChild: (id: string, updates: Partial<Child>) => void;
  onDeleteChild?: (id: string) => void;
  onUnlinkChild?: (id: string) => void;
  onUpdateChildStats: (id: string, updates: Partial<Child>) => void;
  onDeductCoins?: (childId: string, amount: number, reason: string) => void;
  onAddCoins?: (childId: string, amount: number, reason: string) => void;
  onAddTask: (title: string, points: number, category: any, recurrence: any, cooldownMinutes?: number) => void;
  onAssignTask: (template: Task, childIds: string[]) => void;
  onEditTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddReward: (title: string, cost: number, icon: string, limitType: any, isBadgeEligible?: boolean) => void;
  onAssignReward: (template: Reward, childIds: string[]) => void;
  onEditReward: (id: string, updates: Partial<Reward>) => void;
  onDeleteReward: (id: string) => void;
  onApproveCompletion: (id: string) => void;
  onRejectCompletion: (id: string) => void;
  onDeliverReward: (id: string) => void;
  onRejectReward: (id: string) => void;
  onRestoreReward: (id: string) => void;
  onExitParentMode: () => void;
  parentEmail: string;
  onParentCompleteTask: (taskId: string, childId: string, dateIso?: string) => void;
  giftingRequests: GiftingRequest[];
  onApproveGiftingRequest: (id: string) => void;
  onRejectGiftingRequest: (id: string) => void;
  parentProfile?: ParentProfile | null;
  linkedParents?: ParentProfile[];
  onRequireAccount?: () => void;
  onResetData?: (keepTemplates: boolean, keepAssignments: boolean, keepRoutines: boolean, childId: string) => void;
  onRunSetup?: () => void;
  onDeleteAccount?: () => void;
  onLogout?: () => void;
  onUpdateParentProfile?: (updates: Partial<ParentProfile>) => void;
  initialTab?: 'home' | 'chart' | 'children' | 'tasks' | 'rewards' | 'compliance' | 'settings' | 'targets' | 'help';
  initialSubTab?: 'directory' | 'active' | 'routines';
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  theme?: string;
}

export default function ParentDashboard({
  children,
  tasks,
  completions,
  rewards,
  redemptions,
  onAddChild,
  onEditChild,
  onDeleteChild,
  onUnlinkChild,
  onUpdateChildStats,
  onDeductCoins,
  onAddCoins,
  onAddTask,
  onAssignTask,
  onEditTask,
  onDeleteTask,
  onAddReward,
  onAssignReward,
  onEditReward,
  onDeleteReward,
  onApproveCompletion,
  onRejectCompletion,
  onDeliverReward,
  onRejectReward,
  onRestoreReward,
  onExitParentMode,
  parentEmail,
  onParentCompleteTask,
  parentProfile,
  linkedParents = [],
  onResetData,
  onRunSetup,
  onRequireAccount,
  onDeleteAccount,
  giftingRequests = [],
  onApproveGiftingRequest,
  onRejectGiftingRequest,
  onLogout,
  onUpdateParentProfile,
  initialTab = 'home',
  initialSubTab = 'directory',
  isLoading = false,
  onRefresh,
  theme
}: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'chart' | 'children' | 'tasks' | 'rewards' | 'compliance' | 'settings' | 'targets' | 'help'>(initialTab);
  const { flags } = useFeatureFlags(parentProfile?.is_beta_tester || false);
  const isBetaUser = Boolean(parentProfile?.is_beta_tester || flags.insights_tab);

  useEffect(() => {
    if (!isBetaUser && activeTab === 'chart') {
      setActiveTab('home');
    }
  }, [isBetaUser, activeTab]);

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
    const localSeen = localStorage.getItem('RCH_TOUR_SEEN_PARENT') === 'true';
    if (parentProfile && !parentProfile.tour_seen && !localSeen && !isLoading && !runTour && !hasAutoStarted) {
      setHasAutoStarted(true);
      setTourStepIndex(0);
      setActiveTab('home');
      setTimeout(() => setRunTour(true), 1000);
    }
  }, [isLoading, parentProfile, runTour, hasAutoStarted]);

  const handleTourFinish = async () => {
    setRunTour(false);
    setTourStepIndex(0);
    localStorage.setItem('RCH_TOUR_SEEN_PARENT', 'true');
    if (parentProfile && !parentProfile.tour_seen && onUpdateParentProfile) {
      await onUpdateParentProfile({ tour_seen: true });
    }
  };

  // Called BEFORE the step changes, so we can scroll to top ONLY when the main tab changes!
  const handleBeforeTourStepChange = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const tourSteps: Step[] = useMemo(() => {
    const steps: Step[] = [
      {
        target: '.joyride-target-home',
        content: 'Welcome to your Parent Dashboard! This is your Home tab where you get quick summaries of your children\'s progress, pending approvals, and daily reminders.',
        placement: 'bottom',
      },
    ];

    if (isBetaUser) {
      steps.push(
        {
          target: '.joyride-target-chart',
          content: 'This is the Chart tab! Toggle between your weekly reward matrix and real-time child performance insights.',
          placement: 'bottom',
        },
        {
          target: '#tour-chart-child-selector',
          content: 'Use the child selector bar to switch between your children, or toggle between 7-day, 14-day, and 30-day view ranges.',
          placement: 'bottom',
        },
        {
          target: '#tour-chart-grid',
          content: 'Tap any empty cell (+ sign) to instantly auto-approve a chore for that date! Click existing cells to change status or reset.',
          placement: 'bottom',
        },
        {
          target: '#tour-chart-print-btn',
          content: 'Click the Print button anytime to generate a clean physical chart layout for hanging on the wall or fridge!',
          placement: 'bottom',
        },
        {
          target: '#tour-chart-subtab-insights',
          content: 'Switch to the INSIGHTS sub-tab to explore child progress analytics, coin stats, category breakdowns, and AI parenting tips.',
          placement: 'bottom',
        },
        {
          target: '#insights-tab-view',
          content: 'In Insights, view key statistics like total gold coins, chores done, day streak, weekly best days chart, category breakdown, and areas going well or struggling.',
          placement: 'bottom',
        }
      );
    }

    steps.push(
      {
        target: '.joyride-target-children',
        content: 'This is the Children tab. Here you can add child profiles, customize avatars, select character archetypes, and set level-up rewards.',
        placement: 'bottom',
      },
      {
        target: '#tour-task-subtab-directory',
        content: 'In the Tasks tab under TEMPLATES, you can create reusable task templates (like chores or learning) that kids can complete to earn coins.',
        placement: 'bottom',
      },
      {
        target: '#tour-task-subtab-active',
        content: 'Under ASSIGNED, you can see all active tasks assigned to specific kids and track their completion status.',
        placement: 'bottom',
      },
      {
        target: '#tour-task-subtab-routines',
        content: 'Under ROUTINES, you can set up recurring daily or weekly task schedules to build strong habits.',
        placement: 'bottom',
      },
      {
        target: '#tour-reward-subtab-directory',
        content: 'In the Rewards tab under TEMPLATES, you can create real-life reward options (like extra screen time or a special treat) and set their coin prices.',
        placement: 'bottom',
      },
      {
        target: '#tour-reward-subtab-active',
        content: 'Under ASSIGNED, you can check which rewards have been claimed by your kids and manage fulfillment.',
        placement: 'bottom',
      },
      {
        target: '.joyride-target-targets',
        content: 'This is the Targets tab. Review and approve pending tasks or reward claims. Your approval triggers coin animations for your kids!',
        placement: 'bottom',
      },
      {
        target: '#global-logout-btn',
        content: 'This is the Sign Out button. Use it to log out of your parent account securely.',
        placement: 'bottom',
      },
      {
        target: '#global-help-btn',
        content: 'Need help? The Guide button replays this tour and explains how the system works.',
        placement: 'bottom',
      },
      {
        target: '#global-settings-btn',
        content: 'Click the Settings button to access and manage your profile, security, and family sharing.',
        placement: 'bottom',
      },
      {
        target: '#tour-settings-profile-tab',
        content: 'The Profile tab lets you update your personal details, family name, and manage push notifications.',
        placement: 'bottom',
      },
      {
        target: '#tour-settings-security-tab',
        content: 'The Security tab allows you to update your account password securely.',
        placement: 'bottom',
      },
      {
        target: '#tour-settings-sharing-tab',
        content: 'The Sharing tab lets you invite a partner or co-parent to manage the same dashboard.',
        placement: 'bottom',
      },
      {
        target: '#tour-settings-danger-tab',
        content: 'The Danger tab contains options to clean duplicates, reset sample data, or start over if you need a clean slate.',
        placement: 'bottom',
      },
      {
        target: '#exit-to-child-view-btn',
        content: 'Use the Switch to Child View button to let your children access their dashboard and claim tasks. This locks parent settings securely.',
        placement: 'bottom',
      },
      {
        target: 'body',
        content: (
          <div className="flex flex-col gap-4">
            <p className="font-bold">You're all set! Explore each section at your own pace.</p>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="tour-dont-show" className="rounded text-indigo-600 w-5 h-5" onChange={(e) => {
                if (e.target.checked) {
                  localStorage.setItem('RCH_TOUR_SEEN_PARENT', 'true');
                  if (onUpdateParentProfile) {
                    onUpdateParentProfile({ tour_seen: true });
                  }
                }
              }} />
              <label htmlFor="tour-dont-show" className="text-sm cursor-pointer">Don't show this tour again</label>
            </div>
          </div>
        ),
        placement: 'center',
      }
    );

    return steps;
  }, [isBetaUser, onUpdateParentProfile]);

  // Called by Walkthrough when advancing to the NEXT or PREV step index
  const handleTourStepChange = (nextStepIndex: number) => {
    const step = tourSteps[nextStepIndex];
    if (!step || typeof step.target !== 'string') return;

    const targetSelector = step.target;

    if (targetSelector === '.joyride-target-home' || targetSelector === '#exit-to-child-view-btn') {
      setActiveTab('home');
    } else if (targetSelector === '.joyride-target-chart' || targetSelector.startsWith('#tour-chart-')) {
      setActiveTab('chart');
      if (targetSelector === '#tour-chart-subtab-insights') {
        setChartSubTab('insights');
      } else {
        setChartSubTab('weekly');
      }
    } else if (targetSelector === '#insights-tab-view') {
      setActiveTab('chart');
      setChartSubTab('insights');
    } else if (targetSelector === '.joyride-target-children') {
      setActiveTab('children');
    } else if (targetSelector.startsWith('#tour-task-')) {
      setActiveTab('tasks');
      if (targetSelector === '#tour-task-subtab-directory') setTaskSubTab('directory');
      else if (targetSelector === '#tour-task-subtab-active') setTaskSubTab('active');
      else if (targetSelector === '#tour-task-subtab-routines') setTaskSubTab('routines');
    } else if (targetSelector.startsWith('#tour-reward-')) {
      setActiveTab('rewards');
      if (targetSelector === '#tour-reward-subtab-directory') setRewardSubTab('directory');
      else if (targetSelector === '#tour-reward-subtab-active') setRewardSubTab('active');
    } else if (targetSelector === '.joyride-target-targets') {
      setActiveTab('targets');
    } else if (targetSelector.startsWith('#tour-settings-') || targetSelector === '#global-settings-btn') {
      setActiveTab('settings');
      if (targetSelector === '#tour-settings-profile-tab') setSettingsSubTab('profile');
      else if (targetSelector === '#tour-settings-security-tab') setSettingsSubTab('security');
      else if (targetSelector === '#tour-settings-sharing-tab') setSettingsSubTab('sharing');
      else if (targetSelector === '#tour-settings-danger-tab') setSettingsSubTab('danger');
    }

    // Delay updating stepIndex to allow tab render
    setTimeout(() => {
      setTourStepIndex(nextStepIndex);

      setTimeout(() => {
        if (typeof step.target === 'string' && step.target !== 'body') {
          const targetEl = document.querySelector(step.target);
          if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            const topBoundary = 120;
            const bottomBoundary = window.innerHeight - 150;

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

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Scroll to top when switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const [chartSubTab, setChartSubTab] = useState<'weekly' | 'insights'>('weekly');
  const [taskSubTab, setTaskSubTab] = useState<'directory' | 'active' | 'routines'>(initialSubTab);
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'security' | 'sharing' | 'danger'>('profile');

  useEffect(() => {
    setTaskSubTab(initialSubTab);
  }, [initialSubTab]);

  const [routineChildId, setRoutineChildId] = useState<string | null>(children[0]?.id || null);

  useEffect(() => {
    if (!routineChildId && children.length > 0) {
      setRoutineChildId(children[0].id);
    }
  }, [children, routineChildId]);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [showContextActions, setShowContextActions] = useState(false);


  const [rewardSubTab, setRewardSubTab] = useState<'directory' | 'active'>('directory');
  const [expandedAdjustments, setExpandedAdjustments] = useState<Record<string, boolean>>({});
  const [expandedTaskTemplateId, setExpandedTaskTemplateId] = useState<string | null>(null);
  const [expandedRewardTemplateId, setExpandedRewardTemplateId] = useState<string | null>(null);
  const [expandedActiveTaskId, setExpandedActiveTaskId] = useState<string | null>(null);
  const [expandedActiveRewardId, setExpandedActiveRewardId] = useState<string | null>(null);
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);


  // Sort children alphabetically so they don't jump around
  const sortedChildren = [...children].sort((a, b) => a.name.localeCompare(b.name));

  // Custom Confirmation Modal State
  const [resetConfirmation, setResetConfirmation] = useState<{ childId: string, childName: string, type: 'Gold' | 'Level' | 'Streak' | 'Lifetime Gold' | 'Food' } | null>(null);
  const [deleteChildConfirmation, setDeleteChildConfirmation] = useState<{ childId: string, childName: string } | null>(null);
  const [showHistoryForChild, setShowHistoryForChild] = useState<string | null>(null);
  const [historyDetailView, setHistoryDetailView] = useState<'tasks' | 'deductions' | 'rewards' | null>(null);
  const [adjustmentsModalChildId, setAdjustmentsModalChildId] = useState<string | null>(null);
  
  // Routine Edit State
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, childId: string, routineId: string, periodKey: 'morningTaskIds' | 'afternoonTaskIds' | 'eveningTaskIds') => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const child = children.find(c => c.id === childId);
      if (!child) return;
      const routines = (child.routines || []).map(r => {
        if (r.id === routineId) {
          const periodTasks = r[periodKey] || [];
          const oldIndex = periodTasks.indexOf(active.id as string);
          const newIndex = periodTasks.indexOf(over.id as string);
          return {
            ...r,
            [periodKey]: arrayMove(periodTasks, oldIndex, newIndex)
          };
        }
        return { ...r };
      });
      onEditChild(child.id, { routines });
    }
  };
  // Penalty Modal State
  const [penaltyModalChildId, setPenaltyModalChildId] = useState<string | null>(null);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(5);
  const [penaltyReason, setPenaltyReason] = useState<string>('');

  // Add Coins Modal State
  const [addCoinsModalChildId, setAddCoinsModalChildId] = useState<string | null>(null);
  const [addCoinsAmount, setAddCoinsAmount] = useState<number>(5);
  const [addCoinsReason, setAddCoinsReason] = useState<string>('');

  // Forms states
  const [showAddChild, setShowAddChild] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState<number | ''>('');
  const [newChildChar, setNewChildChar] = useState('unicorn');
  const [newChildAvatar, setNewChildAvatar] = useState('Rocket');

  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPoints, setTaskPoints] = useState(15);
  const [taskCategory, setTaskCategory] = useState<'chores' | 'homework' | 'behavior' | 'health' | 'creative' | 'other'>('chores');
  const [taskRecurrence, setTaskRecurrence] = useState<'daily' | 'weekly' | 'one_time' | 'repeatable'>('daily');
  const [taskCooldownMinutes, setTaskCooldownMinutes] = useState<number | undefined>(undefined);
  const [taskChildIds, setTaskChildIds] = useState<string[]>([]);

  const [showAddReward, setShowAddReward] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardCost, setRewardCost] = useState(50);
  const [rewardChildIds, setRewardChildIds] = useState<string[]>([]);
  const [rewardIcon, setRewardIcon] = useState('Gamepad2');
  const [rewardLimit, setRewardLimit] = useState<'unlimited' | 'daily' | 'twice_daily' | 'one_time'>('unlimited');
  const [rewardBadgeEligible, setRewardBadgeEligible] = useState(false);

  // Generate Ideas Modal State
  const [showGenerateTasksModal, setShowGenerateTasksModal] = useState(false);
  const [showGenerateRewardsModal, setShowGenerateRewardsModal] = useState(false);
  const [generateAgeRange, setGenerateAgeRange] = useState<'all' | '3-5' | '6-8' | '9-12'>('all');
  const [generateCount, setGenerateCount] = useState<number>(5);
  const [editingPreviewId, setEditingPreviewId] = useState<string | null>(null);
  const [previewEditTitle, setPreviewEditTitle] = useState('');
  const [previewEditPoints, setPreviewEditPoints] = useState(0);

  const [generatedTasksToPreview, setGeneratedTasksToPreview] = useState<any[] | null>(null);
  const [selectedTaskIdsForImport, setSelectedTaskIdsForImport] = useState<string[]>([]);
  const [generatedRewardsToPreview, setGeneratedRewardsToPreview] = useState<any[] | null>(null);
  const [selectedRewardIdsForImport, setSelectedRewardIdsForImport] = useState<string[]>([]);

  const [nudgedChildIds, setNudgedChildIds] = useState<string[]>([]);
  const todayStr = new Date().toISOString().split('T')[0];
  const childrenToNudge = children.filter(c => {
    const activeToday = c.last_active_date ? c.last_active_date.split('T')[0] === todayStr : false;
    return !activeToday;
  });

  const pendingApprovals = completions.filter(c => c.status === 'pending');
  const pendingRedemptions = redemptions.filter(r => r.status === 'requested');
  const pendingGiftingRequests = giftingRequests.filter(g => g.status === 'pending');
  const totalPending = pendingApprovals.length + pendingRedemptions.length + pendingGiftingRequests.length;



  const approvedCompletionsCount = completions.filter(c => c.status === 'approved').length;
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

  // Auto-sync selected child IDs in forms when children list updates
  React.useEffect(() => {
    if (children && children.length > 0) {
      if (taskChildIds.length === 0) {
        setTaskChildIds([children[0].id]);
      }
      if (rewardChildIds.length === 0) {
        setRewardChildIds([children[0].id]);
      }
    } else {
      setTaskChildIds([]);
      setRewardChildIds([]);
    }
  }, [children, taskChildIds.length, rewardChildIds.length]);

  const handleApprove = (id: string) => {
    playSound.success();
    onApproveCompletion(id);
  };


  const isTitleSimilar = (title1: string, title2: string) => {
    const t1 = title1.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const t2 = title2.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    if (t1 === t2) return true;

    // Check substring for longer titles
    if ((t1.includes(t2) && t2.length > 8) || (t2.includes(t1) && t1.length > 8)) return true;

    const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'to', 'for', 'of', 'in', 'on', 'with', 'do', 'make', 'your', 'my', 'some', 'any', 'get', 'put', 'help']);
    const words1 = t1.split(' ').filter(w => w.length > 2 && !stopWords.has(w));
    const words2 = t2.split(' ').filter(w => w.length > 2 && !stopWords.has(w));

    if (words1.length === 0 || words2.length === 0) return false;

    const matchCount = words1.filter(w => words2.includes(w)).length;
    if (matchCount === 0) return false;

    const minLen = Math.min(words1.length, words2.length);
    if (minLen === 1 && matchCount === 1) return true;

    if (minLen > 1 && matchCount / minLen > 0.5) return true;

    return false;
  };

  const getRecommendedAgeRange = () => {
    const ages = children.map(c => c.age).filter((a): a is number => typeof a === 'number');
    if (ages.length === 0) return 'all';
    const avg = ages.reduce((sum, a) => sum + a, 0) / ages.length;
    if (avg <= 5) return '3-5';
    if (avg <= 8) return '6-8';
    if (avg <= 12) return '9-12';
    return 'all';
  };

  const handleGenerateTasks = () => {
    let pool = EXTENDED_TASKS;
    if (generateAgeRange !== 'all') {
      pool = pool.filter(t => t.age_range === generateAgeRange || t.age_range === 'all');
    }

    const available = pool.filter(template => {
      return !tasks.some(existing => isTitleSimilar(template.title, existing.title));
    });

    if (available.length === 0) {
      alert(`No more fresh quests available for this age range!`);
      setShowGenerateTasksModal(false);
      return;
    }

    // Shuffle and pick `generateCount`
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, generateCount);

    const tasksToPreview = picked.map(t => {
      const { age_range, ...rest } = t;
      return {
        ...rest,
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        created_at: new Date().toISOString(),
        parent_id: parentProfile?.family_id || ''
      };
    });

    setGeneratedTasksToPreview(tasksToPreview);
    setSelectedTaskIdsForImport(tasksToPreview.map(t => t.id));
  };

  const handleImportGeneratedTasks = async () => {
    if (!parentProfile?.family_id || !generatedTasksToPreview) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const tasksToInsert = generatedTasksToPreview.filter(t => selectedTaskIdsForImport.includes(t.id));
    if (tasksToInsert.length === 0) {
      setGeneratedTasksToPreview(null);
      setShowGenerateTasksModal(false);
      return;
    }

    const { error } = await supabase.from('tasks').insert(tasksToInsert);
    if (error) {
      console.error('Supabase tasks insert error:', error);
      alert(`Error generating tasks: ${error.message}`);
    } else {
      playSound.success();
      setGeneratedTasksToPreview(null);
      setShowGenerateTasksModal(false);
    }
  };

  const handleGenerateRewards = () => {
    let pool = EXTENDED_REWARDS;
    if (generateAgeRange !== 'all') {
      pool = pool.filter(r => r.age_range === generateAgeRange || r.age_range === 'all');
    }

    const available = pool.filter(template => {
      return !rewards.some(existing => isTitleSimilar(template.title, existing.title));
    });

    if (available.length === 0) {
      alert(`No more fresh prizes available for this age range!`);
      setShowGenerateRewardsModal(false);
      return;
    }

    // Shuffle and pick `generateCount`
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, generateCount);

    const rewardsToPreview = picked.map(r => {
      const { age_range, ...rest } = r;
      return {
        ...rest,
        id: `reward_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        created_at: new Date().toISOString(),
        parent_id: parentProfile?.family_id || ''
      };
    });

    setGeneratedRewardsToPreview(rewardsToPreview);
    setSelectedRewardIdsForImport(rewardsToPreview.map(r => r.id));
  };

  const handleImportGeneratedRewards = async () => {
    if (!parentProfile?.family_id || !generatedRewardsToPreview) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const rewardsToInsert = generatedRewardsToPreview.filter(r => selectedRewardIdsForImport.includes(r.id));
    if (rewardsToInsert.length === 0) {
      setGeneratedRewardsToPreview(null);
      setShowGenerateRewardsModal(false);
      return;
    }

    const { error } = await supabase.from('rewards').insert(rewardsToInsert);
    if (error) {
      console.error('Supabase rewards insert error:', error);
      alert(`Error generating prizes: ${error.message}`);
    } else {
      playSound.success();
      setGeneratedRewardsToPreview(null);
      setShowGenerateRewardsModal(false);
    }
  };

  const handleImportDefaultTasks = async () => {
    if (!parentProfile?.family_id) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const existingTitles = new Set(tasks.map(t => t.title.trim().toLowerCase()));
    const newPremadeTasks = PREMADE_TASKS.filter(t => !existingTitles.has(t.title.trim().toLowerCase()));

    if (newPremadeTasks.length === 0) {
      alert("All default quests have already been imported!");
      return;
    }

    const tasksToInsert = newPremadeTasks.map(t => ({
      ...t,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
      parent_id: parentProfile.family_id
    }));
    const { error } = await supabase.from('tasks').insert(tasksToInsert);
    if (error) {
      console.error('Supabase tasks insert error:', error);
      alert(`Error importing tasks: ${error.message}`);
    } else {
      playSound.success();
    }
  };

  const handleImportDefaultRewards = async () => {
    if (!parentProfile?.family_id) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const existingTitles = new Set(rewards.map(r => r.title.trim().toLowerCase()));
    const newPremadeRewards = PREMADE_REWARDS.filter(r => !existingTitles.has(r.title.trim().toLowerCase()));

    if (newPremadeRewards.length === 0) {
      alert("All default prizes have already been imported!");
      return;
    }

    const rewardsToInsert = newPremadeRewards.map(r => ({
      ...r,
      id: `reward_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
      parent_id: parentProfile.family_id
    }));
    const { error } = await supabase.from('rewards').insert(rewardsToInsert);
    if (error) {
      console.error('Supabase rewards insert error:', error);
      alert(`Error importing rewards: ${error.message}`);
    } else {
      playSound.success();
    }
  };

  const handleCleanDuplicates = async () => {
    if (!parentProfile?.family_id) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Find duplicate task templates
    const templateTasks = tasks.filter(t => t.is_template);
    const seenTaskTitles = new Set<string>();
    const duplicateTaskIds: string[] = [];

    for (const t of templateTasks) {
      const titleLower = t.title.trim().toLowerCase();
      if (seenTaskTitles.has(titleLower)) {
        duplicateTaskIds.push(t.id);
      } else {
        seenTaskTitles.add(titleLower);
      }
    }

    // Find duplicate reward templates
    const templateRewards = rewards.filter(r => r.is_template !== false && r.child_id === 'directory');
    const seenRewardTitles = new Set<string>();
    const duplicateRewardIds: string[] = [];

    for (const r of templateRewards) {
      const titleLower = r.title.trim().toLowerCase();
      if (seenRewardTitles.has(titleLower)) {
        duplicateRewardIds.push(r.id);
      } else {
        seenRewardTitles.add(titleLower);
      }
    }

    if (duplicateTaskIds.length === 0 && duplicateRewardIds.length === 0) {
      alert("No duplicates found!");
      return;
    }

    let deletedCount = 0;

    if (duplicateTaskIds.length > 0) {
      const { error } = await supabase.from('tasks').delete().in('id', duplicateTaskIds);
      if (error) console.error("Error deleting duplicate tasks", error);
      else deletedCount += duplicateTaskIds.length;
    }

    if (duplicateRewardIds.length > 0) {
      const { error } = await supabase.from('rewards').delete().in('id', duplicateRewardIds);
      if (error) console.error("Error deleting duplicate rewards", error);
      else deletedCount += duplicateRewardIds.length;
    }

    if (deletedCount > 0) {
      playSound.success();
      alert(`Successfully removed ${deletedCount} duplicate templates!`);
    }
  };

  const handleReject = (id: string) => {
    playSound.click();
    onRejectCompletion(id);
  };

  const handleChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName) return;
    playSound.click();
    if (editingChildId) {
      onEditChild(editingChildId, { name: newChildName, age: typeof newChildAge === 'number' ? newChildAge : undefined, character_id: newChildChar, avatar_url: newChildAvatar });
    } else {
      onAddChild(newChildName, newChildChar, newChildAvatar, typeof newChildAge === 'number' ? newChildAge : undefined);
    }
    setNewChildName('');
    setNewChildAge('');
    setNewChildChar('unicorn');
    setEditingChildId(null);
    setNewChildChar('unicorn');
    setNewChildAvatar('Rocket');
    setShowAddChild(false);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTaskId) {
      onEditTask(editingTaskId, {
        title: taskTitle,
        points: taskPoints,
        category: taskCategory,
        recurrence: taskRecurrence,
        cooldown_minutes: taskCooldownMinutes
      });
    } else {
      onAddTask(taskTitle, Number(taskPoints) || 0, taskCategory, taskRecurrence, taskCooldownMinutes);
    }
    setShowAddTask(false);
    setTaskSubTab('directory');
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskPoints(15);
    setTaskCategory('chores');
    setTaskRecurrence('daily');
    setTaskCooldownMinutes(undefined);
    setTaskChildIds([]);
  };

  const handleRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRewardId) {
      onEditReward(editingRewardId, {
        title: rewardTitle,
        cost_points: Number(rewardCost) || 0,
        icon_name: rewardIcon,
        limit_type: rewardLimit,
        is_badge_eligible: rewardBadgeEligible
      });
    } else {
      onAddReward(rewardTitle, Number(rewardCost) || 0, rewardIcon, rewardLimit, rewardBadgeEligible);
    }
    setShowAddReward(false);
    setRewardSubTab('directory');
    setEditingRewardId(null);
    setRewardTitle('');
    setRewardCost(50);
  };

  // Edit Handlers
  const openEditChild = (child: Child) => {
    setEditingChildId(child.id);
    setNewChildName(child.name);
    setNewChildAge(child.age || '');
    setNewChildChar(child.character_id);
    setNewChildAvatar(child.avatar_url || 'Rocket');
    setShowAddChild(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskPoints(task.points);
    setTaskCategory(task.category);
    setTaskRecurrence(task.recurrence);
    setTaskCooldownMinutes(task.cooldown_minutes ?? undefined);
    setTaskChildIds([task.child_id || 'directory']);
    setShowAddTask(true);
  };

  const openEditReward = (reward: Reward) => {
    setEditingRewardId(reward.id);
    setRewardTitle(reward.title);
    setRewardCost(reward.cost_points);
    setRewardChildIds([reward.child_id || 'directory']);
    setRewardIcon(reward.icon_name);
    setRewardLimit(reward.limit_type || 'unlimited');
    setRewardBadgeEligible(reward.is_badge_eligible || false);
    setShowAddReward(true);
  };

  return (
    <div className={`min-h-screen bg-stone-50 dark:bg-stone-950 text-dark dark:text-white flex flex-col font-sans relative pt-[calc(max(env(safe-area-inset-top,0px),0.5rem)+68px)] sm:pt-[calc(max(env(safe-area-inset-top,0px),0.5rem)+88px)]`} id="parent-dashboard-root">

      <Walkthrough 
        steps={tourSteps} 
        run={runTour} 
        stepIndex={tourStepIndex}
        onFinish={handleTourFinish} 
        onStepChange={handleTourStepChange}
        onBeforeStepChange={handleBeforeTourStepChange}
      />

      <header
        className="fixed top-0 left-0 right-0 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 z-50 pb-2 sm:pb-3"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">

            <div className="flex flex-col justify-center flex-1 min-w-0">
              <Typography variant="h1" className="text-xl sm:text-3xl font-black text-stone-900 dark:text-stone-50 leading-none tracking-tight font-display whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                {parentProfile?.name ? `${parentProfile.name}'s Dashboard` : 'Dashboard'}
              </Typography>
              <div className="flex items-center gap-1.5 text-xs sm:text-base text-stone-500 dark:text-stone-400 font-semibold mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                {parentProfile?.family_name ? `${parentProfile.family_name} Family` : parentProfile?.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Action Menu / Logout / Lock Pill */}
            <div className="relative flex items-center bg-stone-50 dark:bg-stone-950/80 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-full shadow-sm p-1 sm:p-1.5 gap-1 shrink-0 z-50">
              
              {/* Dynamic Context Actions Dropdown */}
              {(activeTab === 'children' || (activeTab === 'tasks' && taskSubTab === 'directory') || (activeTab === 'rewards' && rewardSubTab === 'directory')) && (
                <>
                  <Button variant="none" size="none"
                    onClick={() => { playSound.click(); setShowContextActions(!showContextActions); }}
                    className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center transition-colors shrink-0 ${showContextActions ? 'bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-50' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200'}`}
                  >
                    <Plus className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${showContextActions ? 'rotate-45' : ''}`} />
                  </Button>

                  <AnimatePresence>
                    {showContextActions && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40"
                          onClick={() => setShowContextActions(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute left-0 right-0 top-full mt-2 w-full flex flex-col gap-1 bg-white dark:bg-stone-900 rounded-[2rem] shadow-xl border border-stone-100 dark:border-stone-800 p-1 sm:p-1.5 z-50 origin-top"
                        >
                          {activeTab === 'children' && (
                            <button className="flex flex-row items-center gap-2 sm:gap-3 w-full justify-start p-0 rounded-full cursor-pointer group outline-none hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors" onClick={() => { playSound.click(); setShowAddChild(true); setShowContextActions(false); }}>
                              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <span className="font-bold text-sm sm:text-base text-stone-700 dark:text-stone-200 whitespace-nowrap">Add Child</span>
                            </button>
                          )}
                          {activeTab === 'tasks' && taskSubTab === 'directory' && (
                            <>
                              <button className="flex flex-row items-center gap-2 sm:gap-3 w-full justify-start p-0 rounded-full cursor-pointer group outline-none hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors" onClick={() => {
                                playSound.click();
                                setShowAddTask(true);
                                setShowContextActions(false);
                              }}>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                  <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="font-bold text-sm sm:text-base text-stone-700 dark:text-stone-200 whitespace-nowrap">Create</span>
                              </button>
                              <button className="flex flex-row items-center gap-2 sm:gap-3 w-full justify-start p-0 rounded-full cursor-pointer group outline-none hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors" onClick={() => {
                                handleImportDefaultTasks();
                                setShowContextActions(false);
                              }}>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-stone-600 dark:text-stone-400" />
                                </div>
                                <span className="font-bold text-sm sm:text-base text-stone-700 dark:text-stone-200 whitespace-nowrap">Import</span>
                              </button>
                              <button className="flex flex-row items-center gap-2 sm:gap-3 w-full justify-start p-0 rounded-full cursor-pointer group outline-none hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors" onClick={() => {
                                playSound.click();
                                setGenerateAgeRange(getRecommendedAgeRange());
                                setShowGenerateTasksModal(true);
                                setShowContextActions(false);
                              }}>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="font-bold text-sm sm:text-base text-stone-700 dark:text-stone-200 whitespace-nowrap">Generate</span>
                              </button>
                            </>
                          )}
                          {activeTab === 'rewards' && rewardSubTab === 'directory' && (
                            <>
                              <button className="flex flex-row items-center gap-2 sm:gap-3 w-full justify-start p-0 rounded-full cursor-pointer group outline-none hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors" onClick={() => {
                                playSound.click();
                                setShowAddReward(true);
                                setShowContextActions(false);
                              }}>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <span className="font-bold text-sm sm:text-base text-stone-700 dark:text-stone-200 whitespace-nowrap">Create</span>
                              </button>
                              <button className="flex flex-row items-center gap-2 sm:gap-3 w-full justify-start p-0 rounded-full cursor-pointer group outline-none hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors" onClick={() => {
                                handleImportDefaultRewards();
                                setShowContextActions(false);
                              }}>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-stone-600 dark:text-stone-400" />
                                </div>
                                <span className="font-bold text-sm sm:text-base text-stone-700 dark:text-stone-200 whitespace-nowrap">Import</span>
                              </button>
                              <button className="flex flex-row items-center gap-2 sm:gap-3 w-full justify-start p-0 rounded-full cursor-pointer group outline-none hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors" onClick={() => {
                                playSound.click();
                                setGenerateAgeRange(getRecommendedAgeRange());
                                setShowGenerateRewardsModal(true);
                                setShowContextActions(false);
                              }}>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="font-bold text-sm sm:text-base text-stone-700 dark:text-stone-200 whitespace-nowrap">Generate</span>
                              </button>
                            </>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              )}

              {onLogout && (
                <Tooltip content="Sign Out" position="bottom" align="right">
                  <Button variant="none" size="none"
                    onClick={() => {
                      playSound.click();
                      onLogout();
                    }}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 transition-colors shrink-0"
                    id="global-logout-btn"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Tooltip>
              )}
              <Tooltip content="Guide" position="bottom" align="right">
                <Button variant="none" size="none"
                  onClick={() => { playSound.click(); setActiveTab('help'); }}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 transition-colors shrink-0"
                  id="global-help-btn"
                >
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Tooltip>
              <Tooltip content="Settings" position="bottom" align="right">
                <Button variant="none" size="none"
                  onClick={() => { playSound.click(); setActiveTab('settings'); }}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 transition-colors shrink-0"
                  id="global-settings-btn"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Tooltip>
              <Tooltip content="Exit Parent Mode" position="bottom" align="right">
                <Button variant="none" size="none"
                  onClick={() => {
                    playSound.click();
                    onExitParentMode();
                  }}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 transition-colors shrink-0"
                  id="exit-to-child-view-btn"
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 relative z-10 mt-2 sm:mt-4 px-2 sm:px-6 lg:px-8 gap-4 max-w-7xl mx-auto w-full pb-24" id="parent-workspace">

        {isDesktop && (
          <aside className={`hidden lg:flex lg:flex-col lg:col-span-3 space-y-6 self-start`}>
          <nav className="flex flex-col gap-2" id="parent-sidebar-nav">
            {[
              { id: 'home', label: 'Home', icon: Home, badge: totalPending },
              ...(isBetaUser ? [{ id: 'chart', label: 'Chart', icon: TrendingUp, isBeta: true }] : []),
              { id: 'children', label: 'Children', icon: Users, count: children.length },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle2, count: tasks.filter(t => t.is_template).length },
              { id: 'rewards', label: 'Rewards', icon: Gift, count: rewards.filter(r => r.is_template !== false && r.child_id === 'directory').length },
              { id: 'targets', label: 'Targets', icon: Target },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'help', label: 'Guide', icon: HelpCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <Button variant="none" size="none"
                  key={tab.id}
                  id={`tour-desktop-tab-${tab.id}`}
                  onClick={() => { playSound.click(); setActiveTab(tab.id as any); }}
                  className={`joyride-target-${tab.id} w-full flex items-center justify-between p-4 rounded-2xl text-[11px] font-sans font-bold uppercase tracking-widest transition-all cursor-pointer duration-300 ${isSelected
                    ? 'bg-stone-900 text-white shadow-md shadow-md scale-[1.02]'
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-50 hover:scale-[1.01]'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-stone-400'}`} strokeWidth={isSelected ? 2.5 : 2} />
                    <span>{tab.label}</span>
                    {(tab as any).isBeta && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-indigo-500 text-white shadow-2xs">
                        BETA
                      </span>
                    )}
                  </span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`${isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'} text-[10px] font-sans px-2 py-0.5 rounded-full font-bold shadow-sm`}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-sans ${isSelected ? 'text-stone-400' : 'text-stone-400'} font-bold`}>
                      ({tab.count})
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>
        </aside>
        )}

        <main className="lg:col-span-9 min-h-[600px] z-10">


          <AnimatePresence mode="wait">

            {activeTab === 'home' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                key="home-tab"
                className="space-y-6 sm:space-y-8"
                id="home-view"
              >

                {/* Smart Reminders */}
                {childrenToNudge.length > 0 && (
                  <div className="space-y-3">
                    <Typography variant="h2" className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-50 flex items-center gap-2">
                      Reminders
                    </Typography>
                    <div className="space-y-3">
                      {childrenToNudge.map(child => {
                        const isNudged = child.has_pending_nudge || nudgedChildIds.includes(child.id);
                        return (
                          <div key={child.id} className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <ChildAvatar iconName={child.avatar_url} className="w-10 h-10 shrink-0" />
                              <div>
                                <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-50 text-sm">{child.name} hasn't logged any activity today.</Typography>
                                <Typography variant="body" className="text-stone-500 dark:text-stone-400 text-xs mt-1">Send a friendly reminder to complete their tasks!</Typography>
                              </div>
                            </div>
                            <StackedIconButton
                              variant={isNudged ? "neutral" : "primary"}
                              icon={Bell}
                              label={isNudged ? 'Nudged!' : 'Nudge'}
                              disabled={isNudged}
                              onClick={() => {
                                setNudgedChildIds(prev => [...prev, child.id]);
                                playSound.success();
                                onEditChild(child.id, {
                                  has_pending_nudge: true,
                                  last_nudge_time: new Date().toISOString()
                                });
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Needs Approval */}
                <div className="space-y-3">
                  <Typography variant="h3" className="text-lg font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">
                    Needs Approval
                  </Typography>

                  <ActivityFeed
                    activities={[
                      ...pendingApprovals.map(appr => {
                        const child = children.find(c => c.id === appr.child_id);
                        const task = tasks.find(t => t.id === appr.task_id);
                        return {
                          id: appr.id,
                          title: `${child?.name} finished ${task?.title}`,
                          date: new Date(appr.completed_at),
                          points: task?.points || 0,
                          type: 'task' as const,
                          status: 'pending' as const,
                          iconOverride: <ChildAvatar iconName={child?.avatar_url || 'Smile'} className="w-10 h-10 !rounded-xl bg-stone-50 dark:bg-stone-950" />,
                          actions: (
                            <>
                              <Button variant="secondary" size="sm" onClick={() => handleReject(appr.id)}>Deny</Button>
                              <Button variant="primary" size="sm" onClick={() => handleApprove(appr.id)}>Approve</Button>
                            </>
                          )
                        };
                      }),
                      ...pendingRedemptions.map(req => {
                        const child = children.find(c => c.id === req.child_id);
                        const reward = rewards.find(r => r.id === req.reward_id);
                        return {
                          id: req.id,
                          title: `${child?.name} claimed ${reward?.title}`,
                          date: new Date(req.redeemed_at),
                          points: reward?.cost_points || 0,
                          type: 'reward' as const,
                          status: 'pending' as const,
                          iconOverride: <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl">🎁</div>,
                          actions: (
                            <>
                              <Button variant="secondary" size="sm" onClick={() => onRejectReward(req.id)}>Deny</Button>
                              <Button variant="primary" size="sm" onClick={() => onDeliverReward(req.id)}>Approve</Button>
                            </>
                          )
                        };
                      }),
                      ...pendingGiftingRequests.map(req => {
                        const child = children.find(c => c.id === req.child_id);
                        const typeIcon = req.type === 'charity' ? '🌍' : '💝';
                        const title = req.type === 'charity' ? `Donate to ${req.charity_name}` : `Gift to ${children.find(c => c.id === req.sibling_id)?.name}`;
                        return {
                          id: req.id,
                          title: `${child?.name} wants to give!`,
                          subtitle: title,
                          date: new Date(req.created_at),
                          points: req.amount,
                          type: req.type as any,
                          status: 'pending' as const,
                          iconOverride: <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${req.type === 'charity' ? 'bg-emerald-50 text-emerald-500' : 'bg-pink-50 text-pink-500'}`}>{typeIcon}</div>,
                          actions: (
                            <>
                              <Button variant="secondary" size="sm" onClick={() => onRejectGiftingRequest && onRejectGiftingRequest(req.id)}>Deny</Button>
                              <Button variant="primary" size="sm" onClick={() => onApproveGiftingRequest && onApproveGiftingRequest(req.id)}>Approve</Button>
                            </>
                          )
                        };
                      })
                    ].sort((a, b) => b.date.getTime() - a.date.getTime())}
                    emptyMessage="All Caught Up! No pending tasks to approve."
                  />
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <Typography variant="h3" className="text-lg font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">
                    Recent Activity
                  </Typography>
                  <ActivityFeed
                    activities={[
                      ...completions.filter(c => c.status === 'approved').map(c => ({
                        id: c.id,
                        type: 'task' as const,
                        status: 'completed' as const,
                        title: tasks.find(t => t.id === c.task_id)?.title || 'Unknown Task',
                        points: tasks.find(t => t.id === c.task_id)?.points || 0,
                        date: new Date(c.completed_at),
                      })),
                      ...redemptions.filter(r => r.status === 'delivered').map(r => ({
                        id: r.id,
                        type: 'reward' as const,
                        status: 'delivered' as const,
                        title: rewards.find(rw => rw.id === r.reward_id)?.title || 'Unknown Reward',
                        points: rewards.find(rw => rw.id === r.reward_id)?.cost_points || 0,
                        date: new Date(r.redeemed_at),
                        iconOverride: <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400">🍦</div>
                      }))
                    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)}
                    emptyMessage="No recent activity yet."
                  />
                </div>

              </motion.div>
            )}

            {activeTab === 'chart' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                key="chart-tab"
                className="space-y-6 sm:space-y-8"
                id="chart-view"
              >
                {/* SUB-TABS FOR CHART & INSIGHTS (VISIBLE FOR BETA USERS) */}
                {(flags.insights_tab || parentProfile?.is_beta_tester) ? (
                  <>
                    <div className="flex w-full sm:max-w-md gap-1.5 bg-stone-100 dark:bg-stone-800/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white shadow-xs">
                      <Button variant="none" size="none"
                        id="tour-chart-subtab-weekly"
                        onClick={() => setChartSubTab('weekly')}
                        className={`flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 ${chartSubTab === 'weekly'
                          ? ('bg-white dark:bg-stone-900 text-cyan-600 shadow-md border border-cyan-100/50 scale-[1.02]')
                          : ('text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-800/60 border border-transparent')
                          }`}
                      >
                        <span>WEEKLY CHART</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-indigo-500 text-white shadow-2xs">
                          BETA
                        </span>
                      </Button>
                      <Button variant="none" size="none"
                        id="tour-chart-subtab-insights"
                        onClick={() => setChartSubTab('insights')}
                        className={`flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 ${chartSubTab === 'insights'
                          ? ('bg-white dark:bg-stone-900 text-cyan-600 shadow-md border border-cyan-100/50 scale-[1.02]')
                          : ('text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-800/60 border border-transparent')
                          }`}
                      >
                        <span>INSIGHTS</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-indigo-500 text-white shadow-2xs">
                          BETA
                        </span>
                      </Button>
                    </div>

                    {chartSubTab === 'weekly' && (
                      <WeeklyRewardChart
                        children={children}
                        tasks={tasks}
                        completions={completions}
                        onParentCompleteTask={onParentCompleteTask}
                        onApproveCompletion={onApproveCompletion}
                        onRejectCompletion={onRejectCompletion}
                        onDeleteCompletion={onRejectCompletion}
                      />
                    )}

                    {chartSubTab === 'insights' && (
                      <InsightsTab
                        children={children}
                        tasks={tasks}
                        completions={completions}
                      />
                    )}
                  </>
                ) : (
                  <WeeklyRewardChart
                    children={children}
                    tasks={tasks}
                    completions={completions}
                    onParentCompleteTask={onParentCompleteTask}
                    onApproveCompletion={onApproveCompletion}
                    onRejectCompletion={onRejectCompletion}
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'children' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                key="children-tab"
                className="space-y-6"
                id="children-view"
              >
                {/* Add Child button moved to header */}

                {/* showAddChild moved to a modal */}

                <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 xl:grid-cols-3">
                  {isLoading ? (
                    <>
                      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-3xl overflow-hidden shadow-sm relative p-5 pt-6 animate-pulse">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-20 h-20 rounded-2xl bg-stone-200"></div>
                          <div className="w-16 h-16 rounded-full bg-stone-200"></div>
                        </div>
                        <div className="w-48 h-8 bg-stone-200 rounded-lg mb-5"></div>
                        <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 bg-stone-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="w-20 h-2 bg-stone-200 rounded"></div>
                            <div className="w-32 h-3 bg-stone-200 rounded"></div>
                          </div>
                        </div>
                        <div className="w-full h-4 bg-stone-200 rounded-full mb-4"></div>
                        <div className="flex gap-2">
                          <div className="flex-1 h-10 bg-stone-200 rounded-xl"></div>
                          <div className="flex-1 h-10 bg-stone-200 rounded-xl"></div>
                          <div className="flex-1 h-10 bg-stone-200 rounded-xl"></div>
                          <div className="flex-1 h-10 bg-stone-200 rounded-xl"></div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-3xl overflow-hidden shadow-sm relative p-5 pt-6 animate-pulse hidden md:block">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-20 h-20 rounded-2xl bg-stone-200"></div>
                          <div className="w-16 h-16 rounded-full bg-stone-200"></div>
                        </div>
                        <div className="w-48 h-8 bg-stone-200 rounded-lg mb-5"></div>
                        <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 bg-stone-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="w-20 h-2 bg-stone-200 rounded"></div>
                            <div className="w-32 h-3 bg-stone-200 rounded"></div>
                          </div>
                        </div>
                        <div className="w-full h-4 bg-stone-200 rounded-full mb-4"></div>
                        <div className="flex gap-2">
                          <div className="flex-1 h-10 bg-stone-200 rounded-xl"></div>
                          <div className="flex-1 h-10 bg-stone-200 rounded-xl"></div>
                          <div className="flex-1 h-10 bg-stone-200 rounded-xl"></div>
                          <div className="flex-1 h-10 bg-stone-200 rounded-xl"></div>
                        </div>
                      </div>
                    </>
                  ) : sortedChildren.map((child) => {
                    const stage = getCharacterStage(child.character_id, child.level, parentProfile);
                    const pack = CHARACTER_PACKS.find(cp => cp.id === child.character_id) || CHARACTER_PACKS[0];
                    return (
                      <div
                        key={child.id}
                        className="w-full font-sans"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
                      >
                        {/* Rainbow Trading Card */}
                        <div className="w-full max-w-[440px] mx-auto md:mx-0 group perspective-1000">
                          <div 
                            className="relative w-full rounded-[2rem] p-2 shadow-xl hover:shadow-2xl transition-shadow duration-500 transform-gpu"
                            style={{ background: getPetStripeBackground(child.character_id) }}
                          >
                            <div className="bg-white dark:bg-stone-900 rounded-[1.5rem] border-[3px] border-stone-900/10 dark:border-white/10 shadow-inner flex flex-col h-full relative overflow-hidden">
                              {/* Foil Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-white/10 opacity-50 mix-blend-overlay pointer-events-none z-20"></div>

                              {/* Clickable Header — always visible, toggles body */}
                              <button
                                onClick={() => setExpandedChildId(expandedChildId === child.id ? null : child.id)}
                                className="w-full text-left p-5 pb-4 z-10 focus:outline-none"
                              >
                                {/* Top Header */}
                                <div className="flex justify-between items-center mb-4">
                                  <span className="text-sm font-black uppercase tracking-widest text-stone-800 dark:text-stone-100">{child.name}</span>
                                  <ChevronDown
                                    className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${expandedChildId === child.id ? 'rotate-180' : ''}`}
                                  />
                                </div>

                                {/* Characters Banner (Balance & Companion) */}
                                <div className="w-full h-24 bg-stone-100 dark:bg-stone-800 rounded-2xl border-2 border-stone-200 dark:border-stone-700 shadow-inner flex items-center relative overflow-hidden group/art">
                                  <div className="absolute inset-0 bg-gradient-to-br from-stone-200/50 to-transparent dark:from-stone-700/50 mix-blend-overlay"></div>
                                  <div className="flex-1 flex items-center justify-center relative z-10">
                                    <CoinBadge points={child.points} />
                                  </div>
                                  <div className="w-px h-12 bg-stone-200 dark:bg-stone-700 relative z-10 shrink-0"></div>
                                  <div className="flex-1 flex items-center justify-center relative z-10">
                                    {stage.model_url ? (
                                      <div className="relative w-14 h-14 group-hover/art:scale-110 transition-transform duration-500 drop-shadow-xl pointer-events-none">
                                        <div className="w-full h-full" style={{ transform: `scale(${stage.model_scale || 1.0})` }}>
                                          <model-viewer 
                                            src={stage.model_url} 
                                            alt={stage.name} 
                                            auto-rotate 
                                            camera-controls 
                                            class="w-full h-full"
                                          >
                                            <div slot="progress-bar"></div>
                                          </model-viewer>
                                        </div>
                                      </div>

                                    ) : (
                                      <span className="text-4xl group-hover/art:scale-110 transition-transform duration-500 drop-shadow-xl">{stage.emoji}</span>
                                    )}
                                  </div>
                                </div>
                              </button>

                              {/* Collapsible Body */}
                              <AnimatePresence initial={false}>
                                {expandedChildId === child.id && (
                                  <motion.div
                                    key="card-body"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-5 pb-5 flex flex-col gap-4">

                                      {/* Middle Stats (Level Info) */}
                                      <div className="flex flex-col gap-3 z-10 bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
                                        <div className="flex justify-between items-center px-1">
                                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Level {child.level}</span>
                                          <span className="text-amber-500 font-black text-[10px] uppercase tracking-widest">
                                            {child.lifetime_points ? child.lifetime_points % (parentProfile?.points_to_level_up ?? 500) : 0}/{parentProfile?.points_to_level_up ?? 500} GOLD
                                          </span>
                                        </div>
                                        <div className="w-full px-1">
                                          <div className="h-2.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden shadow-inner">
                                            <div
                                              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.5)]"
                                              style={{ width: `${(((child.lifetime_points || 0) % (parentProfile?.points_to_level_up ?? 500)) / (parentProfile?.points_to_level_up ?? 500)) * 100}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* App Linked Status Row */}
                                      {child.child_share_token?.startsWith('LINKED_') ? (
                                        <div className="flex items-center justify-between z-10 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                                          <div className="flex flex-col shrink-0 pr-2">
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 uppercase tracking-widest"><CheckCircle2 className="w-3.5 h-3.5" /> Linked Account</span>
                                          </div>
                                          <div className="flex items-center gap-2 justify-end">
                                            <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 break-all text-right" title={child.linked_email}>{child.linked_email || 'Linked'}</span>
                                            {onUnlinkChild && (
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-5 px-1.5 text-[9px] uppercase font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10" 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (confirm('Are you sure you want to unlink this device connection?')) {
                                                    onUnlinkChild(child.id);
                                                  }
                                                }}
                                              >
                                                Unlink
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-between z-10 bg-stone-50 dark:bg-stone-900/40 p-3 rounded-2xl border border-stone-100 dark:border-stone-800/50">
                                          <div className="flex flex-col shrink-0 pr-2">
                                            <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5 uppercase tracking-widest"><LinkIcon className="w-3.5 h-3.5" /> Link Device</span>
                                          </div>
                                          {child.child_share_token ? (
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-[12px] font-mono tracking-widest text-stone-600 dark:text-stone-300 font-bold">{child.child_share_token}</span>
                                              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] uppercase font-bold text-blue-500 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(child.child_share_token || ''); }}>Copy</Button>
                                            </div>
                                          ) : (
                                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] uppercase font-bold text-blue-500 hover:text-blue-600" onClick={(e) => {
                                              e.stopPropagation();
                                              const code = generateShortCode();
                                              onEditChild(child.id, { child_share_token: code });
                                            }}>Generate Code</Button>
                                          )}
                                        </div>
                                      )}

                                      {/* Action Buttons List */}
                                      <div className="bg-stone-50 dark:bg-stone-950/50 rounded-2xl border border-stone-100 dark:border-stone-800 p-2 z-10">
                                        <button onClick={() => openEditChild(child)} className="w-full flex items-center justify-between p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors group">
                                          <span className="text-sm font-bold text-stone-700 dark:text-stone-200 flex items-center gap-3">
                                            <Edit2 className="w-4 h-4 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300" />
                                            Edit Profile
                                          </span>
                                          <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-400" />
                                        </button>
                                        {onUpdateChildStats && parentProfile?.has_special_logins && (
                                          <button onClick={() => { playSound.click(); setAdjustmentsModalChildId(child.id); }} className="w-full flex items-center justify-between p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors group">
                                            <span className="text-sm font-bold text-stone-700 dark:text-stone-200 flex items-center gap-3">
                                              <Settings className="w-4 h-4 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300" />
                                              Adjust Balance
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-400" />
                                          </button>
                                        )}
                                        {onAddCoins && (
                                          <button onClick={() => { playSound.click(); setAddCoinsModalChildId(child.id); }} className="w-full flex items-center justify-between p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors group">
                                            <span className="text-sm font-bold text-emerald-600 flex items-center gap-3">
                                              <PlusCircle className="w-4 h-4 text-emerald-400 group-hover:text-emerald-500" />
                                              Add Coins
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-emerald-200 group-hover:text-emerald-400" />
                                          </button>
                                        )}
                                        {onDeductCoins && (
                                          <button onClick={() => { playSound.click(); setPenaltyModalChildId(child.id); }} className="w-full flex items-center justify-between p-3 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors group">
                                            <span className="text-sm font-bold text-rose-600 flex items-center gap-3">
                                              <MinusCircle className="w-4 h-4 text-rose-400 group-hover:text-rose-500" />
                                              Take Coins
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-rose-200 group-hover:text-rose-400" />
                                          </button>
                                        )}
                                        <button onClick={() => { playSound.click(); setShowHistoryForChild(child.id); }} className="w-full flex items-center justify-between p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors group">
                                          <span className="text-sm font-bold text-stone-700 dark:text-stone-200 flex items-center gap-3">
                                            <ScrollText className="w-4 h-4 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300" />
                                            View History
                                          </span>
                                          <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-400" />
                                        </button>
                                        {onDeleteChild && (
                                          <button onClick={() => { playSound.click(); setDeleteChildConfirmation({ childId: child.id, childName: child.name }); }} className="w-full flex items-center justify-between p-3 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors group">
                                            <span className="text-sm font-bold text-rose-600 flex items-center gap-3">
                                              <Trash2 className="w-4 h-4 text-rose-400 group-hover:text-rose-500" />
                                              Delete Profile
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-rose-200 group-hover:text-rose-400" />
                                          </button>
                                        )}
                                      </div>

                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                

              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                key="tasks-tab"
                className="space-y-6"
                id="tasks-view"
              >
                {/* Top action row merged with tabs below */}

                <AnimatePresence>
                  {showAddTask && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className={`w-full max-w-lg p-5 sm:p-6 rounded-3xl ${styles.cardBg} border border-stone-200 dark:border-stone-700 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto custom-scrollbar`}
                        id="add-task-box"
                      >

                        <Typography variant="h3" className="text-lg font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">
                          {editingTaskId ? <span><Edit2 className="inline-block mr-2" /> Edit Quest Template</span> : <span><Sparkles className="inline-block mr-2" /> Create Quest Template</span>}
                        </Typography>
                        <form onSubmit={handleTaskSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase tracking-widest mb-1`}>Quest Name</label>
                              <Input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Clean your room, finish maths workbook, brush teeth..." required />
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase tracking-widest mb-1`}>Gold Reward</label>
                                <Input type="number" min="0" value={taskPoints} onChange={e => setTaskPoints(e.target.value === '' ? '' as any : Number(e.target.value))} />
                              </div>
                            </div>

                            <div>
                              <label className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase tracking-widest mb-1`}>Recurrence Cycle</label>
                              <Select value={taskRecurrence} onChange={(e) => setTaskRecurrence(e.target.value as any)}>
                                <option value="daily">Daily Habit</option>
                                <option value="weekly">Weekly Chore</option>
                                <option value="one_time">One-off Mission</option>
                                <option value="repeatable">Repeatable (Cooldown)</option>
                              </Select>
                            </div>
                            {taskRecurrence === 'repeatable' && (
                              <div>
                                <label className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase tracking-widest mb-1`}>Cooldown (Minutes)</label>
                                <Input type="number" min="1" value={taskCooldownMinutes || ''} onChange={e => setTaskCooldownMinutes(e.target.value ? Number(e.target.value) : undefined)} required />
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              variant="warning"
                              className="flex-1"
                            >
                              {editingTaskId ? 'SAVE CHANGES' : 'ACTIVATE TEMPLATE'}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setShowAddTask(false);
                                setEditingTaskId(null);
                                setTaskTitle('');
                                setTaskPoints(15);
                                setTaskCooldownMinutes(undefined);
                              }}
                            >
                              CANCEL
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SUB-TABS AND ACTION BUTTONS FOR Tasks */}
                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-3 xl:gap-0 mb-2 sm:mb-4">
                  <div className="flex w-full xl:max-w-md gap-1.5 bg-stone-100 dark:bg-stone-800/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white shadow-sm">
                    <Button variant="none" size="none"
                      id="tour-task-subtab-directory"
                      onClick={() => setTaskSubTab('directory')}
                      className={`flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-widest transition-all duration-300 ${taskSubTab === 'directory'
                        ? ('bg-white dark:bg-stone-900 text-cyan-600 shadow-md border border-cyan-100/50 scale-[1.02]')
                        : ('text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-800/60 border border-transparent')
                        }`}
                    >
                      TEMPLATES
                    </Button>
                    <Button variant="none" size="none"
                      id="tour-task-subtab-active"
                      onClick={() => setTaskSubTab('active')}
                      className={`flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-widest transition-all duration-300 ${taskSubTab === 'active'
                        ? ('bg-white dark:bg-stone-900 text-cyan-600 shadow-md border border-cyan-100/50 scale-[1.02]')
                        : ('text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-800/60 border border-transparent')
                        }`}
                    >
                      ASSIGNED
                    </Button>
                    <Button variant="none" size="none"
                      id="tour-task-subtab-routines"
                      onClick={() => setTaskSubTab('routines')}
                      className={`flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-widest transition-all duration-300 ${taskSubTab === 'routines'
                        ? ('bg-white dark:bg-stone-900 text-cyan-600 shadow-md border border-cyan-100/50 scale-[1.02]')
                        : ('text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-800/60 border border-transparent')
                        }`}
                    >
                      ROUTINES
                    </Button>
                  </div>

                  {/* Task Directory Buttons moved to header */}
                </div>

                {/* QUEST DIRECTORY */}
                {taskSubTab === 'directory' && (
                  <div className="mt-0">
                    <div className="flex flex-col gap-0 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm">
                      {tasks.filter(t => t.is_template || t.child_id === 'directory').map((task, index, arr) => {
                        const instances = tasks.filter(t => t.template_id === task.id);
                        const assignedChildren = instances.map(i => children.find(c => c.id === i.child_id)?.name).filter(Boolean);
                        const isExpanded = expandedTaskTemplateId === task.id;

                        return (
                          <div key={task.id} className={`flex flex-col transition-all duration-300 ${index !== arr.length - 1 ? 'border-b border-stone-100 dark:border-stone-800' : ''}`}>
                            <div 
                              className={`flex justify-between items-center p-3 sm:p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${isExpanded ? 'bg-stone-50 dark:bg-stone-950' : ''}`}
                              onClick={() => {
                                playSound.click();
                                setExpandedTaskTemplateId(isExpanded ? null : task.id);
                              }}
                            >
                              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg sm:text-xl shrink-0 border border-amber-100/50">
                                  <FaStar />
                                </div>
                                <div className="min-w-0 pr-2">
                                  <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-50 text-sm truncate">{task.title}</Typography>
                                  <Typography variant="body" className="text-xs text-stone-400 mt-0.5 truncate">
                                    <span className="font-bold text-stone-700 dark:text-stone-200 capitalize">{(task.category || 'general').replace('_', ' ')}</span>
                                    <span className="mx-2">•</span>
                                    <span className={assignedChildren.length > 0 ? 'text-cyan-600 font-bold' : ''}>
                                      {assignedChildren.length > 0 ? `${assignedChildren.length} Assigned` : 'Unassigned'}
                                    </span>
                                  </Typography>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 shrink-0">
                                <CoinBadge points={task.points} size="md" />
                                <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-stone-50 dark:bg-stone-950/50"
                                >
                                  <div className="p-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
                                    <div className="flex flex-col gap-2">
                                      <Typography variant="body" className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest pl-1">
                                        Assign to:
                                      </Typography>
                                      <div className="flex flex-col gap-2">
                                        {children.map(child => {
                                          const isAssigned = instances.some(i => i.child_id === child.id);
                                          return (
                                            <div
                                              key={child.id}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                playSound.success();
                                                const currentAssignedIds = instances.map(i => i.child_id);
                                                const newAssignedIds = isAssigned
                                                  ? currentAssignedIds.filter(id => id !== child.id)
                                                  : [...currentAssignedIds, child.id];
                                                onAssignTask(task, newAssignedIds);
                                              }}
                                              className="flex items-center justify-between p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-200 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer transition-colors shadow-sm"
                                            >
                                              <div className="flex items-center gap-3">
                                                <ChildAvatar iconName={child.avatar_url} className="w-8 h-8 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700" />
                                                <span className="font-bold text-stone-700 dark:text-stone-200 text-sm">{child.name}</span>
                                              </div>
                                              
                                              <div className={`w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 ${isAssigned ? 'bg-cyan-500' : 'bg-stone-200'}`}>
                                                <div className={`w-5 h-5 bg-white dark:bg-stone-900 rounded-full mt-0.5 ml-0.5 transition-transform duration-300 shadow-sm ${isAssigned ? 'translate-x-5' : 'translate-x-0'}`} />
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                                      <Button variant="none" size="none" onClick={(e) => { e.stopPropagation(); openEditTask(task); }} className="px-4 py-2 rounded-2xl font-bold text-sm text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition-all flex items-center gap-2">
                                        <Edit2 className="w-4 h-4" /> Edit
                                      </Button>
                                      <Button variant="none" size="none" onClick={(e) => { e.stopPropagation(); playSound.click(); onDeleteTask(task.id); }} className="px-4 py-2 rounded-2xl font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all flex items-center gap-2">
                                        <Trash2 className="w-4 h-4" /> Delete
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ACTIVE QUESTS */}
                {taskSubTab === 'active' && (
                  <div className="mt-0">
                    <div className="flex flex-col gap-0 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm">
                      {tasks.filter(t => (!t.is_template && t.child_id !== 'directory') && children.some(c => c.id === t.child_id)).map((task, index, arr) => {
                        const assignedName = children.find(c => c.id === task.child_id)?.name;
                        const isExpanded = expandedActiveTaskId === task.id;

                        return (
                          <div key={task.id} className={`flex flex-col transition-all duration-300 ${index !== arr.length - 1 ? 'border-b border-stone-100 dark:border-stone-800' : ''}`}>
                            <div 
                              className={`flex justify-between items-center p-3 sm:p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${isExpanded ? 'bg-stone-50 dark:bg-stone-950' : ''}`}
                              onClick={() => {
                                playSound.click();
                                setExpandedActiveTaskId(isExpanded ? null : task.id);
                              }}
                            >
                              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg sm:text-xl shrink-0 border border-amber-100/50">
                                  <FaStar />
                                </div>
                                <div className="min-w-0 pr-2">
                                  <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-50 text-sm truncate">{task.title}</Typography>
                                  <Typography variant="body" className="text-xs text-stone-400 mt-0.5 truncate">
                                    <span className="font-bold text-stone-700 dark:text-stone-200 capitalize">{(task.category || 'general').replace('_', ' ')}</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-cyan-600 font-bold">Assigned to {assignedName || 'None'}</span>
                                  </Typography>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <CoinBadge points={task.points} size="md" />
                                <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-stone-50 dark:bg-stone-950/50"
                                >
                                  <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap justify-end items-center gap-2">
                                    <Button
                                      variant="none" size="none"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playSound.success();
                                        onParentCompleteTask(task.id, task.child_id);
                                      }}
                                      id={`parent-complete-${task.id}`}
                                      className="flex-1 sm:flex-none px-4 py-2 rounded-2xl font-bold text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_2px_8px_rgba(16,185,129,0.25)] transition-all flex items-center justify-center gap-2"
                                    >
                                      <Check className="w-4 h-4" /> Mark Complete
                                    </Button>

                                    <Button variant="none" size="none" onClick={(e) => { e.stopPropagation(); playSound.click(); onDeleteTask(task.id); }} className="px-4 py-2 rounded-2xl font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all flex items-center gap-2">
                                      <MinusCircle className="w-4 h-4" /> Unassign
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {taskSubTab === 'routines' && (
                  <div className="mt-0 space-y-6" id="routines-view">

                    {/* Select Child */}
                    <div className="flex w-fit max-w-full gap-1.5 bg-stone-100 dark:bg-stone-800/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white shadow-sm overflow-x-auto custom-scrollbar">
                      {children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => setRoutineChildId(child.id)}
                          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-widest whitespace-nowrap transition-all duration-300 ${routineChildId === child.id
                            ? ('bg-white dark:bg-stone-900 text-cyan-600 shadow-md border border-cyan-100/50 scale-[1.02]')
                            : ('text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-800/60 border border-transparent')
                            }`}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>

                    {routineChildId && (
                      <div className="space-y-6">
                        {(() => {
                          const child = children.find(c => c.id === routineChildId);
                          if (!child) return null;
                          
                          const DEFAULT_ROUTINES = [
                            { id: 'weekday', name: 'Weekday Routine' },
                            { id: 'weekend', name: 'Weekend Routine' },
                            { id: 'holiday', name: 'Holiday Routine' }
                          ];
                          
                          const currentRoutines = child.routines || [];
                          const processedRoutines = DEFAULT_ROUTINES.map(def => {
                            let existing = currentRoutines.find(r => r.id === def.id);
                            if (!existing) {
                              existing = currentRoutines.find(r => r.name.toLowerCase().includes(def.id));
                              if (existing) existing = { ...existing, id: def.id, name: def.name };
                            }
                            if (!existing && def.id === 'weekday' && currentRoutines.length > 0) {
                              const unassigned = currentRoutines.find(r => !DEFAULT_ROUTINES.some(d => d.id === r.id || r.name.toLowerCase().includes(d.id)));
                              if (unassigned) existing = { ...unassigned, id: def.id, name: def.name };
                            }
                            return existing || { ...def, morningTaskIds: [], afternoonTaskIds: [], eveningTaskIds: [] };
                          });

                          return (
                            <div className="space-y-6">
                              {/* Holiday Mode Toggle */}
                              <div className="bg-white dark:bg-stone-900 border dashboard-card border-stone-100 dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between">
                                <div>
                                  <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-50">Holiday Mode</Typography>
                                  <Typography variant="body" className="text-sm text-stone-500 dark:text-stone-400">When active, the Holiday routine will override the Weekday routine.</Typography>
                                </div>
                                <label className="flex items-center cursor-pointer relative">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only"
                                    checked={child.holiday_mode || false}
                                    onChange={(e) => onEditChild(child.id, { holiday_mode: e.target.checked })}
                                  />
                                  <div className={`w-11 h-6 rounded-full transition-colors duration-300 ease-in-out ${child.holiday_mode ? 'bg-cyan-500' : 'bg-stone-200'}`}>
                                    <div className={`w-5 h-5 bg-white dark:bg-stone-900 rounded-full shadow-md absolute top-0.5 transition-transform duration-300 ease-in-out ${child.holiday_mode ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                                  </div>
                                </label>
                              </div>

                              {processedRoutines.map((routine, rIdx) => {
                                const isExpanded = expandedRoutineId === routine.id;
                                const totalTasks = (routine.morningTaskIds?.length || 0) + (routine.afternoonTaskIds?.length || 0) + (routine.eveningTaskIds?.length || 0);
                                
                                return (
                                <div key={routine.id} className="bg-white dark:bg-stone-900 border dashboard-card border-stone-100 dark:border-stone-800 rounded-2xl flex flex-col transition-all duration-300 overflow-hidden">
                                  {/* Routine Summary Header */}
                                  <div 
                                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${isExpanded ? 'border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50' : ''}`}
                                    onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-50">{routine.name}</Typography>
                                        </div>
                                        <Typography variant="body" className="text-xs text-stone-400 mt-0.5">{totalTasks} tasks assigned</Typography>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expandable Content */}
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="p-4 space-y-6">
                                          {([
                                            { key: 'morningTaskIds', label: 'Morning' },
                                            { key: 'afternoonTaskIds', label: 'Afternoon' },
                                            { key: 'eveningTaskIds', label: 'Evening' },
                                          ] as const).map(period => {
                                            const periodTasks = routine[period.key] || [];
                                            return (
                                            <div key={period.key} className="space-y-3">
                                              <Typography variant="body" className="font-bold text-xs uppercase tracking-widest text-stone-400 pl-1">{period.label}</Typography>
                                              
                                              <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={(e) => handleDragEnd(e, child.id, routine.id, period.key)}
                                              >
                                                <SortableContext
                                                  items={periodTasks}
                                                  strategy={verticalListSortingStrategy}
                                                >
                                                  <div className="space-y-2">
                                                    {periodTasks.map(taskId => {
                                                      const t = tasks.find(x => x.id === taskId);
                                                      if (!t) return null;
                                                      return (
                                                        <SortableTaskItem
                                                          key={taskId}
                                                          id={taskId}
                                                          task={t}
                                                          onRemove={(id) => {
                                                            const newRoutines = processedRoutines.map((r, idx) => {
                                                              if (idx === rIdx) {
                                                                const pTasks = r[period.key] || [];
                                                                return {
                                                                  ...r,
                                                                  [period.key]: pTasks.filter(x => x !== id)
                                                                };
                                                              }
                                                              return { ...r };
                                                            });
                                                            onEditChild(child.id, { routines: newRoutines });
                                                          }}
                                                        />
                                                      );
                                                    })}
                                                  </div>
                                                </SortableContext>
                                              </DndContext>

                                              {periodTasks.length === 0 && (
                                                <div className="text-xs text-stone-400 italic py-3 text-center border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl">No tasks assigned for {period.label}.</div>
                                              )}

                                              <div className="mt-2 relative">
                                                <Select
                                                  
                                                  value=""
                                                  onChange={(e) => {
                                                    if (!e.target.value) return;
                                                    const newRoutines = processedRoutines.map((r, idx) => {
                                                      if (idx === rIdx) {
                                                        const pTasks = r[period.key] || [];
                                                        if (!pTasks.includes(e.target.value)) {
                                                          return {
                                                            ...r,
                                                            [period.key]: [...pTasks, e.target.value]
                                                          };
                                                        }
                                                      }
                                                      return { ...r };
                                                    });
                                                    onEditChild(child.id, { routines: newRoutines });
                                                  }}
                                                >
                                                  <option value="" disabled className="hidden">+ Add Quest to {period.label}</option>
                                                  {tasks.filter(t => t.child_id === child.id && !t.is_template && !periodTasks.includes(t.id)).map(t => (
                                                    <option key={t.id} value={t.id} className="text-stone-700 dark:text-stone-200">{t.title}</option>
                                                  ))}
                                                </Select>
                                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                  <Plus className="w-5 h-5 text-stone-400" />
                                                </div>
                                              </div>
                                            </div>
                                          );
                                          })}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. Rewards Catalogue Tab */}
            {activeTab === 'rewards' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                key="rewards-tab"
                className="space-y-6"
                id="rewards-view"
              >
                {/* Top action row merged with tabs below */}

                {/* Add Custom Reward Overlay */}
                <AnimatePresence>
                  {showAddReward && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className={`w-full max-w-lg p-5 sm:p-6 rounded-3xl ${styles.cardBg} border border-stone-200 dark:border-stone-700 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto custom-scrollbar`}
                        id="add-reward-box"
                      >

                        <Typography variant="h3" className="text-lg font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">
                          {editingRewardId ? <span><Edit2 className="inline-block mr-2" /> Edit Reward Token</span> : <span><Gift className="inline-block mr-2" /> Define Reward Token</span>}
                        </Typography>
                        <form onSubmit={handleRewardSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase tracking-widest mb-1`}>Prize Name</label>
                              <Input
                                type="text"
                                value={rewardTitle}
                                onChange={(e) => setRewardTitle(e.target.value)}
                                placeholder="iPad time, ice cream, toy..."
                                required
                              />
                            </div>
                            <div>
                              <label className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase tracking-widest mb-1`}>Point Cost</label>
                              <Input
                                type="number"
                                value={rewardCost}
                                onChange={(e) => setRewardCost(e.target.value === '' ? '' as any : Number(e.target.value))}
                                min="10"
                                max="500"
                                required
                              />
                            </div>

                            <div>
                              <label className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase tracking-widest mb-1`}>Select Theme Icon</label>
                              <Select
                                value={rewardIcon}
                                onChange={(e) => setRewardIcon(e.target.value)}
                              >
                                <option value="Gamepad2">🎮 Game Time</option>
                                <option value="Pizza">🍕 Favorite Meal</option>
                                <option value="Palette">🎨 Creative / Art</option>
                                <option value="BookOpen">📖 Storybooks</option>
                                <option value="Sparkles">✨ Special Trip</option>
                              </Select>
                            </div>
                            <div className="md:col-span-2">
                              <label className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase tracking-widest mb-1`}>Redemption Limit</label>
                              <Select
                                value={rewardLimit}
                                onChange={(e) => setRewardLimit(e.target.value as any)}
                              >
                                <option value="unlimited">♾️ Unlimited</option>
                                <option value="daily">📅 1x Daily</option>
                                <option value="twice_daily">✌️ 2x Daily (Requires cooldown)</option>
                                <option value="one_time">🎯 One-Time (Disappears after use)</option>
                              </Select>
                            </div>
                            <div className="md:col-span-2 flex items-center gap-2 mt-2">
                              <Input
                                type="checkbox"
                                id="rewardBadgeEligible"
                                checked={rewardBadgeEligible}
                                onChange={(e) => setRewardBadgeEligible(e.target.checked)}
                              />
                              <label htmlFor="rewardBadgeEligible" className={`text-xs font-sans text-stone-600 dark:text-stone-300`}>
                                Eligible as a free badge reward (Small Reward)
                              </label>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              variant="warning"
                              className="flex-1"
                            >
                              {editingRewardId ? 'SAVE CHANGES' : 'DEPLOY PRIZE SLOT'}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setShowAddReward(false);
                                setEditingRewardId(null);
                                setRewardTitle('');
                                setRewardCost(50);
                              }}
                            >
                              CANCEL
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SUB-TABS AND ACTION BUTTONS FOR Rewards */}
                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-3 xl:gap-0 mb-2 sm:mb-4">
                  <div className="flex w-full xl:max-w-md gap-1.5 bg-stone-100 dark:bg-stone-800/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white shadow-sm">
                    <Button variant="none" size="none"
                      id="tour-reward-subtab-directory"
                      onClick={() => setRewardSubTab('directory')}
                      className={`flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-widest transition-all duration-300 ${rewardSubTab === 'directory'
                        ? ('bg-white dark:bg-stone-900 text-cyan-600 shadow-md border border-cyan-100/50 scale-[1.02]')
                        : ('text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-800/60 border border-transparent')
                        }`}
                    >
                      TEMPLATES
                    </Button>
                    <Button variant="none" size="none"
                      id="tour-reward-subtab-active"
                      onClick={() => setRewardSubTab('active')}
                      className={`flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-widest transition-all duration-300 ${rewardSubTab === 'active'
                        ? ('bg-white dark:bg-stone-900 text-cyan-600 shadow-md border border-cyan-100/50 scale-[1.02]')
                        : ('text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-800/60 border border-transparent')
                        }`}
                    >
                      ASSIGNED
                    </Button>
                  </div>

                  {/* Reward Directory Buttons moved to header */}
                </div>

                {/* REWARD DIRECTORY */}
                {rewardSubTab === 'directory' && (
                  <div className="mt-0">
                    <div className="flex flex-col gap-0 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm">
                      {rewards.filter(r => r.is_template || r.child_id === 'directory').map((reward, index, arr) => {
                        const instances = rewards.filter(r => r.template_id === reward.id);
                        const assignedChildren = instances.map(i => children.find(c => c.id === i.child_id)?.name).filter(Boolean);
                        const isExpanded = expandedRewardTemplateId === reward.id;

                        return (
                          <div key={reward.id} className={`flex flex-col transition-all duration-300 ${index !== arr.length - 1 ? 'border-b border-stone-100 dark:border-stone-800' : ''}`}>
                            <div 
                              className={`flex justify-between items-center p-3 sm:p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${isExpanded ? 'bg-stone-50 dark:bg-stone-950' : ''}`}
                              onClick={() => {
                                playSound.click();
                                setExpandedRewardTemplateId(isExpanded ? null : reward.id);
                              }}
                            >
                              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center text-lg sm:text-xl shrink-0 border border-purple-100/50">
                                  <FaGift />
                                </div>
                                <div className="min-w-0 pr-2">
                                  <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-50 text-sm truncate">{reward.title}</Typography>
                                  <Typography variant="body" className="text-xs text-stone-400 mt-0.5 truncate">
                                    <span className="font-bold text-stone-700 dark:text-stone-200 capitalize">Limit: {(reward.limit_type || 'unlimited').replace('_', ' ')}</span>
                                    <span className="mx-2">•</span>
                                    <span className={assignedChildren.length > 0 ? 'text-cyan-600 font-bold' : ''}>
                                      {assignedChildren.length > 0 ? `${assignedChildren.length} Assigned` : 'Unassigned'}
                                    </span>
                                  </Typography>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 shrink-0">
                                <CoinBadge points={reward.cost_points} size="md" />
                                <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-stone-50 dark:bg-stone-950/50"
                                >
                                  <div className="p-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
                                    <div className="flex flex-col gap-2">
                                      <Typography variant="body" className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest pl-1">
                                        Assign to:
                                      </Typography>
                                      <div className="flex flex-col gap-2">
                                        {children.map(child => {
                                          const isAssigned = instances.some(i => i.child_id === child.id);
                                          return (
                                            <div
                                              key={child.id}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                playSound.success();
                                                const currentAssignedIds = instances.map(i => i.child_id);
                                                const newAssignedIds = isAssigned
                                                  ? currentAssignedIds.filter(id => id !== child.id)
                                                  : [...currentAssignedIds, child.id];
                                                onAssignReward(reward, newAssignedIds);
                                              }}
                                              className="flex items-center justify-between p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-200 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer transition-colors shadow-sm"
                                            >
                                              <div className="flex items-center gap-3">
                                                <ChildAvatar iconName={child.avatar_url} className="w-8 h-8 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700" />
                                                <span className="font-bold text-stone-700 dark:text-stone-200 text-sm">{child.name}</span>
                                              </div>
                                              
                                              <div className={`w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 ${isAssigned ? 'bg-cyan-500' : 'bg-stone-200'}`}>
                                                <div className={`w-5 h-5 bg-white dark:bg-stone-900 rounded-full mt-0.5 ml-0.5 transition-transform duration-300 shadow-sm ${isAssigned ? 'translate-x-5' : 'translate-x-0'}`} />
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                                      <Button variant="none" size="none" onClick={(e) => { e.stopPropagation(); openEditReward(reward); }} className="px-4 py-2 rounded-2xl font-bold text-sm text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition-all flex items-center gap-2">
                                        <Edit2 className="w-4 h-4" /> Edit
                                      </Button>
                                      <Button variant="none" size="none" onClick={(e) => { e.stopPropagation(); playSound.click(); onDeleteReward(reward.id); }} className="px-4 py-2 rounded-2xl font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all flex items-center gap-2">
                                        <Trash2 className="w-4 h-4" /> Delete
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>


                )}

                {/* ACTIVE Rewards */}
                {rewardSubTab === 'active' && (
                  <div className="mt-0">
                    <div className="flex flex-col gap-0 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm">
                      {rewards.filter(r => (!r.is_template && r.child_id !== 'directory') && children.some(c => c.id === r.child_id)).map((reward, index, arr) => {
                        const assignedName = children.find(c => c.id === reward.child_id)?.name;
                        const isExpanded = expandedActiveRewardId === reward.id;

                        return (
                          <div key={reward.id} className={`flex flex-col transition-all duration-300 ${index !== arr.length - 1 ? 'border-b border-stone-100 dark:border-stone-800' : ''}`}>
                            <div 
                              className={`flex justify-between items-center p-3 sm:p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${isExpanded ? 'bg-stone-50 dark:bg-stone-950' : ''}`}
                              onClick={() => {
                                playSound.click();
                                setExpandedActiveRewardId(isExpanded ? null : reward.id);
                              }}
                            >
                              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center text-lg sm:text-xl shrink-0 border border-purple-100/50">
                                  <FaGift />
                                </div>
                                <div className="min-w-0 pr-2">
                                  <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-50 text-sm truncate">
                                    {reward.title}
                                    {!reward.is_available && reward.limit_type === 'one_time' && (
                                      <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 font-bold uppercase align-middle">
                                        CLAIMED
                                      </span>
                                    )}
                                  </Typography>
                                  <Typography variant="body" className="text-xs text-stone-400 mt-0.5 truncate">
                                    <span className="font-bold text-stone-700 dark:text-stone-200 capitalize">Limit: {(reward.limit_type || 'unlimited').replace('_', ' ')}</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-cyan-600 font-bold">Assigned to {assignedName || 'None'}</span>
                                  </Typography>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-emerald-400 flex items-center justify-center bg-white dark:bg-stone-900 text-emerald-500 font-black text-sm">
                                  {reward.cost_points}
                                </span>
                                <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-stone-50 dark:bg-stone-950/50"
                                >
                                  <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-2">
                                    <Button variant="none" size="none" onClick={(e) => { e.stopPropagation(); playSound.click(); onDeleteReward(reward.id); }} className="px-4 py-2 rounded-2xl font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all flex items-center gap-2">
                                      <MinusCircle className="w-4 h-4" /> Unassign
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* History Log */}
                <div className="pt-8 border-t border-stone-800">
                  <Typography variant="h3" className={`font-bold font-sans text-sm text-stone-900 dark:text-stone-50 uppercase pb-4`}>
                    <ScrollText className="inline-block mr-2 text-stone-500 dark:text-stone-400" /> Dispensation History Log
                  </Typography>
                  <div className="space-y-3">
                    {redemptions.filter(r => r.status === 'delivered').length === 0 ? (
                      <Typography variant="body" className={`text-xs ${styles.textMuted}`}>No rewards have been dispensed yet.</Typography>
                    ) : (
                      redemptions
                        .filter(r => r.status === 'delivered')
                        .sort((a, b) => new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime())
                        .map(delivery => {
                          const child = children.find(c => c.id === delivery.child_id);
                          const reward = rewards.find(r => r.id === delivery.reward_id);
                          const isOneTimeUsed = reward?.limit_type === 'one_time' && !reward.is_available;

                          return (
                            <div key={delivery.id} className={`flex items-center justify-between p-4 rounded-xl border bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-700 ${styles.text}`}>
                              <div>
                                <span className="text-xs font-bold">{child?.name}</span> received <strong className={'text-stone-900 dark:text-stone-50'}>{reward?.title}</strong>
                                <Typography variant="body" className={`text-[10px] font-sans mt-1 ${styles.textMuted}`}>
                                  {new Date(delivery.redeemed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </Typography>
                              </div>
                              {isOneTimeUsed && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    playSound.success();
                                    onRestoreReward(reward.id);
                                  }}
                                  className="border-amber-500/50 text-amber-700 hover:bg-amber-50"
                                >
                                  RESTORE ONE-TIME
                                </Button>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </motion.div>
            )}


            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SettingsTab
                  children={children}
                  parentProfile={parentProfile}
                  linkedParents={linkedParents}
                  onResetData={onResetData}
                  onRunSetup={onRunSetup}
                  onDeleteAccount={onDeleteAccount}
                  onCleanDuplicates={handleCleanDuplicates}
                  onRequireAccount={onRequireAccount}
                  onUpdateParentProfile={onUpdateParentProfile}
                  activeSubTab={settingsSubTab}
                  onSubTabChange={setSettingsSubTab}
                />
              </motion.div>
            )}

            {activeTab === 'targets' && (
              <motion.div
                key="targets"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TargetsTab
                  
                  parentProfile={parentProfile}
                  onUpdateParentProfile={onUpdateParentProfile}
                />
              </motion.div>
            )}

            {activeTab === 'help' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <HelpTab onReplayTutorial={() => { setTourStepIndex(0); setActiveTab('home'); setRunTour(true); }} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        <AnimatePresence>
          {showAddChild && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowAddChild(false);
                  setEditingChildId(null);
                  setNewChildName('');
                  setNewChildAge('');
                  setNewChildChar('unicorn');
                  setNewChildAvatar('Rocket');
                }}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <Typography variant="h3" className="text-lg font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">
                  {editingChildId ? <span><Edit2 className="inline-block mr-2" /> Edit Child</span> : <span><UserPlus className="inline-block mr-2" /> Register Family Child</span>}
                </Typography>
                <form onSubmit={handleChildSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase tracking-widest mb-1`}>Child Name</label>
                      <Input
                        type="text"
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                        placeholder="Leo, Lily, Emma..."
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase tracking-widest mb-1`}>Age</label>
                      <Input
                        type="number"
                        value={newChildAge}
                        onChange={(e) => setNewChildAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        placeholder="Age"
                        min={1}
                        max={18}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-[9px] font-bold font-sans text-center ${styles.textMuted} uppercase tracking-widest mb-2`}>Choose Companion</label>
                      <div className="flex justify-center gap-4">
                        {CHARACTER_PACKS.map(char => (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => setNewChildChar(char.id)}
                            className={`aspect-square w-28 rounded-xl p-2 flex flex-col items-center justify-center border-2 transition-colors ${
                              newChildChar === char.id ? 'border-amber-400 bg-amber-50' : 'border-stone-200 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700'
                            }`}
                          >
                            {(() => {
                              const stage = getCharacterStage(char.id, 99);
                              return (
                                <div className="relative w-12 h-12 mb-1 pointer-events-none">
                                  <div className="w-full h-full" style={{ transform: `scale(${stage.model_scale || 1.0})` }}>
                                    <model-viewer 
                                      src={stage.model_url} 
                                      alt={char.name} 
                                      auto-rotate 
                                      camera-controls 
                                      class="w-full h-full"
                                    >
                                      <div slot="progress-bar"></div>
                                    </model-viewer>
                                  </div>
                                </div>
                              );
                            })()}
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${newChildChar === char.id ? 'text-amber-700' : 'text-stone-500 dark:text-stone-400'}`}>
                              {char.name.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[9px] font-bold font-sans ${styles.textMuted} uppercase tracking-widest mb-2`}>Select Avatar</label>
                    <div className="grid grid-cols-6 gap-2">
                      {PRECANNED_AVATARS.map(url => (
                        <Button variant="none" size="none"
                          key={url}
                          type="button"
                          onClick={() => setNewChildAvatar(url)}
                          className={`p-1 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${newChildAvatar === url ? ('border-amber-500 bg-amber-50 text-amber-500') : 'border-transparent text-stone-500 dark:text-stone-400 hover:border-stone-500/50 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                        >
                          <ChildAvatar iconName={url} className="w-full aspect-square !rounded-lg" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowAddChild(false);
                        setEditingChildId(null);
                        setNewChildName('');
                        setNewChildAge('');
                        setNewChildChar('unicorn');
                        setNewChildAvatar('Rocket');
                      }}
                      className="flex-1"
                    >
                      CANCEL
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                    >
                      {editingChildId ? 'SAVE CHANGES' : 'ADD CHILD & HATCH'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {adjustmentsModalChildId && onUpdateChildStats && (() => {
            const child = children.find(c => c.id === adjustmentsModalChildId);
            if (!child) return null;
            return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setAdjustmentsModalChildId(null)}
                  className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6 overflow-hidden"
                >
                  <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-2xl flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6" />
                  </div>
                  <Typography variant="h2" className="text-xl font-black text-stone-900 dark:text-stone-50 mb-6">
                    Quick Adjustments
                  </Typography>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-semibold text-black dark:text-white tracking-tight">Gold ({child.points})</span>
                      <div className="flex gap-1">
                        <Button variant="none" size="none" onClick={() => {
                          playSound.click();
                          setResetConfirmation({ childId: child.id, childName: child.name, type: 'Gold' });
                        }} className="p-2 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 bg-white dark:bg-stone-900" title="Reset Gold to 0"><RotateCcw className="w-4 h-4" /></Button>
                        <Button variant="none" size="none" onClick={() => { playSound.click(); onUpdateChildStats(child.id, { points: Math.max(0, child.points - 10), manual_deductions: (child.manual_deductions || 0) + 1 }); }} className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 bg-white dark:bg-stone-900" title="Remove 10 Gold"><MinusCircle className="w-4 h-4" /></Button>
                        <Button variant="none" size="none" onClick={() => { playSound.click(); onUpdateChildStats(child.id, { points: child.points + 10 }); }} className="p-2 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50 bg-white dark:bg-stone-900" title="Add 10 Gold"><PlusCircle className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <div className="h-[0.5px] bg-stone-200"></div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-semibold text-black dark:text-white tracking-tight">Lifetime Gold ({child.lifetime_points || 0})</span>
                      <div className="flex gap-1.5 justify-end">
                        <Button variant="none" size="none" onClick={() => {
                          playSound.click();
                          setResetConfirmation({ childId: child.id, childName: child.name, type: 'Lifetime Gold' });
                        }} className="p-2 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 bg-white dark:bg-stone-900" title="Reset Lifetime Gold to 0"><RotateCcw className="w-4 h-4" /></Button>
                        <Button variant="none" size="none" onClick={() => { playSound.click(); onUpdateChildStats(child.id, { lifetime_points: Math.max(0, (child.lifetime_points || 0) - 10), manual_deductions: (child.manual_deductions || 0) + 1 }); }} className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 bg-white dark:bg-stone-900" title="Remove 10 Gold"><MinusCircle className="w-4 h-4" /></Button>
                        <Button variant="none" size="none" onClick={() => { playSound.click(); onUpdateChildStats(child.id, { lifetime_points: (child.lifetime_points || 0) + 10 }); }} className="p-2 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50 bg-white dark:bg-stone-900" title="Add 10 Gold"><PlusCircle className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <div className="h-[0.5px] bg-stone-200"></div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-semibold text-black dark:text-white tracking-tight">Level ({child.level})</span>
                      <div className="flex gap-1">
                        <Button variant="none" size="none" onClick={() => {
                          playSound.click();
                          setResetConfirmation({ childId: child.id, childName: child.name, type: 'Level' });
                        }} className="p-2 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 bg-white dark:bg-stone-900" title="Reset Level to 1"><RotateCcw className="w-4 h-4" /></Button>
                        <Button variant="none" size="none" onClick={() => { playSound.click(); onUpdateChildStats(child.id, { level: Math.max(1, child.level - 1) }); }} className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 bg-white dark:bg-stone-900" title="Level Down"><ArrowDownCircle className="w-4 h-4" /></Button>
                        <Button variant="none" size="none" onClick={() => { playSound.click(); onUpdateChildStats(child.id, { level: child.level + 1 }); }} className="p-2 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50 bg-white dark:bg-stone-900" title="Level Up"><ArrowUpCircle className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <div className="h-[0.5px] bg-stone-200"></div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-semibold text-black dark:text-white tracking-tight">Food Items ({child.pet_food || 0})</span>
                      <div className="flex gap-1">
                        <Button variant="none" size="none" onClick={() => {
                          playSound.click();
                          setResetConfirmation({ childId: child.id, childName: child.name, type: 'Food' });
                        }} className="p-2 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 bg-white dark:bg-stone-900" title="Reset Food to 0"><RotateCcw className="w-4 h-4" /></Button>
                        <Button variant="none" size="none" onClick={() => { playSound.click(); onUpdateChildStats(child.id, { pet_food: Math.max(0, (child.pet_food || 0) - 1), food_pot_weekly_contribution: Math.max(0, (child.food_pot_weekly_contribution || 0) - 1) }); }} className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 bg-white dark:bg-stone-900" title="Remove 1 Food"><MinusCircle className="w-4 h-4" /></Button>
                        <Button variant="none" size="none" onClick={() => { playSound.click(); onUpdateChildStats(child.id, { pet_food: (child.pet_food || 0) + 1, food_pot_weekly_contribution: (child.food_pot_weekly_contribution || 0) + 1 }); }} className="p-2 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50 bg-white dark:bg-stone-900" title="Add 1 Food"><PlusCircle className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <Button variant="primary" fullWidth onClick={() => { playSound.click(); setAdjustmentsModalChildId(null); }}>
                      Done
                    </Button>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

        <AnimatePresence>
          {penaltyModalChildId && onDeductCoins && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPenaltyModalChildId(null)}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6 overflow-hidden"
              >
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                  <MinusCircle className="w-6 h-6" />
                </div>
                <Typography variant="h2" className="text-xl font-black text-stone-900 dark:text-stone-50 mb-2">
                  Take Coins
                </Typography>
                <Typography variant="body" className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                  Deduct coins from {children.find(c => c.id === penaltyModalChildId)?.name} and leave a reason in their activity log.
                </Typography>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold font-sans text-stone-400 uppercase tracking-widest mb-2">Amount to deduct</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        value={penaltyAmount}
                        onChange={(e) => setPenaltyAmount(e.target.value === '' ? '' as any : Math.max(1, parseInt(e.target.value) || 0))}
                      />
                      <Coins className="w-5 h-5 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold font-sans text-stone-400 uppercase tracking-widest mb-3">Reason for penalty</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['Not listening', 'Hitting', 'Refusing chores', 'Bad language', 'Lying'].map(reason => (
                        <button
                          key={reason}
                          onClick={() => setPenaltyReason(reason)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            penaltyReason === reason 
                              ? 'bg-rose-500 text-white shadow-md' 
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          if (['Not listening', 'Hitting', 'Refusing chores', 'Bad language', 'Lying'].includes(penaltyReason)) {
                            setPenaltyReason('');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          !['Not listening', 'Hitting', 'Refusing chores', 'Bad language', 'Lying'].includes(penaltyReason)
                            ? 'bg-rose-500 text-white shadow-md' 
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                        }`}
                      >
                        Other...
                      </button>
                    </div>

                    {!['Not listening', 'Hitting', 'Refusing chores', 'Bad language', 'Lying'].includes(penaltyReason) && (
                      <Input
                        type="text"
                        placeholder="Type custom reason..."
                        value={penaltyReason}
                        onChange={(e) => setPenaltyReason(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => { playSound.click(); setPenaltyModalChildId(null); setPenaltyReason(''); setPenaltyAmount(5); }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      playSound.click();
                      onDeductCoins(penaltyModalChildId, Number(penaltyAmount) || 0, penaltyReason || 'Penalty applied');
                      setPenaltyModalChildId(null);
                      setPenaltyReason('');
                      setPenaltyAmount(5);
                    }}
                    className="flex-1"
                    disabled={!penaltyReason.trim() || Number(penaltyAmount) <= 0}
                  >
                    Deduct Coins
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {addCoinsModalChildId && onAddCoins && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAddCoinsModalChildId(null)}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6 overflow-hidden"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <Typography variant="h2" className="text-xl font-black text-stone-900 dark:text-stone-50 mb-2">
                  Add Coins
                </Typography>
                <Typography variant="body" className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                  Add coins to {children.find(c => c.id === addCoinsModalChildId)?.name} and leave a reason in their activity log.
                </Typography>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold font-sans text-stone-400 uppercase tracking-widest mb-2">Amount to add</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        value={addCoinsAmount}
                        onChange={(e) => setAddCoinsAmount(e.target.value === '' ? '' as any : Math.max(1, parseInt(e.target.value) || 0))}
                      />
                      <Coins className="w-5 h-5 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold font-sans text-stone-400 uppercase tracking-widest mb-3">Reason for adding coins</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['Being helpful', 'Extra chores', 'Good behavior', 'Great sharing', 'Trying hard'].map(reason => (
                        <button
                          key={reason}
                          onClick={() => setAddCoinsReason(reason)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            addCoinsReason === reason 
                              ? 'bg-emerald-500 text-white shadow-md' 
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          if (['Being helpful', 'Extra chores', 'Good behavior', 'Great sharing', 'Trying hard'].includes(addCoinsReason)) {
                            setAddCoinsReason('');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          !['Being helpful', 'Extra chores', 'Good behavior', 'Great sharing', 'Trying hard'].includes(addCoinsReason)
                            ? 'bg-emerald-500 text-white shadow-md' 
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                        }`}
                      >
                        Other...
                      </button>
                    </div>

                    {!['Being helpful', 'Extra chores', 'Good behavior', 'Great sharing', 'Trying hard'].includes(addCoinsReason) && (
                      <Input
                        type="text"
                        placeholder="Type custom reason..."
                        value={addCoinsReason}
                        onChange={(e) => setAddCoinsReason(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => { playSound.click(); setAddCoinsModalChildId(null); setAddCoinsReason(''); setAddCoinsAmount(5); }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      playSound.click();
                      onAddCoins(addCoinsModalChildId, Number(addCoinsAmount) || 0, addCoinsReason || 'Bonus coins applied');
                      setAddCoinsModalChildId(null);
                      setAddCoinsReason('');
                      setAddCoinsAmount(5);
                    }}
                    className="flex-1"
                    disabled={!addCoinsReason.trim() || Number(addCoinsAmount) <= 0}
                  >
                    Add Coins
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {resetConfirmation && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setResetConfirmation(null)}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6 overflow-hidden"
              >
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <Typography variant="h2" className="text-xl font-black text-stone-900 dark:text-stone-50 mb-2">
                  Reset {resetConfirmation.type}?
                </Typography>
                <Typography variant="body" className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                  Are you sure you want to reset <span className="font-bold text-rose-500">{resetConfirmation.childName}'s</span> {resetConfirmation.type} to {resetConfirmation.type === 'Level' ? '1' : '0'}? This action cannot be undone.
                </Typography>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => { playSound.click(); setResetConfirmation(null); }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      playSound.purchase();
                      if (resetConfirmation.type === 'Gold') onUpdateChildStats(resetConfirmation.childId, { points: 0 });
                      if (resetConfirmation.type === 'Streak') onUpdateChildStats(resetConfirmation.childId, { streak_days: 0 });
                      if (resetConfirmation.type === 'Level') onUpdateChildStats(resetConfirmation.childId, { level: 1 });
                      if (resetConfirmation.type === 'Lifetime Gold') onUpdateChildStats(resetConfirmation.childId, { lifetime_points: 0 });
                      if (resetConfirmation.type === 'Food') onUpdateChildStats(resetConfirmation.childId, { pet_food: 0, food_pot_weekly_contribution: 0 });
                      setResetConfirmation(null);
                    }}
                    className="flex-1"
                  >
                    Reset Now
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Child Confirmation Modal */}
        <AnimatePresence>
          {deleteChildConfirmation && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteChildConfirmation(null)}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6 overflow-hidden"
              >
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6" />
                </div>
                <Typography variant="h2" className="text-xl font-black text-stone-900 dark:text-stone-50 mb-2">
                  Delete {deleteChildConfirmation.childName}?
                </Typography>
                <Typography variant="body" className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                  This will permanently delete <span className="font-bold text-rose-500">{deleteChildConfirmation.childName}</span> and all their tasks, rewards, and progress.
                </Typography>
                <Typography variant="body" className="text-xs font-bold text-rose-500 mb-6">
                  ⚠️ This action cannot be undone.
                </Typography>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => { playSound.click(); setDeleteChildConfirmation(null); }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      playSound.purchase();
                      if (onDeleteChild) onDeleteChild(deleteChildConfirmation.childId);
                      setDeleteChildConfirmation(null);
                    }}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Mobile Sticky Bottom Nav */}
        {!isDesktop && (
          <BottomTabBar
            tabs={[
              { id: 'home', label: 'Home', icon: Home, badge: totalPending },
              ...(isBetaUser ? [{ id: 'chart', label: 'Chart', icon: TrendingUp, isBeta: true }] : []),
              { id: 'children', label: 'Children', icon: Users },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
              { id: 'rewards', label: 'Rewards', icon: Gift },
              { id: 'targets', label: 'Targets', icon: Target }
            ]}
            activeTab={activeTab}
            onTabChange={(id) => { playSound.click(); setActiveTab(id as any); }}
            layoutId="parent-nav-pill"
          />
        )}
      </div>
      {/* Generate Quests Modal */}
      <AnimatePresence>
        {showGenerateTasksModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGenerateTasksModal(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <Typography variant="h2" className="text-xl font-black text-stone-900 dark:text-stone-50 mb-2">
                  {generatedTasksToPreview ? "Select Quests to Keep" : "Generate Quests"}
                </Typography>

                {!generatedTasksToPreview ? (
                  <>
                    <Typography variant="body" className="text-stone-500 dark:text-stone-400 text-sm mb-6">Select an age range and how many random quests you want to add to your template directory.</Typography>

                    <div className="space-y-4 mb-8">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Age Range</label>
                        <Select
                          value={generateAgeRange}
                          onChange={(e) => setGenerateAgeRange(e.target.value as any)}
                        >
                          <option value="all">All Ages</option>
                          <option value="3-5">3 - 5 years</option>
                          <option value="6-8">6 - 8 years</option>
                          <option value="9-12">9 - 12 years</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">How many?</label>
                        <div className="flex gap-2">
                          {[3, 5, 10, 20].map(num => (
                            <Button variant="none" size="none"
                              key={num}
                              onClick={() => setGenerateCount(num)}
                              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${generateCount === num ? 'bg-indigo-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'}`}
                            >
                              {num}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1" onClick={() => setShowGenerateTasksModal(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" className="flex-1" onClick={handleGenerateTasks}>
                        Generate
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Typography variant="body" className="text-stone-500 dark:text-stone-400 text-sm mb-6">We found {generatedTasksToPreview.length} new quests. Uncheck any you don't want to import.</Typography>
                    <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                      {generatedTasksToPreview.map(task => {
                        const isEditing = editingPreviewId === task.id;
                        return (
                          <div key={task.id} className={`flex flex-col gap-2 p-3 rounded-xl border ${isEditing ? 'border-indigo-400 bg-indigo-50/30' : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950'} transition-colors`}>
                            {isEditing ? (
                              <div className="flex flex-col gap-2 w-full">
                                <Input
                                  type="text"
                                  
                                  value={previewEditTitle}
                                  onChange={(e) => setPreviewEditTitle(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    
                                    value={previewEditPoints}
                                    onChange={(e) => setPreviewEditPoints(e.target.value === '' ? '' as any : parseInt(e.target.value) || 0)}
                                  />
                                  <Button size="sm" variant="primary" onClick={() => {
                                    setGeneratedTasksToPreview(prev => prev!.map(t => t.id === task.id ? { ...t, title: previewEditTitle, points: Number(previewEditPoints) || 0 } : t));
                                    setEditingPreviewId(null);
                                  }}>Save</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingPreviewId(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3 group">
                                <label className="flex items-start gap-3 cursor-pointer flex-1">
                                  <Input
                                    type="checkbox"
                                    
                                    checked={selectedTaskIdsForImport.includes(task.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedTaskIdsForImport(prev => [...prev, task.id]);
                                      } else {
                                        setSelectedTaskIdsForImport(prev => prev.filter(id => id !== task.id));
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <Typography variant="body" className="font-bold text-stone-900 dark:text-stone-50 text-sm">{task.title}</Typography>
                                    <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400">{task.points} pts • {task.recurrence}</Typography>
                                  </div>
                                </label>
                                <Button variant="none" size="none"
                                  type="button"
                                  className="p-1.5 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPreviewEditTitle(task.title);
                                    setPreviewEditPoints(task.points);
                                    setEditingPreviewId(task.id);
                                  }}
                                >
                                  <FaPen className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1" onClick={() => { setGeneratedTasksToPreview(null); setShowGenerateTasksModal(false); }}>
                        Cancel
                      </Button>
                      <Button variant="primary" className="flex-1" onClick={handleImportGeneratedTasks} disabled={selectedTaskIdsForImport.length === 0}>
                        Import Selected
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Generate Prizes Modal */}
      <AnimatePresence>
        {showGenerateRewardsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGenerateRewardsModal(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6" />
                </div>
                <Typography variant="h2" className="text-xl font-black text-stone-900 dark:text-stone-50 mb-2">
                  {generatedRewardsToPreview ? "Select Prizes to Keep" : "Generate Prizes"}
                </Typography>

                {!generatedRewardsToPreview ? (
                  <>
                    <Typography variant="body" className="text-stone-500 dark:text-stone-400 text-sm mb-6">Select an age range and how many random prizes you want to add to your directory.</Typography>

                    <div className="space-y-4 mb-8">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Age Range</label>
                        <Select
                          value={generateAgeRange}
                          onChange={(e) => setGenerateAgeRange(e.target.value as any)}
                        >
                          <option value="all">All Ages</option>
                          <option value="3-5">3 - 5 years</option>
                          <option value="6-8">6 - 8 years</option>
                          <option value="9-12">9 - 12 years</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">How many?</label>
                        <div className="flex gap-2">
                          {[3, 5, 10, 20].map(num => (
                            <Button variant="none" size="none"
                              key={num}
                              onClick={() => setGenerateCount(num)}
                              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${generateCount === num ? 'bg-amber-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'}`}
                            >
                              {num}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1" onClick={() => setShowGenerateRewardsModal(false)}>
                        Cancel
                      </Button>
                      <Button variant="warning" className="flex-1" onClick={handleGenerateRewards}>
                        Generate
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Typography variant="body" className="text-stone-500 dark:text-stone-400 text-sm mb-6">We found {generatedRewardsToPreview.length} new prizes. Uncheck any you don't want to import.</Typography>
                    <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                      {generatedRewardsToPreview.map(reward => {
                        const isEditing = editingPreviewId === reward.id;
                        return (
                          <div key={reward.id} className={`flex flex-col gap-2 p-3 rounded-xl border ${isEditing ? 'border-amber-400 bg-amber-50/30' : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950'} transition-colors`}>
                            {isEditing ? (
                              <div className="flex flex-col gap-2 w-full">
                                <Input
                                  type="text"
                                  
                                  value={previewEditTitle}
                                  onChange={(e) => setPreviewEditTitle(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    
                                    value={previewEditPoints}
                                    onChange={(e) => setPreviewEditPoints(e.target.value === '' ? '' as any : parseInt(e.target.value) || 0)}
                                  />
                                  <Button size="sm" variant="warning" onClick={() => {
                                    setGeneratedRewardsToPreview(prev => prev!.map(r => r.id === reward.id ? { ...r, title: previewEditTitle, cost_points: Number(previewEditPoints) || 0 } : r));
                                    setEditingPreviewId(null);
                                  }}>Save</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingPreviewId(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3 group">
                                <label className="flex items-start gap-3 cursor-pointer flex-1">
                                  <Input
                                    type="checkbox"
                                    
                                    checked={selectedRewardIdsForImport.includes(reward.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedRewardIdsForImport(prev => [...prev, reward.id]);
                                      } else {
                                        setSelectedRewardIdsForImport(prev => prev.filter(id => id !== reward.id));
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <Typography variant="body" className="font-bold text-stone-900 dark:text-stone-50 text-sm">{reward.title}</Typography>
                                    <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400">{reward.cost_points} pts • {reward.limit_type}</Typography>
                                  </div>
                                </label>
                                <Button variant="none" size="none"
                                  type="button"
                                  className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPreviewEditTitle(reward.title);
                                    setPreviewEditPoints(reward.cost_points);
                                    setEditingPreviewId(reward.id);
                                  }}
                                >
                                  <FaPen className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1" onClick={() => { setGeneratedRewardsToPreview(null); setShowGenerateRewardsModal(false); }}>
                        Cancel
                      </Button>
                      <Button variant="warning" className="flex-1" onClick={handleImportGeneratedRewards} disabled={selectedRewardIdsForImport.length === 0}>
                        Import Selected
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistoryForChild && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (historyDetailView) setHistoryDetailView(null);
                else setShowHistoryForChild(null);
              }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-md ${styles.cardBg} rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-700 p-6 flex flex-col overflow-hidden max-h-[90vh]`}
            >
              <Button variant="none" size="none"
                onClick={() => {
                  if (historyDetailView) setHistoryDetailView(null);
                  else setShowHistoryForChild(null);
                }}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>

              {(() => {
                const child = children.find(c => c.id === showHistoryForChild);
                if (!child) return null;
                const approvedTasks = completions.filter(c => c.child_id === child.id && c.status === 'approved');
                const tasksDone = approvedTasks.length;
                const penaltyCompletionsList = completions.filter(c => c.child_id === child.id && c.task_id === 'penalty');
                const penaltyCompletions = penaltyCompletionsList.length;
                const coinsTakenOff = penaltyCompletions + (child.gold_pot_total_leaked || 0) + (child.manual_deductions || 0);
                const claimedRewardsList = redemptions.filter(r => r.child_id === child.id && r.status === 'delivered');
                const rewardsClaimed = claimedRewardsList.length;

                if (historyDetailView) {
                  return (
                    <div className="flex flex-col h-full max-h-[80vh]">
                      <div className="flex items-center gap-3 mb-6">
                        <Button variant="none" size="none" onClick={() => setHistoryDetailView(null)} className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-full text-stone-600 dark:text-stone-300 transition-colors">
                          <RotateCcw className="w-5 h-5" />
                        </Button>
                        <Typography variant="h2" className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-50 font-display uppercase tracking-wide">
                          {historyDetailView === 'tasks' ? 'Tasks Completed' : historyDetailView === 'deductions' ? 'Deductions' : 'Rewards Claimed'}
                        </Typography>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        {historyDetailView === 'tasks' && (
                          approvedTasks.length === 0 ? <Typography variant="body" className="text-stone-500 dark:text-stone-400 text-center py-8">No tasks completed yet.</Typography> :
                            [...approvedTasks].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).map(c => {
                              const task = tasks.find(t => t.id === c.task_id);
                              return (
                                <div key={c.id} className="p-3 bg-white dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-700/50 backdrop-blur-md flex justify-between items-center">
                                  <div>
                                    <Typography variant="body" className="font-bold text-stone-800 dark:text-stone-100">{task?.title || 'Unknown Task'}</Typography>
                                    <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400">{new Date(c.completed_at).toLocaleDateString()}</Typography>
                                  </div>
                                  <span className="text-emerald-600 font-bold">+{c.points_awarded}</span>
                                </div>
                              );
                            })
                        )}
                        {historyDetailView === 'deductions' && (
                          <>
                            {[...penaltyCompletionsList].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).map(c => (
                              <div key={c.id} className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 backdrop-blur-md flex justify-between items-center">
                                <div>
                                  <Typography variant="body" className="font-bold text-rose-800">{c.notes || 'Penalty'}</Typography>
                                  <Typography variant="body" className="text-xs text-rose-500">{new Date(c.completed_at).toLocaleDateString()}</Typography>
                                </div>
                                <span className="text-rose-600 font-bold">{c.points_awarded}</span>
                              </div>
                            ))}
                            {(child.manual_deductions || 0) > 0 && (
                              <div className="p-3 bg-white dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-700/50 backdrop-blur-md flex justify-between items-center">
                                <div>
                                  <Typography variant="body" className="font-bold text-stone-800 dark:text-stone-100">Quick Adjustments (Manual)</Typography>
                                </div>
                                <span className="text-stone-600 dark:text-stone-300 font-bold">{child.manual_deductions} times</span>
                              </div>
                            )}
                            {(child.gold_pot_total_leaked || 0) > 0 && (
                              <div className="p-3 bg-white dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-700/50 backdrop-blur-md flex justify-between items-center">
                                <div>
                                  <Typography variant="body" className="font-bold text-stone-800 dark:text-stone-100">Gold Pot Leaks</Typography>
                                </div>
                                <span className="text-stone-600 dark:text-stone-300 font-bold">{child.gold_pot_total_leaked} coins</span>
                              </div>
                            )}
                            {coinsTakenOff === 0 && <Typography variant="body" className="text-stone-500 dark:text-stone-400 text-center py-8">No deductions recorded.</Typography>}
                          </>
                        )}
                        {historyDetailView === 'rewards' && (
                          claimedRewardsList.length === 0 ? <Typography variant="body" className="text-stone-500 dark:text-stone-400 text-center py-8">No rewards claimed yet.</Typography> :
                            [...claimedRewardsList].sort((a, b) => new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime()).map(r => {
                              const reward = rewards.find(rw => rw.id === r.reward_id);
                              return (
                                <div key={r.id} className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 backdrop-blur-md flex justify-between items-center">
                                  <div>
                                    <Typography variant="body" className="font-bold text-indigo-800">{reward?.title || 'Unknown Reward'}</Typography>
                                    <Typography variant="body" className="text-xs text-indigo-500">{new Date(r.redeemed_at).toLocaleDateString()}</Typography>
                                  </div>
                                  <span className="text-indigo-600 font-bold">-{r.payment_source === 'badge_freebie' ? 0 : (reward?.cost_points || 0)}</span>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div>
                    <Typography variant="h2" className="text-xl sm:text-2xl font-black text-center text-stone-900 dark:text-stone-50 mb-6 font-display uppercase tracking-wide flex items-center justify-center gap-2">
                      <ScrollText className="w-6 h-6 text-indigo-500" />
                      {child.name}'s History
                    </Typography>

                    <div className="space-y-6">
                      
                      {/* Coins Section */}
                      <div className="bg-white dark:bg-stone-900/40 border border-stone-200 dark:border-stone-700/50 backdrop-blur-md rounded-3xl overflow-hidden divide-y divide-stone-200/50">
                        <div className="flex justify-between items-center p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-xl">
                              <Coins className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="font-bold text-stone-700 dark:text-stone-200">Lifetime Earned</span>
                          </div>
                          <span className="font-black text-amber-600 flex items-center gap-1">{child.lifetime_points || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-stone-500/10 rounded-xl">
                              <Calendar className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                            </div>
                            <span className="font-bold text-stone-700 dark:text-stone-200">Weekly Coins</span>
                          </div>
                          <span className="font-black text-stone-800 dark:text-stone-100">{child.weekly_points || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-stone-500/10 rounded-xl">
                              <Calendar className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                            </div>
                            <span className="font-bold text-stone-700 dark:text-stone-200">Monthly Coins</span>
                          </div>
                          <span className="font-black text-stone-800 dark:text-stone-100">{child.monthly_points || 0}</span>
                        </div>
                      </div>

                      {/* Interactive Logs Section */}
                      <div className="bg-white dark:bg-stone-900/40 border border-stone-200 dark:border-stone-700/50 backdrop-blur-md rounded-3xl overflow-hidden divide-y divide-stone-200/50">
                        <button onClick={() => setHistoryDetailView('tasks')} className="w-full flex justify-between items-center p-4 hover:bg-white dark:hover:bg-stone-800/30 transition-colors text-left active:bg-white dark:active:bg-stone-900/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                              <CheckSquare className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="font-bold text-stone-700 dark:text-stone-200">Tasks Completed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-800 dark:text-stone-100">{tasksDone}</span>
                            <ChevronRight className="w-4 h-4 text-stone-400" />
                          </div>
                        </button>
                        <button onClick={() => setHistoryDetailView('rewards')} className="w-full flex justify-between items-center p-4 hover:bg-white dark:hover:bg-stone-800/30 transition-colors text-left active:bg-white dark:active:bg-stone-900/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                              <Gift className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="font-bold text-stone-700 dark:text-stone-200">Rewards Claimed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-800 dark:text-stone-100">{rewardsClaimed}</span>
                            <ChevronRight className="w-4 h-4 text-stone-400" />
                          </div>
                        </button>
                        <button onClick={() => setHistoryDetailView('deductions')} className="w-full flex justify-between items-center p-4 hover:bg-white dark:hover:bg-stone-800/30 transition-colors text-left active:bg-white dark:active:bg-stone-900/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/10 rounded-xl">
                              <MinusCircle className="w-5 h-5 text-rose-600" />
                            </div>
                            <span className="font-bold text-stone-700 dark:text-stone-200">Deductions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-800 dark:text-stone-100">{coinsTakenOff}</span>
                            <ChevronRight className="w-4 h-4 text-stone-400" />
                          </div>
                        </button>
                      </div>

                      {/* Progression Section */}
                      <div className="bg-white dark:bg-stone-900/40 border border-stone-200 dark:border-stone-700/50 backdrop-blur-md rounded-3xl overflow-hidden divide-y divide-stone-200/50">
                        <div className="flex justify-between items-center p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/10 rounded-xl">
                              <Star className="w-5 h-5 text-cyan-600" />
                            </div>
                            <span className="font-bold text-stone-700 dark:text-stone-200">Current Level</span>
                          </div>
                          <span className="font-black text-stone-800 dark:text-stone-100">Level {child.level}</span>
                        </div>
                        <div className="flex justify-between items-center p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-xl">
                              <Flame className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="font-bold text-stone-700 dark:text-stone-200">Current Streak</span>
                          </div>
                          <span className="font-black text-stone-800 dark:text-stone-100">{child.streak_days} Days</span>
                        </div>
                        {child.savings_unlocked && (
                          <div className="flex justify-between items-center p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <PiggyBank className="w-5 h-5 text-emerald-600" />
                              </div>
                              <span className="font-bold text-stone-700 dark:text-stone-200">Savings Account</span>
                            </div>
                            <span className="font-black text-emerald-600 flex items-center gap-1">{child.savings_pot || 0}</span>
                          </div>
                        )}
                        {child.food_pot_unlocked && (
                          <div className="flex justify-between items-center p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Utensils className="w-5 h-5 text-blue-600" />
                              </div>
                              <span className="font-bold text-stone-700 dark:text-stone-200">Pet Fed Total</span>
                            </div>
                            <span className="font-black text-stone-800 dark:text-stone-100">{child.pet_fed_total || 0} times</span>
                          </div>
                        )}
                        {child.gifting_unlocked && (
                          <div className="flex justify-between items-center p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-pink-500/10 rounded-xl">
                                <Heart className="w-5 h-5 text-pink-600" />
                              </div>
                              <span className="font-bold text-stone-700 dark:text-stone-200">Gifts Sent</span>
                            </div>
                            <span className="font-black text-stone-800 dark:text-stone-100">{child.gifts_made || child.gifts_sent_total || 0}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
