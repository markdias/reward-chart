import { create } from 'zustand';

export type AgeBand = '5-8' | '9-12' | '13-17';

interface AppState {
  ageBand: AgeBand | null;
  setAgeBand: (band: AgeBand | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  ageBand: null,
  setAgeBand: (band) => set({ ageBand: band }),
}));
