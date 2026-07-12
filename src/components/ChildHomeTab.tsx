import React from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'motion/react';
import { Child, Task, TaskCompletion, RewardRedemption, Reward, ParentProfile } from '../types';
import { getLogicalDateString } from '../utils/date';
import { CATEGORY_ICON_MAP } from '../utils/categories';
import { CoinBadge } from './CoinBadge';
import { CircularProgressBar } from './ProgressBar';
import { Button } from './ui/Button';
import { Bell, Trophy, Sparkles, AlertTriangle, Coins } from 'lucide-react';
import { ActivityFeed } from './ui/ActivityFeed';

interface ChildHomeTabProps {
  activeChild: Child;
  tasks: Task[];
  completions: TaskCompletion[];
  redemptions: RewardRedemption[];
  rewards: Reward[];
  handleTaskCheck: (taskId: string, title: string) => void;
  potReminders?: string[];
  onOpenBadges: () => void;
  parentProfile?: ParentProfile | null;
}

export const ChildHomeTab: React.FC<ChildHomeTabProps> = ({
  activeChild,
  tasks,
  completions,
  redemptions,
  rewards,
  handleTaskCheck,
  potReminders = [],
  onOpenBadges,
  parentProfile
}) => {
  // Daily Goal Logic
  const DAILY_GOAL = parentProfile?.daily_points_target ?? 50;
  
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
        type: 'task',
        status: 'completed',
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
        points: reward.cost_points, // ActivityCard will handle negative display
        date: new Date(r.redeemed_at),
        type: 'reward',
        status: 'delivered'
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
        <div 
          className="relative p-1.5 rounded-[1.75rem] transition-transform duration-200 flex shadow-xl overflow-hidden hover:-translate-y-1"
          style={{ background: 'repeating-linear-gradient(45deg, #06b6d4, #06b6d4 10px, #22d3ee 10px, #22d3ee 20px, #0891b2 20px, #0891b2 30px)' }}
        >
          <div className="relative z-10 w-full h-full bg-white rounded-[1.4rem] p-4 sm:p-5 flex items-center gap-4 border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
              <div className="transform scale-[1.25] sm:scale-[1.35]">
                <CoinBadge points={pointsEarnedToday} />
              </div>
            </div>
            
            <div>
              <Typography variant="h2" className="text-lg font-bold text-stone-900 mb-1">Daily Goal</Typography>
              <p className="text-[10px] sm:text-xs text-stone-500 font-sans">
                {pointsRemaining > 0 
                  ? `You need ${pointsRemaining} more gold coins to reach your daily goal of ${DAILY_GOAL}.`
                  : `Awesome! You've reached your daily goal of ${DAILY_GOAL} gold coins!`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Check Badges Card */}
        <button 
          onClick={onOpenBadges}
          className="relative p-1.5 rounded-[1.75rem] transition-transform duration-200 flex shadow-xl overflow-hidden cursor-pointer hover:-translate-y-1 text-left group w-full"
          style={{ background: 'repeating-linear-gradient(-45deg, #f59e0b, #f59e0b 10px, #fbbf24 10px, #fbbf24 20px, #d97706 20px, #d97706 30px)' }}
        >
          <div className="relative z-10 w-full h-full bg-white rounded-[1.4rem] p-4 sm:p-5 flex items-center gap-4 border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-[1rem] bg-amber-100 border-2 border-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" fill="currentColor" />
            </div>
            <div>
              <Typography variant="h2" className="text-lg font-bold text-stone-900 mb-1">Check Badges</Typography>
              <p className="text-[10px] sm:text-xs text-stone-500 font-sans">
                View your achievements and claim your free rewards!
              </p>
            </div>
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
        <Typography variant="h3" className="text-lg font-bold text-stone-900 px-1 mb-3 mt-6">Today's Activity</Typography>
        
        <ActivityFeed 
          activities={recentActivities} 
          emptyMessage="No activity today." 
          className="space-y-2"
        />
      </div>

    </motion.div>
  );
};
