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
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { ParentProfile } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import { Capacitor } from '@capacitor/core';
import SettingsTab from './SettingsTab';
import TargetsTab from './TargetsTab';
import { CoinBadge } from './CoinBadge';
import { LinearProgressBar } from './ProgressBar';
import { Button } from './ui/Button';

interface ParentDashboardProps {
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  onAddChild: (name: string, characterId: string, avatarUrl: string) => void;
  onEditChild: (id: string, updates: Partial<Child>) => void;
  onDeleteChild?: (id: string) => void;
  onUpdateChildStats: (id: string, updates: Partial<Child>) => void;
  onAddTask: (title: string, points: number, category: any, recurrence: any, cooldownMinutes?: number) => void;
  onAssignTask: (template: Task, childIds: string[]) => void;
  onEditTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddReward: (title: string, cost: number, icon: string, limitType: any) => void;
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
  onUpdateParentProfile
}: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'approvals' | 'children' | 'tasks' | 'rewards' | 'compliance' | 'settings' | 'targets'>('approvals');
  
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
  
  // Forms states
  const [showAddChild, setShowAddChild] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [newChildName, setNewChildName] = useState('');
  const [newChildChar, setNewChildChar] = useState('unicorn');
  const [newChildAvatar, setNewChildAvatar] = useState('/avatars/boy_fox.png');

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
    playSound.success();
    if (editingChildId) {
      onEditChild(editingChildId, { name: newChildName, character_id: newChildChar, avatar_url: newChildAvatar });
    } else {
      onAddChild(newChildName, newChildChar, newChildAvatar);
    }
    setNewChildName('');
    setEditingChildId(null);
    setNewChildChar('unicorn');
    setNewChildAvatar('/avatars/boy_fox.png');
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
    setNewChildChar(child.character_id);
    setNewChildAvatar(child.avatar_url || '/avatars/boy_fox.png');
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
    <div className={`min-h-screen bg-slate-50 text-dark flex flex-col font-sans relative overflow-x-hidden`} id="parent-dashboard-root">
      {/* Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-400/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-[-5%] w-80 h-80 bg-purple-400/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <header className="bg-white border-b border-gray-100 relative z-20 pt-[max(env(safe-area-inset-top),_1rem)]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab('settings')}
              className="h-11 w-11 sm:h-14 sm:w-14 rounded-[1.25rem] bg-white border-[3px] border-slate-100 shadow-sm flex items-center justify-center shrink-0 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 text-slate-600"
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-none tracking-tight font-display">
                Parent Center
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-base text-slate-500 font-semibold mt-1.5">
                {parentProfile?.name && <span>{parentProfile.name}</span>}
                {parentProfile?.name && parentProfile?.family_name && <span className="opacity-50">•</span>}
                {parentProfile?.family_name && <span>{parentProfile.family_name}</span>}
                {(parentProfile?.name || parentProfile?.family_name) && <span className="opacity-50">•</span>}
                <span className="truncate">{parentEmail}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="flex items-center bg-slate-50/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm p-1 sm:p-1.5 gap-1 shrink-0">
              {onLogout && (
                <button
                  onClick={() => {
                    playSound.click();
                    onLogout();
                  }}
                  className="px-4 h-10 sm:h-11 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs sm:text-sm tracking-widest hover:text-slate-800 hover:bg-slate-200 transition-colors shrink-0"
                  id="global-logout-btn"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">SIGN OUT</span>
                </button>
              )}
              <button
                onClick={() => {
                  playSound.click();
                  onExitParentMode();
                }}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
                id="exit-to-child-view-btn"
                title="Switch to Kid View"
              >
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
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
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-slate-900 hover:scale-[1.01]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} strokeWidth={isSelected ? 2.5 : 2} /> 
                    {tab.label}
                  </span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`${isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'} text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow-sm`}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-400' : 'text-gray-400'} font-bold`}>
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="lg:col-span-9 card-panel min-h-[600px] z-10">
          
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-4xl font-black text-slate-900 leading-none mb-1 sm:mb-2">{approvedCompletionsCount}</span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-gray-400 uppercase">COMPLETED</span>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-4xl font-black text-slate-900 leading-none mb-1 sm:mb-2">{children.length}</span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-gray-400 uppercase">ACTIVE</span>
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
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      Smart Reminders
                    </h2>
                    <div className="space-y-3">
                      {childrenToNudge.map(child => {
                        const isNudged = child.has_pending_nudge || nudgedChildIds.includes(child.id);
                        return (
                          <div key={child.id} className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <img src={child.avatar_url || '/placeholder.png'} alt={child.name} className="w-10 h-10 rounded-full" />
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm">{child.name} hasn't logged any activity today.</h3>
                                <p className="text-gray-500 text-xs mt-1">Send a friendly reminder to complete their tasks!</p>
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
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Needs Approval
                  </h2>
                  
                  {totalPending === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                      <div className="text-4xl mb-3 text-amber-400">✨</div>
                      <h3 className="font-black text-slate-900 text-sm mb-1">All Caught Up!</h3>
                      <p className="text-gray-400 text-xs">No pending tasks to approve.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingApprovals.map((appr) => {
                        const child = children.find(c => c.id === appr.child_id);
                        const task = tasks.find(t => t.id === appr.task_id);
                        return (
                          <div key={appr.id} className="bg-white border dashboard-card border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex gap-4">
                              <img src={child?.avatar_url || '/placeholder.png'} className="w-12 h-12 rounded-xl bg-gray-50" />
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{child?.name} finished {task?.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(appr.completed_at).toLocaleString()}</p>
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
                          <div key={req.id} className="bg-white border dashboard-card border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl">🎁</div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{child?.name} claimed {reward?.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(req.redeemed_at).toLocaleString()}</p>
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
                          <div key={req.id} className="bg-white border dashboard-card border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${req.type === 'charity' ? 'bg-emerald-50 text-emerald-500' : 'bg-pink-50 text-pink-500'}`}>
                                {typeIcon}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{child?.name} wants to give!</p>
                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">{title} (<CoinBadge points={req.amount} size="sm" />)</p>
                                <p className="text-[10px] text-gray-300 mt-0.5">{new Date(req.created_at).toLocaleString()}</p>
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
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
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
                      <div key={`${activity.id}-${i}`} className="bg-white border dashboard-card border-gray-100 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${activity.type === 'task' ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-500'}`}>
                            {activity.type === 'task' ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : '🍦'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">{activity.title}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{activity.date.toLocaleString([], { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className={`font-black text-xs sm:text-sm shrink-0 flex items-center justify-center`}>
                          <CoinBadge points={activity.points} size="sm" disabled={activity.type !== 'task'} />
                        </div>
                      </div>
                    ))}
                    {[...completions.filter(c => c.status === 'approved'), ...redemptions.filter(r => r.status === 'delivered')].length === 0 && (
                      <div className="text-center p-8 text-gray-400 text-xs">No recent activity yet.</div>
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
                    className={`p-6 rounded-3xl ${styles.cardBg} border border-gray-200 shadow-2xl space-y-4`}
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
                              className={`p-1 rounded-xl border-2 transition-all cursor-pointer ${newChildAvatar === url ? ('border-amber-500 bg-amber-50') : 'border-transparent hover:border-slate-500/50'}`}
                            >
                              <img src={url} alt="Avatar option" className="w-full aspect-square rounded-lg object-cover" />
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
                            setNewChildChar('unicorn');
                            setNewChildAvatar('/avatars/boy_fox.png');
                          }}
                        >
                          CANCEL
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedChildren.map((child) => {
                    const stage = getCharacterStage(child.character_id, child.level);
                    const pack = CHARACTER_PACKS.find(cp => cp.id === child.character_id);
                    return (
                      <div
                        key={child.id}
                        className="bg-white border dashboard-card border-gray-100 p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden"
                      >
                        <div className="flex gap-4 items-center pr-8">
                          <img
                            src={child.avatar_url}
                            alt="Child avatar"
                            className={`w-16 h-16 rounded-2xl p-1 border object-cover shrink-0 bg-stone-100 border-stone-200`}
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-extrabold text-lg ${styles.titleColor} font-display truncate`}>{child.name}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                              <div className={`flex items-center gap-2 text-xs font-mono font-bold ${styles.textColor} whitespace-nowrap`}>
                                <CoinBadge points={child.points} size="sm" />
                              </div>
                              {child.savings_unlocked && (
                                <div className={`flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 whitespace-nowrap`}>
                                  <span className="text-sm"><FaPiggyBank /></span>
                                  <span>{child.savings_pot || 0} Saved</span>
                                </div>
                              )}
                              <div className={`flex items-center gap-1 text-xs font-mono font-bold ${styles.textColor} whitespace-nowrap`}>
                                <TrendingUp className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                                <span>Lvl {child.level || 1} <span className="text-[10px] ml-1 opacity-70">({(child.lifetime_points || 0) % (parentProfile?.points_to_level_up ?? 500)}/{parentProfile?.points_to_level_up ?? 500} Gold)</span></span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-4 right-4 flex gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditChild(child)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            {onDeleteChild && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { playSound.click(); setDeleteChildConfirmation({ childId: child.id, childName: child.name }); }}
                                title="Delete child"
                                className="text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className={`p-3 rounded-2xl border flex items-center justify-between bg-stone-50 border-stone-200`}>
                          <div>
                            <p className={`text-[8px] ${styles.textMuted} font-mono font-bold uppercase tracking-wider`}>Species Pack</p>
                            <p className={`text-xs font-extrabold ${styles.textColor} mt-0.5`}>{pack?.name.split(' the ')[0] || 'Unknown'}</p>
                            <p className={`text-[10px] font-mono text-amber-700 mt-0.5`}>Stage {stage.stage_number}: {stage.name}</p>
                          </div>
                          {stage.image_url ? (
                            <img src={stage.image_url} alt={stage.name} className="w-14 h-14 object-cover rounded-lg" />
                          ) : (
                            <span className="text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{stage.emoji}</span>
                          )}
                        </div>

                        {onUpdateChildStats && (
                          <div className={`mt-2 rounded-2xl border overflow-hidden transition-all bg-stone-50 border-stone-200`}>
                            <button
                              onClick={() => setExpandedAdjustments(prev => ({ ...prev, [child.id]: !prev[child.id] }))}
                              className={`w-full p-3 flex items-center justify-between text-left cursor-pointer hover:bg-stone-100 transition-colors `}
                            >
                              <h4 className={`text-xs font-bold font-display ${styles.titleColor}`}>Quick Adjustments</h4>
                              <ChevronDown className={`w-4 h-4 ${styles.textMuted} transition-transform ${expandedAdjustments[child.id] ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {expandedAdjustments[child.id] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-stone-200 bg-stone-100"
                                >
                                  <div className="p-3 space-y-3 border-t border-stone-200">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`text-xs font-mono ${styles.textColor}`}>Gold:</span>
                                      <div className="flex gap-1">
                                        <button onClick={() => { 
                                          playSound.click(); 
                                          setResetConfirmation({childId: child.id, childName: child.name, type: 'Gold'});
                                        }} className={`p-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50`} title="Reset Gold to 0"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { points: Math.max(0, child.points - 10) }); }} className={`p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50`} title="Remove 10 Gold"><MinusCircle className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { points: child.points + 10 }); }} className={`p-1.5 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50`} title="Add 10 Gold"><PlusCircle className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`text-xs font-mono ${styles.textColor}`}>Lifetime Gold:</span>
                                      <div className="flex gap-1.5 justify-end">
                                        <button onClick={() => { 
                                          playSound.click(); 
                                          setResetConfirmation({childId: child.id, childName: child.name, type: 'Lifetime Gold'});
                                        }} className={`p-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50`} title="Reset Lifetime Gold to 0"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { lifetime_points: Math.max(0, (child.lifetime_points || 0) - 10) }); }} className={`p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50`} title="Remove 10 Gold"><MinusCircle className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { lifetime_points: (child.lifetime_points || 0) + 10 }); }} className={`p-1.5 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50`} title="Add 10 Gold"><PlusCircle className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`text-xs font-mono ${styles.textColor}`}>Level:</span>
                                      <div className="flex gap-1">
                                        <button onClick={() => { 
                                          playSound.click(); 
                                          setResetConfirmation({childId: child.id, childName: child.name, type: 'Level'});
                                        }} className={`p-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50`} title="Reset Level to 1"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { level: Math.max(1, child.level - 1) }); }} className={`p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50`} title="Level Down"><ArrowDownCircle className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { level: child.level + 1 }); }} className={`p-1.5 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50`} title="Level Up"><ArrowUpCircle className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>

                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className={`flex justify-between text-xs ${styles.textMuted} font-mono`}>
                            <span className="uppercase">LEVEL {child.level} PROGRESS</span>
                            <span className={`font-extrabold ${styles.titleColor}`}>{(child.lifetime_points || 0) % (parentProfile?.points_to_level_up ?? 500)} / {parentProfile?.points_to_level_up ?? 500} Gold</span>
                          </div>
                          <LinearProgressBar 
                            progress={(((child.lifetime_points || 0) % (parentProfile?.points_to_level_up ?? 500)) / (parentProfile?.points_to_level_up ?? 500)) * 100}
                            heightClass="h-3"
                            className="mt-2"
                          />
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
                  
                  <div className="flex gap-2">
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
                        <div key={task.id} className="bg-white border dashboard-card border-gray-100 p-4 rounded-2xl flex flex-col gap-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl shrink-0">
                                <FaStar />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm">{task.title}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Assigned: <span className="font-bold text-slate-700">{assignedChildren.length > 0 ? assignedChildren.join(', ') : 'No one'}</span>
                                  <span className="mx-2">•</span>
                                  Category: <span className="font-bold text-slate-700 capitalize">{(task.category || 'general').replace('_', ' ')}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <CoinBadge points={task.points} size="lg" />
                            </div>
                          </div>

                          <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-1">
                            <button
                              onClick={() => {
                                playSound.click();
                                setSelectingChildForTaskId(selectingChildForTaskId === task.id ? null : task.id);
                              }}
                              className="text-xs font-bold text-slate-900 hover:text-slate-700"
                            >
                              Assign to Child
                            </button>

                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditTask(task)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => { playSound.click(); onDeleteTask(task.id); }} className="text-gray-400 hover:text-rose-500 hover:bg-rose-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {selectingChildForTaskId === task.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t pt-3 mt-1 flex flex-col gap-2 overflow-hidden border-gray-100"
                              >
                                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase">
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
                                        <img src={child.avatar_url} alt={child.name} className="w-5 h-5 rounded-full bg-white border dashboard-card border-slate-700/50 object-cover" />
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
                      <div key={task.id} className="bg-white border dashboard-card border-gray-100 p-4 rounded-2xl flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl shrink-0">
                              <FaStar />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">{task.title}</h3>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Assigned: <span className="font-bold text-slate-700">{assignedName || 'None'}</span>
                                <span className="mx-2">•</span>
                                Category: <span className="font-bold text-slate-700 capitalize">{(task.category || 'general').replace('_', ' ')}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                              <CoinBadge points={task.points} size="lg" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-1">
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
                            <button onClick={() => openEditTask(task)} className="p-2 rounded-xl text-gray-400 hover:text-slate-900 hover:bg-gray-50">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => { playSound.click(); onDeleteTask(task.id); }} className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50" id={`delete-task-${task.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </button>
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

                  <div className="flex gap-2">
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
                        <div key={reward.id} className="bg-white border dashboard-card border-gray-100 p-4 rounded-2xl flex flex-col gap-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl shrink-0">
                                <FaGift />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm">{reward.title}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Assigned: <span className="font-bold text-slate-700">{assignedChildren.length > 0 ? assignedChildren.join(', ') : 'No one'}</span>
                                  <span className="mx-2">•</span>
                                  Limit: <span className="font-bold text-slate-700 capitalize">{(reward.limit_type || 'unlimited').replace('_', ' ')}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <CoinBadge points={reward.cost_points} size="lg" />
                            </div>
                          </div>

                          <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-1">
                            <button
                              onClick={() => {
                                playSound.click();
                                setSelectingChildForTaskId(selectingChildForTaskId === reward.id ? null : reward.id);
                              }}
                              className="text-xs font-bold text-slate-900 hover:text-slate-700"
                            >
                              Assign to Child
                            </button>

                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditReward(reward)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => { playSound.click(); onDeleteReward(reward.id); }} className="text-gray-400 hover:text-rose-500 hover:bg-rose-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
                                <p className={`text-[10px] font-bold text-gray-500 uppercase`}>
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
                                            ? ('bg-slate-900 border-slate-900 text-white')
                                            : ('bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100')
                                        }`}
                                      >
                                        <img src={child.avatar_url} alt={child.name} className="w-5 h-5 rounded-full object-cover" />
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
                      <div key={reward.id} className="bg-white border dashboard-card border-gray-100 p-4 rounded-2xl flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl shrink-0">
                              <FaGift />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">
                                {reward.title}
                                {!reward.is_available && reward.limit_type === 'one_time' && (
                                  <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 font-bold uppercase align-middle">
                                    CLAIMED
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Available for: <span className="font-bold text-slate-700">{assignedName || 'None'}</span>
                                <span className="mx-2">•</span>
                                Limit: <span className="font-bold text-slate-700 capitalize">{(reward.limit_type || 'unlimited').replace('_', ' ')}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="w-12 h-12 rounded-full border-4 border-emerald-400 flex items-center justify-center bg-white text-emerald-500 font-black text-sm">
                              {reward.cost_points}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end items-center border-t border-gray-50 pt-3 mt-1">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditReward(reward)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { playSound.click(); onDeleteReward(reward.id); }} className="text-gray-400 hover:text-rose-500 hover:bg-rose-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
                )}

                {/* History Log */}
                <div className="pt-8 border-t border-slate-800">
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
        
        {/* Reset Confirmation Modal */}
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
        <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-[2rem] p-1.5 flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 z-50">
          {[
            { id: 'approvals', label: 'Approvals', icon: CheckSquare, badge: totalPending },
            { id: 'children', label: 'Children', icon: Users },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'rewards', label: 'Rewards', icon: Trophy },
            { id: 'targets', label: 'Targets', icon: Target }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { playSound.click(); setActiveTab(tab.id as any); }}
                className={`relative w-[4.5rem] h-14 flex flex-col items-center justify-center transition-all duration-300 rounded-[1.25rem] ${
                  isSelected ? 'bg-sky-50 text-sky-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-0.5 transition-transform ${isSelected ? 'scale-105' : ''}`} strokeWidth={isSelected ? 2.5 : 2} />
                <span className={`text-[9px] font-bold tracking-tight`}>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
