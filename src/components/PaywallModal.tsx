import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  Users, 
  Gift, 
  Share2, 
  ShieldCheck, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_PLANS, PRO_FEATURES, SubscriptionPlanId } from '../types/subscription';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  triggerReason,
}) => {
  const { subscription, purchase, restore } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('annual');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await purchase(selectedPlan);
    setIsProcessing(false);

    if (result.success) {
      setSuccessMessage('Welcome to Pro! Your subscription is now active.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMessage(result.error || 'Unable to process purchase. Please try again.');
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await restore();
    setIsRestoring(false);

    if (result.success && result.isPro) {
      setSuccessMessage('Purchases restored successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMessage(result.error || 'No active subscription found to restore.');
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-5 h-5 text-amber-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'Gift':
        return <Gift className="w-5 h-5 text-rose-500" />;
      case 'Share2':
        return <Share2 className="w-5 h-5 text-blue-500" />;
      default:
        return <Crown className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-amber-500/20 max-h-[90vh] flex flex-col">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-br from-amber-500 via-purple-600 to-indigo-700 text-white p-6 pt-8 text-center overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-60" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Close paywall"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            Reward Chart Pro
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Unlock Full Potential
          </h2>
          
          <p className="text-sm text-amber-100 mt-1 max-w-xs mx-auto font-medium">
            {triggerReason || 'Upgrade to manage unlimited kids, AI insights, and custom gold pot care.'}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Success / Error Banners */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Feature List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Everything in Pro Included
            </h3>

            <div className="grid gap-3">
              {PRO_FEATURES.map((feature) => (
                <div 
                  key={feature.id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-700 shadow-sm shrink-0">
                    {renderIcon(feature.iconName)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {feature.title}
                      </h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                        {feature.proLimit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Selector */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Choose Your Plan
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Monthly Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {SUBSCRIPTION_PLANS.monthly.title}
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {SUBSCRIPTION_PLANS.monthly.priceFormatted}
                    <span className="text-xs font-medium text-slate-400">/mo</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-medium">
                  {SUBSCRIPTION_PLANS.monthly.billingDetails}
                </div>
              </button>

              {/* Annual Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan('annual')}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedPlan === 'annual'
                    ? 'border-purple-600 bg-purple-600/5 dark:bg-purple-600/10 shadow-md ring-2 ring-purple-600/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Savings Pill */}
                {SUBSCRIPTION_PLANS.annual.savingsBadge && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm">
                    {SUBSCRIPTION_PLANS.annual.savingsBadge}
                  </span>
                )}

                <div>
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {SUBSCRIPTION_PLANS.annual.title}
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {SUBSCRIPTION_PLANS.annual.priceFormatted}
                    <span className="text-xs font-medium text-slate-400">/yr</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-medium">
                  {SUBSCRIPTION_PLANS.annual.billingDetails}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3">
          
          {/* Main CTA */}
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isProcessing || subscription.isPro}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 text-base disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : subscription.isPro ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                Already Subscribed
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 text-amber-300 fill-amber-300" />
                Subscribe Now ({SUBSCRIPTION_PLANS[selectedPlan].priceFormatted})
              </>
            )}
          </button>

          {/* Secondary Actions & Compliance */}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium px-1 pt-1">
            <button
              type="button"
              onClick={handleRestore}
              disabled={isRestoring}
              className="hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
              Restore Purchases
            </button>

            <div className="flex items-center gap-3">
              <a 
                href="/legal/terms" 
                target="_blank" 
                rel="noreferrer"
                className="hover:underline hover:text-slate-600 dark:hover:text-slate-300"
              >
                Terms
              </a>
              <span>•</span>
              <a 
                href="/legal/privacy" 
                target="_blank" 
                rel="noreferrer"
                className="hover:underline hover:text-slate-600 dark:hover:text-slate-300"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
