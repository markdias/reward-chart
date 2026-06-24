export type ThemeId = 'cosmic_dark' | 'sunny_toybox' | 'cyber_synth';

export interface ThemeStyles {
  id: ThemeId;
  name: string;
  emoji: string;
  description: string;
  bodyBg: string;
  textColor: string;
  textMuted: string;
  cardBg: string;
  headerBg: string;
  btnPrimary: string;
  btnSecondary: string;
  tabActive: string;
  tabInactive: string;
  inputBg: string;
  accentGlow: string;
  tagCategory: string;
  gridStyle: string;
  innerCard: string;
  titleGradient: string;
  divider: string;
  overlayCrt: string;
  titleColor: string;
  borderStyle: string;
}

export const THEME_PRESETS: Record<ThemeId, ThemeStyles> = {
  cosmic_dark: {
    id: 'cosmic_dark',
    name: 'Cosmic Dark Arcade',
    emoji: '🌌',
    description: 'Immersive dark arcade cabinet with glowing retro neon indicators.',
    bodyBg: 'bg-[#060814] text-slate-100',
    textColor: 'text-slate-100',
    textMuted: 'text-slate-400',
    cardBg: 'bg-[#090c23]/90 border border-indigo-950/80 shadow-2xl rounded-3xl',
    headerBg: 'bg-[#070919]/90 border-b border-indigo-950/60 backdrop-blur-md',
    btnPrimary: 'bg-gradient-to-r from-cyan-400 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black shadow-lg shadow-cyan-500/10 active:scale-95',
    btnSecondary: 'bg-slate-950 border border-indigo-950 hover:bg-slate-900 text-slate-300 hover:text-white',
    tabActive: 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-md',
    tabInactive: 'text-slate-400 hover:text-slate-200 bg-slate-950/40 hover:bg-slate-950/80',
    inputBg: 'bg-slate-950 border border-indigo-950 text-slate-100 placeholder-slate-700 focus:border-cyan-400',
    accentGlow: 'ambient-glow-cyan opacity-100',
    tagCategory: 'text-cyan-400 bg-cyan-950/60 border border-cyan-900/30 font-bold',
    gridStyle: 'scrolling-grid-cyan opacity-[0.08]',
    innerCard: 'bg-slate-950/80 border border-indigo-950/50 rounded-2xl',
    titleGradient: 'bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent',
    divider: 'border-indigo-950/50',
    overlayCrt: 'crt-overlay opacity-25',
    titleColor: 'text-white',
    borderStyle: 'border-indigo-950/80'
  },
  sunny_toybox: {
    id: 'sunny_toybox',
    name: 'Sunny Toybox Light',
    emoji: '🧸',
    description: 'Cozy cream-colored light playground reminiscent of Nintendo consoles.',
    bodyBg: 'bg-[#FAF7EE] text-[#292524]',
    textColor: 'text-[#292524]',
    textMuted: 'text-[#78716C]',
    cardBg: 'bg-white border-3 border-[#E7E5E4] shadow-[0_6px_0_0_#E7E5E4] rounded-3xl text-[#292524]',
    headerBg: 'bg-white/95 border-b-3 border-[#E7E5E4] backdrop-blur-md',
    btnPrimary: 'bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold border-2 border-stone-900 shadow-[0_4px_0_0_#1c1917] active:translate-y-1 active:shadow-none active:scale-95 transition-all uppercase',
    btnSecondary: 'bg-white border-2 border-[#E7E5E4] text-[#292524] shadow-[0_3px_0_0_#E7E5E4] hover:bg-stone-50 active:translate-y-[2px] active:shadow-none',
    tabActive: 'bg-amber-400 text-stone-900 font-extrabold border-2 border-stone-900 shadow-inner',
    tabInactive: 'text-[#78716C] hover:text-[#292524] bg-stone-100/60 border border-stone-200/80',
    inputBg: 'bg-stone-50 border-2 border-[#E7E5E4] text-stone-900 placeholder-[#A8A29E] focus:border-amber-400 focus:outline-none',
    accentGlow: 'bg-amber-100/40 opacity-50',
    tagCategory: 'text-amber-800 bg-amber-50 border border-amber-200/80 font-extrabold uppercase',
    gridStyle: 'scrolling-grid opacity-[0.03]',
    innerCard: 'bg-[#F5F2EA] border border-[#E7E5E4]/80 rounded-2xl',
    titleGradient: 'bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent',
    divider: 'border-stone-200',
    overlayCrt: 'hidden',
    titleColor: 'text-[#1C1917]',
    borderStyle: 'border-stone-200'
  },
  cyber_synth: {
    id: 'cyber_synth',
    name: 'Cyber Synth Light',
    emoji: '🎛️',
    description: 'Sleek, high-contrast platinum white gadget hardware style with vivid cyan alerts.',
    bodyBg: 'bg-[#F1F3F9] text-slate-800',
    textColor: 'text-slate-800',
    textMuted: 'text-slate-500',
    cardBg: 'bg-white border border-slate-200 shadow-md rounded-3xl text-slate-800 shadow-slate-200/80',
    headerBg: 'bg-white/95 border-b border-slate-200 backdrop-blur-md',
    btnPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-white font-extrabold shadow-sm hover:shadow-cyan-500/20 active:scale-95',
    btnSecondary: 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100',
    tabActive: 'bg-cyan-500 text-white font-extrabold shadow-md',
    tabInactive: 'text-slate-500 hover:text-slate-800 bg-slate-100/70 border border-slate-200/40',
    inputBg: 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none',
    accentGlow: 'ambient-glow-cyan opacity-40',
    tagCategory: 'text-cyan-600 bg-cyan-50 border border-cyan-200/60 font-extrabold uppercase',
    gridStyle: 'scrolling-grid-cyan opacity-[0.06]',
    innerCard: 'bg-slate-50 border border-slate-200/60 rounded-2xl',
    titleGradient: 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent',
    divider: 'border-slate-200',
    overlayCrt: 'hidden',
    titleColor: 'text-slate-900',
    borderStyle: 'border-slate-200/60'
  }
};
