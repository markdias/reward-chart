import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AuthPage from './components/AuthPage';
import ParentDashboard from './components/ParentDashboard';
import ChildDashboard from './components/ChildDashboard';
import LockScreen from './components/LockScreen';
import Confetti from './components/Confetti';
import { 
  INITIAL_CHILDREN, INITIAL_TASKS, 
  INITIAL_COMPLETIONS, INITIAL_REWARDS, INITIAL_REDEMPTIONS 
} from './data/mockData';
import { Child, Task, TaskCompletion, Reward, RewardRedemption } from './types';
import { playSound } from './utils/sound';
import { ThemeId, THEME_PRESETS } from './utils/theme';
import { getNextWeeklyResetDate, getNextMonthlyResetDate } from './utils/date';
import ThemeSelector from './components/ThemeSelector';
import { getSupabaseClient, getCurrentUserEmail, signOut } from './utils/supabase';
import { getCurrentWeekKey, getCurrentMonthKey } from './utils/date';

export default function App() {
  // Active theme style system (default to beautiful Sunny Toybox light)
  const [activeTheme, setActiveTheme] = useState<ThemeId>(
    (localStorage.getItem('RCH_THEME') as ThemeId) || 'sunny_toybox'
  );

  const handleThemeChange = (themeId: ThemeId) => {
    setActiveTheme(themeId);
    localStorage.setItem('RCH_THEME', themeId);
  };

  // Auth state
  const [parentEmail, setParentEmail] = useState<string | null>(
    localStorage.getItem('RCH_PARENT_EMAIL')
  );
  const [isParentMode, setIsParentMode] = useState<boolean>(
    localStorage.getItem('RCH_PARENT_MODE') === 'true'
  );
  
  // Security PIN state (default is 1234)
  const [parentPin, setParentPin] = useState<string>(
    localStorage.getItem('RCH_PARENT_PIN') || '1234'
  );

  // Core records lists
  const [children, setChildren] = useState<Child[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);

  // UI state overlays
  const [showLockScreen, setShowLockScreen] = useState<boolean>(false);
  const [celebrationActive, setCelebrationActive] = useState<boolean>(false);

  // Helper fallback to load local storage state or blank state
  const loadLocalStorageFallback = (isDemo: boolean) => {
    const keyChildren = parentEmail ? `RCH_CHILDREN_${parentEmail}` : 'RCH_CHILDREN';
    const keyTasks = parentEmail ? `RCH_TASKS_${parentEmail}` : 'RCH_TASKS';
    const keyCompletions = parentEmail ? `RCH_COMPLETIONS_${parentEmail}` : 'RCH_COMPLETIONS';
    const keyRewards = parentEmail ? `RCH_REWARDS_${parentEmail}` : 'RCH_REWARDS';
    const keyRedemptions = parentEmail ? `RCH_REDEMPTIONS_${parentEmail}` : 'RCH_REDEMPTIONS';

    const savedChildren = localStorage.getItem(keyChildren);
    const savedTasks = localStorage.getItem(keyTasks);
    const savedCompletions = localStorage.getItem(keyCompletions);
    const savedRewards = localStorage.getItem(keyRewards);
    const savedRedemptions = localStorage.getItem(keyRedemptions);

    if (savedChildren) {
      setChildren(JSON.parse(savedChildren));
    } else {
      const initial = isDemo ? INITIAL_CHILDREN : [];
      setChildren(initial);
      localStorage.setItem(keyChildren, JSON.stringify(initial));
    }

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const initial = isDemo ? INITIAL_TASKS : [];
      setTasks(initial);
      localStorage.setItem(keyTasks, JSON.stringify(initial));
    }

    if (savedCompletions) {
      setCompletions(JSON.parse(savedCompletions));
    } else {
      const initial = isDemo ? INITIAL_COMPLETIONS : [];
      setCompletions(initial);
      localStorage.setItem(keyCompletions, JSON.stringify(initial));
    }

    if (savedRewards) {
      setRewards(JSON.parse(savedRewards));
    } else {
      const initial = isDemo ? INITIAL_REWARDS : [];
      setRewards(initial);
      localStorage.setItem(keyRewards, JSON.stringify(initial));
    }

    if (savedRedemptions) {
      setRedemptions(JSON.parse(savedRedemptions));
    } else {
      const initial = isDemo ? INITIAL_REDEMPTIONS : [];
      setRedemptions(initial);
      localStorage.setItem(keyRedemptions, JSON.stringify(initial));
    }
  };

  // Load records on start/auth change from localStorage or Supabase
  useEffect(() => {
    if (!parentEmail) {
      return;
    }

    const isDemo = parentEmail === 'demo_parent@rewardchart.app';
    const supabase = getSupabaseClient();

    if (supabase && !isDemo) {
      // Real Supabase backend - fetch live DB rows
      const fetchSupabaseData = async () => {
        try {
          const keyChildren = `RCH_CHILDREN_${parentEmail}`;
          const keyTasks = `RCH_TASKS_${parentEmail}`;
          const keyCompletions = `RCH_COMPLETIONS_${parentEmail}`;
          const keyRewards = `RCH_REWARDS_${parentEmail}`;

          // Fetch children
          const { data: dbChildren, error: errChildren } = await supabase
            .from('children')
            .select('*')
            .eq('parent_id', parentEmail);
          
          if (!errChildren) {
            setChildren(dbChildren || []);
            localStorage.setItem(keyChildren, JSON.stringify(dbChildren || []));
          } else {
            console.warn('Could not load children from Supabase, using localStorage:', errChildren.message);
            loadLocalStorageFallback(isDemo);
            return;
          }

          // Fetch tasks
          const { data: dbTasks, error: errTasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('parent_id', parentEmail);
          
          if (!errTasks) {
            setTasks(dbTasks || []);
            localStorage.setItem(keyTasks, JSON.stringify(dbTasks || []));
          }

          // Fetch completions (filtered client-side if needed, or select all)
          const { data: dbCompletions, error: errCompletions } = await supabase
            .from('completions')
            .select('*');
          
          if (!errCompletions) {
            const childIds = (dbChildren || []).map(c => c.id);
            const filteredCompletions = (dbCompletions || []).filter(c => childIds.includes(c.child_id));
            setCompletions(filteredCompletions || []);
            localStorage.setItem(keyCompletions, JSON.stringify(filteredCompletions || []));
          }

          // Fetch rewards
          const { data: dbRewards, error: errRewards } = await supabase
            .from('rewards')
            .select('*')
            .eq('parent_id', parentEmail);
          
          if (!errRewards) {
            setRewards(dbRewards || []);
            localStorage.setItem(keyRewards, JSON.stringify(dbRewards || []));
          }

          // Fetch redemptions
          const keyRedemptions = `RCH_REDEMPTIONS_${parentEmail}`;
          const { data: dbRedemptions, error: errRedemptions } = await supabase
            .from('reward_redemptions')
            .select('*')
            .eq('parent_id', parentEmail);
            
          if (!errRedemptions) {
            setRedemptions(dbRedemptions || []);
            localStorage.setItem(keyRedemptions, JSON.stringify(dbRedemptions || []));
          }

        } catch (err) {
          console.warn('Error loading Supabase data:', err);
          loadLocalStorageFallback(isDemo);
        }
      };

      fetchSupabaseData();

      // Subscribe to Realtime changes across all public tables
      const channel = supabase.channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            console.log('Realtime event received! Refreshing data in 500ms...', payload);
            setTimeout(() => {
              fetchSupabaseData();
            }, 500);
          }
        )
        .subscribe();

      // Cleanup subscription on unmount or parentEmail change
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Local/demo mode - fetch from localStorage or defaults
      loadLocalStorageFallback(isDemo);
    }
  }, [parentEmail]);

  // Sync state helpers to update local storage
  const syncChildren = (newList: Child[]) => {
    setChildren(newList);
    const key = parentEmail ? `RCH_CHILDREN_${parentEmail}` : 'RCH_CHILDREN';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncTasks = (newList: Task[]) => {
    setTasks(newList);
    const key = parentEmail ? `RCH_TASKS_${parentEmail}` : 'RCH_TASKS';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncCompletions = (newList: TaskCompletion[]) => {
    setCompletions(newList);
    const key = parentEmail ? `RCH_COMPLETIONS_${parentEmail}` : 'RCH_COMPLETIONS';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncRewards = (newList: Reward[]) => {
    setRewards(newList);
    const key = parentEmail ? `RCH_REWARDS_${parentEmail}` : 'RCH_REWARDS';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncRedemptions = (newList: RewardRedemption[]) => {
    setRedemptions(newList);
    const key = parentEmail ? `RCH_REDEMPTIONS_${parentEmail}` : 'RCH_REDEMPTIONS';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  // Supabase update helper
  const updateChildInSupabase = async (updatedChild: Child) => {
    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase
        .from('children')
        .update({
          points: updatedChild.points,
          level: updatedChild.level,
          xp_in_level: updatedChild.xp_in_level,
          streak_days: updatedChild.streak_days,
          last_active_date: updatedChild.last_active_date,
          level_up_gold_reward: updatedChild.level_up_gold_reward,
          level_up_bonuses_received: updatedChild.level_up_bonuses_received,
          weekly_xp_target: updatedChild.weekly_xp_target,
          weekly_reward_points: updatedChild.weekly_reward_points,
          monthly_xp_target: updatedChild.monthly_xp_target,
          monthly_reward_points: updatedChild.monthly_reward_points,
          weekly_xp: updatedChild.weekly_xp,
          monthly_xp: updatedChild.monthly_xp,
          last_active_week: updatedChild.last_active_week,
          last_active_month: updatedChild.last_active_month,
          weekly_reset_date: updatedChild.weekly_reset_date,
          monthly_reset_date: updatedChild.monthly_reset_date,
          last_weekly_bonus_awarded: updatedChild.last_weekly_bonus_awarded,
          last_monthly_bonus_awarded: updatedChild.last_monthly_bonus_awarded
        })
        .eq('id', updatedChild.id);
      if (error) console.warn('Failed to sync child update to Supabase:', error.message);
    }
  };

  // Auth Handlers
  const handleStartDemo = () => {
    // Clear old localStorage to ensure fresh demo mode load
    localStorage.removeItem('RCH_CHILDREN');
    localStorage.removeItem('RCH_TASKS');
    localStorage.removeItem('RCH_COMPLETIONS');
    localStorage.removeItem('RCH_REWARDS');
    
    // Clear specific demo keys to reset state on clicking Start Demo
    localStorage.removeItem('RCH_CHILDREN_demo_parent@rewardchart.app');
    localStorage.removeItem('RCH_TASKS_demo_parent@rewardchart.app');
    localStorage.removeItem('RCH_COMPLETIONS_demo_parent@rewardchart.app');
    localStorage.removeItem('RCH_REWARDS_demo_parent@rewardchart.app');
    localStorage.removeItem('RCH_REDEMPTIONS_demo_parent@rewardchart.app');
    
    setParentEmail('demo_parent@rewardchart.app');
    localStorage.setItem('RCH_PARENT_EMAIL', 'demo_parent@rewardchart.app');
    setIsParentMode(false); // Kids view by default, let them select child
    localStorage.setItem('RCH_PARENT_MODE', 'false');
    setParentPin('1234');
    localStorage.setItem('RCH_PARENT_PIN', '1234');
  };

  const handleLoginReal = (email: string) => {
    // Clear old state to prepare fresh real/blank dashboard loads
    localStorage.removeItem('RCH_CHILDREN');
    localStorage.removeItem('RCH_TASKS');
    localStorage.removeItem('RCH_COMPLETIONS');
    localStorage.removeItem('RCH_REWARDS');

    setParentEmail(email);
    localStorage.setItem('RCH_PARENT_EMAIL', email);
    setIsParentMode(false); // Default to Child scoreboard, parent enters PIN to manage
    localStorage.setItem('RCH_PARENT_MODE', 'false');
  };

  const handleLogout = async () => {
    playSound.click();
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setParentEmail(null);
    setIsParentMode(false);
    localStorage.removeItem('RCH_PARENT_EMAIL');
    localStorage.removeItem('RCH_PARENT_MODE');
    localStorage.removeItem('RCH_CHILDREN');
    localStorage.removeItem('RCH_TASKS');
    localStorage.removeItem('RCH_COMPLETIONS');
    localStorage.removeItem('RCH_REWARDS');
    localStorage.removeItem('RCH_REDEMPTIONS');
    window.location.reload();
  };

  // Parent Gating
  const handleEnterParentModeRequest = () => {
    setShowLockScreen(true);
  };

  const handleParentLockSuccess = () => {
    setShowLockScreen(false);
    setIsParentMode(true);
    localStorage.setItem('RCH_PARENT_MODE', 'true');
  };

  const handleExitParentMode = () => {
    setIsParentMode(false);
    localStorage.setItem('RCH_PARENT_MODE', 'false');
  };

  // Operations: Children
  const handleAddChild = async (name: string, characterId: string) => {
    const newChild: Child = {
      id: `child_${Date.now()}`,
      parent_id: parentEmail || 'parent_demo',
      name,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      character_id: characterId,
      points: 0,
      level: 1,
      xp_in_level: 0,
      streak_days: 0,
      created_at: new Date().toISOString()
    };
    syncChildren([...children, newChild]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('children').insert(newChild);
      if (error) console.warn('Failed to sync new child to Supabase:', error.message);
    }
  };

  const handleEditChild = async (id: string, updates: Partial<Child>) => {
    let updatedChild: Child | null = null;
    const updatedChildren = children.map(c => {
      if (c.id === id) {
        updatedChild = { ...c, ...updates };
        // Update avatar if name changes
        if (updates.name) {
          updatedChild.avatar_url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(updates.name)}`;
        }
        return updatedChild;
      }
      return c;
    });
    syncChildren(updatedChildren);

    const supabase = getSupabaseClient();
    if (supabase && updatedChild && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('children').update(updatedChild).eq('id', id);
      if (error) console.warn('Failed to update child in Supabase:', error.message);
    }
  };
  const processXpGains = (child: Child, addedXp: number): Child => {
    let newLevel = child.level || 1;
    let newXp = (child.xp_in_level || 0) + addedXp;
    let newPoints = child.points;
    let bonusesReceived = child.level_up_bonuses_received || 0;

    // 1. Level up check
    while (newXp >= 100) {
      newLevel++;
      newXp -= 100;
      
      const levelUpBonus = child.level_up_gold_reward ?? 500;
      newPoints += levelUpBonus;
      bonusesReceived++;
      
      setTimeout(() => playSound.levelUp(), 300);
    }

    // 2. Weekly / Monthly Tracking (Explicit Reset Logging)
    const now = new Date();

    let weeklyXp = child.weekly_xp || 0;
    let nextWeeklyReset = child.weekly_reset_date ? new Date(child.weekly_reset_date) : null;
    
    if (!nextWeeklyReset || now >= nextWeeklyReset) {
      weeklyXp = 0; // The week rolled over!
      nextWeeklyReset = getNextWeeklyResetDate(now);
    }
    weeklyXp += addedXp;

    let monthlyXp = child.monthly_xp || 0;
    let nextMonthlyReset = child.monthly_reset_date ? new Date(child.monthly_reset_date) : null;
    
    if (!nextMonthlyReset || now >= nextMonthlyReset) {
      monthlyXp = 0; // The month rolled over!
      nextMonthlyReset = getNextMonthlyResetDate(now);
    }
    monthlyXp += addedXp;

    // Check Weekly Goal
    const weeklyTarget = child.weekly_xp_target || 300;
    const weeklyReward = child.weekly_reward_points || 200;
    let lastWeeklyBonus = child.last_weekly_bonus_awarded;

    // The bonus key is the ISO string of the reset date, to uniquely identify the week cycle!
    const currentWeekCycleId = nextWeeklyReset.toISOString();
    if (weeklyXp >= weeklyTarget && lastWeeklyBonus !== currentWeekCycleId) {
      newPoints += weeklyReward;
      lastWeeklyBonus = currentWeekCycleId;
      setTimeout(() => playSound.purchase(), 500);
    }

    // Check Monthly Goal
    const monthlyTarget = child.monthly_xp_target || 1000;
    const monthlyReward = child.monthly_reward_points || 1000;
    let lastMonthlyBonus = child.last_monthly_bonus_awarded;

    const currentMonthCycleId = nextMonthlyReset.toISOString();
    if (monthlyXp >= monthlyTarget && lastMonthlyBonus !== currentMonthCycleId) {
      newPoints += monthlyReward;
      lastMonthlyBonus = currentMonthCycleId;
      setTimeout(() => playSound.purchase(), 800);
    }

    return {
      ...child,
      level: newLevel,
      xp_in_level: newXp,
      points: newPoints,
      level_up_bonuses_received: bonusesReceived,
      weekly_xp: weeklyXp,
      monthly_xp: monthlyXp,
      weekly_reset_date: nextWeeklyReset.toISOString(),
      monthly_reset_date: nextMonthlyReset.toISOString(),
      last_weekly_bonus_awarded: lastWeeklyBonus,
      last_monthly_bonus_awarded: lastMonthlyBonus
    };
  };


  const handleUpdateChildStats = async (childId: string, updates: Partial<Child>) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;
    
    let targetChild = { ...child };
    
    // If we are manually adding XP, use the processXpGains pipeline to trigger rollovers and bonuses!
    if (updates.xp_in_level !== undefined && updates.xp_in_level > (child.xp_in_level || 0)) {
      const addedXp = updates.xp_in_level - (child.xp_in_level || 0);
      targetChild = processXpGains(targetChild, addedXp);
      delete updates.xp_in_level; // already handled
    }

    // Apply any remaining explicit updates (e.g. manual level, manual points subtraction)
    targetChild = { ...targetChild, ...updates };

    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  // Operations: Tasks
  const handleAddTask = async (
    title: string, 
    points: number,
    xp: number,
    category: any, 
    recurrence: any, 
    cooldownMinutes?: number
  ) => {
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      parent_id: parentEmail || 'parent_demo',
      child_id: 'directory',
      title,
      points,
      xp,
      category,
      recurrence,
      cooldown_minutes: cooldownMinutes,
      is_template: true,
      is_active: true,
      created_at: new Date().toISOString()
    };
    syncTasks([...tasks, newTask]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('tasks').insert(newTask);
      if (error) console.warn('Failed to sync task to Supabase:', error.message);
    }
  };

  const handleAssignTask = async (template: Task, childIds: string[]) => {
    const existingInstances = tasks.filter(t => t.template_id === template.id);
    const instancesToDelete = existingInstances.filter(t => !childIds.includes(t.child_id));
    const existingChildIds = existingInstances.map(t => t.child_id);
    const childrenToAdd = childIds.filter(id => !existingChildIds.includes(id));

    const newTasks: Task[] = childrenToAdd.map(childId => ({
      ...template,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      child_id: childId,
      is_template: false,
      template_id: template.id,
      created_at: new Date().toISOString()
    }));

    const nextTasks = tasks.filter(t => !instancesToDelete.find(del => del.id === t.id));
    syncTasks([...nextTasks, ...newTasks]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      if (instancesToDelete.length > 0) {
        await supabase.from('tasks').delete().in('id', instancesToDelete.map(t => t.id));
      }
      if (newTasks.length > 0) {
        await supabase.from('tasks').insert(newTasks);
      }
    }
  };

  const handleEditTask = async (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id || t.template_id === id) {
        return { ...t, ...updates };
      }
      return t;
    });
    syncTasks(updatedTasks);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('tasks').update(updates).or(`id.eq.${id},template_id.eq.${id}`);
      if (error) console.warn('Failed to update task in Supabase:', error.message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    syncTasks(tasks.filter(t => t.id !== id && t.template_id !== id));

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('tasks').delete().or(`id.eq.${id},template_id.eq.${id}`);
      if (error) console.warn('Failed to delete task in Supabase:', error.message);
    }
  };

  // Operations: Rewards
  const handleAddReward = async (
    title: string, 
    cost: number, 
    iconName: string,
    limitType: any
  ) => {
    const newReward: Reward = {
      id: `rew_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      parent_id: parentEmail || 'parent_demo',
      child_id: 'directory',
      title,
      cost_points: cost,
      is_available: true,
      is_template: true,
      icon_name: iconName,
      limit_type: limitType,
      created_at: new Date().toISOString()
    };
    syncRewards([...rewards, newReward]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('rewards').insert(newReward);
      if (error) console.warn('Failed to sync reward to Supabase:', error.message);
    }
  };

  const handleAssignReward = async (template: Reward, childIds: string[]) => {
    const existingInstances = rewards.filter(r => r.template_id === template.id);
    const instancesToDelete = existingInstances.filter(r => !childIds.includes(r.child_id));
    const existingChildIds = existingInstances.map(r => r.child_id);
    const childrenToAdd = childIds.filter(id => !existingChildIds.includes(id));

    const newRewards: Reward[] = childrenToAdd.map(childId => ({
      ...template,
      id: `rew_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      child_id: childId,
      is_template: false,
      template_id: template.id,
      created_at: new Date().toISOString()
    }));

    const nextRewards = rewards.filter(r => !instancesToDelete.find(del => del.id === r.id));
    syncRewards([...nextRewards, ...newRewards]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      if (instancesToDelete.length > 0) {
        await supabase.from('rewards').delete().in('id', instancesToDelete.map(r => r.id));
      }
      if (newRewards.length > 0) {
        await supabase.from('rewards').insert(newRewards);
      }
    }
  };

  const handleEditReward = async (id: string, updates: Partial<Reward>) => {
    const updatedRewards = rewards.map(r => {
      if (r.id === id || r.template_id === id) {
        return { ...r, ...updates };
      }
      return r;
    });
    syncRewards(updatedRewards);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('rewards').update(updates).or(`id.eq.${id},template_id.eq.${id}`);
      if (error) console.warn('Failed to update reward in Supabase:', error.message);
    }
  };

  const handleDeleteReward = async (id: string) => {
    syncRewards(rewards.filter(r => r.id !== id && r.template_id !== id));

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('rewards').delete().or(`id.eq.${id},template_id.eq.${id}`);
      if (error) console.warn('Failed to delete reward in Supabase:', error.message);
    }
  };

  // Operations: Completions
  const handleCompleteTask = async (taskId: string, childId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Create a pending completion
    const newCompletion: TaskCompletion = {
      id: `comp_${Date.now()}`,
      task_id: taskId,
      child_id: childId,
      points_awarded: task.points,
      xp_awarded: task.xp ?? task.points, // default to points if xp isn't set (for old tasks)
      status: 'pending',
      completed_at: new Date().toISOString()
    };
    syncCompletions([...completions, newCompletion]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('completions').insert(newCompletion);
      if (error) console.warn('Failed to sync completion to Supabase:', error.message);
    }
  };

  const handleClaimReward = async (rewardId: string, childId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    const child = children.find(c => c.id === childId);
    if (!reward || !child || child.points < reward.cost_points || !reward.is_available) return;

    // --- Limit Checks ---
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const childRedemptions = redemptions.filter(r => r.child_id === childId && r.reward_id === rewardId);
    
    if (reward.limit_type === 'daily') {
      const todayRedemptions = childRedemptions.filter(r => r.redeemed_at.startsWith(todayStr));
      if (todayRedemptions.length >= 1) return; // Limit reached
    } 
    else if (reward.limit_type === 'twice_daily') {
      const todayRedemptions = childRedemptions.filter(r => r.redeemed_at.startsWith(todayStr));
      if (todayRedemptions.length >= 2) return; // Limit reached
      
      // Wait at least 6 hours between redemptions
      if (todayRedemptions.length === 1) {
        const lastRedeem = new Date(todayRedemptions[0].redeemed_at).getTime();
        const hrsSinceLast = (now.getTime() - lastRedeem) / (1000 * 60 * 60);
        if (hrsSinceLast < 6) return;
      }
    }

    // Wait to deduct points until parent delivers it!
    // Just trigger celebration here for the request.
    setCelebrationActive(true);

    // Create Redemption Request
    const newRedemption: RewardRedemption = {
      id: `red_${Date.now()}`,
      reward_id: reward.id,
      child_id: child.id,
      parent_id: parentEmail || 'parent_demo',
      redeemed_at: now.toISOString(),
      status: 'requested'
    };
    syncRedemptions([...redemptions, newRedemption]);

    // Handle one-time disappearing
    if (reward.limit_type === 'one_time') {
      handleEditReward(reward.id, { is_available: false });
    }

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('reward_redemptions').insert(newRedemption);
      if (error) console.warn('Failed to sync redemption to Supabase:', error.message);
    }
  };

  const handleDeliverReward = async (redemptionId: string) => {
    const redemption = redemptions.find(r => r.id === redemptionId);
    if (!redemption) return;
    
    // Look up reward cost to deduct it now
    const reward = rewards.find(r => r.id === redemption.reward_id);
    const child = children.find(c => c.id === redemption.child_id);

    if (child) {
      const cost = reward ? reward.cost_points : 0;
      const targetChild = {
        ...child,
        points: Math.max(0, child.points - cost),
        pet_food: (child.pet_food || 0) + 1,
      };

      const updatedChildren = children.map(c => c.id === child.id ? targetChild : c);
      syncChildren(updatedChildren);
      
      // Explicitly wait for child to update in DB before updating the redemption
      const supabase = getSupabaseClient();
      if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
        const { error } = await supabase.from('children').update(targetChild).eq('id', targetChild.id);
        if (error) {
          console.error("Failed to update child:", error);
          alert("Database Error: Could not update child's points and pet food. " + error.message);
        }
      }
    } else {
      console.error("Child not found for redemption:", redemption);
      alert("Error: Could not find the child profile to give pet food to!");
    }

    const updated = redemptions.map(r => r.id === redemptionId ? { ...r, status: 'delivered' as const } : r);
    syncRedemptions(updated);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('reward_redemptions').update({ status: 'delivered' }).eq('id', redemptionId);
      if (error) console.warn('Failed to update redemption in Supabase:', error.message);
    }
  };

  const handleFeedPet = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child || (child.pet_food || 0) <= 0) return;

    const targetChild = {
      ...child,
      pet_food: (child.pet_food || 0) - 1,
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    
    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('children').update(targetChild).eq('id', targetChild.id);
      if (error) {
        console.error("Failed to feed pet:", error);
        alert("Database Error: Could not feed pet. " + error.message);
      }
    }
  };

  const handleRejectReward = async (redemptionId: string) => {
    const redemption = redemptions.find(r => r.id === redemptionId);
    if (!redemption) return;
    
    // Restore one_time reward availability
    const reward = rewards.find(r => r.id === redemption.reward_id);
    if (reward && reward.limit_type === 'one_time') {
      handleEditReward(reward.id, { is_available: true });
    }

    // Update redemption status to 'rejected'
    const targetRedemption = { ...redemption, status: 'rejected' as any };
    const updatedRedemptions = redemptions.map(r => r.id === redemption.id ? targetRedemption : r);
    syncRedemptions(updatedRedemptions);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('reward_redemptions').update(targetRedemption).eq('id', redemption.id);
      if (error) {
        console.error("Failed to update redemption:", error);
      }
    }
  };

  const handleRestoreReward = async (rewardId: string) => {
    handleEditReward(rewardId, { is_available: true });
  };

  const handleParentCompleteTask = async (taskId: string, childId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Create a completion directly as 'approved'
    const newCompletion: TaskCompletion = {
      id: `comp_${Date.now()}`,
      task_id: taskId,
      child_id: childId,
      points_awarded: task.points,
      xp_awarded: task.xp ?? task.points,
      status: 'approved',
      completed_at: new Date().toISOString()
    };

    syncCompletions([...completions, newCompletion]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('completions').insert(newCompletion);
      if (error) console.warn('Failed to sync completion to Supabase:', error.message);
    }

    // Award points and update Child stats
    const child = children.find(c => c.id === childId);
    if (child) {
      let targetChild = processXpGains(child, newCompletion.xp_awarded);
      
      const todayStr = new Date().toISOString().split('T')[0];
      const lastActiveStr = targetChild.last_active_date ? targetChild.last_active_date.split('T')[0] : '';
      
      let newStreak = targetChild.streak_days || 0;
      if (lastActiveStr !== todayStr) {
        newStreak += 1;
      }

      targetChild = {
        ...targetChild,
        points: targetChild.points + newCompletion.points_awarded,
        streak_days: newStreak,
        last_active_date: new Date().toISOString()
      };

      const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
      syncChildren(updatedChildren);
      updateChildInSupabase(targetChild);
    }

    setCelebrationActive(true);
  };

  const handleApproveCompletion = async (completionId: string) => {
    const comp = completions.find(c => c.id === completionId);
    if (!comp) return;

    // 1. Update completion status
    const updatedCompletions = completions.map(c => 
      c.id === completionId ? { ...c, status: 'approved' as const } : c
    );
    syncCompletions(updatedCompletions);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase
        .from('completions')
        .update({ status: 'approved' })
        .eq('id', completionId);
      if (error) console.warn('Failed to update completion status in Supabase:', error.message);
    }

    // 2. Award points and update Child stats
    const child = children.find(c => c.id === comp.child_id);
    if (child) {
      // Process XP
      let targetChild = processXpGains(child, comp.xp_awarded ?? comp.points_awarded);
      
      // Update Streak Logic (Once per day)
      const todayStr = new Date().toISOString().split('T')[0];
      const lastActiveStr = targetChild.last_active_date ? targetChild.last_active_date.split('T')[0] : '';
      
      let newStreak = targetChild.streak_days || 0;
      if (lastActiveStr !== todayStr) {
        newStreak += 1; // Only increment if they haven't been active yet today
      }

      // Award Gold explicitly
      targetChild = {
        ...targetChild,
        points: targetChild.points + comp.points_awarded,
        streak_days: newStreak,
        last_active_date: new Date().toISOString()
      };

      const updatedChildren = children.map(c => c.id === comp.child_id ? targetChild : c);
      syncChildren(updatedChildren);
      updateChildInSupabase(targetChild);
    }

    // 3. Trigger full-screen fireworks!
    setCelebrationActive(true);
  };

  const handleRejectCompletion = async (completionId: string) => {
    // Delete or decline completion
    const updatedCompletions = completions.filter(c => c.id !== completionId);
    syncCompletions(updatedCompletions);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('completions').delete().eq('id', completionId);
      if (error) console.warn('Failed to delete completion in Supabase:', error.message);
    }
  };

  return (
    <div className={`relative min-h-screen ${THEME_PRESETS[activeTheme].bodyBg} transition-all duration-300`} id="app-main">
      
      {/* Immersive Confetti Layer */}
      <Confetti active={celebrationActive} onComplete={() => setCelebrationActive(false)} />

      {/* Screen Routing */}
      <AnimatePresence mode="wait">
        {!parentEmail ? (
          <motion.div
            key="auth-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <AuthPage 
              onStartDemo={handleStartDemo}
              onLoginReal={handleLoginReal}
              theme={activeTheme}
            />
          </motion.div>
        ) : isParentMode ? (
          <motion.div
            key="parent-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <ParentDashboard
              children={children}
              tasks={tasks}
              completions={completions}
              rewards={rewards}
              redemptions={redemptions}
              onAddChild={handleAddChild}
              onEditChild={handleEditChild}
              onUpdateChildStats={handleUpdateChildStats}
              onAddTask={handleAddTask}
              onAssignTask={handleAssignTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onAddReward={handleAddReward}
              onAssignReward={handleAssignReward}
              onEditReward={handleEditReward}
              onDeleteReward={handleDeleteReward}
              onApproveCompletion={handleApproveCompletion}
              onRejectCompletion={handleRejectCompletion}
              onDeliverReward={handleDeliverReward}
              onRejectReward={handleRejectReward}
              onRestoreReward={handleRestoreReward}
              onExitParentMode={handleExitParentMode}
              onParentCompleteTask={handleParentCompleteTask}
              parentEmail={parentEmail}
              theme={activeTheme}
            />
          </motion.div>
        ) : (
          <motion.div
            key="child-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <ChildDashboard
              children={children}
              tasks={tasks}
              completions={completions}
              rewards={rewards}
              redemptions={redemptions}
              onCompleteTask={handleCompleteTask}
              onClaimReward={handleClaimReward}
              onEnterParentMode={handleEnterParentModeRequest}
              onFeedPet={handleFeedPet}
              theme={activeTheme}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parental PIN Gate popup lock */}
      <AnimatePresence>
        {showLockScreen && (
          <LockScreen
            correctPin={parentPin}
            onSuccess={handleParentLockSuccess}
            onClose={() => setShowLockScreen(false)}
            theme={activeTheme}
          />
        )}
      </AnimatePresence>

      {/* Theme Selector Widget */}
      <ThemeSelector currentTheme={activeTheme} onThemeChange={handleThemeChange} />

      {/* Silent Floating Logout button for Parent Mode when in Child Mode to return to Landing */}
      {parentEmail && !isParentMode && (
        <button
          onClick={handleLogout}
          className={`fixed bottom-4 right-4 p-3 rounded-full transition-all cursor-pointer text-xs z-30 flex items-center gap-1.5 border ${
            activeTheme === 'cosmic_dark'
              ? 'bg-slate-900/60 hover:bg-rose-950/40 border-slate-850 text-slate-500 hover:text-rose-400'
              : activeTheme === 'sunny_toybox'
                ? 'bg-white border-2 border-stone-300 hover:bg-stone-50 text-stone-600 shadow-sm font-bold'
                : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm'
          }`}
          id="global-logout-btn"
        >
          Sign Out App
        </button>
      )}
    </div>
  );
}
