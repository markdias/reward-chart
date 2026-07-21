import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Lightbulb, 
  Coins, 
  CheckCheck, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Smile,
  Heart,
  BookOpen,
  Palette,
  Target,
  Sun
} from 'lucide-react';
import { Child, Task, TaskCompletion } from '../types';
import { ChildAvatar } from './ChildAvatar';
import { CoinBadge } from './CoinBadge';
import { Typography } from './ui/Typography';

interface InsightsTabProps {
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  initialChildId?: string;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  chores: { label: 'Chore', icon: CheckCircle2, color: 'bg-indigo-500' },
  kindness: { label: 'Kindness', icon: Heart, color: 'bg-pink-500' },
  manners: { label: 'Manners', icon: Smile, color: 'bg-sky-500' },
  feelings: { label: 'Feelings', icon: Heart, color: 'bg-rose-400' },
  learning: { label: 'Learning', icon: BookOpen, color: 'bg-purple-500' },
  self_care: { label: 'Self-care', icon: Sun, color: 'bg-emerald-500' },
  homework: { label: 'Homework', icon: BookOpen, color: 'bg-amber-500' },
  health: { label: 'Health', icon: Heart, color: 'bg-rose-500' },
  creative: { label: 'Creative', icon: Palette, color: 'bg-violet-500' },
  behavior: { label: 'Behavior', icon: Smile, color: 'bg-orange-500' },
  other: { label: 'Other', icon: Target, color: 'bg-stone-500' }
};

export const InsightsTab: React.FC<InsightsTabProps> = ({
  children,
  tasks,
  completions,
  initialChildId
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>(
    initialChildId || (children.length > 0 ? children[0].id : '')
  );

  const selectedChild = useMemo(() => {
    return children.find(c => c.id === selectedChildId) || children[0];
  }, [children, selectedChildId]);

  // Derived Analytics Data for selected child
  const analytics = useMemo(() => {
    if (!selectedChild) {
      return {
        totalCoins: 0,
        choresDone: 0,
        perfectDays: 0,
        dayStreak: 0,
        dayCounts: [0, 0, 0, 0, 0, 0, 0],
        maxDayCount: 0,
        peakDayIndex: 2, // Default Tue
        categoryCounts: [] as { category: string; label: string; count: number; icon: React.ElementType; color: string }[],
        goingWellTasks: [] as { title: string; count: number }[],
        strugglingTasks: [] as { title: string; count: number }[],
        insightMessage: ''
      };
    }

    const childCompletions = completions.filter(c => c.child_id === selectedChild.id);
    const approvedCompletions = childCompletions.filter(c => c.status === 'approved');

    const totalCoins = selectedChild.points || 0;
    const choresDone = approvedCompletions.length;
    const dayStreak = selectedChild.streak_days || 0;

    // Calculate Perfect Days (Days with 1+ approved completions)
    const uniqueDates = new Set(
      approvedCompletions.map(c => {
        try {
          return new Date(c.completed_at).toISOString().split('T')[0];
        } catch {
          return '';
        }
      }).filter(Boolean)
    );
    const perfectDays = uniqueDates.size;

    // Weekly day of week breakdown (0: Sun, 1: Mon, ... 6: Sat)
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    approvedCompletions.forEach(c => {
      try {
        const d = new Date(c.completed_at);
        const dayIdx = d.getDay(); // 0 = Sun, 6 = Sat
        dayCounts[dayIdx] += 1;
      } catch {
        // ignore invalid date
      }
    });

    let maxDayCount = Math.max(...dayCounts);
    let peakDayIndex = dayCounts.indexOf(maxDayCount);
    if (peakDayIndex === -1 || maxDayCount === 0) {
      peakDayIndex = 2; // Default Tue display if empty
      maxDayCount = 1;
    }

    // Tasks assigned to child or directory
    const childTasks = tasks.filter(t => t.child_id === selectedChild.id || t.child_id === 'directory' || t.is_template);
    
    // Count completions per task title
    const taskCountMap: Record<string, number> = {};
    approvedCompletions.forEach(c => {
      const task = tasks.find(t => t.id === c.task_id);
      const title = task ? task.title : 'Task';
      taskCountMap[title] = (taskCountMap[title] || 0) + 1;
    });

    // Going well (tasks with > 0 completions)
    const goingWellTasks = Object.entries(taskCountMap)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count);

    // Struggling (active assigned tasks with 0 completions)
    const strugglingSet = new Set<string>();
    childTasks.forEach(t => {
      if (t.title && !taskCountMap[t.title]) {
        strugglingSet.add(t.title);
      }
    });
    const strugglingTasks = Array.from(strugglingSet).map(title => ({ title, count: 0 }));

    // Category Breakdown
    const catMap: Record<string, number> = {
      chores: 0,
      kindness: 0,
      manners: 0,
      feelings: 0,
      learning: 0,
      self_care: 0
    };

    approvedCompletions.forEach(c => {
      const task = tasks.find(t => t.id === c.task_id);
      if (task) {
        const cat = task.category || 'chores';
        catMap[cat] = (catMap[cat] || 0) + 1;
      } else {
        catMap.chores = (catMap.chores || 0) + 1;
      }
    });

    // Format category list
    const categoryCounts = Object.keys(catMap).map(catKey => {
      const meta = CATEGORY_META[catKey] || CATEGORY_META.other;
      return {
        category: catKey,
        label: meta.label,
        count: catMap[catKey] || 0,
        icon: meta.icon,
        color: meta.color
      };
    });

    // Construct Insight Tip
    let insightMessage = '';
    if (strugglingTasks.length > 0) {
      const targetTask = strugglingTasks[0].title;
      insightMessage = `"${targetTask}" is struggling (0 in 30 days). Try a smaller version or add it earlier in the day.`;
    } else if (goingWellTasks.length > 0) {
      const topTask = goingWellTasks[0].title;
      insightMessage = `"${topTask}" is going great (${goingWellTasks[0].count} completions)! Keep up the fantastic routine!`;
    } else {
      insightMessage = `Assign daily chores and routines to start tracking ${selectedChild.name}'s progress insights!`;
    }

    return {
      totalCoins,
      choresDone,
      perfectDays,
      dayStreak,
      dayCounts,
      maxDayCount,
      peakDayIndex,
      categoryCounts,
      goingWellTasks,
      strugglingTasks,
      insightMessage
    };
  }, [selectedChild, tasks, completions]);

  if (!selectedChild || children.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
        <Typography variant="h3" className="text-stone-500 font-bold">No child profiles found.</Typography>
        <Typography variant="body" className="text-stone-400 text-sm mt-1">Add a child to view performance insights.</Typography>
      </div>
    );
  }

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6" id="insights-tab-view">

      {/* Child Selector Pills */}
      {children.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {children.map(child => {
            const isSelected = child.id === selectedChild.id;
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <ChildAvatar iconName={child.avatar_url} className="w-5 h-5" />
                <span>{child.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* What's working for [Child] */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm sm:text-base">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
          <span>What's working for {selectedChild.name}</span>
        </div>

        <div className="bg-white/80 dark:bg-stone-900/80 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/40 text-stone-800 dark:text-stone-200 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5 shadow-xs">
          <span className="text-amber-500 text-base leading-none">💡</span>
          <span>{analytics.insightMessage}</span>
        </div>
      </motion.div>

      {/* 2x2 Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">

        {/* Total Gold Coins */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-4 sm:p-5 text-center shadow-xs flex flex-col items-center justify-center space-y-2"
        >
          <CoinBadge 
            points={analytics.totalCoins} 
            className="w-12 h-12 sm:w-14 sm:h-14 text-sm sm:text-base font-black shadow-sm" 
          />
          <div className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 lowercase tracking-wide">
            total coins
          </div>
        </motion.div>

        {/* Chores Done */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-4 sm:p-5 text-center shadow-xs flex flex-col items-center justify-center space-y-2"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-600 flex items-center justify-center font-black text-base sm:text-lg shadow-sm">
            {analytics.choresDone}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 lowercase tracking-wide">
            chores done
          </div>
        </motion.div>

        {/* Perfect Days */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-4 sm:p-5 text-center shadow-xs flex flex-col items-center justify-center space-y-2"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-300 dark:border-indigo-600 flex items-center justify-center font-black text-base sm:text-lg shadow-sm">
            {analytics.perfectDays}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 lowercase tracking-wide">
            perfect days
          </div>
        </motion.div>

        {/* Day Streak */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-4 sm:p-5 text-center shadow-xs flex flex-col items-center justify-center space-y-2"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border-2 border-orange-300 dark:border-orange-600 flex items-center justify-center font-black text-base sm:text-lg shadow-sm">
            {analytics.dayStreak}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 lowercase tracking-wide">
            day streak
          </div>
        </motion.div>

      </div>

      {/* Best Days Bar Chart */}
      <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xs">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-50 font-bold text-sm sm:text-base">
          <Calendar className="w-5 h-5 text-stone-400" />
          <span>Best days</span>
        </div>

        {/* Weekly Bar Chart Display */}
        <div className="pt-8 pb-2">
          <div className="flex items-end justify-between gap-2 h-36 border-b border-stone-100 dark:border-stone-800 px-2 relative">
            {DAY_LABELS.map((dayName, idx) => {
              const count = analytics.dayCounts[idx];
              const isPeak = idx === analytics.peakDayIndex;
              const maxCount = analytics.maxDayCount || 1;
              const heightPercent = count > 0 ? Math.max(15, Math.round((count / maxCount) * 100)) : 10;

              return (
                <div key={dayName} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Floating Number Label for Peak or non-zero */}
                  {(isPeak || count > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-[11px] font-bold mb-1.5 px-2 py-0.5 rounded-full ${
                        isPeak ? 'bg-rose-500 text-white shadow-xs' : 'text-stone-400'
                      }`}
                    >
                      {count > 0 ? count : (isPeak ? analytics.choresDone || 32 : 0)}
                    </motion.div>
                  )}

                  {/* Bar */}
                  <div
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-500 ${
                      isPeak
                        ? 'bg-rose-500 shadow-md shadow-rose-500/20'
                        : 'bg-stone-200 dark:bg-stone-800 group-hover:bg-stone-300 dark:group-hover:bg-stone-700'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* X Axis Day Labels */}
          <div className="flex justify-between px-2 mt-2">
            {DAY_LABELS.map((dayName, idx) => (
              <span
                key={dayName}
                className={`flex-1 text-center text-[10px] sm:text-xs font-semibold ${
                  idx === analytics.peakDayIndex
                    ? 'text-stone-800 dark:text-stone-200 font-bold'
                    : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                {dayName}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-50 font-bold text-sm sm:text-base mb-2">
          <TrendingUp className="w-5 h-5 text-stone-400" />
          <span>Category breakdown</span>
        </div>

        <div className="space-y-3.5">
          {analytics.categoryCounts.map(cat => {
            const Icon = cat.icon;
            const maxCat = Math.max(...analytics.categoryCounts.map(c => c.count)) || 1;
            const widthPercent = cat.count > 0 ? Math.max(8, Math.round((cat.count / maxCat) * 100)) : 0;

            return (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="font-bold text-stone-700 dark:text-stone-300">{cat.label}</span>
                  </div>
                  <span className="font-bold text-stone-500 dark:text-stone-400 text-xs">{cat.count}</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Going Well Section */}
      <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm sm:text-base">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <span>Going well</span>
        </div>

        <div className="space-y-2">
          {analytics.goingWellTasks.length > 0 ? (
            analytics.goingWellTasks.slice(0, 4).map(item => (
              <div key={item.title} className="flex justify-between items-center text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                <span>{item.title}</span>
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-lg text-xs font-mono">
                  {item.count}x
                </span>
              </div>
            ))
          ) : (
            <div className="text-stone-500 dark:text-stone-400 text-xs italic">
              No tasks completed yet this week. Completing daily tasks will display your top wins here!
            </div>
          )}
        </div>
      </div>

      {/* Struggling Section */}
      <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300 font-bold text-sm sm:text-base">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <span>Struggling</span>
        </div>

        <div className="space-y-2">
          {analytics.strugglingTasks.length > 0 ? (
            analytics.strugglingTasks.slice(0, 4).map(item => (
              <div key={item.title} className="flex justify-between items-center text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                <span>{item.title}</span>
                <span className="text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-lg text-xs font-mono">
                  0x
                </span>
              </div>
            ))
          ) : (
            <div className="text-stone-500 dark:text-stone-400 text-xs italic">
              All tasks are being completed regularly! Fantastic job!
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
