import React, { useEffect, useState } from 'react';
import { Typography } from './ui/Typography';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
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
        <Modal
          isOpen={true}
          onClose={close}
          maxWidth="2xl"
          padding="lg"
          className="max-h-[85vh] overflow-y-auto border-4 border-stone-200"
        >
            <div className="flex justify-between items-center mb-6 border-b-2 border-stone-100 pb-4">
              <Typography variant="h2">
                {modalType === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </Typography>
              <Button variant="ghost" size="icon" onClick={close}>
                <X className="w-6 h-6 text-stone-500" />
              </Button>
            </div>
            
            <div className="prose prose-sm md:prose-base prose-stone max-w-none text-stone-600 space-y-4">
              {modalType === 'privacy' ? (
                <>
                  <Typography variant="label" as="p">LAST UPDATED: JULY 2026</Typography>
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
                  <Typography variant="label" as="p">LAST UPDATED: JULY 2026</Typography>
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
              <Button variant="primary" size="lg" onClick={close}>
                I UNDERSTAND
              </Button>
            </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
