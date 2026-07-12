import React from 'react';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { FaBone } from 'react-icons/fa6';
import { Coins, PiggyBank, Utensils, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { CoinBadge } from './CoinBadge';

export default function Showcase() {
  const mockPet = { name: 'Astro', emoji: '👽', level: 5 };

  const renderPetScreen = (title: string, backgroundStyle: React.CSSProperties, id: string) => (
    <div className="space-y-4" id={id}>
      <Typography variant="h3" className="text-lg font-black text-stone-800 uppercase tracking-widest">{title}</Typography>
      
      <div className="w-full">
        {/* Rainbow Stripe Wrapper */}
        <div 
          className="relative p-2 rounded-3xl transition-transform duration-200 flex flex-col items-center text-center shadow-2xl overflow-hidden"
          style={backgroundStyle}
        >
          {/* Inner Cutout */}
          <div className="relative z-10 w-full h-full bg-white rounded-[1.25rem] p-4 sm:p-6 flex flex-col items-center border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]">
            
            <div className="flex justify-between w-full items-start mt-1">
              <div className="text-left">
                <span className={`text-[8px] font-sans tracking-widest uppercase text-stone-400 font-extrabold`}>PET SPECIES</span>
                <Typography variant="h3" className={`font-black text-stone-800 text-xs mt-0.5 uppercase tracking-wider`}>{mockPet.name}</Typography>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center w-full">
               <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold animate-pulse">
                 <FaBone className="inline-block mr-2 text-amber-700" /> Hungry! Needs Food
               </span>
            </div>

            {/* Giant Levitating Pedestal */}
            <div className="my-6 sm:my-10 relative flex items-center justify-center">
              <div className="absolute h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-gradient-to-tr from-cyan-400/10 to-purple-500/10 animate-spin duration-[15s]" />
              
              <motion.div
                animate={{ scale: [1, 1.05, 1], y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`h-32 w-32 sm:h-56 sm:w-56 rounded-full bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center shadow-2xl border-4 border-stone-900 relative z-10 transition-colors duration-500 overflow-hidden`}
              >
                <span className="text-6xl sm:text-[9rem] leading-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
                  {mockPet.emoji}
                </span>
              </motion.div>
            </div>

            <div className={`w-full pt-5 mt-5 border-t border-stone-200`}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[14px] font-bold text-black tracking-tight">Level {mockPet.level}</span>
                <span className="text-[12px] font-semibold text-stone-500">
                  250 / 500 gold coins
                </span>
              </div>
              <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-stone-800 w-1/2"></div>
              </div>
            </div>

            <div className="w-full pt-4 mt-4 border-t border-dashed border-stone-200 flex flex-col gap-2">
              <Button
                variant="none"
                size="none"
                className={`w-full py-3 rounded-2xl font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all bg-amber-400 border-2 border-stone-900 text-stone-900 shadow-sm hover:translate-y-0.5 active:translate-y-1 active:shadow-none`}
              >
                <span><FaBone className="inline-block mr-2 text-stone-900" /> Feed Pet (1 Food)</span>
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  const renderPot = (title: string, subtitle: string, backgroundStyle: React.CSSProperties, Icon: React.ElementType, iconColorClass: string, points: number, isLocked: boolean = false) => {
    if (isLocked) {
      return (
        <div className="relative p-2 rounded-[2.5rem] transition-transform duration-200 flex flex-col shadow-xl overflow-hidden h-full grayscale opacity-70" style={{ background: 'repeating-linear-gradient(45deg, #e7e5e4, #e7e5e4 10px, #d6d3d1 10px, #d6d3d1 20px)' }}>
          <div className="relative z-10 w-full h-full bg-stone-50 rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center text-center border-4 border-dashed border-stone-300 text-stone-500">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5" />
              <Typography variant="label" className="font-bold">Unlock at Level 4!</Typography>
            </div>
            <div className="w-full max-w-[150px] h-2 bg-stone-200 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-stone-400 w-1/3"></div>
            </div>
            <span className="text-[9px] font-sans text-stone-400 font-bold uppercase tracking-wider">
              150 / 500 GOLD
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative p-2 rounded-[2.5rem] transition-transform duration-200 flex flex-col shadow-xl overflow-hidden h-full" style={backgroundStyle}>
        <div className="relative z-10 w-full h-full bg-white rounded-[2rem] p-4 sm:p-5 flex flex-col border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left group">
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${iconColorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <CoinBadge points={points} size="sm" />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">{subtitle}</div>
            <Typography variant="h3" className="text-lg font-bold text-stone-900 px-1 mb-1">{title}</Typography>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-100 p-8 font-sans pb-32">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* =========================================
            POTS THEME SHOWCASE
            ========================================= */}
        <section className="space-y-6 pt-6">
          <Typography variant="h2" className="text-2xl font-black border-b-4 border-stone-200 pb-2 text-stone-800 uppercase tracking-widest">Rainbow Stripe Pots</Typography>
          <p className="text-stone-500 font-bold mb-4">Applying the Rainbow Stripe theme with unique color palettes for each pot type!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Pots */}
            {renderPot(
              "Gold Pot", 
              "Main Pocket", 
              { background: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #f59e0b 10px, #f59e0b 20px, #d97706 20px, #d97706 30px)' }, 
              Coins, 
              "bg-amber-100 text-amber-500", 
              250
            )}
            
            {renderPot(
              "Savings", 
              "Savings Pot", 
              { background: 'repeating-linear-gradient(-45deg, #34d399, #34d399 10px, #10b981 10px, #10b981 20px, #059669 20px, #059669 30px)' }, 
              PiggyBank, 
              "bg-emerald-100 text-emerald-500", 
              1500
            )}

            {/* Inactive/Locked Pots */}
            {renderPot(
              "Food", 
              "Food Pot (Locked)", 
              {}, 
              Utensils, 
              "", 
              0,
              true // isLocked
            )}

            {renderPot(
              "Gifting", 
              "Gifting Pot (Locked)", 
              {}, 
              Gift, 
              "", 
              0,
              true // isLocked
            )}
          </div>
        </section>

        {/* =========================================
            PET SCREEN SHOWCASE
            ========================================= */}
        <section className="space-y-6 pt-16">
          <Typography variant="h2" className="text-2xl font-black border-b-4 border-stone-200 pb-2 text-stone-800 uppercase tracking-widest">Rainbow Stripe Pet Screen</Typography>
          <p className="text-stone-500 font-bold mb-4">Here are 3 color options for the Holo Pedestal (Pet Screen).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderPetScreen(
              'A: Cyan/Purple', 
              { background: 'repeating-linear-gradient(45deg, #22d3ee, #22d3ee 15px, #a855f7 15px, #a855f7 30px, #38bdf8 30px, #38bdf8 45px)' },
              'opt-a'
            )}

            {renderPetScreen(
              'B: Orange/Pink', 
              { background: 'repeating-linear-gradient(-45deg, #fb923c, #fb923c 15px, #f472b6 15px, #f472b6 30px, #fbbf24 30px, #fbbf24 45px)' },
              'opt-b'
            )}

            {renderPetScreen(
              'C: Emerald/Teal', 
              { background: 'repeating-linear-gradient(45deg, #34d399, #34d399 15px, #2dd4bf 15px, #2dd4bf 30px, #a3e635 30px, #a3e635 45px)' },
              'opt-c'
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
