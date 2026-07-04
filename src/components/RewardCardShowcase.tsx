import React from 'react';
import { Gift, CheckCircle } from 'lucide-react';
import { CoinBadge } from './CoinBadge';

export default function RewardCardShowcase() {
  return (
    <div className="min-h-screen bg-[#FDF9F1] p-8 pb-32 font-sans">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-black font-display tracking-tight">Reward Card (Playful Pop)</h1>
          <p className="text-black/70 mt-2 font-bold">The current layout, updated with the bold Playful Pop aesthetic.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
          {/* Orange/Yellow Variation */}
          <button className="relative p-4 rounded-[1.5rem] bg-orange-300 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all group flex flex-col items-center text-center gap-3">
            <div className="absolute top-3 right-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-black text-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                100
              </div>
            </div>
            <div className="h-16 w-16 rounded-full bg-white border-[3px] border-black flex items-center justify-center mt-2 group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Gift className="w-8 h-8 text-black" />
            </div>
            <div className="w-full">
              <h4 className="font-black text-sm text-black font-display leading-tight uppercase">1 hour gaming time</h4>
              <div className="mt-2 min-h-[24px] flex items-center justify-center">
                <div className="inline-block px-3 py-1 bg-white border-2 border-black text-black text-[9px] font-black uppercase tracking-wider rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-yellow-300 transition-colors">
                  Set Goal
                </div>
              </div>
            </div>
          </button>

          {/* Emerald Variation */}
          <button className="relative p-4 rounded-[1.5rem] bg-emerald-300 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all group flex flex-col items-center text-center gap-3">
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white border-2 border-black px-2 py-1 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <CheckCircle className="w-3 h-3 text-black" />
               <span className="text-[9px] text-black font-black uppercase tracking-widest">Saving</span>
            </div>
            <div className="h-16 w-16 rounded-full bg-white border-[3px] border-black flex items-center justify-center mt-6 group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Gift className="w-8 h-8 text-black" />
            </div>
            <div className="w-full">
              <h4 className="font-black text-sm text-black font-display leading-tight uppercase">30 mins screen time</h4>
              <div className="mt-2 text-black font-black text-sm">
                50 <span className="text-[10px] uppercase tracking-widest font-mono">Gold</span>
              </div>
            </div>
          </button>

          {/* Purple Variation */}
          <button className="relative p-4 rounded-[1.5rem] bg-purple-300 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all group flex flex-col items-center text-center gap-3">
            <div className="absolute top-3 right-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-black text-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                250
              </div>
            </div>
            <div className="h-16 w-16 rounded-full bg-white border-[3px] border-black flex items-center justify-center mt-2 group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Gift className="w-8 h-8 text-black" />
            </div>
            <div className="w-full">
              <h4 className="font-black text-sm text-black font-display leading-tight uppercase">Trip to zoo</h4>
              <div className="mt-2 min-h-[24px] flex items-center justify-center">
                <div className="inline-block px-3 py-1 bg-white border-2 border-black text-black text-[9px] font-black uppercase tracking-wider rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-yellow-300 transition-colors">
                  Set Goal
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
