import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'midnight' | 'monochrome';

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode | ((prev: ThemeMode) => ThemeMode)) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'midnight',
  setThemeMode: () => {},
  isDark: true,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('localserve_theme_mode');
    return saved === 'monochrome' ? 'monochrome' : 'midnight';
  });

  const setThemeMode = (mode: ThemeMode | ((prev: ThemeMode) => ThemeMode)) => {
    setThemeModeState((prev) => {
      const next = typeof mode === 'function' ? mode(prev) : mode;
      localStorage.setItem('localserve_theme_mode', next);
      return next;
    });
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'midnight' ? 'monochrome' : 'midnight'));
  };

  const isDark = themeMode === 'midnight';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeMode);
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [themeMode, isDark]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
