import React, { useState, useMemo, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, ChevronLeft, ChevronRight, Printer, Plus, Check, X, Clock,
  Sparkles, Star, Flame, Trophy, CheckCircle2, RotateCcw, Info, Coins, Filter, Award,
  Sun, Moon, CheckSquare
} from 'lucide-react';
import { Child, Task, TaskCompletion } from '../types';
import { playSound } from '../utils/sound';
import { ChildAvatar } from './ChildAvatar';
import { Button } from './ui/Button';
import { Typography } from './ui/Typography';
import { CoinBadge } from './CoinBadge';
import { getSupabaseClient } from '../utils/supabase';

interface WeeklyRewardChartProps {
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  onParentCompleteTask: (taskId: string, childId: string, dateIso?: string) => void;
  onApproveCompletion?: (id: string) => void;
  onRejectCompletion?: (id: string) => void;
  onDeleteCompletion?: (id: string) => void;
}

// Helper to determine if a task belongs to a routine (and which period)
const getTaskRoutineInfo = (task: Task, child?: Child): { isRoutine: boolean; period?: 'morning' | 'afternoon' | 'evening' | 'general'; label: string } => {
  if (child && child.routines && child.routines.length > 0) {
    for (const routine of child.routines) {
      if (routine.morningTaskIds?.includes(task.id) || (task.template_id && routine.morningTaskIds?.includes(task.template_id))) {
        return { isRoutine: true, period: 'morning', label: 'Morning Routine' };
      }
      if (routine.afternoonTaskIds?.includes(task.id) || (task.template_id && routine.afternoonTaskIds?.includes(task.template_id))) {
        return { isRoutine: true, period: 'afternoon', label: 'Afternoon Routine' };
      }
      if (routine.eveningTaskIds?.includes(task.id) || (task.template_id && routine.eveningTaskIds?.includes(task.template_id))) {
        return { isRoutine: true, period: 'evening', label: 'Evening Routine' };
      }
    }
  }

  // Fallback period detection by title keywords
  const titleLower = task.title.toLowerCase();
  if (titleLower.includes('morning')) return { isRoutine: true, period: 'morning', label: 'Morning Routine' };
  if (titleLower.includes('afternoon')) return { isRoutine: true, period: 'afternoon', label: 'Afternoon Routine' };
  if (titleLower.includes('evening') || titleLower.includes('bedtime')) return { isRoutine: true, period: 'evening', label: 'Evening Routine' };

  return { isRoutine: false, label: '' };
};

// Calculate unlocked badge count dynamically based on child stats & completions
const calculateBadgeCount = (child: Child, allCompletions: TaskCompletion[]): number => {
  const childApprovedCompletions = allCompletions.filter(c => c.child_id === child.id && c.status === 'approved');
  const totalTasks = childApprovedCompletions.length;
  const level = child.level || 1;
  const streak = child.streak_days || 0;
  const points = child.lifetime_points || child.points || 0;

  let count = 0;

  // Level Progression Badges
  if (level >= 2) count++;
  if (level >= 3) count++;
  if (level >= 5) count++;
  if (level >= 10) count++;
  if (level >= 15) count++;
  if (level >= 20) count++;
  if (level >= 30) count++;
  if (level >= 50) count++;

  // Coins & Wealth Badges
  if (points > 0) count++;
  if (points >= 50) count++;
  if (points >= 100) count++;
  if (points >= 250) count++;
  if (points >= 500) count++;
  if (points >= 1000) count++;
  if (points >= 2500) count++;
  if (points >= 5000) count++;

  // Streak Badges
  if (streak >= 2) count++;
  if (streak >= 3) count++;
  if (streak >= 7) count++;
  if (streak >= 14) count++;
  if (streak >= 21) count++;
  if (streak >= 30) count++;
  if (streak >= 100) count++;

  // Task & Chore Badges
  if (totalTasks >= 1) count++;
  if (totalTasks >= 5) count++;
  if (totalTasks >= 10) count++;
  if (totalTasks >= 50) count++;
  if (totalTasks >= 100) count++;

  return count;
};

export const WeeklyRewardChart: React.FC<WeeklyRewardChartProps> = ({
  children,
  tasks,
  completions,
  onParentCompleteTask,
  onApproveCompletion,
  onRejectCompletion,
  onDeleteCompletion
}) => {
  // Selected child state - default to first child or empty
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || '');
  
  // Date range duration state: '7d' (1 week), '14d' (2 weeks), '30d' (1 month)
  const [viewRange, setViewRange] = useState<'7d' | '14d' | '30d'>('7d');
  
  // Print Modal & Options state
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printRange, setPrintRange] = useState<'7d' | '14d'>('7d');
  const [printMode, setPrintMode] = useState<'live' | 'blank'>('live');
  const [isPrintingBlank, setIsPrintingBlank] = useState<boolean>(false);
  
  // Routine filter state: 'all', 'routines', 'extra'
  const [routineFilter, setRoutineFilter] = useState<'all' | 'routines' | 'extra'>('all');

  // Week offset state (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Tip banner visibility
  const [showTip, setShowTip] = useState<boolean>(true);

  // Unlocked badges count from DB
  const [unlockedBadgesCount, setUnlockedBadgesCount] = useState<number | null>(null);

  // Selected cell modal/popover state for modifying an existing completion
  const [activeCellAction, setActiveCellAction] = useState<{
    completion?: TaskCompletion;
    taskId: string;
    childId: string;
    dateStr: string;
    taskTitle: string;
  } | null>(null);

  // Helper to format Date to YYYY-MM-DD
  const formatDateKey = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Active selected child object
  const activeChild = children.find(c => c.id === selectedChildId) || children[0];

  // Fetch badges from Supabase child_badges table whenever active child or completions change
  useEffect(() => {
    if (!activeChild) return;
    let isMounted = true;

    const fetchBadgeCount = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      try {
        const { count, error } = await supabase
          .from('child_badges')
          .select('*', { count: 'exact', head: true })
          .eq('child_id', activeChild.id);

        if (!error && count !== null && isMounted) {
          setUnlockedBadgesCount(count);
        }
      } catch (e) {
        console.warn('Error fetching badge count:', e);
      }
    };

    fetchBadgeCount();
    return () => { isMounted = false; };
  }, [activeChild?.id, completions]);

  // Compute start of week (Monday) based on weekOffset
  const { startDate, dateRangeDays } = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
    // Calculate distance to previous Monday
    const distanceToMonday = (currentDayOfWeek + 6) % 7;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);

    const numDays = viewRange === '7d' ? 7 : viewRange === '14d' ? 14 : 30;
    
    const days: Date[] = [];
    for (let i = 0; i < numDays; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }

    return { startDate: monday, dateRangeDays: days };
  }, [weekOffset, viewRange]);

  // Today key
  const todayKey = formatDateKey(new Date());

  // Active tasks for the selected child (or all children if activeChild is set)
  const activeChildTasks = useMemo(() => {
    if (!activeChild) return [];
    return tasks.filter(t => 
      (t.child_id === activeChild.id || t.child_id === 'all') && 
      t.child_id !== 'directory' && 
      t.is_template !== true && 
      t.is_active !== false
    );
  }, [tasks, activeChild]);

  // Filtered tasks based on routine filter ('all', 'routines', 'extra')
  const filteredChildTasks = useMemo(() => {
    return activeChildTasks.filter(task => {
      const routineInfo = getTaskRoutineInfo(task, activeChild);
      if (routineFilter === 'routines') return routineInfo.isRoutine;
      if (routineFilter === 'extra') return !routineInfo.isRoutine;
      return true;
    });
  }, [activeChildTasks, activeChild, routineFilter]);

  // Date range label string (e.g., "20 Jul – 26 Jul")
  const dateRangeLabel = useMemo(() => {
    if (dateRangeDays.length === 0) return '';
    const first = dateRangeDays[0];
    const last = dateRangeDays[dateRangeDays.length - 1];

    const formatShort = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${formatShort(first)} – ${formatShort(last)}`;
  }, [dateRangeDays]);

  const isCurrentWeek = weekOffset === 0;

  // Print chart function: Opens custom print options modal
  const handlePrint = () => {
    playSound.click();
    setShowPrintModal(true);
  };

  // Triggers browser print synchronously on click to suppress Safari security warning
  const handleExecutePrint = () => {
    playSound.click();

    // Apply print options & hide modal state
    const previousRange = viewRange;
    setViewRange(printRange);
    setIsPrintingBlank(printMode === 'blank');
    setShowPrintModal(false);

    // Invoke window.print() synchronously within user gesture
    window.print();

    // Restore interactive blank state
    setIsPrintingBlank(false);
  };

  // Map of completion lookup: key = `${taskId}_${dateKey}` -> TaskCompletion
  const completionMap = useMemo(() => {
    const map = new Map<string, TaskCompletion>();
    completions.forEach(comp => {
      if (!comp.completed_at) return;
      const dateKey = formatDateKey(new Date(comp.completed_at));
      const key = `${comp.task_id}_${dateKey}`;
      // Prefer approved if multiple exist
      const existing = map.get(key);
      if (!existing || comp.status === 'approved') {
        map.set(key, comp);
      }
    });
    return map;
  }, [completions]);

  // Handle cell click
  const handleCellClick = (task: Task, date: Date) => {
    playSound.click();
    const dateStr = formatDateKey(date);
    const key = `${task.id}_${dateStr}`;
    const existingComp = completionMap.get(key);

    if (!existingComp) {
      // Create auto-approved completion for parent
      playSound.success();
      onParentCompleteTask(task.id, activeChild?.id || task.child_id, date.toISOString());
    } else {
      // Show action popover to toggle status or reject/delete
      setActiveCellAction({
        completion: existingComp,
        taskId: task.id,
        childId: activeChild?.id || task.child_id,
        dateStr,
        taskTitle: task.title
      });
    }
  };

  // Calculate stats for selected child and date range
  const summaryStats = useMemo(() => {
    if (!activeChild) return { goldEarned: 0, choresCompleted: 0, streak: 0, badges: 0 };

    const dateKeysSet = new Set(dateRangeDays.map(formatDateKey));
    let gold = 0;
    let completedCount = 0;

    completions.forEach(comp => {
      if (comp.child_id === activeChild.id && comp.status === 'approved') {
        const dateKey = formatDateKey(new Date(comp.completed_at));
        if (dateKeysSet.has(dateKey)) {
          gold += comp.points_awarded || 0;
          completedCount += 1;
        }
      }
    });

    const localBadges = calculateBadgeCount(activeChild, completions);
    const badgeCount = (unlockedBadgesCount !== null && unlockedBadgesCount > 0)
      ? Math.max(unlockedBadgesCount, localBadges)
      : localBadges;

    return {
      goldEarned: gold,
      choresCompleted: completedCount,
      streak: activeChild.streak_days || 0,
      badges: badgeCount
    };
  }, [activeChild, completions, dateRangeDays, unlockedBadgesCount]);

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">

      {/* Top Bar: Title, Child Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        
        {/* Child Selector Tabs */}
        <div id="tour-chart-child-selector" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {children.map(child => {
            const isSelected = child.id === activeChild?.id;
            return (
              <button
                key={child.id}
                onClick={() => {
                  playSound.click();
                  setSelectedChildId(child.id);
                }}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-rose-500/25 scale-105'
                    : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
              >
                <ChildAvatar
                  iconName={child.avatar_url || 'Smile'}
                  className="w-6 h-6 rounded-full border border-white/40"
                />
                <span>{child.name}</span>
              </button>
            );
          })}
        </div>

        {/* View Controls & Print Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Duration Selector */}
          <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl flex items-center gap-1 border border-stone-200 dark:border-stone-700">
            {(['7d', '14d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => {
                  playSound.click();
                  setViewRange(range);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewRange === range
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Template Style Toggle: Live vs Blank Plain Chart */}
          <button
            type="button"
            onClick={() => {
              playSound.click();
              setIsPrintingBlank(prev => !prev);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              isPrintingBlank
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
            title={isPrintingBlank ? 'Currently showing Blank Reusable Template' : 'Currently showing Live Chart with Dates'}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isPrintingBlank ? 'text-white' : 'text-amber-500'}`} />
            <span>{isPrintingBlank ? 'Blank Template' : 'Live Chart'}</span>
          </button>

          {/* Print Button */}
          <Button
            id="tour-chart-print-btn"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl font-bold"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </Button>
        </div>
      </div>

      {/* Tip Banner Callout */}
      {showTip && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 rounded-2xl p-3.5 sm:p-4 flex items-start justify-between gap-3 text-cyan-900 dark:text-cyan-200 shadow-sm print:hidden"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              <span className="font-bold">Pro Tip:</span> Tap any empty cell to mark a chore as done — even for past days. It'll be auto-approved since you're the parent!
            </p>
          </div>
          <button
            onClick={() => setShowTip(false)}
            className="text-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-300 p-1 rounded-lg transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Date Navigation Header */}
      <div className="flex items-center justify-between bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3 sm:p-4 shadow-sm print:border-none print:p-0">
        <button
          onClick={() => {
            playSound.click();
            setWeekOffset(prev => prev - 1);
          }}
          className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors print:hidden"
          title="Previous week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-rose-500 hidden sm:block print:hidden" />
          <div className="text-center sm:text-left">
            <span className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-50">
              {dateRangeLabel}
            </span>
            {isCurrentWeek && (
              <span className="ml-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                THIS WEEK
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            playSound.click();
            setWeekOffset(prev => prev + 1);
          }}
          className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors print:hidden"
          title="Next week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Weekly Grid Card */}
      <div id="tour-chart-grid" className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-sm overflow-hidden print:border print:shadow-none">
        
        {/* Card Header Title */}
        <div className="p-4 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-50">
                {activeChild ? `${activeChild.name}'s chart` : 'Reward Chart'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {isPrintingBlank ? 'Blank Reusable Reward Chart' : dateRangeLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Filter by Routine or Extra Chores */}
            <div className="hidden md:flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-[11px] font-bold print:hidden">
              <button
                onClick={() => { playSound.click(); setRoutineFilter('all'); }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  routineFilter === 'all'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 shadow-sm font-black'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                All ({activeChildTasks.length})
              </button>
              <button
                onClick={() => { playSound.click(); setRoutineFilter('routines'); }}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  routineFilter === 'routines'
                    ? 'bg-rose-500 text-white shadow-sm font-black'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                Routines
              </button>
              <button
                onClick={() => { playSound.click(); setRoutineFilter('extra'); }}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  routineFilter === 'extra'
                    ? 'bg-rose-500 text-white shadow-sm font-black'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <CheckSquare className="w-3 h-3" />
                Extra
              </button>
            </div>

            <div className="text-right hidden sm:block print:block">
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">Total Gold</span>
              <div className="flex items-center justify-end gap-1.5 font-black text-amber-600 dark:text-amber-400 text-lg mt-0.5">
                <CoinBadge points={isPrintingBlank ? 0 : summaryStats.goldEarned} className="w-8 h-8 text-xs font-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-left min-w-[640px]">
            
            {/* Table Header: Chore & Days */}
            <thead>
              <tr className="border-b border-stone-200/60 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/40 text-stone-500 text-xs font-extrabold uppercase">
                <th className="p-3.5 sm:p-4 w-48 sm:w-64 sticky left-0 z-20 bg-stone-50 dark:bg-stone-900 border-r border-stone-200/60 dark:border-stone-800 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  Chore
                </th>
                {dateRangeDays.map((date) => {
                  const dateStr = formatDateKey(date);
                  const isToday = dateStr === todayKey;
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = date.getDate();

                  return (
                    <th key={dateStr} className="p-2 sm:p-3 text-center min-w-[60px] sm:min-w-[75px]">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-[10px] font-bold text-stone-400">{dayName}</span>
                        {!isPrintingBlank && (
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                              isToday
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-300 dark:ring-rose-900 scale-110'
                                : 'text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            {dayNum}
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body: Chore Rows */}
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-xs font-medium">
              {filteredChildTasks.length === 0 ? (
                <tr>
                  <td colSpan={dateRangeDays.length + 1} className="p-8 text-center text-stone-400">
                    {routineFilter !== 'all'
                      ? `No ${routineFilter === 'routines' ? 'routine' : 'extra'} chores found for ${activeChild?.name || 'this child'}.`
                      : `No active chores found for ${activeChild?.name || 'this child'}. Add chores in the Tasks tab!`}
                  </td>
                </tr>
              ) : (
                filteredChildTasks.map(task => {
                  const routineInfo = getTaskRoutineInfo(task, activeChild);

                  return (
                    <tr key={task.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                      
                      {/* Chore Name Column with Routine Indicator Badge */}
                      <td className="p-3 sm:p-4 sticky left-0 z-10 bg-white dark:bg-stone-900 border-r border-stone-200/60 dark:border-stone-800 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3">
                          <CoinBadge points={task.points} className="w-8 h-8 sm:w-9 sm:h-9 text-xs font-black shrink-0" />
                          <div className="truncate flex flex-col justify-center">
                            <p className="font-extrabold text-stone-800 dark:text-stone-100 truncate text-xs sm:text-sm">
                              {task.title}
                            </p>
                            {routineInfo.isRoutine && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wide ${
                                  routineInfo.period === 'morning'
                                    ? 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
                                    : routineInfo.period === 'evening'
                                    ? 'bg-indigo-100/90 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60'
                                    : routineInfo.period === 'afternoon'
                                    ? 'bg-orange-100/90 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/60'
                                    : 'bg-sky-100/90 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60'
                                }`}>
                                  {routineInfo.period === 'morning' ? (
                                    <Sun className="w-3 h-3 text-amber-500" />
                                  ) : routineInfo.period === 'evening' ? (
                                    <Moon className="w-3 h-3 text-indigo-500" />
                                  ) : (
                                    <RotateCcw className="w-3 h-3 text-sky-500" />
                                  )}
                                  <span>{routineInfo.label}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Days Grid Cells */}
                      {dateRangeDays.map(date => {
                        const dateStr = formatDateKey(date);
                        const key = `${task.id}_${dateStr}`;
                        const completion = isPrintingBlank ? undefined : completionMap.get(key);
                        const isToday = dateStr === todayKey;

                        return (
                          <td key={dateStr} className={`p-2 text-center align-middle ${isToday ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''}`}>
                            <button
                              onClick={() => handleCellClick(task, date)}
                              className={`w-9 h-9 sm:w-11 sm:h-11 mx-auto rounded-full flex items-center justify-center transition-all duration-200 ${
                                completion?.status === 'approved'
                                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30 hover:scale-105 ring-2 ring-rose-400/50'
                                  : completion?.status === 'pending'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:scale-105'
                                  : completion?.status === 'rejected'
                                  ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 hover:scale-105'
                                  : 'bg-stone-50 dark:bg-stone-800/60 border-2 border-dashed border-stone-200 dark:border-stone-700 text-stone-300 dark:text-stone-600 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:scale-105'
                              }`}
                              title={
                                completion
                                  ? `Status: ${completion.status}`
                                  : 'Click to mark chore done'
                              }
                            >
                              {completion?.status === 'approved' ? (
                                <Check className="w-5 h-5 stroke-[3]" />
                              ) : completion?.status === 'pending' ? (
                                <Clock className="w-5 h-5 animate-pulse" />
                              ) : completion?.status === 'rejected' ? (
                                <X className="w-5 h-5 stroke-[3]" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer: Daily Totals */}
            <tfoot>
              <tr className="bg-stone-50 dark:bg-stone-800/80 border-t-2 border-stone-200 dark:border-stone-700 text-xs font-black text-stone-700 dark:text-stone-300">
                <td className="p-3.5 sm:p-4 sticky left-0 z-10 bg-stone-100 dark:bg-stone-800 uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  TOTAL GOLD
                </td>
                {dateRangeDays.map(date => {
                  const dateStr = formatDateKey(date);
                  
                  // Calculate total points earned on this date
                  let dailyTotal = 0;
                  activeChildTasks.forEach(task => {
                    const key = `${task.id}_${dateStr}`;
                    const comp = completionMap.get(key);
                    if (comp?.status === 'approved') {
                      dailyTotal += comp.points_awarded || task.points;
                    }
                  });

                  return (
                    <td key={dateStr} className="p-2 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-xl text-xs font-black ${
                        dailyTotal > 0 ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'text-stone-400'
                      }`}>
                        {dailyTotal > 0 ? `+${dailyTotal}` : '0'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Status Legend Row */}
        <div className="p-4 bg-stone-50/80 dark:bg-stone-900/80 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-stone-600 dark:text-stone-400 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-rose-500 flex items-center justify-center text-white text-[10px]">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>approved</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center text-[10px]">
              <Clock className="w-3 h-3" />
            </span>
            <span>pending</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-[10px]">
              <Plus className="w-3 h-3" />
            </span>
            <span>not yet</span>
          </div>
        </div>
      </div>

      {/* Modal / Action Popover for editing an existing completion */}
      <AnimatePresence>
        {activeCellAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-50">
                  Manage Chore Status
                </h3>
                <button
                  onClick={() => setActiveCellAction(null)}
                  className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800 p-3 rounded-2xl text-xs space-y-1">
                <p className="font-extrabold text-stone-800 dark:text-stone-100">
                  {activeCellAction.taskTitle}
                </p>
                <p className="text-stone-500 font-medium">
                  Date: {activeCellAction.dateStr}
                </p>
                {activeCellAction.completion && (
                  <p className="text-rose-500 font-bold uppercase text-[10px]">
                    Current Status: {activeCellAction.completion.status}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {activeCellAction.completion?.status !== 'approved' && (
                  <Button
                    variant="primary"
                    className="w-full justify-center bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl py-2.5"
                    onClick={() => {
                      playSound.success();
                      if (activeCellAction.completion && onApproveCompletion) {
                        onApproveCompletion(activeCellAction.completion.id);
                      } else {
                        onParentCompleteTask(
                          activeCellAction.taskId,
                          activeCellAction.childId,
                          new Date(activeCellAction.dateStr).toISOString()
                        );
                      }
                      setActiveCellAction(null);
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Chore
                  </Button>
                )}

                {activeCellAction.completion?.status !== 'rejected' && (
                  <Button
                    variant="secondary"
                    className="w-full justify-center bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold rounded-xl py-2.5"
                    onClick={() => {
                      playSound.click();
                      if (activeCellAction.completion && onRejectCompletion) {
                        onRejectCompletion(activeCellAction.completion.id);
                      }
                      setActiveCellAction(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    {activeCellAction.completion?.status === 'approved' ? 'Revert Approval (Deduct Coins)' : 'Decline / Mark as Try Again'}
                  </Button>
                )}

                {activeCellAction.completion && onDeleteCompletion && (
                  <Button
                    variant="outline"
                    className="w-full justify-center border-stone-200 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold rounded-xl py-2.5"
                    onClick={() => {
                      playSound.click();
                      onDeleteCompletion(activeCellAction.completion.id);
                      setActiveCellAction(null);
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear / Reset Cell
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Print Options Modal */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-sm print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6 overflow-hidden text-left"
            >
              {/* Header Icon & Title */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <Typography variant="h2" className="text-xl font-bold">
                      Print Chart Options
                    </Typography>
                    <Typography variant="helper" className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Configure duration and template style
                    </Typography>
                  </div>
                </div>
                <button
                  onClick={() => { playSound.click(); setShowPrintModal(false); }}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1.5 rounded-xl transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Option 1: Print Duration */}
                <div>
                  <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
                    1. Print Duration
                  </Typography>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { playSound.click(); setPrintRange('7d'); }}
                      className={`p-3.5 rounded-2xl border transition-all text-left ${
                        printRange === '7d'
                          ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md font-bold'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <p className="font-extrabold text-sm">7 Days</p>
                      <p className={`text-xs mt-0.5 ${printRange === '7d' ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                        1 Week Layout
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => { playSound.click(); setPrintRange('14d'); }}
                      className={`p-3.5 rounded-2xl border transition-all text-left ${
                        printRange === '14d'
                          ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md font-bold'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <p className="font-extrabold text-sm">14 Days</p>
                      <p className={`text-xs mt-0.5 ${printRange === '14d' ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                        2 Weeks Layout
                      </p>
                    </button>
                  </div>
                </div>

                {/* Option 2: Chart Template Style */}
                <div>
                  <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
                    2. Chart Template Style
                  </Typography>
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => { playSound.click(); setPrintMode('live'); }}
                      className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3.5 ${
                        printMode === 'live'
                          ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md font-bold'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <Calendar className={`w-5 h-5 shrink-0 mt-0.5 ${printMode === 'live' ? 'text-amber-300 dark:text-amber-600' : 'text-amber-500'}`} />
                      <div>
                        <p className="font-extrabold text-sm">
                          Live Chart (With Current Dates)
                        </p>
                        <p className={`text-xs mt-0.5 font-medium ${printMode === 'live' ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                          Prints actual calendar dates ({dateRangeLabel}) and current checked stars.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { playSound.click(); setPrintMode('blank'); }}
                      className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3.5 ${
                        printMode === 'blank'
                          ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md font-bold'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${printMode === 'blank' ? 'text-amber-300 dark:text-amber-600' : 'text-amber-500'}`} />
                      <div>
                        <p className="font-extrabold text-sm">
                          Blank / Plain Reusable Template
                        </p>
                        <p className={`text-xs mt-0.5 font-medium ${printMode === 'blank' ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                          Prints generic MON–SUN headers without date numbers or pre-checked stars. Perfect for physical reuse!
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <Button
                    variant="secondary"
                    onClick={() => { playSound.click(); setShowPrintModal(false); }}
                    className="flex-1 justify-center"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleExecutePrint}
                    className="flex-1 justify-center"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Chart</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
