import { describe, it, expect } from 'vitest';
import { evaluateMarketingEfficiency } from '@/engine/systems/marketing/efficiencyEvaluator';
import { Project, MarketingCampaign } from '../../../../engine/types';

describe('evaluateMarketingEfficiency', () => {
  it('penalizes mismatching angles (e.g. Spectacle for an Indie Drama)', () => {
    const project = { genre: 'Drama', budget: 5000000 } as Project;
    const campaign: MarketingCampaign = { 
      domesticBudget: 10000000, 
      foreignBudget: 0, 
      primaryAngle: 'SELL_THE_SPECTACLE' 
    };
    
    const result = evaluateMarketingEfficiency(project, campaign);
    expect(result.multiplier).toBeLessThan(1.0); // Wasted money
    expect(result.feedbackText).toMatch(/misleading/i);
  });

  it('boosts matching angles (e.g. Family Adventure for Animation)', () => {
    const project = { genre: 'Animation', budget: 50000000 } as Project;
    const campaign: MarketingCampaign = { 
      domesticBudget: 20000000, 
      foreignBudget: 20000000, 
      primaryAngle: 'FAMILY_ADVENTURE' 
    };
    
    const result = evaluateMarketingEfficiency(project, campaign);
    expect(result.multiplier).toBeGreaterThan(1.1); 
  });

  it('applies decay if marketing phase lasts too long (e.g., 6 weeks)', () => {
    const project = { genre: 'Action', budget: 100000000 } as Project;
    const campaign: MarketingCampaign = { 
        domesticBudget: 50000000, 
        foreignBudget: 50000000, 
        primaryAngle: 'SELL_THE_SPECTACLE',
        weeksInMarketing: 6 // 2 weeks over the 4-week limit
    };

    const result = evaluateMarketingEfficiency(project, campaign);
    // Base might be 1.2, but 2 weeks of 5% decay (0.95 * 0.95 = 0.9025)
    // 1.2 * 0.9025 = 1.083
    expect(result.multiplier).toBeLessThan(1.2);
  });
});
