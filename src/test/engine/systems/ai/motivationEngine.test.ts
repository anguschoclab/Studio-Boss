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
    // We need to avoid FRANCHISE_BUILDING and MARKET_DISRUPTION
    // So we add 5 projects to the richRival, and adjust profile so they don't get massive boosts
    const richRival: RivalStudio = { 
      ...mockRival, 
      cash: 50_000_000, 
      prestige: 90,
      projectCount: 5,
      motivationProfile: {
        financial: 50,
        prestige: 100, // heavily bias towards prestige
        legacy: 0,     // heavily bias away from franchise
        aggression: 0  // heavily bias away from market disruption
      },
      projects: { 'p1': {} as any, 'p2': {} as any, 'p3': {} as any, 'p4': {} as any, 'p5': {} as any }
    };
    
    // AWARD_CHASE base = 85 (since prestige > 80) + 20 (profile prestige > 70) = 105. Profile bias = 100. Total 205 + var.
    // FRANCHISE_BUILDING base = 80 (since projectCount > 4). Profile bias = 0. Total 80 + var.
    // MARKET_DISRUPTION base = 15 (since aggression < 75) + 30 (cash > 20M) = 45. Profile bias = 0. Total 45 + var.
    // STABILITY base = 10. Profile bias = 50. Total 60 + var.
    // AWARD_CHASE wins.
    const nextMotivation = calculateRivalMotivation(richRival, mockState, rng);
    expect(nextMotivation).toBe('AWARD_CHASE');
  });
});
