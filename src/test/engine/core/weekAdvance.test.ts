import { describe, it, expect } from 'vitest';
import { GameState, Talent } from '@/engine/types';
import { advanceWeek } from '@/engine/core/weekAdvance';

describe('Week Advance Pipeline (Target A4)', () => {
  const mockState = {
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    projects: { active: [] },
    game: { currentWeek: 1 },
    finance: { cash: 1_000_000, ledger: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    studio: {
      name: 'Player Studio',
      archetype: 'major',
      prestige: 50,
      internal: { projects: {}, contracts: [] }
    },
    market: { opportunities: [], buyers: [] },
    industry: {
      rivals: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {} as Record<string, Talent>,
      newsHistory: [],
      rumors: []
    },
    culture: { genrePopularity: {} },
    history: [],
    eventHistory: []
  } as unknown as GameState;

  it('should process the week and return a summarized result', () => {
    const { newState, summary } = advanceWeek(mockState);
    
    expect(newState.week).toBe(2);
    expect(summary.fromWeek).toBe(1);
    expect(summary.toWeek).toBe(2);
    expect(newState).not.toBe(mockState);
  });
});
