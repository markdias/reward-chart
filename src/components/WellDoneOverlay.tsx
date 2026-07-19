import React from 'react';
import { Typography } from './ui/Typography';
import { Sparkles, PawPrint, Zap, Flame, Rocket, Wand2, CheckCircle2 } from 'lucide-react';
import { getCharacterStage } from '../data/characters';
import Confetti from './Confetti';

interface WellDoneOverlayProps {
  show: boolean;
  taskName?: string | null;
  companionId?: string;
}

const KEYFRAMES = `
@keyframes wd-bg-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes wd-rays {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes wd-star {
  0%   { opacity: 0; transform: scale(0) rotate(-30deg); }
  55%  { opacity: 1; transform: scale(1.25) rotate(8deg); }
  75%  { transform: scale(0.9)  rotate(-3deg); }
  90%  { transform: scale(1.06) rotate(2deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes wd-well {
  0%   { opacity: 0; transform: translateX(-120px) skewX(-12deg) scale(0.8); }
  65%  { opacity: 1; transform: translateX(10px)  skewX(2deg)  scale(1.03); }
  85%  { transform: translateX(-4px) skewX(0deg) scale(0.99); }
  100% { opacity: 1; transform: translateX(0)    skewX(0deg)  scale(1); }
}
@keyframes wd-done {
  0%   { opacity: 0; transform: translateX(120px) skewX(12deg) scale(0.8); }
  65%  { opacity: 1; transform: translateX(-10px) skewX(-2deg) scale(1.03); }
  85%  { transform: translateX(4px) skewX(0deg) scale(0.99); }
  100% { opacity: 1; transform: translateX(0)   skewX(0deg)  scale(1); }
}
@keyframes wd-badge {
  0%   { opacity: 0; transform: translateY(18px) scale(0.92); }
  100% { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes wd-float-star {
  0%   { opacity: 0; transform: translate(0, 0) scale(0) rotate(0deg); }
  30%  { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.2) rotate(var(--dr)); }
}
@keyframes wd-kid-bounce {
  0% { opacity: 0; transform: scale(0.5) translateY(40px) rotate(-10deg); }
  60% { opacity: 1; transform: scale(1.1) translateY(-15px) rotate(5deg); }
  80% { transform: scale(0.95) translateY(5px) rotate(-2deg); }
  100% { opacity: 1; transform: scale(1) translateY(0) rotate(0deg); }
}
@keyframes wd-kid-float {
  0%, 100% { transform: translateY(0px) rotate(-3deg); }
  50% { transform: translateY(-15px) rotate(4deg); }
}
`;

// Helper to map companion IDs to specific thematic styles
const getThemeForCompanion = (companionId: string) => {
  switch (companionId) {
    case 'unicorn':
      return {
        bg: 'radial-gradient(circle at center, #fdf4ff 0%, #fbcfe8 40%, #e0e7ff 100%)',
        titleColor: '#d946ef',
        titleStroke: '4px #ffffff',
        titleShadow: '0 8px 0 #a21caf',
        badgeBg: 'bg-white dark:bg-stone-900',
        badgeBorder: 'border-[4px] border-fuchsia-300',
        badgeTextColor: 'text-fuchsia-600',
        badgeIcon: <Sparkles className="w-5 h-5 text-fuchsia-400" />,
      };

    case 'dino':
      return {
        bg: 'radial-gradient(circle at center, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
        titleColor: '#f97316',
        titleStroke: '4px #ffffff',
        titleShadow: '0 8px 0 #c2410c',
        badgeBg: 'bg-orange-50',
        badgeBorder: 'border-[4px] border-orange-400',
        badgeTextColor: 'text-orange-800',
        badgeIcon: <PawPrint className="w-5 h-5 text-orange-500" />,
      };

    default:
      return {
        bg: 'radial-gradient(circle at center, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
        titleColor: '#ffffff',
        titleStroke: '4px #ea580c',
        titleShadow: '0 8px 0 #c2410c',
        badgeBg: 'bg-white dark:bg-stone-900',
        badgeBorder: 'border-[4px] border-amber-400',
        badgeTextColor: 'text-amber-800',
        badgeIcon: <CheckCircle2 className="w-5 h-5 text-amber-500" />,
      };
  }
};

export default function WellDoneOverlay({ show, taskName, companionId = 'unicorn' }: WellDoneOverlayProps) {
  if (!show) return null;

  const theme = getThemeForCompanion(companionId);
  const companionImage = getCharacterStage(companionId, 99).model_url; // Default to final stage or generic stage for celebration

  const textStyle = (anim: string, delay: string): React.CSSProperties => ({
    display: 'block',
    fontFamily: '"Nunito", sans-serif',
    fontWeight: 900,
    fontSize: 'clamp(4.5rem, 20vw, 9.5rem)',
    lineHeight: 0.9,
    color: theme.titleColor,
    WebkitTextStroke: theme.titleStroke,
    textShadow: theme.titleShadow,
    opacity: 0,
    animation: `${anim} 0.55s cubic-bezier(0.34,1.4,0.64,1) ${delay} forwards`,
    letterSpacing: '-0.03em',
  });

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Full-screen themed overlay */}
      <div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-auto select-none overflow-hidden"
        style={{
          background: theme.bg,
          backdropFilter: 'blur(12px)',
          animation: 'wd-bg-in 0.22s ease-out forwards',
        }}
        aria-hidden
      >
        {/* Subtle star overlay for space bunny */}
        {companionId === 'bunny' && (
           <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
        )}

        {/* Central content */}
        <div className="relative flex flex-col items-center gap-6 text-center z-10 w-full px-6">
          
          {/* Massive Companion Image */}
          <div 
            className="filter drop-shadow-2xl"
            style={{ animation: 'wd-kid-bounce 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.05s forwards, wd-kid-float 3s ease-in-out infinite 0.85s' }}
          >
            <model-viewer src={companionImage} alt="Companion" auto-rotate camera-controls class="w-[clamp(12rem,40vw,24rem)] h-[clamp(12rem,40vw,24rem)]">
              <div slot="progress-bar"></div>
            </model-viewer>
          </div>

          <div className="flex flex-col items-center mt-2">
            {/* WELL */}
            <span style={{ ...textStyle('wd-well', '0.15s'), transform: 'rotate(-2deg)' }}>WELL</span>
            {/* DONE! */}
            <span style={{ ...textStyle('wd-done', '0.25s'), transform: 'rotate(2deg)' }}>DONE!</span>
          </div>

          {/* Task name badge */}
          {taskName && (
            <div 
              className={`mt-4 flex items-center gap-3 px-6 py-3 rounded-full ${theme.badgeBg} ${theme.badgeBorder} shadow-xl`}
              style={{ animation: 'wd-badge 0.4s ease-out 0.4s forwards', opacity: 0 }}
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                {theme.badgeIcon}
              </div>
              <span 
                className={`font-black font-sans tracking-wide ${theme.badgeTextColor}`}
                style={{
                  fontSize: 'clamp(0.9rem, 4vw, 1.2rem)',
                  maxWidth: '280px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {taskName}
              </span>
            </div>
          )}
        </div>
      </div>

      <Confetti active={show} />
    </>
  );
}
