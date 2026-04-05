import { describe, it, expect } from 'vitest';
import { GameState, StreamerPlatform, Talent, BuyerUpdateImpact } from '../../../../engine/types';
import { tickPlatforms } from '../../../../engine/systems/television/platformEngine';
import { RandomGenerator } from '../../../../engine/utils/rng';
import { createMockGameState } from '../../../utils/mockFactories';

describe('Platform Engine (Target B1)', () => {
  const rng = new RandomGenerator(42);
  
  const getInitialState = (buyers: StreamerPlatform[]): GameState => {
    return createMockGameState({
      market: { opportunities: [], buyers }
    });
  };

  it('should calculate subscriber growth and churn correctly', () => {
    const streamer: StreamerPlatform = {
      id: 's1',
      name: 'Netflex',
      archetype: 'streamer',
      subscribers: 10_000_000,
      churnRate: 0.05,
      contentLibraryQuality: 70,
      marketingSpend: 500_000,
      prestige: 50,
      isMajor: true,
      currentMandate: { type: 'prestige', activeUntilWeek: 10 },
      isGlobal: true,
      territories: ['USA', 'UK'],
      ratingHistory: []
    } as any;

    const state = getInitialState([streamer]);
    const impacts = tickPlatforms(state, rng);
    
    const buyerImpact = impacts.find((i): i is BuyerUpdateImpact => i.type === 'BUYER_UPDATED' && i.payload.buyerId === 's1');
    expect(buyerImpact).toBeDefined();
    expect(buyerImpact?.type).toBe('BUYER_UPDATED');
    
    const nextSubs = (buyerImpact?.payload.update as Partial<StreamerPlatform> | undefined)?.subscribers;
    expect(nextSubs).toBeDefined();
    expect(nextSubs).not.toBe(10_000_000); 
  });
});
