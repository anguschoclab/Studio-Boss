import { describe, it, expect } from 'vitest';
import {
  selectLatestSnapshot,
  selectRecoupmentMap,
  selectMarketMetrics,
} from '@/store/selectors';
import type { GameState } from '@/engine/types';

// Minimal GameState shape exercised by these three selectors.
function makeState(over: Partial<any> = {}): GameState {
  return {
    finance: {
      cash: 1000,
      weeklyHistory: [
        { week: 1, revenue: { theatrical: 10, streaming: 5, merch: 2, passive: 1 }, expenses: { production: 3, burn: 1, marketing: 1, royalties: 0, interest: 0 }, net: 13, cash: 1000 },
      ],
      marketState: { baseRate: 0.04, savingsYield: 0.03, debtRate: 0.06, loanRate: 0.08, rateHistory: [] },
      ledger: [],
    },
    entities: { projects: {} },
    ...over,
  } as unknown as GameState;
}

describe('restored selectors', () => {
  it('selectLatestSnapshot returns the last weekly snapshot', () => {
    expect(selectLatestSnapshot(makeState())?.week).toBe(1);
  });

  it('selectLatestSnapshot returns null when no history', () => {
    const s = makeState({ finance: { weeklyHistory: [], marketState: {}, cash: 0, ledger: [] } });
    expect(selectLatestSnapshot(s)).toBeNull();
  });

  it('selectMarketMetrics exposes a numeric sentiment and the real rate fields', () => {
    const m = selectMarketMetrics(makeState());
    expect(typeof m.sentiment).toBe('number');
    expect(m.debtRate).toBe(0.06);
    expect(m.savingsRate).toBe(0.03);
  });

  it('selectRecoupmentMap returns a record keyed by released project id', () => {
    const s = makeState({
      entities: { projects: { p1: { id: 'p1', state: 'released', revenue: 200, accumulatedCost: 100 } } },
    });
    const map = selectRecoupmentMap(s);
    expect(map.p1).toBeCloseTo(200, 0);
  });
});
