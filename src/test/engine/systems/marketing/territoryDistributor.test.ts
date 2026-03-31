import { describe, it, expect } from 'vitest';
import { calculateTerritorySplit } from '@/engine/systems/marketing/territoryDistributor';
import { MarketingCampaign } from '../../../../engine/types';

describe('calculateTerritorySplit', () => {
  it('skews heavily foreign if foreign marketing budget vastly outpaces domestic', () => {
    const campaign: MarketingCampaign = { 
        domesticBudget: 1000000, 
        foreignBudget: 20000000, 
        primaryAngle: 'SELL_THE_SPECTACLE' 
    };
    const baseGross = 100000000;
    
    const result = calculateTerritorySplit(baseGross, campaign, 'Action');
    expect(result.totalForeign).toBeGreaterThan(result.totalDomestic * 3);
  });

  it('skews domestic for Comedy genre even with balanced marketing', () => {
    const campaign: MarketingCampaign = { 
        domesticBudget: 10000000, 
        foreignBudget: 10000000, 
        primaryAngle: 'SELL_THE_STORY' 
    };
    const baseGross = 50000000;
    
    const result = calculateTerritorySplit(baseGross, campaign, 'Comedy');
    expect(result.totalDomestic).toBeGreaterThan(result.totalForeign);
  });
});
