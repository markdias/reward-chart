import React from 'react';
import { FaBroom, FaStar, FaCircleCheck } from 'react-icons/fa6';
import { CoinBadge } from './CoinBadge';

export default function TaskCardShowcase() {
  return (
    <div className="min-h-screen bg-[#FDF9F1] p-8 pb-32">
      <div className="max-w-2xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight font-display">Task Card (Playful Pop)</h1>
          <p className="text-black/70 mt-2 font-bold">The current layout, updated with the bold Playful Pop aesthetic.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-lg">
            
          {/* Blue Variation */}
          <button className="relative p-4 rounded-[1.5rem] bg-sky-300 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all group flex flex-col items-center text-center gap-3">
            <div className="absolute top-3 right-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-black text-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <FaBroom className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 group-hover:scale-110 transition-transform">
              <CoinBadge points={10} />
            </div>
            <div>
              <h4 className="font-black text-sm text-black font-display leading-tight uppercase">Make your bed</h4>
              <div className="mt-2 min-h-[24px] flex items-center justify-center">
                <div className="inline-block px-3 py-1 bg-white border-2 border-black text-black text-[9px] font-black uppercase tracking-wider rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-yellow-300 transition-colors">
                  Daily Chore
                </div>
              </div>
            </div>
          </button>

          {/* Yellow Variation */}
          <button className="relative p-4 rounded-[1.5rem] bg-yellow-300 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all group flex flex-col items-center text-center gap-3">
            <div className="absolute top-3 right-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-black text-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <FaStar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 group-hover:scale-110 transition-transform">
              <CoinBadge points={15} />
            </div>
            <div>
              <h4 className="font-black text-sm text-black font-display leading-tight uppercase">Read a book</h4>
              <div className="mt-2 min-h-[24px] flex items-center justify-center">
                <div className="inline-block px-3 py-1 bg-white border-2 border-black text-black text-[9px] font-black uppercase tracking-wider rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-sky-300 transition-colors">
                  Daily Task
                </div>
              </div>
            </div>
          </button>

          {/* Pink Variation */}
          <button className="relative p-4 rounded-[1.5rem] bg-pink-300 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all group flex flex-col items-center text-center gap-3">
            <div className="absolute top-3 right-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-black text-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <FaBroom className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 group-hover:scale-110 transition-transform">
              <CoinBadge points={20} />
            </div>
            <div>
              <h4 className="font-black text-sm text-black font-display leading-tight uppercase">Clean room</h4>
              <div className="mt-2 min-h-[24px] flex items-center justify-center">
                <div className="inline-block px-3 py-1 bg-white border-2 border-black text-black text-[9px] font-black uppercase tracking-wider rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-yellow-300 transition-colors">
                  Weekly
                </div>
              </div>
            </div>
          </button>

          {/* Completed / Disabled Variation */}
          <button className="relative p-4 rounded-[1.5rem] bg-gray-200 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all group flex flex-col items-center text-center gap-3">
            <div className="absolute top-3 right-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-black text-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <FaStar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 opacity-50 grayscale">
              <CoinBadge points={10} disabled={true} />
            </div>
            <div>
              <h4 className="font-black text-sm text-black font-display leading-tight uppercase opacity-50 line-through">Walk Dog</h4>
              <div className="mt-2 min-h-[24px] flex items-center justify-center">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-300 border-2 border-black text-black text-[9px] font-black uppercase tracking-wider rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <FaCircleCheck className="w-3 h-3" /> DONE
                </div>
              </div>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}
