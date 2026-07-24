import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, ChevronLeft, ChevronRight, Printer, Plus, Check, X, Clock,
  Sparkles, Star, Flame, Trophy, CheckCircle2, RotateCcw, Info, Coins, Filter, Award,
  Sun, Moon, CheckSquare, Camera
} from 'lucide-react';
import { Child, Task, TaskCompletion, TaskCategory } from '../types';
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
  isPro?: boolean;
  onOpenPaywall?: (feature?: string) => void;
  onOpenScanChart?: () => void;
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
  onDeleteCompletion,
  isPro = false,
  onOpenPaywall,
  onOpenScanChart,
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

  // Print filter: routine time period
  const [printRoutinePeriod, setPrintRoutinePeriod] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  // Print filter: categories (empty set = all)
  const [printCategories, setPrintCategories] = useState<Set<TaskCategory>>(new Set());

  // Routine filter state: 'all', 'routines', 'extra'
  const [routineFilter, setRoutineFilter] = useState<'all' | 'routines' | 'extra'>('all');

  // Week offset state (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Tip banner visibility


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

  // Build tasks list for printing, respecting print filters
  const buildPrintTasks = (): Task[] => {
    const numDays = printRange === '7d' ? 7 : 14;
    // Start from current Monday
    const now = new Date();
    const distanceToMonday = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    let filteredTasks = (tasks || []).filter(t =>
      (t.child_id === activeChild?.id || t.child_id === 'all') &&
      t.child_id !== 'directory' &&
      t.is_template !== true &&
      t.is_active !== false
    );

    // Apply routine period filter
    if (printRoutinePeriod !== 'all') {
      filteredTasks = filteredTasks.filter(task => {
        const info = getTaskRoutineInfo(task, activeChild);
        return info.period === printRoutinePeriod;
      });
    }

    // Apply category filter (if any categories selected)
    if (printCategories.size > 0) {
      filteredTasks = filteredTasks.filter(t => printCategories.has(t.category as TaskCategory));
    }

    return filteredTasks;
  };

  // Get print date range days
  const buildPrintDays = (): Date[] => {
    const numDays = printRange === '7d' ? 7 : 14;
    const now = new Date();
    const distanceToMonday = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: numDays }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  // Generate week label like "2026-W30"
  const getWeekLabel = (date: Date): string => {
    const yr = date.getFullYear();
    const startOfYear = new Date(yr, 0, 1);
    const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${yr}-W${String(weekNum).padStart(2, '0')}`;
  };

  // Open a new window with a self-contained print-ready HTML chart (works on mobile)
  const handleExecutePrint = () => {
    playSound.click();
    setShowPrintModal(false);

    const printTasks = buildPrintTasks();
    const printDays = buildPrintDays();
    const isBlank = printMode === 'blank';
    const childName = activeChild?.name || 'Child';
    const weekLabel = getWeekLabel(printDays[0]);
    const chartId = `${childName.toUpperCase().replace(/\s+/g, '-')}-${weekLabel}`;

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = formatDateKey(new Date());

    // Build completion lookup for live mode
    const compLookup = new Map<string, string>(); // key -> status
    if (!isBlank) {
      completions.forEach(c => {
        if (c.child_id === activeChild?.id) {
          const dk = formatDateKey(new Date(c.completed_at));
          compLookup.set(`${c.task_id}_${dk}`, c.status);
        }
      });
    }

    // Hollow star SVG
    const hollowStar = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    const filledStar = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#f59e0b" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

    const colHeaders = (printRange === '7d' ? dayNames : [...dayNames, ...dayNames])
      .slice(0, printDays.length)
      .map((day, i) => {
        const date = printDays[i];
        const dateStr = formatDateKey(date);
        const isToday = dateStr === todayStr;
        return `<th style="text-align:center;padding:12px 4px;font-size:12px;color:${isToday ? '#7c3aed' : '#4b5563'};font-weight:900;min-width:56px;">
          ${day}${!isBlank ? `<br/><span style="font-size:11px;font-weight:700">${date.getDate()}</span>` : ''}
        </th>`;
      }).join('');

    const taskRows = printTasks.map((task, index) => {
      const cells = printDays.map(date => {
        const dk = formatDateKey(date);
        const status = compLookup.get(`${task.id}_${dk}`);
        const star = (!isBlank && status === 'approved') ? filledStar : hollowStar;
        return `<td style="text-align:center;padding:8px 3px;border-left:1px dashed #e7e5e4;">${star}</td>`;
      }).join('');
      const bg = index % 2 === 0 ? '#ffffff' : '#faf5ff';
      return `<tr style="background:${bg};border-bottom:1px solid #f5f5f4;">
        <td style="padding:10px 14px;font-size:14px;font-weight:800;color:#1c1917;min-width:140px;max-width:180px;white-space:normal;word-break:break-word;">
          <span style="display:inline-flex;align-items:center;justify-content:center;background:#fffbeb;color:#d97706;font-size:10px;font-weight:800;width:24px;height:24px;border:2px solid #fcd34d;border-radius:50%;margin-bottom:6px;">${task.points}</span><br/>
          ${task.title}
        </td>
        ${cells}
      </tr>`;
    }).join('');

    const noTasksRow = printTasks.length === 0
      ? `<tr><td colspan="${printDays.length + 1}" style="text-align:center;padding:32px;color:#a8a29e;font-size:13px;">No chores match the selected filters.</td></tr>`
      : '';

    const routineLabel = printRoutinePeriod === 'all' 
      ? 'Chore Chart' 
      : `${printRoutinePeriod.charAt(0).toUpperCase() + printRoutinePeriod.slice(1)} Routine`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${childName}'s ${routineLabel} — ${chartId}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { size: landscape; margin: 1.2cm 1cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #fff; color: #1c1917; }
    .header { 
      display: flex; align-items: center; justify-content: space-between; 
      padding: 16px 24px; 
      background: linear-gradient(135deg, #a78bfa, #8b5cf6);
      border-radius: 16px;
      margin-bottom: 20px; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      color: white;
    }
    .header-title { font-size: 26px; font-weight: 900; letter-spacing: -0.02em; }
    .header-sub { font-size: 13px; font-weight: 700; opacity: 0.9; margin-top: 4px; }
    .header-logo { font-size: 12px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 99px; }
    
    .table-container {
      border-radius: 16px;
      overflow: hidden;
      border: 2px solid #e7e5e4;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f3f4f6; border-bottom: 2px solid #e7e5e4; }
    th:first-child { text-align: left; padding: 12px 14px; font-size: 13px; color: #4b5563; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
    tbody tr:last-child { border-bottom: none; }
    
    .footer { margin-top: 24px; display: flex; align-items: center; justify-content: space-between; }
    .footer-instruction { font-size: 13px; color: #6b7280; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .footer-id { font-size: 10px; color: #d1d5db; font-weight: 800; letter-spacing: 0.05em; font-family: monospace; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .table-container { border: 2px solid #e7e5e4; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="header-title">${childName}'s ${routineLabel}</div>
      <div class="header-sub">${isBlank ? 'Reusable — Fill in the week yourself' : printDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' – ' + printDays[printDays.length - 1].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
    </div>
    <div class="header-logo">Quest Sync</div>
  </div>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="text-align:left;padding:12px 14px;font-size:12px;color:#4b5563;font-weight:900;text-transform:uppercase;">Chore</th>
          ${colHeaders}
        </tr>
      </thead>
      <tbody>
        ${taskRows}${noTasksRow}
      </tbody>
    </table>
  </div>
  <div class="footer">
    <div class="footer-instruction">🎨 Colour in each star when you finish a chore! &nbsp; Ask a grown-up to scan this chart.</div>
    <div class="footer-id">Chart: ${chartId}</div>
  </div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      // Fallback: try old-school print if popup blocked
      alert('Please allow pop-ups for this site to print charts, or try from a desktop browser.');
    }
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

          {/* Scan Completed Chart Button */}
          <Button
            id="tour-chart-scan-btn"
            variant="secondary"
            size="sm"
            onClick={() => {
              playSound.click();
              if (!isPro) {
                onOpenPaywall?.('scan_chart');
              } else {
                onOpenScanChart?.();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl font-bold"
            title={isPro ? 'Scan a completed paper chart' : 'Pro feature — upgrade to scan charts'}
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Scan</span>
          </Button>
        </div>
      </div>

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
                          <td key={dateStr} className={`p-2 text-center align-middle ${!isPrintingBlank && isToday ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''}`}>
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

            {/* Table Footer: Daily Totals (Hidden for blank reusable template printout) */}
            {!isPrintingBlank && (
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
            )}
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

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Option 1: Print Duration */}
                <div>
                  <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
                    1. Duration
                  </Typography>
                  <div className="grid grid-cols-2 gap-2">
                    {([['7d', '7 Days', '1 Week'], ['14d', '14 Days', '2 Weeks']] as const).map(([val, label, sub]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => { playSound.click(); setPrintRange(val); }}
                        className={`p-3 rounded-2xl border transition-all text-left ${
                          printRange === val
                            ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        <p className="font-extrabold text-sm">{label}</p>
                        <p className={`text-xs mt-0.5 ${printRange === val ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>{sub} Layout</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option 2: Chart Style */}
                <div>
                  <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
                    2. Chart Style
                  </Typography>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => { playSound.click(); setPrintMode('live'); }}
                      className={`w-full p-3 rounded-2xl border transition-all text-left flex items-start gap-3 ${
                        printMode === 'live'
                          ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <Calendar className={`w-5 h-5 shrink-0 mt-0.5 ${printMode === 'live' ? 'text-amber-300 dark:text-amber-600' : 'text-amber-500'}`} />
                      <div>
                        <p className="font-extrabold text-sm">Live Chart (with Dates)</p>
                        <p className={`text-xs mt-0.5 font-medium ${printMode === 'live' ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                          Prints calendar dates and any already-completed stars.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { playSound.click(); setPrintMode('blank'); }}
                      className={`w-full p-3 rounded-2xl border transition-all text-left flex items-start gap-3 ${
                        printMode === 'blank'
                          ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >

                      <div>
                        <p className="font-extrabold text-sm">Blank / Reusable Template</p>
                        <p className={`text-xs mt-0.5 font-medium ${printMode === 'blank' ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                          Generic MON–SUN headers, empty stars — perfect for colouring in!
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Option 3: Routine Time Period */}
                <div>
                  <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
                    3. Routine Time
                  </Typography>
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'morning', 'afternoon', 'evening'] as const).map(period => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => { playSound.click(); setPrintRoutinePeriod(period); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all capitalize ${
                          printRoutinePeriod === period
                            ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                            : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        {period === 'all' ? '🌟 All' : period === 'morning' ? '☀️ Morning' : period === 'afternoon' ? '🌤 Afternoon' : '🌙 Evening'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option 4: Category Filter */}
                <div>
                  <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
                    4. Categories <span className="normal-case text-stone-400">(leave blank = all)</span>
                  </Typography>
                  <div className="flex gap-2 flex-wrap">
                    {(['chores', 'homework', 'behavior', 'health', 'creative', 'other'] as TaskCategory[]).map(cat => {
                      const isSelected = printCategories.has(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            playSound.click();
                            setPrintCategories(prev => {
                              const next = new Set(prev);
                              if (next.has(cat)) next.delete(cat); else next.add(cat);
                              return next;
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all capitalize ${
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                              : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
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
