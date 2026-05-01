import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { WeeklyFinancialReport, FinanceState } from '@/engine/types';
import { FinancialSnapshot } from '@/engine/types/state.types';
import { type SnapshotId } from '@/engine/types/shared.types';
import { RandomGenerator } from '@/engine/utils/rng';

export interface FinanceLedgerSlice {
  addLedgerEntry: (report: WeeklyFinancialReport) => void;
}

export const createFinanceLedgerSlice: StateCreator<GameStore, [], [], FinanceLedgerSlice> = (set) => ({
  addLedgerEntry: (report: WeeklyFinancialReport) =>
    set((state) => {
      const gs = state.gameState;
      if (!gs) return state;
      const snapshot: FinancialSnapshot = {
        id: new RandomGenerator(gs.rngState).uuid('SNP') as SnapshotId,
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
          pacts: 0,
          royalties: 0,
          interest: 0,
        },
        net: report.netProfit,
        cash: report.endingCash
      };

      return {
        finance: {
          ...state.finance,
          cash: report.endingCash,
          ledger: [report, ...state.finance.ledger].slice(0, 100),
          weeklyHistory: [snapshot, ...state.finance.weeklyHistory].slice(0, 52),
        },
        gameState: {
          ...gs,
          finance: {
            ...gs.finance,
            cash: report.endingCash,
            ledger: [report, ...gs.finance.ledger].slice(0, 100),
            weeklyHistory: [snapshot, ...gs.finance.weeklyHistory].slice(0, 52),
          },
        },
      };
    })
});
