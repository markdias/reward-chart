import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'motion/react';
import { Settings, Save, AlertTriangle, RefreshCw, Trash2, Shield, User, Link as LinkIcon, KeyRound, Bell } from 'lucide-react';
import OneSignal from 'react-onesignal';
import { ThemeId } from '../utils/theme';
import { ParentProfile } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import { playSound } from '../utils/sound';
import { evaluatePassword, hashPassword } from '../utils/security';
import { PasswordInput } from './PasswordInput';
import { Tooltip } from './ui/Tooltip';
import { Button } from './ui/Button';
import { SettingsBlock, SettingsRow, SettingsSelectRow, SettingsActionRow } from './ui/SettingsList';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface SettingsTabProps {
  theme: ThemeId;
  parentProfile?: ParentProfile | null;
  linkedParents?: ParentProfile[];
  onResetData?: (keepTemplates: boolean) => void;
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

  const [themeSelection, setThemeSelection] = useState('modern');

  React.useEffect(() => {
    if (parentProfile) {
      setName(parentProfile.name || '');
      setFamilyName(parentProfile.family_name || '');
      setLevelUpGoldReward(parentProfile.level_up_gold_reward ?? 500);
      setWeeklyPointsTarget(parentProfile.weekly_points_target ?? 100);
      setWeeklyRewardPoints(parentProfile.weekly_reward_points ?? 200);
      setMonthlyPointsTarget(parentProfile.monthly_points_target ?? 500);
      setMonthlyRewardPoints(parentProfile.monthly_reward_points ?? 1000);
      setThemeSelection(parentProfile.dashboard_style || 'modern');
    }
  }, [parentProfile]);
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securityMsg, setSecurityMsg] = useState('');
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [keepTemplates, setKeepTemplates] = useState(true);
  
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
  
  const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  const shareLink = parentProfile?.share_token 
    ? `${baseUrl}/?share=${parentProfile.share_token}`
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
          dashboard_style: themeSelection
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
      
      <div className="flex border-b-2 border-stone-100 mb-8 w-full">
        <button
          onClick={() => { playSound.click(); setActiveSubTab('profile'); }}
          className={`flex-1 py-3 px-1 sm:px-4 text-[10px] sm:text-xs font-bold transition-all border-b-2 -mb-[2px]
            ${activeSubTab === 'profile' 
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
        >
          PROFILE
        </button>
        <button
          onClick={() => { playSound.click(); setActiveSubTab('security'); }}
          className={`flex-1 py-3 px-1 sm:px-4 text-[10px] sm:text-xs font-bold transition-all border-b-2 -mb-[2px]
            ${activeSubTab === 'security' 
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
        >
          SECURITY
        </button>
        <button
          onClick={() => { playSound.click(); setActiveSubTab('sharing'); }}
          className={`flex-1 py-3 px-1 sm:px-4 text-[10px] sm:text-xs font-bold transition-all border-b-2 -mb-[2px]
            ${activeSubTab === 'sharing' 
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
        >
          SHARING
        </button>
        <button
          onClick={() => { playSound.click(); setActiveSubTab('danger'); }}
          className={`flex-1 py-3 px-1 sm:px-4 text-[10px] sm:text-xs font-bold transition-all border-b-2 -mb-[2px]
            ${activeSubTab === 'danger' 
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
        >
          DANGER
        </button>
      </div>

      {activeSubTab === 'profile' && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 sm:p-10 rounded-[2.5rem] border-2 border-stone-200 bg-stone-100 shadow-sm relative overflow-hidden">
        <h3 className="text-xl font-black font-display text-stone-800 mb-6 text-center tracking-tight">Profile Tab</h3>
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
        
        <div className="max-w-md mx-auto">
          <SettingsBlock title="Personal Information">
            <SettingsRow label="Account Email" value={parentProfile?.email || ''} type="text" onChange={() => {}} />
            <SettingsRow label="Your Name" value={name} type="text" onChange={(v) => setName(v)} />
            <SettingsRow label="Family Name" value={familyName} type="text" onChange={(v) => setFamilyName(v)} isLast />
          </SettingsBlock>

          <SettingsBlock title="Appearance">
            <SettingsSelectRow 
              label="Theme" 
              value={themeSelection}
              onChange={(v) => setThemeSelection(v)}
              options={[
                { label: 'System', value: 'system' },
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
              isLast 
            />
          </SettingsBlock>

          <SettingsBlock title="Notifications">
            <SettingsRow 
              label="Push Notifications" 
              isToggle 
              toggleActive={!!OneSignal?.Notifications?.permission}
              onToggle={async () => {
                playSound.click();
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
                const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
                
                if (isIOS && !isStandalone) {
                  alert("To enable Push Notifications on your iPhone/iPad, you must first add this app to your Home Screen.\\n\\nTap the Share button at the bottom of Safari, scroll down, and select 'Add to Home Screen'.");
                  return;
                }

                try {
                  if (!import.meta.env.VITE_ONESIGNAL_APP_ID) {
                    alert("OneSignal App ID is missing.");
                    return;
                  }

                  if (OneSignal.Notifications) {
                    if (!OneSignal.Notifications.isPushSupported()) {
                      alert("Push Notifications are not supported on this device.");
                      return;
                    }
                    if (OneSignal.Notifications.permission === true) {
                      alert("Push Notifications are already enabled!");
                      return;
                    }
                  }

                  const accepted = await OneSignal.Notifications.requestPermission();
                  if (accepted) alert("Success! Push notifications enabled.");
                  else alert("Permission not granted.");
                } catch (e: any) {
                  alert("Error requesting permission: " + (e?.message || e));
                }
              }}
              isLast 
            />
          </SettingsBlock>

          <Button 
            variant="primary"
            fullWidth
            onClick={handleSaveProfile}
            isLoading={isSavingProfile}
            leftIcon={<Save className="w-5 h-5" />}
            className="mt-8 py-4 font-black tracking-widest shadow-xl shadow-stone-900/10"
          >
            SAVE PROFILE
          </Button>
          {profileMsg && <p className={`text-sm font-bold mt-4 text-center ${profileMsg.includes('Error') ? 'text-rose-500' : 'text-emerald-500'}`}>{profileMsg}</p>}
        </div>
      </motion.div>
      )}

      {activeSubTab === 'security' && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 sm:p-10 rounded-[2.5rem] border-2 border-stone-200 bg-stone-100 shadow-sm relative overflow-hidden">
        <h3 className="text-xl font-black font-display text-stone-800 mb-6 text-center tracking-tight">Security Tab</h3>
        
        <div className="max-w-md mx-auto">
          <SettingsBlock title="Account Password">
            <div className="p-4 border-b border-stone-100 bg-white">
              <label className="block text-sm font-bold text-stone-700 mb-2">Current Password</label>
              <Input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-cyan-400 outline-none transition-colors"
              />
            </div>
            <div className="p-4 border-b border-stone-100 bg-white">
              <label className="block text-sm font-bold text-stone-700 mb-2">New Password</label>
              <PasswordInput
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Leave blank to keep current"
                showPolicy={newPassword.length > 0}
                className="bg-white border-2 border-stone-200 rounded-xl"
              />
            </div>
            <div className="p-4 bg-white">
              <label className="block text-sm font-bold text-stone-700 mb-2">Confirm New Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm new password"
                className="bg-white border-2 border-stone-200 rounded-xl"
              />
            </div>
          </SettingsBlock>
          
          <Button 
            variant="primary"
            fullWidth
            onClick={handleSaveSecurity}
            isLoading={isSavingSecurity}
            leftIcon={<KeyRound className="w-5 h-5" />}
            className="mt-8 py-4 font-black tracking-widest shadow-xl shadow-stone-900/10"
          >
            UPDATE PASSWORD
          </Button>
          {securityMsg && <p className={`text-sm font-bold mt-4 text-center ${securityMsg.includes('Error') ? 'text-rose-500' : 'text-emerald-500'}`}>{securityMsg}</p>}
        </div>
      </motion.div>
      )}

      {activeSubTab === 'sharing' && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 sm:p-10 rounded-[2.5rem] border-2 border-stone-200 bg-stone-100 shadow-sm relative overflow-hidden">
        <h3 className="text-xl font-black font-display text-stone-800 mb-6 text-center tracking-tight">Sharing Tab</h3>
        
        <div className="max-w-md mx-auto space-y-6">
          {!parentProfile?.user_id ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col gap-3">
              <h4 className="font-bold text-emerald-900 font-display">Cloud Account Required</h4>
              <p className="text-xs text-emerald-800">You must create a free account before you can share your dashboard with another parent. This ensures your data is securely synced.</p>
              <Button variant="primary" size="sm" onClick={() => { playSound.click(); if (onRequireAccount) onRequireAccount(); }}>
                CREATE ACCOUNT TO SHARE
              </Button>
            </div>
          ) : (
            <p className="text-sm text-stone-500 font-semibold text-center mb-6">
              Copy this link and send it to your partner. They will be joined to your family dashboard.
            </p>
          )}

          {parentProfile?.family_name && (
            <div className="p-4 rounded-2xl border flex items-center justify-center gap-2 bg-emerald-50 border-emerald-200 text-emerald-800">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-bold">Linked to: {parentProfile.family_name}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Input 
              type="text" 
              readOnly 
              value={shareLink}
               
            />
            <Button 
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                playSound.success();
              }}
            >
              COPY
            </Button>
          </div>
          
          {linkedParents.length > 1 && (
            <SettingsBlock title="Linked Accounts">
              {linkedParents.map((parent, idx) => {
                const isMe = parent.user_id === parentProfile?.user_id;
                return (
                  <div key={parent.user_id} className={`p-4 flex items-center justify-between bg-white ${idx !== linkedParents.length - 1 ? 'border-b border-stone-100' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isMe ? 'bg-indigo-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                        {parent.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-stone-800">
                          {parent.name || 'Unnamed'}
                          {isMe && <span className="ml-2 text-[10px] font-sans bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">YOU</span>}
                        </div>
                        <div className="text-xs text-stone-400">{parent.email}</div>
                      </div>
                    </div>
                    {!isMe && (
                      <button onClick={() => handleUnlinkAccount(parent.user_id)} className="text-rose-400 hover:text-rose-600 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </SettingsBlock>
          )}
        </div>
      </motion.div>
      )}

      {activeSubTab === 'danger' && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 sm:p-10 rounded-[2.5rem] border-2 border-stone-200 bg-stone-100 shadow-sm relative overflow-hidden">
        <h3 className="text-xl font-black font-display text-rose-600 mb-6 text-center tracking-tight">Danger Zone</h3>
        
        <div className="max-w-md mx-auto space-y-4">
          <SettingsBlock>
            <SettingsActionRow 
              label="Reset All Data" 
              icon={RefreshCw} 
              onClick={() => setShowResetConfirm(true)} 
              danger
            />
            <SettingsActionRow 
              label="Run Setup Wizard" 
              icon={RefreshCw} 
              onClick={() => {
                if (confirm("Are you sure you want to run setup again? All current data will be erased and you will be logged out.")) {
                  playSound.pinError();
                  if (onRunSetup) onRunSetup();
                }
              }} 
              danger
            />
            <SettingsActionRow 
              label="Clean Duplicates" 
              icon={RefreshCw} 
              onClick={() => onCleanDuplicates()} 
              danger
            />
            <SettingsActionRow 
              label="Delete Account" 
              icon={Trash2} 
              onClick={() => setShowDeleteConfirm(true)} 
              isLast
              danger
            />
          </SettingsBlock>
        </div>
      </motion.div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl bg-white border-rose-200`}>
            <h3 className={`text-xl font-black text-center font-display uppercase tracking-wide mb-2 text-stone-900`}>
              Are you sure?
            </h3>
            <p className={`text-center text-sm font-sans mb-6 ${c.textMuted}`}>
              This will reset all children's progress to 0 and delete all history.
            </p>
            <div className="flex items-center gap-2 mb-6 p-3 bg-stone-100 dark:bg-stone-800 rounded-xl">
              <Input 
                type="checkbox" 
                id="keep-templates"
                checked={keepTemplates}
                onChange={(e) => setKeepTemplates(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
              <label htmlFor="keep-templates" className={`text-sm font-semibold cursor-pointer select-none ${c.text}`}>
                Keep Quest/Reward Templates
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
                  if (onResetData) onResetData(keepTemplates);
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
            <p className={`text-center text-sm font-sans mb-6 text-rose-600`}>
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
