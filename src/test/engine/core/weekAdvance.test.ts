import { describe, it, expect } from 'vitest';
import { GameState } from '@/engine/types';
import { advanceWeek } from '@/engine/core/weekAdvance';

describe('Week Advance Pipeline (Target A4)', () => {
  const mockState = {
    week: 1,
    finance: { cash: 1000000, ledger: [] },
    studio: { 
      internal: { projects: {}, contracts: [] },
      prestige: 50
    },
    industry: { 
      rivals: [],
      talentPool: {},
      newsHistory: []
    },
    market: { trends: [] },
    history: []
  } as unknown as GameState;

  it('should process the week and return a summarized result', () => {
    const { newState, summary } = advanceWeek(mockState);
    
    expect(newState.week).toBe(2);
    expect(summary.fromWeek).toBe(1);
    expect(summary.toWeek).toBe(2);
    expect(newState).not.toBe(mockState);
  });
});
