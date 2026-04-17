import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { FinanceState } from '@/engine/types';
import { InterestRateSimulator } from '@/engine/systems/market/InterestRateSimulator';

export interface FinanceUtilsSlice {
  finance: FinanceState;
  addFunds: (amount: number) => void;
}

export const createFinanceUtilsSlice: StateCreator<GameStore, [], [], FinanceUtilsSlice> = (set) => ({
  finance: {
    cash: 0,
    ledger: [],
    weeklyHistory: [],
    marketState: InterestRateSimulator.initialize(),
  },

  addFunds: (amount) => {
    set((s) => {
      if (!s.gameState) return s;
      const newCash = s.finance.cash + amount;
      return {
        finance: {
          ...s.finance,
          cash: newCash
        },
        gameState: {
          ...s.gameState,
          finance: {
            ...s.gameState.finance,
            cash: newCash
          }
        }
      };
    });
  }
});
