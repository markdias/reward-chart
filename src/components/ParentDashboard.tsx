import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckSquare, Trophy, Bell, ShieldAlert, Sparkles, Plus, 
  Trash2, LogOut, Check, X, ShieldCheck, Heart, UserPlus, 
  BookOpen, Lock, RefreshCw, Coins, Info, HelpCircle, Activity, Award, Settings, CheckCircle2, Edit2, TrendingUp, ArrowUpCircle, ArrowDownCircle, PlusCircle, MinusCircle, Eye, EyeOff, RotateCcw, ChevronDown, MessageSquare, Send, Target
} from 'lucide-react';
import { Child, Task, TaskCompletion, Reward, RewardRedemption, GiftingRequest } from '../types';
import { CHARACTER_PACKS, getCharacterStage, PRECANNED_AVATARS } from '../data/characters';
import { playSound } from '../utils/sound';
import { PREMADE_TASKS, PREMADE_REWARDS } from '../data/premadeTemplates';
import { ThemeId, THEME_PRESETS } from '../utils/theme';
import { ParentProfile, FamilyMessage } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import SettingsTab from './SettingsTab';
import TargetsTab from './TargetsTab';


interface ParentDashboardProps {
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  onAddChild: (name: string, characterId: string, avatarUrl: string) => void;
  onEditChild: (id: string, updates: Partial<Child>) => void;
  onUpdateChildStats: (id: string, updates: Partial<Child>) => void;
  onAddTask: (title: string, points: number, xp: number, category: any, recurrence: any, cooldownMinutes?: number) => void;
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
  familyMessages?: FamilyMessage[];
  onResetData?: (keepBlueprints: boolean) => void;
  onRunSetup?: () => void;
  onDeleteAccount?: () => void;
  onFamilyMessageSent?: (msg: FamilyMessage) => void;
  onFamilyMessageUpdated?: (msgId: string, updates: Partial<FamilyMessage>) => void;
  onRequireAccount?: () => void;
}

export default function ParentDashboard({
  children,
  tasks,
  completions,
  rewards,
  redemptions,
  onAddChild,
  onEditChild,
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
  familyMessages = [],
  onResetData,
  onRunSetup,
  onFamilyMessageSent,
  onFamilyMessageUpdated,
  onRequireAccount,
  giftingRequests = [],
  onApproveGiftingRequest,
  onRejectGiftingRequest,
  onDeleteAccount
}: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'approvals' | 'children' | 'tasks' | 'rewards' | 'compliance' | 'settings' | 'targets'>('approvals');
  const [taskSubTab, setTaskSubTab] = useState<'directory' | 'active'>('directory');
  const [rewardSubTab, setRewardSubTab] = useState<'directory' | 'active'>('directory');
  const [expandedAdjustments, setExpandedAdjustments] = useState<Record<string, boolean>>({});
  const [selectingChildForTaskId, setSelectingChildForTaskId] = useState<string | null>(null);

  // Messaging state
  const [messageText, setMessageText] = useState('');
  const [messageReceiverId, setMessageReceiverId] = useState<string>('all');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Sort children alphabetically so they don't jump around
  const sortedChildren = [...children].sort((a, b) => a.name.localeCompare(b.name));
  
  // Custom Confirmation Modal State
  const [resetConfirmation, setResetConfirmation] = useState<{childId: string, childName: string, type: 'Gold' | 'XP' | 'Level' | 'Weekly XP' | 'Monthly XP' | 'Streak'} | null>(null);
  
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
  const [taskXp, setTaskXp] = useState(15);
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

  const [showNotifications, setShowNotifications] = useState(false);

  const pendingApprovals = completions.filter(c => c.status === 'pending');
  const pendingRedemptions = redemptions.filter(r => r.status === 'requested');
  const pendingGiftingRequests = giftingRequests.filter(g => g.status === 'pending');
  const unreadMessagesCount = familyMessages.filter(msg => {
    const isMine = msg.sender_id === parentProfile?.user_id;
    const amIReceiver = msg.receiver_id === parentProfile?.user_id || msg.receiver_id === null;
    return !isMine && amIReceiver && !msg.is_read;
  }).length;
  
  const totalPending = pendingApprovals.length + pendingRedemptions.length + pendingGiftingRequests.length + unreadMessagesCount;

  const handleSendMessage = async () => {
    if (!messageText.trim() || !parentProfile?.family_id || !parentProfile?.user_id) return;
    setIsSendingMessage(true);
    const supabase = getSupabaseClient();
    if (supabase) {
      const newMsg = {
        family_id: parentProfile.family_id,
        sender_id: parentProfile.user_id,
        receiver_id: messageReceiverId === 'all' ? null : messageReceiverId,
        message: messageText.trim()
      };
      const { data, error } = await supabase.from('family_messages').insert(newMsg).select().single();
      
      if (!error && data) {
        if (onFamilyMessageSent) {
          onFamilyMessageSent(data as FamilyMessage);
        }
        setMessageText('');
        
        // Broadcast to other parents instantly!
        supabase.channel(`family-${parentProfile.family_id}`).send({
          type: 'broadcast',
          event: 'new_message',
          payload: { message: data }
        });
        
        playSound.success();
      } else {
        playSound.pinError();
        console.error('Failed to send message', error);
      }
    }
    setIsSendingMessage(false);
  };

  const handleMarkMessageRead = async (msgId: string) => {
    if (onFamilyMessageUpdated) {
      onFamilyMessageUpdated(msgId, { is_read: true });
    }
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('family_messages').update({ is_read: true }).eq('id', msgId);
    }
  };
  
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
        xp: taskXp,
        category: taskCategory,
        recurrence: taskRecurrence,
        cooldown_minutes: taskCooldownMinutes
      });
    } else {
      onAddTask(taskTitle, taskPoints, taskXp, taskCategory, taskRecurrence, taskCooldownMinutes);
    }
    setShowAddTask(false);
    setTaskSubTab('directory');
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskPoints(15);
    setTaskXp(15);
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
        limit_type: rewardLimit
      });
    } else {
      onAddReward(rewardTitle, rewardCost, rewardIcon, rewardLimit);
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
    setTaskXp(task.xp ?? task.points);
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
    setRewardChildIds(reward.child_ids || []);
    setRewardIcon(reward.icon_name);
    setRewardLimit(reward.limit_type || 'unlimited');
    setShowAddReward(true);
  };

  return (
    <div className={`min-h-screen bg-[#FCFBF9] text-stone-900 flex flex-col font-sans relative overflow-hidden`} id="parent-dashboard-root">
      
      <div className={`absolute inset-0 opacity-[0.02] bg-[radial-gradient(#1c1917_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none`} />
      

      <header className={`bg-white border-b border-stone-200 shadow-sm backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2 sm:py-4 flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 border border-stone-900 shadow-sm flex items-center justify-center text-xl shadow-lg shrink-0`}>
            <Settings className={`w-4 h-4 sm:w-5 sm:h-5 text-stone-950 animate-spin-slow`} />
          </div>
          <div className="min-w-0">
            <h1 className={`text-[10px] sm:text-lg font-black font-display tracking-wider bg-gradient-to-r from-stone-900 to-stone-800 bg-clip-text text-transparent uppercase truncate`}>
              Parent Mission Control
            </h1>
            <p className={`hidden sm:block text-[9px] text-stone-500 font-black font-mono tracking-widest uppercase truncate`}>{parentEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="relative">
            <button
              onClick={() => {
                playSound.click();
                setShowNotifications(!showNotifications);
              }}
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white border-2 border-[#E7E5E4] text-stone-700 hover:bg-stone-50 transition-all cursor-pointer relative shadow-[0_3px_0_0_#E7E5E4] active:translate-y-[2px] active:shadow-none"
              id="notifications-bell-btn"
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500" />
              {totalPending > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] sm:text-[10px] font-mono font-bold text-white ring-2 ring-white animate-bounce">
                  {totalPending}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 rounded-3xl bg-white border-3 border-[#E7E5E4] shadow-[0_6px_0_0_#E7E5E4] overflow-hidden p-4 space-y-3 z-50 text-[#292524]"
                  id="notifications-box"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="font-bold text-xs font-mono tracking-wider text-amber-600 uppercase">INCOMING TELEMETRY</span>
                    <span className="text-[8px] text-stone-500 font-mono">LIVE UPDATE</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {totalPending === 0 ? (
                      <p className="text-xs text-stone-500 py-4 text-center">No pending approvals. Channels clear!</p>
                    ) : (
                      <>
                        {pendingApprovals.map(appr => {
                          const child = children.find(c => c.id === appr.child_id);
                          const task = tasks.find(t => t.id === appr.task_id);
                          return (
                            <div key={appr.id} className="p-2.5 bg-[#F5F2EA] rounded-xl text-xs flex gap-2 border border-stone-200 text-stone-850">
                              <span className="text-lg">📢</span>
                              <div>
                                <p className="text-stone-800 font-bold">{child?.name || 'Child'} finished a chore!</p>
                                <p className="text-amber-600 font-semibold text-[11px] mt-0.5">{task?.title || 'Unknown Chores'}</p>
                              </div>
                            </div>
                          );
                        })}
                        {pendingRedemptions.map(req => {
                          const child = children.find(c => c.id === req.child_id);
                          return (
                            <div key={req.id} className="p-2.5 bg-rose-50 rounded-xl text-xs flex gap-2 border border-rose-200 text-stone-850">
                              <span className="text-lg">🎁</span>
                              <div>
                                <p className="text-stone-800 font-bold">{child?.name || 'Child'} wants a reward!</p>
                                <p className="text-rose-600 font-semibold text-[11px] mt-0.5">{req.reward_name}</p>
                              </div>
                            </div>
                          );
                        })}
                        {pendingGiftingRequests.map(req => {
                          const child = children.find(c => c.id === req.child_id);
                          const typeIcon = req.type === 'charity' ? '🌍' : '💝';
                          const title = req.type === 'charity' ? `Charity: ${req.charity_name}` : `Gift to: ${children.find(c => c.id === req.sibling_id)?.name}`;
                          return (
                            <div key={req.id} className="p-2.5 bg-blue-50 rounded-xl text-xs flex gap-2 border border-blue-200 text-stone-850">
                              <span className="text-lg">{typeIcon}</span>
                              <div>
                                <p className="text-stone-800 font-bold">{child?.name || 'Child'} sent a gift!</p>
                                <p className="text-blue-600 font-semibold text-[11px] mt-0.5">{title}</p>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => {
              playSound.click();
              onExitParentMode();
            }}
            className="flex items-center gap-1 sm:gap-2 bg-rose-500 hover:bg-rose-450 text-white font-extrabold border-2 border-stone-900 shadow-[0_3px_0_0_#1c1917] active:translate-y-1 active:shadow-none active:scale-95 transition-all uppercase px-2.5 py-1.5 sm:px-4.5 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-mono"
            id="exit-to-child-view-btn"
          >
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>SWITCH TO KID VIEW</span>
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12" id="parent-workspace">
        
        <aside className={`hidden lg:flex lg:flex-col lg:col-span-3 bg-stone-50 border-r border-stone-200 p-6 space-y-6`}>
          <div className="space-y-1">
            <span className={`text-[10px] font-bold font-mono text-amber-700 uppercase tracking-widest`}>ARCADE UTILITY RAILS</span>
            <p className={`text-xs text-stone-500`}>Configure chore metrics and levels.</p>
          </div>

          <nav className="flex flex-col gap-2" id="parent-sidebar-nav">
            {[
              { id: 'approvals', label: 'INBOX & APPROVALS', icon: CheckSquare, badge: totalPending, badgeColor: 'bg-rose-500' },
              { id: 'children', label: 'CHILDREN', icon: Users, count: children.length },
              { id: 'tasks', label: 'QUEST TEMPLATES', icon: CheckSquare, count: tasks.filter(t => t.is_template).length },
              { id: 'rewards', label: 'PRIZE DISPENSERS', icon: Trophy, count: rewards.filter(r => r.is_template !== false && r.child_id === 'directory').length },
              { id: 'targets', label: 'TARGETS & POTS', icon: Target },
              { id: 'compliance', label: 'COPPA SECURITY', icon: ShieldCheck },
              { id: 'settings', label: 'SETTINGS / ADMIN', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { playSound.click(); setActiveTab(tab.id as any); }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-400 border border-stone-900 text-stone-950 font-black shadow-[0_3px_0_0_#1c1917]'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 text-stone-900`} /> {tab.label}
                  </span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`${tab.badgeColor} text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold`}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-mono text-stone-500 font-bold`}>
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className={`p-4 rounded-2xl ${styles.cardBg} border ${styles.borderStyle} flex flex-col gap-2`}>
            <h4 className={`text-xs font-bold font-display ${styles.textColor} flex items-center gap-1.5`}>
              <Sparkles className="w-4 h-4 text-amber-400" /> EVOLUTION ENGINE ACTIVE
            </h4>
            <p className={`text-[11px] ${styles.textMuted} leading-relaxed font-sans`}>
              Child points automatically scale companions through 3 stages. Stage 1 is an egg pod, Stage 2 is adolescent form, and Stage 3 unlocks high-flying heroism (150+ pts)!
            </p>
          </div>
        </aside>

        <main className="lg:col-span-9 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
            <div className={`p-1.5 sm:p-4 rounded-lg sm:rounded-2xl ${styles.cardBg} border ${styles.borderStyle} flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-center sm:text-left`}>
              <div className={`p-1 sm:p-3 rounded-md sm:rounded-xl bg-amber-50 text-amber-700 border border-amber-200`}>
                <Activity className="w-3.5 h-3.5 sm:w-5 sm:h-5 animate-pulse" />
              </div>
              <div className="w-full">
                <span className={`block text-[6px] sm:text-[8px] font-mono ${styles.textMuted} uppercase font-extrabold truncate`}>COMPLETED</span>
                <span className={`text-xs sm:text-xl font-black ${styles.titleColor} font-mono`}>{approvedCompletionsCount} <span className="hidden sm:inline">QUESTS</span></span>
              </div>
            </div>
            <div className={`p-1.5 sm:p-4 rounded-lg sm:rounded-2xl ${styles.cardBg} border ${styles.borderStyle} flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-center sm:text-left`}>
              <div className={`p-1 sm:p-3 rounded-md sm:rounded-xl bg-amber-50 text-amber-700 border border-amber-200`}>
                <Award className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <div className="w-full">
                <span className={`block text-[6px] sm:text-[8px] font-mono ${styles.textMuted} uppercase font-extrabold truncate`}>ACTIVE</span>
                <span className={`text-xs sm:text-xl font-black ${styles.titleColor} font-mono`}>{children.length} <span className="hidden sm:inline">CHILDREN</span></span>
              </div>
            </div>
            <div className={`p-1.5 sm:p-4 rounded-lg sm:rounded-2xl ${styles.cardBg} border ${styles.borderStyle} flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-center sm:text-left`}>
              <div className={`p-1 sm:p-3 rounded-md sm:rounded-xl bg-rose-50 text-rose-700 border border-rose-200`}>
                <ShieldAlert className="w-3.5 h-3.5 sm:w-5 sm:h-5 animate-bounce-slow" />
              </div>
              <div className="w-full">
                <span className={`block text-[6px] sm:text-[8px] font-mono ${styles.textMuted} uppercase font-extrabold truncate text-rose-500`}>PENDING</span>
                <span className={`text-xs sm:text-xl font-black text-rose-600 font-mono`}>{totalPending} <span className="hidden sm:inline">TASKS</span></span>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {activeTab === 'approvals' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                key="approvals-tab"
                className="space-y-6"
                id="approvals-view"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className={`text-2xl font-black font-display ${styles.titleColor}`}>INBOX & APPROVALS</h2>
                    <p className={`text-xs ${styles.textMuted}`}>Authorize finished duties and deliver claimed prizes.</p>
                  </div>
                  <span className={`px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-bold font-mono`}>
                    {totalPending} STANDBY
                  </span>
                </div>

                {/* Family Messaging Section */}
                {linkedParents.length > 1 && (
                  <div className={`p-5 rounded-3xl border ${styles.cardBg} ${styles.borderStyle}`}>
                    <h3 className={`font-bold font-mono text-sm text-stone-900 uppercase mb-4 flex items-center gap-2`}>
                      <MessageSquare className="w-4 h-4" /> Family Comms
                    </h3>
                    
                    {/* Message Input */}
                    <div className="flex flex-col gap-3 mb-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${styles.textMuted}`}>To:</span>
                        <select
                          value={messageReceiverId}
                          onChange={(e) => setMessageReceiverId(e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono border bg-stone-50 border-stone-200 text-stone-900 outline-none`}
                        >
                          <option value="all">Everyone</option>
                          {linkedParents.filter(p => p.user_id !== parentProfile?.user_id).map(p => (
                            <option key={p.user_id} value={p.user_id}>{p.name || p.email}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Type a message to other parents..."
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-mono border bg-white border-stone-200 text-stone-900 placeholder-stone-400 outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || isSendingMessage}
                          className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors flex items-center justify-center`}
                        >
                          {isSendingMessage ? '...' : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Messages List */}
                    {familyMessages.length > 0 && (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {familyMessages.map(msg => {
                          const sender = linkedParents.find(p => p.user_id === msg.sender_id);
                          const isMine = msg.sender_id === parentProfile?.user_id;
                          const amIReceiver = msg.receiver_id === parentProfile?.user_id || msg.receiver_id === null;
                          const showReadBtn = amIReceiver && !isMine && !msg.is_read;
                          
                          return (
                            <div key={msg.id} className={`flex gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
                              {!isMine && (
                                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs bg-indigo-100 text-indigo-600`}>
                                  {sender?.name?.charAt(0) || '?'}
                                </div>
                              )}
                              <div className={`max-w-[80%] rounded-2xl p-3 ${
                                isMine 
                                  ? ('bg-indigo-500 text-white rounded-tr-sm') 
                                  : ('bg-stone-100 text-stone-800 rounded-tl-sm')
                              }`}>
                                <div className={`text-[9px] font-mono font-bold mb-1 opacity-70 flex justify-between gap-4`}>
                                  <span>{isMine ? 'You' : (sender?.name || 'Unknown')} {msg.receiver_id ? '(Direct)' : '(To Everyone)'}</span>
                                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm">{msg.message}</p>
                                {showReadBtn && (
                                  <button 
                                    onClick={() => handleMarkMessageRead(msg.id)}
                                    className="mt-2 text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300 hover:text-indigo-200 bg-black/20 px-2 py-1 rounded"
                                  >
                                    Mark as Read
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {totalPending === 0 ? (
                  <div className={`p-12 text-center rounded-3xl ${styles.cardBg} border ${styles.borderStyle} space-y-4`}>
                    <span className="text-5xl inline-block animate-bounce-slow">🚀</span>
                    <h3 className={`text-lg font-black ${styles.titleColor} uppercase tracking-wide font-display`}>ALL CHANNELS CLEAR</h3>
                    <p className={`text-xs ${styles.textMuted} max-w-sm mx-auto leading-relaxed`}>
                      Whenever kids finish tasks or claim prizes, they will cascade here for parent authorisation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {pendingApprovals.length > 0 && (
                      <div className="space-y-4">
                        <h3 className={`font-bold font-mono text-sm text-stone-900 uppercase border-b border-stone-200 pb-2`}>
                          🧹 Pending Chores ({pendingApprovals.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingApprovals.map((appr) => {
                            const child = children.find(c => c.id === appr.child_id);
                            const task = tasks.find(t => t.id === appr.task_id);
                            const character = CHARACTER_PACKS.find(cp => cp.id === child?.character_id);
                            return (
                              <div
                                key={appr.id}
                                className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 ${styles.cardBg} ${styles.borderStyle}`}
                              >
                                <div className="flex gap-4 items-start">
                                  <img
                                    src={child?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'}
                                    alt="Child avatar"
                                    className={`w-14 h-14 rounded-2xl p-1 border bg-stone-100 border-stone-200`}
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`font-extrabold text-sm ${styles.textColor}`}>{child?.name}</span>
                                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase`}>
                                        {character?.name.split(' ')[0]}
                                      </span>
                                    </div>
                                    <h3 className={`font-extrabold ${styles.titleColor} text-base mt-1.5`}>
                                      {task?.title || 'Unknown Task'}
                                    </h3>
                                    <p className={`text-[10px] font-mono ${styles.textMuted} mt-0.5`}>
                                      COMPLETED AT: {new Date(appr.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>

                                <div className={`flex items-center justify-between border-t border-stone-150 pt-4 mt-2`}>
                                  <div className="flex gap-3">
                                    <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${styles.textColor}`}>
                                      <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                      {task?.points || 0} Gold
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${styles.textColor}`}>
                                      <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
                                      {task?.xp ?? task?.points ?? 0} XP
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleReject(appr.id)}
                                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1 border bg-stone-50 border-stone-200 text-stone-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200`}
                                    >
                                      <X className="w-4 h-4" /> REJECT
                                    </button>
                                    <button
                                      onClick={() => handleApprove(appr.id)}
                                      className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-400 border border-stone-900 text-stone-950 shadow-[0_2.5px_0_0_#1c1917] hover:translate-y-0.5 active:shadow-[0_0.5px_0_0_#1c1917] rounded-xl text-xs font-mono font-black cursor-pointer transition-all flex items-center gap-1 shadow-md`}
                                    >
                                      <Check className="w-4 h-4 stroke-[3px]" /> AUTHORIZE
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
              
                    {pendingRedemptions.length > 0 && (
                      <div className="space-y-4">
                        <h3 className={`font-bold font-mono text-sm text-stone-900 uppercase border-b border-stone-200 pb-2`}>
                          🎁 Pending Prize Deliveries ({pendingRedemptions.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingRedemptions.map((delivery) => {
                            const child = children.find(c => c.id === delivery.child_id);
                            const reward = rewards.find(r => r.id === delivery.reward_id);
                            return (
                              <div
                                key={delivery.id}
                                className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 ${styles.cardBg} ${styles.borderStyle}`}
                              >
                                <div className="flex gap-4 items-start">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border bg-stone-100 border-stone-200`}>
                                    🎁
                                  </div>
                                  <div>
                                    <span className={`font-extrabold text-sm ${styles.textColor}`}>{child?.name} claimed:</span>
                                    <h3 className={`font-extrabold ${styles.titleColor} text-base mt-1.5`}>
                                      {reward?.title || 'Unknown Reward'}
                                    </h3>
                                    <p className={`text-[10px] font-mono ${styles.textMuted} mt-0.5`}>
                                      CLAIMED AT: {new Date(delivery.redeemed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                                <div className={`flex items-center justify-between border-t border-stone-150 pt-4 mt-2`}>
                                  <div className={`flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl`}>
                                    <span className={`font-mono font-black text-xs text-rose-700`}>-{reward?.cost_points || 0} XP</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        playSound.success();
                                        onDeliverReward(delivery.id);
                                      }}
                                      className={`px-4 py-2 bg-emerald-400 hover:bg-emerald-300 border border-stone-900 text-stone-950 shadow-[0_2.5px_0_0_#1c1917] hover:translate-y-0.5 active:shadow-[0_0.5px_0_0_#1c1917] rounded-xl text-xs font-mono font-black cursor-pointer transition-all flex items-center gap-1 shadow-md`}
                                    >
                                      <Check className="w-4 h-4 stroke-[3px]" /> APPROVE
                                    </button>
                                    <button
                                      onClick={() => {
                                        playSound.click();
                                        onRejectReward(delivery.id);
                                      }}
                                      className={`px-4 py-2 bg-stone-50 border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-rose-600 rounded-xl text-xs font-mono font-black cursor-pointer transition-all flex items-center gap-1`}
                                    >
                                      <X className="w-4 h-4 stroke-[3px]" /> DENY
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {pendingGiftingRequests.length > 0 && (
                      <div className="space-y-4">
                        <h3 className={`font-bold font-mono text-sm text-stone-900 uppercase border-b border-stone-200 pb-2`}>
                          💖 Pending Gifting Requests ({pendingGiftingRequests.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingGiftingRequests.map((req) => {
                            const child = children.find(c => c.id === req.child_id);
                            return (
                              <div
                                key={req.id}
                                className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 ${styles.cardBg} ${styles.borderStyle}`}
                              >
                                <div className="flex gap-4 items-start">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border bg-stone-100 border-stone-200`}>
                                    {req.type === 'charity' ? '🌍' : '🎁'}
                                  </div>
                                  <div>
                                    <span className={`font-extrabold text-sm ${styles.textColor}`}>{child?.name} requested:</span>
                                    <h3 className={`font-extrabold ${styles.titleColor} text-base mt-1.5`}>
                                      {req.type === 'charity' ? `Donate to Charity (${(req as any).charity_name})` : `Gift to Sibling (${children.find(c => c.id === req.sibling_id)?.name})`}
                                    </h3>
                                    <p className={`text-[10px] font-mono ${styles.textMuted} mt-0.5`}>
                                      REQUESTED AT: {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                                <div className={`flex items-center justify-between border-t border-stone-150 pt-4 mt-2`}>
                                  <div className={`flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl`}>
                                    <span className={`font-mono font-black text-xs text-rose-700`}>{req.amount} Gold Coins</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        playSound.success();
                                        onApproveGiftingRequest(req.id);
                                      }}
                                      className={`px-4 py-2 bg-emerald-400 hover:bg-emerald-300 border border-stone-900 text-stone-950 shadow-[0_2.5px_0_0_#1c1917] hover:translate-y-0.5 active:shadow-[0_0.5px_0_0_#1c1917] rounded-xl text-xs font-mono font-black cursor-pointer transition-all flex items-center gap-1 shadow-md`}
                                    >
                                      <Check className="w-4 h-4 stroke-[3px]" /> APPROVE
                                    </button>
                                    <button
                                      onClick={() => {
                                        playSound.click();
                                        onRejectGiftingRequest(req.id);
                                      }}
                                      className={`px-4 py-2 bg-stone-50 border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-rose-600 rounded-xl text-xs font-mono font-black cursor-pointer transition-all flex items-center gap-1`}
                                    >
                                      <X className="w-4 h-4 stroke-[3px]" /> DENY
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
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
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className={`text-2xl font-black font-display ${styles.titleColor}`}>CHILDREN REGISTER</h2>
                    <p className={`text-xs ${styles.textMuted}`}>Initialize new operators and monitor active companion level caps.</p>
                  </div>
                  <button
                    onClick={() => { playSound.click(); setShowAddChild(true); }}
                    className={`bg-stone-900 hover:bg-stone-800 text-white shadow-[0_3px_0_0_#1c1917] font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all font-mono`}
                    id="add-child-btn-top"
                  >
                    <UserPlus className="w-4 h-4" /> REGISTER NEW CHILD
                  </button>
                </div>

                {showAddChild && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl ${styles.cardBg} border border-stone-900 shadow-2xl space-y-4`}
                    id="add-child-box"
                  >
                    <h3 className={`font-bold text-lg text-stone-900 font-display uppercase tracking-wide`}>
                      {editingChildId ? '✏️ Edit Child' : '👶 Register Family Child'}
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
                            className={`w-full px-3 py-2 bg-white border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Companion Egg Species</label>
                          <select
                            value={newChildChar}
                            onChange={(e) => setNewChildChar(e.target.value)}
                            className={`w-full px-3 py-2 bg-white border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
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
                        <button
                          type="submit"
                          className={`flex-1 bg-amber-400 hover:bg-amber-300 border border-stone-900 shadow-[0_3px_0_0_#1c1917] text-stone-950 py-2.5 rounded-xl text-xs font-black cursor-pointer font-mono uppercase tracking-wider`}
                        >
                          {editingChildId ? 'SAVE CHANGES' : 'ADD CHILD & HATCH EGG'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddChild(false);
                            setEditingChildId(null);
                            setNewChildName('');
                            setNewChildChar('unicorn');
                            setNewChildAvatar('/avatars/boy_fox.png');
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-mono border bg-white border-stone-200 text-stone-500 hover:bg-stone-50`}
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sortedChildren.map((child) => {
                    const stage = getCharacterStage(child.character_id, child.level);
                    const pack = CHARACTER_PACKS.find(cp => cp.id === child.character_id);
                    return (
                      <div
                        key={child.id}
                        className={`p-5 rounded-3xl ${styles.cardBg} border ${styles.borderStyle} flex flex-col gap-4 relative overflow-hidden`}
                      >
                        <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${stage.color_theme}`} />

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
                              <div className={`flex items-center gap-1 text-xs font-mono font-bold ${styles.textColor} whitespace-nowrap`}>
                                <Coins className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                                <span>{child.points} Gold</span>
                              </div>
                              {child.savings_unlocked && (
                                <div className={`flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 whitespace-nowrap`}>
                                  <span className="text-sm">🐷</span>
                                  <span>{child.savings_pot || 0} Saved</span>
                                </div>
                              )}
                              <div className={`flex items-center gap-1 text-xs font-mono font-bold ${styles.textColor} whitespace-nowrap`}>
                                <TrendingUp className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                                <span>Lvl {child.level || 1} <span className="text-[10px] ml-1 opacity-70">({child.xp_in_level || 0}/{parentProfile?.xp_to_level_up ?? 100} XP)</span></span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => openEditChild(child)}
                            className={`p-2 rounded-xl transition-all cursor-pointer border absolute top-4 right-4 bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
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
                                >
                                  <div className={`p-3 space-y-3 border-t border-stone-200`}>
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
                                      <span className={`text-xs font-mono ${styles.textColor}`}>XP:</span>
                                      <div className="flex gap-1">
                                        <button onClick={() => { 
                                          playSound.click(); 
                                          setResetConfirmation({childId: child.id, childName: child.name, type: 'XP'});
                                        }} className={`p-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50`} title="Reset XP to 0"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { xp_in_level: Math.max(0, (child.xp_in_level || 0) - 10) }); }} className={`p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50`} title="Remove 10 XP"><MinusCircle className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { xp_in_level: (child.xp_in_level || 0) + 10 }); }} className={`p-1.5 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50`} title="Add 10 XP"><PlusCircle className="w-3.5 h-3.5" /></button>
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
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`text-[10px] font-mono ${styles.textColor}`}>Weekly XP:</span>
                                      <div className="flex gap-1">
                                        <button onClick={() => { 
                                          playSound.click(); 
                                          setResetConfirmation({childId: child.id, childName: child.name, type: 'Weekly XP'});
                                        }} className={`p-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50`} title="Reset Weekly XP to 0"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { weekly_xp: Math.max(0, (child.weekly_xp || 0) - 50) }); }} className={`p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50`} title="Remove 50 Weekly XP"><MinusCircle className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { weekly_xp: (child.weekly_xp || 0) + 50 }); }} className={`p-1.5 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50`} title="Add 50 Weekly XP"><PlusCircle className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`text-[10px] font-mono ${styles.textColor}`}>Monthly XP:</span>
                                      <div className="flex gap-1">
                                        <button onClick={() => { 
                                          playSound.click(); 
                                          setResetConfirmation({childId: child.id, childName: child.name, type: 'Monthly XP'});
                                        }} className={`p-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50`} title="Reset Monthly XP to 0"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { monthly_xp: Math.max(0, (child.monthly_xp || 0) - 10) }); }} className={`p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50`} title="Remove 10 Monthly XP"><MinusCircle className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { monthly_xp: (child.monthly_xp || 0) + 10 }); }} className={`p-1.5 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50`} title="Add 10 Monthly XP"><PlusCircle className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`text-[10px] font-mono ${styles.textColor}`}>Streak Days:</span>
                                      <div className="flex gap-1">
                                        <button onClick={() => { 
                                          playSound.click(); 
                                          setResetConfirmation({childId: child.id, childName: child.name, type: 'Streak'});
                                        }} className={`p-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50`} title="Reset Streak to 0"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { streak_days: Math.max(0, (child.streak_days || 0) - 1) }); }} className={`p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50`} title="Remove 1 Streak Day"><MinusCircle className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => { playSound.click(); onUpdateChildStats(child.id, { streak_days: (child.streak_days || 0) + 1 }); }} className={`p-1.5 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50`} title="Add 1 Streak Day"><PlusCircle className="w-3.5 h-3.5" /></button>
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
                            <span className={`font-extrabold ${styles.titleColor}`}>{child.xp_in_level} / {parentProfile?.xp_to_level_up ?? 100} XP</span>
                          </div>
                          <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border bg-stone-100 border-stone-200 mt-2`}>
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${stage.color_theme}`}
                              style={{ width: `${Math.min(100, ((child.xp_in_level || 0) / (parentProfile?.xp_to_level_up ?? 100)) * 100)}%` }}
                            />
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
                  <div>
                    <h2 className={`text-xl sm:text-2xl font-black font-display ${styles.titleColor}`}>ACTIVE DIRECTORY</h2>
                    <p className={`text-[10px] sm:text-xs ${styles.textMuted} hidden sm:block`}>Configure chore metrics, behaviours, and point allocations.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleImportDefaultTasks}
                      className={`flex-1 sm:flex-none justify-center px-3 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold font-mono transition-colors border border-stone-300 text-stone-600 hover:bg-stone-100 flex items-center gap-1.5 sm:gap-2`}
                    >
                      <Plus className="w-3.5 h-3.5" /> IMPORT <span className="hidden sm:inline">DEFAULTS</span>
                    </button>
                    <button
                      onClick={() => { playSound.click(); setShowAddTask(true); }}
                      className={`flex-1 sm:flex-none justify-center bg-stone-900 hover:bg-stone-800 text-white shadow-[0_3px_0_0_#1c1917] font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all font-mono`}
                      id="add-chore-btn-top"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> CREATE <span className="hidden sm:inline">TEMPLATE</span>
                    </button>
                  </div>
                </div>

                {showAddTask && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl ${styles.cardBg} border border-stone-900 shadow-2xl space-y-4`}
                    id="add-task-box"
                  >
                    <h3 className={`font-bold text-lg text-stone-900 font-display uppercase tracking-wide`}>
                      {editingTaskId ? '✏️ Edit Quest Blueprint' : '🧹 Create Quest Blueprint'}
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
                            className={`w-full px-3 py-2 bg-white border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
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
                              className={`w-full px-3 py-2 bg-white border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            />
                          </div>
                          <div className="flex-1">
                            <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>XP Reward</label>
                            <input
                              type="number"
                              min="0"
                              value={taskXp}
                              onChange={e => setTaskXp(Number(e.target.value))}
                              className={`w-full px-3 py-2 bg-white border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Recurrence Cycle</label>
                          <select
                            value={taskRecurrence}
                            onChange={(e) => setTaskRecurrence(e.target.value as any)}
                            className={`w-full px-3 py-2 bg-white border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
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
                              className={`w-full px-3 py-2 bg-white border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                              required
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className={`flex-1 bg-amber-400 hover:bg-amber-300 border border-stone-900 shadow-[0_3px_0_0_#1c1917] text-stone-950 py-2.5 rounded-xl text-xs font-black cursor-pointer font-mono uppercase`}
                        >
                          {editingTaskId ? 'SAVE CHANGES' : 'ACTIVATE BLUEPRINT'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddTask(false);
                            setEditingTaskId(null);
                            setTaskTitle('');
                            setTaskPoints(15);
                            setTaskXp(15);
                            setTaskCooldownMinutes(undefined);
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-mono border bg-white border-stone-200 text-stone-500 hover:bg-stone-50`}
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* SUB-TABS FOR TASKS */}
                <div className="flex gap-2 border-b border-stone-200/50 pb-3 mb-4 sm:pb-4 sm:mb-6 overflow-x-auto">
                  <button
                    onClick={() => setTaskSubTab('directory')}
                    className={`shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold font-mono transition-all ${
                      taskSubTab === 'directory'
                        ? ('bg-stone-900 text-white')
                        : ('bg-stone-100 text-stone-500 hover:text-stone-900')
                    }`}
                  >
                    BLUEPRINTS <span className="hidden sm:inline">(DIRECTORY)</span>
                  </button>
                  <button
                    onClick={() => setTaskSubTab('active')}
                    className={`shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold font-mono transition-all ${
                      taskSubTab === 'active'
                        ? ('bg-stone-900 text-white')
                        : ('bg-stone-100 text-stone-500 hover:text-stone-900')
                    }`}
                  >
                    ASSIGNED <span className="hidden sm:inline">(ACTIVE)</span>
                  </button>
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
                        <div key={task.id} className={`border p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col gap-2 sm:gap-3 ${styles.cardBg} ${styles.borderStyle}`}>
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200`}>
                                  {task.category.toUpperCase()}
                                </span>
                                <div className={`flex gap-3 text-sm font-mono font-bold ${styles.textColor}`}>
                                  <span className="flex items-center gap-1"><Coins className="w-4 h-4 text-yellow-500" /> {task.points}</span>
                                  <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-cyan-500" /> {task.xp ?? task.points}</span>
                                </div>
                              </div>
                              <h3 className={`font-extrabold ${styles.titleColor} text-base mt-2 font-display`}>{task.title}</h3>
                              <p className={`text-xs ${styles.textMuted} mt-1`}>
                                Assigned to: <strong className={`font-bold text-amber-700`}>{assignedChildren.length > 0 ? assignedChildren.join(', ') : 'No one'}</strong>
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-3 shrink-0">
                              <span className={`font-mono font-black text-sm text-emerald-700`}>
                                +{task.points} GOLD
                              </span>

                              <button
                                onClick={() => {
                                  playSound.click();
                                  setSelectingChildForTaskId(selectingChildForTaskId === task.id ? null : task.id);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black cursor-pointer transition-all flex items-center gap-1 shadow-md ${
                                  'bg-indigo-400 hover:bg-indigo-300 border border-stone-900 text-stone-950 shadow-[0_2.5px_0_0_#1c1917]'
                                }`}
                              >
                                <PlusCircle className="w-4 h-4" /> Assign...
                              </button>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditTask(task)}
                                  className={`p-2 rounded-xl transition-all cursor-pointer border bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { playSound.click(); onDeleteTask(task.id); }}
                                  className={`p-2 rounded-xl transition-all cursor-pointer border bg-stone-50 border-stone-200 text-stone-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                            {selectingChildForTaskId === task.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className={`border-t pt-3 mt-1 flex flex-col gap-2 overflow-hidden border-stone-200`}
                              >
                                <p className={`text-[10px] font-mono font-bold ${styles.textMuted} uppercase`}>
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
                                            ? ('bg-amber-400 border-stone-900 text-stone-900 shadow-[0_2px_0_0_#1c1917]')
                                            : ('bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100')
                                        }`}
                                      >
                                        <img src={child.avatar_url} alt={child.name} className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700/50 object-cover" />
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
                  <h3 className={`text-xl font-black font-display ${styles.titleColor} mb-4`}>ACTIVE QUESTS (ASSIGNED)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.filter(t => !t.is_template).map((task) => {
                    const assignedName = children.find(c => c.id === task.child_id)?.name;
                    return (
                      <div
                        key={task.id}
                        className={`border p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col gap-2 sm:gap-3 ${styles.cardBg} ${styles.borderStyle}`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200`}>
                                {task.category.toUpperCase()}
                              </span>
                              <div className={`flex gap-3 text-sm font-mono font-bold ${styles.textColor}`}>
                                <span className="flex items-center gap-1"><Coins className="w-4 h-4 text-yellow-500" /> {task.points}</span>
                                <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-cyan-500" /> {task.xp ?? task.points}</span>
                              </div>
                            </div>
                            <h3 className={`font-extrabold ${styles.titleColor} text-base mt-2 font-display`}>{task.title}</h3>
                            <p className={`text-xs ${styles.textMuted} mt-1`}>
                              Child assigned: <strong className={`font-bold text-amber-700`}>{assignedName || 'None'}</strong>
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-3 shrink-0">
                            <span className={`font-mono font-black text-sm text-emerald-700`}>
                              +{task.points} GOLD
                            </span>

                            <button
                              onClick={() => {
                                playSound.success();
                                onParentCompleteTask(task.id, task.child_id);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black cursor-pointer transition-all flex items-center gap-1 shadow-md ${
                                'bg-emerald-500 hover:bg-emerald-400 border border-stone-900 text-stone-950 shadow-[0_2.5px_0_0_#1c1917] hover:translate-y-0.5 active:shadow-[0_0.5px_0_0_#1c1917]'
                              }`}
                              id={`parent-complete-${task.id}`}
                            >
                              ⚡ Complete
                            </button>

                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditTask(task)}
                                className={`p-2 rounded-xl transition-all cursor-pointer border bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  playSound.click();
                                  onDeleteTask(task.id);
                                }}
                                className={`p-2 rounded-xl transition-all cursor-pointer border bg-stone-50 border-stone-200 text-stone-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200`}
                                id={`delete-task-${task.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
                  <div>
                    <h2 className={`text-xl sm:text-2xl font-black font-display ${styles.titleColor}`}>PRIZE DISPENSER CONTROL</h2>
                    <p className={`text-[10px] sm:text-xs ${styles.textMuted} hidden sm:block`}>Configure tangible awards and point exchange costs.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleImportDefaultRewards}
                      className={`flex-1 sm:flex-none justify-center px-3 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold font-mono transition-colors border border-stone-300 text-stone-600 hover:bg-stone-100 flex items-center gap-1.5 sm:gap-2`}
                    >
                      <Plus className="w-3.5 h-3.5" /> IMPORT <span className="hidden sm:inline">DEFAULTS</span>
                    </button>
                    <button
                      onClick={() => { playSound.click(); setShowAddReward(true); }}
                      className={`flex-1 sm:flex-none justify-center bg-stone-900 hover:bg-stone-800 text-white shadow-[0_3px_0_0_#1c1917] font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all font-mono`}
                      id="add-reward-btn-top"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ADD <span className="hidden sm:inline">REWARD</span>
                    </button>
                  </div>
                </div>

                {/* Add Custom Reward Overlay */}
                {showAddReward && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl ${styles.cardBg} border border-stone-900 shadow-2xl space-y-4`}
                    id="add-reward-box"
                  >
                    <h3 className={`font-bold text-lg text-stone-900 font-display uppercase tracking-wide`}>
                      {editingRewardId ? '✏️ Edit Reward Token' : '🎁 Define Reward Token'}
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
                            className={`w-full px-3 py-2 bg-white border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Point Cost</label>
                          <input
                            type="number"
                            value={rewardCost}
                            onChange={(e) => setRewardCost(Number(e.target.value))}
                            className={`w-full px-3 py-2 bg-white border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
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
                            className={`w-full px-3 py-2 bg-white border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
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
                            className={`w-full px-3 py-2 bg-white border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                          >
                            <option value="unlimited">♾️ Unlimited</option>
                            <option value="daily">📅 1x Daily</option>
                            <option value="twice_daily">✌️ 2x Daily (Requires cooldown)</option>
                            <option value="one_time">🎯 One-Time (Disappears after use)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className={`flex-1 bg-amber-400 hover:bg-amber-300 border border-stone-900 shadow-[0_3px_0_0_#1c1917] text-stone-950 py-2.5 rounded-xl text-xs font-black cursor-pointer font-mono uppercase`}
                        >
                          {editingRewardId ? 'SAVE CHANGES' : 'DEPLOY PRIZE SLOT'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddReward(false);
                            setEditingRewardId(null);
                            setRewardTitle('');
                            setRewardCost(50);
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-mono border bg-white border-stone-200 text-stone-500 hover:bg-stone-50`}
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* SUB-TABS FOR REWARDS */}
                <div className="flex gap-2 border-b border-stone-200/50 pb-3 mb-4 sm:pb-4 sm:mb-6 overflow-x-auto">
                  <button
                    onClick={() => setRewardSubTab('directory')}
                    className={`shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold font-mono transition-all ${
                      rewardSubTab === 'directory'
                        ? ('bg-stone-900 text-white')
                        : ('bg-stone-100 text-stone-500 hover:text-stone-900')
                    }`}
                  >
                    BLUEPRINTS <span className="hidden sm:inline">(DIRECTORY)</span>
                  </button>
                  <button
                    onClick={() => setRewardSubTab('active')}
                    className={`shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold font-mono transition-all ${
                      rewardSubTab === 'active'
                        ? ('bg-stone-900 text-white')
                        : ('bg-stone-100 text-stone-500 hover:text-stone-900')
                    }`}
                  >
                    ASSIGNED <span className="hidden sm:inline">(ACTIVE)</span>
                  </button>
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
                        <div key={reward.id} className={`border p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col gap-2 sm:gap-3 ${styles.cardBg} ${styles.borderStyle}`}>
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-3.5 items-center">
                              <span className={`text-3xl bg-stone-100 border border-stone-200 p-2.5 rounded-2xl`}>🎁</span>
                              <div>
                                <h3 className={`font-extrabold ${styles.titleColor} text-base font-display`}>
                                  {reward.title}
                                </h3>
                                <p className={`text-xs ${styles.textMuted} mt-1`}>
                                  Assigned to: <strong className={`font-bold text-amber-700`}>{assignedChildren.length > 0 ? assignedChildren.join(', ') : 'No one'}</strong>
                                  <span className="mx-2">•</span>
                                  Limit: <strong className="font-bold uppercase text-[9px]">{(reward.limit_type || 'unlimited').replace('_', ' ')}</strong>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                              <span className={`font-mono font-black text-sm text-amber-600`}>
                                {reward.cost_points} GOLD
                              </span>

                              <button
                                onClick={() => {
                                  playSound.click();
                                  setSelectingChildForTaskId(selectingChildForTaskId === reward.id ? null : reward.id);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black cursor-pointer transition-all flex items-center gap-1 shadow-md ${
                                  'bg-stone-900 hover:bg-stone-800 text-white shadow-[0_2.5px_0_0_#1c1917]'
                                }`}
                              >
                                <PlusCircle className="w-4 h-4" /> Assign...
                              </button>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditReward(reward)}
                                  className={`p-2 rounded-xl transition-all cursor-pointer border bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { playSound.click(); onDeleteReward(reward.id); }}
                                  className={`p-2 rounded-xl transition-all cursor-pointer border bg-stone-50 border-stone-200 text-stone-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                            {selectingChildForTaskId === reward.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className={`border-t pt-3 mt-1 flex flex-col gap-2 overflow-hidden border-stone-200`}
                              >
                                <p className={`text-[10px] font-mono font-bold ${styles.textMuted} uppercase`}>
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
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-extrabold transition-all cursor-pointer ${
                                          isAssigned
                                            ? ('bg-stone-900 border-stone-900 text-white shadow-[0_2px_0_0_#1c1917]')
                                            : ('bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100')
                                        }`}
                                      >
                                        <img src={child.avatar_url} alt={child.name} className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700/50 object-cover" />
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
                  <h3 className={`text-xl font-black font-display ${styles.titleColor} mb-4`}>ACTIVE REWARDS (ASSIGNED)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewards.filter(r => !r.is_template).map((reward) => {
                    const assignedName = children.find(c => c.id === reward.child_id)?.name;
                    return (
                      <div
                        key={reward.id}
                        className={`border p-3 sm:p-4 rounded-xl sm:rounded-2xl flex justify-between items-center gap-2 sm:gap-3 ${styles.cardBg} ${styles.borderStyle}`}
                      >
                        <div className="flex gap-3.5 items-center">
                          <span className={`text-3xl bg-stone-100 border border-stone-200 p-2.5 rounded-2xl`}>🎁</span>
                          <div>
                            <h3 className={`font-extrabold ${styles.titleColor} text-base font-display`}>
                              {reward.title}
                              {!reward.is_available && reward.limit_type === 'one_time' && (
                                <span className="ml-2 text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold uppercase align-middle">
                                  CLAIMED
                                </span>
                              )}
                            </h3>
                            <p className={`text-xs ${styles.textMuted} mt-1`}>
                              Available for: <strong className={`font-bold text-amber-700`}>{assignedName || 'None'}</strong>
                              <span className="mx-2">•</span>
                              Limit: <strong className="font-bold uppercase text-[9px]">{(reward.limit_type || 'unlimited').replace('_', ' ')}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <span className={`font-mono font-black text-sm text-amber-600`}>
                            {reward.cost_points} GOLD
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditReward(reward)}
                              className={`p-2 rounded-xl transition-all cursor-pointer border bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                playSound.click();
                                onDeleteReward(reward.id);
                              }}
                              className={`p-2 rounded-xl transition-all cursor-pointer border bg-stone-50 border-stone-200 text-stone-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200`}
                              id={`delete-reward-${reward.id}`}
                            >
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

                {/* History Log */}
                <div className="pt-8 border-t border-slate-800">
                  <h3 className={`font-bold font-mono text-sm text-stone-900 uppercase pb-4`}>
                    📜 Dispensation History Log
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
                                <button
                                  onClick={() => {
                                    playSound.success();
                                    onRestoreReward(reward.id);
                                  }}
                                  className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase border border-amber-500/50 text-amber-700 hover:bg-amber-50`}
                                >
                                  RESTORE ONE-TIME
                                </button>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. COPPA & Privacy Rules */}
            {activeTab === 'compliance' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                key="compliance-tab"
                className="space-y-6"
                id="compliance-view"
              >
                <div>
                  <h2 className={`text-2xl font-black font-display ${styles.titleColor}`}>COPPA PRIVACY LEDGER</h2>
                  <p className={`text-xs ${styles.textMuted}`}>Information assurance protocols for digital children safeguards.</p>
                </div>

                <div className={`p-6 rounded-3xl border ${styles.cardBg} ${styles.borderStyle} space-y-4 text-xs ${styles.textColor} leading-relaxed font-sans`}>
                  <div className={`flex items-center gap-2 text-stone-900 font-bold text-sm font-display`}>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Children's Online Privacy Protection Rule (COPPA)
                  </div>
                  <p>
                    Reward Chart is strictly dedicated to ensuring top-tier safety. We do not transmit child behavioural, performance, or identity data to third-party advertisers or cloud syndications. All child names and custom profiles can be held in local browser state sandbox blocks, bypassing general tracking networks.
                  </p>
                  <p>
                    As parents, you hold total sovereignty. You can delete individual child profiles, rewrite task records, or disable cloud synchronisation options instantly from these dashboards.
                  </p>
                  <p>
                    For inquiries regarding family data rights or physical regulatory safety logs, please contact markdias1984@gmail.com.
                  </p>
                  
                  <div className={`p-4 rounded-2xl border space-y-2 bg-stone-50 border-stone-200`}>
                    <h4 className={`text-amber-700 font-bold text-xs flex items-center gap-1.5 font-display`}>
                      <Info className="w-4 h-4" /> SECURE CONSOLE SECURITY
                    </h4>
                    <p className={`text-[11px] ${styles.textMuted} leading-normal`}>
                      We ensure kids do not bypass their scoring thresholds by gating parent layouts behind a 4-digit passcode lock. Always keep your parent security PIN confidential!
                    </p>
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
                  <button
                    onClick={() => { playSound.click(); setResetConfirmation(null); }}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold font-mono text-sm transition-colors ${
                      'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => {
                      playSound.purchase();
                      if (resetConfirmation.type === 'Gold') onUpdateChildStats(resetConfirmation.childId, { points: 0 });
                      if (resetConfirmation.type === 'XP') onUpdateChildStats(resetConfirmation.childId, { xp_in_level: 0 });
                      if (resetConfirmation.type === 'Level') onUpdateChildStats(resetConfirmation.childId, { level: 1 });
                      if (resetConfirmation.type === 'Weekly XP') onUpdateChildStats(resetConfirmation.childId, { weekly_xp: 0 });
                      if (resetConfirmation.type === 'Monthly XP') onUpdateChildStats(resetConfirmation.childId, { monthly_xp: 0 });
                      if (resetConfirmation.type === 'Streak') onUpdateChildStats(resetConfirmation.childId, { streak_days: 0 });
                      setResetConfirmation(null);
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold font-mono text-sm text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 ${
                      'bg-gradient-to-r from-rose-500 to-red-500'
                    }`}
                  >
                    RESET NOW
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Sticky Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center px-2 py-2 pb-safe">
          {[
            { id: 'approvals', icon: CheckSquare, badge: totalPending, badgeColor: 'bg-rose-500' },
            { id: 'children', icon: Users },
            { id: 'tasks', icon: CheckSquare },
            { id: 'rewards', icon: Trophy },
            { id: 'compliance', icon: ShieldCheck },
            { id: 'settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { playSound.click(); setActiveTab(tab.id as any); }}
                className={`relative p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`absolute top-1 right-1 ${tab.badgeColor} text-white text-[8px] font-mono px-1.5 py-0.5 rounded-full font-bold`}>
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
