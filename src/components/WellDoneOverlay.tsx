import React, { useEffect, useRef } from 'react';
import { animate, stagger, spring } from 'animejs';
import Confetti from './Confetti';

interface WellDoneOverlayProps {
  show: boolean;
  taskName?: string | null;
}

export default function WellDoneOverlay({ show, taskName }: WellDoneOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !overlayRef.current || !lettersRef.current) return;

    const overlay = overlayRef.current;
    const letterEls = Array.from(lettersRef.current.querySelectorAll<HTMLElement>('.wd-letter'));
    const badge = badgeRef.current;
    const burst = burstRef.current;

    // Reset to invisible
    overlay.style.opacity = '0';
    letterEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(60px) scale(0.4) rotate(var(--tilt))';
    });
    if (badge) { badge.style.opacity = '0'; badge.style.transform = 'translateY(16px)'; }
    if (burst) { burst.style.transform = 'scale(0)'; burst.style.opacity = '0'; }

    // 1. Fade in overlay
    animate(overlay, { opacity: [0, 1], duration: 180, easing: 'easeOutQuad' });

    // 2. Burst background pulse
    if (burst) {
      animate(burst, {
        scale: [0, 1.15, 1],
        opacity: [0, 0.9, 0.7],
        duration: 600,
        easing: spring({ stiffness: 180, damping: 14 }),
      });
    }

    // 3. Letters bounce in with stagger
    animate(letterEls, {
      opacity: [0, 1],
      translateY: [60, 0],
      scale: [0.4, 1.15, 1],
      rotate: ['var(--tilt)', '4deg', '0deg'],
      duration: 700,
      delay: stagger(55, { start: 80 }),
      easing: spring({ stiffness: 320, damping: 12 }),
    });

    // 4. Badge slides up
    if (badge && taskName) {
      animate(badge, {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 420,
        delay: 580,
        easing: 'easeOutBack',
      });
    }
  }, [show, taskName]);

  if (!show) return null;

  const word1 = 'WELL'.split('');
  const word2 = 'DONE!'.split('');
  // Vibrant colour palette per letter
  const colors = ['#FF5757', '#FF9A3C', '#FFD166', '#06D6A0', '#4CC9F0', '#B5179E', '#FF5757', '#FF9A3C', '#FFD166'];

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none select-none"
        style={{ opacity: 0 }}
        aria-hidden
      >
        {/* Soft radial burst behind card */}
        <div
          ref={burstRef}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 560,
            height: 560,
            background: 'radial-gradient(circle at 50% 50%, rgba(253,224,71,0.55) 0%, rgba(244,114,182,0.35) 45%, transparent 72%)',
            transform: 'scale(0)',
            opacity: 0,
          }}
        />

        {/* Card */}
        <div
          className="relative flex flex-col items-center gap-4 px-12 py-10 rounded-[2.5rem] bg-white"
          style={{
            border: '5px solid #FFD166',
            boxShadow: '0 0 0 6px #FF9A3C33, 0 24px 80px rgba(0,0,0,0.22)',
          }}
        >
          {/* Letters */}
          <div ref={lettersRef} className="flex items-end gap-0" style={{ lineHeight: 1 }}>
            {word1.map((letter, i) => (
              <div
                key={`w1-${i}`}
                className="wd-letter font-black"
                style={{
                  fontSize: 'clamp(3.5rem, 14vw, 7rem)',
                  color: colors[i % colors.length],
                  textShadow: `0 5px 0 ${colors[i % colors.length]}44`,
                  fontFamily: 'var(--font-display, system-ui)',
                  // @ts-ignore
                  '--tilt': i % 2 === 0 ? '-14deg' : '14deg',
                  letterSpacing: '-0.02em',
                  opacity: 0,
                }}
              >
                {letter}
              </div>
            ))}

            {/* Gap between WELL and DONE */}
            <div style={{ width: '0.4em' }} />

            {word2.map((letter, i) => {
              const gi = i + word1.length;
              return (
                <div
                  key={`w2-${i}`}
                  className="wd-letter font-black"
                  style={{
                    fontSize: 'clamp(3.5rem, 14vw, 7rem)',
                    color: colors[gi % colors.length],
                    textShadow: `0 5px 0 ${colors[gi % colors.length]}44`,
                    fontFamily: 'var(--font-display, system-ui)',
                    // @ts-ignore
                    '--tilt': gi % 2 === 0 ? '-14deg' : '14deg',
                    letterSpacing: '-0.02em',
                    opacity: 0,
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
              ref={badgeRef}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full"
              style={{
                background: '#f0fdf4',
                border: '2px solid #86efac',
                opacity: 0,
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>✅</span>
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
