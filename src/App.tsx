import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import OneSignal from 'react-onesignal';
import { AppTrackingTransparency } from '@capgo/capacitor-app-tracking-transparency';
import { App as CapacitorApp } from '@capacitor/app';

const AuthPage = lazy(() => import('./components/AuthPage'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const ParentDashboard = lazy(() => import('./components/ParentDashboard'));
const ChildDashboard = lazy(() => import('./components/ChildDashboard'));
const LockScreen = lazy(() => import('./components/LockScreen'));
const Showcase = lazy(() => import('./components/Showcase'));
const OnboardingWizard = lazy(() => import('./components/Onboarding/OnboardingWizard'));
const StepCreateAccount = lazy(() => import('./components/Onboarding/StepCreateAccount'));

import Confetti from './components/Confetti';
import type { OnboardingData } from './components/Onboarding/OnboardingWizard';
import { LegalModal } from './components/LegalModal';
import { SubscriptionProvider, useSubscription } from './contexts/SubscriptionContext';
import { PaywallModal } from './components/PaywallModal';

import { Child, Task, TaskCompletion, Reward, RewardRedemption, ParentProfile, GiftingRequest, Routine } from './types';
import { playSound } from './utils/sound';
import { ThemeId, THEME_PRESETS } from './utils/theme';
import { PREMADE_TASKS, PREMADE_REWARDS } from './data/premadeTemplates';
import { inferTaskCategory } from './utils/categories';
import { getSupabaseClient } from './utils/supabase';
import posthog from 'posthog-js';
import { executeOrQueue, processSyncQueue } from './utils/offlineSync';
import { getCurrentWeekKey, getCurrentMonthKey, getNextWeeklyResetDate, getNextMonthlyResetDate, getStartOfDailyReset } from './utils/date';
import { revokeInvalidLevelBadges } from './utils/badgeService';
import { generateShortCode } from './utils/security';
import { Network } from '@capacitor/network';
import { safeLocalStorageGet, safeJsonParse, safeLocalStorageSet } from './utils/storage';

export default function App() {
  const activeTheme = 'sunny_toybox';

  // Auth state
  // Auth state
  
  const [parentEmail, setParentEmail] = useState<string | null>(() => {
    try { return localStorage.getItem('RCH_PARENT_EMAIL'); } catch { return null; }
  });
  const [isParentMode, setIsParentMode] = useState<boolean>(() => {
    try { return localStorage.getItem('RCH_PARENT_MODE_ACTIVE') === 'true'; } catch { return false; }
  });
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    try { return localStorage.getItem('RCH_ONBOARDING_COMPLETE') === 'true'; } catch { return false; }
  });
  const [onboardingInitialStep, setOnboardingInitialStep] = useState<'welcome' | 'role' | undefined>(undefined);

  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const [showLogin, setShowLogin] = useState<boolean>(
    new URLSearchParams(window.location.search).has('share') || new URLSearchParams(window.location.search).has('child_share')
  );

  const [showShowcase] = useState<boolean>(
    new URLSearchParams(window.location.search).has('showcase')
  );

  const [isChildAuth, setIsChildAuth] = useState<boolean>(() => {
    try { return localStorage.getItem('RCH_CHILD_AUTH_ACTIVE') === 'true'; } catch { return false; }
  });
  const [authedChildId, setAuthedChildId] = useState<string | null>(() => {
    try { return localStorage.getItem('RCH_AUTHED_CHILD_ID'); } catch { return null; }
  });

  // When a child Supabase account exists but has no linked child_profiles row yet
  const [showChildJoinCodePrompt, setShowChildJoinCodePrompt] = useState<boolean>(false);
  const [childJoinCodeInput, setChildJoinCodeInput] = useState<string>('');
  const [childJoinCodeError, setChildJoinCodeError] = useState<string>('');
  const [isApplyingChildJoinCode, setIsApplyingChildJoinCode] = useState<boolean>(false);
  
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  
  useEffect(() => {
    // Disable right-click context menu on images and canvas/interactive components in prod, allow on inputs
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (import.meta.env.PROD && target && !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    // Request iOS App Tracking Transparency on launch
    const requestATT = async () => {
      try {
        await AppTrackingTransparency.requestPermission();
      } catch (err) {
        // Safe to ignore, probably not running on iOS
      }
    };
    requestATT();
  }, []);

  useEffect(() => {
    // Initialize OneSignal
    if (import.meta.env.VITE_ONESIGNAL_APP_ID) {
      OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true
      }).then(async () => {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user?.id) {
            OneSignal.login(data.session.user.id).catch(() => {});
          }
        }
        
        // Handle push notification clicks
        if (OneSignal.Notifications) {
          OneSignal.Notifications.addEventListener('click', (event) => {
            console.log('Push notification clicked!', event);
            setInitialParentTab('home');
            setShowLockScreen(true);
          });
        }
      }).catch(err => console.error("OneSignal init error:", err));
    }
  }, []);



  const [linkedParents, setLinkedParents] = useState<ParentProfile[]>([]);
  const [postSignUpData, setPostSignUpData] = useState<{ email: string, parentName: string, familyName: string } | null>(null);


  // Core records lists
  const [children, setChildren] = useState<Child[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [giftingRequests, setGiftingRequests] = useState<GiftingRequest[]>([]);

  // Identify user in PostHog whenever parentProfile is set
  useEffect(() => {
    if (parentProfile) {
      posthog.identify(parentProfile.user_id, {
        email: parentEmail ?? undefined,
        name: parentProfile.name ?? undefined,
        family_name: parentProfile.family_name ?? undefined,
      });
    }
  }, [parentProfile]);

  // UI state overlays
  const [showLockScreen, setShowLockScreen] = useState<boolean>(false);
  const [celebrationActive, setCelebrationActive] = useState<boolean>(false);
  const [initialParentTab, setInitialParentTab] = useState<'home' | 'children' | 'tasks' | 'rewards' | 'compliance' | 'settings' | 'targets'>('home');
  const [initialParentSubTab, setInitialParentSubTab] = useState<'directory' | 'active' | 'routines'>('directory');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  
  // Auto-logout parent mode after 5 minutes of inactivity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 5 minutes = 300000 ms
      timeoutId = setTimeout(() => {
        setIsParentMode(false);
        localStorage.removeItem('RCH_PARENT_MODE_ACTIVE');
        // If we are in the middle of something we might want to close overlays too
        setShowLockScreen(false);
      }, 300000);
    };

    if (isParentMode) {
      resetTimer();
      // Listen for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => document.addEventListener(event, resetTimer, true));

      return () => {
        clearTimeout(timeoutId);
        events.forEach(event => document.removeEventListener(event, resetTimer, true));
      };
    }
  }, [isParentMode]);

  // Handle Offline Sync Queue processing and Network status
  useEffect(() => {
    // Process queue on initial load if online
    processSyncQueue();
    
    // Listen for network changes to process queue when coming back online
    const listener = Network.addListener('networkStatusChange', status => {
      if (status.connected) {
        processSyncQueue();
      }
    });
    return () => {
      listener.then(l => l.remove());
    };
  }, []);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerDataRefresh = async () => {
    setRefreshTrigger(prev => prev + 1);
    await new Promise(resolve => setTimeout(resolve, 800)); // UI delay for pull-to-refresh
  };



  
  // Guided Access Lock
  const [lockedChildId, setLockedChildId] = useState<string | null>(
    localStorage.getItem('RCH_LOCKED_CHILD_ID')
  );



  // Helper fallback to load local storage state or blank state
  const loadLocalStorageFallback = () => {
    let familyIdToUse = parentProfile?.family_id || parentEmail;
    
    const savedProfile = localStorage.getItem('RCH_PARENT_PROFILE');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setParentProfile(parsed);
      if (parsed.family_id) {
        familyIdToUse = parsed.family_id;
      }
    }

    const keyChildren = familyIdToUse ? `RCH_CHILDREN_${familyIdToUse}` : 'RCH_CHILDREN';
    const keyTasks = familyIdToUse ? `RCH_TASKS_${familyIdToUse}` : 'RCH_TASKS';
    const keyCompletions = familyIdToUse ? `RCH_COMPLETIONS_${familyIdToUse}` : 'RCH_COMPLETIONS';
    const keyRewards = familyIdToUse ? `RCH_REWARDS_${familyIdToUse}` : 'RCH_REWARDS';
    const keyRedemptions = familyIdToUse ? `RCH_REDEMPTIONS_${familyIdToUse}` : 'RCH_REDEMPTIONS';
    const keyGiftingRequests = familyIdToUse ? `RCH_GIFTING_${familyIdToUse}` : 'RCH_GIFTING';

    const savedChildren = localStorage.getItem(keyChildren);
    const savedTasks = localStorage.getItem(keyTasks);
    const savedCompletions = localStorage.getItem(keyCompletions);
    const savedRewards = localStorage.getItem(keyRewards);
    const savedRedemptions = localStorage.getItem(keyRedemptions);
    const savedGiftingRequests = localStorage.getItem(keyGiftingRequests);

    if (savedChildren) {
      const parsedChildren = JSON.parse(savedChildren);
      const now = new Date();
      let hasUpdates = false;
      
      const processedChildren = parsedChildren.map((child: Child) => {
        let updated = { ...child };
        
        let nextWeeklyReset = updated.weekly_reset_date ? new Date(updated.weekly_reset_date) : null;
        if (!nextWeeklyReset || now >= nextWeeklyReset) {
          updated.weekly_points = 0;
          updated.food_pot_weekly_contribution = 0;
          updated.gold_pot_break_count_this_week = 0;
          updated.weekly_reset_date = getNextWeeklyResetDate(now).toISOString();
          hasUpdates = true;
        }

        let nextMonthlyReset = updated.monthly_reset_date ? new Date(updated.monthly_reset_date) : null;
        if (!nextMonthlyReset || now >= nextMonthlyReset) {
          updated.monthly_points = 0;
          updated.monthly_reset_date = getNextMonthlyResetDate(now).toISOString();
          hasUpdates = true;
        }
        
        return updated;
      });
      
      if (hasUpdates) {
        localStorage.setItem(keyChildren, JSON.stringify(processedChildren));
      }
      setChildren(processedChildren);
    } else {
      const initial: any[] = [];
      setChildren(initial);
      localStorage.setItem(keyChildren, JSON.stringify(initial));
    }

    if (savedTasks) {
      const parsed = JSON.parse(savedTasks).map((t: Task) => ({
        ...t,
        category: inferTaskCategory(t.title, t.category)
      }));
      setTasks(parsed);
    } else {
      const initial: any[] = [];
      setTasks(initial);
      localStorage.setItem(keyTasks, JSON.stringify(initial));
    }

    if (savedCompletions) {
      setCompletions(JSON.parse(savedCompletions));
    } else {
      const initial: any[] = [];
      setCompletions(initial);
      localStorage.setItem(keyCompletions, JSON.stringify(initial));
    }

    if (savedRewards) {
      setRewards(JSON.parse(savedRewards));
    } else {
      const initial: any[] = [];
      setRewards(initial);
      localStorage.setItem(keyRewards, JSON.stringify(initial));
    }

    if (savedRedemptions) {
      setRedemptions(JSON.parse(savedRedemptions));
    } else {
      const initial: any[] = [];
      setRedemptions(initial);
      localStorage.setItem(keyRedemptions, JSON.stringify(initial));
    }

    if (savedGiftingRequests) {
      setGiftingRequests(JSON.parse(savedGiftingRequests));
    } else {
      setGiftingRequests([]);
      localStorage.setItem(keyGiftingRequests, JSON.stringify([]));
    }
    
    setIsLoadingData(false);
  };

  // Load records on start/auth change from localStorage or Supabase
  useEffect(() => {
    if (!parentEmail || !hasCompletedOnboarding) {
      return;
    }

    
    const isLocal = parentEmail === 'local_parent@rewardchart.app';
    const supabase = getSupabaseClient();

    if (supabase && !isLocal) {
      // Real Supabase backend - fetch live DB rows
      const fetchSupabaseData = async () => {
        try {
          let currentFamilyId = parentEmail;
          let loadedParentProfile: ParentProfile | null = null;

          // Fetch parent profile first
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (!sessionData?.session?.user) {
            console.warn('No active Supabase session found during fetch. Falling back to local storage.');
            loadLocalStorageFallback();
            return;
          }

          if (sessionData?.session?.user) {
            const { data: profile } = await supabase
              .from('parent_profiles')
              .select('*')
              .eq('user_id', sessionData.session.user.id)
              .maybeSingle();
            
            if (profile) {
              // Automatically generate a share_token if one is missing from an older row
              if (!profile.share_token) {
                profile.share_token = generateShortCode();
                await executeOrQueue('parent_profiles', 'update', { share_token: profile.share_token }, { eq: { 'user_id': profile.user_id } });
              }
              setParentProfile(profile);
              loadedParentProfile = profile;
              currentFamilyId = profile.family_id;
            } else {
              // Check if it's an existing child profile
              const { data: childProfile } = await supabase
                .from('child_profiles')
                .select('*')
                .eq('user_id', sessionData.session.user.id)
                .maybeSingle();

              if (childProfile) {
                setIsChildAuth(true);
                setAuthedChildId(childProfile.child_id);
                localStorage.setItem('RCH_CHILD_AUTH_ACTIVE', 'true');
                localStorage.setItem('RCH_AUTHED_CHILD_ID', childProfile.child_id);
                const { data: childData } = await supabase.from('children').select('parent_id').eq('id', childProfile.child_id).single();
                if (childData) currentFamilyId = childData.parent_id;
              } else {
                const urlParams = new URLSearchParams(window.location.search);
                const childShareToken = urlParams.get('child_share');
                
                if (childShareToken) {
                  // Link new child account using local storage to bypass RLS trap for new users
                  const pendingStr = localStorage.getItem('RCH_PENDING_CHILD_LINK');
                  let targetChild = pendingStr ? JSON.parse(pendingStr) : null;
                  
                  if (!targetChild) {
                    const { data } = await supabase.from('children').select('id, parent_id').eq('child_share_token', childShareToken).maybeSingle();
                    targetChild = data;
                  }

                  if (targetChild) {
                    await executeOrQueue('child_profiles', 'insert', { user_id: sessionData.session.user.id, child_id: targetChild.id });
                    
                    // Mark token as linked in DB so parent dashboard knows
                    await executeOrQueue('children', 'update', { child_share_token: `LINKED_${targetChild.id}`, linked_email: sessionData.session.user.email }, { eq: { 'id': targetChild.id } });
                    
                    setIsChildAuth(true);
                    setAuthedChildId(targetChild.id);
                    localStorage.setItem('RCH_CHILD_AUTH_ACTIVE', 'true');
                    localStorage.setItem('RCH_AUTHED_CHILD_ID', targetChild.id);
                    currentFamilyId = targetChild.parent_id;
                    localStorage.removeItem('RCH_PENDING_CHILD_LINK');
                  } else {
                    console.error("Invalid child share token or RLS prevented reading target child");
                    setIsLoadingData(false);
                    return;
                  }
                } else {
                  // Check if a parent pre-linked this child's email address
                  const userEmail = sessionData.session.user.email;
                  let linkedChildData = null;
                  if (userEmail) {
                    const { data: matchedChild } = await supabase
                      .from('children')
                      .select('id, parent_id')
                      .eq('linked_email', userEmail)
                      .maybeSingle();
                    linkedChildData = matchedChild;
                  }

                  if (linkedChildData) {
                    await executeOrQueue('child_profiles', 'insert', { user_id: sessionData.session.user.id, child_id: linkedChildData.id });
                    await executeOrQueue('children', 'update', { child_share_token: `LINKED_${linkedChildData.id}` }, { eq: { 'id': linkedChildData.id } });
                    
                    setIsChildAuth(true);
                    setAuthedChildId(linkedChildData.id);
                    localStorage.setItem('RCH_CHILD_AUTH_ACTIVE', 'true');
                    localStorage.setItem('RCH_AUTHED_CHILD_ID', linkedChildData.id);
                    currentFamilyId = linkedChildData.parent_id;
                  } else if (!urlParams.has('share')) {
                    // Logged in with a child Supabase account that has no linked child record
                    // and no join code in the URL — prompt the user to enter a join code
                    setShowChildJoinCodePrompt(true);
                    setIsLoadingData(false);
                    return;
                  } else {
                    // Creating a new parent profile
                    let familyId = parentEmail;
                    let inheritedFamilyName = null;
                    const shareToken = urlParams.get('share');
                    if (shareToken) {
                      const pendingStr = localStorage.getItem('RCH_PENDING_PARENT_LINK');
                      let inviter = pendingStr ? JSON.parse(pendingStr) : null;
                      if (!inviter) {
                        const { data } = await supabase
                          .from('parent_profiles')
                          .select('*')
                          .eq('share_token', shareToken)
                          .maybeSingle();
                        inviter = data;
                      }

                      if (inviter) {
                        familyId = inviter.family_id;
                        inheritedFamilyName = inviter.family_name;
                        localStorage.removeItem('RCH_PENDING_PARENT_LINK');
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
                      name: meta.name || localProfileObj.name || null,
                      share_token: generateShortCode(),
                      savings_pot_unlock_level: 2,
                      food_pot_unlock_level: 4,
                      gifting_pot_unlock_level: 6,
                      gold_pot_maintenance_unlock_level: 8,
                      gold_pot_maintenance_cost: 2,
                      points_to_level_up: 500,
                      level_up_gold_reward: 500
                    };
                    const { error: profileError } = await executeOrQueue('parent_profiles', 'upsert', newProfile, { onConflict: 'user_id' });
                    
                    if (profileError) {
                      console.error("Failed to create parent profile. Aborting init to prevent infinite loops.", profileError);
                      setIsLoadingData(false);
                      return; // Abort further inserts if profile fails
                    }
                    
                    // If this is a brand new family (no share token), seed the predefined templates OR migrate local data
                    if (!shareToken) {
                      const { data: dbChildCheck } = await supabase.from('children').select('id').eq('parent_id', familyId).limit(1);
                      const { data: dbTaskCheck } = await supabase.from('tasks').select('id').eq('parent_id', familyId).limit(1);

                      const hasDbData = (dbChildCheck && dbChildCheck.length > 0) || (dbTaskCheck && dbTaskCheck.length > 0);

                      if (!hasDbData) {
                        const localEmail = 'local_parent@rewardchart.app';
                        const userEmailKey = sessionData.session.user.email;
                        const localChildrenRaw = localStorage.getItem(`RCH_CHILDREN_${familyId}`) ||
                                                 (userEmailKey ? localStorage.getItem(`RCH_CHILDREN_${userEmailKey}`) : null) ||
                                                 localStorage.getItem(`RCH_CHILDREN_${localEmail}`);
                        const localTasksRaw = localStorage.getItem(`RCH_TASKS_${familyId}`) ||
                                              (userEmailKey ? localStorage.getItem(`RCH_TASKS_${userEmailKey}`) : null) ||
                                              localStorage.getItem(`RCH_TASKS_${localEmail}`);
                        const localCompletionsRaw = localStorage.getItem(`RCH_COMPLETIONS_${familyId}`) ||
                                                    (userEmailKey ? localStorage.getItem(`RCH_COMPLETIONS_${userEmailKey}`) : null) ||
                                                    localStorage.getItem(`RCH_COMPLETIONS_${localEmail}`);
                        const localRewardsRaw = localStorage.getItem(`RCH_REWARDS_${familyId}`) ||
                                                (userEmailKey ? localStorage.getItem(`RCH_REWARDS_${userEmailKey}`) : null) ||
                                                localStorage.getItem(`RCH_REWARDS_${localEmail}`);
                        const localRedemptionsRaw = localStorage.getItem(`RCH_REDEMPTIONS_${familyId}`) ||
                                                    (userEmailKey ? localStorage.getItem(`RCH_REDEMPTIONS_${userEmailKey}`) : null) ||
                                                    localStorage.getItem(`RCH_REDEMPTIONS_${localEmail}`);
                        const localGiftingRaw = localStorage.getItem(`RCH_GIFTING_${familyId}`) ||
                                                (userEmailKey ? localStorage.getItem(`RCH_GIFTING_${userEmailKey}`) : null) ||
                                                localStorage.getItem(`RCH_GIFTING_${localEmail}`);
                        
                        if (localChildrenRaw && JSON.parse(localChildrenRaw).length > 0) {
                           // Migrate all local data to this new family ID
                           const parsedChildren = JSON.parse(localChildrenRaw).map((c: any) => ({...c, parent_id: familyId}));
                           const parsedTasks = localTasksRaw ? JSON.parse(localTasksRaw).map((t: any) => ({...t, parent_id: familyId})) : [];
                           const parsedCompletions = localCompletionsRaw ? JSON.parse(localCompletionsRaw) : [];
                           const parsedRewards = localRewardsRaw ? JSON.parse(localRewardsRaw).map((r: any) => ({...r, parent_id: familyId})) : [];
                           const parsedRedemptions = localRedemptionsRaw ? JSON.parse(localRedemptionsRaw).map((r: any) => ({...r, parent_id: familyId})) : [];
                           const parsedGifting = localGiftingRaw ? JSON.parse(localGiftingRaw).map((r: any) => ({...r, parent_id: familyId})) : [];
                           
                           if (parsedChildren.length) await executeOrQueue('children', 'insert', parsedChildren);
                           if (parsedTasks.length) await executeOrQueue('tasks', 'insert', parsedTasks);
                           if (parsedCompletions.length) await executeOrQueue('completions', 'insert', parsedCompletions);
                           if (parsedRewards.length) await executeOrQueue('rewards', 'insert', parsedRewards);
                           if (parsedRedemptions.length) await executeOrQueue('reward_redemptions', 'insert', parsedRedemptions);
                           if (parsedGifting.length) await executeOrQueue('gifting_requests', 'insert', parsedGifting);
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
                           await executeOrQueue('tasks', 'insert', tasksToInsert);
                           await executeOrQueue('rewards', 'insert', rewardsToInsert);
                        }
                      }
                    }
                    
                    setParentProfile(newProfile as ParentProfile);
                    loadedParentProfile = newProfile as ParentProfile;
                    currentFamilyId = familyId;
                  }
                }
              }
            }
          }

          // Fetch linked parents
          const { data: linkedProfiles } = await supabase
            .from('parent_profiles')
            .select('*')
            .eq('family_id', currentFamilyId);
          if (linkedProfiles && linkedProfiles.length > 0) {
            setLinkedParents(linkedProfiles);
            if (!loadedParentProfile) {
              loadedParentProfile = linkedProfiles[0];
              setParentProfile(loadedParentProfile);
            }
          }


          const keyChildren = `RCH_CHILDREN_${currentFamilyId}`;
          const keyTasks = `RCH_TASKS_${currentFamilyId}`;
          const keyCompletions = `RCH_COMPLETIONS_${currentFamilyId}`;
          const keyRewards = `RCH_REWARDS_${currentFamilyId}`;

          // Fetch children
          let { data: dbChildren, error: errChildren } = await supabase
            .from('children')
            .select('*')
            .eq('parent_id', currentFamilyId);
          
          if (!errChildren) {
            let processedChildren = dbChildren || [];
            
            // Fallback: if logged in as child and processedChildren is empty, query by authedChildId directly
            if (processedChildren.length === 0 && (isChildAuth || localStorage.getItem('RCH_CHILD_AUTH_ACTIVE') === 'true')) {
              const targetChildId = authedChildId || localStorage.getItem('RCH_AUTHED_CHILD_ID');
              if (targetChildId) {
                const { data: singleChild } = await supabase
                  .from('children')
                  .select('*')
                  .eq('id', targetChildId)
                  .maybeSingle();
                if (singleChild) {
                  processedChildren = [singleChild];
                }
              }
            }
            
            // --- Main Money Daily/Monthly Logic ---
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const updatesByChildId: Record<string, Partial<Child>> = {};
            
            processedChildren = processedChildren.map(child => {
              let updated = { ...child };
              let updates: Partial<Child> = {};
              
              // 4. Retroactive Unlock Sync
              const savingsLvl = loadedParentProfile?.savings_pot_unlock_level ?? 2;
              if (!updated.savings_unlocked && updated.level >= savingsLvl) {
                updates.savings_unlocked = true;
                updates.savings_unlock_seen = false;
                updated = { ...updated, ...updates };
              }
              
              const foodLvl = loadedParentProfile?.food_pot_unlock_level ?? 4;
              if (!updated.food_pot_unlocked && updated.level >= foodLvl) {
                updates.food_pot_unlocked = true;
                updates.food_pot_unlock_seen = false;
                updated = { ...updated, ...updates };
              }
              
              const giftingLvl = loadedParentProfile?.gifting_pot_unlock_level ?? 6;
              if (!updated.gifting_unlocked && updated.level >= giftingLvl) {
                updates.gifting_unlocked = true;
                updates.gifting_unlock_seen = false;
                updated = { ...updated, ...updates };
              }

              // Weekly & Monthly Resets
              let nextWeeklyReset = updated.weekly_reset_date ? new Date(updated.weekly_reset_date) : null;
              if (!nextWeeklyReset || now >= nextWeeklyReset) {
                updates.weekly_points = 0;
                updates.food_pot_weekly_contribution = 0;
                updates.gold_pot_break_count_this_week = 0;
                updates.weekly_reset_date = getNextWeeklyResetDate(now).toISOString();
                updated = { ...updated, ...updates };
              }

              let nextMonthlyReset = updated.monthly_reset_date ? new Date(updated.monthly_reset_date) : null;
              if (!nextMonthlyReset || now >= nextMonthlyReset) {
                updates.monthly_points = 0;
                updates.monthly_reset_date = getNextMonthlyResetDate(now).toISOString();
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
                 executeOrQueue('children', 'update', updates, { eq: { 'id': id } }).then();
              });
            }
            // ---------------------------------------

            setChildren(processedChildren);
            localStorage.setItem(keyChildren, JSON.stringify(processedChildren));
          } else {
            console.warn('Could not load children from Supabase, using localStorage:', errChildren.message);
            loadLocalStorageFallback();
            return;
          }

          // Fetch tasks
          const { data: dbTasks, error: errTasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('parent_id', currentFamilyId);
          
          if (!errTasks) {
            const updated = (dbTasks || []).map((t: Task) => ({
              ...t,
              category: inferTaskCategory(t.title, t.category)
            }));
            setTasks(updated);
            localStorage.setItem(keyTasks, JSON.stringify(updated));
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

          // Clean up URL to remove token now that everything is loaded
          const urlParamsAfterLoad = new URLSearchParams(window.location.search);
          if (urlParamsAfterLoad.has('share') || urlParamsAfterLoad.has('child_share')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          
          setIsLoadingData(false);

        } catch (err) {
          console.warn('Error loading Supabase data:', err);
          loadLocalStorageFallback();
        }
      };

      fetchSupabaseData();

      // Subscribe to Realtime Postgres changes & custom Broadcasts across public tables
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
        .on(
          'broadcast',
          { event: 'data_changed' },
          (payload) => {
            console.log('Realtime broadcast received! Refreshing data...', payload);
            fetchSupabaseData();
          }
        )
        .subscribe();

      // Local tab broadcast channel
      const localBc = new BroadcastChannel('rch_data_sync');
      localBc.onmessage = (event) => {
        if (event.data === 'refresh') {
          fetchSupabaseData();
        }
      };

      // 10-second background polling fallback
      const pollInterval = setInterval(() => {
        fetchSupabaseData();
      }, 10000);

      // Cleanup subscription on unmount or parentEmail change
      return () => {
        clearInterval(pollInterval);
        localBc.close();
        supabase.removeChannel(dbChannel);
      };
    } else {
      // Local/demo mode - fetch from localStorage or defaults
      loadLocalStorageFallback();
    }
  }, [parentEmail, hasCompletedOnboarding, refreshTrigger]);


  // Sync state helpers to update local storage
  const syncChildren = (newList: Child[]) => {
    setChildren(newList);
    const key = (parentProfile?.family_id || parentEmail) ? `RCH_CHILDREN_${parentProfile?.family_id || parentEmail}` : 'RCH_CHILDREN';
    localStorage.setItem(key, JSON.stringify(newList));
    try {
      const bc = new BroadcastChannel('rch_data_sync');
      bc.postMessage('refresh');
      bc.close();
    } catch (e) {}
  };

  const syncTasks = (newList: Task[]) => {
    const updated = newList.map(t => ({
      ...t,
      category: inferTaskCategory(t.title, t.category)
    }));
    setTasks(updated);
    const key = (parentProfile?.family_id || parentEmail) ? `RCH_TASKS_${parentProfile?.family_id || parentEmail}` : 'RCH_TASKS';
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const syncCompletions = (newList: TaskCompletion[]) => {
    setCompletions(newList);
    const key = (parentProfile?.family_id || parentEmail) ? `RCH_COMPLETIONS_${parentProfile?.family_id || parentEmail}` : 'RCH_COMPLETIONS';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncRewards = (newList: Reward[]) => {
    setRewards(newList);
    const key = (parentProfile?.family_id || parentEmail) ? `RCH_REWARDS_${parentProfile?.family_id || parentEmail}` : 'RCH_REWARDS';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncRedemptions = (newList: RewardRedemption[]) => {
    setRedemptions(newList);
    const key = (parentProfile?.family_id || parentEmail) ? `RCH_REDEMPTIONS_${parentProfile?.family_id || parentEmail}` : 'RCH_REDEMPTIONS';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  const syncGiftingRequests = (newList: GiftingRequest[]) => {
    setGiftingRequests(newList);
    const key = (parentProfile?.family_id || parentEmail) ? `RCH_GIFTING_${parentProfile?.family_id || parentEmail}` : 'RCH_GIFTING';
    localStorage.setItem(key, JSON.stringify(newList));
  };

  // Supabase update helper
  const updateChildInSupabase = async (updatedChild: Child) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase
        .from('children')
        .update({
          points: updatedChild.points,
          level: updatedChild.level,
          streak_days: updatedChild.streak_days,
          last_active_date: updatedChild.last_active_date,
          level_up_bonuses_received: updatedChild.level_up_bonuses_received,
          lifetime_points: updatedChild.lifetime_points,
          weekly_points: updatedChild.weekly_points,
          monthly_points: updatedChild.monthly_points,
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
          food_pot_unlocked: updatedChild.food_pot_unlocked,
          food_pot_unlock_seen: updatedChild.food_pot_unlock_seen,
          food_pot_weekly_contribution: updatedChild.food_pot_weekly_contribution,
          tour_seen: updatedChild.tour_seen,
          pet_fed_today: updatedChild.pet_fed_today,
          pet_hunger_time: updatedChild.pet_hunger_time,
          pet_unhappy: updatedChild.pet_unhappy,
          last_fed_date: updatedChild.last_fed_date,
          last_hunger_check_date: updatedChild.last_hunger_check_date,
          gifting_unlocked: updatedChild.gifting_unlocked,
          gifting_unlock_seen: updatedChild.gifting_unlock_seen,
          gold_pot_maintenance_unlock_seen: updatedChild.gold_pot_maintenance_unlock_seen,
          gold_pot_broken: updatedChild.gold_pot_broken,
          gold_pot_break_count_this_week: updatedChild.gold_pot_break_count_this_week,
          gold_pot_break_week: updatedChild.gold_pot_break_week,
          gold_pot_last_check_date: updatedChild.gold_pot_last_check_date,
          gold_pot_last_leak_date: updatedChild.gold_pot_last_leak_date,
          gold_pot_last_fix_date: updatedChild.gold_pot_last_fix_date,
          gold_pot_total_leaked: updatedChild.gold_pot_total_leaked,
          gold_pot_intro_seen: updatedChild.gold_pot_intro_seen,
          last_saved_date: updatedChild.last_saved_date,
          last_gifting_date: updatedChild.last_gifting_date,
          savings_deposits: updatedChild.savings_deposits,
          pet_fed_total: updatedChild.pet_fed_total,
          gifts_made: updatedChild.gifts_made,
          gold_pot_fixes: updatedChild.gold_pot_fixes,
          gold_pot_unbroken_days: updatedChild.gold_pot_unbroken_days,
          holiday_mode: updatedChild.holiday_mode
        })
        .eq('id', updatedChild.id);
      if (error) {
        console.warn('Failed to sync child update to Supabase:', error);
        console.warn('Payload was:', {
          points: updatedChild.points, level: updatedChild.level
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

    const emailToUse = data.skippedAccount ? 'local_parent@rewardchart.app' : (data.email || parentEmail || 'local_parent@rewardchart.app');
    
    // Save parent profile locally so it persists in local mode
    const localProfile = {
      user_id: '',
      email: emailToUse,
      family_id: emailToUse,
      family_name: data.familyName,
      name: data.parentName,
      share_token: null,
      savings_pot_unlock_level: 2,
      food_pot_unlock_level: 4,
      gifting_pot_unlock_level: 6,
      gold_pot_maintenance_unlock_level: 8,
      gold_pot_maintenance_cost: 2,
      points_to_level_up: 500,
      level_up_gold_reward: 500
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
      streak_days: 0,
      pet_food: 0,
      food_pot_unlocked: false,
      food_pot_unlock_seen: false,
      food_pot_weekly_contribution: 0,
      pet_fed_today: true,
      pet_hunger_time: null,
      pet_unhappy: false,
      last_fed_date: null,
      last_hunger_check_date: new Date().toISOString().split('T')[0],
      gifting_unlocked: false,
      gifting_unlock_seen: false,
      lifetime_points: 0,
      weekly_points: 0,
      monthly_points: 0,
      last_active_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    })) as Child[];

    // Create tasks
    const initialTasks: Task[] = [];
    const templateToChildTaskMap: Record<string, Record<string, string>> = {};
    
    initialChildren.forEach(c => {
      templateToChildTaskMap[c.id] = {};
    });

    data.selectedTasks.forEach((t, index) => {
      const templateId = `task_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`;
      // Add as a template
      initialTasks.push({
        ...t,
        id: templateId,
        created_at: new Date().toISOString(),
        parent_id: emailToUse,
        is_template: true
      });
      // Assign to all children immediately
      initialChildren.forEach((child, cIdx) => {
        const newTaskId = `task_${Date.now()}_${index}_${cIdx}_${Math.random().toString(36).substring(2, 9)}`;
        templateToChildTaskMap[child.id][t.id] = newTaskId;
        initialTasks.push({
          ...t,
          id: newTaskId,
          created_at: new Date().toISOString(),
          parent_id: emailToUse,
          is_template: false,
          child_id: child.id,
          template_id: templateId
        });
      });
    });

    // Assign routines to children
    initialChildren.forEach((child, cIdx) => {
      if (data.selectedRoutines && data.selectedRoutines.length > 0) {
        const childRoutines: Routine[] = data.selectedRoutines.map((r, rIdx) => {
          const mapTaskIds = (templateIds: string[]) => templateIds.map(tid => templateToChildTaskMap[child.id][tid]).filter(Boolean);
          return {
            id: `routine_${Date.now()}_${cIdx}_${rIdx}_${Math.random().toString(36).substring(2, 9)}`,
            name: r.name,
            morningTaskIds: mapTaskIds(r.morningTaskIds),
            afternoonTaskIds: mapTaskIds(r.afternoonTaskIds),
            eveningTaskIds: mapTaskIds(r.eveningTaskIds),
          };
        });

        child.routines = childRoutines;
        if (childRoutines.length > 0) {
          child.active_routine_id = childRoutines[0].id;
        }
      }
    });

    const initialRewards: Reward[] = [];
    data.selectedRewards.forEach((r, index) => {
      const templateId = `reward_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`;
      // Add as a template
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

    // Save to LocalStorage under the user's specific email key
    localStorage.setItem(`RCH_CHILDREN_${emailToUse}`, JSON.stringify(initialChildren));
    localStorage.setItem(`RCH_TASKS_${emailToUse}`, JSON.stringify(initialTasks));
    localStorage.setItem(`RCH_REWARDS_${emailToUse}`, JSON.stringify(initialRewards));

    // Also sync to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase && emailToUse !== 'local_parent@rewardchart.app') {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (userId) {
          const dbProfile = {
            user_id: userId,
            email: emailToUse,
            family_id: emailToUse,
            family_name: data.familyName,
            name: data.parentName,
            share_token: generateShortCode(),
            savings_pot_unlock_level: 2,
            food_pot_unlock_level: 4,
            gifting_pot_unlock_level: 6,
            gold_pot_maintenance_unlock_level: 8,
            gold_pot_maintenance_cost: 2,
            points_to_level_up: 500,
            level_up_gold_reward: 500
          };
          await executeOrQueue('parent_profiles', 'upsert', dbProfile, { onConflict: 'user_id' });
          setParentProfile(dbProfile as ParentProfile);

          if (initialChildren.length > 0) {
            await executeOrQueue('children', 'insert', initialChildren);
          }
          if (initialTasks.length > 0) {
            await executeOrQueue('tasks', 'insert', initialTasks);
          }
          if (initialRewards.length > 0) {
            await executeOrQueue('rewards', 'insert', initialRewards);
          }
        }
      } catch (syncErr) {
        console.error("Error syncing onboarding data to Supabase:", syncErr);
      }
    }

    // Clean up draft onboarding state
    localStorage.removeItem('RCH_DRAFT_ONBOARDING');

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
    setPostSignUpData(null);

    // Request Push Notification Permissions after onboarding
    if (OneSignal.Notifications && OneSignal.Notifications.isPushSupported()) {
      OneSignal.Notifications.requestPermission().catch(err => console.warn('OneSignal permission prompt skipped/failed', err));
    }
  };

  const handleSignUpReal = (email: string, name: string, familyName: string) => {
    // Clear old state to prepare fresh real/blank dashboard loads
    localStorage.removeItem('RCH_CHILDREN');
    localStorage.removeItem('RCH_TASKS');
    localStorage.removeItem('RCH_COMPLETIONS');
    localStorage.removeItem('RCH_REWARDS');

    setParentEmail(email);
    localStorage.setItem('RCH_PARENT_EMAIL', email);
    setPostSignUpData({ email, parentName: name, familyName });
    
    const isShared = new URLSearchParams(window.location.search).has('share');
    const isChildShared = new URLSearchParams(window.location.search).has('child_share');

    if (isShared || isChildShared) {
      // Joining existing family or linking child - skip wizard
      setHasCompletedOnboarding(true);
      localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'true');
      if (isShared) {
        setIsParentMode(true); // Drop them into parent view
      } else {
        setIsParentMode(false); // Child stays in child view
      }
    } else {
      // New family - run onboarding wizard
      setHasCompletedOnboarding(false);
      localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'false');
    }
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
    setHasCompletedOnboarding(true);
    localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'true');
  };

  const handleLogout = async () => {
    playSound.click();
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    posthog.reset();
    setParentEmail(null);
    setParentProfile(null);
    setIsParentMode(false);
    localStorage.removeItem('RCH_PARENT_MODE_ACTIVE');
    localStorage.removeItem('RCH_PARENT_EMAIL');
    localStorage.removeItem('RCH_CHILDREN');
    localStorage.removeItem('RCH_TASKS');
    localStorage.removeItem('RCH_COMPLETIONS');
    localStorage.removeItem('RCH_REWARDS');
    localStorage.removeItem('RCH_REDEMPTIONS');
    localStorage.removeItem('RCH_GIFTING');
    localStorage.removeItem('RCH_LOCKED_CHILD_ID');
    localStorage.removeItem('RCH_CHILD_AUTH_ACTIVE');
    localStorage.removeItem('RCH_AUTHED_CHILD_ID');
    setIsChildAuth(false);
    setAuthedChildId(null);
    window.location.reload();
  };


  const handleApplyChildJoinCode = async () => {
    if (!childJoinCodeInput.trim()) return;
    setIsApplyingChildJoinCode(true);
    setChildJoinCodeError('');
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Backend not connected');
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No active session');

      const code = childJoinCodeInput.trim();
      const { data: childData } = await supabase
        .from('children')
        .select('id, parent_id')
        .eq('child_share_token', code)
        .maybeSingle();

      if (!childData) {
        setChildJoinCodeError('Invalid join code. Please check and try again.');
        playSound.pinError();
        return;
      }

      // Link the child profile
      await executeOrQueue('child_profiles', 'insert', {
        user_id: sessionData.session.user.id,
        child_id: childData.id,
      });
      // Mark token as linked so parent dashboard knows
      await executeOrQueue(
        'children',
        'update',
        { child_share_token: `LINKED_${childData.id}`, linked_email: sessionData.session.user.email },
        { eq: { id: childData.id } }
      );

      setIsChildAuth(true);
      setAuthedChildId(childData.id);
      localStorage.setItem('RCH_CHILD_AUTH_ACTIVE', 'true');
      localStorage.setItem('RCH_AUTHED_CHILD_ID', childData.id);
      setShowChildJoinCodePrompt(false);
      playSound.pinSuccess();
      // Reload to fully initialise with the newly linked child account
      window.location.reload();
    } catch (e: any) {
      setChildJoinCodeError(e.message || 'Something went wrong. Please try again.');
      playSound.pinError();
    } finally {
      setIsApplyingChildJoinCode(false);
    }
  };

  const handleResetData = async (keepTemplates: boolean, keepAssignments: boolean, keepRoutines: boolean, targetChildId: string) => {
    const familyId = parentProfile?.family_id || parentEmail;

    const childrenToReset = targetChildId === 'all' ? children : children.filter(c => c.id === targetChildId);
    const childIds = childrenToReset.map(c => c.id);

    // Clean up child-specific localStorage flags (seen gift toasts & feed reminders)
    childIds.forEach(id => {
      localStorage.removeItem(`RCH_SEEN_GIFTS_${id}`);
      localStorage.removeItem(`feed_reminder_${id}`);
      localStorage.removeItem(`RCH_TOUR_SEEN_CHILD_${id}`);
    });

    const supabase = getSupabaseClient();
    if (supabase && familyId) {
      if (!keepTemplates && targetChildId === 'all') {
        await executeOrQueue('tasks', 'delete', null, { eq: { 'parent_id': familyId, 'is_template': true } });
        await executeOrQueue('rewards', 'delete', null, { eq: { 'parent_id': familyId, 'is_template': true } });
      }

      if (!keepAssignments) {
        if (targetChildId === 'all') {
          await executeOrQueue('tasks', 'delete', null, { eq: { 'parent_id': familyId, 'is_template': false } });
          await executeOrQueue('rewards', 'delete', null, { eq: { 'parent_id': familyId, 'is_template': false } });
        } else {
          await executeOrQueue('tasks', 'delete', null, { eq: { 'child_id': targetChildId, 'is_template': false } });
          await executeOrQueue('rewards', 'delete', null, { eq: { 'child_id': targetChildId, 'is_template': false } });
        }
      }

      if (childIds.length > 0) {
        // Explicit per-child deletions to guarantee clean table resets in Supabase
        for (const id of childIds) {
          await supabase.from('child_badges').delete().eq('child_id', id);
          await supabase.from('completions').delete().eq('child_id', id);
          await supabase.from('reward_redemptions').delete().eq('child_id', id);
          await supabase.from('gifting_requests').delete().eq('child_id', id);
        }

        await executeOrQueue('completions', 'delete', null, { in: { column: 'child_id', values: childIds } });
        await executeOrQueue('child_badges', 'delete', null, { in: { column: 'child_id', values: childIds } });
        await executeOrQueue('reward_redemptions', 'delete', null, { in: { column: 'child_id', values: childIds } });
        await executeOrQueue('gifting_requests', 'delete', null, { in: { column: 'child_id', values: childIds } });
      }
    }

    const updatedChildren = children.map(c => {
      if (targetChildId !== 'all' && c.id !== targetChildId) return c;
      return {
        ...c,
        points: 0,
        level: 1,
        streak_days: 0,
        monthly_points: 0,
        lifetime_points: 0,
        pet_food: 0,
        weekly_points: 0,
        savings_pot: 0,
        savings_unlocked: false,
        savings_unlock_seen: false,
        food_pot_unlocked: false,
        food_pot_unlock_seen: false,
        food_pot_weekly_contribution: 0,
        savings_goal_name: null,
        savings_goal_amount: null,
        savings_goal_reward_id: null,
        pet_fed_today: false,
        pet_unhappy: false,
        last_fed_date: null,
        last_saved_date: null,
        gifting_unlocked: false,
        gifting_unlock_seen: false,
        gifting_pot: 0,
        last_gifting_date: null,
        gold_pot_broken: false,
        gold_pot_break_count_this_week: 0,
        gold_pot_break_week: null,
        gold_pot_last_leak_date: null,
        gold_pot_last_check_date: null,
        gold_pot_last_fix_date: null,
        gold_pot_total_leaked: 0,
        gold_pot_intro_seen: false,
        gold_pot_maintenance_unlock_seen: false,
        level_up_bonuses_received: 0,
        pet_fed_total: 0,
        pet_happy_streak: 0,
        savings_deposits: 0,
        savings_goals_met: 0,
        gifts_made: 0,
        gold_pot_fixes: 0,
        gold_pot_unbroken_days: 0,
        manual_deductions: 0,
        ...(!keepRoutines ? { routines: [], active_routine_id: null } : {})
      };
    });

    syncChildren(updatedChildren);

    if (supabase) {
      for (const child of updatedChildren) {
        if (targetChildId === 'all' || child.id === targetChildId) {
          await executeOrQueue('children', 'update', child, { eq: { 'id': child.id } });
        }
      }
    }

    let newTasks = [...tasks];
    let newRewards = [...rewards];

    if (!keepTemplates && targetChildId === 'all') {
      newTasks = newTasks.filter(t => !t.is_template);
      newRewards = newRewards.filter(r => r.is_template === false);
    }

    if (!keepAssignments) {
      if (targetChildId === 'all') {
        newTasks = newTasks.filter(t => t.is_template);
        newRewards = newRewards.filter(r => r.is_template);
      } else {
        newTasks = newTasks.filter(t => t.is_template || t.child_id !== targetChildId);
        newRewards = newRewards.filter(r => r.is_template || r.child_id !== targetChildId);
      }
    }

    syncTasks(newTasks);
    syncRewards(newRewards);

    syncCompletions(targetChildId === 'all' ? [] : completions.filter(c => c.child_id !== targetChildId));
    syncRedemptions(targetChildId === 'all' ? [] : redemptions.filter(r => r.child_id !== targetChildId));
    syncGiftingRequests(targetChildId === 'all' ? [] : giftingRequests.filter(g => g.child_id !== targetChildId));
  };

  const handleDeleteAccount = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.rpc('delete_user_account');
      handleLogout();
    }
  };

  const handleRunSetup = async () => {
    await handleResetData(false, false, false, 'all');
    
    const familyId = parentProfile?.family_id || parentEmail;
    if (familyId) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await executeOrQueue('children', 'delete', null, { eq: { 'family_id': familyId } });
        syncChildren([]);
      }
    }

    await handleLogout();
    setHasCompletedOnboarding(false);
    localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'false');
  };

  // Parent Gating
  const handleEnterParentModeRequest = (
    targetTab?: 'home' | 'children' | 'tasks' | 'rewards' | 'compliance' | 'settings' | 'targets',
    targetSubTab?: 'directory' | 'active' | 'routines'
  ) => {
    setInitialParentTab(targetTab || 'home');
    setInitialParentSubTab(targetSubTab || 'directory');
    setShowLockScreen(true);
  };

  const handleParentLockSuccess = () => {
    setShowLockScreen(false);
    setIsParentMode(true);
    localStorage.setItem('RCH_PARENT_MODE_ACTIVE', 'true');
    setLockedChildId(null);
    localStorage.removeItem('RCH_LOCKED_CHILD_ID');
  };

  const handleExitParentMode = () => {
    setIsParentMode(false);
    setInitialParentTab('home');
    setInitialParentSubTab('directory');
    localStorage.removeItem('RCH_PARENT_MODE_ACTIVE');
  };

  // Operations: Children
  const handleAddChild = async (name: string, characterId: string, avatarUrl: string, age?: number) => {
    const newChild: Child = {
      id: `child_${Date.now()}`,
      parent_id: (parentProfile?.family_id || parentEmail) || 'parent_demo',
      name,
      age,
      avatar_url: avatarUrl,
      character_id: characterId,
      points: 0,
      level: 1,
      streak_days: 0,
      pet_food: 0,
      food_pot_unlocked: false,
      food_pot_unlock_seen: false,
      food_pot_weekly_contribution: 0,
      pet_fed_today: true,
      pet_hunger_time: null,
      pet_unhappy: false,
      last_fed_date: null,
      last_hunger_check_date: new Date().toISOString().split('T')[0],
      gifting_unlocked: false,
      gifting_unlock_seen: false,
      lifetime_points: 0,
      weekly_points: 0,
      monthly_points: 0,
      created_at: new Date().toISOString()
    };
    syncChildren([...children, newChild]);

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await executeOrQueue('children', 'insert', newChild);
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
    if (supabase && updatedChild) {
      const { error } = await executeOrQueue('children', 'update', updatedChild, { eq: { 'id': id } });
      if (error) console.warn('Failed to update child in Supabase:', error.message);
    }
  };

  const handleDeleteChild = async (id: string) => {
    const updatedChildren = children.filter(c => c.id !== id);
    syncChildren(updatedChildren);

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.rpc('delete_child_account', { p_child_id: id });
      if (error) {
        console.warn('Failed to securely delete child account from Supabase:', error.message);
        const { error: dbError } = await executeOrQueue('children', 'delete', null, { eq: { 'id': id } });
        if (dbError) console.warn('Failed to delete child row:', dbError.message);
      }
    }
  };

  const handleUnlinkChild = async (id: string) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.rpc('delete_child_account', { p_child_id: id });
      if (error) {
        console.warn('Failed to securely unlink child account from Supabase:', error.message);
      }
    }
    // Update local and remote state to remove the link token
    handleEditChild(id, { child_share_token: null });
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

    // 1b. Level down check
    while (newLevel > 1 && newLifetimePoints < ((newLevel - 1) * pointsToLevelUp)) {
      newLevel--;
      bonusesReceived = Math.max(0, bonusesReceived - 1);
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
      // Let it update points through the pipeline, but we must explicitly add the new points
      // because processLifetimePoints only handles lifetime and bonuses.
      targetChild.points += addedPoints;
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
    if (supabase) {
      const { error } = await executeOrQueue('tasks', 'insert', newTask);
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
    if (supabase) {
      if (instancesToDelete.length > 0) {
        await supabase.from('tasks').delete().in('id', instancesToDelete.map(t => t.id));
      }
      if (newTasks.length > 0) {
        await executeOrQueue('tasks', 'insert', newTasks);
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
    if (supabase) {
      const { error } = await executeOrQueue('tasks', 'update', updates, { or: `id.eq.${id},template_id.eq.${id}` });
      if (error) console.warn('Failed to update task in Supabase:', error.message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    syncTasks(tasks.filter(t => t.id !== id && t.template_id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await executeOrQueue('tasks', 'delete', null, { or: `id.eq.${id},template_id.eq.${id}` });
      if (error) console.warn('Failed to delete task in Supabase:', error.message);
    }
  };

  // Operations: Rewards
  const handleAddReward = async (
    title: string, 
    cost: number, 
    iconName: string,
    limitType: any,
    isBadgeEligible: boolean = false
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
      is_badge_eligible: isBadgeEligible,
      created_at: new Date().toISOString()
    };
    syncRewards([...rewards, newReward]);

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await executeOrQueue('rewards', 'insert', newReward);
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
    if (supabase) {
      if (instancesToDelete.length > 0) {
        await supabase.from('rewards').delete().in('id', instancesToDelete.map(r => r.id));
      }
      if (newRewards.length > 0) {
        await executeOrQueue('rewards', 'insert', newRewards);
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
    if (supabase) {
      const { error } = await executeOrQueue('rewards', 'update', updates, { or: `id.eq.${id},template_id.eq.${id}` });
      if (error) console.warn('Failed to update reward in Supabase:', error.message);
    }
  };

  const handleDeleteReward = async (id: string) => {
    syncRewards(rewards.filter(r => r.id !== id && r.template_id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await executeOrQueue('rewards', 'delete', null, { or: `id.eq.${id},template_id.eq.${id}` });
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
    if (supabase) {
      const { error } = await executeOrQueue('completions', 'insert', newCompletion);
      if (error) console.warn('Failed to sync completion to Supabase:', error.message);
    }
  };

  const handleAddCoins = async (childId: string, amount: number, reason: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    let targetChild = processLifetimePoints(child, amount);
    targetChild.points = child.points + amount;

    const updatedChildren = children.map(c => c.id === child.id ? targetChild : c);
    syncChildren(updatedChildren);

    // Create a bonus completion
    const newCompletion: TaskCompletion = {
      id: `comp_bonus_${Date.now()}`,
      task_id: 'bonus',
      child_id: childId,
      status: 'approved',
      points_awarded: amount,
      completed_at: new Date().toISOString(),
      notes: reason && reason.trim() ? reason : 'Good Work Bonus'
    };
    syncCompletions([...completions, newCompletion]);

    const supabase = getSupabaseClient();
    if (supabase) {
      updateChildInSupabase(targetChild);
      const { error } = await executeOrQueue('completions', 'insert', newCompletion);
      if (error) console.warn('Failed to sync completion to Supabase:', error.message);
    }
  };

  const handleDeductCoins = async (childId: string, amount: number, reason: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    // Take Coins should not take off the lifetime but just the current total.
    let targetChild = { ...child };
    targetChild.points = Math.max(0, child.points - amount);

    const updatedChildren = children.map(c => c.id === child.id ? targetChild : c);
    syncChildren(updatedChildren);

    // Create a penalty completion
    const newCompletion: TaskCompletion = {
      id: `comp_penalty_${Date.now()}`,
      task_id: 'penalty',
      child_id: childId,
      points_awarded: -amount,
      status: 'approved',
      completed_at: new Date().toISOString(),
      notes: reason && reason.trim() ? reason : 'Deduction'
    };
    syncCompletions([...completions, newCompletion]);

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error: childError } = await executeOrQueue('children', 'update', {
        points: targetChild.points,
        lifetime_points: targetChild.lifetime_points,
        level: targetChild.level,
        level_up_bonuses_received: targetChild.level_up_bonuses_received
      }, { eq: { 'id': targetChild.id } });
      if (childError) console.warn('Failed to update child points for penalty in Supabase:', childError.message);

      const { error: compError } = await executeOrQueue('completions', 'insert', newCompletion);
      if (compError) console.warn('Failed to sync penalty completion to Supabase:', compError.message);
    }
  };

  const handleClaimReward = async (rewardId: string, childId: string, paymentSource: string = 'main') => {
    const reward = rewards.find(r => r.id === rewardId);
    const child = children.find(c => c.id === childId);
    const availablePoints = paymentSource === 'savings' ? (child?.savings_pot || 0) : (child?.points || 0);
    const isBadgeFreebie = paymentSource.startsWith('badge_freebie');
    const hasEnoughPoints = isBadgeFreebie ? true : availablePoints >= (reward?.cost_points || 0);
    if (!reward || !child || !hasEnoughPoints || !reward.is_available) return;

    // --- Limit Checks ---
    const now = new Date();
    const childRedemptions = redemptions.filter(r => r.child_id === childId && r.reward_id === rewardId);
    
    if (!isBadgeFreebie) {
      if (reward.limit_type === 'daily') {
        const startOfDay = getStartOfDailyReset(now);
        const todayRedemptions = childRedemptions.filter(r => new Date(r.redeemed_at).getTime() >= startOfDay);
        if (todayRedemptions.length >= 1) return; // Limit reached
      } 
      else if (reward.limit_type === 'twice_daily') {
        const startOfDay = getStartOfDailyReset(now);
        const todayRedemptions = childRedemptions.filter(r => new Date(r.redeemed_at).getTime() >= startOfDay);
        if (todayRedemptions.length >= 2) return; // Limit reached
        
        // Wait at least 6 hours between redemptions
        if (todayRedemptions.length === 1) {
          const lastRedeem = new Date(todayRedemptions[0].redeemed_at).getTime();
          const hrsSinceLast = (now.getTime() - lastRedeem) / (1000 * 60 * 60);
          if (hrsSinceLast < 6) return;
        }
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
    if (supabase) {
      const { error } = await executeOrQueue('reward_redemptions', 'insert', newRedemption);
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
      const isBadgeFreebie = redemption.payment_source?.startsWith('badge_freebie');
      const cost = (reward && !isBadgeFreebie) ? reward.cost_points : 0;
      const isSavingsPurchase = redemption.payment_source === 'savings';
      const targetChild = {
        ...child,
        points: isSavingsPurchase ? child.points : Math.max(0, child.points - cost),
        savings_pot: isSavingsPurchase ? Math.max(0, (child.savings_pot || 0) - cost) : child.savings_pot,
        pet_food: (child.pet_food || 0) + (cost > 0 || isBadgeFreebie ? 1 : 0),
      };

      const updatedChildren = children.map(c => c.id === child.id ? targetChild : c);
      syncChildren(updatedChildren);
      
      // Explicitly wait for child to update in DB before updating the redemption
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await executeOrQueue('children', 'update', targetChild, { eq: { 'id': targetChild.id } });
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
    if (supabase) {
      const { error } = await executeOrQueue('reward_redemptions', 'update', { status: 'delivered' }, { eq: { 'id': redemptionId } });
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
    if (supabase) {
      const { error } = await executeOrQueue('children', 'update', {
        pet_food: targetChild.pet_food,
        pet_fed_today: targetChild.pet_fed_today,
        pet_unhappy: targetChild.pet_unhappy,
        last_fed_date: targetChild.last_fed_date
      }, { eq: { 'id': targetChild.id } });
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
      food_pot_weekly_contribution: (child.food_pot_weekly_contribution || 0) + 1,
      last_fed_date: new Date().toISOString()
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  const handleSellPetFood = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child || (child.pet_food || 0) < 1) return;

    const targetChild = {
      ...child,
      points: child.points + 1,
      pet_food: child.pet_food! - 1,
      food_pot_weekly_contribution: Math.max(0, (child.food_pot_weekly_contribution || 0) - 1)
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


  const handleSavingsDeposit = async (childId: string, amount: number) => {
    const child = children.find(c => c.id === childId);
    if (!child || amount <= 0 || amount > child.points) return;

    const targetChild = {
      ...child,
      points: child.points - amount,
      savings_pot: (child.savings_pot || 0) + amount,
      last_saved_date: new Date().toISOString()
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
    updateChildInSupabase(targetChild);
  };

  const handleUpdateParentProfile = async (updates: Partial<ParentProfile>) => {
    if (parentProfile) {
      const updated = { ...parentProfile, ...updates };
      setParentProfile(updated);
      localStorage.setItem('RCH_PARENT_PROFILE', JSON.stringify(updated));
      await executeOrQueue('parent_profiles', 'update', updates, { eq: { 'user_id': parentProfile.user_id } });
    }
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

  const handleAppIntroSeen = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const targetChild = {
      ...child,
      gold_pot_intro_seen: true
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
    if (supabase) {
      const { error } = await executeOrQueue('reward_redemptions', 'update', targetRedemption, { eq: { 'id': redemption.id } });
      if (error) {
        console.error("Failed to update redemption:", error);
      }
    }
  };

  const handleRestoreReward = async (rewardId: string) => {
    handleEditReward(rewardId, { is_available: true });
  };

  const handleParentCompleteTask = async (taskId: string, childId: string, dateIso?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Create a completion directly as 'approved'
    const newCompletion: TaskCompletion = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      task_id: taskId,
      child_id: childId,
      points_awarded: task.points,
      status: 'approved',
      completed_at: dateIso || new Date().toISOString()
    };

    syncCompletions([...completions, newCompletion]);

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await executeOrQueue('completions', 'insert', newCompletion);
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
    if (supabase) {
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
    const comp = completions.find(c => c.id === completionId);

    // Delete or decline completion
    const updatedCompletions = completions.filter(c => c.id !== completionId);
    syncCompletions(updatedCompletions);

    // If the completion was already approved, perform FULL POINTS REVERSAL!
    if (comp && comp.status === 'approved') {
      const child = children.find(c => c.id === comp.child_id);
      if (child) {
        const pointsDeduction = comp.points_awarded || 0;
        const newPoints = Math.max(0, child.points - pointsDeduction);
        const newLifetimePoints = Math.max(0, (child.lifetime_points || 0) - pointsDeduction);
        const newLevel = Math.max(1, Math.floor(newLifetimePoints / 500) + 1);

        const updatedChild: Child = {
          ...child,
          points: newPoints,
          lifetime_points: newLifetimePoints,
          level: newLevel
        };

        const updatedChildren = children.map(c => c.id === comp.child_id ? updatedChild : c);
        syncChildren(updatedChildren);
        updateChildInSupabase(updatedChild);
      }
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await executeOrQueue('completions', 'delete', null, { eq: { 'id': completionId } });
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
    if (supabase) {
      const { error } = await executeOrQueue('gifting_requests', 'insert', newRequest);
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
    if (supabase) {
      const { error } = await executeOrQueue('gifting_requests', 'insert', newRequest);
      if (error) console.warn('Failed to sync gifting request to Supabase:', error.message);
    }
  };

  const handleApproveGiftingRequest = async (requestId: string) => {
    const request = giftingRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return;

    const child = children.find(c => c.id === request.child_id);
    if (!child || child.points < request.amount) return;

    // Deduct from sender's points & increment gift count by 1
    let targetChild = {
      ...child,
      points: child.points - request.amount,
      gifts_made: (child.gifts_made || 0) + 1,
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
    if (supabase) {
      const { error } = await executeOrQueue('gifting_requests', 'update', { status: 'approved' }, { eq: { 'id': requestId } });
      if (error) console.warn('Failed to update gifting request in Supabase:', error.message);
    }
  };

  const handleRejectGiftingRequest = async (requestId: string) => {
    const request = giftingRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return;

    const updatedRequests = giftingRequests.map(r => r.id === requestId ? { ...r, status: 'rejected' as const } : r);
    syncGiftingRequests(updatedRequests);

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await executeOrQueue('gifting_requests', 'update', { status: 'rejected' }, { eq: { 'id': requestId } });
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
  const handleGoldPotMaintenanceUnlockSeen = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const targetChild = {
      ...child,
      gold_pot_maintenance_unlock_seen: true,
      gold_pot_last_check_date: new Date().toISOString().split('T')[0]
    };
    const updatedChildren = children.map(c => c.id === childId ? targetChild : c);
    syncChildren(updatedChildren);
updateChildInSupabase(targetChild);
  };


  return (
    <SubscriptionProvider currentUserId={parentProfile?.user_id}>
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-stone-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-stone-400 font-medium">Loading Reward Chart...</p>
        </div>
      </div>
    }>
    <div className={`relative min-h-screen transition-all duration-300 dark:bg-stone-950`} id="app-main">
      
      {/* Immersive Confetti Layer */}
      <Confetti active={celebrationActive} onComplete={() => setCelebrationActive(false)} />

      {/* Screen Routing */}
      <AnimatePresence mode="wait">
        {showShowcase ? (
          <motion.div
            key="showcase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <Showcase />
          </motion.div>
        ) : (!hasCompletedOnboarding && !isChildAuth && !new URLSearchParams(window.location.search).has('share') && !new URLSearchParams(window.location.search).has('child_share')) ? (
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
              onJoinCodeInstead={() => {
                window.history.replaceState({}, document.title, '?mode=joinCode');
                setHasCompletedOnboarding(true);
                localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'true');
              }}
              initialStep={postSignUpData ? 'children' : (onboardingInitialStep || 'welcome')}
              initialData={postSignUpData ? {
                parentName: postSignUpData.parentName,
                familyName: postSignUpData.familyName,
                email: postSignUpData.email,
              } : undefined}
              skipAccountStep={!!postSignUpData}
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
              onSignUpReal={handleSignUpReal}
              onBackToLanding={() => {
                setOnboardingInitialStep('welcome');
                setHasCompletedOnboarding(false);
                localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'false');
                if (new URLSearchParams(window.location.search).has('share') || new URLSearchParams(window.location.search).has('child_share')) {
                  window.history.replaceState({}, document.title, window.location.pathname);
                  // Force a re-render to evaluate URL params correctly
                  setShowLogin(false);
                }
              }}
              onCreateNewAccount={() => {
                setOnboardingInitialStep('role');
                setHasCompletedOnboarding(false);
                localStorage.setItem('RCH_ONBOARDING_COMPLETE', 'false');
              }}
              theme={activeTheme}
            />
          </motion.div>
        ) : isParentMode && !isChildAuth ? (
          <motion.div
            key="parent-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <ParentDashboard
              onRefresh={triggerDataRefresh}
              isLoading={isLoadingData}
              initialTab={initialParentTab}
              initialSubTab={initialParentSubTab}
              children={children}
              tasks={tasks}
              completions={completions}
              rewards={rewards}
              redemptions={redemptions}
              giftingRequests={giftingRequests}
              onAddChild={handleAddChild}
              onEditChild={handleEditChild}
              onDeleteChild={handleDeleteChild}
              onUnlinkChild={handleUnlinkChild}
              onUpdateChildStats={handleUpdateChildStats}
              onDeductCoins={handleDeductCoins}
              onAddCoins={handleAddCoins}
              onAddTask={handleAddTask}
              onAssignTask={handleAssignTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onUpdateParentProfile={handleUpdateParentProfile}
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
              onRefresh={triggerDataRefresh}
              isLoading={isLoadingData}
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
              onSavingsDeposit={handleSavingsDeposit}
              onSavingsWithdraw={handleSavingsWithdraw}
              onSavingsGoal={handleSavingsGoal}
              onClearSavingsGoal={handleClearSavingsGoal}
              onSavingsUnlockSeen={handleSavingsUnlockSeen}
              onEditChild={handleEditChild}
              onAppIntroSeen={handleAppIntroSeen}
              onBuyPetFood={handleBuyPetFood}
              onSellPetFood={handleSellPetFood}
              onFoodPotUnlockSeen={handleFoodPotUnlockSeen}
              onGiftingRequestCharity={handleGiftingRequestCharity}
              onGiftingRequestSibling={handleGiftingRequestSibling}
              onGiftingUnlockSeen={handleGiftingUnlockSeen}
              onGoldPotMaintenanceUnlockSeen={handleGoldPotMaintenanceUnlockSeen}
              onUpdateChildStats={handleUpdateChildStats}
              lockedChildId={isChildAuth ? authedChildId : lockedChildId}
              onLockChild={(childId) => {
                setLockedChildId(childId);
                localStorage.setItem('RCH_LOCKED_CHILD_ID', childId);
              }}
              theme={activeTheme}
              isChildAuth={isChildAuth}
              onLogout={handleLogout}
              onEnterJoinCode={() => setShowChildJoinCodePrompt(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Child Join Code Prompt — shown when a child account has no linked child profile */}
      <AnimatePresence>
        {showChildJoinCodePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-white dark:bg-stone-950 px-6"
            style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-sm space-y-6"
            >
              {/* Icon + heading */}
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shadow-sm">
                  <span className="text-3xl">🔑</span>
                </div>
                <h2 className="text-xl font-bold font-display text-stone-900 dark:text-stone-50">
                  Enter Your Join Code
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Your account isn't linked to a family yet. Ask your parent for the 6-character code from the app.
                </p>
              </div>

              {/* Error */}
              {childJoinCodeError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <span>{childJoinCodeError}</span>
                </div>
              )}

              {/* Input + button */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter 6-character code"
                  value={childJoinCodeInput}
                  onChange={(e) => setChildJoinCodeInput(e.target.value.toUpperCase())}
                  maxLength={6}
                  autoCapitalize="characters"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-50 text-center text-lg font-bold tracking-[0.3em] uppercase placeholder:tracking-normal placeholder:font-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApplyChildJoinCode(); }}
                />
                <button
                  onClick={handleApplyChildJoinCode}
                  disabled={isApplyingChildJoinCode || childJoinCodeInput.trim().length < 1}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold uppercase tracking-wider shadow-md shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                >
                  {isApplyingChildJoinCode ? 'Verifying…' : 'Join Family'}
                </button>
              </div>

              {/* Log out link */}
              <div className="text-center">
                <button
                  onClick={handleLogout}
                  className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-2 transition-colors"
                >
                  Sign out and use a different account
                </button>
              </div>
            </motion.div>
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
              onComplete={(email) => {
                setShowCreateAccount(false);
                if (email) {
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

      {/* Parental Password Gate popup lock */}
      <AnimatePresence>
        {showLockScreen && (
          <LockScreen
            parentEmail={parentEmail}
            onSuccess={handleParentLockSuccess}
            onClose={() => setShowLockScreen(false)}
            theme={activeTheme}
            onLogout={() => {
              handleLogout();
              setShowLockScreen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
    <LegalModal />
    <GlobalPaywallModal />
    </Suspense>
    </SubscriptionProvider>
  );
}

function GlobalPaywallModal() {
  const { isPaywallOpen, closePaywall, paywallFeatureTrigger } = useSubscription();
  return (
    <PaywallModal
      isOpen={isPaywallOpen}
      onClose={closePaywall}
      triggerReason={paywallFeatureTrigger}
    />
  );
}
