import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'motion/react';
import { Target, Save, Database } from 'lucide-react';
import { ThemeId } from '../utils/theme';
import { ParentProfile } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import { playSound } from '../utils/sound';
import { Button } from './ui/Button';
import { SettingsBlock, SettingsRow } from './ui/SettingsList';

interface TargetsTabProps {
  theme: ThemeId;
  parentProfile?: ParentProfile | null;
  onUpdateParentProfile?: (updates: Partial<ParentProfile>) => void;
}

export default function TargetsTab({ theme, parentProfile, onUpdateParentProfile }: TargetsTabProps) {
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

  const getThemeClasses = () => {
    return {
      card: 'bg-white border-[3px] border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]',
      text: 'text-stone-900',
      textMuted: 'text-stone-400',
      input: 'bg-stone-50 border-2 border-stone-200 text-stone-900 placeholder-stone-400 rounded-2xl px-4 py-3 font-bold focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 outline-none transition-all',
      primaryBtn: 'bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold border-2 border-indigo-600 shadow-[0_4px_0_0_rgb(79,70,229)] hover:shadow-[0_2px_0_0_rgb(79,70,229)] active:translate-y-1 active:shadow-none transition-all uppercase',
    };
  };

  const c = getThemeClasses();

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
    <div className={`max-w-4xl mx-auto space-y-6 pb-20`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-stone-100 p-6 sm:p-10 rounded-[2.5rem] border-2 border-stone-200 shadow-sm relative overflow-hidden">
          
          <SettingsBlock title="Global Rewards & Targets">
            <SettingsRow 
              label="Daily Target (Gold)" 
              value={dailyPointsTarget} 
              type="number" 
              onChange={(v: string) => setDailyPointsTarget(Number(v))} 
            />
            <SettingsRow 
              label="Weekly Target (Gold)" 
              value={weeklyPointsTarget} 
              type="number" 
              onChange={(v: string) => setWeeklyPointsTarget(Number(v))} 
            />
            <SettingsRow 
              label="Weekly Gold Bonus" 
              value={weeklyRewardPoints} 
              type="number" 
              onChange={(v: string) => setWeeklyRewardPoints(Number(v))} 
            />
            <SettingsRow 
              label="Monthly Target (Gold)" 
              value={monthlyPointsTarget} 
              type="number" 
              onChange={(v: string) => setMonthlyPointsTarget(Number(v))} 
            />
            <SettingsRow 
              label="Monthly Gold Bonus" 
              value={monthlyRewardPoints} 
              type="number" 
              isLast 
              onChange={(v: string) => setMonthlyRewardPoints(Number(v))} 
            />
          </SettingsBlock>

          <SettingsBlock title="Levels & Pots">
            <SettingsRow 
              label="Gold Required to Level Up" 
              value={pointsToLevelUp} 
              type="number" 
              onChange={(v: string) => setPointsToLevelUp(Number(v))} 
            />
            <SettingsRow 
              label="Level Up Gold Reward" 
              value={levelUpGoldReward} 
              type="number" 
              onChange={(v: string) => setLevelUpGoldReward(Number(v))} 
            />
            <SettingsRow 
              label="Savings Pot Lvl" 
              value={savingsPotUnlockLevel} 
              type="number" 
              onChange={(v: string) => setSavingsPotUnlockLevel(Number(v))} 
            />
            <SettingsRow 
              label="Food Pot Lvl" 
              value={foodPotUnlockLevel} 
              type="number" 
              onChange={(v: string) => setFoodPotUnlockLevel(Number(v))} 
            />
            <SettingsRow 
              label="Gifting Pot Lvl" 
              value={giftingPotUnlockLevel} 
              type="number" 
              onChange={(v: string) => setGiftingPotUnlockLevel(Number(v))} 
            />
            <SettingsRow 
              label="Gold Maintenance Lvl" 
              value={goldPotMaintenanceUnlockLevel} 
              type="number" 
              onChange={(v: string) => setGoldPotMaintenanceUnlockLevel(Number(v))} 
            />
            <SettingsRow 
              label="Maintenance Cost" 
              value={goldPotMaintenanceCost} 
              type="number" 
              isLast 
              onChange={(v: string) => setGoldPotMaintenanceCost(Number(v))} 
            />
          </SettingsBlock>

          <div className="max-w-md mx-auto mt-8">
            <Button 
              variant="dark"
              fullWidth
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-5 h-5" />}
              className="py-4 font-black tracking-widest shadow-xl shadow-stone-900/10"
            >
              SAVE SETTINGS
            </Button>
            {msg && <p className={`text-sm font-bold mt-4 text-center ${msg.includes('Error') ? 'text-rose-500' : 'text-emerald-500'}`}>{msg}</p>}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
