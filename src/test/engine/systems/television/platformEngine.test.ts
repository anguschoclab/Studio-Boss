import { describe, it, expect } from 'vitest';
import { GameState, Buyer, StreamerPlatform } from '@/engine/types';
import { tickPlatforms } from '@/engine/systems/television/platformEngine';

describe('Platform Engine (Target B1)', () => {
  const mockState = {
    week: 1,
    market: {
      buyers: [
        {
          id: 's1',
          name: 'Netflex',
          archetype: 'streamer',
          subscribers: 10000000,
          churnRate: 0.05,
          contentLibraryQuality: 70,
          marketingSpend: 500000
        } as unknown as StreamerPlatform
      ]
    }
  } as unknown as GameState;

  it('should calculate subscriber growth and churn correctly', () => {
    const impacts = tickPlatforms(mockState);
    
    const buyerImpact = impacts.find(i => i.payload.buyerId === 's1');
    expect(buyerImpact).toBeDefined();
    
    // Growth should be influenced by library quality and marketing
    // Churn should be influenced by a base rate
    const nextSubs = buyerImpact?.payload.update.subscribers;
    expect(nextSubs).not.toBe(10000000); 
  });
});
