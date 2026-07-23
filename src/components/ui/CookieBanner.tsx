import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';
import { Typography } from './Typography';
import { Cookie, Shield, Activity, Bell, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

export interface CookieConsentData {
  essential: boolean;
  analytics: boolean;
  features: boolean;
  decidedAt: string;
}

interface CookieBannerProps {
  onConsentChange?: (consent: CookieConsentData) => void;
}

export function CookieBanner({ onConsentChange }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom preferences
  const [preferences, setPreferences] = useState({
    analytics: true,
    features: true,
  });

  useEffect(() => {
    // Check if user has already made a decision
    const savedConsent = localStorage.getItem('quest_sync_cookie_consent');
    if (!savedConsent) {
      // Delay showing the banner slightly for better UX entry
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      try {
        const consentData = JSON.parse(savedConsent) as CookieConsentData;
        if (onConsentChange) {
          onConsentChange(consentData);
        }
      } catch (e) {
        console.warn('Failed to parse cookie consent preference', e);
        setIsVisible(true);
      }
    }
  }, [onConsentChange]);

  const saveConsent = (analytics: boolean, features: boolean) => {
    const consentData: CookieConsentData = {
      essential: true,
      analytics,
      features,
      decidedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('quest_sync_cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);
    
    if (onConsentChange) {
      onConsentChange(consentData);
    }
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleRejectAll = () => {
    saveConsent(false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(preferences.analytics, preferences.features);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center pointer-events-none print:hidden">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 rounded-[2rem] shadow-2xl p-5 md:p-6 pointer-events-auto flex flex-col gap-4 text-left border-b-[6px] border-stone-900 dark:border-stone-700"
        >
          {/* Main Info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 border-2 border-amber-100 dark:border-amber-900/50">
              <Cookie className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <Typography variant="h3" className="text-base sm:text-lg font-black tracking-tight">
                  Cookie Preferences & Privacy
                </Typography>
                <button 
                  onClick={handleRejectAll}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors p-1"
                  title="Dismiss & Reject Non-Essential"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Typography variant="body" className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                We use cookies and similar technologies to improve your experience, analyze app performance, and send push notifications. You can customize your preferences below.
              </Typography>
            </div>
          </div>

          {/* Preferences Accordion */}
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-stone-100 dark:border-stone-800 pt-4 mt-2 space-y-4"
            >
              <div className="space-y-3.5">
                {/* 1. Essential Chores/Session */}
                <div className="flex items-start justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <Typography variant="h4" className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100">
                        Essential Cookies & Storage
                      </Typography>
                      <Typography variant="helper" className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                        Required for authentication, app security, and storing your core task list. Cannot be disabled.
                      </Typography>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded-lg shrink-0">
                    Always On
                  </span>
                </div>

                {/* 2. Analytics (PostHog & Vercel) */}
                <div className="flex items-start justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                  <div className="flex items-start gap-3">
                    <Activity className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    <div>
                      <Typography variant="h4" className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100">
                        Performance & Analytics (PostHog)
                      </Typography>
                      <Typography variant="helper" className="text-[11px] text-stone-400 dark:text-stone-50 font-medium">
                        Helps us understand how the app is used to improve companion routines and fix performance issues.
                      </Typography>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 shrink-0 flex items-center relative border-2 ${
                      preferences.analytics 
                        ? 'bg-cyan-500 border-cyan-500 justify-end' 
                        : 'bg-stone-200 dark:bg-stone-800 border-stone-300 dark:border-stone-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white dark:bg-stone-900 rounded-full mx-0.5 shadow-sm" />
                  </button>
                </div>

                {/* 3. Features / Push notifications */}
                <div className="flex items-start justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                  <div className="flex items-start gap-3">
                    <Bell className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <Typography variant="h4" className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100">
                        Push Notifications & Features (OneSignal)
                      </Typography>
                      <Typography variant="helper" className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                        Allows us to send reminders when chores are completed, coins earned, or approvals are waiting.
                      </Typography>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, features: !prev.features }))}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 shrink-0 flex items-center relative border-2 ${
                      preferences.features 
                        ? 'bg-purple-500 border-purple-500 justify-end' 
                        : 'bg-stone-200 dark:bg-stone-800 border-stone-300 dark:border-stone-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white dark:bg-stone-900 rounded-full mx-0.5 shadow-sm" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-bold py-2 px-1 flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              {showSettings ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide Details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Manage Preferences</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              {showSettings ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                    className="flex-1 sm:flex-initial rounded-xl text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800"
                  >
                    Reject All
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveCustom}
                    className="flex-1 sm:flex-initial rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 border-none"
                  >
                    Save Preferences
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                    className="flex-1 sm:flex-initial rounded-xl text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800"
                  >
                    Reject Non-Essential
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-initial rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 border-none"
                  >
                    Accept All
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
