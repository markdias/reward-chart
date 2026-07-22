import React, { useState, useMemo, useEffect } from 'react';
import { Typography } from './ui/Typography';
import { Modal } from './ui/Modal';
import { motion } from 'motion/react';
import { Child, Task, TaskCompletion, RewardRedemption, Reward, ParentProfile } from '../types';
import { getLogicalDateString, getCurrentWeekKey } from '../utils/date';
import { FaCircleCheck, FaWandMagicSparkles, FaCalendarCheck, FaBone, FaWrench, FaPiggyBank, FaGift } from 'react-icons/fa6';
import { getPetStripeBackground } from './ArcadeTicketCard';
import { CATEGORY_ICON_MAP } from '../utils/categories';
import { CoinBadge } from './CoinBadge';
import { CircularProgressBar } from './ProgressBar';
import { Button } from './ui/Button';
import { Bell, Trophy, Sparkles, AlertTriangle, Coins, Award, Star, Zap, Droplets, Target, BookOpen, Heart, Activity, Palette, CheckCircle, Shield, Clock, TrendingUp, Anchor, Coffee, Compass, Sun, Moon, Map, Camera, Music, Play, Flag, Crown, Gem, Medal, ChevronRight, Flame, X, Gift } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase';
import { ActivityFeed } from './ui/ActivityFeed';
import { ActivityCard, ActivityType, ActivityStatus } from './ui/ActivityCard';

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
  onEnterParentMode?: (targetTab?: any, targetSubTab?: any) => void;
  onNavigateTab?: (tab: 'home' | 'companion' | 'tasks' | 'rewards' | 'pots') => void;
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
  parentProfile,
  onEnterParentMode,
  onNavigateTab
}) => {
  const [historyType, setHistoryType] = useState<'today' | 'full' | null>(null);
  const [isGiftingBannerDismissed, setIsGiftingBannerDismissed] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);
  const [childBadges, setChildBadges] = useState<any[]>([]);
  const [routinePeriodFilter, setRoutinePeriodFilter] = useState<'auto' | 'morning' | 'afternoon' | 'evening' | 'all'>('auto');

  useEffect(() => {
    const fetchBadges = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data: bData } = await supabase.from('badges').select('id, icon_name');
      if (bData) setBadges(bData);
      
      const { data: cbData } = await supabase.from('child_badges').select('*').eq('child_id', activeChild.id);
      if (cbData) setChildBadges(cbData);
    };
    fetchBadges();
  }, [activeChild.id]);

  const ICON_MAP: Record<string, React.FC<any>> = {
    Award, Star, Zap, Droplets, Target, Sparkles, BookOpen, Heart, Activity, Palette, CheckCircle, Shield, Clock, TrendingUp, Anchor, Coffee, Compass, Sun, Moon, Map, Camera, Music, Play, Flag, Trophy, Crown, Gem, Medal
  };

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
  const recentActivities: any[] = useMemo(() => {
    const acts: any[] = [];
    todayCompletions.forEach(c => {
      if (c.points_awarded < 0 || c.task_id === 'penalty') {
        acts.push({
          id: `comp-${c.id}`,
          title: c.notes || 'Penalty',
          points: c.points_awarded,
          date: new Date(c.completed_at),
          type: 'penalty'
        });
      } else if (c.task_id === 'bonus') {
        acts.push({
          id: `comp-${c.id}`,
          title: c.notes || 'Good Work Bonus',
          points: c.points_awarded,
          date: new Date(c.completed_at),
          type: 'task',
          status: 'completed',
          category: 'other'
        });
      } else {
        const task = tasks.find(t => t.id === c.task_id);
        acts.push({
          id: `comp-${c.id}`,
          title: task?.title || c.notes || 'Task Completed',
          points: c.points_awarded ?? (task?.points || 0),
          date: new Date(c.completed_at),
          type: 'task',
          status: 'completed',
          category: task?.category || 'other'
        });
      }
    });

    const recentRedemptions = redemptions.filter(r => 
      r.child_id === activeChild.id && 
      getLogicalDateString(r.redeemed_at) === todayLogicalDate
    );
    recentRedemptions.forEach(r => {
      const reward = rewards.find(rw => rw.id === r.reward_id);
      if (reward) {
        let pointsOverride: React.ReactNode = undefined;
        if (r.payment_source?.startsWith('badge_freebie:')) {
          const badgeId = r.payment_source.split(':')[1];
          const badge = badges.find(b => b.id === badgeId);
          if (badge && ICON_MAP[badge.icon_name]) {
            const Icon = ICON_MAP[badge.icon_name];
            pointsOverride = <Icon className="w-1/2 h-1/2" />;
          } else {
            pointsOverride = <Trophy className="w-1/2 h-1/2" />;
          }
        } else if (r.payment_source === 'badge_freebie') {
            let closestBadge = null;
            let minDiff = Infinity;
            childBadges.forEach(cb => {
              const diff = Math.abs(new Date(cb.unlocked_at).getTime() - new Date(r.redeemed_at).getTime());
              if (diff < minDiff) {
                minDiff = diff;
                closestBadge = cb;
              }
            });
            if (closestBadge) {
              const badge = badges.find(b => b.id === closestBadge.badge_id);
              if (badge && ICON_MAP[badge.icon_name]) {
                const Icon = ICON_MAP[badge.icon_name];
                pointsOverride = <Icon className="w-1/2 h-1/2" />;
              }
            }
            if (!pointsOverride) pointsOverride = <Trophy className="w-1/2 h-1/2" />;
        }

        acts.push({
          id: `red-${r.id}`,
          title: reward.title,
          points: reward.cost_points,
          date: new Date(r.redeemed_at),
          type: 'reward',
          status: r.status === 'approved' ? 'approved' : 'delivered',
          pointsOverride
        });
      }
    });

    acts.sort((a, b) => b.date.getTime() - a.date.getTime());
    return acts;
  }, [todayCompletions, redemptions, activeChild.id, tasks, rewards, todayLogicalDate]);

  const fullActivities: any[] = useMemo(() => {
    if (historyType !== 'full') return [];
    const acts: any[] = [];
    const childCompletions = completions.filter(c => c.child_id === activeChild.id && c.status === 'approved');
    childCompletions.forEach(c => {
      if (c.points_awarded < 0 || c.task_id === 'penalty') {
        acts.push({
          id: `comp-${c.id}`,
          title: c.notes || 'Penalty',
          points: c.points_awarded,
          date: new Date(c.completed_at),
          type: 'penalty'
        });
      } else if (c.task_id === 'bonus') {
        acts.push({
          id: `comp-${c.id}`,
          title: c.notes || 'Good Work Bonus',
          points: c.points_awarded,
          date: new Date(c.completed_at),
          type: 'task',
          status: 'completed',
          category: 'other'
        });
      } else {
        const task = tasks.find(t => t.id === c.task_id);
        acts.push({
          id: `comp-${c.id}`,
          title: task?.title || c.notes || 'Task Completed',
          points: c.points_awarded ?? (task?.points || 0),
          date: new Date(c.completed_at),
          type: 'task',
          status: 'completed',
          category: task?.category || 'other'
        });
      }
    });

    const childRedemptions = redemptions.filter(r => r.child_id === activeChild.id);
    childRedemptions.forEach(r => {
      const reward = rewards.find(rw => rw.id === r.reward_id);
      if (reward) {
        let pointsOverride: React.ReactNode = undefined;
        if (r.payment_source?.startsWith('badge_freebie:')) {
          const badgeId = r.payment_source.split(':')[1];
          const badge = badges.find(b => b.id === badgeId);
          if (badge && ICON_MAP[badge.icon_name]) {
            const Icon = ICON_MAP[badge.icon_name];
            pointsOverride = <Icon className="w-1/2 h-1/2" />;
          } else {
            pointsOverride = <Trophy className="w-1/2 h-1/2" />;
          }
        } else if (r.payment_source === 'badge_freebie') {
            let closestBadge = null;
            let minDiff = Infinity;
            childBadges.forEach(cb => {
              const diff = Math.abs(new Date(cb.unlocked_at).getTime() - new Date(r.redeemed_at).getTime());
              if (diff < minDiff) {
                minDiff = diff;
                closestBadge = cb;
              }
            });
            if (closestBadge) {
              const badge = badges.find(b => b.id === closestBadge.badge_id);
              if (badge && ICON_MAP[badge.icon_name]) {
                const Icon = ICON_MAP[badge.icon_name];
                pointsOverride = <Icon className="w-1/2 h-1/2" />;
              }
            }
            if (!pointsOverride) pointsOverride = <Trophy className="w-1/2 h-1/2" />;
        }

        acts.push({
          id: `red-${r.id}`,
          title: reward.title,
          points: reward.cost_points,
          date: new Date(r.redeemed_at),
          type: 'reward',
          status: r.status === 'approved' ? 'approved' : 'delivered',
          pointsOverride
        });
      }
    });

    acts.sort((a, b) => b.date.getTime() - a.date.getTime());
    return acts;
  }, [historyType, completions, redemptions, activeChild.id, tasks, rewards]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="child-home-tab"
      className="space-y-6 animate-in fade-in duration-300 w-full"
    >
      {/* 3-Column Top Widgets */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        {/* Streak Widget */}
        <button 
          onClick={() => setHistoryType('today')}
          className="relative p-1.5 rounded-[1.75rem] transition-transform duration-200 flex shadow-lg overflow-hidden cursor-pointer hover:-translate-y-1 active:scale-[0.96] text-center w-full focus:outline-none group/streak" 
          style={{ background: 'repeating-linear-gradient(45deg, #fb923c, #fb923c 8px, #f97316 8px, #f97316 16px)' }}
        >
          <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[1.4rem] p-2.5 sm:p-3 flex flex-col items-center justify-center border-[3px] border-stone-900 shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)]">
            <div className="absolute top-2 right-2 opacity-40 group-hover/streak:opacity-100 group-hover/streak:translate-x-0.5 transition-all">
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" strokeWidth={3} />
            </div>
            <Flame className={`w-5 h-5 sm:w-7 sm:h-7 mb-1 ${activeChild.streak_days > 0 ? 'text-orange-500 flame-active' : 'text-stone-300'}`} />
            <span className={`font-black text-sm sm:text-base ${activeChild.streak_days > 0 ? 'text-orange-600' : 'text-stone-400'}`}>{activeChild.streak_days}</span>
            <span className="text-[8px] sm:text-[10px] font-sans font-bold text-stone-500 dark:text-stone-400 uppercase tracking-tighter mt-0.5">Day Streak</span>
          </div>
        </button>

        {/* Current Total Widget */}
        <button 
          onClick={() => setHistoryType('full')}
          className="relative p-1.5 rounded-[1.75rem] transition-transform duration-200 flex shadow-lg overflow-hidden cursor-pointer hover:-translate-y-1 active:scale-[0.96] text-center w-full focus:outline-none group/coins"
          style={{ background: 'repeating-linear-gradient(45deg, #22d3ee, #22d3ee 8px, #06b6d4 8px, #06b6d4 16px)' }}
        >
          <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[1.4rem] p-2.5 sm:p-3 flex flex-col items-center justify-center border-[3px] border-stone-900 shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)]">
            <div className="absolute top-2 right-2 opacity-40 group-hover/coins:opacity-100 group-hover/coins:translate-x-0.5 transition-all">
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" strokeWidth={3} />
            </div>
            <Coins className={`w-5 h-5 sm:w-7 sm:h-7 mb-1 ${activeChild.points > 0 ? 'text-cyan-500' : 'text-stone-300'}`} />
            <span className={`font-black text-sm sm:text-base ${activeChild.points > 0 ? 'text-cyan-600' : 'text-stone-400'}`}>{activeChild.points}</span>
            <span className="text-[8px] sm:text-[10px] font-sans font-bold text-stone-500 dark:text-stone-400 uppercase tracking-tighter mt-0.5">Total Coins</span>
          </div>
        </button>

        {/* Badges Widget */}
        <button 
          onClick={onOpenBadges}
          className="relative p-1.5 rounded-[1.75rem] transition-transform duration-200 flex shadow-lg overflow-hidden cursor-pointer hover:-translate-y-1 active:scale-[0.96] text-center w-full focus:outline-none group/badge"
          style={{ background: 'repeating-linear-gradient(45deg, #c084fc, #c084fc 8px, #a855f7 8px, #a855f7 16px)' }}
        >
          <div className="relative z-10 w-full h-full bg-white dark:bg-stone-900 rounded-[1.4rem] p-2.5 sm:p-3 flex flex-col items-center justify-center border-[3px] border-stone-900 shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)]">
            <div className="absolute top-2 right-2 opacity-40 group-hover/badge:opacity-100 group-hover/badge:translate-x-0.5 transition-all">
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" strokeWidth={3} />
            </div>
            <Trophy className={`w-5 h-5 sm:w-7 sm:h-7 mb-1 ${childBadges.length > 0 ? 'text-purple-500 group-hover/badge:scale-110 transition-transform' : 'text-stone-300 group-hover/badge:scale-110 transition-transform'}`} />
            <span className={`font-black text-sm sm:text-base ${childBadges.length > 0 ? 'text-purple-600' : 'text-stone-400'}`}>{childBadges.length}</span>
            <span className="text-[8px] sm:text-[10px] font-sans font-bold text-stone-500 dark:text-stone-400 uppercase tracking-tighter mt-0.5">Badges</span>
          </div>
        </button>
      </div>

      {/* Approved Rewards Banner */}
      {(() => {
        const approvedRedemptions = redemptions.filter(r => r.child_id === activeChild.id && r.status === 'approved');
        if (approvedRedemptions.length === 0) return null;

        return (
          <div className="w-full bg-white dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-800 rounded-[1.6rem] p-4 sm:p-5 shadow-sm space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Typography variant="h4" className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-50 leading-tight">
                    Reward Approved!
                  </Typography>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Waiting for Parent
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-sans mt-0.5 font-medium">
                  Your parent approved your reward! Ask them to hand it to you:
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              {approvedRedemptions.map(r => {
                const reward = rewards.find(rw => rw.id === r.reward_id);
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-50">
                        {reward?.title || 'Reward'}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Ready for pickup
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Gifting Banner */}
      {(() => {
        const currentGifts = activeChild.gifts_made || 0;
        const dismissedKey = `gifting_banner_dismissed_count_${activeChild.id}`;
        const lastDismissedCount = parseInt(localStorage.getItem(dismissedKey) || '-1', 10);
        
        // Show banner if child has gifted coins (> 0), it hasn't been manually closed for current gift count, and component state isn't dismissed
        if (currentGifts === 0 || lastDismissedCount >= currentGifts || isGiftingBannerDismissed) {
          return null;
        }

        return (
          <div
            onClick={() => onNavigateTab?.('pots')}
            className="w-full relative p-[3px] rounded-[1.6rem] shadow-md mb-2 group text-left cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none"
            style={{ background: 'repeating-linear-gradient(45deg, #a855f7, #a855f7 10px, #ec4899 10px, #ec4899 20px, #f43f5e 20px, #f43f5e 30px)' }}
          >
            <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 rounded-[1.4rem] p-3 sm:p-3.5 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-rose-500 text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform">
                  <FaGift className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Typography variant="h4" className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-50 leading-tight">
                      Well done! 🎉 Gifting Pot
                    </Typography>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {currentGifts} {currentGifts === 1 ? 'gift' : 'gifts'} made!
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-sans mt-0.5 font-medium">
                    Awesome kindness! You've given back to others.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <div className="bg-stone-100 dark:bg-stone-800 p-1.5 rounded-lg text-stone-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  <ChevronRight className="w-4 h-4" strokeWidth={3} />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    localStorage.setItem(dismissedKey, currentGifts.toString());
                    setIsGiftingBannerDismissed(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* POT REMINDERS */}
      {potReminders.length > 0 && (
        <div className="w-full rounded-[1.6rem] p-[3px] shadow-md mb-2" style={{ background: getPetStripeBackground(activeChild.character_id) }}>
          <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 rounded-[1.4rem] p-4 sm:p-5 flex flex-col gap-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3">
              <div className="bg-stone-100 dark:bg-stone-800 p-2 rounded-xl shrink-0 shadow-inner">
                <Bell className="w-5 h-5 text-stone-700 dark:text-stone-200 animate-pulse" />
              </div>
              <Typography variant="h3" className="text-lg font-bold text-stone-900 dark:text-stone-50 leading-tight tracking-tight">
                Needs Attention!
              </Typography>
            </div>
            <div className="flex flex-col gap-2 w-full mt-1">
              {potReminders.map((reminder, idx) => {
                let Icon: React.ElementType = Bell;
                let colorClass = "bg-stone-100 text-stone-600 border-stone-200";
                
                if (reminder.startsWith('Food Pot')) {
                  Icon = FaBone;
                  colorClass = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
                } else if (reminder.startsWith('Maintenance Pot')) {
                  Icon = FaWrench;
                  colorClass = "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
                } else if (reminder.startsWith('Savings Pot')) {
                  Icon = FaPiggyBank;
                  colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
                } else if (reminder.startsWith('Gifting Pot')) {
                  Icon = FaGift;
                  colorClass = "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50";
                }

                return (
                  <div 
                    key={idx} 
                    onClick={() => onNavigateTab?.('pots')}
                    className={`flex items-center gap-2 p-2 rounded-xl border shadow-sm ${colorClass} ${onNavigateTab ? 'cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-sans font-bold text-xs text-inherit">
                        {reminder}
                      </p>
                    </div>
                    {onNavigateTab && (
                      <ChevronRight className="w-4 h-4 opacity-60 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Routine Section */}
      {(() => {
        if (!activeChild.routines) return null;

        const DEFAULT_ROUTINES = [
          { id: 'weekday', name: 'Weekday Routine' },
          { id: 'weekend', name: 'Weekend Routine' },
          { id: 'holiday', name: 'Holiday Routine' }
        ];

        const currentRoutines = activeChild.routines || [];
        const processedRoutines = DEFAULT_ROUTINES.map(def => {
          let existing = currentRoutines.find(r => r.id === def.id);
          if (!existing) {
            existing = currentRoutines.find(r => r.name?.toLowerCase().includes(def.id));
            if (existing) existing = { ...existing, id: def.id, name: def.name };
          }
          if (!existing && def.id === 'weekday' && currentRoutines.length > 0) {
            const unassigned = currentRoutines.find(r => !DEFAULT_ROUTINES.some(d => d.id === r.id || r.name?.toLowerCase().includes(d.id)));
            if (unassigned) existing = { ...unassigned, id: def.id, name: def.name };
          }
          return existing || { ...def, morningTaskIds: [], afternoonTaskIds: [], eveningTaskIds: [] };
        });

        const dayOfWeek = new Date().getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const activeRoutineId = activeChild.holiday_mode ? 'holiday' : (isWeekend ? 'weekend' : 'weekday');

        let activeRoutine = processedRoutines.find(r => r.id === activeRoutineId);

        let globalTaskIndex = 1;

        const renderPeriod = (title: string, taskIds: string[]) => {
          const routineTasks = taskIds
            .map(id => tasks.find(t => t.id === id && t.child_id === activeChild.id))
            .filter((t): t is Task => t !== undefined);

          if (routineTasks.length === 0) return null;

          return (
            <div className="mb-6 space-y-2">
              <Typography variant="h4" className="text-sm font-bold text-stone-600 dark:text-stone-300 px-1 uppercase tracking-widest">{title}</Typography>
              <div className="space-y-2">
                {routineTasks.map((task) => {
                  const currentTaskIndex = globalTaskIndex++;
                  const RECURRENCE_LABEL: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', one_time: 'One-off', repeatable: 'Repeatable' };
                  let compl = null;
                  if (task.recurrence === 'daily') {
                    compl = completions.find(c => c.task_id === task.id && c.child_id === activeChild.id && getLogicalDateString(c.completed_at) === getLogicalDateString(new Date()));
                  } else if (task.recurrence === 'weekly') {
                    compl = completions.find(c => c.task_id === task.id && c.child_id === activeChild.id && getCurrentWeekKey(new Date(c.completed_at)) === getCurrentWeekKey(new Date()));
                  } else if (task.recurrence === 'one_time') {
                    compl = completions.find(c => c.task_id === task.id && c.child_id === activeChild.id);
                  }

                  const isPending = compl && compl.status === 'pending';
                  const isApproved = compl && compl.status === 'approved';

                  let isOnCooldown = false;
                  let cooldownTimeLeftStr = '';
                  if (task.recurrence === 'repeatable' && task.cooldown_minutes) {
                    const taskComps = completions
                      .filter(c => c.task_id === task.id && c.child_id === activeChild.id)
                      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
                    
                    if (taskComps.length > 0) {
                      const msSince = new Date().getTime() - new Date(taskComps[0].completed_at).getTime();
                      const cooldownMs = task.cooldown_minutes * 60 * 1000;
                      if (msSince < cooldownMs) {
                        isOnCooldown = true;
                        const minsLeft = Math.ceil((cooldownMs - msSince) / 60000);
                        cooldownTimeLeftStr = `${minsLeft}m`;
                      }
                    }
                  }

                  const isCompletable = !isApproved && !isPending && !isOnCooldown;
                  let statusStr: ActivityStatus = 'pending';
                  if (isApproved) statusStr = 'approved';
                  else if (isPending) statusStr = 'pending';

                  const cardContent = (
                    <ActivityCard
                      title={task.title}
                      subtitle={isOnCooldown ? `Cooldown: ${cooldownTimeLeftStr}` : undefined}
                      points={task.points}
                      type="task"
                      status={isApproved ? 'completed' : 'pending'}
                      category={task.category}
                      numberBadge={currentTaskIndex}
                      actions={
                        isCompletable ? (
                          <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 flex items-center justify-center text-stone-400 group-hover:text-emerald-500 group-hover:bg-emerald-100 transition-colors border-2 border-stone-200 dark:border-stone-700">
                            <span className="sr-only">Complete</span>
                          </div>
                        ) : isApproved ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 border-2 border-emerald-200">
                            <FaCircleCheck className="w-4 h-4" />
                          </div>
                        ) : null
                      }
                    />
                  );

                  return isCompletable ? (
                    <button
                      key={task.id}
                      onClick={() => handleTaskCheck(task.id, task.title)}
                      className={`w-full text-left group ${currentTaskIndex === 1 ? 'joyride-target-first-routine' : ''}`}
                    >
                      {cardContent}
                    </button>
                  ) : (
                    <div key={task.id} className={`opacity-60 grayscale pointer-events-none ${currentTaskIndex === 1 ? 'joyride-target-first-routine' : ''}`}>
                      {cardContent}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        };
        const currentHour = new Date().getHours();
        const timeOfDayPeriod: 'morning' | 'afternoon' | 'evening' = 
          (currentHour >= 12 && currentHour < 17) ? 'afternoon' : 
          (currentHour >= 17) ? 'evening' : 'morning';

        const effectivePeriod = routinePeriodFilter === 'auto' ? timeOfDayPeriod : routinePeriodFilter;

        const morningTaskIds = activeRoutine.morningTaskIds || [];
        const afternoonTaskIds = activeRoutine.afternoonTaskIds || [];
        const eveningTaskIds = activeRoutine.eveningTaskIds || [];

        const hasMorningTasks = morningTaskIds.some(id => tasks.some(t => t.id === id && t.child_id === activeChild.id));
        const hasAfternoonTasks = afternoonTaskIds.some(id => tasks.some(t => t.id === id && t.child_id === activeChild.id));
        const hasEveningTasks = eveningTaskIds.some(id => tasks.some(t => t.id === id && t.child_id === activeChild.id));
        const hasAnyTasksInRoutine = hasMorningTasks || hasAfternoonTasks || hasEveningTasks;

        const routineDisplayName = activeRoutine.name.toLowerCase().includes('routine') 
          ? activeRoutine.name 
          : `${activeRoutine.name} Routine`;

        const renderFilteredTasks = () => {
          if (!hasAnyTasksInRoutine) {
            return (
              <div className="relative p-6 rounded-2xl sm:rounded-3xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-white/50 dark:bg-stone-900/50 flex flex-col items-center justify-center text-center space-y-3 mt-4">
                <div className={`joyride-target-first-routine p-8 text-center bg-stone-50 dark:bg-stone-800/50 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-3xl space-y-2`}>
                  <FaCalendarCheck className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                  <Typography variant="h4" className="font-bold text-stone-400 dark:text-stone-500 text-sm">NO TASKS IN ROUTINE</Typography>
                  <Typography variant="body" className="text-xs text-stone-400 dark:text-stone-500 max-w-xs mx-auto">
                    Ask your parents to assign tasks to this routine!
                  </Typography>
                </div>
              </div>
            );
          }

          if (effectivePeriod === 'all') {
            return (
              <>
                {renderPeriod("Morning", morningTaskIds)}
                {renderPeriod("Afternoon", afternoonTaskIds)}
                {renderPeriod("Evening", eveningTaskIds)}
              </>
            );
          }

          if (effectivePeriod === 'morning') {
            if (hasMorningTasks) return renderPeriod("Morning", morningTaskIds);
            return (
              <div className="p-6 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700 my-2">
                <Typography variant="body" className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                  No Morning tasks in this routine.
                </Typography>
                <button
                  onClick={() => setRoutinePeriodFilter('all')}
                  className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
                >
                  View All Routine Tasks
                </button>
              </div>
            );
          }

          if (effectivePeriod === 'afternoon') {
            if (hasAfternoonTasks) return renderPeriod("Afternoon", afternoonTaskIds);
            return (
              <div className="p-6 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700 my-2">
                <Typography variant="body" className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                  No Afternoon tasks in this routine.
                </Typography>
                <button
                  onClick={() => setRoutinePeriodFilter('all')}
                  className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
                >
                  View All Routine Tasks
                </button>
              </div>
            );
          }

          if (effectivePeriod === 'evening') {
            if (hasEveningTasks) return renderPeriod("Evening", eveningTaskIds);
            return (
              <div className="p-6 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700 my-2">
                <Typography variant="body" className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                  No Evening tasks in this routine.
                </Typography>
                <button
                  onClick={() => setRoutinePeriodFilter('all')}
                  className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
                >
                  View All Routine Tasks
                </button>
              </div>
            );
          }

          return null;
        };

        return (
          <div className="space-y-4 pt-2">
            <div 
              className="relative p-[3px] rounded-2xl sm:rounded-3xl mb-3 sm:mb-4 shadow-sm mt-2"
              style={{ background: 'repeating-linear-gradient(45deg, #38bdf8, #38bdf8 10px, #0ea5e9 10px, #0ea5e9 20px)' }}
            >
              <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 rounded-xl sm:rounded-[1.6rem] p-3 sm:p-4 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                <div>
                  <Typography variant="h3" className="text-2xl font-bold text-stone-900 dark:text-stone-50 px-1 mb-1">{routineDisplayName}</Typography>
                  <Typography variant="body" className="text-[10px] sm:text-xs font-sans text-stone-500 dark:text-stone-400 px-1">Complete your routine tasks to earn gold coins!</Typography>
                </div>
              </div>
            </div>

            {hasAnyTasksInRoutine && (
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl overflow-x-auto">
                {[
                  { id: 'auto', label: `Now (${timeOfDayPeriod.charAt(0).toUpperCase() + timeOfDayPeriod.slice(1)})` },
                  { id: 'morning', label: 'Morning' },
                  { id: 'afternoon', label: 'Afternoon' },
                  { id: 'evening', label: 'Evening' },
                  { id: 'all', label: 'All' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setRoutinePeriodFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      routinePeriodFilter === tab.id
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 shadow-sm'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {renderFilteredTasks()}
            </div>
          </div>
        );
      })()}

      {/* Activity Modals */}
      <Modal
        isOpen={historyType !== null}
        onClose={() => setHistoryType(null)}
      >
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h2" className="text-xl font-bold text-stone-900 dark:text-stone-50">
            {historyType === 'today' ? "Today's Activity" : "Full History"}
          </Typography>
          <button 
            onClick={() => setHistoryType(null)}
            className="p-2 -mr-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-1 pb-4">
          <ActivityFeed 
            activities={historyType === 'today' ? recentActivities : fullActivities} 
            emptyMessage={historyType === 'today' ? "No activity today." : "No activity history."} 
            className="space-y-2"
          />
        </div>
      </Modal>

    </motion.div>
  );
};
