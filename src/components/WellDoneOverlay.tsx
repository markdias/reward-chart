import React from 'react';
import Confetti from './Confetti';

interface WellDoneOverlayProps {
  show: boolean;
  taskName?: string | null;
}

// Vibrant per-letter colours
const COLORS = ['#FF5757', '#FF9A3C', '#FFD166', '#06D6A0', '#4CC9F0', '#B5179E', '#FF5757', '#FF9A3C', '#FFD166'];

const KEYFRAMES = `
@keyframes wd-card-in {
  0%   { opacity: 0; transform: scale(0.5) rotate(-4deg); }
  60%  { opacity: 1; transform: scale(1.06) rotate(1.5deg); }
  80%  { transform: scale(0.97) rotate(-0.5deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes wd-burst {
  0%   { transform: scale(0);   opacity: 0; }
  40%  { transform: scale(1.2); opacity: 0.9; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes wd-letter {
  0%   { opacity: 0; transform: translateY(56px) scale(0.4) rotate(var(--tilt)); }
  55%  { opacity: 1; transform: translateY(-10px) scale(1.18) rotate(calc(var(--tilt) * -0.3)); }
  75%  { transform: translateY(4px) scale(0.95) rotate(1deg); }
  88%  { transform: translateY(-3px) scale(1.04) rotate(0deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
}
@keyframes wd-badge {
  0%   { opacity: 0; transform: translateY(14px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes wd-overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`;

export default function WellDoneOverlay({ show, taskName }: WellDoneOverlayProps) {
  if (!show) return null;

  const word1 = 'WELL'.split('');
  const word2 = 'DONE!'.split('');
  const allLetters = [...word1, null, ...word2]; // null = spacer

  return (
    <>
      {/* Inject keyframes once */}
      <style>{KEYFRAMES}</style>

      <div
        className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none select-none"
        style={{ animation: 'wd-overlay-in 0.18s ease-out forwards' }}
        aria-hidden
      >
        {/* Radial burst */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(253,224,71,0.6) 0%, rgba(244,114,182,0.4) 45%, transparent 70%)',
            animation: 'wd-burst 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
          }}
        />

        {/* Card */}
        <div
          className="relative flex flex-col items-center gap-4 px-10 py-9 rounded-[2.5rem] bg-white"
          style={{
            border: '5px solid #FFD166',
            boxShadow: '0 0 0 7px rgba(255,154,60,0.22), 0 28px 80px rgba(0,0,0,0.22)',
            animation: 'wd-card-in 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}
        >
          {/* Letters row */}
          <div className="flex items-end" style={{ lineHeight: 1 }}>
            {allLetters.map((letter, i) => {
              if (letter === null) return <div key="gap" style={{ width: '0.3em' }} />;

              // account for the null spacer when computing logical index
              const colorIdx = i <= 3 ? i : i - 1;
              const color = COLORS[colorIdx % COLORS.length];
              const tilt = colorIdx % 2 === 0 ? '-15deg' : '15deg';
              const delay = `${0.05 + colorIdx * 0.06}s`;

              return (
                <div
                  key={i}
                  className="font-black"
                  style={{
                    fontSize: 'clamp(3.2rem, 13vw, 6.5rem)',
                    color,
                    textShadow: `0 5px 0 ${color}55`,
                    fontFamily: 'var(--font-display, system-ui)',
                    letterSpacing: '-0.025em',
                    opacity: 0,
                    // @ts-ignore custom property
                    '--tilt': tilt,
                    animation: `wd-letter 0.65s cubic-bezier(0.34,1.56,0.64,1) ${delay} forwards`,
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>

          {/* Task name badge */}
          {taskName && (
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-full"
              style={{
                background: '#f0fdf4',
                border: '2px solid #86efac',
                opacity: 0,
                animation: 'wd-badge 0.4s ease-out 0.65s forwards',
              }}
            >
              <span style={{ fontSize: '1rem' }}>✅</span>
              <span
                className="font-bold text-sm truncate max-w-[260px]"
                style={{ color: '#166534', fontFamily: 'var(--font-mono, monospace)' }}
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
