import { createContext } from 'react';

interface ThemeContextType {
  archetype: string | undefined;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
