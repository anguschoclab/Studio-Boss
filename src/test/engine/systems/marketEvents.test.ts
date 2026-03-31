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
          projects: {},
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
        talentPool: {},
        newsHistory: []
      },
      culture: {
        genrePopularity: {}
      },
      finance: {
        bankBalance: 0,
        yearToDateRevenue: 0,
        yearToDateCosts: 0,
      }
    } as any;
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

      const impact = advanceMarketEvents(mockGameState);

      expect(impact.newMarketEvents).toBeDefined();
      expect(impact.newMarketEvents!.length).toBe(1);
      expect(impact.newMarketEvents![0].weeksRemaining).toBe(4);
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
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.5);

      const impact = advanceMarketEvents(mockGameState);

      expect(impact.newMarketEvents).toBeDefined();
      expect(impact.newMarketEvents!.length).toBe(0);

      expect(impact.newHeadlines!.length).toBe(1);
      expect(impact.newHeadlines![0].text).toBe(`Market Normalizes: The ${expiringEvent.name} has finally ended.`);
      expect(impact.newHeadlines![0].category).toBe('market');
    });

    it('should spawn a new market event when condition is met', () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.005);

      mockGameState.market.activeMarketEvents = [];

      const impact = advanceMarketEvents(mockGameState);

      expect(impact.newMarketEvents).toBeDefined();
      expect(impact.newMarketEvents!.length).toBe(1);

      const newEvent = impact.newMarketEvents![0];
      expect(newEvent.id).toBeDefined();
      expect(newEvent.weeksRemaining).toBeGreaterThanOrEqual(12);
      expect(newEvent.weeksRemaining).toBeLessThanOrEqual(52);

      expect(impact.newHeadlines!.length).toBe(1);
      expect(impact.newHeadlines![0].text).toBe(`MAJOR INDUSTRY EVENT: ${newEvent.name} - ${newEvent.description}`);
      expect(impact.newHeadlines![0].category).toBe('market');
    });

    it('should not spawn a new event if condition is not met', () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.5);

      mockGameState.market.activeMarketEvents = [];

      const impact = advanceMarketEvents(mockGameState);

      expect(impact.newMarketEvents).toBeDefined();
      expect(impact.newMarketEvents!.length).toBe(0);
      expect(impact.newHeadlines!.length).toBe(0);
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
