import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { CheckCircle2, Star, Sparkles, Medal, Zap, Heart, Trophy, Check } from 'lucide-react';
import Confetti from './Confetti';

export default function WellDoneShowcase() {
  const [selectedVariant, setSelectedVariant] = useState(1);
  const taskName = "Cleaned my room";

  const renderBadgeVariant = (variant: number) => {
    switch (variant) {
      case 1: // Current with green tick (baseline)
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-orange-300 shadow-[0_4px_12px_rgba(234,88,12,0.15)] relative">
            <span className="text-base">✅</span>
            <span className="text-orange-800 font-bold font-sans text-sm tracking-wide">
              {taskName}
            </span>
          </div>
        );
      case 2: // Minimal CheckCircle
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-orange-300 shadow-[0_4px_12px_rgba(234,88,12,0.15)] relative">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-orange-800 font-bold font-sans text-sm tracking-wide">
              {taskName}
            </span>
          </div>
        );
      case 3: // Playful Sparkles
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-orange-300 shadow-[0_4px_12px_rgba(234,88,12,0.15)] relative">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-orange-800 font-bold font-sans text-sm tracking-wide">
              {taskName}
            </span>
          </div>
        );
      case 4: // Solid Orange Pill with White Text
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 border border-orange-300 shadow-lg relative">
            <Check className="w-5 h-5 text-white stroke-[3]" />
            <span className="text-white font-bold font-sans text-sm tracking-wide">
              {taskName}
            </span>
          </div>
        );
      case 5: // Zap / Energy
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-orange-300 shadow-[0_4px_12px_rgba(234,88,12,0.15)] relative">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-orange-800 font-bold font-sans text-sm tracking-wide">
              {taskName}
            </span>
          </div>
        );
      case 6: // Floating Star Tag (No border)
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white shadow-xl relative">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            </div>
            <span className="text-slate-800 font-bold font-sans text-sm tracking-wide">
              {taskName}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col font-sans">
      <div className="max-w-4xl mx-auto w-full">
        <header className="mb-12 text-center">
          <Typography variant="h1" as="h1" className="mb-4 text-slate-800">
            Well Done Task Badge Iterations
          </Typography>
          <p className="text-slate-500 mb-8">Click an option below to preview it in the overlay.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setSelectedVariant(num)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  selectedVariant === num
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Option {num}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4, 5, 6].map((variant) => (
            <div
              key={variant}
              onClick={() => setSelectedVariant(variant)}
              className={`p-8 rounded-3xl cursor-pointer transition-all border-2 flex items-center justify-center min-h-[160px] ${
                selectedVariant === variant
                  ? 'border-orange-500 bg-orange-50/50 shadow-md'
                  : 'border-transparent bg-white hover:border-slate-200'
              }`}
            >
              <div className="transform scale-125">
                {renderBadgeVariant(variant)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Overlay Preview */}
      <div 
        className="fixed bottom-8 right-8 w-80 h-[28rem] rounded-3xl overflow-hidden shadow-2xl z-50 flex flex-col items-center justify-center border-4 border-white"
        style={{
          background: 'radial-gradient(circle at center, rgba(254,240,138,0.95) 0%, rgba(253,186,116,1) 100%)',
        }}
      >
        <div className="relative flex flex-col items-center gap-3 text-center z-10 scale-75 origin-center">
          <div
            className="rounded-full bg-amber-50 border-[6px] border-amber-200 flex items-center justify-center shadow-xl shadow-amber-500/20"
            style={{ width: '8rem', height: '8rem' }}
          >
            <Trophy className="w-1/2 h-1/2 text-amber-500" fill="currentColor" />
          </div>

          <span
            style={{
              fontFamily: '"Nunito", sans-serif',
              fontWeight: 900,
              fontSize: '4rem',
              lineHeight: 0.92,
              color: '#FFFFFF',
              WebkitTextStroke: '2px #EA580C',
              textShadow: '0px 4px 0 #C2410C, 0px 8px 16px rgba(234,88,12,0.4)',
              letterSpacing: '-0.02em',
              display: 'block',
              marginTop: '1rem',
            }}
          >
            WELL
          </span>
          <span
            style={{
              fontFamily: '"Nunito", sans-serif',
              fontWeight: 900,
              fontSize: '4rem',
              lineHeight: 0.92,
              color: '#FFFFFF',
              WebkitTextStroke: '2px #EA580C',
              textShadow: '0px 4px 0 #C2410C, 0px 8px 16px rgba(234,88,12,0.4)',
              letterSpacing: '-0.02em',
              display: 'block',
            }}
          >
            DONE!
          </span>

          <div className="mt-4">
            {renderBadgeVariant(selectedVariant)}
          </div>
        </div>
      </div>
    </div>
  );
}
