import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { CheckCircle2, Star, Sparkles, Medal, Zap, Trophy, Check } from 'lucide-react';
import Confetti from './Confetti';

// --- DATA ---
const BACKGROUNDS = [
  { id: 'sunny', name: 'Sunny Amber', style: { background: 'radial-gradient(circle at center, rgba(254,240,138,0.95) 0%, rgba(253,186,116,1) 100%)' } },
  { id: 'space', name: 'Dark Space', style: { background: 'radial-gradient(ellipse at 50% 45%, #1e1060 0%, #0f0828 60%, #060412 100%)' } },
  { id: 'vibrant', name: 'Vibrant Party', style: { background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' } },
  { id: 'minimal', name: 'Soft Emerald', style: { background: '#ecfdf5' } },
];

const ICONS = [
  { id: 'trophy_badge', name: 'Trophy Badge' },
  { id: 'medal', name: 'Gold Medal' },
  { id: 'star', name: 'Giant Star' },
  { id: 'emoji', name: 'Classic Emoji 🏆' },
];

const TYPOGRAPHY = [
  { id: 'bubbly', name: 'Bubbly Outline (White/Orange)' },
  { id: 'gold', name: 'Gold 3D (Classic)' },
  { id: 'flat', name: 'Modern Flat' },
  { id: 'neon', name: 'Neon Glow' },
];

const TASK_BADGES = [
  { id: 'green_tick', name: 'Green Tick (Original)' },
  { id: 'check_circle', name: 'Minimal Check' },
  { id: 'sparkle', name: 'Playful Sparkles' },
  { id: 'solid_pill', name: 'Solid Orange Pill' },
  { id: 'zap', name: 'Zap Energy' },
];

export default function WellDoneShowcase() {
  const [bg, setBg] = useState(BACKGROUNDS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [typo, setTypo] = useState(TYPOGRAPHY[0]);
  const [badge, setBadge] = useState(TASK_BADGES[1]); // Default to Check Circle instead of Green Tick
  const [showConfetti, setShowConfetti] = useState(false);

  const taskName = "Cleaned my room";

  const renderIcon = () => {
    switch (icon.id) {
      case 'trophy_badge':
        return (
          <div className="rounded-full bg-amber-50 border-[6px] border-amber-200 flex items-center justify-center shadow-xl shadow-amber-500/20 w-32 h-32 mx-auto">
            <Trophy className="w-16 h-16 text-amber-500" fill="currentColor" />
          </div>
        );
      case 'medal':
        return (
          <div className="rounded-full bg-rose-50 border-[6px] border-rose-200 flex items-center justify-center shadow-xl shadow-rose-500/20 w-32 h-32 mx-auto">
            <Medal className="w-16 h-16 text-rose-500" fill="currentColor" />
          </div>
        );
      case 'star':
        return (
          <div className="rounded-full bg-yellow-300 border-[6px] border-yellow-400 flex items-center justify-center shadow-xl shadow-yellow-500/30 w-32 h-32 mx-auto">
            <Star className="w-20 h-20 text-white" fill="currentColor" />
          </div>
        );
      case 'emoji':
        return (
          <div className="text-[6rem] leading-none filter drop-shadow-[0_8px_20px_rgba(255,215,0,0.6)]">
            🏆
          </div>
        );
      default:
        return null;
    }
  };

  const renderTypography = () => {
    let styleObj: React.CSSProperties = {
      display: 'block',
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 900,
      fontSize: '4rem',
      lineHeight: 0.95,
      letterSpacing: '-0.02em',
    };

    switch (typo.id) {
      case 'bubbly':
        styleObj = {
          ...styleObj,
          color: '#FFFFFF',
          WebkitTextStroke: '2px #EA580C',
          textShadow: '0px 4px 0 #C2410C, 0px 8px 16px rgba(234,88,12,0.4)',
        };
        break;
      case 'gold':
        styleObj = {
          ...styleObj,
          color: '#FFD700',
          WebkitTextStroke: '2px #92400e',
          textShadow: '3px 3px 0 #b45309, 6px 6px 0 #92400e, 0 0 30px rgba(255,215,0,0.5)',
        };
        break;
      case 'flat':
        styleObj = {
          ...styleObj,
          color: bg.id === 'minimal' ? '#065F46' : '#FFFFFF',
          textShadow: 'none',
          WebkitTextStroke: '0px',
        };
        break;
      case 'neon':
        styleObj = {
          ...styleObj,
          color: '#FFFFFF',
          textShadow: '0 0 10px #FFF, 0 0 20px #FFF, 0 0 40px #f0abfc, 0 0 80px #c026d3',
          WebkitTextStroke: '0px',
        };
        break;
    }

    return (
      <div className="mt-4">
        <span style={styleObj}>WELL</span>
        <span style={styleObj}>DONE!</span>
      </div>
    );
  };

  const renderTaskBadge = () => {
    switch (badge.id) {
      case 'green_tick':
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-orange-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            <span className="text-base">✅</span>
            <span className="text-orange-800 font-bold font-sans text-sm tracking-wide">{taskName}</span>
          </div>
        );
      case 'check_circle':
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-orange-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-orange-800 font-bold font-sans text-sm tracking-wide">{taskName}</span>
          </div>
        );
      case 'sparkle':
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-orange-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-orange-800 font-bold font-sans text-sm tracking-wide">{taskName}</span>
          </div>
        );
      case 'solid_pill':
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 border border-orange-300 shadow-lg">
            <Check className="w-5 h-5 text-white stroke-[3]" />
            <span className="text-white font-bold font-sans text-sm tracking-wide">{taskName}</span>
          </div>
        );
      case 'zap':
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-orange-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-orange-800 font-bold font-sans text-sm tracking-wide">{taskName}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSection = (title: string, options: any[], current: any, setter: any) => (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => setter(opt)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              current.id === opt.id
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Configuration Panel */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-8 border-r border-slate-200 bg-white overflow-y-auto max-h-screen">
        <Typography variant="h2" className="mb-2 text-slate-800">
          Overlay Builder
        </Typography>
        <p className="text-slate-500 mb-8">Mix and match styles to build the perfect "Well Done" screen.</p>
        
        {renderSection('Background Style', BACKGROUNDS, bg, setBg)}
        {renderSection('Main Icon', ICONS, icon, setIcon)}
        {renderSection('Typography', TYPOGRAPHY, typo, setTypo)}
        {renderSection('Task Badge', TASK_BADGES, badge, setBadge)}

        <div className="mt-12 pt-8 border-t border-slate-200">
          <button 
            onClick={() => {
              setShowConfetti(false);
              setTimeout(() => setShowConfetti(true), 50);
            }}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/30 hover:scale-[1.02] transition-transform active:scale-95"
          >
            Test Animation (Confetti)
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-full md:w-1/2 lg:w-3/5 p-8 bg-slate-100 flex items-center justify-center relative overflow-hidden">
        
        {/* Full Screen Overlay Preview */}
        <div 
          className="relative w-full max-w-[400px] h-[750px] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center border-[8px] border-white transition-all duration-500"
          style={bg.style}
        >
          {/* Optional Sunburst for Space/Sunny */}
          {(bg.id === 'sunny' || bg.id === 'space') && (
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.15) 10deg, transparent 20deg, transparent 30deg, rgba(255,255,255,0.1) 40deg, transparent 50deg, transparent 60deg, rgba(255,255,255,0.15) 70deg, transparent 80deg, transparent 90deg, rgba(255,255,255,0.1) 100deg, transparent 110deg, transparent 120deg, rgba(255,255,255,0.15) 130deg, transparent 140deg, transparent 150deg, rgba(255,255,255,0.1) 160deg, transparent 170deg, transparent 180deg, rgba(255,255,255,0.15) 190deg, transparent 200deg, transparent 210deg, rgba(255,255,255,0.1) 220deg, transparent 230deg, transparent 240deg, rgba(255,255,255,0.15) 250deg, transparent 260deg, transparent 270deg, rgba(255,255,255,0.1) 280deg, transparent 290deg, transparent 300deg, rgba(255,255,255,0.15) 310deg, transparent 320deg, transparent 330deg, rgba(255,255,255,0.1) 340deg, transparent 350deg)',
              }}
            />
          )}

          <div className="relative flex flex-col items-center gap-4 text-center z-10 w-full px-6">
            {renderIcon()}
            {renderTypography()}
            <div className="mt-6 w-full flex justify-center">
              {renderTaskBadge()}
            </div>
          </div>
          
          <Confetti active={showConfetti} />
        </div>
        
        {/* Helper Label */}
        <div className="absolute top-8 right-8 text-slate-400 font-bold tracking-widest uppercase text-sm">
          Live Preview Mode
        </div>
      </div>

    </div>
  );
}
