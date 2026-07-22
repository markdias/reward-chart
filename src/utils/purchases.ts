import { Capacitor } from '@capacitor/core';
import { getSupabaseClient } from './supabase';
import { SubscriptionPlanId } from '../types/subscription';

export interface PurchaseResult {
  success: boolean;
  isPro: boolean;
  error?: string;
}

/**
 * Initialize RevenueCat Purchases SDK if running inside native Capacitor environment.
 */
export async function initPurchases(userId?: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const rcPackageName = '@revenuecat/purchases-capacitor';
    // @ts-ignore
    const { Purchases } = await import(/* @vite-ignore */ rcPackageName);
    const apiKey = Capacitor.getPlatform() === 'ios'
      ? (import.meta.env.VITE_REVENUECAT_APPLE_KEY || '')
      : (import.meta.env.VITE_REVENUECAT_GOOGLE_KEY || '');

    if (apiKey) {
      await Purchases.configure({ apiKey, appUserID: userId });
    }
  } catch (err) {
    console.warn('RevenueCat SDK init skipped or failed:', err);
  }
}

/**
 * Process purchase for selected plan (Monthly or Annual).
 * Updates Supabase profile upon successful checkout.
 */
export async function purchasePlan(
  planId: SubscriptionPlanId,
  userId?: string
): Promise<PurchaseResult> {
  if (Capacitor.isNativePlatform()) {
    try {
      const rcPackageName = '@revenuecat/purchases-capacitor';
      // @ts-ignore
      const { Purchases } = await import(/* @vite-ignore */ rcPackageName);
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      const pkg = planId === 'annual'
        ? currentOffering?.annual
        : currentOffering?.monthly;

      if (pkg) {
        const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
        const isPro = Boolean(customerInfo.entitlements.active['pro']);
        
        if (userId && isPro) {
          await updateSupabaseProStatus(userId, true, planId);
        }
        return { success: true, isPro };
      }
    } catch (err: any) {
      console.error('RevenueCat purchase error:', err);
      if (err.userCancelled) {
        return { success: false, isPro: false, error: 'User cancelled transaction.' };
      }
      return { success: false, isPro: false, error: err.message || 'Purchase failed.' };
    }
  }

  // Web / Fallback Mode (Simulated checkout or Direct Web payment hook)
  if (userId) {
    const success = await updateSupabaseProStatus(userId, true, planId);
    return {
      success,
      isPro: success,
      error: success ? undefined : 'Failed to activate subscription.',
    };
  }

  return { success: false, isPro: false, error: 'Authentication required.' };
}

/**
 * Restore previous native purchases (Mandatory for App Store review compliance).
 */
export async function restorePurchases(userId?: string): Promise<PurchaseResult> {
  if (Capacitor.isNativePlatform()) {
    try {
      const rcPackageName = '@revenuecat/purchases-capacitor';
      // @ts-ignore
      const { Purchases } = await import(/* @vite-ignore */ rcPackageName);
      const { customerInfo } = await Purchases.restorePurchases();
      const isPro = Boolean(customerInfo.entitlements.active['pro']);

      if (userId) {
        await updateSupabaseProStatus(userId, isPro, 'annual');
      }

      return { success: true, isPro };
    } catch (err: any) {
      console.error('Restore purchases error:', err);
      return { success: false, isPro: false, error: err.message || 'Failed to restore purchases.' };
    }
  }

  // Web fallback restore check
  if (userId) {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, isPro: false, error: 'Supabase client unavailable.' };

    const { data } = await supabase
      .from('parent_profiles')
      .select('is_pro')
      .eq('user_id', userId)
      .single();

    return { success: true, isPro: Boolean(data?.is_pro) };
  }

  return { success: false, isPro: false, error: 'User not found.' };
}

/**
 * Updates the user's pro status directly in Supabase parent_profiles.
 */
export async function updateSupabaseProStatus(
  userId: string,
  isPro: boolean,
  tier: 'monthly' | 'annual'
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const endPeriod = new Date();
    if (tier === 'annual') {
      endPeriod.setFullYear(endPeriod.getFullYear() + 1);
    } else {
      endPeriod.setMonth(endPeriod.getMonth() + 1);
    }

    const { error } = await supabase
      .from('parent_profiles')
      .update({
        is_pro: isPro,
        subscription_tier: isPro ? tier : 'free',
        subscription_status: isPro ? 'active' : 'inactive',
        subscription_end: isPro ? endPeriod.toISOString() : null,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating parent_profiles subscription:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed updating subscription status in Supabase:', err);
    return false;
  }
}
