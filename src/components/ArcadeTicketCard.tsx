import React from 'react';
import { motion } from 'motion/react';
import { ChildAvatar } from './ChildAvatar';
import { CoinBadge } from './CoinBadge';

export interface ChildData {
  id: string;
  name: string;
  avatar_url: string;
  age?: number;
  level: number;
  streak_days: number;
  points: number;
  character_id?: string;
}

export interface ArcadeTicketCardProps {
  child: ChildData;
  onClick?: () => void;
  isLoading?: boolean;
}

export const getPetStripeBackground = (characterId?: string) => {
  switch (characterId) {
    case 'unicorn': return 'repeating-linear-gradient(45deg, #a855f7, #a855f7 15px, #f472b6 15px, #f472b6 30px, #e879f9 30px, #e879f9 45px)';
    case 'robot': return 'repeating-linear-gradient(-45deg, #0ea5e9, #0ea5e9 15px, #3b82f6 15px, #3b82f6 30px, #8b5cf6 30px, #8b5cf6 45px)';
    case 'dino': return 'repeating-linear-gradient(45deg, #10b981, #10b981 15px, #84cc16 15px, #84cc16 30px, #14b8a6 30px, #14b8a6 45px)';
    case 'dragon': return 'repeating-linear-gradient(-45deg, #ef4444, #ef4444 15px, #f97316 15px, #f97316 30px, #eab308 30px, #eab308 45px)';
    case 'cat': return 'repeating-linear-gradient(45deg, #6366f1, #6366f1 15px, #8b5cf6 15px, #8b5cf6 30px, #d946ef 30px, #d946ef 45px)';
    case 'bunny': return 'repeating-linear-gradient(-45deg, #d946ef, #d946ef 15px, #8b5cf6 15px, #8b5cf6 30px, #ec4899 30px, #ec4899 45px)';
    default: return 'repeating-linear-gradient(45deg, #22d3ee, #22d3ee 15px, #a855f7 15px, #a855f7 30px, #38bdf8 30px, #38bdf8 45px)';
  }
};

export function ArcadeTicketCard({ child, onClick, isLoading = false }: ArcadeTicketCardProps) {
  if (isLoading) {
    return (
      <div className="w-full h-32 sm:h-36 flex shadow-sm rounded-2xl overflow-hidden animate-pulse relative bg-stone-200">
        <div className="flex-1 bg-white dark:bg-stone-900 border-[3px] border-stone-800 m-2 rounded-xl p-4 flex items-center gap-4 relative">
          <div className="w-16 h-16 rounded-xl bg-stone-200" />
          <div className="space-y-2">
            <div className="w-20 h-3 bg-stone-200 rounded" />
            <div className="w-32 h-6 bg-stone-200 rounded" />
          </div>
        </div>
        
        {/* Perforation Placeholder */}
        <div className="w-12 shrink-0 bg-stone-50 dark:bg-stone-950 m-2 ml-0 rounded-r-xl border-[3px] border-stone-800 flex items-center justify-center">
        </div>
      </div>
    );
  }

  const gradient = getPetStripeBackground(child.character_id);
  // Generate a random-looking but deterministic serial number based on child ID
  const serialNumber = child.id ? child.id.replace(/\D/g, '').slice(0, 8).padEnd(8, '0') : '83740104';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full relative shadow-xl cursor-pointer group transition-shadow hover:shadow-2xl"
    >
      {/* Rainbow Striped Outer Ticket */}
      <div 
        className="w-full rounded-2xl p-2 sm:p-2.5 relative overflow-hidden flex"
        style={{ background: gradient }}
      >
        
        {/* Left Notch (Hole punch effect) */}
        <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-8 h-8 bg-stone-100 dark:bg-stone-800 rounded-full z-20 border-[3px] border-stone-800 transition-colors group-hover:bg-stone-200" />
        
        {/* Right Notch */}
        <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-8 h-8 bg-stone-100 dark:bg-stone-800 rounded-full z-20 border-[3px] border-stone-800 transition-colors group-hover:bg-stone-200" />

        {/* Inner White Body with thick dark border */}
        <div className="flex-1 bg-white dark:bg-stone-900 rounded-xl flex relative border-[3px] border-stone-800 transition-colors group-hover:bg-stone-50 dark:group-hover:bg-stone-950">
          
          {/* Main Content Area */}
          <div className="flex-1 p-3 sm:p-4 flex items-center gap-4 sm:gap-6 z-10 pl-6 sm:pl-8">
            {/* Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-stone-100 dark:bg-stone-800 border-2 border-stone-800 shadow-sm flex items-center justify-center">
              <ChildAvatar iconName={child.avatar_url} className="w-10 h-10 sm:w-12 sm:h-12 !border-none !rounded-none scale-90" />
            </div>
            
            {/* Name & Stats */}
            <div className="flex-1 flex flex-col items-start justify-center gap-1 sm:gap-2 min-w-0">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-stone-800 dark:text-stone-100 uppercase leading-none truncate w-full">
                {child.name}
              </h3>
              <div className="flex flex-row items-center gap-1.5 sm:gap-3">
                <span className="text-[10px] sm:text-xs font-bold text-stone-800 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 px-2 sm:px-3 py-0.5 rounded-md border-2 border-stone-800 whitespace-nowrap shadow-sm">
                  LVL {child.level}
                </span>
                <CoinBadge points={child.points} size="sm" />
              </div>
            </div>

            {/* Barcode Section */}
            <div className="flex flex-col items-center justify-center shrink-0 pr-2 sm:pr-6 border-l-2 border-transparent sm:border-stone-100 dark:border-stone-800 sm:pl-6">
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-stone-800 dark:text-stone-100 mb-1">ADMIT ONE</span>
              
              {/* Fake Barcode */}
              <div className="flex gap-[1px] sm:gap-[2px] h-8 sm:h-10 w-[80px] sm:w-[100px] items-end mb-1 opacity-80">
                {[...Array(20)].map((_, i) => {
                  const seed = (i * 17) % 5;
                  const isWide = seed > 2;
                  const isTall = seed !== 1;
                  return (
                    <div key={i} className="bg-stone-800 rounded-sm" style={{ 
                      width: isWide ? '4px' : '2px', 
                      height: isTall ? '100%' : '80%' 
                    }} />
                  );
                })}
              </div>

              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-stone-800 dark:text-stone-100">ADMIT ONE</span>
            </div>
          </div>

          {/* Sideways Serial Number */}
          <div className="w-10 sm:w-12 shrink-0 border-l-[3px] border-stone-800 flex items-center justify-center bg-stone-50 dark:bg-stone-950 z-10 pr-3 sm:pr-4">
            <span className="text-red-500 font-mono font-black tracking-widest rotate-90 whitespace-nowrap text-sm sm:text-lg">
              {serialNumber}
            </span>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
