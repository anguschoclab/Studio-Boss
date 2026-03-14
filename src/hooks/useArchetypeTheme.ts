import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useArchetypeTheme() {
  const gameState = useGameStore(s => s.gameState);

  useEffect(() => {
    // Remove all existing theme classes
    document.documentElement.classList.remove('theme-major', 'theme-mid-tier', 'theme-indie');

    // Add the appropriate theme class
    if (gameState?.studio?.archetype) {
      document.documentElement.classList.add(`theme-${gameState.studio.archetype}`);
    }
  }, [gameState?.studio?.archetype]);
}
