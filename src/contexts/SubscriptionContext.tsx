import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '../utils/supabase';
import { ParentSubscription, SubscriptionPlanId } from '../types/subscription';
import { initPurchases, purchasePlan, restorePurchases } from '../utils/purchases';

interface SubscriptionContextType {
  subscription: ParentSubscription;
  loading: boolean;
  isPaywallOpen: boolean;
  paywallFeatureTrigger?: string;
  openPaywall: (featureName?: string) => void;
  closePaywall: () => void;
  purchase: (planId: SubscriptionPlanId) => Promise<{ success: boolean; error?: string }>;
  restore: () => Promise<{ success: boolean; isPro: boolean; error?: string }>;
  refreshSubscription: () => Promise<void>;
  togglePro: (enable: boolean) => Promise<void>;
  canAddChild: (currentChildCount: number) => boolean;
  canAccessFeature: (featureId: string) => boolean;
}

const defaultSubscription: ParentSubscription = {
  isPro: false,
  tier: 'free',
  status: 'inactive',
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: defaultSubscription,
  loading: true,
  isPaywallOpen: false,
  openPaywall: () => {},
  closePaywall: () => {},
  purchase: async () => ({ success: false }),
  restore: async () => ({ success: false, isPro: false }),
  refreshSubscription: async () => {},
  togglePro: async () => {},
  canAddChild: () => true,
  canAccessFeature: () => true,
});

export const SubscriptionProvider: React.FC<{ children: React.ReactNode; currentUserId?: string }> = ({
  children,
  currentUserId,
}) => {
  const [subscription, setSubscription] = useState<ParentSubscription>(defaultSubscription);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [paywallFeatureTrigger, setPaywallFeatureTrigger] = useState<string | undefined>(undefined);

  const fetchSubscription = useCallback(async () => {
    const override = localStorage.getItem('RCH_PRO_OVERRIDE');
    if (override !== null) {
      const isProOverride = override === 'true';
      setSubscription({
        isPro: isProOverride,
        tier: isProOverride ? 'annual' : 'free',
        status: isProOverride ? 'active' : 'inactive',
      });
      setLoading(false);
      return;
    }

    if (!currentUserId) {
      setSubscription(defaultSubscription);
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parent_profiles')
        .select('is_pro, subscription_tier, subscription_status, subscription_end')
        .eq('user_id', currentUserId)
        .single();

      if (!error && data) {
        setSubscription({
          isPro: Boolean(data.is_pro),
          tier: data.subscription_tier === 'annual' ? 'annual' : data.subscription_tier === 'monthly' ? 'monthly' : 'free',
          status: (data.subscription_status as any) || 'inactive',
          subscriptionEnd: data.subscription_end,
        });
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      initPurchases(currentUserId);
      fetchSubscription();
    } else {
      const override = localStorage.getItem('RCH_PRO_OVERRIDE');
      if (override !== null) {
        const isProOverride = override === 'true';
        setSubscription({
          isPro: isProOverride,
          tier: isProOverride ? 'annual' : 'free',
          status: isProOverride ? 'active' : 'inactive',
        });
      } else {
        setSubscription(defaultSubscription);
      }
      setLoading(false);
    }
  }, [currentUserId, fetchSubscription]);

  const openPaywall = (featureName?: string) => {
    setPaywallFeatureTrigger(featureName);
    setIsPaywallOpen(true);
  };

  const closePaywall = () => {
    setIsPaywallOpen(false);
    setPaywallFeatureTrigger(undefined);
  };

  const handlePurchase = async (planId: SubscriptionPlanId) => {
    const result = await purchasePlan(planId, currentUserId);
    if (result.success && result.isPro) {
      localStorage.removeItem('RCH_PRO_OVERRIDE');
      await fetchSubscription();
      closePaywall();
    }
    return { success: result.success, error: result.error };
  };

  const handleRestore = async () => {
    const result = await restorePurchases(currentUserId);
    if (result.success) {
      localStorage.removeItem('RCH_PRO_OVERRIDE');
      await fetchSubscription();
    }
    return result;
  };

  const handleTogglePro = async (enable: boolean) => {
    localStorage.setItem('RCH_PRO_OVERRIDE', enable ? 'true' : 'false');
    
    if (currentUserId) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('parent_profiles')
            .update({
              is_pro: enable,
              subscription_tier: enable ? 'annual' : 'free',
              subscription_status: enable ? 'active' : 'inactive',
            })
            .eq('user_id', currentUserId);
        } catch (e) {
          console.error('Error updating Pro status in database:', e);
        }
      }
    }

    setSubscription({
      isPro: enable,
      tier: enable ? 'annual' : 'free',
      status: enable ? 'active' : 'inactive',
    });
  };

  const canAddChild = (currentChildCount: number): boolean => {
    if (subscription.isPro) return true;
    return currentChildCount < 1;
  };

  const canAccessFeature = (featureId: string): boolean => {
    if (subscription.isPro) return true;
    if (featureId === 'ai_insights' || featureId === 'custom_automation') {
      return false;
    }
    return true;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        isPaywallOpen,
        paywallFeatureTrigger,
        openPaywall,
        closePaywall,
        purchase: handlePurchase,
        restore: handleRestore,
        refreshSubscription: fetchSubscription,
        togglePro: handleTogglePro,
        canAddChild,
        canAccessFeature,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
