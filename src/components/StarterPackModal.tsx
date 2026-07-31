import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Truck, Check, Loader2, AlertCircle } from 'lucide-react';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { ParentProfile } from '../types';
import { playSound } from '../utils/sound';
import { getSupabaseClient } from '../utils/supabase';

interface StarterPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentProfile: ParentProfile | null;
  onSuccess?: () => void;
}

export function StarterPackModal({ isOpen, onClose, parentProfile, onSuccess }: StarterPackModalProps) {
  const [fullName, setFullName] = useState(parentProfile?.name || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not initialized');
      if (!parentProfile?.user_id) throw new Error('Parent profile user ID is not available');

      // Insert order details
      const { error } = await supabase.from('starter_pack_orders').insert({
        user_id: parentProfile.user_id,
        email: parentProfile.email,
        full_name: fullName,
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        state_province: stateProvince,
        postal_code: postalCode,
        country,
        status: 'pending'
      });

      if (error) throw error;

      // Auto-fulfillment webhook notification simulation (frontend side)
      try {
        const payload = {
          user_id: parentProfile.user_id,
          email: parentProfile.email,
          full_name: fullName,
          address_line1: addressLine1,
          address_line2: addressLine2 || null,
          city,
          state_province: stateProvince,
          postal_code: postalCode,
          country,
          status: 'pending'
        };
        await fetch('https://qnbpenvudqrngbxelvnx.supabase.co/functions/v1/notify-parent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'fulfillment_requested',
            table: 'starter_pack_orders',
            record: payload
          })
        });
      } catch (webhookErr) {
        console.warn('Frontend mock webhook notification failed:', webhookErr);
      }

      playSound.success();
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting starter pack order:', err);
      setSubmitError(err.message || 'Failed to submit shipping details. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg pointer-events-auto bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6 overflow-hidden flex flex-col max-h-[90vh] text-left"
            >
              {/* Close Button */}
              {!isSuccess && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1.5 rounded-xl transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {isSuccess ? (
                /* Success View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <Typography variant="h2" className="text-xl font-black text-stone-900 dark:text-stone-50">
                      Starter Pack Claimed!
                    </Typography>
                    <Typography variant="body" className="text-sm text-stone-500 dark:text-stone-400 mt-2">
                      Your order is submitted successfully. We are preparing to ship your pack to {fullName}!
                    </Typography>
                  </div>
                </motion.div>
              ) : (
                /* Form View */
                <form onSubmit={handleFormSubmit} className="flex flex-col flex-grow overflow-hidden">
                  
                  {/* Header */}
                  <div className="flex items-center gap-3.5 mb-4 shrink-0">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                      <Gift className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <Typography variant="h2" className="text-lg font-black text-stone-900 dark:text-stone-50">
                        Claim Your Free Starter Pack!
                      </Typography>
                      <Typography variant="helper" className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Free premium physical tokens shipped straight to your door.
                      </Typography>
                    </div>
                  </div>

                  {/* Body Scroll Area */}
                  <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-5">
                    
                    {/* What's included block */}
                    <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-4 space-y-2">
                      <div className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-4 h-4" /> What's Included in Your Pack:
                      </div>
                      <ul className="text-xs text-stone-650 dark:text-stone-300 font-medium grid grid-cols-2 gap-2 mt-1">
                        <li className="flex items-center gap-1.5">🪙 36 Pre-cut Quest Coins</li>
                        <li className="flex items-center gap-1.5">🗂️ 4 Foldable Wallet Pots</li>
                        <li className="flex items-center gap-1.5">🗺️ Fridge Backing Board</li>
                        <li className="flex items-center gap-1.5">✉️ Clear Trading Card Sleeves</li>
                      </ul>
                    </div>

                    {submitError && (
                      <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-3 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="Parent Name / Addressee"
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 dark:text-stone-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5">Address Line 1</label>
                        <input
                          type="text"
                          required
                          value={addressLine1}
                          onChange={e => setAddressLine1(e.target.value)}
                          placeholder="Street Address, P.O. Box"
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 dark:text-stone-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={addressLine2}
                          onChange={e => setAddressLine2(e.target.value)}
                          placeholder="Apartment, Suite, Unit, Building"
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 dark:text-stone-100"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5">Town / City</label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            placeholder="City"
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 dark:text-stone-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5">State / Province</label>
                          <input
                            type="text"
                            required
                            value={stateProvince}
                            onChange={e => setStateProvince(e.target.value)}
                            placeholder="County / State"
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 dark:text-stone-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5">Postcode / ZIP</label>
                          <input
                            type="text"
                            required
                            value={postalCode}
                            onChange={e => setPostalCode(e.target.value)}
                            placeholder="Postcode"
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 dark:text-stone-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5">Country</label>
                          <input
                            type="text"
                            required
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                            placeholder="Country"
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 dark:text-stone-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800 shrink-0 flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      className="flex-1 justify-center"
                      disabled={isSubmitting}
                    >
                      Decide Later
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1 justify-center bg-amber-500 hover:bg-amber-600 border-transparent text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Submitting...
                        </>
                      ) : (
                        'Claim Starter Pack'
                      )}
                    </Button>
                  </div>

                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
