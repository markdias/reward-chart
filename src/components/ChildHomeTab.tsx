import React from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'framer-motion';
import { Child, Task, TaskCompletion, RewardRedemption, Reward } from '../types';
import { getLogicalDateString } from '../utils/date';
import { CATEGORY_ICON_MAP } from '../utils/categories';
import { CoinBadge } from './CoinBadge';
import { CircularProgressBar } from './ProgressBar';
import { Button } from './ui/Button';
import { Bell, Trophy, Sparkles, AlertTriangle } from 'lucide-react';

interface ChildHomeTabProps {
  activeChild: Child;
  tasks: Task[];
  completions: TaskCompletion[];
  redemptions: RewardRedemption[];
  rewards: Reward[];
  handleTaskCheck: (taskId: string, title: string) => void;
  potReminders?: string[];
  onOpenBadges: () => void;
}

export const ChildHomeTab: React.FC<ChildHomeTabProps> = ({
  activeChild,
  tasks,
  completions,
  redemptions,
  rewards,
  handleTaskCheck,
  potReminders = [],
  onOpenBadges
}) => {
  // Daily Goal Logic (Assume 50 points daily goal)
  const DAILY_GOAL = 50;
  
  // Calculate points earned today
  const todayLogicalDate = getLogicalDateString(new Date());
  const todayCompletions = completions.filter(c => 
    c.child_id === activeChild.id &&
    c.status === 'approved' &&
    getLogicalDateString(c.completed_at) === todayLogicalDate
  );

  const pointsEarnedToday = todayCompletions.reduce((acc, c) => {
    // Only count positive points towards the daily goal
    return acc + (c.points_awarded > 0 ? c.points_awarded : 0);
  }, 0);

  const pointsRemaining = Math.max(0, DAILY_GOAL - pointsEarnedToday);
  const progressPercent = Math.min(100, (pointsEarnedToday / DAILY_GOAL) * 100);

  // Combine Recent Activity
  const recentActivities: any[] = [];

  // 1. Add Completions (Positive and Negative)
  todayCompletions.forEach(c => {
    if (c.points_awarded < 0) {
      recentActivities.push({
        id: `comp-${c.id}`,
        title: c.notes || 'Penalty',
        points: c.points_awarded, // already negative
        date: new Date(c.completed_at),
        type: 'penalty'
      });
    } else {
      const task = tasks.find(t => t.id === c.task_id);
      recentActivities.push({
        id: `comp-${c.id}`,
        title: task?.title || 'Unknown Task',
        points: c.points_awarded,
        date: new Date(c.completed_at),
        type: 'earn',
        category: task?.category || 'other'
      });
    }
  });

  // 2. Add Redemptions
  const recentRedemptions = redemptions.filter(r => 
    r.child_id === activeChild.id && 
    getLogicalDateString(r.redeemed_at) === todayLogicalDate
  );
  recentRedemptions.forEach(r => {
    const reward = rewards.find(rw => rw.id === r.reward_id);
    if (reward) {
      recentActivities.push({
        id: `red-${r.id}`,
        title: reward.title,
        points: -reward.cost_points, // Make it negative for UI
        date: new Date(r.redeemed_at),
        type: 'spend'
      });
    }
  });

  // Sort descending by date
  recentActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="child-home-tab"
      className="space-y-6 animate-in fade-in duration-300 w-full"
    >
      {/* Top Cards: Daily Goal and Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Daily Goal Card */}
        <div className="bg-white rounded-3xl p-5 border-2 border-stone-100 shadow-sm flex items-center gap-5 dashboard-card transition-all hover:border-cyan-300">
          <CircularProgressBar progress={progressPercent} className="w-16 h-16 shrink-0">
            <span className="text-[10px] font-bold text-gray-400">PTS</span>
            <span className="text-sm font-black text-slate-800 leading-none">{pointsEarnedToday}</span>
          </CircularProgressBar>
          
          <div>
            <h2 className="text-lg font-black text-slate-900">Daily Goal</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {pointsRemaining > 0 
                ? `You need ${pointsRemaining} more points to reach your daily goal of ${DAILY_GOAL}.`
                : `Awesome! You've reached your daily goal of ${DAILY_GOAL} points!`
              }
            </p>
          </div>
        </div>

        {/* Check Badges Card */}
        <button 
          onClick={onOpenBadges}
          className="bg-white rounded-3xl p-5 border-2 border-stone-100 shadow-sm flex items-center gap-5 dashboard-card transition-all hover:border-amber-300 cursor-pointer text-left group"
        >
          <div className="w-16 h-16 shrink-0 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy className="w-8 h-8 text-amber-500" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Check Badges</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              View your achievements and claim your free rewards!
            </p>
          </div>
        </button>
      </div>

      {/* POT REMINDERS */}
      {potReminders.length > 0 && (
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 shadow-sm text-left flex gap-3 items-start dashboard-card">
          <Bell className="w-5 h-5 text-sky-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex flex-col gap-2 w-full">
            <h3 className="font-bold text-sky-900 text-sm">Don't forget your pots!</h3>
            <ul className="flex flex-col gap-1.5 text-xs text-sky-800/80">
              {potReminders.map((reminder, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="text-sky-400 mt-0.5">•</span>
                  <span>{reminder}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Combined Activity Section */}
      <div className="space-y-4 pt-2">
        <div className="bg-white border-2 border-stone-100 rounded-3xl p-4 shadow-sm text-left dashboard-card transition-all">
          <h2 className="font-black font-display text-base sm:text-lg uppercase tracking-wider text-slate-900">TODAY'S ACTIVITY</h2>
          <p className="text-[10px] sm:text-xs font-mono text-stone-500">Everything you earned, claimed, or lost today.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {recentActivities.length === 0 ? (
            <div className="col-span-full p-8 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-3xl">
              No activity today.
            </div>
          ) : (
            recentActivities.map((act) => {
              let bgClass = "bg-stone-50 border-stone-100";
              let iconBgClass = "bg-stone-200/50 text-stone-400";
              let textClass = "text-stone-400";
              let iconContent: React.ReactNode = <Sparkles className="w-6 h-6" />;

              if (act.type === 'earn') {
                const catMeta = CATEGORY_ICON_MAP[act.category as any] || CATEGORY_ICON_MAP.other;
                iconContent = <catMeta.Icon className="w-6 h-6" />;
                bgClass = `${catMeta.bg} bg-opacity-50`;
                iconBgClass = `bg-white/60 ${catMeta.iconColor}`;
                textClass = catMeta.iconColor;
              } else if (act.type === 'spend') {
                bgClass = "bg-purple-50/50 border-purple-100";
                iconBgClass = "bg-purple-100 text-purple-400";
                textClass = "text-purple-600";
                iconContent = <Trophy className="w-6 h-6" />;
              } else if (act.type === 'penalty') {
                bgClass = "bg-rose-50/50 border-rose-100";
                iconBgClass = "bg-rose-100 text-rose-400";
                textClass = "text-rose-600";
                iconContent = <AlertTriangle className="w-6 h-6" />;
              }

              return (
                <div key={act.id} className={`relative p-4 rounded-[1.5rem] border-2 shadow-sm flex flex-col items-center text-center gap-3 opacity-90 transition-all dashboard-card hover:-translate-y-1 ${bgClass}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBgClass}`}>
                    {iconContent}
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <h3 className={`font-bold text-sm sm:text-base leading-tight ${act.type === 'earn' ? 'line-through opacity-70' : ''} ${textClass}`}>
                      {act.title}
                    </h3>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                      {act.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="mt-auto pt-2 w-full flex justify-center">
                    <CoinBadge points={act.points} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </motion.div>
  );
};
