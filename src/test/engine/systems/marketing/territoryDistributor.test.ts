import { describe, it, expect } from 'vitest';
import { calculateTerritorySplit } from '../../../../engine/systems/marketing/territoryDistributor';
import { MarketingCampaign } from '../../../../engine/types';

describe('calculateTerritorySplit', () => {
  it('skews heavily foreign if foreign marketing budget vastly outpaces domestic', () => {
    const campaign: MarketingCampaign = { 
        domesticBudget: 1_000_000, 
        foreignBudget: 20_000_000, 
        primaryAngle: 'SELL_THE_SPECTACLE' as import('../../../engine/types').MarketingAngle,
        weeksInMarketing: 1
    };
    const baseGross = 100_000_000;
    
    // Genre 'Action' has 0.4 genreDomesticSkew
    const result = calculateTerritorySplit(baseGross, campaign, 'Action');
    
    // finalDomesticPct = (1/21 * 0.6) + (0.4 * 0.4) = 0.028 + 0.16 = 0.188
    // finalForeignPct = 0.812
    // totalForeign / totalDomestic = 0.812 / 0.188 = 4.31
    expect(result.totalForeign).toBeGreaterThan(result.totalDomestic * 3);
  });

  it('skews domestic for Comedy genre even with balanced marketing', () => {
    const campaign: MarketingCampaign = { 
        domesticBudget: 10_000_000, 
        foreignBudget: 10_000_000, 
        primaryAngle: 'SELL_THE_STORY' as import('../../../engine/types').MarketingAngle,
        weeksInMarketing: 1
    };
    const baseGross = 50_000_000;
    
    // genreDomesticSkew for Comedy is 0.65
    // finalDomesticPct = (0.5 * 0.6) + (0.65 * 0.4) = 0.3 + 0.26 = 0.56
    const result = calculateTerritorySplit(baseGross, campaign, 'Comedy');
    expect(result.totalDomestic).toBeGreaterThan(result.totalForeign);
    expect(result.totalDomestic).toBe(50_000_000 * 0.56);
  });
});
