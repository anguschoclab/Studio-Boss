import { useContext } from 'react';
import { ThemeContext } from '@/components/Theme/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a GlobalThemeProvider');
  }
  return context;
};
