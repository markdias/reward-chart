import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Target, CalendarDays, Calendar, Trophy, PiggyBank, Bone, Gift, Wrench, ShieldAlert, Zap, Star, IceCream, Heart } from 'lucide-react';

import { ParentProfile } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import { playSound } from '../utils/sound';
import { Button } from './ui/Button';

interface TargetsTabProps {
  parentProfile?: ParentProfile | null;
  onUpdateParentProfile?: (updates: Partial<ParentProfile>) => void;
}

const NumberInputCard = ({ 
  icon: Icon, 
  title, 
  description, 
  value, 
  onChange, 
  onBlur,
  colorClass 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  value: number, 
  onChange: (val: number) => void,
  onBlur?: () => void,
  colorClass: string 
}) => (
  <div className="bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-800 rounded-xl p-3 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 pointer-events-none ${colorClass.split(' ')[0]}`} />
    
    <div className="flex items-start justify-between relative z-10">
      <div className={`p-1.5 rounded-lg ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="w-20">
        <input 
          type="number" 
          value={value} 
          onChange={(e) => onChange(e.target.value === '' ? '' as any : Number(e.target.value))}
          onBlur={onBlur}
          className="w-full bg-stone-50 dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-50 rounded-lg px-2 py-0.5 text-sm font-black text-center focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 outline-none transition-all"
        />
      </div>
    </div>
    <div className="relative z-10 mt-1">
      <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 mb-0.5">{title}</h3>
      <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">{description}</p>
    </div>
  </div>
);

export default function TargetsTab({ parentProfile, onUpdateParentProfile }: TargetsTabProps) {
  const [levelUpGoldReward, setLevelUpGoldReward] = useState(parentProfile?.level_up_gold_reward ?? 500);
  const [dailyPointsTarget, setDailyPointsTarget] = useState(parentProfile?.daily_points_target ?? 50);
  const [dailyRewardPoints, setDailyRewardPoints] = useState(parentProfile?.daily_reward_points ?? 50);
  const [weeklyPointsTarget, setWeeklyPointsTarget] = useState(parentProfile?.weekly_points_target ?? 300);
  const [weeklyRewardPoints, setWeeklyRewardPoints] = useState(parentProfile?.weekly_reward_points ?? 200);
  const [monthlyPointsTarget, setMonthlyPointsTarget] = useState(parentProfile?.monthly_points_target ?? 1200);
  const [monthlyRewardPoints, setMonthlyRewardPoints] = useState(parentProfile?.monthly_reward_points ?? 1000);
  
  const [pointsToLevelUp, setPointsToLevelUp] = useState(parentProfile?.points_to_level_up ?? 500);
  const [savingsPotUnlockLevel, setSavingsPotUnlockLevel] = useState(parentProfile?.savings_pot_unlock_level ?? 2);
  const [foodPotUnlockLevel, setFoodPotUnlockLevel] = useState(parentProfile?.food_pot_unlock_level ?? 4);
  const [giftingPotUnlockLevel, setGiftingPotUnlockLevel] = useState(parentProfile?.gifting_pot_unlock_level ?? 6);
  const [goldPotMaintenanceUnlockLevel, setGoldPotMaintenanceUnlockLevel] = useState(parentProfile?.gold_pot_maintenance_unlock_level ?? 8);
  const [goldPotMaintenanceCost, setGoldPotMaintenanceCost] = useState(parentProfile?.gold_pot_maintenance_cost ?? 2);

  React.useEffect(() => {
    if (parentProfile) {
      setLevelUpGoldReward(parentProfile.level_up_gold_reward ?? 500);
      setDailyPointsTarget(parentProfile.daily_points_target ?? 50);
      setDailyRewardPoints(parentProfile.daily_reward_points ?? 50);
      setWeeklyPointsTarget(parentProfile.weekly_points_target ?? 300);
      setWeeklyRewardPoints(parentProfile.weekly_reward_points ?? 200);
      setMonthlyPointsTarget(parentProfile.monthly_points_target ?? 1200);
      setMonthlyRewardPoints(parentProfile.monthly_reward_points ?? 1000);
      setPointsToLevelUp(parentProfile.points_to_level_up ?? 500);
      setSavingsPotUnlockLevel(parentProfile.savings_pot_unlock_level ?? 2);
      setFoodPotUnlockLevel(parentProfile.food_pot_unlock_level ?? 4);
      setGiftingPotUnlockLevel(parentProfile.gifting_pot_unlock_level ?? 6);
      setGoldPotMaintenanceUnlockLevel(parentProfile.gold_pot_maintenance_unlock_level ?? 8);
      setGoldPotMaintenanceCost(parentProfile.gold_pot_maintenance_cost ?? 2);
    }
  }, [parentProfile]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    if (!parentProfile?.user_id) return;
    setIsSaving(true);
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('parent_profiles')
        .update({ 

          level_up_gold_reward: Number(levelUpGoldReward) || 0,
          daily_points_target: Number(dailyPointsTarget) || 0,
          daily_reward_points: Number(dailyRewardPoints) || 0,
          weekly_points_target: Number(weeklyPointsTarget) || 0,
          weekly_reward_points: Number(weeklyRewardPoints) || 0,
          monthly_points_target: Number(monthlyPointsTarget) || 0,
          monthly_reward_points: Number(monthlyRewardPoints) || 0,
          points_to_level_up: Number(pointsToLevelUp) || 0,
          savings_pot_unlock_level: Number(savingsPotUnlockLevel) || 0,
          food_pot_unlock_level: Number(foodPotUnlockLevel) || 0,
          gifting_pot_unlock_level: Number(giftingPotUnlockLevel) || 0,
          gold_pot_maintenance_unlock_level: Number(goldPotMaintenanceUnlockLevel) || 0,
          gold_pot_maintenance_cost: Number(goldPotMaintenanceCost) || 0,
        })
        .eq('user_id', parentProfile.user_id);
        
      if (error) throw error;
      
      if (onUpdateParentProfile) {
        onUpdateParentProfile({
          level_up_gold_reward: Number(levelUpGoldReward) || 0,
          daily_points_target: Number(dailyPointsTarget) || 0,
          daily_reward_points: Number(dailyRewardPoints) || 0,
          weekly_points_target: Number(weeklyPointsTarget) || 0,
          weekly_reward_points: Number(weeklyRewardPoints) || 0,
          monthly_points_target: Number(monthlyPointsTarget) || 0,
          monthly_reward_points: Number(monthlyRewardPoints) || 0,
          points_to_level_up: Number(pointsToLevelUp) || 0,
          savings_pot_unlock_level: Number(savingsPotUnlockLevel) || 0,
          food_pot_unlock_level: Number(foodPotUnlockLevel) || 0,
          gifting_pot_unlock_level: Number(giftingPotUnlockLevel) || 0,
        });
      }
        
      setMsg('Saved!');
      playSound.success();
      setTimeout(() => setMsg(''), 2000);
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
      playSound.pinError();
    }
    setIsSaving(false);
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-4 pb-20`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-4 relative space-y-6">
          
          {/* Goals Section */}
          <section>
            <div className="mb-3 px-1">
              <Typography variant="h3" className="text-lg font-black text-stone-800 dark:text-stone-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Goals & Bonuses
              </Typography>
              <Typography variant="body" className="text-xs text-stone-500 mt-1">
                Set how much gold your child needs to earn to hit their targets, and the bonus they receive for hitting them.
              </Typography>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <NumberInputCard
                icon={Zap}
                title="Daily Target"
                description="Gold needed to complete the daily goal ring."
                value={dailyPointsTarget}
                onChange={setDailyPointsTarget}
                onBlur={handleSave}
                colorClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
              />
              <NumberInputCard
                icon={Gift}
                title="Daily Bonus"
                description="Reward given for hitting the daily target."
                value={dailyRewardPoints}
                onChange={setDailyRewardPoints}
                onBlur={handleSave}
                colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
              />
              <NumberInputCard
                icon={CalendarDays}
                title="Weekly Target"
                description="Gold needed to unlock the weekly bonus."
                value={weeklyPointsTarget}
                onChange={setWeeklyPointsTarget}
                onBlur={handleSave}
                colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
              />
              <NumberInputCard
                icon={Trophy}
                title="Weekly Bonus"
                description="Reward given for hitting the weekly target."
                value={weeklyRewardPoints}
                onChange={setWeeklyRewardPoints}
                onBlur={handleSave}
                colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
              />
              <NumberInputCard
                icon={CalendarDays}
                title="Monthly Target"
                description="Gold needed to unlock the big monthly bonus."
                value={monthlyPointsTarget}
                onChange={setMonthlyPointsTarget}
                onBlur={handleSave}
                colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
              />
              <NumberInputCard
                icon={Star}
                title="Monthly Bonus"
                description="Reward given for hitting the monthly target."
                value={monthlyRewardPoints}
                onChange={setMonthlyRewardPoints}
                onBlur={handleSave}
                colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
              />
            </div>
          </section>

          <section>
            <div className="mb-3 px-1">
              <Typography variant="h3" className="text-lg font-black text-stone-800 dark:text-stone-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-500" />
                Leveling Up
              </Typography>
              <Typography variant="body" className="text-xs text-stone-500 mt-1">
                Configure how hard it is to level up and what the base reward is.
              </Typography>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <NumberInputCard
                icon={Target}
                title="Gold Required to Level Up"
                description="How much gold is needed to reach the next level."
                value={pointsToLevelUp}
                onChange={setPointsToLevelUp}
                onBlur={handleSave}
                colorClass="bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
              />
              <NumberInputCard
                icon={Gift}
                title="Level Up Reward"
                description="Gold given when they reach the next level."
                value={levelUpGoldReward}
                onChange={setLevelUpGoldReward}
                onBlur={handleSave}
                colorClass="bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400"
              />
            </div>
          </section>

          <section>
            <div className="mb-3 px-1">
              <Typography variant="h3" className="text-lg font-black text-stone-800 dark:text-stone-100 flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-pink-500" />
                Feature Unlocks
              </Typography>
              <Typography variant="body" className="text-xs text-stone-500 mt-1">
                Set which level unlocks the different pots and mechanics.
              </Typography>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <NumberInputCard
                icon={PiggyBank}
                title="Savings Pot Level"
                description="Level required to unlock the Savings Pot."
                value={savingsPotUnlockLevel}
                onChange={setSavingsPotUnlockLevel}
                onBlur={handleSave}
                colorClass="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
              />
              <NumberInputCard
                icon={IceCream}
                title="Food Pot Level"
                description="Level required to unlock the Food Pot."
                value={foodPotUnlockLevel}
                onChange={setFoodPotUnlockLevel}
                onBlur={handleSave}
                colorClass="bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400"
              />
              <NumberInputCard
                icon={Heart}
                title="Gifting Pot Level"
                description="Level required to unlock the Gifting Pot."
                value={giftingPotUnlockLevel}
                onChange={setGiftingPotUnlockLevel}
                onBlur={handleSave}
                colorClass="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
              />
              <NumberInputCard
                icon={Wrench}
                title="Gold Maintenance Level"
                description="Level where the Gold Pot starts breaking randomly."
                value={goldPotMaintenanceUnlockLevel}
                onChange={setGoldPotMaintenanceUnlockLevel}
                onBlur={handleSave}
                colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
              />
              <NumberInputCard
                icon={Wrench}
                title="Maintenance Cost"
                description="How much gold it costs to fix the broken Gold Pot."
                value={goldPotMaintenanceCost}
                onChange={setGoldPotMaintenanceCost}
                onBlur={handleSave}
                colorClass="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
              />
            </div>
          </section>

            <div className="flex justify-center items-center h-12">
              <AnimatePresence>
                {msg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`px-4 py-2 rounded-full font-bold shadow-lg ${msg.includes('Error') ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}
                  >
                    {msg}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

        </div>
      </motion.div>
    </div>
  );
}
