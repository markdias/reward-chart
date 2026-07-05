import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'framer-motion';
import { Settings, Save, AlertTriangle, RefreshCw, Trash2, Shield, User, Link as LinkIcon, KeyRound } from 'lucide-react';
import { ThemeId } from '../utils/theme';
import { ParentProfile } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import { playSound } from '../utils/sound';
import { evaluatePassword, hashPassword } from '../utils/security';
import { PasswordInput } from './PasswordInput';
import { Button } from './ui/Button';

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
  const [levelUpGoldReward, setLevelUpGoldReward] = useState(parentProfile?.level_up_gold_reward ?? 500);
  const [weeklyPointsTarget, setWeeklyPointsTarget] = useState(parentProfile?.weekly_points_target ?? 100);
  const [weeklyRewardPoints, setWeeklyRewardPoints] = useState(parentProfile?.weekly_reward_points ?? 200);
  const [monthlyPointsTarget, setMonthlyPointsTarget] = useState(parentProfile?.monthly_points_target ?? 500);
  const [monthlyRewardPoints, setMonthlyRewardPoints] = useState(parentProfile?.monthly_reward_points ?? 1000);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [dashboardStyle, setDashboardStyle] = useState('modern');

  React.useEffect(() => {
    if (parentProfile) {
      setName(parentProfile.name || '');
      setFamilyName(parentProfile.family_name || '');
      setLevelUpGoldReward(parentProfile.level_up_gold_reward ?? 500);
      setWeeklyPointsTarget(parentProfile.weekly_points_target ?? 100);
      setWeeklyRewardPoints(parentProfile.weekly_reward_points ?? 200);
      setMonthlyPointsTarget(parentProfile.monthly_points_target ?? 500);
      setMonthlyRewardPoints(parentProfile.monthly_reward_points ?? 1000);
      setDashboardStyle(parentProfile.dashboard_style || 'modern');
    }
  }, [parentProfile]);
  
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
      card: 'card-panel',
      text: 'text-stone-900',
      textMuted: 'text-stone-500',
      input: 'input-field',
      primaryBtn: 'btn-warning w-full !px-4 !py-3',
      dangerBtn: 'btn-danger w-full !px-4 !py-3',
      dangerBtnOutline: 'btn-secondary w-full !px-4 !py-3 !text-rose-600 border-rose-300',
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
          weekly_points_target: weeklyPointsTarget,
          weekly_reward_points: weeklyRewardPoints,
          monthly_reward_points: monthlyRewardPoints,
          dashboard_style: dashboardStyle
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
        if (newPassword) {
          if (newPassword !== confirmPassword) throw new Error("New passwords do not match");
          const { isValid } = evaluatePassword(newPassword);
          if (!isValid) throw new Error("Please ensure your new password meets all requirements.");
          if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
          
          const emailKey = (parentProfile?.email || 'local_parent@rewardchart.app').trim().toLowerCase();
          const stored = localStorage.getItem('RCH_LOCAL_CREDENTIALS');
          const creds = stored ? JSON.parse(stored) : {};
          
          // Verify current password if one was set
          const savedPass = creds[emailKey];
          if (savedPass) {
            const hashedCurrent = await hashPassword(currentPassword, emailKey);
            const isMatch = hashedCurrent === savedPass || currentPassword === savedPass;
            if (!isMatch) {
              throw new Error("Invalid current password");
            }
          }
          
          const hashedNew = await hashPassword(newPassword, emailKey);
          creds[emailKey] = hashedNew;
          localStorage.setItem('RCH_LOCAL_CREDENTIALS', JSON.stringify(creds));
          
          setSecurityMsg('Local password updated successfully!');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          playSound.success();
          setIsSavingSecurity(false);
          return;
        }
        throw new Error("Cannot change settings. Provide a new password to update.");
      }

      // Update Password for Supabase Cloud accounts
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) throw new Error("Current password is required");
        if (newPassword !== confirmPassword) throw new Error("New passwords do not match");
        
        const { isValid } = evaluatePassword(newPassword);
        if (!isValid) throw new Error("Please ensure your new password meets all requirements.");
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
        <Button
          variant={activeSubTab === 'profile' ? 'secondary' : 'ghost'}
          size="sm"
          className="flex-1 whitespace-nowrap"
          onClick={() => { playSound.click(); setActiveSubTab('profile'); }}
        >
          PROFILE
        </Button>
        <Button
          variant={activeSubTab === 'security' ? 'secondary' : 'ghost'}
          size="sm"
          className="flex-1 whitespace-nowrap"
          onClick={() => { playSound.click(); setActiveSubTab('security'); }}
        >
          SECURITY
        </Button>
        <Button
          variant={activeSubTab === 'sharing' ? 'secondary' : 'ghost'}
          size="sm"
          className="flex-1 whitespace-nowrap"
          onClick={() => { playSound.click(); setActiveSubTab('sharing'); }}
        >
          SHARING
        </Button>
        <Button
          variant={activeSubTab === 'danger' ? 'danger' : 'ghost'}
          size="sm"
          className={`flex-1 whitespace-nowrap ${activeSubTab !== 'danger' ? 'text-rose-400 hover:text-rose-500' : ''}`}
          onClick={() => { playSound.click(); setActiveSubTab('danger'); }}
        >
          DANGER
        </Button>
      </div>

      {activeSubTab === 'profile' && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl border ${c.card}`}>
        {!parentProfile?.user_id && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h4 className="font-bold text-indigo-900 mb-1 font-display">You are using a Local Account</h4>
              <p className="text-xs text-indigo-700">Create a free account to sync your family's data across devices and never lose your progress.</p>
            </div>
            <Button 
              variant="primary"
              size="sm"
              onClick={() => { playSound.click(); if (onRequireAccount) onRequireAccount(); }} 
            >
              CREATE CLOUD ACCOUNT
            </Button>
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

          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <h4 className={`text-sm font-bold border-b pb-2 mb-4 border-stone-100 text-indigo-600`}>Appearance</h4>
            <label className={`block text-xs font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Child Dashboard Style</label>
            <select
              value={dashboardStyle}
              onChange={(e) => setDashboardStyle(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${c.input} focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white font-semibold`}
            >
              <option value="modern">Modern (Default)</option>
              <option value="playful_pop">Playful Pop</option>
            </select>
            <p className="text-[10px] mt-2 text-stone-500">Choose between the clean modern look or the bold & chunky "Playful Pop" aesthetic.</p>
          </div>

          <Button 
            variant="warning"
            fullWidth
            onClick={handleSaveProfile}
            isLoading={isSavingProfile}
            leftIcon={<Save className="w-4 h-4" />}
          >
            SAVE PROFILE
          </Button>
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
            <p className={`text-sm ${c.textMuted}`}>Update your parent portal password.</p>
          </div>
        </div>
        
        <div className="max-w-md space-y-4">
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
            <PasswordInput
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Leave blank to keep current"
                showPolicy={newPassword.length > 0}
                className={`bg-white border-stone-200 text-stone-900 placeholder:text-stone-400`}
              />
          </div>
          <div>
            <label className={`block text-xs font-bold font-mono mb-2 uppercase tracking-wider ${c.textMuted}`}>Confirm New Password</label>
            <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm new password"
                className={`bg-white border-stone-200 text-stone-900 placeholder:text-stone-400`}
              />
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-dashed border-stone-200 dark:border-indigo-900/50 max-w-md">
          <Button 
            variant="warning"
            fullWidth
            onClick={handleSaveSecurity}
            isLoading={isSavingSecurity}
            leftIcon={<KeyRound className="w-4 h-4" />}
          >
            SAVE SECURITY SETTINGS
          </Button>
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
              <Button 
                variant="primary"
                size="sm"
                onClick={() => { playSound.click(); if (onRequireAccount) onRequireAccount(); }} 
                className="self-start"
              >
                CREATE ACCOUNT TO SHARE
              </Button>
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
            <Button 
              variant="warning"
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                playSound.success();
              }}
            >
              COPY
            </Button>
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
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUnlinkAccount(parent.user_id)}
                        className="text-rose-500"
                        title="Remove Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              FACTORY RESET
            </Button>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border-rose-100`}>
            <div>
              <h4 className={`font-bold ${c.text}`}>Reset App & Run Setup</h4>
              <p className={`text-xs mt-1 ${c.textMuted}`}>Wipes all local data, logs you out, and runs the onboarding flow again.</p>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to run setup again? All current data will be erased and you will be logged out.")) {
                  playSound.pinError();
                  if (onRunSetup) onRunSetup();
                }
              }}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              RUN SETUP
            </Button>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border-rose-100`}>
            <div>
              <h4 className={`font-bold ${c.text}`}>Clean Up Duplicates</h4>
              <p className={`text-xs mt-1 ${c.textMuted}`}>Removes any duplicate blueprint templates from multiple imports.</p>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                onCleanDuplicates();
              }}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              CLEAN DUPLICATES
            </Button>
          </div>
          
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border-rose-100`}>
            <div>
              <h4 className={`font-bold ${c.text}`}>Delete Account</h4>
              <p className={`text-xs mt-1 ${c.textMuted}`}>Permanently deletes your account and all associated family data.</p>
            </div>
            <Button 
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              DELETE ACCOUNT
            </Button>
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
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowResetConfirm(false)}
              >
                CANCEL
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  playSound.pinError();
                  if (onResetData) onResetData(keepBlueprints);
                  setShowResetConfirm(false);
                }}
              >
                RESET DATA
              </Button>
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
              <Button
                variant="danger"
                fullWidth
                onClick={() => {
                  playSound.pinError();
                  if (onDeleteAccount) onDeleteAccount();
                  setShowDeleteConfirm(false);
                }}
              >
                YES, DELETE EVERYTHING
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowDeleteConfirm(false)}
              >
                NEVERMIND, GO BACK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
