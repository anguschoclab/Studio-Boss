import { describe, it, expect, vi, beforeEach } from 'vitest';
import { advanceMarketEvents, getActiveMarketEvent } from '../../../engine/systems/marketEvents';
import { GameState, MarketEvent, Talent } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';

describe('Market Events System', () => {
  let mockGameState: GameState;
  const rng = new RandomGenerator(999);

  beforeEach(() => {
    mockGameState = {
      week: 10,
      gameSeed: 1,
      tickCount: 0,
      projects: { active: [] },
      game: { currentWeek: 10 },
      finance: { cash: 1_000_000, ledger: [] },
      news: { headlines: [] },
      ip: { vault: [], franchises: {} },
      studio: {
        name: 'Player Studio',
        archetype: 'major',
        prestige: 50,
        internal: { projects: {}, contracts: [] }
      },
      market: { 
        opportunities: [],
        buyers: [],
        activeMarketEvents: []
      },
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
  });

  describe('advanceMarketEvents', () => {
    it('should tick active events down', () => {
      const activeEvent: MarketEvent = {
        id: 'event-1',
        type: 'streaming_boom',
        name: 'Streaming Boom',
        description: '...',
        weeksRemaining: 5,
        revenueMultiplier: 1.2,
        costMultiplier: 1.0,
        talentAvailabilityModifier: 0
      };

      mockGameState.market.activeMarketEvents = [activeEvent];

      const impacts = advanceMarketEvents(mockGameState, rng);
      const marketImpact = impacts.find(i => i.type === 'MARKET_EVENT_UPDATED');

      expect(marketImpact).toBeDefined();
      expect((marketImpact as any).payload.events?.length).toBe(1);
      expect((marketImpact as any).payload.events?.[0].weeksRemaining).toBe(4);
    });

    it('should expire events when weeksRemaining reaches 0', () => {
      const expiringEvent: MarketEvent = {
        id: 'event-2',
        type: 'theatrical_revival',
        name: 'Theatrical Revival',
        description: '...',
        weeksRemaining: 1,
        revenueMultiplier: 1.2,
        costMultiplier: 1.0,
        talentAvailabilityModifier: 0
      };

      mockGameState.market.activeMarketEvents = [expiringEvent];
      
      const deterministicRng = new RandomGenerator(1234);
      vi.spyOn(deterministicRng, 'next').mockReturnValue(0.5); // No new event spawn

      const impacts = advanceMarketEvents(mockGameState, deterministicRng);
      const marketImpact = impacts.find(i => i.type === 'MARKET_EVENT_UPDATED');
      
      expect((marketImpact as any).payload.events?.length).toBe(0);
    });
  });

  describe('getActiveMarketEvent', () => {
    it('should return the first event when there are active events', () => {
      const activeEvent: MarketEvent = { id: 'event-4' } as any;
      mockGameState.market.activeMarketEvents = [activeEvent];
      const result = getActiveMarketEvent(mockGameState);
      expect(result?.id).toBe(activeEvent.id);
    });
  });
});
