import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export function useArchetypeTheme() {
  const gameState = useGameStore(s => s.gameState);

  useEffect(() => {
    if (!gameState) return;

    const archetype = gameState.studio.archetype;
    const body = document.body;

    body.classList.remove('theme-major', 'theme-mid-tier', 'theme-indie');
    body.classList.add(`theme-${archetype}`);
  }, [gameState]);
}
