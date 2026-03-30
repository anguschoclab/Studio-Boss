import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { advanceMarketEvents, getActiveMarketEvent } from '../../../engine/systems/marketEvents';
import { GameState, MarketEvent } from '../../../engine/types';
import * as utils from '../../../engine/utils';

describe('Market Events System', () => {
  let mockGameState: GameState;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockGameState = {
      week: 10,
      cash: 10000000,
      studio: {
        name: 'Test Studio',
        archetype: 'indie',
        prestige: 10,
        internal: {
          projects: [],
          contracts: [],
          financeHistory: []
        }
      },
      market: {
        opportunities: [],
        buyers: [],
        activeMarketEvents: []
      },
      industry: {
        rivals: [],
        headlines: [],
        families: [],
        agencies: [],
        agents: [],
        talentPool: [],
        newsHistory: []
      },
      culture: {
        genrePopularity: {}
      },
      finance: {
        bankBalance: 0,
        yearToDateRevenue: 0,
        yearToDateCosts: 0,
        lifetimeRevenue: 0,
        lifetimeCosts: 0
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('advanceMarketEvents', () => {
    it('should tick active events down', () => {
      const activeEvent: MarketEvent = {
        id: 'event-1',
        type: 'streaming_boom',
        name: 'Streaming Boom',
        description: 'Test event',
        weeksRemaining: 5,
        revenueMultiplier: 1.5,
        costMultiplier: 1.2,
        talentAvailabilityModifier: -0.1
      };

      mockGameState.market.activeMarketEvents = [activeEvent];

      const newState = advanceMarketEvents(mockGameState);

      expect(newState.market.activeMarketEvents).toBeDefined();
      expect(newState.market.activeMarketEvents!.length).toBe(1);
      expect(newState.market.activeMarketEvents![0].weeksRemaining).toBe(4);
    });

    it('should expire events when weeksRemaining reaches 0 and generate a headline', () => {
      const expiringEvent: MarketEvent = {
        id: 'event-2',
        type: 'theatrical_revival',
        name: 'Theatrical Revival',
        description: 'Test expiring event',
        weeksRemaining: 1,
        revenueMultiplier: 1.4,
        costMultiplier: 1.0,
        talentAvailabilityModifier: 0.1
      };

      mockGameState.market.activeMarketEvents = [expiringEvent];
      mockGameState.industry.headlines = [
        { id: 'old-headline', text: 'Old News', week: 9, category: 'general' }
      ];

      const newState = advanceMarketEvents(mockGameState);

      expect(newState.market.activeMarketEvents).toBeDefined();
      expect(newState.market.activeMarketEvents!.length).toBe(0);

      expect(newState.industry.headlines.length).toBe(2);
      expect(newState.industry.headlines[0].text).toBe(`Market Normalizes: The ${expiringEvent.name} has finally ended.`);
      expect(newState.industry.headlines[0].category).toBe('market');
      expect(newState.industry.headlines[0].week).toBe(10);
    });

    it('should spawn a new market event when condition is met', () => {
      // Mock secureRandom to guarantee < 0.01 condition passes
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.005);

      // Since pick uses Math.random() (if it does not use secureRandom) or secureRandom,
      // mocking secureRandom should be enough to hit the spawn logic.
      // randRange will use Math.random() or secureRandom, so it will generate some value.

      mockGameState.market.activeMarketEvents = [];
      mockGameState.industry.headlines = [];

      const newState = advanceMarketEvents(mockGameState);

      expect(newState.market.activeMarketEvents).toBeDefined();
      expect(newState.market.activeMarketEvents!.length).toBe(1);

      const newEvent = newState.market.activeMarketEvents![0];
      expect(newEvent.id).toBeDefined();
      expect(newEvent.weeksRemaining).toBeGreaterThanOrEqual(12);
      expect(newEvent.weeksRemaining).toBeLessThanOrEqual(52);

      expect(newState.industry.headlines.length).toBe(1);
      expect(newState.industry.headlines[0].text).toBe(`MAJOR INDUSTRY EVENT: ${newEvent.name} - ${newEvent.description}`);
      expect(newState.industry.headlines[0].category).toBe('market');
      expect(newState.industry.headlines[0].week).toBe(10);
    });

    it('should not spawn a new event if condition is not met', () => {
      // Mock secureRandom to fail < 0.01 condition
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.5);

      mockGameState.market.activeMarketEvents = [];

      const newState = advanceMarketEvents(mockGameState);

      expect(newState.market.activeMarketEvents).toBeDefined();
      expect(newState.market.activeMarketEvents!.length).toBe(0);
      expect(newState.industry.headlines.length).toBe(0);
    });

    it('should not spawn a new event if there are already active events', () => {
      // Mock secureRandom to pass < 0.01 condition
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.005);

      const activeEvent: MarketEvent = {
        id: 'event-3',
        type: 'market_crash',
        name: 'Crash',
        description: 'Test crash',
        weeksRemaining: 10,
        revenueMultiplier: 0.7,
        costMultiplier: 0.9,
        talentAvailabilityModifier: 0.3
      };

      mockGameState.market.activeMarketEvents = [activeEvent];

      const newState = advanceMarketEvents(mockGameState);

      // Should tick down, but not spawn a new one
      expect(newState.market.activeMarketEvents).toBeDefined();
      expect(newState.market.activeMarketEvents!.length).toBe(1);
      expect(newState.market.activeMarketEvents![0].id).toBe(activeEvent.id);
      expect(newState.market.activeMarketEvents![0].weeksRemaining).toBe(9);
    });
  });

  describe('getActiveMarketEvent', () => {
    it('should return undefined when activeMarketEvents is empty or undefined', () => {
      mockGameState.market.activeMarketEvents = undefined;
      expect(getActiveMarketEvent(mockGameState)).toBeUndefined();

      mockGameState.market.activeMarketEvents = [];
      expect(getActiveMarketEvent(mockGameState)).toBeUndefined();
    });

    it('should return the first event when there are active events', () => {
      const activeEvent: MarketEvent = {
        id: 'event-4',
        type: 'actors_strike',
        name: 'Strike',
        description: 'Test strike',
        weeksRemaining: 5,
        revenueMultiplier: 0.8,
        costMultiplier: 1.5,
        talentAvailabilityModifier: -0.9
      };

      mockGameState.market.activeMarketEvents = [activeEvent];

      const result = getActiveMarketEvent(mockGameState);
      expect(result).toBeDefined();
      expect(result!.id).toBe(activeEvent.id);
    });
  });
});
