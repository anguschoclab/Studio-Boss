import { describe, it, expect } from 'vitest';
import { evaluateMarketingEfficiency } from '../../../../engine/systems/marketing/efficiencyEvaluator';
import { Project, MarketingCampaign } from '../../../../engine/types';

describe('evaluateMarketingEfficiency', () => {
  const createMockProject = (genre: string, budget: number): Project => ({
      id: 'p1',
      title: 'Mock Project',
      type: 'FILM',
      format: 'film',
      genre,
      budgetTier: 'mid',
      budget,
      weeklyCost: 1000000,
      targetAudience: 'General',
      flavor: 'Mock Flavor',
      state: 'marketing',
      buzz: 50,
      weeksInPhase: 1,
      developmentWeeks: 10,
      productionWeeks: 10,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: null,
      activeCrisis: null,
      momentum: 50,
      progress: 100,
      accumulatedCost: budget,
      contentFlags: [],
      scriptHeat: 50,
      activeRoles: [],
      scriptEvents: []
  } as Project);

  it('penalizes mismatching angles (e.g. Spectacle for an Indie Drama)', () => {
    const project = createMockProject('Drama', 5_000_000);
    const campaign: MarketingCampaign = { 
      domesticBudget: 10_000_000, 
      foreignBudget: 0, 
      primaryAngle: 'SELL_THE_SPECTACLE'
    };
    
    const result = evaluateMarketingEfficiency(project, campaign);
    expect(result.multiplier).toBeLessThan(1.2); // Base 1.0 - 0.15 + 0.1 (budget) = 0.95
    expect(result.feedbackText).toMatch(/misleading/i);
  });

  it('boosts matching angles (e.g. Family Adventure for Animation)', () => {
    const project = createMockProject('Animation', 50_000_000);
    const campaign: MarketingCampaign = { 
      domesticBudget: 20_000_000, 
      foreignBudget: 20_000_000, 
      primaryAngle: 'FAMILY_ADVENTURE'
    };
    
    const result = evaluateMarketingEfficiency(project, campaign);
    // Base 1.0 + 0.2 (angle) + 0.1 (budget) = 1.3
    expect(result.multiplier).toBeGreaterThan(1.1); 
  });

  it('applies decay if marketing phase lasts too long (e.g., 6 weeks)', () => {
    const project = createMockProject('Action', 100_000_000);
    const campaign: MarketingCampaign = { 
        domesticBudget: 50_000_000, 
        foreignBudget: 50_000_000, 
        primaryAngle: 'SELL_THE_SPECTACLE',
        weeksInMarketing: 6 
    };

    const result = evaluateMarketingEfficiency(project, campaign);
    // Match: +0.2, Budget: +0.1 -> 1.3
    // 2 weeks overdue: 0.95 * 0.95 = 0.9025
    // 1.3 * 0.9025 = 1.17
    expect(result.multiplier).toBeLessThan(1.3);
    expect(result.feedbackText).toMatch(/sour/i);
  });
});
