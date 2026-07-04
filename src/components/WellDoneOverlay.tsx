import React from 'react';
import { Typography } from './ui/Typography';
import Confetti from './Confetti';

interface WellDoneOverlayProps {
  show: boolean;
  taskName?: string | null;
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
`;

// 16 floating particle positions
const PARTICLES = [
  { dx: '-160px', dy: '-130px', dr: '-40deg', delay: '0.0s', emoji: '⭐' },
  { dx:  '150px', dy: '-140px', dr:  '35deg', delay: '0.05s', emoji: '✨' },
  { dx: '-190px', dy:  '-20px', dr: '-55deg', delay: '0.08s', emoji: '🌟' },
  { dx:  '185px', dy:  '-25px', dr:  '50deg', delay: '0.03s', emoji: '💫' },
  { dx:  '-80px', dy: '-170px', dr: '-30deg', delay: '0.1s',  emoji: '⭐' },
  { dx:   '75px', dy: '-175px', dr:  '45deg', delay: '0.12s', emoji: '✨' },
  { dx: '-170px', dy:  '100px', dr: '-60deg', delay: '0.06s', emoji: '🌟' },
  { dx:  '165px', dy:  '105px', dr:  '55deg', delay: '0.09s', emoji: '💫' },
  { dx:  '-40px', dy:  '180px', dr: '-20deg', delay: '0.14s', emoji: '⭐' },
  { dx:   '45px', dy:  '185px', dr:  '25deg', delay: '0.07s', emoji: '✨' },
  { dx: '-120px', dy:  '150px', dr: '-45deg', delay: '0.11s', emoji: '🌟' },
  { dx:  '115px', dy:  '155px', dr:  '40deg', delay: '0.04s', emoji: '⭐' },
  { dx: '-200px', dy:   '55px', dr: '-70deg', delay: '0.13s', emoji: '💫' },
  { dx:  '195px', dy:   '60px', dr:  '65deg', delay: '0.02s', emoji: '✨' },
  { dx:  '-90px', dy: '-160px', dr: '-35deg', delay: '0.15s', emoji: '🌟' },
  { dx:   '85px', dy: '-165px', dr:  '30deg', delay: '0.01s', emoji: '⭐' },
];

export default function WellDoneOverlay({ show, taskName }: WellDoneOverlayProps) {
  if (!show) return null;

  const textStyle = (anim: string, delay: string): React.CSSProperties => ({
    display: 'block',
    fontFamily: '"Nunito", sans-serif',
    fontWeight: 900,
    fontSize: 'clamp(5rem, 21vw, 10.5rem)',
    lineHeight: 0.92,
    color: '#FFFFFF',
    WebkitTextStroke: '3px #EA580C',
    textShadow: [
      '0px 6px 0 #C2410C',
      '0px 12px 24px rgba(234,88,12,0.4)',
    ].join(', '),
    opacity: 0,
    animation: `${anim} 0.55s cubic-bezier(0.34,1.4,0.64,1) ${delay} forwards`,
    letterSpacing: '-0.02em',
  });

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Full-screen dark overlay */}
      <div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{
          background: 'radial-gradient(circle at center, rgba(254,240,138,0.85) 0%, rgba(253,186,116,0.95) 100%)',
          backdropFilter: 'blur(8px)',
          animation: 'wd-bg-in 0.22s ease-out forwards',
        }}
        aria-hidden
      >
        {/* Rotating sunburst rays */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: '200vmax',
            height: '200vmax',
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(234,88,12,0.15) 10deg, transparent 20deg, transparent 30deg, rgba(234,88,12,0.1) 40deg, transparent 50deg, transparent 60deg, rgba(234,88,12,0.15) 70deg, transparent 80deg, transparent 90deg, rgba(234,88,12,0.1) 100deg, transparent 110deg, transparent 120deg, rgba(234,88,12,0.15) 130deg, transparent 140deg, transparent 150deg, rgba(234,88,12,0.1) 160deg, transparent 170deg, transparent 180deg, rgba(234,88,12,0.15) 190deg, transparent 200deg, transparent 210deg, rgba(234,88,12,0.1) 220deg, transparent 230deg, transparent 240deg, rgba(234,88,12,0.15) 250deg, transparent 260deg, transparent 270deg, rgba(234,88,12,0.1) 280deg, transparent 290deg, transparent 300deg, rgba(234,88,12,0.15) 310deg, transparent 320deg, transparent 330deg, rgba(234,88,12,0.1) 340deg, transparent 350deg)',
            animation: 'wd-rays 12s linear infinite',
          }}
        />

        {/* Floating star particles bursting outward */}
        <div className="absolute" style={{ top: '50%', left: '50%' }}>
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                fontSize: i % 3 === 0 ? '1.8rem' : i % 3 === 1 ? '1.3rem' : '1.05rem',
                opacity: 0,
                // @ts-ignore
                '--dx': p.dx,
                '--dy': p.dy,
                '--dr': p.dr,
                animation: `wd-float-star 1.4s ease-out ${p.delay} forwards`,
              }}
            >
              {p.emoji}
            </div>
          ))}
        </div>

        {/* Central content */}
        <div className="relative flex flex-col items-center gap-3 text-center z-10">

          {/* Trophy bounces in first */}
          <div
            style={{
              fontSize: 'clamp(3.5rem, 12vw, 6rem)',
              lineHeight: 1,
              opacity: 0,
              filter: 'drop-shadow(0 8px 20px rgba(255,215,0,0.6))',
              animation: 'wd-star 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.05s forwards',
            }}
          >
            🏆
          </div>

          {/* WELL */}
          <span style={textStyle('wd-well', '0.18s')}>WELL</span>

          {/* DONE! */}
          <span style={textStyle('wd-done', '0.28s')}>DONE!</span>

          {/* Task name */}
          {taskName && (
            <div
              style={{
                marginTop: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '999px',
                background: 'white',
                border: '2px solid #FDBA74',
                boxShadow: '0 4px 12px rgba(234,88,12,0.15)',
                opacity: 0,
                animation: 'wd-badge 0.4s ease-out 0.6s forwards',
              }}
            >
              <span style={{ fontSize: '1rem' }}>✅</span>
              <span
                style={{
                  color: '#9A3412',
                  fontFamily: '"Nunito", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.02em',
                  maxWidth: '260px',
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
