import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { WeeklyFinancialReport } from '../../engine/types';

describe('financeSlice', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({
      gameState: {
        finance: {
          cash: 100000000,
          ledger: [],
          weeklyHistory: []
        }
      } as any
    });
  });

  it('should initialize with an empty ledger', () => {
    const state = useGameStore.getState().gameState;
    expect(state?.finance.ledger).toEqual([]);
  });

  it('should append a WeeklyFinancialReport to the ledger via addLedgerEntry', () => {
    const mockReport: WeeklyFinancialReport = {
      week: 1,
      year: 2026,
      startingCash: 100000000,
      revenue: { boxOffice: 5000000, distribution: 0, other: 0 },
      expenses: { production: 2000000, marketing: 1000000, overhead: 500000 },
      endingCash: 101500000,
      netProfit: 1500000,
    };

    // Assuming we add an action to the store
    (useGameStore.getState() as any).addLedgerEntry(mockReport);

    const state = useGameStore.getState().gameState;
    expect(state?.finance.ledger).toHaveLength(1);
    expect(state?.finance.ledger[0].netProfit).toBe(1500000);
    expect(state?.finance.cash).toBe(101500000);
  });
});
