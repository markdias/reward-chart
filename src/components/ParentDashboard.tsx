import { 
  FaStar, FaHeart, FaEgg, FaBurst, FaWandMagicSparkles, FaHeartCrack,
  FaFaceSadTear, FaBone, FaCartShopping, FaGamepad, FaFaceFrown, FaCircleCheck, FaTriangleExclamation,
  FaBullseye, FaGift, FaJar, FaCoins, FaPiggyBank, FaBowlFood, FaGlobe, FaCat, FaWater, FaBook,
  FaChildDress, FaChild, FaCrown, FaFire, FaShield, FaBullhorn, FaBroom, FaPen, FaBaby, FaBolt,
  FaPizzaSlice, FaPalette, FaBookOpen, FaInfinity, FaCalendar, FaHandPeace, FaScroll, FaRocket
} from 'react-icons/fa6';
import React, { useState, useEffect } from 'react';
import { Typography } from './ui/Typography';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckSquare, Trophy, Bell, ShieldAlert, Sparkles, Plus, 
  Trash2, LogOut, Check, X, ShieldCheck, Heart, UserPlus, 
  BookOpen, Lock, RefreshCw, Coins, Info, HelpCircle, Activity, Award, Settings, CheckCircle2, Edit2, TrendingUp, ArrowUpCircle, ArrowDownCircle, PlusCircle, MinusCircle, Eye, EyeOff, RotateCcw, ChevronDown, MessageSquare, Send, Target, Gift, ScrollText
} from 'lucide-react';
import { Child, Task, TaskCompletion, Reward, RewardRedemption, GiftingRequest } from '../types';
import { CHARACTER_PACKS, getCharacterStage, PRECANNED_AVATARS } from '../data/characters';
import { playSound } from '../utils/sound';
import { PREMADE_TASKS, PREMADE_REWARDS } from '../data/premadeTemplates';
import { EXTENDED_TASKS, EXTENDED_REWARDS } from '../data/extendedTemplates';
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { ParentProfile } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import { Capacitor } from '@capacitor/core';
import SettingsTab from './SettingsTab';
import TargetsTab from './TargetsTab';
import { CoinBadge } from './CoinBadge';
import { Tooltip } from './ui/Tooltip';
import { ChildAvatar } from './ChildAvatar';
import { LinearProgressBar } from './ProgressBar';
import { Button } from './ui/Button';
import { BottomTabBar } from './ui/BottomTabBar';

interface ParentDashboardProps {
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  onAddChild: (name: string, characterId: string, avatarUrl: string, age?: number) => void;
  onEditChild: (id: string, updates: Partial<Child>) => void;
  onDeleteChild?: (id: string) => void;
  onUpdateChildStats: (id: string, updates: Partial<Child>) => void;
  onDeductCoins?: (childId: string, amount: number, reason: string) => void;
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
  theme: ThemeId;
  onParentCompleteTask: (taskId: string, childId: string) => void;
  giftingRequests: GiftingRequest[];
  onApproveGiftingRequest: (id: string) => void;
  onRejectGiftingRequest: (id: string) => void;
  parentProfile?: ParentProfile | null;
  linkedParents?: ParentProfile[];
  onRequireAccount?: () => void;
  onResetData?: (keepBlueprints: boolean) => void;
  onRunSetup?: () => void;
  onDeleteAccount?: () => void;
  onLogout?: () => void;
  onUpdateParentProfile?: (updates: Partial<ParentProfile>) => void;
  initialTab?: 'approvals' | 'children' | 'tasks' | 'rewards' | 'compliance' | 'settings' | 'targets';
  isLoading?: boolean;
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
  onUpdateChildStats,
  onDeductCoins,
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
  theme,
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
  initialTab = 'approvals',
  isLoading = false
}: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'approvals' | 'children' | 'tasks' | 'rewards' | 'compliance' | 'settings' | 'targets'>(initialTab);
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Scroll to top when switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const [taskSubTab, setTaskSubTab] = useState<'directory' | 'active'>('directory');
  const [rewardSubTab, setRewardSubTab] = useState<'directory' | 'active'>('directory');
  const [expandedAdjustments, setExpandedAdjustments] = useState<Record<string, boolean>>({});
  const [selectingChildForTaskId, setSelectingChildForTaskId] = useState<string | null>(null);



  // Sort children alphabetically so they don't jump around
  const sortedChildren = [...children].sort((a, b) => a.name.localeCompare(b.name));
  
  // Custom Confirmation Modal State
  const [resetConfirmation, setResetConfirmation] = useState<{childId: string, childName: string, type: 'Gold' | 'Level' | 'Streak'} | null>(null);
  const [deleteChildConfirmation, setDeleteChildConfirmation] = useState<{childId: string, childName: string} | null>(null);
  const [showHistoryForChild, setShowHistoryForChild] = useState<string | null>(null);
  const [historyDetailView, setHistoryDetailView] = useState<'tasks' | 'deductions' | 'rewards' | null>(null);
  // Penalty Modal State
  const [penaltyModalChildId, setPenaltyModalChildId] = useState<string | null>(null);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(5);
  const [penaltyReason, setPenaltyReason] = useState<string>('');
  
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
  const styles = THEME_PRESETS[theme];

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
    
    // Find duplicate task blueprints
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

    // Find duplicate reward blueprints
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
      alert(`Successfully removed ${deletedCount} duplicate blueprints!`);
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
      onAddTask(taskTitle, taskPoints, taskCategory, taskRecurrence, taskCooldownMinutes);
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
        cost_points: rewardCost,
        icon_name: rewardIcon,
        limit_type: rewardLimit,
        is_badge_eligible: rewardBadgeEligible
      });
    } else {
      onAddReward(rewardTitle, rewardCost, rewardIcon, rewardLimit, rewardBadgeEligible);
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
    <div className={`min-h-screen bg-stone-50 text-dark flex flex-col font-sans relative pt-[calc(max(env(safe-area-inset-top),0.5rem)+68px)] sm:pt-[calc(max(env(safe-area-inset-top),0.5rem)+88px)]`} id="parent-dashboard-root">
      {/* Ambient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-400/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] right-[-5%] w-80 h-80 bg-purple-400/10 rounded-full blur-[100px]"></div>
      </div>

      <header 
        className="fixed top-0 left-0 right-0 bg-white border-b border-stone-100 z-50 pb-2 sm:pb-3"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <Tooltip content="Settings" position="bottom">
              <button
                onClick={() => setActiveTab('settings')}
                className="h-11 w-11 sm:h-14 sm:w-14 rounded-[1.25rem] bg-white border-[3px] border-stone-100 shadow-sm flex items-center justify-center shrink-0 hover:bg-stone-50 hover:border-stone-200 transition-all active:scale-95 text-stone-600"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </Tooltip>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl sm:text-4xl font-black text-stone-900 leading-none tracking-tight font-display">
                Parent Center
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-base text-stone-500 font-semibold mt-1.5">
                {parentProfile?.name && <span>{parentProfile.name}</span>}
                {parentProfile?.name && parentProfile?.family_name && <span className="opacity-50">•</span>}
                {parentProfile?.family_name && <span>{parentProfile.family_name}</span>}
                {(parentProfile?.name || parentProfile?.family_name) && <span className="opacity-50">•</span>}
                <span className="truncate">{parentEmail}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="flex items-center bg-stone-50/80 backdrop-blur-sm border border-stone-200 rounded-full shadow-sm p-1 sm:p-1.5 gap-1 shrink-0">
              {onLogout && (
                <Tooltip content="Sign Out" position="bottom">
                  <button
                    onClick={() => {
                      playSound.click();
                      onLogout();
                    }}
                    className="px-4 h-10 sm:h-11 rounded-full flex items-center justify-center text-stone-600 font-bold text-xs sm:text-sm tracking-widest hover:text-stone-800 hover:bg-stone-200 transition-colors shrink-0"
                    id="global-logout-btn"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">SIGN OUT</span>
                  </button>
                </Tooltip>
              )}
              <Tooltip content="Switch to Kid View" position="bottom">
                <button
                  onClick={() => {
                    playSound.click();
                    onExitParentMode();
                  }}
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors shrink-0"
                  id="exit-to-child-view-btn"
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 relative z-10 mt-2 sm:mt-4 px-2 sm:px-6 lg:px-8 gap-4 max-w-7xl mx-auto w-full pb-24" id="parent-workspace">
        
        <aside className={`hidden lg:flex lg:flex-col lg:col-span-3 space-y-6 self-start`}>
          <nav className="flex flex-col gap-2" id="parent-sidebar-nav">
            {[
              { id: 'approvals', label: 'INBOX & APPROVALS', icon: CheckSquare, badge: totalPending },
              { id: 'children', label: 'CHILDREN', icon: Users, count: children.length },
              { id: 'tasks', label: 'QUESTS', icon: CheckSquare, count: tasks.filter(t => t.is_template).length },
              { id: 'rewards', label: 'PRIZES', icon: Trophy, count: rewards.filter(r => r.is_template !== false && r.child_id === 'directory').length },
              { id: 'targets', label: 'TARGETS & POTS', icon: Target },
              { id: 'settings', label: 'SETTINGS / ADMIN', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { playSound.click(); setActiveTab(tab.id as any); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl text-[11px] font-sans font-bold uppercase tracking-widest transition-all cursor-pointer duration-300 ${
                    isSelected 
                      ? 'bg-stone-900 text-white shadow-md shadow-stone-900/10 scale-[1.02]'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900 hover:scale-[1.01]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-stone-400'}`} strokeWidth={isSelected ? 2.5 : 2} /> 
                    {tab.label}
                  </span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`${isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'} text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow-sm`}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-stone-400' : 'text-stone-400'} font-bold`}>
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="lg:col-span-9 min-h-[600px] z-10">
          
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-stone-50 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-4xl font-black text-stone-900 leading-none mb-1 sm:mb-2">{approvedCompletionsCount}</span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-stone-400 uppercase">COMPLETED</span>
            </div>
            
            <div className="bg-stone-50 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-4xl font-black text-stone-900 leading-none mb-1 sm:mb-2">{children.length}</span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-stone-400 uppercase">ACTIVE</span>
            </div>
            
            <div className="bg-rose-50 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-4xl font-black text-rose-500 leading-none mb-1 sm:mb-2">{totalPending}</span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-rose-500 uppercase">PENDING</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {activeTab === 'approvals' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                key="approvals-tab"
                className="space-y-6 sm:space-y-8"
                id="approvals-view"
              >
                
                {/* Smart Reminders */}
                {childrenToNudge.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      Smart Reminders
                    </h2>
                    <div className="space-y-3">
                      {childrenToNudge.map(child => {
                        const isNudged = child.has_pending_nudge || nudgedChildIds.includes(child.id);
                        return (
                          <div key={child.id} className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <ChildAvatar iconName={child.avatar_url} className="w-10 h-10" />
                              <div>
                                <h3 className="font-bold text-stone-900 text-sm">{child.name} hasn't logged any activity today.</h3>
                                <p className="text-stone-500 text-xs mt-1">Send a friendly reminder to complete their tasks!</p>
                              </div>
                            </div>
                            <Button 
                              variant={isNudged ? "secondary" : "primary"} 
                              size="sm" 
                              className="shrink-0"
                              disabled={isNudged}
                              onClick={() => {
                                setNudgedChildIds(prev => [...prev, child.id]);
                                playSound.success();
                                onEditChild(child.id, { 
                                  has_pending_nudge: true, 
                                  last_nudge_time: new Date().toISOString() 
                                });
                              }}
                            >
                              {isNudged ? 'Nudged!' : 'Send Nudge'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Needs Approval */}
                <div className="space-y-3">
                  <h2 className="text-base sm:text-lg font-black text-stone-900">
                    Needs Approval
                  </h2>
                  
                  {totalPending === 0 ? (
                    <div className="bg-stone-50 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                      <div className="text-4xl mb-3 text-amber-400">✨</div>
                      <h3 className="font-black text-stone-900 text-sm mb-1">All Caught Up!</h3>
                      <p className="text-stone-400 text-xs">No pending tasks to approve.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingApprovals.map((appr) => {
                        const child = children.find(c => c.id === appr.child_id);
                        const task = tasks.find(t => t.id === appr.task_id);
                        return (
                          <div key={appr.id} className="bg-white border dashboard-card border-stone-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex gap-4">
                              <ChildAvatar iconName={child?.avatar_url || 'Smile'} className="w-12 h-12 !rounded-xl bg-stone-50" />
                              <div>
                                <p className="font-bold text-stone-900 text-sm">{child?.name} finished {task?.title}</p>
                                <p className="text-xs text-stone-400 mt-0.5">{new Date(appr.completed_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="secondary" size="sm" onClick={() => handleReject(appr.id)}>Deny</Button>
                              <Button variant="primary" size="sm" onClick={() => handleApprove(appr.id)}>Approve</Button>
                            </div>
                          </div>
                        )
                      })}
                      
                      {pendingRedemptions.map((req) => {
                        const child = children.find(c => c.id === req.child_id);
                        const reward = rewards.find(r => r.id === req.reward_id);
                        return (
                          <div key={req.id} className="bg-white border dashboard-card border-stone-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl">🎁</div>
                              <div>
                                <p className="font-bold text-stone-900 text-sm">{child?.name} claimed {reward?.title}</p>
                                <p className="text-xs text-stone-400 mt-0.5">{new Date(req.redeemed_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="secondary" size="sm" onClick={() => onRejectReward(req.id)}>Deny</Button>
                              <Button variant="primary" size="sm" onClick={() => onDeliverReward(req.id)}>Approve</Button>
                            </div>
                          </div>
                        )
                      })}

                      {pendingGiftingRequests.map((req) => {
                        const child = children.find(c => c.id === req.child_id);
                        const typeIcon = req.type === 'charity' ? '🌍' : '💝';
                        const title = req.type === 'charity' ? `Donate to ${req.charity_name}` : `Gift to ${children.find(c => c.id === req.sibling_id)?.name}`;
                        return (
                          <div key={req.id} className="bg-white border dashboard-card border-stone-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${req.type === 'charity' ? 'bg-emerald-50 text-emerald-500' : 'bg-pink-50 text-pink-500'}`}>
                                {typeIcon}
                              </div>
                              <div>
                                <p className="font-bold text-stone-900 text-sm">{child?.name} wants to give!</p>
                                <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">{title} (<CoinBadge points={req.amount} size="sm" />)</p>
                                <p className="text-[10px] text-stone-300 mt-0.5">{new Date(req.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="secondary" size="sm" onClick={() => onRejectGiftingRequest && onRejectGiftingRequest(req.id)}>Deny</Button>
                              <Button variant="primary" size="sm" onClick={() => onApproveGiftingRequest && onApproveGiftingRequest(req.id)}>Approve</Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <h2 className="text-base sm:text-lg font-black text-stone-900">
                    Recent Activity
                  </h2>
                  <div className="space-y-2">
                    {[
                      ...completions.filter(c => c.status === 'approved').map(c => ({
                        id: c.id,
                        type: 'task',
                        title: tasks.find(t => t.id === c.task_id)?.title || 'Unknown Task',
                        points: tasks.find(t => t.id === c.task_id)?.points || 0,
                        date: new Date(c.completed_at),
                      })),
                      ...redemptions.filter(r => r.status === 'delivered').map(r => ({
                        id: r.id,
                        type: 'reward',
                        title: rewards.find(rw => rw.id === r.reward_id)?.title || 'Unknown Reward',
                        points: rewards.find(rw => rw.id === r.reward_id)?.cost_points || 0,
                        date: new Date(r.redeemed_at),
                      }))
                    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10).map((activity, i) => (
                      <div key={`${activity.id}-${i}`} className="bg-white border dashboard-card border-stone-100 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${activity.type === 'task' ? 'bg-emerald-50 text-emerald-500' : 'bg-stone-50 text-stone-500'}`}>
                            {activity.type === 'task' ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : '🍦'}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 text-xs sm:text-sm">{activity.title}</p>
                            <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5">{activity.date.toLocaleString([], { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className={`font-black text-xs sm:text-sm shrink-0 flex items-center justify-center`}>
                          <CoinBadge points={activity.points} size="sm" disabled={activity.type !== 'task'} />
                        </div>
                      </div>
                    ))}
                    {[...completions.filter(c => c.status === 'approved'), ...redemptions.filter(r => r.status === 'delivered')].length === 0 && (
                      <div className="text-center p-8 text-stone-400 text-xs">No recent activity yet.</div>
                    )}
                  </div>
                </div>

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
                <div className="flex justify-end items-center">
                  <Button
                    variant="dark"
                    onClick={() => { playSound.click(); setShowAddChild(true); }}
                    id="add-child-btn-top"
                    leftIcon={<UserPlus className="w-4 h-4" />}
                  >
                    ADD CHILD
                  </Button>
                </div>

                {showAddChild && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl ${styles.cardBg} border border-stone-200 shadow-2xl space-y-4`}
                    id="add-child-box"
                  >
                    <h3 className={`font-bold text-lg text-stone-900 font-display uppercase tracking-wide`}>
                      {editingChildId ? <span><FaPen className="inline-block mr-2"/> Edit Child</span> : <span><FaBaby className="inline-block mr-2"/> Register Family Child</span>}
                    </h3>
                    <form onSubmit={handleChildSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Child Name</label>
                          <input
                            type="text"
                            value={newChildName}
                            onChange={(e) => setNewChildName(e.target.value)}
                            placeholder="Leo, Lily, Emma..."
                            className={`w-full px-3 py-2 bg-white border dashboard-card border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Age</label>
                          <input
                            type="number"
                            value={newChildAge}
                            onChange={(e) => setNewChildAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            placeholder="Age"
                            min={1}
                            max={18}
                            className={`w-full px-3 py-2 bg-white border dashboard-card border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Companion Egg Species</label>
                          <select
                            value={newChildChar}
                            onChange={(e) => setNewChildChar(e.target.value)}
                            className={`w-full px-3 py-2 bg-white border dashboard-card border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                          >
                            {CHARACTER_PACKS.map(char => (
                              <option key={char.id} value={char.id}>
                                {char.name} ({char.pack_name})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-2`}>Select Avatar</label>
                        <div className="grid grid-cols-6 gap-2">
                          {PRECANNED_AVATARS.map(url => (
                            <button
                              key={url}
                              type="button"
                              onClick={() => setNewChildAvatar(url)}
                              className={`p-1 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${newChildAvatar === url ? ('border-amber-500 bg-amber-50 text-amber-500') : 'border-transparent text-stone-500 hover:border-stone-500/50 hover:bg-stone-50'}`}
                            >
                              <ChildAvatar iconName={url} className="w-full aspect-square !rounded-lg" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          variant="warning"
                          className="flex-1"
                        >
                          {editingChildId ? 'SAVE CHANGES' : 'ADD CHILD & HATCH EGG'}
                        </Button>
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
                        >
                          CANCEL
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {isLoading ? (
                    <>
                      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm relative p-5 pt-6 animate-pulse">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-20 h-20 rounded-[1.25rem] bg-stone-200"></div>
                          <div className="w-16 h-16 rounded-full bg-stone-200"></div>
                        </div>
                        <div className="w-48 h-8 bg-stone-200 rounded-lg mb-5"></div>
                        <div className="p-3 rounded-2xl bg-stone-100 flex items-center gap-3 mb-5">
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
                      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm relative p-5 pt-6 animate-pulse hidden md:block">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-20 h-20 rounded-[1.25rem] bg-stone-200"></div>
                          <div className="w-16 h-16 rounded-full bg-stone-200"></div>
                        </div>
                        <div className="w-48 h-8 bg-stone-200 rounded-lg mb-5"></div>
                        <div className="p-3 rounded-2xl bg-stone-100 flex items-center gap-3 mb-5">
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
                    const stage = getCharacterStage(child.character_id, child.level);
                    const pack = CHARACTER_PACKS.find(cp => cp.id === child.character_id);
                    return (
                      <div
                        key={child.id}
                        className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm relative p-5 pt-6"
                      >
                        {onDeleteChild && (
                          <div className="absolute top-4 right-4 z-20">
                            <Tooltip content="Delete Child" position="top">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { playSound.click(); setDeleteChildConfirmation({ childId: child.id, childName: child.name }); }}
                                className="text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-full h-8 w-8 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                          </div>
                        )}
                        
                        <div className="relative">
                          <div className="flex justify-between items-start mb-4">
                            <div className="relative">
                              <ChildAvatar 
                                iconName={child.avatar_url} 
                                className="w-20 h-20 !rounded-[1.25rem] bg-stone-50 relative z-10" 
                              />
                            </div>
                            
                            <div className="flex items-start gap-4">
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] border-amber-300 bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg sm:text-xl shadow-sm">
                                     {child.points}
                                  </div>
                                  <span className="text-[10px] font-bold text-stone-400 mt-1.5 uppercase tracking-widest">Gold</span>
                                </div>
                                {child.savings_unlocked && (
                                   <div className="flex flex-col items-center">
                                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] border-emerald-300 bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg sm:text-xl shadow-sm">
                                         {child.savings_pot}
                                      </div>
                                      <span className="text-[10px] font-bold text-stone-400 mt-1.5 uppercase tracking-widest">Saved</span>
                                   </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-black text-2xl text-stone-900 font-display leading-tight">
                              {child.name} {child.age ? <span className="text-lg text-stone-500 font-normal ml-2">({child.age})</span> : ''}
                            </h3>
                          </div>

                          <div className="mt-5 p-3 rounded-2xl bg-stone-50/50 border border-stone-100 flex items-center gap-3">
                             {stage.image_url ? (
                                <img src={stage.image_url} alt={stage.name} className="w-10 h-10 drop-shadow-sm" />
                             ) : (
                                <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">{stage.emoji}</span>
                             )}
                             <div className="flex-1">
                               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-0.5">Companion</p>
                               <p className="text-sm font-bold text-stone-700 leading-none">{pack?.name.split(' the ')[0] || 'Unknown'} <span className="opacity-50 font-normal">Stage {stage.stage_number}</span></p>
                             </div>
                          </div>
                          
                          <div className="mt-5">
                            <div className="flex justify-between items-center mb-2 px-1 font-mono">
                              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">Level {child.level}</span>
                              <span className="text-xs font-extrabold text-stone-900 whitespace-nowrap">{(child.lifetime_points || 0) % (parentProfile?.points_to_level_up ?? 500)} / {parentProfile?.points_to_level_up ?? 500} Gold</span>
                            </div>
                            <LinearProgressBar progress={(((child.lifetime_points || 0) % (parentProfile?.points_to_level_up ?? 500)) / (parentProfile?.points_to_level_up ?? 500)) * 100} heightClass="h-4" />
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            {onUpdateChildStats && (
                              <Tooltip content="Quick Adjustments" position="top">
                                <button 
                                  onClick={() => setExpandedAdjustments(prev => ({ ...prev, [child.id]: !prev[child.id] }))}
                                  className={`px-4 py-2.5 rounded-xl ${expandedAdjustments[child.id] ? 'bg-stone-200 text-stone-700' : 'bg-stone-100/50 text-stone-500'} border border-stone-200/50 text-xs font-bold flex items-center justify-center gap-2 hover:bg-stone-100 hover:text-stone-700 transition-colors`}
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                              </Tooltip>
                            )}
                            {onDeductCoins && (
                              <Tooltip content="Take Coins" position="top">
                                <button 
                                  onClick={() => { playSound.click(); setPenaltyModalChildId(child.id); }}
                                  className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center hover:bg-rose-100 transition-colors"
                                >
                                  <MinusCircle className="w-4 h-4" />
                                </button>
                              </Tooltip>
                            )}
                            <Tooltip content="Edit Child" position="top">
                              <button 
                                onClick={() => openEditChild(child)}
                                className="px-4 py-2.5 rounded-xl bg-stone-100/50 border border-stone-200/50 text-stone-500 text-xs font-bold flex items-center justify-center hover:bg-stone-100 hover:text-stone-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="History" position="top">
                              <button 
                                onClick={() => { playSound.click(); setShowHistoryForChild(child.id); }}
                                className="px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center hover:bg-indigo-100 transition-colors"
                              >
                                <ScrollText className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </div>

                          {onUpdateChildStats && (
                            <AnimatePresence>
                              {expandedAdjustments[child.id] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mt-4 overflow-hidden"
                                >
                                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`text-xs font-mono text-stone-500 font-bold uppercase tracking-widest`}>Gold</span>
                                      <div className="flex gap-1">
                                        <button onClick={() => { 
                                          playSound.click(); 
                                          setResetConfirmation({childId: child.id, childName: child.name, type: 'Gold'});
                                        }} className={`p-2 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 bg-white`} title="Reset Gold to 0"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { points: Math.max(0, child.points - 10), manual_deductions: (child.manual_deductions || 0) + 1 }); }} className={`p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 bg-white`} title="Remove 10 Gold"><MinusCircle className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { points: child.points + 10 }); }} className={`p-2 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50 bg-white`} title="Add 10 Gold"><PlusCircle className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`text-xs font-mono text-stone-500 font-bold uppercase tracking-widest`}>Lifetime Gold</span>
                                      <div className="flex gap-1.5 justify-end">
                                        <button onClick={() => { 
                                          playSound.click(); 
                                          setResetConfirmation({childId: child.id, childName: child.name, type: 'Lifetime Gold'});
                                        }} className={`p-2 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 bg-white`} title="Reset Lifetime Gold to 0"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { lifetime_points: Math.max(0, (child.lifetime_points || 0) - 10), manual_deductions: (child.manual_deductions || 0) + 1 }); }} className={`p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 bg-white`} title="Remove 10 Gold"><MinusCircle className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { lifetime_points: (child.lifetime_points || 0) + 10 }); }} className={`p-2 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50 bg-white`} title="Add 10 Gold"><PlusCircle className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`text-xs font-mono text-stone-500 font-bold uppercase tracking-widest`}>Level</span>
                                      <div className="flex gap-1">
                                        <button onClick={() => { 
                                          playSound.click(); 
                                          setResetConfirmation({childId: child.id, childName: child.name, type: 'Level'});
                                        }} className={`p-2 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 bg-white`} title="Reset Level to 1"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { level: Math.max(1, child.level - 1) }); }} className={`p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 bg-white`} title="Level Down"><ArrowDownCircle className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { level: child.level + 1 }); }} className={`p-2 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50 bg-white`} title="Level Up"><ArrowUpCircle className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}
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
                    className={`w-full max-w-lg p-5 sm:p-6 rounded-3xl ${styles.cardBg} border border-stone-200 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto custom-scrollbar`}
                    id="add-task-box"
                  >

                    <h3 className={`font-bold text-lg text-stone-900 font-display uppercase tracking-wide`}>
                      {editingTaskId ? <span><Edit2 className="inline-block mr-2"/> Edit Quest Blueprint</span> : <span><Sparkles className="inline-block mr-2"/> Create Quest Blueprint</span>}
                    </h3>
                    <form onSubmit={handleTaskSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Quest Name</label>
                          <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="Clean your room, finish maths workbook, brush teeth..."
                            className={`w-full px-3 py-2 bg-white border dashboard-card border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            required
                          />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Gold Reward</label>
                            <input
                              type="number"
                              min="0"
                              value={taskPoints}
                              onChange={e => setTaskPoints(Number(e.target.value))}
                              className={`w-full px-3 py-2 bg-white border dashboard-card border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Recurrence Cycle</label>
                          <select
                            value={taskRecurrence}
                            onChange={(e) => setTaskRecurrence(e.target.value as any)}
                            className={`w-full px-3 py-2 bg-white border dashboard-card border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                          >
                            <option value="daily">Daily Habit</option>
                            <option value="weekly">Weekly Chore</option>
                            <option value="one_time">One-off Mission</option>
                            <option value="repeatable">Repeatable (Cooldown)</option>
                          </select>
                        </div>
                        {taskRecurrence === 'repeatable' && (
                          <div>
                            <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Cooldown (Minutes)</label>
                            <input
                              type="number"
                              min="1"
                              value={taskCooldownMinutes || ''}
                              onChange={e => setTaskCooldownMinutes(e.target.value ? Number(e.target.value) : undefined)}
                              className={`w-full px-3 py-2 bg-white border dashboard-card border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                              required
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          variant="warning"
                          className="flex-1"
                        >
                          {editingTaskId ? 'SAVE CHANGES' : 'ACTIVATE BLUEPRINT'}
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

                {/* SUB-TABS AND ACTION BUTTONS FOR TASKS */}
                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-3 xl:gap-0 border-b border-stone-200/50 pb-3 mb-4 sm:pb-4 sm:mb-6">
                  <div className="flex w-full xl:max-w-md gap-1 bg-stone-100/80 p-1.5 rounded-full border border-stone-200/60">
                    <button
                      onClick={() => setTaskSubTab('directory')}
                      className={`flex-1 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-widest transition-all ${
                        taskSubTab === 'directory'
                          ? ('bg-stone-900 text-white shadow-sm')
                          : ('text-stone-500 hover:text-stone-900 hover:bg-stone-200/50')
                      }`}
                    >
                      BLUEPRINTS
                    </button>
                    <button
                      onClick={() => setTaskSubTab('active')}
                      className={`flex-1 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-widest transition-all ${
                        taskSubTab === 'active'
                          ? ('bg-stone-900 text-white shadow-sm')
                          : ('text-stone-500 hover:text-stone-900 hover:bg-stone-200/50')
                      }`}
                    >
                      ASSIGNED
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full xl:w-auto mt-2 xl:mt-0">
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-2.5"
                      onClick={() => { 
                        playSound.click(); 
                        setGenerateAgeRange(getRecommendedAgeRange());
                        setShowGenerateTasksModal(true); 
                      }}
                      leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      GENERATE <span className="hidden sm:inline">IDEAS</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-2.5"
                      onClick={handleImportDefaultTasks}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      IMPORT <span className="hidden sm:inline">DEFAULTS</span>
                    </Button>
                    <Button
                      variant="dark"
                      className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-2.5"
                      onClick={() => { playSound.click(); setShowAddTask(true); }}
                      id="add-chore-btn-top"
                      leftIcon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    >
                      CREATE <span className="hidden sm:inline">TEMPLATE</span>
                    </Button>
                  </div>
                </div>

                {/* QUEST DIRECTORY */}
                {taskSubTab === 'directory' && (
                <div className="mt-2 sm:mt-4">
                  <h3 className={`text-base sm:text-xl font-black font-display ${styles.titleColor} mb-3 sm:mb-4 hidden sm:block`}>QUEST DIRECTORY (BLUEPRINTS)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.filter(t => t.is_template).map((task) => {
                      const instances = tasks.filter(t => t.template_id === task.id);
                      const assignedChildren = instances.map(i => children.find(c => c.id === i.child_id)?.name).filter(Boolean);
                      
                      return (
                        <div key={task.id} className="bg-white border dashboard-card border-stone-100 p-4 rounded-2xl flex flex-col gap-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl shrink-0">
                                <FaStar />
                              </div>
                              <div>
                                <h3 className="font-bold text-stone-900 text-sm">{task.title}</h3>
                                <p className="text-xs text-stone-400 mt-0.5">
                                  Assigned: <span className="font-bold text-stone-700">{assignedChildren.length > 0 ? assignedChildren.join(', ') : 'No one'}</span>
                                  <span className="mx-2">•</span>
                                  Category: <span className="font-bold text-stone-700 capitalize">{(task.category || 'general').replace('_', ' ')}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <CoinBadge points={task.points} size="lg" />
                            </div>
                          </div>

                          <div className="flex justify-between items-center border-t border-stone-50 pt-3 mt-1">
                            <button
                              onClick={() => {
                                playSound.click();
                                setSelectingChildForTaskId(selectingChildForTaskId === task.id ? null : task.id);
                              }}
                              className="text-xs font-bold text-stone-900 hover:text-stone-700"
                            >
                              Assign to Child
                            </button>

                            <div className="flex gap-2">
                              <Tooltip content="Edit Blueprint" position="top">
                                <Button variant="ghost" size="icon" onClick={() => openEditTask(task)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </Tooltip>
                              <Tooltip content="Delete Blueprint" position="top">
                                <Button variant="ghost" size="icon" onClick={() => { playSound.click(); onDeleteTask(task.id); }} className="text-stone-400 hover:text-rose-500 hover:bg-rose-50">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </Tooltip>
                            </div>
                          </div>

                          <AnimatePresence>
                            {selectingChildForTaskId === task.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t pt-3 mt-1 flex flex-col gap-2 overflow-hidden border-stone-100"
                              >
                                <p className="text-[10px] font-mono font-bold text-stone-500 uppercase">
                                  Select children to assign this quest:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {children.map(child => {
                                    const isAssigned = instances.some(i => i.child_id === child.id);
                                    return (
                                      <button
                                        key={child.id}
                                        onClick={() => {
                                          playSound.success();
                                          const currentAssignedIds = instances.map(i => i.child_id);
                                          const newAssignedIds = isAssigned 
                                            ? currentAssignedIds.filter(id => id !== child.id)
                                            : [...currentAssignedIds, child.id];
                                          onAssignTask(task, newAssignedIds);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-extrabold transition-all cursor-pointer ${
                                          isAssigned
                                            ? ('bg-warning border-neutral-border text-dark shadow-[0_2px_0_0_var(--color-dark-shadow)]')
                                            : ('bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100')
                                        }`}
                                      >
                                        <ChildAvatar iconName={child.avatar_url} className="w-5 h-5 bg-white border dashboard-card border-stone-700/50" />
                                        <span>{child.name}</span>
                                        {isAssigned && <Check className="w-3 h-3" />}
                                      </button>
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
                </div>

                )}

                {/* ACTIVE QUESTS */}
                {taskSubTab === 'active' && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.filter(t => !t.is_template).map((task) => {
                    const assignedName = children.find(c => c.id === task.child_id)?.name;
                    return (
                      <div key={task.id} className="bg-white border dashboard-card border-stone-100 p-4 rounded-2xl flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl shrink-0">
                              <FaStar />
                            </div>
                            <div>
                              <h3 className="font-bold text-stone-900 text-sm">{task.title}</h3>
                              <p className="text-xs text-stone-400 mt-0.5">
                                Assigned: <span className="font-bold text-stone-700">{assignedName || 'None'}</span>
                                <span className="mx-2">•</span>
                                Category: <span className="font-bold text-stone-700 capitalize">{(task.category || 'general').replace('_', ' ')}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                              <CoinBadge points={task.points} size="lg" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-stone-50 pt-3 mt-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              playSound.success();
                              onParentCompleteTask(task.id, task.child_id);
                            }}
                            id={`parent-complete-${task.id}`}
                          >
                            Mark Complete
                          </Button>

                          <div className="flex gap-2">
                            <Tooltip content="Edit Assigned Quest" position="top">
                              <button onClick={() => openEditTask(task)} className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-50">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Delete Assigned Quest" position="top">
                              <button onClick={() => { playSound.click(); onDeleteTask(task.id); }} className="p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50" id={`delete-task-${task.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
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
                    className={`w-full max-w-lg p-5 sm:p-6 rounded-3xl ${styles.cardBg} border border-stone-200 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto custom-scrollbar`}
                    id="add-reward-box"
                  >

                    <h3 className={`font-bold text-lg text-stone-900 font-display uppercase tracking-wide`}>
                      {editingRewardId ? <span><Edit2 className="inline-block mr-2"/> Edit Reward Token</span> : <span><Gift className="inline-block mr-2"/> Define Reward Token</span>}
                    </h3>
                    <form onSubmit={handleRewardSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Prize Name</label>
                          <input
                            type="text"
                            value={rewardTitle}
                            onChange={(e) => setRewardTitle(e.target.value)}
                            placeholder="iPad time, ice cream, toy..."
                            className={`w-full px-3 py-2 bg-white border dashboard-card border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Point Cost</label>
                          <input
                            type="number"
                            value={rewardCost}
                            onChange={(e) => setRewardCost(Number(e.target.value))}
                            className={`w-full px-3 py-2 bg-white border dashboard-card border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            min="10"
                            max="500"
                            required
                          />
                        </div>

                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Select Theme Icon</label>
                          <select
                            value={rewardIcon}
                            onChange={(e) => setRewardIcon(e.target.value)}
                            className={`w-full px-3 py-2 bg-white border dashboard-card border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                          >
                            <option value="Gamepad2">🎮 Game Time</option>
                            <option value="Pizza">🍕 Favorite Meal</option>
                            <option value="Palette">🎨 Creative / Art</option>
                            <option value="BookOpen">📖 Storybooks</option>
                            <option value="Sparkles">✨ Special Trip</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Redemption Limit</label>
                          <select
                            value={rewardLimit}
                            onChange={(e) => setRewardLimit(e.target.value as any)}
                            className={`w-full px-3 py-2 bg-white border dashboard-card border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                          >
                            <option value="unlimited">♾️ Unlimited</option>
                            <option value="daily">📅 1x Daily</option>
                            <option value="twice_daily">✌️ 2x Daily (Requires cooldown)</option>
                            <option value="one_time">🎯 One-Time (Disappears after use)</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            id="rewardBadgeEligible"
                            checked={rewardBadgeEligible}
                            onChange={(e) => setRewardBadgeEligible(e.target.checked)}
                            className="w-4 h-4 rounded border-stone-300 text-cyan-500 focus:ring-cyan-400"
                          />
                          <label htmlFor="rewardBadgeEligible" className={`text-xs font-mono text-stone-600`}>
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

                {/* SUB-TABS AND ACTION BUTTONS FOR REWARDS */}
                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-3 xl:gap-0 border-b border-stone-200/50 pb-3 mb-4 sm:pb-4 sm:mb-6">
                  <div className="flex w-full xl:max-w-md gap-1 bg-stone-100/80 p-1.5 rounded-full border border-stone-200/60">
                    <button
                      onClick={() => setRewardSubTab('directory')}
                      className={`flex-1 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-widest transition-all ${
                        rewardSubTab === 'directory'
                          ? ('bg-stone-900 text-white shadow-sm')
                          : ('text-stone-500 hover:text-stone-900 hover:bg-stone-200/50')
                      }`}
                    >
                      BLUEPRINTS
                    </button>
                    <button
                      onClick={() => setRewardSubTab('active')}
                      className={`flex-1 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-widest transition-all ${
                        rewardSubTab === 'active'
                          ? ('bg-stone-900 text-white shadow-sm')
                          : ('text-stone-500 hover:text-stone-900 hover:bg-stone-200/50')
                      }`}
                    >
                      ASSIGNED
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full xl:w-auto mt-2 xl:mt-0">
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-2.5"
                      onClick={() => { 
                        playSound.click(); 
                        setGenerateAgeRange(getRecommendedAgeRange());
                        setShowGenerateRewardsModal(true); 
                      }}
                      leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      GENERATE <span className="hidden sm:inline">IDEAS</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-2.5"
                      onClick={handleImportDefaultRewards}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      IMPORT <span className="hidden sm:inline">DEFAULTS</span>
                    </Button>
                    <Button
                      variant="dark"
                      className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-2.5"
                      onClick={() => { playSound.click(); setShowAddReward(true); }}
                      id="add-reward-btn-top"
                      leftIcon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    >
                      ADD <span className="hidden sm:inline">REWARD</span>
                    </Button>
                  </div>
                </div>

                {/* REWARD DIRECTORY */}
                {rewardSubTab === 'directory' && (
                <div className="mt-2 sm:mt-4">
                  <h3 className={`text-base sm:text-xl font-black font-display ${styles.titleColor} mb-3 sm:mb-4 hidden sm:block`}>REWARD DIRECTORY (BLUEPRINTS)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards.filter(r => r.is_template).map((reward) => {
                      const instances = rewards.filter(r => r.template_id === reward.id);
                      const assignedChildren = instances.map(i => children.find(c => c.id === i.child_id)?.name).filter(Boolean);
                      return (
                        <div key={reward.id} className="bg-white border dashboard-card border-stone-100 p-4 rounded-2xl flex flex-col gap-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl shrink-0">
                                <FaGift />
                              </div>
                              <div>
                                <h3 className="font-bold text-stone-900 text-sm">{reward.title}</h3>
                                <p className="text-xs text-stone-400 mt-0.5">
                                  Assigned: <span className="font-bold text-stone-700">{assignedChildren.length > 0 ? assignedChildren.join(', ') : 'No one'}</span>
                                  <span className="mx-2">•</span>
                                  Limit: <span className="font-bold text-stone-700 capitalize">{(reward.limit_type || 'unlimited').replace('_', ' ')}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <CoinBadge points={reward.cost_points} size="lg" />
                            </div>
                          </div>

                          <div className="flex justify-between items-center border-t border-stone-50 pt-3 mt-1">
                            <button
                              onClick={() => {
                                playSound.click();
                                setSelectingChildForTaskId(selectingChildForTaskId === reward.id ? null : reward.id);
                              }}
                              className="text-xs font-bold text-stone-900 hover:text-stone-700"
                            >
                              Assign to Child
                            </button>

                            <div className="flex gap-2">
                              <Tooltip content="Edit Token" position="top">
                                <Button variant="ghost" size="icon" onClick={() => openEditReward(reward)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </Tooltip>
                              <Tooltip content="Delete Token" position="top">
                                <Button variant="ghost" size="icon" onClick={() => { playSound.click(); onDeleteReward(reward.id); }} className="text-stone-400 hover:text-rose-500 hover:bg-rose-50">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </Tooltip>
                            </div>
                          </div>

                          <AnimatePresence>
                            {selectingChildForTaskId === reward.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className={`border-t pt-3 mt-1 flex flex-col gap-2 overflow-hidden border-stone-100`}
                              >
                                <p className={`text-[10px] font-bold text-stone-500 uppercase`}>
                                  Select children to assign this reward:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {children.map(child => {
                                    const isAssigned = instances.some(i => i.child_id === child.id);
                                    return (
                                      <button
                                        key={child.id}
                                        onClick={() => {
                                          playSound.success();
                                          const currentAssignedIds = instances.map(i => i.child_id);
                                          const newAssignedIds = isAssigned 
                                            ? currentAssignedIds.filter(id => id !== child.id)
                                            : [...currentAssignedIds, child.id];
                                          onAssignReward(reward, newAssignedIds);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                          isAssigned
                                            ? ('bg-stone-900 border-stone-900 text-white')
                                            : ('bg-stone-50 border-stone-100 text-stone-500 hover:bg-stone-100')
                                        }`}
                                      >
                                        <ChildAvatar iconName={child.avatar_url} className="w-5 h-5" />
                                        <span>{child.name}</span>
                                        {isAssigned && <Check className="w-3 h-3" />}
                                      </button>
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
                </div>


                )}

                {/* ACTIVE REWARDS */}
                {rewardSubTab === 'active' && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewards.filter(r => !r.is_template).map((reward) => {
                    const assignedName = children.find(c => c.id === reward.child_id)?.name;
                    return (
                      <div key={reward.id} className="bg-white border dashboard-card border-stone-100 p-4 rounded-2xl flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl shrink-0">
                              <FaGift />
                            </div>
                            <div>
                              <h3 className="font-bold text-stone-900 text-sm">
                                {reward.title}
                                {!reward.is_available && reward.limit_type === 'one_time' && (
                                  <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 font-bold uppercase align-middle">
                                    CLAIMED
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-stone-400 mt-0.5">
                                Available for: <span className="font-bold text-stone-700">{assignedName || 'None'}</span>
                                <span className="mx-2">•</span>
                                Limit: <span className="font-bold text-stone-700 capitalize">{(reward.limit_type || 'unlimited').replace('_', ' ')}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="w-12 h-12 rounded-full border-4 border-emerald-400 flex items-center justify-center bg-white text-emerald-500 font-black text-sm">
                              {reward.cost_points}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end items-center border-t border-stone-50 pt-3 mt-1">
                          <div className="flex gap-2">
                            <Tooltip content="Edit Assigned Token" position="top">
                              <Button variant="ghost" size="icon" onClick={() => openEditReward(reward)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Delete Assigned Token" position="top">
                              <Button variant="ghost" size="icon" onClick={() => { playSound.click(); onDeleteReward(reward.id); }} className="text-stone-400 hover:text-rose-500 hover:bg-rose-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
                )}

                {/* History Log */}
                <div className="pt-8 border-t border-stone-800">
                  <h3 className={`font-bold font-mono text-sm text-stone-900 uppercase pb-4`}>
                    <ScrollText className="inline-block mr-2 text-stone-500" /> Dispensation History Log
                  </h3>
                  <div className="space-y-3">
                    {redemptions.filter(r => r.status === 'delivered').length === 0 ? (
                      <p className={`text-xs ${styles.textMuted}`}>No rewards have been dispensed yet.</p>
                    ) : (
                      redemptions
                        .filter(r => r.status === 'delivered')
                        .sort((a, b) => new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime())
                        .map(delivery => {
                          const child = children.find(c => c.id === delivery.child_id);
                          const reward = rewards.find(r => r.id === delivery.reward_id);
                          const isOneTimeUsed = reward?.limit_type === 'one_time' && !reward.is_available;
                          
                          return (
                            <div key={delivery.id} className={`flex items-center justify-between p-4 rounded-xl border bg-stone-50 border-stone-200 ${styles.textColor}`}>
                              <div>
                                <span className="text-xs font-bold">{child?.name}</span> received <strong className={'text-stone-900'}>{reward?.title}</strong>
                                <p className={`text-[10px] font-mono mt-1 ${styles.textMuted}`}>
                                  {new Date(delivery.redeemed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </p>
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
                  theme={theme}
                  parentProfile={parentProfile}
                  linkedParents={linkedParents}
                  onResetData={onResetData}
                  onRunSetup={onRunSetup}
                  onDeleteAccount={onDeleteAccount}
                  onCleanDuplicates={handleCleanDuplicates}
                  onRequireAccount={onRequireAccount}
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
                  theme={theme}
                  parentProfile={parentProfile}
                  onUpdateParentProfile={onUpdateParentProfile}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      <AnimatePresence>
        {penaltyModalChildId && onDeductCoins && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-50 shadow-sm">
                <MinusCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-center text-stone-900 mb-2 font-display uppercase tracking-wide">
                Take Coins
              </h2>
              <p className="text-center text-sm text-stone-500 mb-6">
                Deduct coins from {children.find(c => c.id === penaltyModalChildId)?.name} and leave a reason in their activity log.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold font-mono text-stone-400 uppercase tracking-widest mb-1.5">Amount to deduct</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={penaltyAmount}
                      onChange={(e) => setPenaltyAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-stone-900 font-black rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 text-lg"
                    />
                    <Coins className="w-5 h-5 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold font-mono text-stone-400 uppercase tracking-widest mb-1.5">Reason for penalty</label>
                  <select
                    value={['Not listening', 'Hitting', 'Refusing chores', 'Bad language', 'Lying'].includes(penaltyReason) ? penaltyReason : penaltyReason ? 'Custom' : ''}
                    onChange={(e) => {
                      if (e.target.value === 'Custom') setPenaltyReason('');
                      else setPenaltyReason(e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-stone-900 font-bold text-sm rounded-xl focus:outline-none focus:border-rose-400 mb-2"
                  >
                    <option value="" disabled>Select a reason...</option>
                    <option value="Not listening">Not listening</option>
                    <option value="Hitting">Hitting</option>
                    <option value="Refusing chores">Refusing to do chores</option>
                    <option value="Bad language">Bad language</option>
                    <option value="Lying">Lying</option>
                    <option value="Custom">Type my own...</option>
                  </select>
                  
                  {(!['Not listening', 'Hitting', 'Refusing chores', 'Bad language', 'Lying'].includes(penaltyReason) || penaltyReason === '') && (
                    <input
                      type="text"
                      placeholder="Type custom reason..."
                      value={penaltyReason}
                      onChange={(e) => setPenaltyReason(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-stone-900 font-bold text-sm rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
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
                    onDeductCoins(penaltyModalChildId, penaltyAmount, penaltyReason || 'Penalty applied');
                    setPenaltyModalChildId(null);
                    setPenaltyReason('');
                    setPenaltyAmount(5);
                  }} 
                  className="flex-1"
                  disabled={!penaltyReason.trim() || penaltyAmount <= 0}
                >
                  Deduct Coins
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resetConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
                  'bg-white border-rose-200 shadow-rose-900/10'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full bg-rose-100 text-rose-600`}>
                    <RotateCcw className="w-8 h-8" />
                  </div>
                </div>
                <h3 className={`text-xl font-black text-center font-display uppercase tracking-wide mb-2 text-stone-900`}>
                  Reset {resetConfirmation.type}?
                </h3>
                <p className={`text-center text-sm font-mono mb-6 text-stone-600`}>
                  Are you sure you want to reset <span className="font-bold text-rose-500">{resetConfirmation.childName}'s</span> {resetConfirmation.type} to {resetConfirmation.type === 'Level' ? '1' : '0'}? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => { playSound.click(); setResetConfirmation(null); }}
                    className="flex-1 bg-stone-100"
                  >
                    CANCEL
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      playSound.purchase();
                      if (resetConfirmation.type === 'Gold') onUpdateChildStats(resetConfirmation.childId, { points: 0 });
                      if (resetConfirmation.type === 'Streak') onUpdateChildStats(resetConfirmation.childId, { streak_days: 0 });
                      setResetConfirmation(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-red-500"
                  >
                    RESET NOW
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Child Confirmation Modal */}
        <AnimatePresence>
          {deleteChildConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm rounded-3xl p-6 border shadow-2xl bg-white border-rose-200 shadow-rose-900/10"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-rose-100 text-rose-600">
                    <Trash2 className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-center font-display uppercase tracking-wide mb-2 text-stone-900">
                  Delete {deleteChildConfirmation.childName}?
                </h3>
                <p className="text-center text-sm font-mono mb-2 text-stone-600">
                  This will permanently delete <span className="font-bold text-rose-500">{deleteChildConfirmation.childName}</span> and all their tasks, rewards, and progress.
                </p>
                <p className="text-center text-xs font-mono mb-6 text-rose-500 font-bold">
                  ⚠️ This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => { playSound.click(); setDeleteChildConfirmation(null); }}
                    className="flex-1 bg-stone-100"
                  >
                    CANCEL
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      playSound.purchase();
                      if (onDeleteChild) onDeleteChild(deleteChildConfirmation.childId);
                      setDeleteChildConfirmation(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-red-600"
                  >
                    DELETE
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Sticky Bottom Nav */}
        <BottomTabBar
          tabs={[
            { id: 'approvals', label: 'Approvals', icon: CheckSquare, badge: totalPending },
            { id: 'children', label: 'Children', icon: Users },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'rewards', label: 'Rewards', icon: Trophy },
            { id: 'targets', label: 'Targets', icon: Target }
          ]}
          activeTab={activeTab}
          onTabChange={(id) => { playSound.click(); setActiveTab(id as any); }}
          layoutId="parent-nav-pill"
        />
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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-stone-900 mb-2">
                  {generatedTasksToPreview ? "Select Quests to Keep" : "Generate Quests"}
                </h2>
                
                {!generatedTasksToPreview ? (
                  <>
                    <p className="text-stone-500 text-sm mb-6">Select an age range and how many random quests you want to add to your blueprint directory.</p>
                    
                    <div className="space-y-4 mb-8">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Age Range</label>
                        <select
                          value={generateAgeRange}
                          onChange={(e) => setGenerateAgeRange(e.target.value as any)}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="all">All Ages</option>
                          <option value="3-5">3 - 5 years</option>
                          <option value="6-8">6 - 8 years</option>
                          <option value="9-12">9 - 12 years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">How many?</label>
                        <div className="flex gap-2">
                          {[3, 5, 10, 20].map(num => (
                            <button
                              key={num}
                              onClick={() => setGenerateCount(num)}
                              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${generateCount === num ? 'bg-indigo-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                            >
                              {num}
                            </button>
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
                    <p className="text-stone-500 text-sm mb-6">We found {generatedTasksToPreview.length} new quests. Uncheck any you don't want to import.</p>
                    <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                      {generatedTasksToPreview.map(task => {
                        const isEditing = editingPreviewId === task.id;
                        return (
                          <div key={task.id} className={`flex flex-col gap-2 p-3 rounded-xl border ${isEditing ? 'border-indigo-400 bg-indigo-50/30' : 'border-stone-200 bg-stone-50'} transition-colors`}>
                            {isEditing ? (
                              <div className="flex flex-col gap-2 w-full">
                                <input 
                                  type="text" 
                                  className="w-full p-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-indigo-500" 
                                  value={previewEditTitle} 
                                  onChange={(e) => setPreviewEditTitle(e.target.value)} 
                                />
                                <div className="flex gap-2">
                                  <input 
                                    type="number" 
                                    className="w-24 p-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-indigo-500" 
                                    value={previewEditPoints} 
                                    onChange={(e) => setPreviewEditPoints(parseInt(e.target.value) || 0)} 
                                  />
                                  <Button size="sm" variant="primary" onClick={() => {
                                    setGeneratedTasksToPreview(prev => prev!.map(t => t.id === task.id ? { ...t, title: previewEditTitle, points: previewEditPoints } : t));
                                    setEditingPreviewId(null);
                                  }}>Save</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingPreviewId(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3 group">
                                <label className="flex items-start gap-3 cursor-pointer flex-1">
                                  <input 
                                    type="checkbox" 
                                    className="mt-1 w-5 h-5 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500"
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
                                    <p className="font-bold text-stone-900 text-sm">{task.title}</p>
                                    <p className="text-xs text-stone-500">{task.points} pts • {task.recurrence}</p>
                                  </div>
                                </label>
                                <button 
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
                                </button>
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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-stone-900 mb-2">
                  {generatedRewardsToPreview ? "Select Prizes to Keep" : "Generate Prizes"}
                </h2>
                
                {!generatedRewardsToPreview ? (
                  <>
                    <p className="text-stone-500 text-sm mb-6">Select an age range and how many random prizes you want to add to your directory.</p>
                    
                    <div className="space-y-4 mb-8">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Age Range</label>
                        <select
                          value={generateAgeRange}
                          onChange={(e) => setGenerateAgeRange(e.target.value as any)}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="all">All Ages</option>
                          <option value="3-5">3 - 5 years</option>
                          <option value="6-8">6 - 8 years</option>
                          <option value="9-12">9 - 12 years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">How many?</label>
                        <div className="flex gap-2">
                          {[3, 5, 10, 20].map(num => (
                            <button
                              key={num}
                              onClick={() => setGenerateCount(num)}
                              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${generateCount === num ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                            >
                              {num}
                            </button>
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
                    <p className="text-stone-500 text-sm mb-6">We found {generatedRewardsToPreview.length} new prizes. Uncheck any you don't want to import.</p>
                    <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                      {generatedRewardsToPreview.map(reward => {
                        const isEditing = editingPreviewId === reward.id;
                        return (
                          <div key={reward.id} className={`flex flex-col gap-2 p-3 rounded-xl border ${isEditing ? 'border-amber-400 bg-amber-50/30' : 'border-stone-200 bg-stone-50'} transition-colors`}>
                            {isEditing ? (
                              <div className="flex flex-col gap-2 w-full">
                                <input 
                                  type="text" 
                                  className="w-full p-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-amber-500" 
                                  value={previewEditTitle} 
                                  onChange={(e) => setPreviewEditTitle(e.target.value)} 
                                />
                                <div className="flex gap-2">
                                  <input 
                                    type="number" 
                                    className="w-24 p-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-amber-500" 
                                    value={previewEditPoints} 
                                    onChange={(e) => setPreviewEditPoints(parseInt(e.target.value) || 0)} 
                                  />
                                  <Button size="sm" variant="warning" onClick={() => {
                                    setGeneratedRewardsToPreview(prev => prev!.map(r => r.id === reward.id ? { ...r, title: previewEditTitle, cost_points: previewEditPoints } : r));
                                    setEditingPreviewId(null);
                                  }}>Save</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingPreviewId(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3 group">
                                <label className="flex items-start gap-3 cursor-pointer flex-1">
                                  <input 
                                    type="checkbox" 
                                    className="mt-1 w-5 h-5 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
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
                                    <p className="font-bold text-stone-900 text-sm">{reward.title}</p>
                                    <p className="text-xs text-stone-500">{reward.cost_points} pts • {reward.limit_type}</p>
                                  </div>
                                </label>
                                <button 
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
                                </button>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar`}
            >
              <button 
                onClick={() => {
                  if (historyDetailView) setHistoryDetailView(null);
                  else setShowHistoryForChild(null);
                }}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
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
                        <button onClick={() => setHistoryDetailView(null)} className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 transition-colors">
                          <RotateCcw className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display uppercase tracking-wide">
                          {historyDetailView === 'tasks' ? 'Tasks Completed' : historyDetailView === 'deductions' ? 'Deductions' : 'Rewards Claimed'}
                        </h2>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        {historyDetailView === 'tasks' && (
                          approvedTasks.length === 0 ? <p className="text-stone-500 text-center py-8">No tasks completed yet.</p> :
                          [...approvedTasks].sort((a,b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).map(c => {
                            const task = tasks.find(t => t.id === c.task_id);
                            return (
                              <div key={c.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-stone-800">{task?.title || 'Unknown Task'}</p>
                                  <p className="text-xs text-stone-500">{new Date(c.completed_at).toLocaleDateString()}</p>
                                </div>
                                <span className="text-emerald-600 font-bold">+{c.points_awarded}</span>
                              </div>
                            );
                          })
                        )}
                        {historyDetailView === 'deductions' && (
                          <>
                            {[...penaltyCompletionsList].sort((a,b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).map(c => (
                              <div key={c.id} className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-rose-800">{c.notes || 'Penalty'}</p>
                                  <p className="text-xs text-rose-500">{new Date(c.completed_at).toLocaleDateString()}</p>
                                </div>
                                <span className="text-rose-600 font-bold">{c.points_awarded}</span>
                              </div>
                            ))}
                            {(child.manual_deductions || 0) > 0 && (
                              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-stone-800">Quick Adjustments (Manual)</p>
                                </div>
                                <span className="text-stone-600 font-bold">{child.manual_deductions} times</span>
                              </div>
                            )}
                            {(child.gold_pot_total_leaked || 0) > 0 && (
                              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-stone-800">Gold Pot Leaks</p>
                                </div>
                                <span className="text-stone-600 font-bold">{child.gold_pot_total_leaked} coins</span>
                              </div>
                            )}
                            {coinsTakenOff === 0 && <p className="text-stone-500 text-center py-8">No deductions recorded.</p>}
                          </>
                        )}
                        {historyDetailView === 'rewards' && (
                          claimedRewardsList.length === 0 ? <p className="text-stone-500 text-center py-8">No rewards claimed yet.</p> :
                          [...claimedRewardsList].sort((a,b) => new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime()).map(r => {
                            const reward = rewards.find(rw => rw.id === r.reward_id);
                            return (
                              <div key={r.id} className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-indigo-800">{reward?.title || 'Unknown Reward'}</p>
                                  <p className="text-xs text-indigo-500">{new Date(r.redeemed_at).toLocaleDateString()}</p>
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
                    <h2 className="text-xl sm:text-2xl font-black text-center text-stone-900 mb-6 font-display uppercase tracking-wide flex items-center justify-center gap-2">
                      <ScrollText className="w-6 h-6 text-indigo-500" />
                      {child.name}'s History
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <span className="font-bold text-amber-900">Total Lifetime Earned</span>
                        <CoinBadge points={child.lifetime_points || 0} size="md" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-black text-stone-800">{child.weekly_points || 0}</span>
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">Weekly Coins</span>
                        </div>
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-black text-stone-800">{child.monthly_points || 0}</span>
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">Monthly Coins</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => setHistoryDetailView('tasks')} className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center hover:bg-emerald-100 transition-colors cursor-pointer w-full">
                          <CheckSquare className="w-5 h-5 text-emerald-500 mb-2" />
                          <span className="text-lg font-black text-emerald-700">{tasksDone}</span>
                          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1 leading-tight">Tasks<br/>Done</span>
                        </button>
                        <button onClick={() => setHistoryDetailView('rewards')} className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center text-center hover:bg-indigo-100 transition-colors cursor-pointer w-full">
                          <Gift className="w-5 h-5 text-indigo-500 mb-2" />
                          <span className="text-lg font-black text-indigo-700">{rewardsClaimed}</span>
                          <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-1 leading-tight">Rewards<br/>Claimed</span>
                        </button>
                        <button onClick={() => setHistoryDetailView('deductions')} className="p-3 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col items-center justify-center text-center hover:bg-rose-100 transition-colors cursor-pointer w-full">
                          <MinusCircle className="w-5 h-5 text-rose-500 mb-2" />
                          <span className="text-lg font-black text-rose-700">{coinsTakenOff}</span>
                          <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest mt-1 leading-tight">Times<br/>Deducted</span>
                        </button>
                      </div>

                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-stone-600">Current Level</span>
                          <span className="font-black text-stone-800">Lvl {child.level}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-stone-600">Current Streak</span>
                          <span className="font-black text-stone-800">{child.streak_days} Days</span>
                        </div>
                        {child.savings_unlocked && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-stone-600">Savings Total</span>
                            <span className="font-black text-emerald-600 flex items-center gap-1"><Coins className="w-3.5 h-3.5" />{child.savings_pot || 0}</span>
                          </div>
                        )}
                        {child.food_pot_unlocked && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-stone-600">Pet Fed Total</span>
                            <span className="font-black text-stone-800">{child.pet_fed_total || 0} times</span>
                          </div>
                        )}
                        {child.gifting_unlocked && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-stone-600">Gifts Made</span>
                            <span className="font-black text-stone-800">{child.gifts_made || 0}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
