import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { playSound } from '../utils/sound';

export function LegalModal() {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#privacy') {
        setModalType('privacy');
        playSound.click();
      } else if (hash === '#terms') {
        setModalType('terms');
        playSound.click();
      } else {
        setModalType(null);
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const close = () => {
    playSound.click();
    window.location.hash = '';
    setModalType(null);
  };

  return (
    <AnimatePresence>
      {modalType && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border-4 border-stone-200"
          >
            <div className="flex justify-between items-center mb-6 border-b-2 border-stone-100 pb-4">
              <h2 className="text-2xl font-black font-display text-stone-900 uppercase tracking-widest">
                {modalType === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h2>
              <button onClick={close} className="p-2 hover:bg-stone-100 rounded-full transition-colors active:scale-[0.96]">
                <X className="w-6 h-6 text-stone-500" />
              </button>
            </div>
            
            <div className="prose prose-sm md:prose-base prose-stone max-w-none text-stone-600 space-y-4">
              {modalType === 'privacy' ? (
                <>
                  <p className="text-xs font-mono font-bold tracking-widest text-stone-400">LAST UPDATED: JULY 2026</p>
                  <p>Welcome to Reward Chart! We are committed to protecting your privacy and ensuring your family's data is secure.</p>
                  
                  <h3 className="font-bold text-stone-900 text-lg mt-6">1. Information We Collect</h3>
                  <p>We collect information you provide directly to us, such as when you create an account, add children to your household, or configure tasks and rewards. This includes names, emails, and behavioral data related to task completion.</p>
                  
                  <h3 className="font-bold text-stone-900 text-lg mt-6">2. How We Use Information</h3>
                  <p>We use the information we collect to provide, maintain, and improve our services, to personalize the experience for your family, and to communicate with you.</p>
                  
                  <h3 className="font-bold text-stone-900 text-lg mt-6">3. Data Security & Storage</h3>
                  <p>We use local offline storage by default, and optionally offer secure cloud cross-device sync via Supabase. We implement strict row-level security so only you can access your family data.</p>
                  
                  <h3 className="font-bold text-stone-900 text-lg mt-6">4. Sharing of Information</h3>
                  <p>We do not share your personal data with third parties for marketing purposes. Your family's data stays with your family.</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-mono font-bold tracking-widest text-stone-400">LAST UPDATED: JULY 2026</p>
                  <p>Please read these Terms of Service completely before using Reward Chart.</p>
                  
                  <h3 className="font-bold text-stone-900 text-lg mt-6">1. Acceptance of Terms</h3>
                  <p>By accessing or using our application, you agree to be bound by these Terms.</p>
                  
                  <h3 className="font-bold text-stone-900 text-lg mt-6">2. User Accounts</h3>
                  <p>You are responsible for maintaining the confidentiality of your account credentials (PIN and password). You are also responsible for all activities that occur under your account.</p>
                  
                  <h3 className="font-bold text-stone-900 text-lg mt-6">3. Acceptable Use</h3>
                  <p>You agree not to misuse our services. The app is designed for family household management and gamification. Abuse of the system, unauthorized access, or reverse engineering is strictly prohibited.</p>
                  
                  <h3 className="font-bold text-stone-900 text-lg mt-6">4. Limitation of Liability</h3>
                  <p>Reward Chart is provided "as is". We are not liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services.</p>
                </>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t-2 border-stone-100 flex justify-end">
              <button onClick={close} className="btn-primary py-3 px-8 rounded-xl font-bold font-mono uppercase tracking-widest text-sm shadow-md">
                I UNDERSTAND
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
