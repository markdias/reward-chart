import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  isDarkMode: boolean;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('RCH_THEME_PREF') as ThemePreference | null;
    if (!saved) {
      const oldSaved = localStorage.getItem('RCH_DARK_MODE');
      if (oldSaved !== null) {
        return oldSaved === 'true' ? 'dark' : 'light';
      }
    }
    return saved || 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('RCH_THEME_PREF', themePreference);
    
    let isDark = false;
    if (themePreference === 'dark') {
      isDark = true;
    } else if (themePreference === 'system') {
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themePreference]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (themePreference === 'system') {
        const isDark = e.matches;
        setIsDarkMode(isDark);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
