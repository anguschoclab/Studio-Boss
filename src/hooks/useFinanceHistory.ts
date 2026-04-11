import { useGameStore } from '@/store/gameStore';
import { FinancialSnapshot } from '@/engine/types/state.types';

/**
 * Hook for accessing financial history from Zustand store.
 * This provides direct access to the historical financial data.
 */

export const useFinanceHistory = (): FinancialSnapshot[] => {
  const gameState = useGameStore(s => s.gameState);
  return gameState?.finance.weeklyHistory || [];
};

/**
 * Utility to refresh finance history (no-op with Zustand, data updates automatically).
 * Kept for API compatibility.
 */
export const useRefreshFinanceHistory = () => {
  return () => {
    // With Zustand, data updates automatically when the store changes
    // This is a no-op for compatibility
  };
};
