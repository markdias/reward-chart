import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Star, Zap, Droplets, Target, Sparkles, BookOpen, Heart, Activity, Palette, CheckCircle, Shield, Clock, TrendingUp, Anchor, Coffee, Compass, Sun, Moon, Map, Camera, Music, Play, Flag, Trophy, Crown, Gem, Coins, Medal, ArrowLeft, Lock, Gift } from 'lucide-react';
import { Child, Reward } from '../types';
import { getSupabaseClient } from '../utils/supabase';
import { getPetStripeBackground } from './ArcadeTicketCard';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Typography } from './ui/Typography';

const ICON_MAP: Record<string, React.FC<any>> = {
  Award, Star, Zap, Droplets, Target, Sparkles, BookOpen, Heart, Activity, Palette, CheckCircle, Shield, Clock, TrendingUp, Anchor, Coffee, Compass, Sun, Moon, Map, Camera, Music, Play, Flag, Trophy, Crown, Gem, Medal
};

interface BadgesModalProps {
  child: Child;
  rewards: Reward[];
  onClose: () => void;
  onClaimFreeReward: (badgeId: string, rewardId: string) => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ child, rewards, onClose, onClaimFreeReward }) => {
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const [{ data: badges }, { data: childBadges }] = await Promise.all([
        supabase.from('badges').select('*'),
        supabase.from('child_badges').select('*').eq('child_id', child.id)
      ]);

      if (badges) setAllBadges(badges);
      if (childBadges) setUnlockedBadges(childBadges);
      setLoading(false);
    };
    fetchBadges();
  }, [child.id]);

  const eligibleRewards = rewards
    .filter(r => r.is_badge_eligible && (r.child_id === child.id || r.child_id === 'directory') && r.is_available)
    .filter((r, index, self) => index === self.findIndex((t) => t.title.trim().toLowerCase() === r.title.trim().toLowerCase()));

  const renderBadgeDetail = () => {
    if (!selectedBadge) return null;

    const unlocked = unlockedBadges.find(ub => ub.badge_id === selectedBadge.id);
    const isUnlocked = !!unlocked;
    const Icon = ICON_MAP[selectedBadge.icon_name] || Star;
    const rewardClaimed = unlocked?.reward_claimed;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex-1 flex flex-col p-6 items-center justify-center relative bg-white dark:bg-stone-900"
      >
        <Button 
          variant="none"
          size="none"
          onClick={() => { setSelectedBadge(null); setClaiming(false); }}
          className="absolute top-6 left-6 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-2 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to badges
        </Button>

        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 mb-6 transition-all ${
          isUnlocked 
            ? 'border-amber-400 text-amber-500 bg-amber-50 shadow-lg shadow-amber-100/50' 
            : 'border-stone-100 dark:border-stone-800 text-stone-300 bg-stone-50 dark:bg-stone-950'
        }`}>
          <Icon className="w-16 h-16" strokeWidth={isUnlocked ? 2.5 : 2} />
        </div>

        <Typography variant="h3" className={`mb-3 ${isUnlocked ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'}`}>
          {selectedBadge.name}
        </Typography>
        
        <p className="text-stone-500 dark:text-stone-400 text-center max-w-sm mb-8">
          {selectedBadge.description}
        </p>

        {isUnlocked ? (
          <div className="w-full max-w-xs flex flex-col items-center">
            {rewardClaimed ? (
              <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-6 py-3 rounded-full border border-emerald-200">
                <CheckCircle className="w-5 h-5" /> Prize Claimed
              </div>
            ) : (
              claiming ? (
                <div className="w-full space-y-3 bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 animate-in fade-in zoom-in duration-200">
                  <div className="text-sm font-bold text-stone-700 dark:text-stone-200 text-center mb-2">Choose your free prize:</div>
                  {eligibleRewards.length === 0 ? (
                    <p className="text-xs text-red-500 text-center font-medium">No eligible rewards available. Ask your parents to add some!</p>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {eligibleRewards.map(r => (
                        <button
                          key={r.id}
                          onClick={() => {
                            onClaimFreeReward(selectedBadge.id, r.id);
                            setUnlockedBadges(prev => prev.map(ub => ub.badge_id === selectedBadge.id ? { ...ub, reward_claimed: true } : ub));
                            setClaiming(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-bold bg-white dark:bg-stone-900 hover:bg-amber-50 border border-stone-200 dark:border-stone-700 hover:border-amber-300 rounded-xl text-stone-700 dark:text-stone-200 transition-colors shadow-sm"
                        >
                          {r.title}
                        </button>
                      ))}
                    </div>
                  )}
                  <Button 
                    variant="none"
                    size="none"
                    onClick={() => setClaiming(false)}
                    className="w-full py-2 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-medium transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="dark"
                  fullWidth
                  className="py-4 rounded-2xl"
                  onClick={() => setClaiming(true)}
                  leftIcon={<Gift className="w-5 h-5" />}
                >
                  CLAIM FREE PRIZE
                </Button>
              )
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-stone-400 font-medium bg-stone-50 dark:bg-stone-950 px-6 py-3 rounded-full border border-stone-100 dark:border-stone-800">
            <Lock className="w-4 h-4" /> Locked
          </div>
        )}
      </motion.div>
    );
  };

  const renderGrid = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="p-6 overflow-y-auto bg-white dark:bg-stone-900 flex-1 custom-scrollbar"
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-8 gap-x-4">
          {allBadges.map(badge => {
            const unlocked = unlockedBadges.find(ub => ub.badge_id === badge.id);
            const isUnlocked = !!unlocked;
            const Icon = ICON_MAP[badge.icon_name] || Star;

            return (
              <button 
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className="flex flex-col items-center gap-3 group transition-transform hover:scale-105 active:scale-95 focus:outline-none"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-2 transition-all ${
                  isUnlocked 
                    ? 'border-amber-400 text-amber-500 bg-amber-50 group-hover:bg-amber-100 group-hover:border-amber-500 shadow-sm' 
                    : 'border-stone-100 dark:border-stone-800 text-stone-300 bg-stone-50 dark:bg-stone-950 group-hover:bg-stone-100 dark:group-hover:bg-stone-800'
                }`}>
                  <Icon strokeWidth={isUnlocked ? 2.5 : 2} className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <span className={`text-xs sm:text-sm font-bold text-center leading-tight px-1 ${
                  isUnlocked ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'
                }`}>
                  {badge.name}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const gradient = getPetStripeBackground(child.character_id);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="3xl"
      padding="none"
      className="h-[85vh] sm:h-[80vh] w-full flex flex-col !bg-transparent !border-none !shadow-none"
    >
      <div 
        className="w-full h-full rounded-[2rem] p-2 sm:p-3 relative flex shadow-2xl"
        style={{ background: gradient }}
      >
        <div className="flex-1 bg-white dark:bg-stone-900 rounded-2xl flex flex-col overflow-hidden relative border-[3px] border-stone-800">
          {/* Header */}
          <div className="px-6 py-5 flex justify-between items-center shrink-0 border-b-[3px] border-stone-800 bg-white dark:bg-stone-900 z-10">
            <Typography variant="h2" className="font-black uppercase tracking-wider text-stone-800 dark:text-stone-100">Badges</Typography>
            <Button 
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 border-2 border-transparent hover:border-stone-800 transition-all"
            >
              <X className="w-5 h-5 text-stone-800 dark:text-stone-100" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-stone-50/50 dark:bg-stone-900/50">
            {loading ? (
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar w-full">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-8 gap-x-4">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-200/50 dark:bg-stone-800/50 animate-pulse border-2 border-stone-100 dark:border-stone-800" />
                      <div className="w-20 h-3 bg-stone-200/50 dark:bg-stone-800/50 animate-pulse rounded" />
                      <div className="w-12 h-3 bg-stone-200/50 dark:bg-stone-800/50 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {selectedBadge ? (
                  <React.Fragment key="detail">
                    {renderBadgeDetail()}
                  </React.Fragment>
                ) : (
                  <React.Fragment key="grid">
                    {renderGrid()}
                  </React.Fragment>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
