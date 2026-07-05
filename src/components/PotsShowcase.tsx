import React, { useState } from 'react';
import { Coins, PiggyBank, Bone, Gift, Play, ChevronDown, CheckCircle, Info, Minus, Plus } from 'lucide-react';
import { FaCoins, FaWandMagicSparkles, FaBowlFood, FaHeart } from 'react-icons/fa6';
import { CoinBadge } from './CoinBadge';

const MockExpandedGold = () => (
  <div className="mt-4 pt-4 border-t-[3px] border-black space-y-3 flex-1 flex flex-col">
    <div className="text-xs font-bold text-black leading-relaxed">
      This is your main pocket where all the gold coins you earn are kept. You can use these coins to buy rewards, save them in your Savings Pot, or spend them on your pets!
    </div>
  </div>
);

const MockExpandedSavings = () => (
  <div className="mt-4 pt-4 border-t-[3px] border-black space-y-3">
    <div className="text-xs font-bold text-black leading-relaxed">
      Move gold coins here from your main pocket to save them safely.
    </div>
    <div className="p-3 bg-white border-[3px] border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between font-black text-xs uppercase mb-2 text-black">
        <span>Goal: Skateboard</span>
        <span>55/100</span>
      </div>
      <div className="h-4 bg-emerald-100 border-[3px] border-black rounded-full overflow-hidden">
        <div className="h-full bg-emerald-400 w-[55%] border-r-[3px] border-black" />
      </div>
    </div>
    <div className="flex gap-2">
      <button className="flex-1 bg-yellow-300 border-[3px] border-black p-2 rounded-xl font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2">
        <FaCoins /> Deposit
      </button>
      <button className="flex-1 bg-white border-[3px] border-black p-2 rounded-xl font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
        Withdraw All
      </button>
    </div>
  </div>
);

const MockExpandedFood = () => (
  <div className="mt-4 pt-4 border-t-[3px] border-black space-y-3 flex-1 flex flex-col">
    <div className="text-xs font-bold text-black leading-relaxed">
      Keep your pet happy! Buy food, feed them daily, or sell extra food back for coins.
    </div>
    <div className="flex gap-2 mt-auto">
      <button className="flex-1 bg-white border-[3px] border-black p-2 rounded-xl font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
        Buy (-1 Coin)
      </button>
      <button className="flex-1 bg-yellow-300 border-[3px] border-black p-2 rounded-xl font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-1">
        <FaBowlFood /> Feed
      </button>
    </div>
    <button className="w-full bg-white border-[3px] border-black p-2 rounded-xl font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
      Sell Food (+1 Coin)
    </button>
  </div>
);

const MockExpandedGifting = () => (
  <div className="mt-4 pt-4 border-t-[3px] border-black space-y-3 flex-1 flex flex-col">
    <div className="text-xs font-bold text-black leading-relaxed">
      Use your gold coins to give back to a charity, or send a gift to your siblings!
    </div>
    <div className="flex gap-2 mt-auto">
      <button className="flex-1 bg-pink-300 border-[3px] border-black p-2 rounded-xl font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-1">
        <FaHeart className="w-3 h-3" /> Charity
      </button>
      <button className="flex-1 bg-purple-300 border-[3px] border-black p-2 rounded-xl font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-1">
        <Gift className="w-3 h-3" /> Sibling
      </button>
    </div>
  </div>
);

export default function PotsShowcase() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'pop-gold': true,
    'pop-savings': true,
    'pop-food': true,
    'pop-gifting': true,
  });

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#FDF9F1] p-8 pb-32 font-sans">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-black font-display tracking-tight">Pots (Playful Pop)</h1>
          <p className="text-black/70 mt-2 font-bold">The current row layout, updated with the bold Playful Pop aesthetic.</p>
        </div>

        <section className="space-y-6">
          <div className="max-w-md mx-auto space-y-5">
            
            {/* Gold Pot */}
            <div 
              onClick={() => toggle('pop-gold')}
              className={`bg-amber-300 border-[3px] border-black rounded-2xl p-4 transition-all cursor-pointer flex flex-col group ${expanded['pop-gold'] ? 'shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] translate-y-1' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-[3px] border-black rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Coins className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-black uppercase tracking-tight leading-none">Main Pocket</h3>
                    <button className="flex items-center gap-1 text-black/70 mt-1 text-[10px] font-black uppercase hover:text-black">
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded['pop-gold'] ? 'rotate-180' : ''}`} /> View info
                    </button>
                  </div>
                </div>
                <div className="bg-white border-[3px] border-black px-4 py-2 rounded-full font-black text-black text-xl flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  125
                </div>
              </div>
              {expanded['pop-gold'] && (
                <div className="mt-2 w-full" onClick={(e) => e.stopPropagation()}>
                  <MockExpandedGold />
                </div>
              )}
            </div>

            {/* Savings Pot */}
            <div 
              onClick={() => toggle('pop-savings')}
              className={`bg-emerald-300 border-[3px] border-black rounded-2xl p-4 transition-all cursor-pointer flex flex-col group ${expanded['pop-savings'] ? 'shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] translate-y-1' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-[3px] border-black rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <PiggyBank className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-black uppercase tracking-tight leading-none">Savings</h3>
                    <button className="flex items-center gap-1 text-black/70 mt-1 text-[10px] font-black uppercase hover:text-black">
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded['pop-savings'] ? 'rotate-180' : ''}`} /> Manage
                    </button>
                  </div>
                </div>
                <div className="bg-white border-[3px] border-black px-4 py-2 rounded-full font-black text-black text-xl flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  55
                </div>
              </div>
              {expanded['pop-savings'] && (
                <div className="mt-2 w-full" onClick={(e) => e.stopPropagation()}>
                  <MockExpandedSavings />
                </div>
              )}
            </div>

            {/* Food Pot */}
            <div 
              onClick={() => toggle('pop-food')}
              className={`bg-orange-300 border-[3px] border-black rounded-2xl p-4 transition-all cursor-pointer flex flex-col group ${expanded['pop-food'] ? 'shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] translate-y-1' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-[3px] border-black rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Bone className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-black uppercase tracking-tight leading-none">Food Pot</h3>
                    <button className="flex items-center gap-1 text-black/70 mt-1 text-[10px] font-black uppercase hover:text-black">
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded['pop-food'] ? 'rotate-180' : ''}`} /> Manage
                    </button>
                  </div>
                </div>
                <div className="bg-white border-[3px] border-black px-3 py-2 rounded-full font-black text-black text-lg flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Bone className="w-4 h-4" /> 6
                </div>
              </div>
              {expanded['pop-food'] && (
                <div className="mt-2 w-full" onClick={(e) => e.stopPropagation()}>
                  <MockExpandedFood />
                </div>
              )}
            </div>
            
            {/* Gifting Pot */}
            <div 
              onClick={() => toggle('pop-gifting')}
              className={`bg-purple-300 border-[3px] border-black rounded-2xl p-4 transition-all cursor-pointer flex flex-col group ${expanded['pop-gifting'] ? 'shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] translate-y-1' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-[3px] border-black rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Gift className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-black uppercase tracking-tight leading-none">Gifting</h3>
                    <button className="flex items-center gap-1 text-black/70 mt-1 text-[10px] font-black uppercase hover:text-black">
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded['pop-gifting'] ? 'rotate-180' : ''}`} /> Give
                    </button>
                  </div>
                </div>
                <div className="bg-white border-[3px] border-black px-4 py-2 rounded-full font-black text-black text-xl flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  --
                </div>
              </div>
              {expanded['pop-gifting'] && (
                <div className="mt-2 w-full" onClick={(e) => e.stopPropagation()}>
                  <MockExpandedGifting />
                </div>
              )}
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
