import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Save } from 'lucide-react';
import { ThemeId } from '../utils/theme';
import { ParentProfile } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import { playSound } from '../utils/sound';

interface TargetsTabProps {
  theme: ThemeId;
  parentProfile?: ParentProfile | null;
}

export default function TargetsTab({ theme, parentProfile }: TargetsTabProps) {
  const [levelUpGoldReward, setLevelUpGoldReward] = useState(parentProfile?.level_up_gold_reward ?? 500);
  const [weeklyPointsTarget, setWeeklyPointsTarget] = useState(parentProfile?.weekly_points_target ?? 300);
  const [weeklyRewardPoints, setWeeklyRewardPoints] = useState(parentProfile?.weekly_reward_points ?? 200);
  const [monthlyPointsTarget, setMonthlyPointsTarget] = useState(parentProfile?.monthly_points_target ?? 1200);
  const [monthlyRewardPoints, setMonthlyRewardPoints] = useState(parentProfile?.monthly_reward_points ?? 1000);
  
  const [pointsToLevelUp, setPointsToLevelUp] = useState(parentProfile?.points_to_level_up ?? 500);
  const [savingsPotUnlockLevel, setSavingsPotUnlockLevel] = useState(parentProfile?.savings_pot_unlock_level ?? 1);
  const [foodPotUnlockLevel, setFoodPotUnlockLevel] = useState(parentProfile?.food_pot_unlock_level ?? 2);
  const [giftingPotUnlockLevel, setGiftingPotUnlockLevel] = useState(parentProfile?.gifting_pot_unlock_level ?? 3);
  const [maintenancePotUnlockLevel, setMaintenancePotUnlockLevel] = useState(parentProfile?.maintenance_pot_unlock_level ?? 4);
  
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const getThemeClasses = () => {
    return {
      card: 'bg-white border-stone-200',
      text: 'text-stone-900',
      textMuted: 'text-stone-500',
      input: 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400',
      primaryBtn: 'bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold border-2 border-stone-900 shadow-[0_4px_0_0_#1c1917] active:translate-y-1 active:shadow-none active:scale-95 transition-all uppercase',
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
          weekly_points_target: weeklyPointsTarget,
          weekly_reward_points: weeklyRewardPoints,
          monthly_points_target: monthlyPointsTarget,
          monthly_reward_points: monthlyRewardPoints,
          points_to_level_up: pointsToLevelUp,
          savings_pot_unlock_level: savingsPotUnlockLevel,
          food_pot_unlock_level: foodPotUnlockLevel,
          gifting_pot_unlock_level: giftingPotUnlockLevel,
          maintenance_pot_unlock_level: maintenancePotUnlockLevel,
        })
        .eq('user_id', parentProfile.user_id);
        
      if (error) throw error;
        
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
        className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 shadow-xl ${c.card}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-black font-display uppercase tracking-wide ${c.text}`}>Global Rewards & Targets</h3>
            <p className={`text-sm ${c.textMuted}`}>Set global milestones for the family.</p>
          </div>
        </div>
        
        <div className="space-y-6 max-w-md">
          <div className="space-y-4">
            <div>
              <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Level Up Gold Reward</label>
              <input 
                type="number" 
                value={levelUpGoldReward}
                onChange={(e) => setLevelUpGoldReward(Number(e.target.value))}
                className={`w-full px-4 py-2 rounded-xl border ${c.input} focus:ring-2 focus:ring-amber-500 outline-none`} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Weekly Target (Gold)</label>
                <input 
                  type="number" 
                  value={weeklyPointsTarget}
                  onChange={(e) => setWeeklyPointsTarget(Number(e.target.value))}
                  className={`w-full px-4 py-2 rounded-xl border ${c.input} focus:ring-2 focus:ring-amber-500 outline-none`} 
                />
              </div>
              <div>
                <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Weekly Gold Bonus</label>
                <input 
                  type="number" 
                  value={weeklyRewardPoints}
                  onChange={(e) => setWeeklyRewardPoints(Number(e.target.value))}
                  className={`w-full px-4 py-2 rounded-xl border ${c.input} focus:ring-2 focus:ring-amber-500 outline-none`} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Monthly Target (Gold)</label>
                <input 
                  type="number" 
                  value={monthlyPointsTarget}
                  onChange={(e) => setMonthlyPointsTarget(Number(e.target.value))}
                  className={`w-full px-4 py-2 rounded-xl border ${c.input} focus:ring-2 focus:ring-amber-500 outline-none`} 
                />
              </div>
              <div>
                <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Monthly Gold Bonus</label>
                <input 
                  type="number" 
                  value={monthlyRewardPoints}
                  onChange={(e) => setMonthlyRewardPoints(Number(e.target.value))}
                  className={`w-full px-4 py-2 rounded-xl border ${c.input} focus:ring-2 focus:ring-amber-500 outline-none`} 
                />
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-stone-200 mt-8">
            <h3 className={`text-lg font-black font-display uppercase tracking-wide ${c.text} mb-6`}>Levels & Pots Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Gold Required to Level Up</label>
                <input 
                  type="number" 
                  value={pointsToLevelUp}
                  onChange={(e) => setPointsToLevelUp(Number(e.target.value))}
                  className={`w-full px-4 py-2 rounded-xl border ${c.input} focus:ring-2 focus:ring-amber-500 outline-none`} 
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider text-emerald-600`}>Savings Pot Lvl</label>
                  <input 
                    type="number" 
                    value={savingsPotUnlockLevel}
                    onChange={(e) => setSavingsPotUnlockLevel(Number(e.target.value))}
                    className={`w-full px-4 py-2 rounded-xl border border-emerald-200 text-stone-700 bg-emerald-50 focus:ring-2 focus:ring-emerald-500 outline-none`} 
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider text-orange-600`}>Food Pot Lvl</label>
                  <input 
                    type="number" 
                    value={foodPotUnlockLevel}
                    onChange={(e) => setFoodPotUnlockLevel(Number(e.target.value))}
                    className={`w-full px-4 py-2 rounded-xl border border-orange-200 text-stone-700 bg-orange-50 focus:ring-2 focus:ring-orange-500 outline-none`} 
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider text-rose-600`}>Gifting Pot Lvl</label>
                  <input 
                    type="number" 
                    value={giftingPotUnlockLevel}
                    onChange={(e) => setGiftingPotUnlockLevel(Number(e.target.value))}
                    className={`w-full px-4 py-2 rounded-xl border border-rose-200 text-stone-700 bg-rose-50 focus:ring-2 focus:ring-rose-500 outline-none`} 
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider text-slate-600`}>Bills & Repairs Lvl</label>
                  <input 
                    type="number" 
                    value={maintenancePotUnlockLevel}
                    onChange={(e) => setMaintenancePotUnlockLevel(Number(e.target.value))}
                    className={`w-full px-4 py-2 rounded-xl border border-slate-200 text-stone-700 bg-slate-50 focus:ring-2 focus:ring-slate-500 outline-none`} 
                  />
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold font-mono text-sm shadow-lg ${c.primaryBtn} disabled:opacity-50 mt-6`}
          >
            <Save className="w-4 h-4" /> {isSaving ? 'SAVING...' : 'SAVE TARGETS'}
          </button>
          {msg && <p className={`text-sm font-bold mt-2 ${msg.includes('Error') ? 'text-rose-500' : 'text-emerald-500'}`}>{msg}</p>}
        </div>
      </motion.div>
    </div>
  );
}
