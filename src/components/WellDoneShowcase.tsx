import React, { useState } from 'react';
import { CheckCircle2, Star, Sparkles, Medal, Rocket, Wand2, PartyPopper, PawPrint } from 'lucide-react';
import { Typography } from './ui/Typography';
import Confetti from './Confetti';

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

const THEMES = [
  {
    id: 'rainbow',
    name: 'Rainbow Magic',
    desc: 'Soft pastels and magic wands',
    bg: 'radial-gradient(circle at 50% 50%, #fdf4ff 0%, #fbcfe8 40%, #e0e7ff 100%)',
    icon: <Wand2 className="w-32 h-32 text-fuchsia-500" strokeWidth={2.5} />,
    title: 'MAGICAL!',
    titleColor: '#d946ef', // fuchsia
    titleStroke: '4px #ffffff',
    titleShadow: '0 8px 0 #a21caf',
    badgeBg: 'bg-white',
    badgeBorder: 'border-[5px] border-fuchsia-300',
    badgeRadius: 'rounded-full',
    badgeTextColor: 'text-fuchsia-600',
    badgeIcon: <Sparkles className="w-5 h-5 text-fuchsia-400" />,
  },
  {
    id: 'safari',
    name: 'Wild Safari',
    desc: 'Jungle greens and paw prints',
    bg: 'radial-gradient(circle at 50% 50%, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
    icon: <PawPrint className="w-32 h-32 text-orange-500" strokeWidth={2.5} />,
    title: 'ROAR-SOME!',
    titleColor: '#f97316', // orange
    titleStroke: '4px #ffffff',
    titleShadow: '0 8px 0 #c2410c',
    badgeBg: 'bg-orange-50',
    badgeBorder: 'border-[5px] border-orange-400',
    badgeRadius: 'rounded-3xl', // slightly blocky
    badgeTextColor: 'text-orange-800',
    badgeIcon: <CheckCircle2 className="w-5 h-5 text-orange-500" />,
  },
  {
    id: 'space',
    name: 'Space Explorer',
    desc: 'Cosmic colors and rockets',
    bg: 'radial-gradient(circle at 50% 50%, #2e1065 0%, #172554 60%, #020617 100%)',
    icon: <Rocket className="w-32 h-32 text-cyan-400" strokeWidth={2.5} />,
    title: 'STELLAR!',
    titleColor: '#22d3ee', // cyan
    titleStroke: '3px #ffffff',
    titleShadow: '0 0 20px #22d3ee, 0 8px 0 #0891b2',
    badgeBg: 'bg-[#0f172a]',
    badgeBorder: 'border-[3px] border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]',
    badgeRadius: 'rounded-full',
    badgeTextColor: 'text-cyan-300',
    badgeIcon: <Star className="w-5 h-5 text-cyan-400 fill-cyan-400" />,
  },
  {
    id: 'party',
    name: 'Party Time',
    desc: 'Bright stripes and celebrations',
    bg: 'repeating-linear-gradient(45deg, #fef08a 0px, #fef08a 40px, #fecdd3 40px, #fecdd3 80px)',
    icon: <PartyPopper className="w-32 h-32 text-rose-500" strokeWidth={2.5} />,
    title: 'YAYYY!',
    titleColor: '#ffffff',
    titleStroke: '4px #e11d48', // rose
    titleShadow: '0 8px 0 #be123c',
    badgeBg: 'bg-white',
    badgeBorder: 'border-[5px] border-rose-400',
    badgeRadius: 'rounded-2xl',
    badgeTextColor: 'text-rose-600',
    badgeIcon: <Medal className="w-5 h-5 text-rose-500" />,
  },
];

export default function WellDoneShowcase() {
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const taskName = "Cleaned my room";

  const triggerAnimation = (theme: any) => {
    setActiveTheme(theme);
    setShowConfetti(false);
    setTimeout(() => setShowConfetti(true), 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <style>{KEYFRAMES}</style>
      
      {/* Configuration Panel */}
      <div className="w-full md:w-2/5 p-8 border-r border-slate-200 bg-white overflow-y-auto max-h-screen">
        <Typography variant="h2" className="mb-2 text-slate-800">
          Kid-Friendly Themes
        </Typography>
        <p className="text-slate-500 mb-8 text-sm">
          Select a cohesive theme designed specifically to appeal to children.
        </p>
        
        <div className="flex flex-col gap-4">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => triggerAnimation(theme)}
              className={`p-5 rounded-2xl text-left transition-all border-4 flex flex-col gap-1 ${
                activeTheme.id === theme.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-transparent bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <span className="font-black text-lg text-slate-800">{theme.name}</span>
              <span className="text-slate-500 text-sm font-medium">{theme.desc}</span>
            </button>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <button 
            onClick={() => triggerAnimation(activeTheme)}
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
          style={{ background: activeTheme.bg }}
        >
          {/* Subtle star overlay for space */}
          {activeTheme.id === 'space' && (
             <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          )}

          <div className="relative flex flex-col items-center gap-6 text-center z-10 w-full px-6">
            
            {/* Massive Playful Icon */}
            <div 
              key={`icon-${activeTheme.id}-${showConfetti}`}
              className="flex justify-center items-center filter drop-shadow-2xl"
              style={{ animation: 'kid-bounce 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards, kid-float 3s ease-in-out infinite 0.8s' }}
            >
              {activeTheme.icon}
            </div>
            
            {/* Bouncy Title */}
            <div 
              key={`title-${activeTheme.id}-${showConfetti}`}
              className="flex flex-col items-center mt-2"
              style={{ animation: 'kid-bounce 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.15s forwards', opacity: 0 }}
            >
              {activeTheme.title.split(' ').map((word, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    fontFamily: '"Nunito", sans-serif',
                    fontWeight: 900,
                    fontSize: '4.5rem',
                    lineHeight: 0.9,
                    letterSpacing: '-0.03em',
                    color: activeTheme.titleColor,
                    WebkitTextStroke: activeTheme.titleStroke,
                    textShadow: activeTheme.titleShadow,
                    transform: i % 2 !== 0 ? 'rotate(-2deg)' : 'rotate(2deg)',
                  }}
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Task Badge */}
            <div 
              key={`badge-${activeTheme.id}-${showConfetti}`}
              className={`mt-8 flex items-center gap-3 px-6 py-3 ${activeTheme.badgeRadius} ${activeTheme.badgeBg} ${activeTheme.badgeBorder} shadow-xl`}
              style={{ animation: 'kid-bounce 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s forwards', opacity: 0 }}
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                {activeTheme.badgeIcon}
              </div>
              <span className={`font-black font-sans text-base tracking-wide ${activeTheme.badgeTextColor}`}>
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
