import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Zap,
  Star,
  Trophy,
  Heart
} from 'lucide-react';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { playSound } from '../utils/sound';
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

  const handleSelectPlan = (planId: SubscriptionPlanId) => {
    playSound.click();
    setSelectedPlan(planId);
  };

  const handlePurchase = async () => {
    playSound.click();
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await purchase(selectedPlan);
    setIsProcessing(false);

    if (result.success) {
      playSound.success();
      setSuccessMessage('Welcome to Pro! Your subscription is now active.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      playSound.pinError();
      setErrorMessage(result.error || 'Unable to process purchase. Please try again.');
    }
  };

  const handleRestore = async () => {
    playSound.click();
    setIsRestoring(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await restore();
    setIsRestoring(false);

    if (result.success && result.isPro) {
      playSound.success();
      setSuccessMessage('Purchases restored successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      playSound.pinError();
      setErrorMessage(result.error || 'No active subscription found to restore.');
    }
  };

  const renderFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
      case 'Gift':
        return <Gift className="w-5 h-5 text-rose-500 dark:text-rose-400" />;
      case 'Share2':
        return <Share2 className="w-5 h-5 text-sky-500 dark:text-sky-400" />;
      default:
        return <Crown className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Frame matching Gamified Toybox Theme */}
          <div className="relative bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 p-6 pt-8 text-center text-white overflow-hidden shadow-md">
            {/* Background Decorative Circles */}
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => { playSound.click(); onClose(); }}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/15 hover:bg-black/25 text-white transition-all transform active:scale-90"
              aria-label="Close paywall"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Crown Icon Frame */}
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner">
              <Crown className="w-8 h-8 text-amber-200 fill-amber-300 drop-shadow-sm" />
            </div>

            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/25 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-widest text-white mb-2 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
              Reward Chart Pro
            </div>

            <Typography variant="h2" className="!text-white font-black tracking-tight drop-shadow-sm">
              Unlock Unlimited Family Magic
            </Typography>

            <p className="text-xs text-amber-100 font-medium mt-1 max-w-xs mx-auto">
              {triggerReason || 'Upgrade to manage unlimited kid charts, AI progress insights, and automated gold pot maintenance.'}
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F5F2EA]/40 dark:bg-stone-900/50">

            {/* Feedback Messages */}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2.5"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2.5"
              >
                <Zap className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Feature Highlights Grid */}
            <div className="space-y-3">
              <Typography variant="label" className="text-stone-400 dark:text-stone-500 font-black">
                Pro Feature Pass
              </Typography>

              <div className="grid gap-2.5">
                {PRO_FEATURES.map((feature) => (
                  <div 
                    key={feature.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-stone-50 dark:bg-stone-700/60 border border-stone-100 dark:border-stone-600 flex items-center justify-center shrink-0">
                      {renderFeatureIcon(feature.iconName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Typography variant="h4" className="!text-xs font-bold truncate text-stone-800 dark:text-stone-100">
                          {feature.title}
                        </Typography>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 shrink-0">
                          {feature.proLimit}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Selection */}
            <div className="space-y-3 pt-1">
              <Typography variant="label" className="text-stone-400 dark:text-stone-500 font-black">
                Choose Plan
              </Typography>

              <div className="grid grid-cols-2 gap-3">
                {/* Monthly Plan */}
                <button
                  type="button"
                  onClick={() => handleSelectPlan('monthly')}
                  className={`relative flex flex-col justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/20 shadow-md ring-2 ring-orange-500/20'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/50 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div>
                    <Typography variant="label" className="text-stone-500 dark:text-stone-400">
                      {SUBSCRIPTION_PLANS.monthly.title}
                    </Typography>
                    <div className="text-2xl sm:text-3xl font-black font-display text-stone-900 dark:text-stone-50 mt-1">
                      {SUBSCRIPTION_PLANS.monthly.priceFormatted}
                      <span className="text-xs font-semibold text-stone-400">/mo</span>
                    </div>
                  </div>

                  <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mt-2">
                    {SUBSCRIPTION_PLANS.monthly.billingDetails}
                  </p>
                </button>

                {/* Annual Plan */}
                <button
                  type="button"
                  onClick={() => handleSelectPlan('annual')}
                  className={`relative flex flex-col justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedPlan === 'annual'
                      ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/20 shadow-md ring-2 ring-rose-500/20'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/50 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  {/* Badge */}
                  {SUBSCRIPTION_PLANS.annual.savingsBadge && (
                    <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-white shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white text-white" />
                      {SUBSCRIPTION_PLANS.annual.savingsBadge}
                    </span>
                  )}

                  <div>
                    <Typography variant="label" className="text-rose-600 dark:text-rose-400 font-bold">
                      {SUBSCRIPTION_PLANS.annual.title}
                    </Typography>
                    <div className="text-2xl sm:text-3xl font-black font-display text-stone-900 dark:text-stone-50 mt-1">
                      {SUBSCRIPTION_PLANS.annual.priceFormatted}
                      <span className="text-xs font-semibold text-stone-400">/yr</span>
                    </div>
                  </div>

                  <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mt-2">
                    {SUBSCRIPTION_PLANS.annual.billingDetails}
                  </p>
                </button>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 space-y-3">
            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handlePurchase}
              disabled={isProcessing || subscription.isPro}
              className="w-full py-4 px-6 rounded-2xl font-black font-display text-white bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:to-rose-600 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-sm sm:text-base uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Activating...
                </>
              ) : subscription.isPro ? (
                <>
                  <Check className="w-5 h-5 text-amber-200" />
                  Pro Active
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 text-amber-200 fill-amber-200" />
                  Subscribe Now ({SUBSCRIPTION_PLANS[selectedPlan].priceFormatted})
                </>
              )}
            </button>

            {/* Sub Footer Links */}
            <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 font-semibold px-1 pt-1">
              <button
                type="button"
                onClick={handleRestore}
                disabled={isRestoring}
                className="hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                Restore Purchases
              </button>

              <div className="flex items-center gap-3">
                <a 
                  href="#privacy" 
                  onClick={() => { playSound.click(); window.location.hash = 'privacy'; }}
                  className="hover:underline hover:text-stone-700 dark:hover:text-stone-300"
                >
                  Terms
                </a>
                <span>•</span>
                <a 
                  href="#privacy" 
                  onClick={() => { playSound.click(); window.location.hash = 'privacy'; }}
                  className="hover:underline hover:text-stone-700 dark:hover:text-stone-300"
                >
                  Privacy
                </a>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
