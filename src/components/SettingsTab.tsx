import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, AlertTriangle, RefreshCw, Trash2, Shield, User, Link as LinkIcon, KeyRound } from 'lucide-react';
import { ThemeId } from '../utils/theme';
import { ParentProfile } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import { playSound } from '../utils/sound';

interface SettingsTabProps {
  theme: ThemeId;
  parentProfile?: ParentProfile | null;
  linkedParents?: ParentProfile[];
  onResetData?: (keepBlueprints: boolean) => void;
  onRunSetup?: () => void;
  onDeleteAccount?: () => void;
  onCleanDuplicates: () => void;
  onRequireAccount?: () => void;
}

export default function SettingsTab({ theme, parentProfile, linkedParents = [], onResetData, onRunSetup, onDeleteAccount, onCleanDuplicates, onRequireAccount }: SettingsTabProps) {
  const [name, setName] = useState(parentProfile?.name || '');
  const [familyName, setFamilyName] = useState(parentProfile?.family_name || '');
  const [pin, setPin] = useState(parentProfile?.pin || '');
  const [levelUpGoldReward, setLevelUpGoldReward] = useState(parentProfile?.level_up_gold_reward ?? 500);
  const [weeklyXpTarget, setWeeklyXpTarget] = useState(parentProfile?.weekly_xp_target ?? 300);
  const [weeklyRewardPoints, setWeeklyRewardPoints] = useState(parentProfile?.weekly_reward_points ?? 200);
  const [monthlyXpTarget, setMonthlyXpTarget] = useState(parentProfile?.monthly_xp_target ?? 1200);
  const [monthlyRewardPoints, setMonthlyRewardPoints] = useState(parentProfile?.monthly_reward_points ?? 1000);
  const [xpToLevelUp, setXpToLevelUp] = useState(parentProfile?.xp_to_level_up ?? 100);
  const [savingsPotUnlockLevel, setSavingsPotUnlockLevel] = useState(parentProfile?.savings_pot_unlock_level ?? 1);
  const [savingsPotUnlockXp, setSavingsPotUnlockXp] = useState(parentProfile?.savings_pot_unlock_xp ?? 50);
  const [foodPotUnlockLevel, setFoodPotUnlockLevel] = useState(parentProfile?.food_pot_unlock_level ?? 2);
  const [foodPotUnlockXp, setFoodPotUnlockXp] = useState(parentProfile?.food_pot_unlock_xp ?? 50);
  const [giftingPotUnlockLevel, setGiftingPotUnlockLevel] = useState(parentProfile?.gifting_pot_unlock_level ?? 3);
  const [giftingPotUnlockXp, setGiftingPotUnlockXp] = useState(parentProfile?.gifting_pot_unlock_xp ?? 50);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securityMsg, setSecurityMsg] = useState('');
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [keepBlueprints, setKeepBlueprints] = useState(true);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'sharing' | 'danger'>('profile');

  const getThemeClasses = () => {
    return {
      card: 'bg-white border-stone-200',
      text: 'text-stone-900',
      textMuted: 'text-stone-500',
      input: 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400',
      primaryBtn: 'bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold border-2 border-stone-900 shadow-[0_4px_0_0_#1c1917] active:translate-y-1 active:shadow-none active:scale-95 transition-all uppercase',
      dangerBtn: 'bg-rose-500 hover:bg-rose-400 text-white font-extrabold border-2 border-stone-900 shadow-[0_4px_0_0_#1c1917] active:translate-y-1 active:shadow-none active:scale-95 transition-all uppercase',
      dangerBtnOutline: 'border-2 border-rose-350 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-[0_3px_0_0_#f43f5e] active:translate-y-1 active:shadow-none',
    };
  };

  const c = getThemeClasses();
  
  const shareLink = parentProfile?.share_token 
    ? `${window.location.origin}/?share=${parentProfile.share_token}`
    : 'Generating...';

  const handleSaveProfile = async () => {
    if (!parentProfile?.user_id) {
      setProfileMsg('Profile settings are only saved to the cloud when you create an account.');
      playSound.pinError();
      return;
    }
    setIsSavingProfile(true);
    setProfileMsg('');
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // Update the current user's name
      const { error: nameError } = await supabase
        .from('parent_profiles')
        .update({ 
          name,
          level_up_gold_reward: levelUpGoldReward,
          weekly_xp_target: weeklyXpTarget,
          weekly_reward_points: weeklyRewardPoints,
          monthly_xp_target: monthlyXpTarget,
          monthly_reward_points: monthlyRewardPoints,
          xp_to_level_up: xpToLevelUp,
          savings_pot_unlock_level: savingsPotUnlockLevel,
          savings_pot_unlock_xp: savingsPotUnlockXp,
          food_pot_unlock_level: foodPotUnlockLevel,
          food_pot_unlock_xp: foodPotUnlockXp,
          gifting_pot_unlock_level: giftingPotUnlockLevel,
          gifting_pot_unlock_xp: giftingPotUnlockXp
        })
        .eq('user_id', parentProfile.user_id);
        
      if (nameError) throw nameError;

      // Update the family_name for EVERY user in the same family
      const { error: familyError } = await supabase
        .from('parent_profiles')
        .update({ family_name: familyName })
        .eq('family_id', parentProfile.family_id);

      if (familyError) throw familyError;
        
      setProfileMsg('Profile updated successfully!');
      playSound.success();
    } catch (e: any) {
      setProfileMsg(`Error: ${e.message}`);
      playSound.pinError();
    }
    setIsSavingProfile(false);
  };

  const handleSaveSecurity = async () => {
    setIsSavingSecurity(true);
    setSecurityMsg('');
    
    const supabase = getSupabaseClient();

    try {
      // Local mode fallback
      if (!parentProfile?.user_id || !supabase) {
        if (pin) {
          localStorage.setItem('RCH_PARENT_PIN', pin);
          setSecurityMsg('PIN updated locally!');
          playSound.success();
        }
        if (currentPassword || newPassword) {
           throw new Error("Cannot change password without an account.");
        }
        setIsSavingSecurity(false);
        return;
      }

      // 1. Update PIN in DB
      if (pin !== parentProfile.pin) {
        const { error: pinError } = await supabase
          .from('parent_profiles')
          .update({ pin })
          .eq('user_id', parentProfile.user_id);
        if (pinError) throw pinError;
      }

      // 2. Update Password
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) throw new Error("Current password is required");
        if (newPassword !== confirmPassword) throw new Error("New passwords do not match");
        if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
        
        // Supabase reauthentication to verify current password before updating
        const { data: { session }, error: verifyError } = await supabase.auth.signInWithPassword({
          email: parentProfile.email,
          password: currentPassword
        });
        
        if (verifyError || !session) {
          throw new Error("Invalid current password");
        }
        
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
      }
      
      setSecurityMsg('Security settings updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      playSound.success();
    } catch (e: any) {
      setSecurityMsg(`Error: ${e.message}`);
      playSound.pinError();
    }
    setIsSavingSecurity(false);
  };

  const handleUnlinkAccount = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to remove this account from your family dashboard? They will lose access to all children and tasks.')) return;
    
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    try {
      // Get target email to reset their family_id back to their email
      const targetProfile = linkedParents.find(p => p.user_id === targetUserId);
      if (!targetProfile) return;
      
      const { error } = await supabase
        .from('parent_profiles')
        .update({ family_id: targetProfile.email, family_name: null })
        .eq('user_id', targetUserId);
        
      if (error) throw error;
      
      playSound.success();
      alert('Account successfully unlinked. Please refresh to see changes.');
    } catch (e: any) {
      playSound.pinError();
      alert(`Error unlinking account: ${e.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      <div className="flex bg-stone-100 p-1.5 rounded-xl mb-6 shadow-inner overflow-x-auto gap-1">
        <button
          onClick={() => { playSound.click(); setActiveSubTab('profile'); }}
          className={`flex-1 py-2.5 px-3 rounded-lg text-[10px] sm:text-xs font-bold font-mono tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === 'profile'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          PROFILE
        </button>
        <button
          onClick={() => { playSound.click(); setActiveSubTab('security'); }}
          className={`flex-1 py-2.5 px-3 rounded-lg text-[10px] sm:text-xs font-bold font-mono tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === 'security'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          SECURITY
        </button>
        <button
          onClick={() => { playSound.click(); setActiveSubTab('sharing'); }}
          className={`flex-1 py-2.5 px-3 rounded-lg text-[10px] sm:text-xs font-bold font-mono tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === 'sharing'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          SHARING
        </button>
        <button
          onClick={() => { playSound.click(); setActiveSubTab('danger'); }}
          className={`flex-1 py-2.5 px-3 rounded-lg text-[10px] sm:text-xs font-bold font-mono tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === 'danger'
              ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200'
              : 'text-rose-400 hover:text-rose-500'
          }`}
        >
          DANGER
        </button>
      </div>

      {activeSubTab === 'profile' && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl border ${c.card}`}>
        {!parentProfile?.user_id && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h4 className="font-bold text-indigo-900 mb-1 font-display">You are using a Local Account</h4>
              <p className="text-xs text-indigo-700">Create a free account to sync your family's data across devices and never lose your progress.</p>
            </div>
            <button 
              onClick={() => { playSound.click(); if (onRequireAccount) onRequireAccount(); }} 
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold font-mono text-xs shadow-md whitespace-nowrap transition-colors"
            >
              CREATE CLOUD ACCOUNT
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-black font-display uppercase tracking-wide ${c.text}`}>Profile Settings</h3>
            <p className={`text-sm ${c.textMuted}`}>Update your personal information.</p>
          </div>
        </div>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className={`block text-xs font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Account Email</label>
            <input type="text" value={parentProfile?.email || ''} disabled className={`w-full px-4 py-3 rounded-xl border ${c.input} opacity-50 cursor-not-allowed`} />
          </div>
          <div>
            <label className={`block text-xs font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Your Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Mummy, Daddy, Captain"
              className={`w-full px-4 py-3 rounded-xl border ${c.input} focus:ring-2 focus:ring-indigo-500 outline-none`} 
            />
          </div>
          <div>
            <label className={`block text-xs font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Family Name</label>
            <input 
              type="text" 
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="E.g. The Smiths"
              className={`w-full px-4 py-3 rounded-xl border ${c.input} focus:ring-2 focus:ring-indigo-500 outline-none`} 
            />
          </div>

          <div className="pt-4 border-t border-stone-200">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                  className="sr-only" 
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${showAdvanced ? 'bg-indigo-500' : 'bg-stone-300'}`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${showAdvanced ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className={`text-xs font-bold font-display uppercase tracking-widest ${c.text}`}>Enable Advanced Configuration</span>
            </label>
          </div>

          {showAdvanced && (
            <div className="pt-4 border-t border-stone-200">
            <h4 className={`text-xs font-bold font-display uppercase tracking-widest ${c.text} mb-4`}>Levels & Pots Configuration</h4>
            <div className="space-y-4">
              <div>
                <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>XP to Level Up</label>
                <input 
                  type="number" 
                  value={xpToLevelUp}
                  onChange={(e) => setXpToLevelUp(Number(e.target.value))}
                  className={`w-full px-4 py-2 rounded-xl border ${c.input} focus:ring-2 focus:ring-indigo-500 outline-none`} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider text-emerald-600`}>Savings Pot XP</label>
                  <input 
                    type="number" 
                    value={savingsPotUnlockXp}
                    onChange={(e) => setSavingsPotUnlockXp(Number(e.target.value))}
                    className={`w-full px-4 py-2 rounded-xl border border-emerald-200 text-stone-700 bg-emerald-50 focus:ring-2 focus:ring-emerald-500 outline-none`} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider text-orange-600`}>Food Pot XP</label>
                  <input 
                    type="number" 
                    value={foodPotUnlockXp}
                    onChange={(e) => setFoodPotUnlockXp(Number(e.target.value))}
                    className={`w-full px-4 py-2 rounded-xl border border-orange-200 text-stone-700 bg-orange-50 focus:ring-2 focus:ring-orange-500 outline-none`} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <label className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider text-rose-600`}>Gifting Pot XP</label>
                  <input 
                    type="number" 
                    value={giftingPotUnlockXp}
                    onChange={(e) => setGiftingPotUnlockXp(Number(e.target.value))}
                    className={`w-full px-4 py-2 rounded-xl border border-rose-200 text-stone-700 bg-rose-50 focus:ring-2 focus:ring-rose-500 outline-none`} 
                  />
                </div>
              </div>
            </div>
          </div>
          )}
          <button 
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold font-mono text-sm shadow-lg ${c.primaryBtn} disabled:opacity-50`}
          >
            <Save className="w-4 h-4" /> {isSavingProfile ? 'SAVING...' : 'SAVE PROFILE'}
          </button>
          {profileMsg && <p className={`text-sm ${profileMsg.includes('Error') ? 'text-rose-500' : 'text-emerald-500'}`}>{profileMsg}</p>}
        </div>
      </motion.div>
      )}

      {activeSubTab === 'security' && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl border ${c.card}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-black font-display uppercase tracking-wide ${c.text}`}>Security</h3>
            <p className={`text-sm ${c.textMuted}`}>Update your PIN and password.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className={`text-sm font-bold border-b pb-2 border-stone-200 text-indigo-600`}>Parent Dashboard PIN</h4>
            <div>
              <label className={`block text-xs font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>4-Digit PIN</label>
              <input 
                type="text" 
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-full px-4 py-3 rounded-xl border font-mono tracking-[0.5em] text-center text-lg ${c.input} focus:ring-2 focus:ring-amber-500 outline-none`} 
              />
              <p className={`text-xs mt-2 ${c.textMuted}`}>Used to switch from Child Mode to Parent Dashboard.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className={`text-sm font-bold border-b pb-2 border-stone-200 text-indigo-600`}>Account Password</h4>
            <div>
              <label className={`block text-xs font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${c.input} focus:ring-2 focus:ring-amber-500 outline-none`} 
              />
            </div>
            <div>
              <label className={`block text-xs font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${c.input} focus:ring-2 focus:ring-amber-500 outline-none`} 
              />
            </div>
            <div>
              <label className={`block text-xs font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${c.input} focus:ring-2 focus:ring-amber-500 outline-none`} 
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-dashed border-stone-200 dark:border-indigo-900/50 max-w-md">
          <button 
            onClick={handleSaveSecurity}
            disabled={isSavingSecurity}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold font-mono text-sm shadow-lg ${c.primaryBtn} disabled:opacity-50`}
          >
            <KeyRound className="w-4 h-4" /> {isSavingSecurity ? 'SAVING...' : 'SAVE SECURITY SETTINGS'}
          </button>
          {securityMsg && <p className={`text-sm mt-3 ${securityMsg.includes('Error') ? 'text-rose-500' : 'text-emerald-500'}`}>{securityMsg}</p>}
        </div>
      </motion.div>
      )}

      {activeSubTab === 'sharing' && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl border ${c.card}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-black font-display uppercase tracking-wide ${c.text}`}>Family Sharing</h3>
            <p className={`text-sm ${c.textMuted}`}>Share your family dashboard with another parent/guardian.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {!parentProfile?.user_id ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-3">
              <h4 className="font-bold text-emerald-900 font-display">Cloud Account Required</h4>
              <p className="text-xs text-emerald-800">You must create a free account before you can share your dashboard with another parent. This ensures your data is securely synced.</p>
              <button 
                onClick={() => { playSound.click(); if (onRequireAccount) onRequireAccount(); }} 
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold font-mono text-xs shadow-md self-start transition-colors"
              >
                CREATE ACCOUNT TO SHARE
              </button>
            </div>
          ) : (
            <p className={`text-sm ${c.textMuted}`}>
              Copy this link and send it to your partner. When they create an account using this link, they will be joined to your family dashboard. They can set their own PIN and password, but you will both manage the same children and tasks.
            </p>
          )}
          {parentProfile?.family_name && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 bg-emerald-50 border-emerald-200 text-emerald-800`}>
              <Shield className="w-4 h-4" />
              <span className="text-sm font-bold">Currently linked to: {parentProfile.family_name}</span>
            </div>
          )}
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={shareLink}
              className={`flex-1 px-4 py-3 rounded-xl border font-mono text-xs ${c.input}`} 
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                playSound.success();
              }}
              className={`px-4 py-3 rounded-xl font-bold font-mono text-sm shadow-lg ${c.primaryBtn}`}
            >
              COPY
            </button>
          </div>
          
          {/* Linked Accounts List */}
          {linkedParents.length > 1 && (
            <div className="mt-6 space-y-3">
              <h4 className={`text-xs font-bold font-mono uppercase tracking-wider ${c.textMuted}`}>Linked Accounts</h4>
              {linkedParents.map(parent => {
                const isMe = parent.user_id === parentProfile?.user_id;
                return (
                  <div key={parent.user_id} className={`p-4 rounded-xl border flex items-center justify-between bg-stone-50 border-stone-200`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isMe ? 'bg-indigo-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                        {parent.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${c.text}`}>
                          {parent.name || 'Unnamed Parent'}
                          {isMe && <span className="ml-2 text-[10px] font-mono bg-indigo-500/20 text-indigo-500 px-2 py-0.5 rounded-full">YOU</span>}
                        </div>
                        <div className={`text-xs ${c.textMuted}`}>{parent.email}</div>
                      </div>
                    </div>
                    {!isMe && (
                      <button 
                        onClick={() => handleUnlinkAccount(parent.user_id)}
                        className={`p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors`}
                        title="Remove Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
      )}

      {activeSubTab === 'danger' && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl border bg-rose-50 border-rose-200`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-rose-500/20 text-rose-500 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-black font-display uppercase tracking-wide text-rose-500`}>Danger Zone</h3>
            <p className={`text-sm text-rose-600`}>Irreversible destructive actions.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border-rose-100`}>
            <div>
              <h4 className={`font-bold ${c.text}`}>Reset All Data</h4>
              <p className={`text-xs mt-1 ${c.textMuted}`}>Deletes all task completions, history, and resets children's points to zero.</p>
            </div>
            <button 
              onClick={() => setShowResetConfirm(true)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold font-mono text-xs border transition-colors ${c.dangerBtnOutline}`}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" /> FACTORY RESET
            </button>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border-rose-100`}>
            <div>
              <h4 className={`font-bold ${c.text}`}>Reset App & Run Setup</h4>
              <p className={`text-xs mt-1 ${c.textMuted}`}>Wipes all local data, logs you out, and runs the onboarding flow again.</p>
            </div>
            <button 
              onClick={() => {
                if (confirm("Are you sure you want to run setup again? All current data will be erased and you will be logged out.")) {
                  playSound.pinError();
                  if (onRunSetup) onRunSetup();
                }
              }}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold font-mono text-xs border transition-colors ${c.dangerBtnOutline}`}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" /> RUN SETUP
            </button>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border-rose-100`}>
            <div>
              <h4 className={`font-bold ${c.text}`}>Clean Up Duplicates</h4>
              <p className={`text-xs mt-1 ${c.textMuted}`}>Removes any duplicate blueprint templates from multiple imports.</p>
            </div>
            <button 
              onClick={() => {
                onCleanDuplicates();
              }}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold font-mono text-xs border transition-colors ${c.dangerBtnOutline}`}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" /> CLEAN DUPLICATES
            </button>
          </div>
          
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border-rose-100`}>
            <div>
              <h4 className={`font-bold ${c.text}`}>Delete Account</h4>
              <p className={`text-xs mt-1 ${c.textMuted}`}>Permanently deletes your account and all associated family data.</p>
            </div>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold font-mono text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 ${c.dangerBtn}`}
            >
              <Trash2 className="w-4 h-4 inline mr-2" /> DELETE ACCOUNT
            </button>
          </div>
        </div>
      </motion.div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl bg-white border-rose-200`}>
            <h3 className={`text-xl font-black text-center font-display uppercase tracking-wide mb-2 text-stone-900`}>
              Are you sure?
            </h3>
            <p className={`text-center text-sm font-mono mb-6 ${c.textMuted}`}>
              This will reset all children's progress to 0 and delete all history.
            </p>
            <div className="flex items-center gap-2 mb-6 p-3 bg-stone-100 dark:bg-slate-800 rounded-xl">
              <input 
                type="checkbox" 
                id="keep-blueprints"
                checked={keepBlueprints}
                onChange={(e) => setKeepBlueprints(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
              <label htmlFor="keep-blueprints" className={`text-sm font-semibold cursor-pointer select-none ${c.text}`}>
                Keep Quest/Reward Blueprints
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-bold font-mono text-sm transition-colors bg-stone-100 hover:bg-stone-200 text-stone-700`}
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  playSound.pinError();
                  if (onResetData) onResetData(keepBlueprints);
                  setShowResetConfirm(false);
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-bold font-mono text-sm shadow-lg ${c.dangerBtn}`}
              >
                RESET DATA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl bg-white border-red-500`}>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-500/20 text-red-500 rounded-full animate-pulse">
                <AlertTriangle className="w-10 h-10" />
              </div>
            </div>
            <h3 className={`text-xl font-black text-center font-display uppercase tracking-wide mb-2 text-stone-900`}>
              Delete Account
            </h3>
            <p className={`text-center text-sm font-mono mb-6 text-rose-600`}>
              This is permanent. All your family data, children, and progress will be erased forever. You cannot undo this.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  playSound.pinError();
                  if (onDeleteAccount) onDeleteAccount();
                  setShowDeleteConfirm(false);
                }}
                className={`w-full py-4 rounded-xl font-black font-mono tracking-widest text-sm shadow-lg bg-red-600 text-white hover:bg-red-700`}
              >
                YES, DELETE EVERYTHING
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`w-full py-3 px-4 rounded-xl font-bold font-mono text-sm transition-colors bg-stone-100 text-stone-700`}
              >
                NEVERMIND, GO BACK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
