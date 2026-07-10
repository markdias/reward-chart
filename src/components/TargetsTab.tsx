import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'motion/react';
import { Target, Save } from 'lucide-react';
import { ThemeId } from '../utils/theme';
import { ParentProfile } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import { playSound } from '../utils/sound';
import { Button } from './ui/Button';

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
      card: 'bg-white border-[3px] border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]',
      text: 'text-slate-900',
      textMuted: 'text-slate-400',
      input: 'bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl px-4 py-3 font-bold focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 outline-none transition-all',
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
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 ${c.text}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 sm:p-8 rounded-[2rem] border-2 shadow-xl ${c.card}`}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-indigo-50 text-indigo-500 rounded-[1.25rem] shadow-sm border border-indigo-100 shrink-0">
            <Target className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className={`text-xl sm:text-2xl font-black font-display tracking-tight text-slate-800`}>Global Rewards & Targets</h3>
            <p className={`text-xs sm:text-sm font-semibold text-slate-500 mt-0.5`}>Set global milestones for the family.</p>
          </div>
        </div>
        
        <div className="space-y-6 max-w-md">
          <div className="space-y-5">
            <div>
              <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 ${c.textMuted}`}>Daily Target (Gold)</label>
              <input 
                type="number" 
                value={dailyPointsTarget}
                onChange={(e) => setDailyPointsTarget(Number(e.target.value))}
                className={`w-full ${c.input}`} 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 ${c.textMuted}`}>Weekly Target (Gold)</label>
                <input 
                  type="number" 
                  value={weeklyPointsTarget}
                  onChange={(e) => setWeeklyPointsTarget(Number(e.target.value))}
                  className={`w-full ${c.input}`} 
                />
              </div>
              <div>
                <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 ${c.textMuted}`}>Weekly Gold Bonus</label>
                <input 
                  type="number" 
                  value={weeklyRewardPoints}
                  onChange={(e) => setWeeklyRewardPoints(Number(e.target.value))}
                  className={`w-full ${c.input}`} 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 ${c.textMuted}`}>Monthly Target (Gold)</label>
                <input 
                  type="number" 
                  value={monthlyPointsTarget}
                  onChange={(e) => setMonthlyPointsTarget(Number(e.target.value))}
                  className={`w-full ${c.input}`} 
                />
              </div>
              <div>
                <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 ${c.textMuted}`}>Monthly Gold Bonus</label>
                <input 
                  type="number" 
                  value={monthlyRewardPoints}
                  onChange={(e) => setMonthlyRewardPoints(Number(e.target.value))}
                  className={`w-full ${c.input}`} 
                />
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 mt-8">
            <h3 className={`text-lg sm:text-xl font-black font-display tracking-tight text-slate-800 mb-6`}>Levels & Pots Configuration</h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 ${c.textMuted}`}>Gold Required to Level Up</label>
                  <input 
                    type="number" 
                    value={pointsToLevelUp}
                    onChange={(e) => setPointsToLevelUp(Number(e.target.value))}
                    className={`w-full ${c.input}`} 
                  />
                </div>
                <div>
                  <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 text-indigo-500`}>Level Up Gold Reward</label>
                  <input 
                    type="number" 
                    value={levelUpGoldReward}
                    onChange={(e) => setLevelUpGoldReward(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-2xl border-2 border-indigo-200 text-slate-700 bg-indigo-50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 font-bold outline-none transition-all`} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 text-emerald-500`}>Savings Pot Lvl</label>
                  <input 
                    type="number" 
                    value={savingsPotUnlockLevel}
                    onChange={(e) => setSavingsPotUnlockLevel(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 text-slate-700 bg-emerald-50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 font-bold outline-none transition-all`} 
                  />
                </div>
                <div>
                  <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 text-orange-500`}>Food Pot Lvl</label>
                  <input 
                    type="number" 
                    value={foodPotUnlockLevel}
                    onChange={(e) => setFoodPotUnlockLevel(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-2xl border-2 border-orange-200 text-slate-700 bg-orange-50 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 font-bold outline-none transition-all`} 
                  />
                </div>
                <div>
                  <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 text-rose-500`}>Gifting Pot Lvl</label>
                  <input 
                    type="number" 
                    value={giftingPotUnlockLevel}
                    onChange={(e) => setGiftingPotUnlockLevel(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-2xl border-2 border-rose-200 text-slate-700 bg-rose-50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 font-bold outline-none transition-all`} 
                  />
                </div>
                <div>
                  <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 text-amber-500`}>Gold Maintenance Lvl</label>
                  <input 
                    type="number" 
                    value={goldPotMaintenanceUnlockLevel}
                    onChange={(e) => setGoldPotMaintenanceUnlockLevel(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-2xl border-2 border-amber-200 text-slate-700 bg-amber-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 font-bold outline-none transition-all`} 
                  />
                </div>
                <div>
                  <label className={`block text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 text-amber-500`}>Gold Maintenance Cost</label>
                  <input 
                    type="number" 
                    value={goldPotMaintenanceCost}
                    onChange={(e) => setGoldPotMaintenanceCost(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-2xl border-2 border-amber-200 text-slate-700 bg-amber-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 font-bold outline-none transition-all`} 
                  />
                </div>

              </div>
            </div>
          </div>
          <Button 
            variant="primary"
            fullWidth
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save className="w-5 h-5" />}
            className="mt-8 py-4 sm:py-6 text-sm sm:text-base font-black tracking-widest rounded-2xl shadow-xl shadow-blue-500/20"
          >
            SAVE SETTINGS
          </Button>
          {msg && <p className={`text-sm font-bold mt-4 text-center ${msg.includes('Error') ? 'text-rose-500' : 'text-emerald-500'}`}>{msg}</p>}
        </div>
      </motion.div>
    </div>
  );
}
