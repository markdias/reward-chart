import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import Confetti from './Confetti';
import { CHARACTER_PACKS, getCharacterStage } from '../data/characters';
import { Sparkles, PawPrint, Zap, Flame, Rocket, Wand2, CheckCircle2 } from 'lucide-react';

const KEYFRAMES = `
@keyframes kid-bounce {
  0% { opacity: 0; transform: scale(0.5) translateY(40px) rotate(-10deg); }
  60% { opacity: 1; transform: scale(1.1) translateY(-15px) rotate(5deg); }
  80% { transform: scale(0.95) translateY(5px) rotate(-2deg); }
  100% { opacity: 1; transform: scale(1) translateY(0) rotate(0deg); }
}
@keyframes kid-float {
  0%, 100% { transform: translateY(0px) rotate(-3deg); }
  50% { transform: translateY(-15px) rotate(4deg); }
}
`;

// Helper to map companion IDs to specific thematic styles
const getThemeForCompanion = (companionId: string) => {
  switch (companionId) {
    case 'unicorn':
      return {
        bg: 'radial-gradient(circle at 50% 50%, #fdf4ff 0%, #fbcfe8 40%, #e0e7ff 100%)',
        titleColor: '#d946ef',
        titleStroke: '4px #ffffff',
        titleShadow: '0 8px 0 #a21caf',
        badgeBg: 'bg-white',
        badgeBorder: 'border-[4px] border-fuchsia-300',
        badgeTextColor: 'text-fuchsia-600',
        badgeIcon: <Sparkles className="w-5 h-5 text-fuchsia-400" />,
      };
    case 'robot':
      return {
        bg: 'radial-gradient(circle at 50% 50%, #ecfeff 0%, #a5f3fc 50%, #22d3ee 100%)',
        titleColor: '#0ea5e9',
        titleStroke: '4px #ffffff',
        titleShadow: '0 8px 0 #0369a1',
        badgeBg: 'bg-white',
        badgeBorder: 'border-[4px] border-cyan-400',
        badgeTextColor: 'text-cyan-700',
        badgeIcon: <Zap className="w-5 h-5 text-cyan-500 fill-cyan-500" />,
      };
    case 'dino':
      return {
        bg: 'radial-gradient(circle at 50% 50%, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
        titleColor: '#f97316',
        titleStroke: '4px #ffffff',
        titleShadow: '0 8px 0 #c2410c',
        badgeBg: 'bg-orange-50',
        badgeBorder: 'border-[4px] border-orange-400',
        badgeTextColor: 'text-orange-800',
        badgeIcon: <PawPrint className="w-5 h-5 text-orange-500" />,
      };
    case 'dragon':
      return {
        bg: 'radial-gradient(circle at 50% 50%, #fff7ed 0%, #fed7aa 40%, #f97316 100%)',
        titleColor: '#ef4444',
        titleStroke: '4px #ffffff',
        titleShadow: '0 8px 0 #b91c1c',
        badgeBg: 'bg-white',
        badgeBorder: 'border-[4px] border-red-400',
        badgeTextColor: 'text-red-600',
        badgeIcon: <Flame className="w-5 h-5 text-red-500 fill-red-500" />,
      };
    case 'cat':
      return {
        bg: 'radial-gradient(circle at 50% 50%, #f3e8ff 0%, #d8b4fe 40%, #9333ea 100%)',
        titleColor: '#facc15',
        titleStroke: '4px #581c87',
        titleShadow: '0 8px 0 #3b0764',
        badgeBg: 'bg-purple-50',
        badgeBorder: 'border-[4px] border-purple-400',
        badgeTextColor: 'text-purple-800',
        badgeIcon: <Wand2 className="w-5 h-5 text-purple-600" />,
      };
    case 'bunny':
      return {
        bg: 'radial-gradient(circle at 50% 50%, #2e1065 0%, #172554 60%, #020617 100%)',
        titleColor: '#22d3ee',
        titleStroke: '3px #ffffff',
        titleShadow: '0 0 20px #22d3ee, 0 8px 0 #0891b2',
        badgeBg: 'bg-indigo-950',
        badgeBorder: 'border-[2px] border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]',
        badgeTextColor: 'text-cyan-300',
        badgeIcon: <Rocket className="w-5 h-5 text-cyan-400" />,
      };
    default:
      return {
        bg: 'radial-gradient(circle at 50% 50%, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
        titleColor: '#ffffff',
        titleStroke: '4px #ea580c',
        titleShadow: '0 8px 0 #c2410c',
        badgeBg: 'bg-white',
        badgeBorder: 'border-[4px] border-amber-400',
        badgeTextColor: 'text-amber-800',
        badgeIcon: <CheckCircle2 className="w-5 h-5 text-amber-500" />,
      };
  }
};

export default function WellDoneShowcase() {
  const [activeCompanion, setActiveCompanion] = useState(CHARACTER_PACKS[0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const taskName = "Cleaned my room";

  const triggerAnimation = (companion: any) => {
    setActiveCompanion(companion);
    setShowConfetti(false);
    setTimeout(() => setShowConfetti(true), 50);
  };

  const theme = getThemeForCompanion(activeCompanion.id);
  const companionImage = getCharacterStage(activeCompanion.id, 4).image_url; // Show max stage

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <style>{KEYFRAMES}</style>
      
      {/* Configuration Panel */}
      <div className="w-full md:w-2/5 p-8 border-r border-slate-200 bg-white overflow-y-auto max-h-screen">
        <Typography variant="h2" className="mb-2 text-slate-800">
          Companion Themes
        </Typography>
        <p className="text-slate-500 mb-8 text-sm">
          The "Well Done" screen will dynamically style itself based on the child's chosen companion!
        </p>
        
        <div className="flex flex-col gap-4">
          {CHARACTER_PACKS.map(char => (
            <button
              key={char.id}
              onClick={() => triggerAnimation(char)}
              className={`p-4 rounded-2xl text-left transition-all border-4 flex items-center gap-4 ${
                activeCompanion.id === char.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-transparent bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <img src={getCharacterStage(char.id, 4).image_url} alt={char.name} className="w-12 h-12 object-contain" />
              <div className="flex flex-col">
                <span className="font-black text-lg text-slate-800">{char.name}</span>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{char.pack_name} Theme</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <button 
            onClick={() => triggerAnimation(activeCompanion)}
            className="w-full py-4 bg-slate-800 text-white font-black uppercase tracking-wider rounded-2xl shadow-lg hover:scale-[1.02] transition-transform active:scale-95"
          >
            Replay Animation
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-full md:w-3/5 p-8 bg-slate-100 flex items-center justify-center relative overflow-hidden">
        
        {/* Full Screen Overlay Preview container */}
        <div 
          className="relative w-full max-w-[420px] h-[800px] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center border-[12px] border-white transition-all duration-700"
          style={{ background: theme.bg }}
        >
          {/* Subtle star overlay for space bunny */}
          {activeCompanion.id === 'bunny' && (
             <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          )}

          <div className="relative flex flex-col items-center gap-6 text-center z-10 w-full px-6">
            
            {/* Massive Companion Image */}
            <div 
              key={`icon-${activeCompanion.id}-${showConfetti}`}
              className="filter drop-shadow-2xl"
              style={{ animation: 'kid-bounce 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards, kid-float 3s ease-in-out infinite 0.8s' }}
            >
              <img src={companionImage} alt="Companion" className="w-48 h-48 object-contain" />
            </div>
            
            {/* Bouncy Title */}
            <div 
              key={`title-${activeCompanion.id}-${showConfetti}`}
              className="flex flex-col items-center mt-2"
              style={{ animation: 'kid-bounce 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.15s forwards', opacity: 0 }}
            >
              {['WELL', 'DONE!'].map((word, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    fontFamily: '"Nunito", sans-serif',
                    fontWeight: 900,
                    fontSize: '4.5rem',
                    lineHeight: 0.9,
                    letterSpacing: '-0.03em',
                    color: theme.titleColor,
                    WebkitTextStroke: theme.titleStroke,
                    textShadow: theme.titleShadow,
                    transform: i % 2 !== 0 ? 'rotate(-2deg)' : 'rotate(2deg)',
                  }}
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Task Badge */}
            <div 
              key={`badge-${activeCompanion.id}-${showConfetti}`}
              className={`mt-8 flex items-center gap-3 px-6 py-3 rounded-full ${theme.badgeBg} ${theme.badgeBorder} shadow-xl`}
              style={{ animation: 'kid-bounce 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s forwards', opacity: 0 }}
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                {theme.badgeIcon}
              </div>
              <span className={`font-black font-sans text-base tracking-wide ${theme.badgeTextColor}`}>
                {taskName}
              </span>
            </div>

          </div>
          
          <Confetti active={showConfetti} />
        </div>
        
      </div>
    </div>
  );
}
