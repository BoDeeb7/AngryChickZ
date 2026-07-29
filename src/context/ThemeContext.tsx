'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'default' | 'black-gold' | 'red-black' | 'white-gold' | 'black-orange' | 'green-orange';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('default');

  useEffect(() => {
    const saved = localStorage.getItem('angry_chickz_theme') as ThemeType;
    if (saved) {
      setThemeState(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const setTheme = (t: ThemeType) => {
    setThemeState(t);
    localStorage.setItem('angry_chickz_theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
