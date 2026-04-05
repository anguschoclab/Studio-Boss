import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGameStore } from '@/store/gameStore';
import { FinancialSnapshot } from '@/engine/types/state.types';

/**
 * Hook for managing financial history via TanStack Query.
 * This "shreds" the heavy historical data from the main Zustand store,
 * reducing state transition overhead and allowing the data to be 
 * loaded and processed only when needed.
 */

const FINANCE_HISTORY_KEY = ['finance', 'history'];

export const useFinanceHistory = () => {
  const gameState = useGameStore(s => s.gameState);
  
  return useQuery({
    queryKey: FINANCE_HISTORY_KEY,
    queryFn: () => {
      // In a real-world scenario, this might fetch from IndexedDB or a Worker
      // For now, we fetch from the store's deep state if it exists
      return gameState?.finance.weeklyHistory || [];
    },
    // Keep data fresh relative to the game's tick count
    staleTime: Infinity, 
    enabled: !!gameState,
  });
};

/**
 * Utility to invalidate and refresh the finance history after a week tick.
 */
export const useRefreshFinanceHistory = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: FINANCE_HISTORY_KEY });
};
