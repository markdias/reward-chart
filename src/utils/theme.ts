export type ThemeId = 'sunny_toybox';

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
  }
};
