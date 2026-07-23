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
  Gamepad2,
  ArrowLeft
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
  inOnboarding?: boolean;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  triggerReason,
  inOnboarding = false,
}) => {
  const { subscription, purchase, restore, togglePro } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('annual');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Exact theme styles matching LandingPage, AuthPage, and Onboarding steps
  const styles = {
    text: 'text-stone-900 dark:text-stone-50',
    textMuted: 'text-stone-500 dark:text-stone-400',
    bodyBg: 'bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-50',
    cardBg: 'bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-50',
    headerBg: 'bg-white/90 dark:bg-stone-900/90 border-b border-stone-100 dark:border-stone-800 backdrop-blur-md',
    btnPrimary: 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all uppercase tracking-wider rounded-2xl border-none',
    btnSecondary: 'bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-200 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[0.98] transition-all rounded-2xl',
    tagCategory: 'text-orange-600 bg-orange-50 dark:bg-orange-950/60 border border-orange-100 dark:border-orange-900/60 font-bold uppercase rounded-full',
    innerCard: 'bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/80 rounded-2xl',
    titleGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent',
    titleColor: 'text-[#1C1917] dark:text-stone-50',
  };

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
      setSuccessMessage('Welcome to Pro! Your subscription is active.');
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
        return <Users className="w-5 h-5 text-orange-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Gift':
        return <Gift className="w-5 h-5 text-rose-500" />;
      case 'Share2':
        return <Share2 className="w-5 h-5 text-sky-500" />;
      default:
        return <Crown className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 overflow-y-auto font-sans">
        
        {/* App Standard Clean White Header */}
        <header 
          className="w-full bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 relative z-40 shrink-0"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-3 sm:pb-4 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { playSound.click(); onClose(); }}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5 inline-block" /> Back
              </Button>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 flex items-center justify-center shadow-sm hidden sm:flex">
                <Crown className="w-6 h-6 text-orange-500 animate-pulse" />
              </div>
              <div>
                <Typography variant="h2" as="span">
                  REWARD CHART
                </Typography>
                <span className="block text-[9px] sm:text-[10px] text-stone-600 dark:text-stone-300 font-sans tracking-widest font-extrabold uppercase mt-0.5">PRO FAMILY PASS</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => { playSound.click(); onClose(); }}
              aria-label="Close paywall"
            >
              <X className="w-5 h-5 text-stone-500" />
            </Button>
          </div>
        </header>

        {/* Main Center Panel */}
        <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center relative z-20">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={`${styles.cardBg} p-6 sm:p-8 space-y-6 border border-stone-200 dark:border-stone-800 shadow-sm`}
          >
            {/* Title Section */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 shadow-sm">
                <Crown className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold font-display ${styles.titleColor}`}>
                Unlock <span className={styles.titleGradient}>Reward Chart Pro</span>
              </h3>
              <p className={`${styles.textMuted} text-xs sm:text-sm max-w-xs mx-auto`}>
                {triggerReason || 'Manage unlimited children, get progress insights, and automate gold pot maintenance.'}
              </p>
            </div>

            {/* Notification Messages */}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Feature List */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest block px-1">
                Everything Included In Pro
              </span>

              <div className="space-y-2">
                {PRO_FEATURES.map((feature) => (
                  <div 
                    key={feature.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl ${styles.innerCard}`}
                  >
                    <div className="h-9 w-9 rounded-xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-700 flex items-center justify-center shrink-0 shadow-sm">
                      {renderFeatureIcon(feature.iconName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">
                          {feature.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Selector */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest block px-1">
                Select Your Plan
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Monthly Plan */}
                <div
                  onClick={() => handleSelectPlan('monthly')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 ring-2 ring-orange-500/20'
                      : `${styles.innerCard} hover:border-stone-300 dark:hover:border-stone-600`
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400">
                    {SUBSCRIPTION_PLANS.monthly.title}
                  </div>
                  <div className="text-2xl font-black font-display text-stone-900 dark:text-stone-50 mt-1">
                    {SUBSCRIPTION_PLANS.monthly.priceFormatted}
                    <span className="text-xs font-normal text-stone-400">/mo</span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-2 font-medium">
                    Cancel anytime.
                  </p>
                </div>

                {/* Annual Plan */}
                <div
                  onClick={() => handleSelectPlan('annual')}
                  className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPlan === 'annual'
                      ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 ring-2 ring-orange-500/20'
                      : `${styles.innerCard} hover:border-stone-300 dark:hover:border-stone-600`
                  }`}
                >
                  {/* Savings Tag */}
                  {SUBSCRIPTION_PLANS.annual.savingsBadge && (
                    <span className="absolute -top-2.5 right-2 px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-orange-500 text-white shadow-sm">
                      {SUBSCRIPTION_PLANS.annual.savingsBadge}
                    </span>
                  )}

                  <div className="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400">
                    {SUBSCRIPTION_PLANS.annual.title}
                  </div>
                  <div className="text-2xl font-black font-display text-stone-900 dark:text-stone-50 mt-1">
                    {SUBSCRIPTION_PLANS.annual.priceFormatted}
                    <span className="text-xs font-normal text-stone-400">/yr</span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-2 font-medium">
                    £0.83/mo billed yearly.
                  </p>
                </div>
              </div>
            </div>

            {/* Early Preview Free Pro Toggle */}
            {inOnboarding && (
              <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-100">
                      Early Preview: Use Pro for Free
                    </span>
                  </div>
                  <div
                    onClick={async () => {
                      const newStatus = !subscription.isPro;
                      playSound.click();
                      if (newStatus) {
                        playSound.success();
                      }
                      await togglePro(newStatus);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 cursor-pointer p-0.5 ${
                      subscription.isPro ? 'bg-amber-500' : 'bg-stone-200 dark:bg-stone-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white dark:bg-stone-900 rounded-full transition-transform duration-300 shadow-sm ${
                        subscription.isPro ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-normal font-medium">
                  We are finalizing our public release. Toggle this on to enjoy all premium features for free during this preview!
                </p>
              </div>
            )}

            {/* Subscribe Action Button */}
            <Button
              variant="warning"
              size="lg"
              fullWidth
              onClick={handlePurchase}
              isLoading={isProcessing}
              disabled={isProcessing || subscription.isPro}
              className="py-3.5 text-sm sm:text-base font-bold font-display uppercase tracking-wider rounded-2xl"
            >
              {subscription.isPro ? (
                <>
                  <Check className="w-5 h-5 mr-2 inline-block text-white" />
                  Pro Membership Active
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2 inline-block text-white" />
                  Subscribe Now ({SUBSCRIPTION_PLANS[selectedPlan].priceFormatted})
                </>
              )}
            </Button>

            {/* Footer Compliance Links */}
            <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 font-semibold pt-1">
              <button
                type="button"
                onClick={handleRestore}
                disabled={isRestoring}
                className="hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                Restore Purchases
              </button>

              <div className="flex items-center gap-2">
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

          </motion.div>
        </main>
      </div>
    </AnimatePresence>
  );
};
