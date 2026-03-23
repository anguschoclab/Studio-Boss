import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useGameStore } from '../../store/gameStore';

interface ThemeContextType {
  archetype: string | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a GlobalThemeProvider');
  }
  return context;
};

interface GlobalThemeProviderProps {
  children: ReactNode;
}

export const GlobalThemeProvider: React.FC<GlobalThemeProviderProps> = ({ children }) => {
  const archetype = useGameStore(s => s.gameState?.studio?.archetype);

  useEffect(() => {
    // Sync theme class to document element
    const themes = ['theme-major', 'theme-mid-tier', 'theme-indie'];
    document.documentElement.classList.remove(...themes);

    if (archetype) {
      document.documentElement.classList.add(`theme-${archetype}`);
    }
  }, [archetype]);

  return (
    <ThemeContext.Provider value={{ archetype }}>
      {children}
    </ThemeContext.Provider>
  );
};
