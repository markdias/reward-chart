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
  const [weeklyXpTarget, setWeeklyXpTarget] = useState(parentProfile?.weekly_xp_target ?? 300);
  const [weeklyRewardPoints, setWeeklyRewardPoints] = useState(parentProfile?.weekly_reward_points ?? 200);
  const [monthlyXpTarget, setMonthlyXpTarget] = useState(parentProfile?.monthly_xp_target ?? 1200);
  const [monthlyRewardPoints, setMonthlyRewardPoints] = useState(parentProfile?.monthly_reward_points ?? 1000);
  
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
          weekly_xp_target: weeklyXpTarget,
          weekly_reward_points: weeklyRewardPoints,
          monthly_xp_target: monthlyXpTarget,
          monthly_reward_points: monthlyRewardPoints,
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
                <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Weekly XP Target</label>
                <input 
                  type="number" 
                  value={weeklyXpTarget}
                  onChange={(e) => setWeeklyXpTarget(Number(e.target.value))}
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
                <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Monthly XP Target</label>
                <input 
                  type="number" 
                  value={monthlyXpTarget}
                  onChange={(e) => setMonthlyXpTarget(Number(e.target.value))}
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
