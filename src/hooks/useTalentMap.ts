import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Talent } from '@/engine/types';
import { selectTalentPool } from '@/store/selectors';

/**
 * Hook to create a Map of talent by ID for efficient lookups
 * @param talentPool - Optional talent array or record to use instead of game state
 * @returns Map of talent ID to talent object
 */
export function useTalentMap(talentPool?: Talent[] | Record<string, Talent>): Map<string, Talent> {
  const gameState = useGameStore(s => s.gameState);
  const pool = talentPool || selectTalentPool(gameState) || [];

  return useMemo(() => {
    // Handle both array and Record<string, Talent> inputs
    const poolArray = Array.isArray(pool) ? pool : Object.values(pool);
    return new Map(poolArray.map((t: Talent) => [t.id, t]));
  }, [pool]);
}

/**
 * Hook to create a Map of agencies by ID for efficient lookups
 * @returns Map of agency ID to agency object
 */
export function useAgencyMap(): Map<string, any> {
  const gameState = useGameStore(s => s.gameState);
  
  return useMemo(() => {
    const agencies = gameState?.industry?.agencies || [];
    const agenciesArray = Array.isArray(agencies) ? agencies : Object.values(agencies);
    return new Map(agenciesArray.map((a: any) => [a.id, a]));
  }, [gameState?.industry?.agencies]);
}
