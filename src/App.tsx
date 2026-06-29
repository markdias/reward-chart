import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { App as CapacitorApp } from '@capacitor/app';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import ParentDashboard from './components/ParentDashboard';
import ChildDashboard from './components/ChildDashboard';
import LockScreen from './components/LockScreen';
import Confetti from './components/Confetti';
import OnboardingWizard, { OnboardingData } from './components/Onboarding/OnboardingWizard';
import StepCreateAccount from './components/Onboarding/StepCreateAccount';
import { 
  INITIAL_CHILDREN, INITIAL_TASKS, INITIAL_COMPLETIONS, INITIAL_REWARDS, INITIAL_REDEMPTIONS
} from './data/mockData';
import { Child, Task, TaskCompletion, Reward, RewardRedemption, ParentProfile, GiftingRequest } from './types';
import { playSound } from './utils/sound';
import { ThemeId, THEME_PRESETS } from './utils/theme';
import { PREMADE_TASKS, PREMADE_REWARDS } from './data/premadeTemplates';
import { getSupabaseClient, getCurrentUserEmail, signOut } from './utils/supabase';
import { getCurrentWeekKey, getCurrentMonthKey, getNextWeeklyResetDate, getNextMonthlyResetDate } from './utils/date';

export default function App() {
  const activeTheme = 'sunny_toybox';

  // Auth state
  const [parentEmail, setParentEmail] = useState<string | null>(
    localStorage.getItem('RCH_PARENT_EMAIL')
  );
  const [isParentMode, setIsParentMode] = useState<boolean>(
    localStorage.getItem('RCH_PARENT_MODE') === 'true'
  );
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(
    localStorage.getItem('RCH_ONBOARDING_COMPLETE') === 'true'
  );

  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const [showLogin, setShowLogin] = useState<boolean>(
    new URLSearchParams(window.location.search).has('share')
  );
  
  // Security PIN state (default is 1234)
  const [parentPin, setParentPin] = useState<string>(
    localStorage.getItem('RCH_PARENT_PIN') || '1234'
  );
  
  // Profile state
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [linkedParents, setLinkedParents] = useState<ParentProfile[]>([]);


  // Core records lists
  const [children, setChildren] = useState<Child[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [giftingRequests, setGiftingRequests] = useState<GiftingRequest[]>([]);

  // UI state overlays
  const [showLockScreen, setShowLockScreen] = useState<boolean>(false);
  const [celebrationActive, setCelebrationActive] = useState<boolean>(false);
  
  // Guided Access Lock
  const [lockedChildId, setLockedChildId] = useState<string | null>(
    localStorage.getItem('RCH_LOCKED_CHILD_ID')
  );



  // Helper fallback to load local storage state or blank state
  const loadLocalStorageFallback = (isDemo: boolean) => {
    const keyChildren = parentEmail ? `RCH_CHILDREN_${parentEmail}` : 'RCH_CHILDREN';
    const keyTasks = parentEmail ? `RCH_TASKS_${parentEmail}` : 'RCH_TASKS';
    const keyCompletions = parentEmail ? `RCH_COMPLETIONS_${parentEmail}` : 'RCH_COMPLETIONS';
    const keyRewards = parentEmail ? `RCH_REWARDS_${parentEmail}` : 'RCH_REWARDS';
    const keyRedemptions = parentEmail ? `RCH_REDEMPTIONS_${parentEmail}` : 'RCH_REDEMPTIONS';
    const keyGiftingRequests = parentEmail ? `RCH_GIFTING_${parentEmail}` : 'RCH_GIFTING';

    const savedProfile = localStorage.getItem('RCH_PARENT_PROFILE');
    if (savedProfile) {
      setParentProfile(JSON.parse(savedProfile));
    }

    const savedChildren = localStorage.getItem(keyChildren);
    const savedTasks = localStorage.getItem(keyTasks);
    const savedCompletions = localStorage.getItem(keyCompletions);
    const savedRewards = localStorage.getItem(keyRewards);
    const savedRedemptions = localStorage.getItem(keyRedemptions);
    const savedGiftingRequests = localStorage.getItem(keyGiftingRequests);

    if (savedChildren) {
      setChildren(JSON.parse(savedChildren));
    } else {
      const initial = isDemo ? INITIAL_CHILDREN : [];
      setChildren(initial);
      localStorage.setItem(keyChildren, JSON.stringify(initial));
    }

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const initial = isDemo ? INITIAL_TASKS : [];
      setTasks(initial);
      localStorage.setItem(keyTasks, JSON.stringify(initial));
    }

    if (savedCompletions) {
      setCompletions(JSON.parse(savedCompletions));
    } else {
      const initial = isDemo ? INITIAL_COMPLETIONS : [];
      setCompletions(initial);
      localStorage.setItem(keyCompletions, JSON.stringify(initial));
    }

    if (savedRewards) {
      setRewards(JSON.parse(savedRewards));
    } else {
      const initial = isDemo ? INITIAL_REWARDS : [];
      setRewards(initial);
      localStorage.setItem(keyRewards, JSON.stringify(initial));
    }

    if (savedRedemptions) {
      setRedemptions(JSON.parse(savedRedemptions));
    } else {
      const initial = isDemo ? INITIAL_REDEMPTIONS : [];
      setRedemptions(initial);
      localStorage.setItem(keyRedemptions, JSON.stringify(initial));
    }

    if (savedGiftingRequests) {
      setGiftingRequests(JSON.parse(savedGiftingRequests));
    } else {
      setGiftingRequests([]);
      localStorage.setItem(keyGiftingRequests, JSON.stringify([]));
    }
  };

  // Load records on start/auth change from localStorage or Supabase
  useEffect(() => {
    if (!parentEmail) {
      return;
    }

    const isDemo = parentEmail === 'demo_parent@rewardchart.app';
    const isLocal = parentEmail === 'local_parent@rewardchart.app';
    const supabase = getSupabaseClient();

    if (supabase && !isDemo && !isLocal) {
      // Real Supabase backend - fetch live DB rows
      const fetchSupabaseData = async () => {
        try {
          let currentFamilyId = parentEmail;

          // Fetch parent profile first
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            const { data: profile } = await supabase
              .from('parent_profiles')
              .select('*')
              .eq('user_id', sessionData.session.user.id)
              .maybeSingle();
            
            if (profile) {
              // Automatically generate a share_token if one is missing from an older row
              if (!profile.share_token) {
                profile.share_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                await supabase.from('parent_profiles').update({ share_token: profile.share_token }).eq('user_id', profile.user_id);
              }
              setParentProfile(profile);
              
              if (profile.pin) {
                setParentPin(profile.pin);
                localStorage.setItem('RCH_PARENT_PIN', profile.pin);
              }

              currentFamilyId = profile.family_id;
              setParentPin(profile.pin);
              localStorage.setItem('RCH_PARENT_PIN', profile.pin);
            } else {
              // Creating a new profile
              let familyId = parentEmail;
              let inheritedFamilyName = null;
              const urlParams = new URLSearchParams(window.location.search);
              const shareToken = urlParams.get('share');
              if (shareToken) {
                const { data: inviter } = await supabase
                  .from('parent_profiles')
                  .select('*')
                  .eq('share_token', shareToken)
                  .maybeSingle();
                if (inviter) {
                  familyId = inviter.family_id;
                  inheritedFamilyName = inviter.family_name;
                }
              }

              const meta = sessionData.session.user.user_metadata || {};
              const localProfileRaw = localStorage.getItem('RCH_PARENT_PROFILE');
              const localProfileObj = localProfileRaw ? JSON.parse(localProfileRaw) : {};

              const newProfile = {
                user_id: sessionData.session.user.id,
                email: sessionData.session.user.email || parentEmail,
                family_id: familyId,
                family_name: inheritedFamilyName || meta.family_name || localProfileObj.family_name || null,
                pin: meta.pin || localProfileObj.pin || '1234',
                name: meta.name || localProfileObj.name || null,
                share_token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
              };
              await supabase.from('parent_profiles').upsert(newProfile, { onConflict: 'user_id' });
              
              // If this is a brand new family (no share token), seed the predefined templates OR migrate local data
              if (!shareToken) {
                const localEmail = 'local_parent@rewardchart.app';
                const localChildren = localStorage.getItem(`RCH_CHILDREN_${localEmail}`);
                const localTasks = localStorage.getItem(`RCH_TASKS_${localEmail}`);
                const localCompletions = localStorage.getItem(`RCH_COMPLETIONS_${localEmail}`);
                const localRewards = localStorage.getItem(`RCH_REWARDS_${localEmail}`);
                const localRedemptions = localStorage.getItem(`RCH_REDEMPTIONS_${localEmail}`);
                
                if (localChildren && JSON.parse(localChildren).length > 0) {
                   // Migrate all local data to this new family ID
                   const parsedChildren = JSON.parse(localChildren).map((c: any) => ({...c, parent_id: familyId}));
                   const parsedTasks = localTasks ? JSON.parse(localTasks).map((t: any) => ({...t, parent_id: familyId})) : [];
                   const parsedCompletions = localCompletions ? JSON.parse(localCompletions) : [];
                   const parsedRewards = localRewards ? JSON.parse(localRewards).map((r: any) => ({...r, parent_id: familyId})) : [];
                   const parsedRedemptions = localRedemptions ? JSON.parse(localRedemptions).map((r: any) => ({...r, parent_id: familyId})) : [];
                   const localGifting = localStorage.getItem(`RCH_GIFTING_${localEmail}`);
                   const parsedGifting = localGifting ? JSON.parse(localGifting).map((r: any) => ({...r, parent_id: familyId})) : [];
                   
                   if (parsedChildren.length) await supabase.from('children').insert(parsedChildren);
                   if (parsedTasks.length) await supabase.from('tasks').insert(parsedTasks);
                   if (parsedCompletions.length) await supabase.from('completions').insert(parsedCompletions);
                   if (parsedRewards.length) await supabase.from('rewards').insert(parsedRewards);
                   if (parsedRedemptions.length) await supabase.from('reward_redemptions').insert(parsedRedemptions);
                   if (parsedGifting.length) await supabase.from('gifting_requests').insert(parsedGifting);
                } else {
                   const tasksToInsert = PREMADE_TASKS.map((t, index) => ({ 
                     ...t, 
                     id: `task_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`,
                     created_at: new Date().toISOString(),
                     parent_id: familyId 
                   }));
                   const rewardsToInsert = PREMADE_REWARDS.map((r, index) => ({ 
                     ...r, 
                     id: `reward_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`,
                     created_at: new Date().toISOString(),
                     parent_id: familyId 
                   }));
                   await supabase.from('tasks').insert(tasksToInsert);
                   await supabase.from('rewards').insert(rewardsToInsert);
                }
              }
              
              setParentProfile(newProfile as ParentProfile);
              
              setParentPin(newProfile.pin);
              localStorage.setItem('RCH_PARENT_PIN', newProfile.pin);

              currentFamilyId = familyId;
            }
          }

          // Fetch linked parents
          const { data: linkedProfiles } = await supabase
            .from('parent_profiles')
            .select('*')
            .eq('family_id', currentFamilyId);
          if (linkedProfiles) {
            setLinkedParents(linkedProfiles);
          }


          const keyChildren = `RCH_CHILDREN_${currentFamilyId}`;
          const keyTasks = `RCH_TASKS_${currentFamilyId}`;
          const keyCompletions = `RCH_COMPLETIONS_${currentFamilyId}`;
          const keyRewards = `RCH_REWARDS_${currentFamilyId}`;

          // Fetch children
          const { data: dbChildren, error: errChildren } = await supabase
            .from('children')
            .select('*')
            .eq('parent_id', currentFamilyId);
          
          if (!errChildren) {
            let processedChildren = dbChildren || [];
            
            // --- Main Money Daily/Monthly Logic ---
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const updatesByChildId: Record<string, Partial<Child>> = {};
            
            processedChildren = processedChildren.map(child => {
              let updated = { ...child };
              let updates: Partial<Child> = {};
              
              // 1. Check if Monthly Maintenance is Due
              const lastMaintenance = updated.main_last_maintenance_date 
                ? new Date(updated.main_last_maintenance_date) 
                : new Date();
              const daysSinceMaintenance = Math.floor(Math.abs(now.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysSinceMaintenance >= 30 && !updated.is_rent_due) {
                updates.is_rent_due = true;
                updates.rent_due_date = now.toISOString();
                localStorage.setItem(`pending_maintenance_popup_${updated.id}`, 'rent_due');
                updated = { ...updated, ...updates };
              }

              // 1b. Rent overdue penalty (5 coins/day)
              if (updated.is_rent_due && updated.rent_due_date) {
                const rentDate = new Date(updated.rent_due_date);
                const diffTime = Math.abs(now.getTime() - rentDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays > 0) {
                  const leaked = diffDays * 5; // 5 points per day overdue
                  updates.points = Math.max(0, updated.points - leaked);
                  updates.rent_due_date = now.toISOString(); // Reset date
                  updated = { ...updated, ...updates };
                }
              }

              // 2. Process Leak for Random Damage (1 coin per day since damage date, from main points)
              if (updated.main_pot_damaged && updated.main_damage_date) {
                const damageDate = new Date(updated.main_damage_date);
                const diffTime = Math.abs(now.getTime() - damageDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays > 0) {
                  const leaked = diffDays * 1; // 1 point per day
                  updates.points = Math.max(0, updated.points - leaked);
                  updates.main_damage_date = now.toISOString(); // Reset date
                  updated = { ...updated, ...updates };
                }
              }
              
              // 3. Random Damage Event (~1/30 chance per day)
              if (updated.last_hunger_check_date !== todayStr) {
                if (!updated.main_pot_damaged && Math.random() < 0.033) {
                  updates.main_pot_damaged = true;
                  updates.main_damage_date = now.toISOString();
                  localStorage.setItem(`pending_maintenance_popup_${updated.id}`, 'broken');
                  updated = { ...updated, ...updates };
                }
              }
              
              // 4. Retroactive Unlock Sync
              const savingsLvl = parentProfile?.savings_pot_unlock_level ?? 1;
              const savingsXpReq = parentProfile?.savings_pot_unlock_xp ?? 50;
              if (!updated.savings_unlocked && (updated.level > savingsLvl || (updated.level === savingsLvl && (updated.xp_in_level || 0) >= savingsXpReq))) {
                updates.savings_unlocked = true;
                updates.savings_unlock_seen = false;
                updated = { ...updated, ...updates };
              }

              const maintenanceLvl = parentProfile?.maintenance_pot_unlock_level ?? 4;
              const maintenanceXpReq = parentProfile?.maintenance_pot_unlock_xp ?? 50;
              if (!updated.maintenance_unlocked && (updated.level > maintenanceLvl || (updated.level === maintenanceLvl && (updated.xp_in_level || 0) >= maintenanceXpReq))) {
                updates.maintenance_unlocked = true;
                updates.maintenance_unlock_seen = false;
                updated = { ...updated, ...updates };
              }
              
              const foodLvl = parentProfile?.food_pot_unlock_level ?? 2;
              const foodXpReq = parentProfile?.food_pot_unlock_xp ?? 50;
              if (!updated.food_pot_unlocked && (updated.level > foodLvl || (updated.level === foodLvl && (updated.xp_in_level || 0) >= foodXpReq))) {
                updates.food_pot_unlocked = true;
                updates.food_pot_unlock_seen = false;
                updated = { ...updated, ...updates };
              }
              
              const giftingLvl = parentProfile?.gifting_pot_unlock_level ?? 3;
              const giftingXpReq = parentProfile?.gifting_pot_unlock_xp ?? 50;
              if (!updated.gifting_unlocked && (updated.level > giftingLvl || (updated.level === giftingLvl && (updated.xp_in_level || 0) >= giftingXpReq))) {
                updates.gifting_unlocked = true;
                updates.gifting_unlock_seen = false;
                updated = { ...updated, ...updates };
              }
              
              if (Object.keys(updates).length > 0) {
                updatesByChildId[updated.id] = updates;
              }
              return updated;
            });
            
            if (Object.keys(updatesByChildId).length > 0) {
              // Fire and forget updates to DB so we don't block load
              Object.entries(updatesByChildId).forEach(([id, updates]) => {
                 supabase.from('children').update(updates).eq('id', id).then();
              });
            }
            // ---------------------------------------

            setChildren(processedChildren);
            localStorage.setItem(keyChildren, JSON.stringify(processedChildren));
          } else {
            console.warn('Could not load children from Supabase, using localStorage:', errChildren.message);
            loadLocalStorageFallback(isDemo);
            return;
          }

          // Fetch tasks
          const { data: dbTasks, error: errTasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('parent_id', currentFamilyId);
          
          if (!errTasks) {
            setTasks(dbTasks || []);
            localStorage.setItem(keyTasks, JSON.stringify(dbTasks || []));
          }

          // Fetch completions (filtered client-side if needed, or select all)
          const { data: dbCompletions, error: errCompletions } = await supabase
            .from('completions')
            .select('*');
          
          if (!errCompletions) {
            const childIds = (dbChildren || []).map(c => c.id);
            const filteredCompletions = (dbCompletions || []).filter(c => childIds.includes(c.child_id));
            setCompletions(filteredCompletions || []);
            localStorage.setItem(keyCompletions, JSON.stringify(filteredCompletions || []));
          }

          // Fetch rewards
          const { data: dbRewards, error: errRewards } = await supabase
            .from('rewards')
            .select('*')
            .eq('parent_id', currentFamilyId);
          
          if (!errRewards) {
            setRewards(dbRewards || []);
            localStorage.setItem(keyRewards, JSON.stringify(dbRewards || []));
          }

          // Fetch redemptions
          const keyRedemptions = `RCH_REDEMPTIONS_${currentFamilyId}`;
          const { data: dbRedemptions, error: errRedemptions } = await supabase
            .from('reward_redemptions')
            .select('*')
            .eq('parent_id', currentFamilyId);
            
          if (!errRedemptions) {
            setRedemptions(dbRedemptions || []);
            localStorage.setItem(keyRedemptions, JSON.stringify(dbRedemptions || []));
          }

          // Fetch gifting requests
          const keyGiftingRequests = `RCH_GIFTING_${currentFamilyId}`;
          const { data: dbGifting, error: errGifting } = await supabase
            .from('gifting_requests')
            .select('*')
            .eq('family_id', currentFamilyId);

          if (!errGifting) {
            setGiftingRequests(dbGifting || []);
            localStorage.setItem(keyGiftingRequests, JSON.stringify(dbGifting || []));
          }

        } catch (err) {
          console.warn('Error loading Supabase data:', err);
          loadLocalStorageFallback(isDemo);
        }
      };

      fetchSupabaseData();

      // Subscribe to Realtime Postgres changes across all public tables
      const dbChannel = supabase.channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            console.log('Realtime event received! Refreshing data in 500ms...', payload);
            setTimeout(() => {
              fetchSupabaseData();
            }, 500);
          }
        )
        .subscribe();
        
      // Subscribe to custom Broadcasts for this specific family (bypasses RLS subquery limitations in Postgres WAL)
      // Note: currentFamilyId might be stale here if we don't fetch it first, but we are inside the async fetchSupabaseData where it's not easily accessible.
      // We should set up the broadcast channel *inside* fetchSupabaseData or rely on parentEmail.
      // Let's just poll every 10 seconds as a fallback, and set up a state-dependent effect for broadcast.

      // Cleanup subscription on unmount or parentEmail change
      return () => {
        supabase.removeChannel(dbChannel);
      };
    } else {
      // Local/demo mode - fetch from localStorage or defaults
      loadLocalStorageFallback(isDemo);
    }
  }, [parentEmail]);


  // Sync state helpers to update local storage
  const syncChildren = (newList: Child[]) => {
    setChildren(newList);
    const key = parentEmail ? `RCH_CHILDREN_${parentEmail}` : 'RCH_CHILDREN';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncTasks = (newList: Task[]) => {
    setTasks(newList);
    const key = parentEmail ? `RCH_TASKS_${parentEmail}` : 'RCH_TASKS';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncCompletions = (newList: TaskCompletion[]) => {
    setCompletions(newList);
    const key = parentEmail ? `RCH_COMPLETIONS_${parentEmail}` : 'RCH_COMPLETIONS';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncRewards = (newList: Reward[]) => {
    setRewards(newList);
    const key = parentEmail ? `RCH_REWARDS_${parentEmail}` : 'RCH_REWARDS';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncRedemptions = (newList: RewardRedemption[]) => {
    setRedemptions(newList);
    const key = parentEmail ? `RCH_REDEMPTIONS_${parentEmail}` : 'RCH_REDEMPTIONS';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncGiftingRequests = (newList: GiftingRequest[]) => {
    setGiftingRequests(newList);
    const key = parentEmail ? `RCH_GIFTING_${parentEmail}` : 'RCH_GIFTING';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  // Supabase update helper
  const updateChildInSupabase = async (updatedChild: Child) => {
    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase
        .from('children')
        .update({
          points: updatedChild.points,
          level: updatedChild.level,
          xp_in_level: updatedChild.xp_in_level,
          streak_days: updatedChild.streak_days,
          last_active_date: updatedChild.last_active_date,
          level_up_bonuses_received: updatedChild.level_up_bonuses_received,
          weekly_xp: updatedChild.weekly_xp,
          monthly_xp: updatedChild.monthly_xp,
          last_active_week: updatedChild.last_active_week,
          last_active_month: updatedChild.last_active_month,
          weekly_reset_date: updatedChild.weekly_reset_date,
          monthly_reset_date: updatedChild.monthly_reset_date,
          last_weekly_bonus_awarded: updatedChild.last_weekly_bonus_awarded,
          last_monthly_bonus_awarded: updatedChild.last_monthly_bonus_awarded,
          savings_pot: updatedChild.savings_pot,
          pet_food: updatedChild.pet_food,
          savings_unlocked: updatedChild.savings_unlocked,
          savings_unlock_seen: updatedChild.savings_unlock_seen,
          savings_goal_name: updatedChild.savings_goal_name,
          savings_goal_amount: updatedChild.savings_goal_amount,
          savings_goal_reward_id: updatedChild.savings_goal_reward_id,
          food_pot: updatedChild.food_pot,
          food_pot_unlocked: updatedChild.food_pot_unlocked,
          food_pot_unlock_seen: updatedChild.food_pot_unlock_seen,
          food_pot_weekly_contribution: updatedChild.food_pot_weekly_contribution,
          pet_fed_today: updatedChild.pet_fed_today,
          pet_hunger_time: updatedChild.pet_hunger_time,
          pet_unhappy: updatedChild.pet_unhappy,
          last_fed_date: updatedChild.last_fed_date,
          last_hunger_check_date: updatedChild.last_hunger_check_date,
          gifting_pot: updatedChild.gifting_pot,
          gifting_unlocked: updatedChild.gifting_unlocked,
          gifting_unlock_seen: updatedChild.gifting_unlock_seen,
          maintenance_pot: updatedChild.maintenance_pot,
          maintenance_unlocked: updatedChild.maintenance_unlocked,
          maintenance_unlock_seen: updatedChild.maintenance_unlock_seen,
          main_last_maintenance_date: updatedChild.main_last_maintenance_date,
          main_pot_damaged: updatedChild.main_pot_damaged,
          main_damage_date: updatedChild.main_damage_date,
          is_rent_due: updatedChild.is_rent_due,
          rent_due_date: updatedChild.rent_due_date
        })
        .eq('id', updatedChild.id);
      if (error) {
        console.warn('Failed to sync child update to Supabase:', error);
        console.warn('Payload was:', {
          points: updatedChild.points, level: updatedChild.level,
          is_rent_due: updatedChild.is_rent_due, rent_due_date: updatedChild.rent_due_date
        });
        console.warn('ID was:', updatedChild.id);
        alert(`DATABASE ERROR: ${error.message}\n\nPlease run combined_patch.sql in your Supabase SQL Editor.`);
      }
    }
  };

  // Auth Handlers
  const handleOnboardingComplete = async (data: OnboardingData) => {
    localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'true');
    setHasCompletedOnboarding(true);

    const emailToUse = data.skippedAccount ? 'local_parent@rewardchart.app' : (data.email || 'local_parent@rewardchart.app');
    
    setParentPin(data.pin);
    localStorage.setItem('RCH_PARENT_PIN', data.pin);

    // Save parent profile locally so it persists in local mode
    const localProfile = {
      user_id: '',
      email: emailToUse,
      family_id: emailToUse,
      family_name: data.familyName,
      pin: data.pin,
      name: data.parentName,
      share_token: null
    };
    localStorage.setItem('RCH_PARENT_PROFILE', JSON.stringify(localProfile));
    setParentProfile(localProfile);

    // Create children
    const initialChildren: Child[] = data.children.map((c, index) => ({
      ...c,
      id: `child_${Date.now()}_${index}`,
      parent_id: emailToUse,
      points: 0,
      level: 1,
      xp_in_level: 0,
      streak_days: 0,
      pet_food: 0,
      food_pot: 0,
      food_pot_unlocked: false,
      food_pot_unlock_seen: false,
      food_pot_weekly_contribution: 0,
      pet_fed_today: true,
      pet_hunger_time: null,
      pet_unhappy: false,
      last_fed_date: null,
      last_hunger_check_date: new Date().toISOString().split('T')[0],
      gifting_pot: 0,
      gifting_unlocked: false,
      gifting_unlock_seen: false,
      maintenance_pot: 0,
      maintenance_unlocked: false,
      maintenance_unlock_seen: false,
      is_rent_due: false,
      rent_due_date: null,
      last_active_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    })) as Child[];

    // Create tasks
    const initialTasks: Task[] = [];
    data.selectedTasks.forEach((t, index) => {
      const templateId = `task_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`;
      // Add as a blueprint
      initialTasks.push({
        ...t,
        id: templateId,
        created_at: new Date().toISOString(),
        parent_id: emailToUse,
        is_template: true
      });
      // Assign to all children immediately
      initialChildren.forEach((child, cIdx) => {
        initialTasks.push({
          ...t,
          id: `task_${Date.now()}_${index}_${cIdx}_${Math.random().toString(36).substring(2, 9)}`,
          created_at: new Date().toISOString(),
          parent_id: emailToUse,
          is_template: false,
          child_id: child.id
        });
      });
    });

    localStorage.setItem(`RCH_CHILDREN_${emailToUse}`, JSON.stringify(initialChildren));
    localStorage.setItem(`RCH_TASKS_${emailToUse}`, JSON.stringify(initialTasks));
    
    const initialRewards: Reward[] = [];
    data.selectedRewards.forEach((r, index) => {
      const templateId = `reward_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`;
      // Add as a blueprint
      initialRewards.push({
        ...r,
        id: templateId,
        created_at: new Date().toISOString(),
        parent_id: emailToUse,
        is_template: true
      });
      // Assign to all children immediately
      initialChildren.forEach((child, cIdx) => {
        initialRewards.push({
          ...r,
          id: `reward_${Date.now()}_${index}_${cIdx}_${Math.random().toString(36).substring(2, 9)}`,
          created_at: new Date().toISOString(),
          parent_id: emailToUse,
          is_template: false,
          child_id: child.id
        });
      });
    });
    localStorage.setItem(`RCH_REWARDS_${emailToUse}`, JSON.stringify(initialRewards));

    // Update React state immediately so it's available without waiting for useEffect
    setChildren(initialChildren);
    setTasks(initialTasks);
    setRewards(initialRewards);
    setCompletions([]);
    setRedemptions([]);
    setGiftingRequests([]);

    setParentEmail(emailToUse);
    localStorage.setItem('RCH_PARENT_EMAIL', emailToUse);
    setIsParentMode(true);
    localStorage.setItem('RCH_PARENT_MODE', 'true');
  };

  const handleLoginReal = (email: string) => {
    // Clear old state to prepare fresh real/blank dashboard loads
    localStorage.removeItem('RCH_CHILDREN');
    localStorage.removeItem('RCH_TASKS');
    localStorage.removeItem('RCH_COMPLETIONS');
    localStorage.removeItem('RCH_REWARDS');

    setParentEmail(email);
    localStorage.setItem('RCH_PARENT_EMAIL', email);
    setIsParentMode(false); // Default to Child scoreboard, parent enters PIN to manage
    localStorage.setItem('RCH_PARENT_MODE', 'false');
    setHasCompletedOnboarding(true);
    localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'true');
  };

  const handleLogout = async () => {
    playSound.click();
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setParentEmail(null);
    setIsParentMode(false);
    localStorage.removeItem('RCH_PARENT_EMAIL');
    localStorage.removeItem('RCH_PARENT_MODE');
    localStorage.removeItem('RCH_CHILDREN');
    localStorage.removeItem('RCH_TASKS');
    localStorage.removeItem('RCH_COMPLETIONS');
    localStorage.removeItem('RCH_REWARDS');
    localStorage.removeItem('RCH_REDEMPTIONS');
    localStorage.removeItem('RCH_GIFTING');
    localStorage.removeItem('RCH_LOCKED_CHILD_ID');
    window.location.reload();
  };

  const handleResetData = async (keepBlueprints: boolean) => {
    const familyId = parentProfile?.family_id || parentEmail;
    if (!familyId || familyId === 'demo_parent@rewardchart.app') return;

    const supabase = getSupabaseClient();
    if (supabase) {
      if (keepBlueprints) {
        await supabase.from('tasks').delete().eq('parent_id', familyId).eq('is_template', false);
        await supabase.from('rewards').delete().eq('parent_id', familyId).eq('is_template', false);
      } else {
        await supabase.from('tasks').delete().eq('parent_id', familyId);
        await supabase.from('rewards').delete().eq('parent_id', familyId);
      }
      
      const childIds = children.map(c => c.id);
      if (childIds.length > 0) {
        await supabase.from('completions').delete().in('child_id', childIds);
      }
      await supabase.from('reward_redemptions').delete().eq('parent_id', familyId);
      await supabase.from('gifting_requests').delete().eq('family_id', familyId);

      const updatedChildren = children.map(c => ({
        ...c,
        points: 0,
        level: 1,
        xp_in_level: 0,
        weekly_xp: 0,
        monthly_xp: 0
      }));
      syncChildren(updatedChildren);
      for (const child of updatedChildren) {
        await supabase.from('children').update(child).eq('id', child.id);
      }

      if (keepBlueprints) {
        syncTasks(tasks.filter(t => t.is_template));
        syncRewards(rewards.filter(r => r.is_template));
      } else {
        syncTasks([]);
        syncRewards([]);
      }
      syncCompletions([]);
      syncRedemptions([]);
      syncGiftingRequests([]);
    }
  };

  const handleDeleteAccount = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.rpc('delete_user_account');
      handleLogout();
    }
  };

  const handleRunSetup = async () => {
    await handleResetData(false);
    await handleLogout();
    setHasCompletedOnboarding(false);
    localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'false');
  };

  // Parent Gating
  const handleEnterParentModeRequest = () => {
    setShowLockScreen(true);
  };

  const handleParentLockSuccess = () => {
    setShowLockScreen(false);
    setIsParentMode(true);
    localStorage.setItem('RCH_PARENT_MODE', 'true');
    setLockedChildId(null);
    localStorage.removeItem('RCH_LOCKED_CHILD_ID');
  };

  const handleExitParentMode = () => {
    setIsParentMode(false);
    localStorage.setItem('RCH_PARENT_MODE', 'false');
  };

  // Operations: Children
  const handleAddChild = async (name: string, characterId: string, avatarUrl: string) => {
    const newChild: Child = {
      id: `child_${Date.now()}`,
      parent_id: (parentProfile?.family_id || parentEmail) || 'parent_demo',
      name,
      avatar_url: avatarUrl,
      character_id: characterId,
      points: 0,
      level: 1,
      xp_in_level: 0,
      streak_days: 0,
      pet_food: 0,
      food_pot: 0,
      food_pot_unlocked: false,
      food_pot_unlock_seen: false,
      food_pot_weekly_contribution: 0,
      pet_fed_today: true,
      pet_hunger_time: null,
      pet_unhappy: false,
      last_fed_date: null,
      last_hunger_check_date: new Date().toISOString().split('T')[0],
      gifting_pot: 0,
      gifting_unlocked: false,
      gifting_unlock_seen: false,
      maintenance_pot: 0,
      maintenance_unlocked: false,
      maintenance_unlock_seen: false,
      is_rent_due: false,
      rent_due_date: null,
      created_at: new Date().toISOString()
    };
    syncChildren([...children, newChild]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('children').insert(newChild);
      if (error) console.warn('Failed to sync new child to Supabase:', error.message);
    }
  };

  const handleEditChild = async (id: string, updates: Partial<Child>) => {
    let updatedChild: Child | null = null;
    const updatedChildren = children.map(c => {
      if (c.id === id) {
        updatedChild = { ...c, ...updates };
        return updatedChild;
      }
      return c;
    });
    syncChildren(updatedChildren);

    const supabase = getSupabaseClient();
    if (supabase && updatedChild && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('children').update(updatedChild).eq('id', id);
      if (error) console.warn('Failed to update child in Supabase:', error.message);
    }
  };
  const processLifetimePoints = (child: Child, addedPoints: number): Child => {
    let newLevel = child.level || 1;
    let newLifetimePoints = (child.lifetime_points || 0) + addedPoints;
    let newPoints = child.points;
    let bonusesReceived = child.level_up_bonuses_received || 0;
    const pointsToLevelUp = parentProfile?.points_to_level_up ?? 500;

    // 1. Level up check
    while (newLifetimePoints >= (newLevel * pointsToLevelUp)) {
      newLevel++;
      const levelUpBonus = parentProfile?.level_up_gold_reward ?? 500;
      newPoints += levelUpBonus;
      bonusesReceived++;
      setTimeout(() => playSound.levelUp(), 300);
    }

    // 2. Weekly / Monthly Tracking (Explicit Reset Logging)
    const now = new Date();

    let weeklyPoints = child.weekly_points || 0;
    let foodPotWeeklyContribution = child.food_pot_weekly_contribution || 0;
    let nextWeeklyReset = child.weekly_reset_date ? new Date(child.weekly_reset_date) : null;
    
    if (!nextWeeklyReset || now >= nextWeeklyReset) {
      weeklyPoints = 0; // The week rolled over!
      foodPotWeeklyContribution = 0; // Reset food pot weekly contribution!
      nextWeeklyReset = getNextWeeklyResetDate(now);
    }
    weeklyPoints += addedPoints;

    let monthlyPoints = child.monthly_points || 0;
    let nextMonthlyReset = child.monthly_reset_date ? new Date(child.monthly_reset_date) : null;
    
    if (!nextMonthlyReset || now >= nextMonthlyReset) {
      monthlyPoints = 0; // The month rolled over!
      nextMonthlyReset = getNextMonthlyResetDate(now);
    }
    monthlyPoints += addedPoints;

    // Check Weekly Goal
    const weeklyTarget = parentProfile?.weekly_points_target || 100;
    const weeklyReward = parentProfile?.weekly_reward_points || 200;
    let lastWeeklyBonus = child.last_weekly_bonus_awarded;

    const currentWeekCycleId = nextWeeklyReset.toISOString();
    if (weeklyPoints >= weeklyTarget && lastWeeklyBonus !== currentWeekCycleId) {
      newPoints += weeklyReward;
      lastWeeklyBonus = currentWeekCycleId;
      setTimeout(() => playSound.purchase(), 500);
    }

    // Check Monthly Goal
    const monthlyTarget = parentProfile?.monthly_points_target || 500;
    const monthlyReward = parentProfile?.monthly_reward_points || 1000;
    let lastMonthlyBonus = child.last_monthly_bonus_awarded;

    const currentMonthCycleId = nextMonthlyReset.toISOString();
    if (monthlyPoints >= monthlyTarget && lastMonthlyBonus !== currentMonthCycleId) {
      newPoints += monthlyReward;
      lastMonthlyBonus = currentMonthCycleId;
      setTimeout(() => playSound.purchase(), 800);
    }

    // 3. Auto-unlock Maintenance Pot
    let maintenanceUnlocked = child.maintenance_unlocked || false;
    const maintenanceLvl = parentProfile?.maintenance_pot_unlock_level ?? 8;
    if (newLevel >= maintenanceLvl && !maintenanceUnlocked) {
      maintenanceUnlocked = true;
      setTimeout(() => playSound.evolution(), 1500);
    }

    // 4. Auto-unlock Food Pot
    let foodPotUnlocked = child.food_pot_unlocked || false;
    const foodLvl = parentProfile?.food_pot_unlock_level ?? 4;
    if (newLevel >= foodLvl && !foodPotUnlocked) {
      foodPotUnlocked = true;
      setTimeout(() => playSound.evolution(), 900);
    }

    // 5. Auto-unlock Gifting Pot
    let giftingPotUnlocked = child.gifting_unlocked || false;
    const giftingLvl = parentProfile?.gifting_pot_unlock_level ?? 6;
    if (newLevel >= giftingLvl && !giftingPotUnlocked) {
      giftingPotUnlocked = true;
      setTimeout(() => playSound.evolution(), 1200);
    }

    return {
      ...child,
      level: newLevel,
      lifetime_points: newLifetimePoints,
      points: newPoints,
      level_up_bonuses_received: bonusesReceived,
      weekly_points: weeklyPoints,
      monthly_points: monthlyPoints,
      weekly_reset_date: nextWeeklyReset.toISOString(),
      monthly_reset_date: nextMonthlyReset.toISOString(),
      last_weekly_bonus_awarded: lastWeeklyBonus,
      last_monthly_bonus_awarded: lastMonthlyBonus,
      maintenance_unlocked: maintenanceUnlocked,
      food_pot_unlocked: foodPotUnlocked,
      food_pot_weekly_contribution: foodPotWeeklyContribution,
      gifting_unlocked: giftingPotUnlocked
    };
  };


  const handleUpdateChildStats = async (childId: string, updates: Partial<Child>) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;
    
    let targetChild = { ...child };
    
    // If we are manually adding points, use the processLifetimePoints pipeline to trigger rollovers and bonuses!
    if (updates.points !== undefined && updates.points > child.points) {
      const addedPoints = updates.points - child.points;
      targetChild = processLifetimePoints(targetChild, addedPoints);
      // Let it update points through the pipeline, but we still apply the exact updates below
      delete updates.points; 
    }

    // Apply any remaining explicit updates
    targetChild = { ...targetChild, ...updates };

    // Check if savings pot requirements are met
    const savingsLvl = parentProfile?.savings_pot_unlock_level ?? 2;
    if (!targetChild.savings_unlocked && targetChild.level >= savingsLvl) {
      targetChild.savings_unlocked = true;
      targetChild.savings_unlock_seen = false;
    } else if (targetChild.savings_unlocked && targetChild.level < savingsLvl) {
      targetChild.savings_unlocked = false;
      targetChild.savings_unlock_seen = false;
    }

    // Check if maintenance pot requirements are met
    const maintenanceLvl = parentProfile?.maintenance_pot_unlock_level ?? 8;
    if (!targetChild.maintenance_unlocked && targetChild.level >= maintenanceLvl) {
      targetChild.maintenance_unlocked = true;
      targetChild.maintenance_unlock_seen = false;
    } else if (targetChild.maintenance_unlocked && targetChild.level < maintenanceLvl) {
      targetChild.maintenance_unlocked = false;
      targetChild.maintenance_unlock_seen = false;
    }

    // Check if food pot requirements are met
    const foodLvl = parentProfile?.food_pot_unlock_level ?? 4;
    if (!targetChild.food_pot_unlocked && targetChild.level >= foodLvl) {
      targetChild.food_pot_unlocked = true;
      targetChild.food_pot_unlock_seen = false;
      targetChild.pet_fed_today = false;
    } else if (targetChild.food_pot_unlocked && targetChild.level < foodLvl) {
      targetChild.food_pot_unlocked = false;
      targetChild.food_pot_unlock_seen = false;
    }

    // Check if gifting pot requirements are met
    const giftingLvl = parentProfile?.gifting_pot_unlock_level ?? 6;
    if (!targetChild.gifting_unlocked && targetChild.level >= giftingLvl) {
      targetChild.gifting_unlocked = true;
      targetChild.gifting_unlock_seen = false;
    } else if (targetChild.gifting_unlocked && targetChild.level < giftingLvl) {
      targetChild.gifting_unlocked = false;
      targetChild.gifting_unlock_seen = false;
    }

    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  // Operations: Tasks
  const handleAddTask = async (
    title: string, 
    points: number,
    category: any, 
    recurrence: any, 
    cooldownMinutes?: number
  ) => {
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      parent_id: (parentProfile?.family_id || parentEmail) || 'parent_demo',
      child_id: 'directory',
      title,
      points,
      category,
      recurrence,
      cooldown_minutes: cooldownMinutes,
      is_template: true,
      is_active: true,
      created_at: new Date().toISOString()
    };
    syncTasks([...tasks, newTask]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('tasks').insert(newTask);
      if (error) console.warn('Failed to sync task to Supabase:', error.message);
    }
  };

  const handleAssignTask = async (template: Task, childIds: string[]) => {
    const existingInstances = tasks.filter(t => t.template_id === template.id);
    const instancesToDelete = existingInstances.filter(t => !childIds.includes(t.child_id));
    const existingChildIds = existingInstances.map(t => t.child_id);
    const childrenToAdd = childIds.filter(id => !existingChildIds.includes(id));

    const newTasks: Task[] = childrenToAdd.map(childId => ({
      ...template,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      child_id: childId,
      is_template: false,
      template_id: template.id,
      created_at: new Date().toISOString()
    }));

    const nextTasks = tasks.filter(t => !instancesToDelete.find(del => del.id === t.id));
    syncTasks([...nextTasks, ...newTasks]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      if (instancesToDelete.length > 0) {
        await supabase.from('tasks').delete().in('id', instancesToDelete.map(t => t.id));
      }
      if (newTasks.length > 0) {
        await supabase.from('tasks').insert(newTasks);
      }
    }
  };

  const handleEditTask = async (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id || t.template_id === id) {
        return { ...t, ...updates };
      }
      return t;
    });
    syncTasks(updatedTasks);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('tasks').update(updates).or(`id.eq.${id},template_id.eq.${id}`);
      if (error) console.warn('Failed to update task in Supabase:', error.message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    syncTasks(tasks.filter(t => t.id !== id && t.template_id !== id));

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('tasks').delete().or(`id.eq.${id},template_id.eq.${id}`);
      if (error) console.warn('Failed to delete task in Supabase:', error.message);
    }
  };

  // Operations: Rewards
  const handleAddReward = async (
    title: string, 
    cost: number, 
    iconName: string,
    limitType: any
  ) => {
    const newReward: Reward = {
      id: `rew_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      parent_id: (parentProfile?.family_id || parentEmail) || 'parent_demo',
      child_id: 'directory',
      title,
      cost_points: cost,
      is_available: true,
      is_template: true,
      icon_name: iconName,
      limit_type: limitType,
      created_at: new Date().toISOString()
    };
    syncRewards([...rewards, newReward]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('rewards').insert(newReward);
      if (error) console.warn('Failed to sync reward to Supabase:', error.message);
    }
  };

  const handleAssignReward = async (template: Reward, childIds: string[]) => {
    const existingInstances = rewards.filter(r => r.template_id === template.id);
    const instancesToDelete = existingInstances.filter(r => !childIds.includes(r.child_id));
    const existingChildIds = existingInstances.map(r => r.child_id);
    const childrenToAdd = childIds.filter(id => !existingChildIds.includes(id));

    const newRewards: Reward[] = childrenToAdd.map(childId => ({
      ...template,
      id: `rew_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      child_id: childId,
      is_template: false,
      template_id: template.id,
      created_at: new Date().toISOString()
    }));

    const nextRewards = rewards.filter(r => !instancesToDelete.find(del => del.id === r.id));
    syncRewards([...nextRewards, ...newRewards]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      if (instancesToDelete.length > 0) {
        await supabase.from('rewards').delete().in('id', instancesToDelete.map(r => r.id));
      }
      if (newRewards.length > 0) {
        await supabase.from('rewards').insert(newRewards);
      }
    }
  };

  const handleEditReward = async (id: string, updates: Partial<Reward>) => {
    const updatedRewards = rewards.map(r => {
      if (r.id === id || r.template_id === id) {
        return { ...r, ...updates };
      }
      return r;
    });
    syncRewards(updatedRewards);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('rewards').update(updates).or(`id.eq.${id},template_id.eq.${id}`);
      if (error) console.warn('Failed to update reward in Supabase:', error.message);
    }
  };

  const handleDeleteReward = async (id: string) => {
    syncRewards(rewards.filter(r => r.id !== id && r.template_id !== id));

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('rewards').delete().or(`id.eq.${id},template_id.eq.${id}`);
      if (error) console.warn('Failed to delete reward in Supabase:', error.message);
    }
  };

  // Operations: Completions
  const handleCompleteTask = async (taskId: string, childId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Create a pending completion
    const newCompletion: TaskCompletion = {
      id: `comp_${Date.now()}`,
      task_id: taskId,
      child_id: childId,
      points_awarded: task.points,
      status: 'pending',
      completed_at: new Date().toISOString()
    };
    syncCompletions([...completions, newCompletion]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('completions').insert(newCompletion);
      if (error) console.warn('Failed to sync completion to Supabase:', error.message);
    }
  };

  const handleClaimReward = async (rewardId: string, childId: string, paymentSource: 'main' | 'savings' = 'main') => {
    const reward = rewards.find(r => r.id === rewardId);
    const child = children.find(c => c.id === childId);
    const availablePoints = paymentSource === 'savings' ? (child?.savings_pot || 0) : (child?.points || 0);
    if (!reward || !child || availablePoints < reward.cost_points || !reward.is_available) return;

    // --- Limit Checks ---
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const childRedemptions = redemptions.filter(r => r.child_id === childId && r.reward_id === rewardId);
    
    if (reward.limit_type === 'daily') {
      const todayRedemptions = childRedemptions.filter(r => r.redeemed_at.startsWith(todayStr));
      if (todayRedemptions.length >= 1) return; // Limit reached
    } 
    else if (reward.limit_type === 'twice_daily') {
      const todayRedemptions = childRedemptions.filter(r => r.redeemed_at.startsWith(todayStr));
      if (todayRedemptions.length >= 2) return; // Limit reached
      
      // Wait at least 6 hours between redemptions
      if (todayRedemptions.length === 1) {
        const lastRedeem = new Date(todayRedemptions[0].redeemed_at).getTime();
        const hrsSinceLast = (now.getTime() - lastRedeem) / (1000 * 60 * 60);
        if (hrsSinceLast < 6) return;
      }
    }

    // Wait to deduct points until parent delivers it!
    // Just trigger celebration here for the request.
    setCelebrationActive(true);

    // Create Redemption Request
    const newRedemption: RewardRedemption = {
      id: `red_${Date.now()}`,
      reward_id: reward.id,
      child_id: child.id,
      parent_id: (parentProfile?.family_id || parentEmail) || 'parent_demo',
      redeemed_at: now.toISOString(),
      status: 'requested',
      payment_source: paymentSource
    };
    syncRedemptions([...redemptions, newRedemption]);

    // Handle one-time disappearing
    if (reward.limit_type === 'one_time') {
      handleEditReward(reward.id, { is_available: false });
    }

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('reward_redemptions').insert(newRedemption);
      if (error) console.warn('Failed to sync redemption to Supabase:', error.message);
    }
  };

  const handleDeliverReward = async (redemptionId: string) => {
    const redemption = redemptions.find(r => r.id === redemptionId);
    if (!redemption) return;
    
    // Look up reward cost to deduct it now
    const reward = rewards.find(r => r.id === redemption.reward_id);
    const child = children.find(c => c.id === redemption.child_id);

    if (child) {
      const cost = reward ? reward.cost_points : 0;
      const isSavingsPurchase = redemption.payment_source === 'savings';
      const targetChild = {
        ...child,
        points: isSavingsPurchase ? child.points : Math.max(0, child.points - cost),
        savings_pot: isSavingsPurchase ? Math.max(0, (child.savings_pot || 0) - cost) : child.savings_pot,
        pet_food: (child.pet_food || 0) + 1,
      };

      const updatedChildren = children.map(c => c.id === child.id ? targetChild : c);
      syncChildren(updatedChildren);
      
      // Explicitly wait for child to update in DB before updating the redemption
      const supabase = getSupabaseClient();
      if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
        const { error } = await supabase.from('children').update(targetChild).eq('id', targetChild.id);
        if (error) {
          console.error("Failed to update child:", error);
          alert("Database Error: Could not update child's points and pet food. " + error.message);
        }
      }
    } else {
      console.error("Child not found for redemption:", redemption);
      alert("Error: Could not find the child profile to give pet food to!");
    }

    const updated = redemptions.map(r => r.id === redemptionId ? { ...r, status: 'delivered' as const } : r);
    syncRedemptions(updated);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('reward_redemptions').update({ status: 'delivered' }).eq('id', redemptionId);
      if (error) console.warn('Failed to update redemption in Supabase:', error.message);
    }
  };

  const handleFeedPet = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child || (child.pet_food || 0) <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const targetChild = {
      ...child,
      pet_food: (child.pet_food || 0) - 1,
      pet_fed_today: true,
      pet_unhappy: false,
      last_fed_date: todayStr
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    
    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('children').update({
        pet_food: targetChild.pet_food,
        pet_fed_today: targetChild.pet_fed_today,
        pet_unhappy: targetChild.pet_unhappy,
        last_fed_date: targetChild.last_fed_date
      }).eq('id', targetChild.id);
      if (error) {
        console.error("Failed to feed pet:", error);
        alert("Database Error: Could not feed pet. " + error.message);
      }
    }
  };

  // Operations: Food Pot
  const handleBuyPetFood = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child || child.points < 1) return;

    const targetChild = {
      ...child,
      points: child.points - 1,
      pet_food: (child.pet_food || 0) + 1,
      food_pot_weekly_contribution: (child.food_pot_weekly_contribution || 0) + 1
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  const handleFoodPotUnlockSeen = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const targetChild = {
      ...child,
      food_pot_unlock_seen: true
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  // Operations: Bills & Repairs
  const handlePayRent = async (childId: string) => {
    let finalUpdatedChild: Child | null = null;
    let oldChild: Child | null = null;

    setChildren(prevChildren => {
      const child = prevChildren.find(c => c.id === childId);
      if (!child) return prevChildren;
      if (child.points < 20) return prevChildren;

      oldChild = child;
      finalUpdatedChild = {
        ...child,
        points: child.points - 20,
        is_rent_due: false,
        rent_due_date: null,
        main_last_maintenance_date: new Date().toISOString()
      };

      const newList = prevChildren.map(c => c.id === childId ? finalUpdatedChild! : c);
      
      if (!parentEmail || parentEmail === 'demo_parent@rewardchart.app') {
        localStorage.setItem('children', JSON.stringify(newList));
      }
      return newList;
    });

    if (!finalUpdatedChild || !oldChild) return;
    localStorage.removeItem(`pending_maintenance_popup_${childId}`);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('children').update({
        points: finalUpdatedChild.points,
        is_rent_due: finalUpdatedChild.is_rent_due,
        rent_due_date: finalUpdatedChild.rent_due_date,
        main_last_maintenance_date: finalUpdatedChild.main_last_maintenance_date
      }).eq('id', childId);
      if (error) {
        console.error("handlePayRent Supabase Error:", error);
        console.error("Payload was:", {
          points: finalUpdatedChild.points,
          is_rent_due: finalUpdatedChild.is_rent_due,
          rent_due_date: finalUpdatedChild.rent_due_date,
          main_last_maintenance_date: finalUpdatedChild.main_last_maintenance_date
        });
        console.error("childId was:", childId);
        alert(`DATABASE ERROR: ${error.message}\n\nPlease run combined_patch.sql in your Supabase SQL Editor.`);
      }
    }
  };

  const handleRepairMainPot = async (childId: string, source: 'maintenance' | 'wallet') => {
    let finalUpdatedChild: Child | null = null;
    let oldChild: Child | null = null;

    setChildren(prevChildren => {
      const child = prevChildren.find(c => c.id === childId);
      if (!child) return prevChildren;

      if (child.points < 5) return prevChildren;

      oldChild = child;
      finalUpdatedChild = {
        ...child,
        points: child.points - 5,
        main_pot_damaged: false,
        main_damage_date: null
      };

      const newList = prevChildren.map(c => c.id === childId ? finalUpdatedChild! : c);
      
      if (!parentEmail || parentEmail === 'demo_parent@rewardchart.app') {
        localStorage.setItem('children', JSON.stringify(newList));
      }
      return newList;
    });

    if (!finalUpdatedChild || !oldChild) return;
    localStorage.removeItem(`pending_maintenance_popup_${childId}`);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('children').update({
        points: finalUpdatedChild.points,
        main_pot_damaged: finalUpdatedChild.main_pot_damaged,
        main_damage_date: finalUpdatedChild.main_damage_date
      }).eq('id', childId);
      if (error) console.error("handleRepairMainPot Supabase Error:", error);
    }
  };

  const handleSavingsDeposit = async (childId: string, amount: number) => {
    const child = children.find(c => c.id === childId);
    if (!child || amount <= 0 || amount > child.points) return;

    const targetChild = {
      ...child,
      points: child.points - amount,
      savings_pot: (child.savings_pot || 0) + amount
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  const handleSavingsWithdraw = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child || (child.savings_pot || 0) <= 0) return;

    const targetChild = {
      ...child,
      points: child.points + (child.savings_pot || 0),
      savings_pot: 0
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  const handleSavingsGoal = async (childId: string, rewardId: string) => {
    const child = children.find(c => c.id === childId);
    const reward = rewards.find(r => r.id === rewardId);
    if (!child || !reward) return;

    const targetChild = {
      ...child,
      savings_goal_name: reward.title,
      savings_goal_amount: reward.cost_points,
      savings_goal_reward_id: reward.id
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  const handleClearSavingsGoal = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const targetChild = {
      ...child,
      savings_goal_name: null,
      savings_goal_amount: null,
      savings_goal_reward_id: null
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  const handleSavingsUnlockSeen = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const targetChild = {
      ...child,
      savings_unlock_seen: true
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  const handleRejectReward = async (redemptionId: string) => {
    const redemption = redemptions.find(r => r.id === redemptionId);
    if (!redemption) return;
    
    // Restore one_time reward availability
    const reward = rewards.find(r => r.id === redemption.reward_id);
    if (reward && reward.limit_type === 'one_time') {
      handleEditReward(reward.id, { is_available: true });
    }

    // Update redemption status to 'rejected'
    const targetRedemption = { ...redemption, status: 'rejected' as any };
    const updatedRedemptions = redemptions.map(r => r.id === redemption.id ? targetRedemption : r);
    syncRedemptions(updatedRedemptions);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('reward_redemptions').update(targetRedemption).eq('id', redemption.id);
      if (error) {
        console.error("Failed to update redemption:", error);
      }
    }
  };

  const handleRestoreReward = async (rewardId: string) => {
    handleEditReward(rewardId, { is_available: true });
  };

  const handleParentCompleteTask = async (taskId: string, childId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Create a completion directly as 'approved'
    const newCompletion: TaskCompletion = {
      id: `comp_${Date.now()}`,
      task_id: taskId,
      child_id: childId,
      points_awarded: task.points,
      status: 'approved',
      completed_at: new Date().toISOString()
    };

    syncCompletions([...completions, newCompletion]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('completions').insert(newCompletion);
      if (error) console.warn('Failed to sync completion to Supabase:', error.message);
    }

    // Award points and update Child stats
    const child = children.find(c => c.id === childId);
    if (child) {
      let targetChild = processLifetimePoints(child, newCompletion.points_awarded);
      
      const todayStr = new Date().toISOString().split('T')[0];
      const lastActiveStr = targetChild.last_active_date ? targetChild.last_active_date.split('T')[0] : '';
      
      let newStreak = targetChild.streak_days || 0;
      if (lastActiveStr !== todayStr) {
        newStreak += 1;
      }

      targetChild = {
        ...targetChild,
        points: targetChild.points + newCompletion.points_awarded,
        streak_days: newStreak,
        last_active_date: new Date().toISOString()
      };

      const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
      syncChildren(updatedChildren);
      updateChildInSupabase(targetChild);
    }

    setCelebrationActive(true);
  };

  const handleApproveCompletion = async (completionId: string) => {
    const comp = completions.find(c => c.id === completionId);
    if (!comp) return;

    // 1. Update completion status
    const updatedCompletions = completions.map(c => 
      c.id === completionId ? { ...c, status: 'approved' as const } : c
    );
    syncCompletions(updatedCompletions);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase
        .from('completions')
        .update({ status: 'approved' })
        .eq('id', completionId);
      if (error) console.warn('Failed to update completion status in Supabase:', error.message);
    }

    // 2. Award points and update Child stats
    const child = children.find(c => c.id === comp.child_id);
    if (child) {
      // Process points
      let targetChild = processLifetimePoints(child, comp.points_awarded);
      
      // Update Streak Logic (Once per day)
      const todayStr = new Date().toISOString().split('T')[0];
      const lastActiveStr = targetChild.last_active_date ? targetChild.last_active_date.split('T')[0] : '';
      
      let newStreak = targetChild.streak_days || 0;
      if (lastActiveStr !== todayStr) {
        newStreak += 1; // Only increment if they haven't been active yet today
      }

      // Award Gold explicitly
      targetChild = {
        ...targetChild,
        points: targetChild.points + comp.points_awarded,
        streak_days: newStreak,
        last_active_date: new Date().toISOString()
      };

      const updatedChildren = children.map(c => c.id === comp.child_id ? targetChild : c);
      syncChildren(updatedChildren);
      updateChildInSupabase(targetChild);
    }

    // 3. Trigger full-screen fireworks!
    setCelebrationActive(true);
  };

  const handleRejectCompletion = async (completionId: string) => {
    // Delete or decline completion
    const updatedCompletions = completions.filter(c => c.id !== completionId);
    syncCompletions(updatedCompletions);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('completions').delete().eq('id', completionId);
      if (error) console.warn('Failed to delete completion in Supabase:', error.message);
    }
  };

  // Operations: Gifting Pot
  const handleGiftingRequestCharity = async (childId: string, amount: number, charityName: string) => {
    const child = children.find(c => c.id === childId);
    if (!child || amount <= 0 || amount > child.points) return;

    const newRequest: GiftingRequest = {
      id: `gift_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      child_id: childId,
      family_id: (parentProfile?.family_id || parentEmail) || 'parent_demo',
      amount,
      type: 'charity',
      charity_name: charityName,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    syncGiftingRequests([...giftingRequests, newRequest]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('gifting_requests').insert(newRequest);
      if (error) console.warn('Failed to sync gifting request to Supabase:', error.message);
    }
  };

  const handleGiftingRequestSibling = async (childId: string, amount: number, siblingId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child || amount <= 0 || amount > child.points) return;

    const newRequest: GiftingRequest = {
      id: `gift_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      child_id: childId,
      family_id: (parentProfile?.family_id || parentEmail) || 'parent_demo',
      amount,
      type: 'sibling',
      sibling_id: siblingId,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    syncGiftingRequests([...giftingRequests, newRequest]);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('gifting_requests').insert(newRequest);
      if (error) console.warn('Failed to sync gifting request to Supabase:', error.message);
    }
  };

  const handleApproveGiftingRequest = async (requestId: string) => {
    const request = giftingRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return;

    const child = children.find(c => c.id === request.child_id);
    if (!child || child.points < request.amount) return;

    // Deduct from sender's points
    let targetChild = {
      ...child,
      points: child.points - request.amount,
      last_gifting_date: new Date().toISOString()
    };
    let updatedChildren = children.map(c => c.id === child.id ? targetChild : c);
    
    // If sibling, add to sibling's points
    if (request.type === 'sibling' && request.sibling_id) {
      const sibling = updatedChildren.find(c => c.id === request.sibling_id);
      if (sibling) {
        const targetSibling = {
          ...sibling,
          points: sibling.points + request.amount
        };
        updatedChildren = updatedChildren.map(c => c.id === sibling.id ? targetSibling : c);
        updateChildInSupabase(targetSibling);
      }
    }
    
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);

    const updatedRequests = giftingRequests.map(r => r.id === requestId ? { ...r, status: 'approved' as const } : r);
    syncGiftingRequests(updatedRequests);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('gifting_requests').update({ status: 'approved' }).eq('id', requestId);
      if (error) console.warn('Failed to update gifting request in Supabase:', error.message);
    }
  };

  const handleRejectGiftingRequest = async (requestId: string) => {
    const request = giftingRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return;

    const updatedRequests = giftingRequests.map(r => r.id === requestId ? { ...r, status: 'rejected' as const } : r);
    syncGiftingRequests(updatedRequests);

    const supabase = getSupabaseClient();
    if (supabase && parentEmail !== 'demo_parent@rewardchart.app') {
      const { error } = await supabase.from('gifting_requests').update({ status: 'rejected' }).eq('id', requestId);
      if (error) console.warn('Failed to update gifting request in Supabase:', error.message);
    }
  };

  const handleGiftingUnlockSeen = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const targetChild = {
      ...child,
      gifting_unlock_seen: true
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  const handleMaintenanceUnlockSeen = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const targetChild = {
      ...child,
      maintenance_unlock_seen: true
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  return (
    <div className={`relative min-h-screen ${THEME_PRESETS[activeTheme].bodyBg} transition-all duration-300`} id="app-main">
      
      {/* Immersive Confetti Layer */}
      <Confetti active={celebrationActive} onComplete={() => setCelebrationActive(false)} />

      {/* Screen Routing */}
      <AnimatePresence mode="wait">
        {!hasCompletedOnboarding ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <OnboardingWizard 
              theme={activeTheme}
              onComplete={handleOnboardingComplete}
              onLoginInstead={() => {
                setHasCompletedOnboarding(true);
                localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'true');
              }}
            />
          </motion.div>
        ) : !parentEmail ? (
          <motion.div
            key="auth-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <AuthPage 
              onLoginReal={handleLoginReal}
              onBackToLanding={() => {
                setHasCompletedOnboarding(false);
                localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'false');
              }}
              theme={activeTheme}
            />
          </motion.div>
        ) : isParentMode ? (
          <motion.div
            key="parent-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <ParentDashboard
              children={children}
              tasks={tasks}
              completions={completions}
              rewards={rewards}
              redemptions={redemptions}
              giftingRequests={giftingRequests}
              onAddChild={handleAddChild}
              onEditChild={handleEditChild}
              onUpdateChildStats={handleUpdateChildStats}
              onAddTask={handleAddTask}
              onAssignTask={handleAssignTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onAddReward={handleAddReward}
              onAssignReward={handleAssignReward}
              onEditReward={handleEditReward}
              onDeleteReward={handleDeleteReward}
              onApproveCompletion={handleApproveCompletion}
              onRejectCompletion={handleRejectCompletion}
              onDeliverReward={handleDeliverReward}
              onRejectReward={handleRejectReward}
              onRestoreReward={handleRestoreReward}
              onApproveGiftingRequest={handleApproveGiftingRequest}
              onRejectGiftingRequest={handleRejectGiftingRequest}
              onExitParentMode={handleExitParentMode}
              onParentCompleteTask={handleParentCompleteTask}
              parentProfile={parentProfile}
              linkedParents={linkedParents}
              onResetData={handleResetData}
              onRunSetup={handleRunSetup}
              onDeleteAccount={handleDeleteAccount}
              parentEmail={parentEmail}
              onRequireAccount={() => setShowCreateAccount(true)}
              theme={activeTheme}
              onLogout={handleLogout}
            />
          </motion.div>
        ) : (
          <motion.div
            key="child-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <ChildDashboard
              parentProfile={parentProfile}
              children={children}
              tasks={tasks}
              completions={completions}
              rewards={rewards}
              redemptions={redemptions}
              onCompleteTask={handleCompleteTask}
              onClaimReward={handleClaimReward}
              onEnterParentMode={handleEnterParentModeRequest}
              onFeedPet={handleFeedPet}
              onMaintenanceWithdraw={handleMaintenanceWithdraw}
              onRepairMainPot={handleRepairMainPot}
              onPayRent={handlePayRent}
              onSavingsDeposit={handleSavingsDeposit}
              onSavingsWithdraw={handleSavingsWithdraw}
              onSavingsGoal={handleSavingsGoal}
              onClearSavingsGoal={handleClearSavingsGoal}
              onSavingsUnlockSeen={handleSavingsUnlockSeen}
              onBuyPetFood={handleBuyPetFood}
              onFoodPotUnlockSeen={handleFoodPotUnlockSeen}
              onGiftingRequestCharity={handleGiftingRequestCharity}
              onGiftingRequestSibling={handleGiftingRequestSibling}
              onGiftingUnlockSeen={handleGiftingUnlockSeen}
              onMaintenanceUnlockSeen={handleMaintenanceUnlockSeen}
              onUpdateChildStats={handleUpdateChildStats}
              lockedChildId={lockedChildId}
              onLockChild={(childId) => {
                setLockedChildId(childId);
                localStorage.setItem('RCH_LOCKED_CHILD_ID', childId);
              }}
              theme={activeTheme}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Account Modal */}
      <AnimatePresence>
        {showCreateAccount && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[200] bg-stone-100"
          >
            <StepCreateAccount 
              theme={activeTheme}
              pin={parentPin}
              onComplete={(skipped, email) => {
                setShowCreateAccount(false);
                if (!skipped && email) {
                  setParentEmail(email);
                  localStorage.setItem('RCH_PARENT_EMAIL', email);
                }
              }}
              onBack={() => setShowCreateAccount(false)}
              onLoginInstead={() => {
                setShowCreateAccount(false);
                setParentEmail('');
                localStorage.removeItem('RCH_PARENT_EMAIL');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parental PIN Gate popup lock */}
      <AnimatePresence>
        {showLockScreen && (
          <LockScreen
            correctPin={parentPin}
            onSuccess={handleParentLockSuccess}
            onClose={() => setShowLockScreen(false)}
            theme={activeTheme}
          />
        )}
      </AnimatePresence>


    </div>
  );
}
