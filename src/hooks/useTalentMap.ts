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

  // Memoize defaultPool
  const defaultPool = useMemo(() => selectTalentPool(gameState) || [], [gameState]);

  return useMemo(() => {
    const pool = talentPool || defaultPool;
    // Handle both array and Record<string, Talent> inputs
    const poolArray = Array.isArray(pool) ? pool : Object.values(pool);
    return new Map(poolArray.map((t: Talent) => [t.id, t]));
  }, [talentPool, defaultPool]);
}

/**
 * Hook to create a Map of agencies by ID for efficient lookups
 * @returns Map of agency ID to agency object
 */
// Use unknown to fix any type error
export function useAgencyMap(): Map<string, unknown> {
  const gameState = useGameStore(s => s.gameState);
  
  return useMemo(() => {
    const agencies = gameState?.industry?.agencies || [];
    const agenciesArray = Array.isArray(agencies) ? agencies : Object.values(agencies);
    return new Map(agenciesArray.map((a: unknown) => [(a as {id: string}).id, a]));
  }, [gameState?.industry?.agencies]);
}
