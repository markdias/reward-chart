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
    name: 'Modern Gamified Light',
    emoji: '📱',
    description: 'Clean, modern light mode with vibrant gamified accents and soft shadows.',
    bodyBg: 'bg-[#F5F2EA] text-[#292524]',
    textColor: 'text-[#292524]',
    textMuted: 'text-[#78716C]',
    cardBg: 'bg-white rounded-3xl shadow-lg shadow-orange-900/5 border border-stone-100 text-[#292524] dashboard-card',
    headerBg: 'bg-white/90 border-b border-stone-100 backdrop-blur-md',
    btnPrimary: 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all uppercase tracking-wider rounded-2xl border-none',
    btnSecondary: 'bg-white border border-stone-200 text-stone-700 shadow-sm hover:bg-stone-50 active:scale-[0.98] transition-all rounded-2xl',
    tabActive: 'bg-rose-400 text-white shadow-md shadow-rose-400/30 font-bold rounded-2xl',
    tabInactive: 'text-stone-400 hover:text-stone-600 bg-transparent',
    inputBg: 'bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 placeholder-[#A8A29E] focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:outline-none transition-all',
    accentGlow: 'bg-orange-100/40 opacity-50',
    tagCategory: 'text-orange-600 bg-orange-50 border border-orange-100 font-bold uppercase rounded-full',
    gridStyle: 'scrolling-grid opacity-[0.03]',
    innerCard: 'bg-stone-50 border border-stone-100 rounded-2xl',
    titleGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent',
    divider: 'border-stone-100',
    overlayCrt: 'hidden',
    titleColor: 'text-[#1C1917]',
    borderStyle: 'border-stone-200'
  }
};
