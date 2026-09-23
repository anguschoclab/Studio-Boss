import {StateCreator} from "zustand";
import {GameStore} from "../gameStore";
import {WeeklyFinancialReport} from "@/engine/types";
import {FinancialSnapshot} from "@/engine/types/state.types";

export interface FinanceSlice {
  addLedgerEntry: (report: WeeklyFinancialReport) => void;
  addFunds: (amount: number) => void;
}

export const createFinanceSlice: StateCreator<GameStore, [], [], FinanceSlice> = (set, _get) => ({
  addLedgerEntry: (report: WeeklyFinancialReport) =>
    set((state) => {
      if (!state.gameState) return state;
      const snapshot: FinancialSnapshot = {
        week: report.week,
        revenue: {
          theatrical: report.revenue.boxOffice,
          streaming: report.revenue.distribution,
          merch: report.revenue.other,
          passive: 0,
        },
        expenses: {
          production: report.expenses.production,
          burn: report.expenses.overhead,
          marketing: report.expenses.marketing,
          royalties: 0,
          interest: 0,
        },
        net: report.netProfit,
        cash: report.endingCash,
      };

      return {
        gameState: {
          ...state.gameState,
          finance: {
            ...state.gameState.finance,
            cash: report.endingCash,
            ledger: [report, ...state.gameState.finance.ledger].slice(0, 100),
            weeklyHistory: [snapshot, ...state.gameState.finance.weeklyHistory].slice(0, 52),
          },
        },
      };
    }),

  addFunds: (amount) => {
    set((s) => {
      if (!s.gameState) return s;
      const newCash = s.gameState.finance.cash + amount;
      return {
        gameState: {
          ...s.gameState,
          finance: {
            ...s.gameState.finance,
            cash: newCash,
          },
        },
      };
    });
  },
});
