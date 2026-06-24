import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckSquare, Trophy, Bell, ShieldAlert, Sparkles, Plus, 
  Trash2, LogOut, Check, X, ShieldCheck, Heart, UserPlus, 
  BookOpen, Lock, RefreshCw, Star, Info, HelpCircle, Activity, Award, Settings, CheckCircle2
} from 'lucide-react';
import { Child, Task, TaskCompletion, Reward } from '../types';
import { CHARACTER_PACKS, getCharacterStage } from '../data/characters';
import { playSound } from '../utils/sound';
import { ThemeId, THEME_PRESETS } from '../utils/theme';

interface ParentDashboardProps {
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  onAddChild: (name: string, characterId: string) => void;
  onAddTask: (title: string, points: number, category: string, recurrence: string, childId: string) => void;
  onDeleteTask: (id: string) => void;
  onAddReward: (title: string, cost: number, childId: string, icon: string) => void;
  onDeleteReward: (id: string) => void;
  onApproveCompletion: (id: string) => void;
  onRejectCompletion: (id: string) => void;
  onExitParentMode: () => void;
  parentEmail: string;
  theme: ThemeId;
}

export default function ParentDashboard({
  children,
  tasks,
  completions,
  rewards,
  onAddChild,
  onAddTask,
  onDeleteTask,
  onAddReward,
  onDeleteReward,
  onApproveCompletion,
  onRejectCompletion,
  onExitParentMode,
  parentEmail,
  theme
}: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'approvals' | 'children' | 'tasks' | 'rewards' | 'compliance'>('approvals');
  
  // Forms states
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildChar, setNewChildChar] = useState('unicorn');

  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPoints, setTaskPoints] = useState(15);
  const [taskCategory, setTaskCategory] = useState<'chores' | 'homework' | 'behavior' | 'health' | 'creative' | 'other'>('chores');
  const [taskRecurrence, setTaskRecurrence] = useState<'daily' | 'weekly' | 'one_time'>('daily');
  const [taskChildId, setTaskChildId] = useState(children[0]?.id || '');

  const [showAddReward, setShowAddReward] = useState(false);
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardCost, setRewardCost] = useState(50);
  const [rewardChildId, setRewardChildId] = useState(children[0]?.id || '');
  const [rewardIcon, setRewardIcon] = useState('Gamepad2');

  const [showNotifications, setShowNotifications] = useState(false);

  const pendingApprovals = completions.filter(c => c.status === 'pending');
  const approvedCompletionsCount = completions.filter(c => c.status === 'approved').length;
  const styles = THEME_PRESETS[theme];

  // Auto-sync selected child IDs in forms when children list updates
  React.useEffect(() => {
    if (children && children.length > 0) {
      if (!taskChildId || !children.some(c => c.id === taskChildId)) {
        setTaskChildId(children[0].id);
      }
      if (!rewardChildId || !children.some(c => c.id === rewardChildId)) {
        setRewardChildId(children[0].id);
      }
    } else {
      setTaskChildId('');
      setRewardChildId('');
    }
  }, [children, taskChildId, rewardChildId]);

  const handleApprove = (id: string) => {
    playSound.success();
    onApproveCompletion(id);
  };

  const handleReject = (id: string) => {
    playSound.click();
    onRejectCompletion(id);
  };

  const handleChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName) return;
    playSound.success();
    onAddChild(newChildName, newChildChar);
    setNewChildName('');
    setShowAddChild(false);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskChildId) return;
    playSound.click();
    onAddTask(taskTitle, taskPoints, taskCategory, taskRecurrence, taskChildId);
    setTaskTitle('');
    setShowAddTask(false);
  };

  const handleRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardTitle || !rewardChildId) return;
    playSound.click();
    onAddReward(rewardTitle, rewardCost, rewardChildId, rewardIcon);
    setRewardTitle('');
    setShowAddReward(false);
  };

  return (
    <div className={`min-h-screen ${theme === 'cosmic_dark' ? 'bg-[#060814] text-slate-100' : 'bg-[#FCFBF9] text-stone-900'} flex flex-col font-sans relative overflow-hidden`} id="parent-dashboard-root">
      
      {/* Sci-fi Grids and Glow backdrops */}
      <div className={`absolute inset-0 ${theme === 'cosmic_dark' ? 'scrolling-grid opacity-5' : 'opacity-[0.02] bg-[radial-gradient(#1c1917_1.5px,transparent_1.5px)] [background-size:24px_24px]'} pointer-events-none`} />
      {theme === 'cosmic_dark' && (
        <>
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] ambient-glow-cyan pointer-events-none" />
          <div className="absolute bottom-12 left-1/4 w-[600px] h-[600px] ambient-glow-purple pointer-events-none" />
        </>
      )}

      {/* Futuristic Header Console */}
      <header className={`${theme === 'cosmic_dark' ? 'bg-[#070919]/90 border-b border-indigo-950/60' : 'bg-white border-b border-stone-200 shadow-sm'} backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${theme === 'cosmic_dark' ? 'from-fuchsia-500 to-purple-600 shadow-fuchsia-500/20' : 'from-amber-400 to-amber-500 border border-stone-900 shadow-sm'} flex items-center justify-center text-xl shadow-lg`}>
            <Settings className={`w-5 h-5 ${theme === 'cosmic_dark' ? 'text-white' : 'text-stone-950'} animate-spin-slow`} />
          </div>
          <div>
            <h1 className={`text-lg font-black font-display tracking-wider ${theme === 'cosmic_dark' ? 'bg-gradient-to-r from-fuchsia-400 to-pink-400' : 'bg-gradient-to-r from-stone-900 to-stone-800'} bg-clip-text text-transparent uppercase`}>
              Parent Mission Control
            </h1>
            <p className={`text-[9px] ${theme === 'cosmic_dark' ? 'text-fuchsia-400' : 'text-stone-500 font-black'} font-mono tracking-widest uppercase`}>{parentEmail}</p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-4">
          
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                playSound.click();
                setShowNotifications(!showNotifications);
              }}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer relative"
              id="notifications-bell-btn"
            >
              <Bell className="w-4.5 h-4.5 text-cyan-400" />
              {pendingApprovals.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-mono font-bold text-white ring-2 ring-slate-950 animate-bounce">
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            {/* Dropdown Notifications popup */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#090c23] border border-cyan-500/40 shadow-2xl overflow-hidden p-4 space-y-3 z-50"
                  id="notifications-box"
                >
                  <div className="flex items-center justify-between border-b border-indigo-950 pb-2">
                    <span className="font-bold text-xs font-mono tracking-wider text-cyan-400 uppercase">INCOMING TELEMETRY</span>
                    <span className="text-[8px] text-slate-500 font-mono">LIVE UPDATE</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {pendingApprovals.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No pending chore approvals. Channels clear!</p>
                    ) : (
                      pendingApprovals.map(appr => {
                        const child = children.find(c => c.id === appr.child_id);
                        const task = tasks.find(t => t.id === appr.task_id);
                        return (
                          <div key={appr.id} className="p-2.5 bg-slate-950 rounded-xl text-xs flex gap-2 border border-indigo-950">
                            <span className="text-lg">📢</span>
                            <div>
                              <p className="text-slate-300 font-bold">{child?.name || 'Child'} finished a chore!</p>
                              <p className="text-cyan-400 font-semibold text-[11px] mt-0.5">{task?.title || 'Unknown Chores'}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Exit Locked Mode */}
          <button
            onClick={() => {
              playSound.click();
              onExitParentMode();
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black px-4.5 py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg font-mono shadow-cyan-500/10"
            id="exit-to-child-view-btn"
          >
            <Lock className="w-4 h-4" /> LOCK TERMINAL (KID VIEW)
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12" id="parent-workspace">
        
        {/* Left Side: Sidebar Selection Panel */}
        <aside className={`lg:col-span-3 ${theme === 'cosmic_dark' ? 'bg-[#070919]/60 border-r border-indigo-950/60' : 'bg-stone-50 border-r border-stone-200'} p-6 space-y-6`}>
          <div className="space-y-1">
            <span className={`text-[10px] font-bold font-mono ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-amber-700'} uppercase tracking-widest`}>ARCADE UTILITY RAILS</span>
            <p className={`text-xs ${theme === 'cosmic_dark' ? 'text-slate-500' : 'text-stone-500'}`}>Configure chore metrics and levels.</p>
          </div>

          <nav className="flex flex-col gap-2" id="parent-sidebar-nav">
            {[
              { id: 'approvals', label: 'QUEST APPROVALS', icon: CheckSquare, badge: pendingApprovals.length, badgeColor: 'bg-rose-500' },
              { id: 'children', label: 'CHILDREN PILOTS', icon: Users, count: children.length },
              { id: 'tasks', label: 'QUEST TEMPLATES', icon: CheckSquare, count: tasks.length },
              { id: 'rewards', label: 'PRIZE DISPENSERS', icon: Trophy, count: rewards.length },
              { id: 'compliance', label: 'COPPA SECURITY', icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { playSound.click(); setActiveTab(tab.id as any); }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected 
                      ? theme === 'cosmic_dark'
                        ? 'bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white shadow-md shadow-pink-500/10' 
                        : 'bg-amber-400 border border-stone-900 text-stone-950 font-black shadow-[0_3px_0_0_#1c1917]'
                      : theme === 'cosmic_dark'
                        ? 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-stone-900'}`} /> {tab.label}
                  </span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`${tab.badgeColor} text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold`}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-mono ${theme === 'cosmic_dark' ? 'text-slate-500' : 'text-stone-500 font-bold'}`}>
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Info Block */}
          <div className={`p-4 rounded-2xl ${styles.cardBg} border ${styles.borderStyle} flex flex-col gap-2`}>
            <h4 className={`text-xs font-bold font-display ${styles.textColor} flex items-center gap-1.5`}>
              <Sparkles className="w-4 h-4 text-amber-400" /> EVOLUTION ENGINE ACTIVE
            </h4>
            <p className={`text-[11px] ${styles.textMuted} leading-relaxed font-sans`}>
              Child points automatically scale companions through 3 stages. Stage 1 is an egg pod, Stage 2 is adolescent form, and Stage 3 unlocks high-flying heroism (150+ pts)!
            </p>
          </div>
        </aside>

        {/* Right Side: Tab View Content */}
        <main className="lg:col-span-9 p-8">
          
          {/* Dynamic Statistic Bento Cells */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={`p-4 rounded-2xl ${styles.cardBg} border ${styles.borderStyle} flex items-center gap-4`}>
              <div className={`p-3 rounded-xl ${theme === 'cosmic_dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className={`block text-[8px] font-mono ${styles.textMuted} uppercase font-extrabold`}>VERIFIED QUESTS</span>
                <span className={`text-xl font-black ${styles.titleColor} font-mono`}>{approvedCompletionsCount} COMPLETED</span>
              </div>
            </div>
            <div className={`p-4 rounded-2xl ${styles.cardBg} border ${styles.borderStyle} flex items-center gap-4`}>
              <div className={`p-3 rounded-xl ${theme === 'cosmic_dark' ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className={`block text-[8px] font-mono ${styles.textMuted} uppercase font-extrabold">`}>ACTIVE PILOTS</span>
                <span className={`text-xl font-black ${styles.titleColor} font-mono`}>{children.length} ACTIVE</span>
              </div>
            </div>
            <div className={`p-4 rounded-2xl ${styles.cardBg} border ${styles.borderStyle} flex items-center gap-4`}>
              <div className={`p-3 rounded-xl ${theme === 'cosmic_dark' ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                <ShieldAlert className="w-5 h-5 animate-bounce-slow" />
              </div>
              <div>
                <span className={`block text-[8px] font-mono ${styles.textMuted} uppercase font-extrabold`}>AWAITING REVIEW</span>
                <span className={`text-xl font-black ${theme === 'cosmic_dark' ? 'text-rose-400' : 'text-rose-600'} font-mono`}>{pendingApprovals.length} PENDING</span>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* 1. Approvals Tab */}
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
                    <h2 className={`text-2xl font-black font-display ${styles.titleColor}`}>QUEST APPROVALS QUEUE</h2>
                    <p className={`text-xs ${styles.textMuted}`}>Authorize finished duties to dispense gold points instantly.</p>
                  </div>
                  <span className={`px-3 py-1 ${theme === 'cosmic_dark' ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' : 'bg-rose-50 border border-rose-200 text-rose-700'} rounded-full text-xs font-bold font-mono`}>
                    {pendingApprovals.length} STANDBY
                  </span>
                </div>

                {pendingApprovals.length === 0 ? (
                  <div className={`p-12 text-center rounded-3xl ${styles.cardBg} border ${styles.borderStyle} space-y-4`}>
                    <span className="text-5xl inline-block animate-bounce-slow">🚀</span>
                    <h3 className={`text-lg font-black ${styles.titleColor} uppercase tracking-wide font-display`}>ALL CHANNELS CLEAR</h3>
                    <p className={`text-xs ${styles.textMuted} max-w-sm mx-auto leading-relaxed`}>
                      Whenever kids execute "Claim Complete" on their dashboard, their chores will cascade here for parent authorization.
                    </p>
                  </div>
                ) : (
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
                              className={`w-14 h-14 rounded-2xl p-1 border ${theme === 'cosmic_dark' ? 'bg-slate-950 border-cyan-500/30' : 'bg-stone-100 border-stone-200'}`}
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`font-extrabold text-sm ${styles.textColor}`}>{child?.name}</span>
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${theme === 'cosmic_dark' ? 'bg-slate-950 text-cyan-400 border border-cyan-900/30' : 'bg-amber-50 text-amber-700 border border-amber-200'} font-bold uppercase`}>
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

                          <div className={`flex items-center justify-between border-t ${theme === 'cosmic_dark' ? 'border-indigo-950/60' : 'border-stone-150'} pt-4 mt-2`}>
                            <div className={`flex items-center gap-1.5 ${theme === 'cosmic_dark' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'} px-3 py-1.5 rounded-xl`}>
                              <span className={`font-mono font-black text-xs ${theme === 'cosmic_dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>+{task?.points} XP</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReject(appr.id)}
                                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1 border ${theme === 'cosmic_dark' ? 'bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border-indigo-950' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'}`}
                              >
                                <X className="w-4 h-4" /> REJECT
                              </button>
                              <button
                                onClick={() => handleApprove(appr.id)}
                                className={`px-4 py-2 ${theme === 'cosmic_dark' ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-400 border border-stone-900 text-stone-950 shadow-[0_2.5px_0_0_#1c1917] hover:translate-y-0.5 active:shadow-[0_0.5px_0_0_#1c1917]'} rounded-xl text-xs font-mono font-black cursor-pointer transition-all flex items-center gap-1 shadow-md`}
                              >
                                <Check className="w-4 h-4 stroke-[3px]" /> AUTHORIZE
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. Children Profiles Tab */}
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
                    <h2 className={`text-2xl font-black font-display ${styles.titleColor}`}>CHILDREN PILOTS REGISTER</h2>
                    <p className={`text-xs ${styles.textMuted}`}>Initialize new operators and monitor active companion level caps.</p>
                  </div>
                  <button
                    onClick={() => { playSound.click(); setShowAddChild(true); }}
                    className={`${theme === 'cosmic_dark' ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white' : 'bg-stone-900 hover:bg-stone-800 text-white shadow-[0_3px_0_0_#1c1917]'} font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all font-mono`}
                    id="add-child-btn-top"
                  >
                    <UserPlus className="w-4 h-4" /> REGISTER NEW PILOT
                  </button>
                </div>

                {/* Add Child Overlay Form */}
                {showAddChild && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl ${styles.cardBg} border ${theme === 'cosmic_dark' ? 'border-cyan-400' : 'border-stone-900'} shadow-2xl space-y-4`}
                    id="add-child-box"
                  >
                    <h3 className={`font-bold text-lg ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-stone-900'} font-display uppercase tracking-wide`}>👶 Register Family Child</h3>
                    <form onSubmit={handleChildSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Pilot Name</label>
                          <input
                            type="text"
                            value={newChildName}
                            onChange={(e) => setNewChildName(e.target.value)}
                            placeholder="Leo, Lily, Emma..."
                            className={`w-full px-3 py-2 ${theme === 'cosmic_dark' ? 'bg-slate-950 border border-indigo-950 text-slate-200 placeholder-slate-700' : 'bg-white border border-stone-200 text-stone-900 placeholder-stone-400'} rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Companion Egg Species</label>
                          <select
                            value={newChildChar}
                            onChange={(e) => setNewChildChar(e.target.value)}
                            className={`w-full px-3 py-2 ${theme === 'cosmic_dark' ? 'bg-slate-950 border border-indigo-950 text-slate-200' : 'bg-white border border-stone-200 text-stone-900'} rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                          >
                            {CHARACTER_PACKS.map(char => (
                              <option key={char.id} value={char.id}>
                                {char.name} ({char.pack_name})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className={`flex-1 ${theme === 'cosmic_dark' ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-amber-400 hover:bg-amber-300 border border-stone-900 shadow-[0_3px_0_0_#1c1917] text-stone-950'} py-2.5 rounded-xl text-xs font-black cursor-pointer font-mono uppercase tracking-wider`}
                        >
                          SPAWN PILOT & HATCH EGG
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddChild(false)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-mono border ${theme === 'cosmic_dark' ? 'bg-slate-950 border-indigo-950 text-slate-400' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Kids Grid list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {children.map((child) => {
                    const stage = getCharacterStage(child.character_id, child.points);
                    const pack = CHARACTER_PACKS.find(cp => cp.id === child.character_id);
                    return (
                      <div
                        key={child.id}
                        className={`p-5 rounded-3xl ${styles.cardBg} border ${styles.borderStyle} flex flex-col gap-4 relative overflow-hidden`}
                      >
                        <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${stage.color_theme}`} />

                        <div className="flex gap-4 items-center">
                          <img
                            src={child.avatar_url}
                            alt="Child avatar"
                            className={`w-16 h-16 rounded-2xl p-1 border object-cover ${theme === 'cosmic_dark' ? 'bg-slate-950 border-indigo-950/60' : 'bg-stone-100 border-stone-200'}`}
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h3 className={`font-extrabold text-lg ${styles.titleColor} font-display`}>{child.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-xs ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-stone-900'} font-mono font-bold`}>LVL {child.level}</span>
                              <span className="text-[10px] text-slate-500 font-mono">•</span>
                              <span className="text-xs text-orange-500 font-mono font-bold">🔥 {child.streak_days} DAYS</span>
                            </div>
                          </div>
                        </div>

                        {/* Character Info */}
                        <div className={`p-3 rounded-2xl border flex items-center justify-between ${theme === 'cosmic_dark' ? 'bg-slate-950/80 border-indigo-950/50' : 'bg-stone-50 border-stone-200'}`}>
                          <div>
                            <p className={`text-[8px] ${styles.textMuted} font-mono font-bold uppercase tracking-wider`}>Species Pack</p>
                            <p className={`text-xs font-extrabold ${styles.textColor} mt-0.5`}>{pack?.name.split(' the ')[0] || 'Unknown'}</p>
                            <p className={`text-[10px] font-mono ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-amber-700'} mt-0.5`}>Stage {stage.stage_number}: {stage.name}</p>
                          </div>
                          <span className="text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{stage.emoji}</span>
                        </div>

                        {/* Score stats */}
                        <div className="space-y-2">
                          <div className={`flex justify-between text-xs ${styles.textMuted} font-mono`}>
                            <span>TOTAL GOLD BANK</span>
                            <span className={`font-extrabold ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-amber-700'}`}>{child.points} GOLD</span>
                          </div>
                          <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${theme === 'cosmic_dark' ? 'bg-slate-950 border-indigo-950' : 'bg-stone-100 border-stone-200'}`}>
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${stage.color_theme}`}
                              style={{ width: `${Math.min(100, child.xp_in_level)}%` }}
                            />
                          </div>
                          <p className={`text-[8px] font-mono ${styles.textMuted} text-right`}>XP PROGRESSION: {child.xp_in_level}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 3. Chores & Habits Tab */}
            {activeTab === 'tasks' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                key="tasks-tab"
                className="space-y-6"
                id="tasks-view"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className={`text-2xl font-black font-display ${styles.titleColor}`}>QUEST TEMPLATE DIRECTORY</h2>
                    <p className={`text-xs ${styles.textMuted}`}>Configure chore metrics, behaviors, and point allocations.</p>
                  </div>
                  <button
                    onClick={() => { playSound.click(); setShowAddTask(true); }}
                    className={`${theme === 'cosmic_dark' ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white' : 'bg-stone-900 hover:bg-stone-800 text-white shadow-[0_3px_0_0_#1c1917]'} font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all font-mono`}
                    id="add-chore-btn-top"
                  >
                    <Plus className="w-4 h-4" /> CREATE TEMPLATE
                  </button>
                </div>

                {/* Add Custom Chore Overlay */}
                {showAddTask && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl ${styles.cardBg} border ${theme === 'cosmic_dark' ? 'border-cyan-400' : 'border-stone-900'} shadow-2xl space-y-4`}
                    id="add-task-box"
                  >
                    <h3 className={`font-bold text-lg ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-stone-900'} font-display uppercase tracking-wide`}>🧹 Create Quest Blueprint</h3>
                    <form onSubmit={handleTaskSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Quest Name</label>
                          <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="Clean your room, finish math workbook, brush teeth..."
                            className={`w-full px-3 py-2 ${theme === 'cosmic_dark' ? 'bg-slate-950 border border-indigo-950 text-slate-200 placeholder-slate-700' : 'bg-white border border-stone-200 text-stone-900'} rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Gold Reward</label>
                          <input
                            type="number"
                            value={taskPoints}
                            onChange={(e) => setTaskPoints(Number(e.target.value))}
                            className={`w-full px-3 py-2 ${theme === 'cosmic_dark' ? 'bg-slate-950 border border-indigo-950 text-slate-200' : 'bg-white border border-stone-200 text-stone-900'} rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            min="5"
                            max="100"
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Target Pilot</label>
                          <select
                            value={taskChildId}
                            onChange={(e) => setTaskChildId(e.target.value)}
                            className={`w-full px-3 py-2 ${theme === 'cosmic_dark' ? 'bg-slate-950 border border-indigo-950 text-slate-200' : 'bg-white border border-stone-200 text-stone-900'} rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                          >
                            {children.map(child => (
                              <option key={child.id} value={child.id}>{child.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Recurrence Cycle</label>
                          <select
                            value={taskRecurrence}
                            onChange={(e) => setTaskRecurrence(e.target.value as any)}
                            className={`w-full px-3 py-2 ${theme === 'cosmic_dark' ? 'bg-slate-950 border border-indigo-950 text-slate-200' : 'bg-white border border-stone-200 text-stone-900'} rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                          >
                            <option value="daily">Daily Habit</option>
                            <option value="weekly">Weekly Chore</option>
                            <option value="one_time">One-off Mission</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className={`flex-1 ${theme === 'cosmic_dark' ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-amber-400 hover:bg-amber-300 border border-stone-900 shadow-[0_3px_0_0_#1c1917] text-stone-950'} py-2.5 rounded-xl text-xs font-black cursor-pointer font-mono uppercase`}
                        >
                          ACTIVATE BLUEPRINT
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddTask(false)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-mono border ${theme === 'cosmic_dark' ? 'bg-slate-950 border-indigo-950 text-slate-400' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Tasks List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.map((task) => {
                    const assignedChild = children.find(c => c.id === task.child_id);
                    return (
                      <div
                        key={task.id}
                        className={`border p-5 rounded-3xl flex justify-between items-center ${styles.cardBg} ${styles.borderStyle}`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${theme === 'cosmic_dark' ? 'bg-slate-950 text-cyan-400 border border-indigo-950' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                              {task.category.toUpperCase()}
                            </span>
                            <span className={`text-[9px] font-mono ${styles.textMuted} font-bold uppercase`}>
                              {task.recurrence}
                            </span>
                          </div>
                          <h3 className={`font-extrabold ${styles.titleColor} text-base mt-2 font-display`}>{task.title}</h3>
                          <p className={`text-xs ${styles.textMuted} mt-1`}>
                            Pilot assigned: <strong className={`font-bold ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-amber-700'}`}>{assignedChild?.name || 'All Pilots'}</strong>
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <span className={`font-mono font-black text-sm ${theme === 'cosmic_dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            +{task.points} GOLD
                          </span>
                          <button
                            onClick={() => {
                              playSound.click();
                              onDeleteTask(task.id);
                            }}
                            className={`p-2 rounded-xl transition-all cursor-pointer border ${theme === 'cosmic_dark' ? 'bg-slate-950 border-indigo-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'}`}
                            id={`delete-task-${task.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black font-display text-white">PRIZE DISPENSER CONTROL</h2>
                    <p className="text-xs text-slate-400">Configure tangible awards and point exchange costs.</p>
                  </div>
                  <button
                    onClick={() => { playSound.click(); setShowAddReward(true); }}
                    className={`${theme === 'cosmic_dark' ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white' : 'bg-stone-900 hover:bg-stone-800 text-white shadow-[0_3px_0_0_#1c1917]'} font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all font-mono`}
                    id="add-reward-btn-top"
                  >
                    <Plus className="w-4 h-4" /> ADD REWARD SLOT
                  </button>
                </div>

                {/* Add Custom Reward Overlay */}
                {showAddReward && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl ${styles.cardBg} border ${theme === 'cosmic_dark' ? 'border-cyan-400' : 'border-stone-900'} shadow-2xl space-y-4`}
                    id="add-reward-box"
                  >
                    <h3 className={`font-bold text-lg ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-stone-900'} font-display uppercase tracking-wide`}>🎁 Define Reward Token</h3>
                    <form onSubmit={handleRewardSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Prize Name</label>
                          <input
                            type="text"
                            value={rewardTitle}
                            onChange={(e) => setRewardTitle(e.target.value)}
                            placeholder="iPad time, ice cream, toy..."
                            className={`w-full px-3 py-2 ${theme === 'cosmic_dark' ? 'bg-slate-950 border border-indigo-950 text-slate-200 placeholder-slate-700' : 'bg-white border border-stone-200 text-stone-900'} rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Point Cost</label>
                          <input
                            type="number"
                            value={rewardCost}
                            onChange={(e) => setRewardCost(Number(e.target.value))}
                            className={`w-full px-3 py-2 ${theme === 'cosmic_dark' ? 'bg-slate-950 border border-indigo-950 text-slate-200' : 'bg-white border border-stone-200 text-stone-900'} rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                            min="10"
                            max="500"
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Target Child</label>
                          <select
                            value={rewardChildId}
                            onChange={(e) => setRewardChildId(e.target.value)}
                            className={`w-full px-3 py-2 ${theme === 'cosmic_dark' ? 'bg-slate-950 border border-indigo-950 text-slate-200' : 'bg-white border border-stone-200 text-stone-900'} rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                          >
                            {children.map(child => (
                              <option key={child.id} value={child.id}>{child.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold font-mono ${styles.textMuted} uppercase tracking-widest mb-1`}>Select Theme Icon</label>
                          <select
                            value={rewardIcon}
                            onChange={(e) => setRewardIcon(e.target.value)}
                            className={`w-full px-3 py-2 ${theme === 'cosmic_dark' ? 'bg-slate-950 border border-indigo-950 text-slate-200' : 'bg-white border border-stone-200 text-stone-900'} rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-mono`}
                          >
                            <option value="Gamepad2">🎮 Game Time</option>
                            <option value="Pizza">🍕 Favorite Meal</option>
                            <option value="Palette">🎨 Creative / Art</option>
                            <option value="BookOpen">📖 Storybooks</option>
                            <option value="Sparkles">✨ Special Trip</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className={`flex-1 ${theme === 'cosmic_dark' ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-amber-400 hover:bg-amber-300 border border-stone-900 shadow-[0_3px_0_0_#1c1917] text-stone-950'} py-2.5 rounded-xl text-xs font-black cursor-pointer font-mono uppercase`}
                        >
                          INITIALIZE PRIZE REDEMPTION
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddReward(false)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-mono border ${theme === 'cosmic_dark' ? 'bg-slate-950 border-indigo-950 text-slate-400' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Rewards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewards.map((rew) => {
                    const child = children.find(c => c.id === rew.child_id);
                    return (
                      <div
                        key={rew.id}
                        className={`border p-5 rounded-3xl flex justify-between items-center ${styles.cardBg} ${styles.borderStyle}`}
                      >
                        <div className="flex gap-3.5 items-center">
                          <span className={`text-3xl ${theme === 'cosmic_dark' ? 'bg-slate-950' : 'bg-stone-100 border border-stone-200'} p-2.5 rounded-2xl`}>🎁</span>
                          <div>
                            <h3 className={`font-extrabold ${styles.titleColor} text-base font-display`}>{rew.title}</h3>
                            <p className={`text-xs ${styles.textMuted} mt-1`}>
                              Available for: <strong className={`font-bold ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-amber-700'}`}>{child?.name}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <span className={`font-mono font-black text-sm ${theme === 'cosmic_dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                            ⭐ {rew.cost_points} PTS
                          </span>
                          <button
                            onClick={() => {
                              playSound.click();
                              onDeleteReward(rew.id);
                            }}
                            className={`p-2 rounded-xl transition-all cursor-pointer border ${theme === 'cosmic_dark' ? 'bg-slate-950 border-indigo-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'}`}
                            id={`delete-reward-${rew.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                  <div className={`flex items-center gap-2 ${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-stone-900'} font-bold text-sm font-display`}>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Children's Online Privacy Protection Rule (COPPA)
                  </div>
                  <p>
                    Reward Chart is strictly dedicated to ensuring top-tier safety. We do not transmit child behavioral, performance, or identify data to third-party advertizers or cloud syndications. All child names and custom profiles can be held in local browser state sandbox blocks, bypassing general tracking networks.
                  </p>
                  <p>
                    As parents, you hold total sovereignty. You can delete individual child profiles, rewrite task records, or disable cloud synchronization options instantly from these dashboards.
                  </p>
                  <p>
                    For inquiries regarding family data rights or physical regulatory safety logs, please contact markdias1984@gmail.com.
                  </p>
                  
                  <div className={`p-4 rounded-2xl border space-y-2 ${theme === 'cosmic_dark' ? 'bg-slate-950/80 border-indigo-950/50' : 'bg-stone-50 border-stone-200'}`}>
                    <h4 className={`${theme === 'cosmic_dark' ? 'text-cyan-400' : 'text-amber-700'} font-bold text-xs flex items-center gap-1.5 font-display`}>
                      <Info className="w-4 h-4" /> SECURE CONSOLE SECURITY
                    </h4>
                    <p className={`text-[11px] ${styles.textMuted} leading-normal`}>
                      We ensure kids do not bypass their scoring thresholds by gating parent layouts behind a 4-digit passcode lock. Always keep your parent security PIN confidential!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
