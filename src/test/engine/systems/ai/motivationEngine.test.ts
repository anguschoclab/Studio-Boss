import { describe, it, expect } from 'vitest';
import { RivalStudio, GameState } from '@/engine/types';
import { calculateRivalMotivation } from '@/engine/systems/ai/motivationEngine';
import { RandomGenerator } from '@/engine/utils/rng';

describe('AI Motivation Engine (Target C1)', () => {
  const rng = new RandomGenerator(999);
  
  const mockRival: RivalStudio = {
    id: 'r1',
    name: 'Universal Pictures Clone',
    motto: 'Standard.',
    archetype: 'major',
    strength: 50,
    cash: 100_000, // Very low cash
    prestige: 80,
    foundedWeek: 0,
    motivationProfile: {
      financial: 50,
      prestige: 50,
      legacy: 50,
      aggression: 50
    },
    currentMotivation: 'STABILITY',
    projects: {},
    contracts: [],
    strategy: 'acquirer',
    projectCount: 5,
    recentActivity: 'Testing'
  } as RivalStudio;

  const mockState = {
    week: 1,
    gameSeed: 1,
    tickCount: 0,
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
      rivals: [mockRival],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {},
      newsHistory: [],
      rumors: []
    },
    culture: { genrePopularity: {} },
    history: [],
    eventHistory: []
  } as unknown as GameState;

  it("should switch to CASH_CRUNCH if cash is extremely low", () => {
    const nextMotivation = calculateRivalMotivation(mockRival, mockState, rng);
    expect(nextMotivation).toBe('CASH_CRUNCH');
  });

  it("should switch to AWARD_CHASE if prestige is high, cash is fine, and enough projects exist", () => {
    // We need to avoid FRANCHISE_BUILDING (95 base if projects < 2).
    // The engine evaluates rival.projectCount.
    const richRival: RivalStudio = { 
      ...mockRival, 
      cash: 50_000_000, 
      prestige: 90,
      projectCount: 3, // < 4, not < 2, so base = 40. Award chase should be higher
    };
    
    // AWARD_CHASE base = 80 (since prestige > 70). Profile bias = 50. Total 130 + var.
    // FRANCHISE_BUILDING base = 40 (since projects = 3). Profile bias = 50. Total 90 + var.
    // STABILITY base = 50. Profile bias = 50. Total 100 + var.
    // AWARD_CHASE wins.
    const nextMotivation = calculateRivalMotivation(richRival, mockState, rng);
    expect(nextMotivation).toBe('AWARD_CHASE');
  });
});
