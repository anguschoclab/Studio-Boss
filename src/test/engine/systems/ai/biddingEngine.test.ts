import { calculateAIBid, shouldStudioRebid } from '@/engine/systems/ai/biddingEngine';
import { Opportunity, RivalStudio } from '@/engine/types';

describe('calculateAIBid', () => {
  it('returns a high bid if the studio has high cash and the opportunity fits their archetype', () => {
    const studio = { 
        id: 'rival-1', 
        cash: 50000000, 
        archetype: 'major',
        strength: 80 
    } as RivalStudio;
    
    const opportunity = { 
        id: 'script-1', 
        genre: 'Action', 
        budgetTier: 'blockbuster',
        costToAcquire: 1000000,
        qualityBonus: 85
    } as any; // Using any for simplified test data
    
    const bid = calculateAIBid(studio, opportunity, 0); // No leading bid
    expect(bid).toBeGreaterThan(1200000); // 1.2M+ due to archetype match and quality
  });

  it('respects budget safeguards (e.g., bid capped at 40% of cash)', () => {
    const studio = { 
        id: 'rival-small', 
        cash: 1000000, 
        archetype: 'indie' 
    } as RivalStudio;
    
    const opportunity = { 
        id: 'script-high-cost', 
        costToAcquire: 500000,
        qualityBonus: 90
    } as any;

    const bid = calculateAIBid(studio, opportunity, 0);
    expect(bid).toBeLessThanOrEqual(400000); // 40% of 1M
  });
});

describe('shouldStudioRebid', () => {
    it('returns true if studio is outbid but still has desire and budget', () => {
        const studio = { id: 'rival-1', cash: 10000000, archetype: 'major' } as RivalStudio;
        const opportunity = { 
            id: 'script-1', 
            genre: 'Action', 
            budgetTier: 'blockbuster',
            costToAcquire: 1000000,
            bids: { 'player-1': 1500000 } 
        } as any;

        const result = shouldStudioRebid(studio, opportunity, 1500000);
        expect(result).toBe(true);
    });

    it('returns false if current bid exceeds 40% of studio cash', () => {
        const studio = { id: 'rival-1', cash: 2000000, archetype: 'major' } as RivalStudio;
        const opportunity = { 
            id: 'script-1', 
            bids: { 'player-1': 900000 } 
        } as any;

        const result = shouldStudioRebid(studio, opportunity, 900000);
        expect(result).toBe(false); // 900k is 45% of 2M
    });
});
