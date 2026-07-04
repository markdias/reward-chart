import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { motion, AnimatePresence } from 'framer-motion';
import { Child, Task, TaskCompletion, RewardRedemption, Reward } from '../types';
import { getLogicalDateString } from '../utils/date';
import { CATEGORY_ICON_MAP } from '../utils/categories';
import { CoinBadge } from './CoinBadge';
import { CircularProgressBar } from './ProgressBar';
import { Button } from './ui/Button';

interface ChildHomeTabProps {
  activeChild: Child;
  tasks: Task[];
  completions: TaskCompletion[];
  redemptions: RewardRedemption[];
  rewards: Reward[];
  handleTaskCheck: (taskId: string, title: string) => void;
}

export const ChildHomeTab: React.FC<ChildHomeTabProps> = ({
  activeChild,
  tasks,
  completions,
  redemptions,
  rewards,
  handleTaskCheck
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

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
    const task = tasks.find(t => t.id === c.task_id);
    return acc + (task?.points || 0);
  }, 0);

  const pointsRemaining = Math.max(0, DAILY_GOAL - pointsEarnedToday);
  const progressPercent = Math.min(100, (pointsEarnedToday / DAILY_GOAL) * 100);

  // Categories for the filter
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'chores', label: 'Chores' },
    { id: 'homework', label: 'Homework' },
    { id: 'health', label: 'Health' },
    { id: 'creative', label: 'Creative' },
    { id: 'behavior', label: 'Behavior' }
  ];

  // Filter Tasks to only show COMPLETED tasks for today
  const filteredTasks = tasks.filter(t => {
    if (t.child_id !== activeChild.id) return false;
    if (activeCategory !== 'all' && t.category !== activeCategory) return false;
    
    // Only show tasks that are completed today
    const isDoneToday = completions.some(c => c.task_id === t.id && c.child_id === activeChild.id && c.status === 'approved' && getLogicalDateString(c.completed_at) === todayLogicalDate);
    
    return isDoneToday;
  });

  // Recent Activity logic: combine recent completions and redemptions
  const recentActivities = [];

  todayCompletions.forEach(c => {
    const task = tasks.find(t => t.id === c.task_id);
    if (task) {
      recentActivities.push({
        id: `comp-${c.id}`,
        title: task.title,
        points: task.points,
        date: new Date(c.completed_at),
        type: 'earn'
      });
    }
  });

  const recentRedemptions = redemptions.filter(r => r.child_id === activeChild.id);
  recentRedemptions.forEach(r => {
    const reward = rewards.find(rw => rw.id === r.reward_id);
    if (reward) {
      recentActivities.push({
        id: `red-${r.id}`,
        title: reward.title,
        points: -reward.cost,
        date: new Date(r.redeemed_at),
        type: 'spend'
      });
    }
  });

  // Sort descending by date, take top 5
  recentActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const topActivities = recentActivities.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="child-home-tab"
      className="space-y-6 animate-in fade-in duration-300 w-full"
    >
      {/* Daily Goal Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-5">
        {/* Circular Progress */}
        <CircularProgressBar progress={progressPercent} className="w-16 h-16">
          <span className="text-[10px] font-bold text-gray-400">PTS</span>
          <span className="text-sm font-black text-slate-800 leading-none">{pointsEarnedToday}</span>
        </CircularProgressBar>
        
        <div>
          <h2 className="text-lg font-black text-slate-900">Daily Goal</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {pointsRemaining > 0 
              ? `You need ${pointsRemaining} more points to reach your daily goal of ${DAILY_GOAL}.`
              : `Awesome! You've reached your daily goal of ${DAILY_GOAL} points!`
            }
          </p>
        </div>
      </div>

      {/* Completed Tasks Section */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 shadow-sm text-left">
          <h2 className="font-black font-display text-base sm:text-lg uppercase tracking-wider text-slate-900">COMPLETED TASKS</h2>
          <p className="text-[10px] sm:text-xs font-mono text-stone-500">Great job finishing these tasks today!</p>
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'dark' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-3xl">
              No tasks completed in this category today.
            </div>
          ) : (
            filteredTasks.map(task => {
              const comp = completions.find(c => c.task_id === task.id && c.child_id === activeChild.id && getLogicalDateString(c.completed_at) === todayLogicalDate);
              const isDone = comp && comp.status === 'approved';
              const catMeta = CATEGORY_ICON_MAP[task.category] || CATEGORY_ICON_MAP.other;

              return (
                <button
                  key={task.id}
                  onClick={() => !isDone && handleTaskCheck(task.id, task.title)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isDone ? 'bg-gray-50 border-gray-100 opacity-75' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                      <catMeta.Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isDone ? 'text-gray-400' : 'text-slate-700'}`} />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isDone ? 'text-gray-400' : 'text-gray-500'}`}>
                        {catMeta.label}
                      </span>
                      <h4 className={`font-bold text-sm sm:text-base truncate ${isDone ? 'line-through text-gray-400' : 'text-slate-900'}`}>
                        {task.title}
                      </h4>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center">
                    {/* Points bubble */}
                    <div className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full text-xs sm:text-sm font-bold border-2 shrink-0 ${
                      isDone ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-emerald-50 text-emerald-600 border-emerald-300'
                    }`}>
                      {task.points}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {topActivities.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 shadow-sm text-left">
            <h2 className="font-black font-display text-base sm:text-lg uppercase tracking-wider text-slate-900">RECENT ACTIVITY</h2>
            <p className="text-[10px] sm:text-xs font-mono text-stone-500">Track your recent earnings and spends!</p>
          </div>
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-4">
            {topActivities.map((act, idx) => (
              <div key={act.id} className={`flex justify-between items-center ${idx !== topActivities.length - 1 ? 'border-b border-gray-50 pb-4' : ''}`}>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">{act.type === 'earn' ? '✨ ' : '🛍️ '}{act.title}</span>
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {act.date.toLocaleDateString()} AT {act.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`text-sm font-bold ${act.type === 'earn' ? 'text-emerald-500' : 'text-rose-400 line-through'}`}>
                  {act.type === 'earn' ? '+' : ''}{act.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </motion.div>
  );
};
