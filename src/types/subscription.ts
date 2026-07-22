export type SubscriptionPlanId = 'monthly' | 'annual';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  title: string;
  priceFormatted: string;
  priceValue: number;
  period: 'month' | 'year';
  billingDetails: string;
  savingsBadge?: string;
  revenueCatPackageId: string;
}

export interface ProFeature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  freeLimit?: string;
  proLimit: string;
}

export interface ParentSubscription {
  isPro: boolean;
  tier: 'free' | 'monthly' | 'annual';
  status: 'active' | 'inactive' | 'trialing' | 'canceled' | 'expired';
  subscriptionEnd?: string | null;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  monthly: {
    id: 'monthly',
    title: 'Monthly Pass',
    priceFormatted: '£0.99',
    priceValue: 0.99,
    period: 'month',
    billingDetails: 'Billed £0.99 monthly. Cancel anytime.',
    revenueCatPackageId: '$rc_monthly',
  },
  annual: {
    id: 'annual',
    title: 'Annual Pass',
    priceFormatted: '£9.99',
    priceValue: 9.99,
    period: 'year',
    billingDetails: 'Billed £9.99 annually (£0.83/mo). Cancel anytime.',
    savingsBadge: 'SAVE 16%',
    revenueCatPackageId: '$rc_annual',
  },
};

export const PRO_FEATURES: ProFeature[] = [
  {
    id: 'children',
    title: 'Unlimited Children',
    description: 'Add and manage custom reward charts for all your children in one place.',
    iconName: 'Users',
    freeLimit: '1 Child',
    proLimit: 'Unlimited Children',
  },
  {
    id: 'ai_insights',
    title: 'Smart AI Progress Insights',
    description: 'Personalized AI recommendations based on completion patterns and pet care.',
    iconName: 'Sparkles',
    freeLimit: 'Basic',
    proLimit: 'Advanced AI Insights',
  },
  {
    id: 'custom_rewards',
    title: 'Custom Rewards & Gold Pot Auto-Care',
    description: 'Automated gold pot maintenance, custom task frequencies, and full badges library.',
    iconName: 'Gift',
    freeLimit: 'Standard',
    proLimit: 'Full Automation',
  },
  {
    id: 'co_parents',
    title: 'Family & Co-Parent Sync',
    description: 'Seamless real-time synchronization across parents and children devices.',
    iconName: 'Share2',
    freeLimit: 'Single Device',
    proLimit: 'Real-time Family Sync',
  },
];
