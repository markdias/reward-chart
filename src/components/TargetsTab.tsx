import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'motion/react';
import { Save, Target, CalendarDays, Calendar, Trophy, PiggyBank, Bone, Gift, Wrench, ShieldAlert, Zap } from 'lucide-react';

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
  colorClass 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  value: number, 
  onChange: (val: number) => void,
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
          onChange={(e) => onChange(Number(e.target.value))}
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
    if (!parentProfile?.user_id) {
      setMsg('Settings are only saved to the cloud when you create an account.');
      playSound.pinError();
      return;
    }
    setIsSaving(true);
    setMsg('');
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('parent_profiles')
        .update({ 
          level_up_gold_reward: levelUpGoldReward,
          daily_points_target: dailyPointsTarget,
          weekly_points_target: weeklyPointsTarget,
          weekly_reward_points: weeklyRewardPoints,
          monthly_points_target: monthlyPointsTarget,
          monthly_reward_points: monthlyRewardPoints,
          points_to_level_up: pointsToLevelUp,
          savings_pot_unlock_level: savingsPotUnlockLevel,
          food_pot_unlock_level: foodPotUnlockLevel,
          gifting_pot_unlock_level: giftingPotUnlockLevel,
          gold_pot_maintenance_unlock_level: goldPotMaintenanceUnlockLevel,
          gold_pot_maintenance_cost: goldPotMaintenanceCost,
        })
        .eq('user_id', parentProfile.user_id);
        
      if (error) throw error;
      
      if (onUpdateParentProfile) {
        onUpdateParentProfile({
          level_up_gold_reward: levelUpGoldReward,
          daily_points_target: dailyPointsTarget,
          weekly_points_target: weeklyPointsTarget,
          weekly_reward_points: weeklyRewardPoints,
          monthly_points_target: monthlyPointsTarget,
          monthly_reward_points: monthlyRewardPoints,
          points_to_level_up: pointsToLevelUp,
          savings_pot_unlock_level: savingsPotUnlockLevel,
          food_pot_unlock_level: foodPotUnlockLevel,
          gifting_pot_unlock_level: giftingPotUnlockLevel,
        });
      }
        
      setMsg('Targets updated successfully!');
      playSound.success();
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
                colorClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
              />
              <NumberInputCard
                icon={CalendarDays}
                title="Weekly Target"
                description="Gold needed to unlock the weekly bonus."
                value={weeklyPointsTarget}
                onChange={setWeeklyPointsTarget}
                colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
              />
              <NumberInputCard
                icon={Trophy}
                title="Weekly Bonus"
                description="Reward given for hitting the weekly target."
                value={weeklyRewardPoints}
                onChange={setWeeklyRewardPoints}
                colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
              />
              <NumberInputCard
                icon={Calendar}
                title="Monthly Target"
                description="Gold needed to unlock the huge monthly bonus."
                value={monthlyPointsTarget}
                onChange={setMonthlyPointsTarget}
                colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
              />
              <NumberInputCard
                icon={Trophy}
                title="Monthly Bonus"
                description="Reward given for hitting the monthly target."
                value={monthlyRewardPoints}
                onChange={setMonthlyRewardPoints}
                colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
              />
            </div>
          </section>

          {/* Leveling Section */}
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
                colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
              />
              <NumberInputCard
                icon={Gift}
                title="Level Up Gold Reward"
                description="Bonus gold awarded automatically upon leveling up."
                value={levelUpGoldReward}
                onChange={setLevelUpGoldReward}
                colorClass="bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400"
              />
            </div>
          </section>

          {/* Feature Unlocks Section */}
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
                colorClass="bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400"
              />
              <NumberInputCard
                icon={Bone}
                title="Food Pot Level"
                description="Level required to unlock Pet feeding."
                value={foodPotUnlockLevel}
                onChange={setFoodPotUnlockLevel}
                colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
              />
              <NumberInputCard
                icon={Gift}
                title="Gifting Pot Level"
                description="Level required to unlock Charity/Sibling gifting."
                value={giftingPotUnlockLevel}
                onChange={setGiftingPotUnlockLevel}
                colorClass="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
              />
              <NumberInputCard
                icon={Wrench}
                title="Gold Maintenance Level"
                description="Level where the Gold Pot starts breaking randomly."
                value={goldPotMaintenanceUnlockLevel}
                onChange={setGoldPotMaintenanceUnlockLevel}
                colorClass="bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300"
              />
              <NumberInputCard
                icon={ShieldAlert}
                title="Maintenance Cost"
                description="How much gold it costs to fix the broken Gold Pot."
                value={goldPotMaintenanceCost}
                onChange={setGoldPotMaintenanceCost}
                colorClass="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
              />
            </div>
          </section>

          <div className="max-w-md mx-auto pt-8">
            <Button 
              variant="primary"
              fullWidth
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-5 h-5" />}
              className="py-4 font-black tracking-widest shadow-xl shadow-stone-900/10"
            >
              SAVE SETTINGS
            </Button>
            {msg && (
              <p className={`text-sm font-bold mt-4 text-center ${msg.includes('Error') ? 'text-rose-500' : 'text-emerald-500'}`}>
                {msg}
              </p>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
