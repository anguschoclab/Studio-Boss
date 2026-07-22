import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import {
  WeeklyFinancialReport,
  FinanceState,
  Contract,
  Project,
  Buyer,
  RivalStudio,
} from "@/engine/types";
import { FinancialSnapshot } from "@/engine/types/state.types";import { InterestRateSimulator } from "@/engine/systems/market/InterestRateSimulator";

export interface FinanceSlice {
  finance: FinanceState;
  addLedgerEntry: (report: WeeklyFinancialReport) => void;
  executeMarketingEvent: (
    eventName: "superbowl_ad" | "viral_campaign" | "press_tour",
    cost: number,
    projectId: string
  ) => void;
  addFunds: (amount: number) => void;
}

export const createFinanceSlice: StateCreator<GameStore, [], [], FinanceSlice> = (set, _get) => ({
  finance: {
    cash: 0,
    ledger: [],
    weeklyHistory: [],
    marketState: InterestRateSimulator.initialize(),
  },

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
        finance: {
          ...state.finance,
          cash: report.endingCash,
          ledger: [report, ...state.finance.ledger].slice(0, 100),
          weeklyHistory: [snapshot, ...state.finance.weeklyHistory].slice(0, 52),
        },
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

  executeMarketingEvent: (_eventName, cost, projectId) => {
    // Marketing event executed
  },

  addFunds: (amount) => {
    set((s) => {
      if (!s.gameState) return s;
      const newCash = s.finance.cash + amount;
      return {
        finance: {
          ...s.finance,
          cash: newCash,
        },
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
