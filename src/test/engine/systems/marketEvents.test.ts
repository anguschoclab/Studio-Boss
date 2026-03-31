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
      market: {
        activeMarketEvents: []
      },
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
        weeksRemaining: 5,
      } as any;

      mockGameState.market.activeMarketEvents = [activeEvent];

      const impacts = advanceMarketEvents(mockGameState);
      const marketImpact = impacts.find(i => i.type === 'MARKET_EVENT_UPDATED');

      expect(marketImpact).toBeDefined();
      expect(marketImpact?.payload.events.length).toBe(1);
      expect(marketImpact?.payload.events[0].weeksRemaining).toBe(4);
    });

    it('should expire events when weeksRemaining reaches 0 and generate a headline', () => {
      const expiringEvent: MarketEvent = {
        id: 'event-2',
        type: 'theatrical_revival',
        name: 'Theatrical Revival',
        weeksRemaining: 1,
      } as any;

      mockGameState.market.activeMarketEvents = [expiringEvent];
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.5);

      const impacts = advanceMarketEvents(mockGameState);
      const marketImpact = impacts.find(i => i.type === 'MARKET_EVENT_UPDATED');
      const newsImpact = impacts.find(i => i.type === 'NEWS_ADDED');

      expect(marketImpact?.payload.events.length).toBe(0);
      expect(newsImpact).toBeDefined();
      expect(newsImpact?.payload.headline).toBe('Market Normalizes');
    });

    it('should spawn a new market event when condition is met', () => {
      // Chance is now 0.02 in the refactored code
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.01);

      mockGameState.market.activeMarketEvents = [];

      const impacts = advanceMarketEvents(mockGameState);
      const marketImpact = impacts.find(i => i.type === 'MARKET_EVENT_UPDATED');
      const newsImpact = impacts.find(i => i.type === 'NEWS_ADDED');

      expect(marketImpact?.payload.events.length).toBe(1);
      expect(newsImpact).toBeDefined();
      expect(newsImpact?.payload.headline).toContain('MAJOR INDUSTRY EVENT');
    });
  });

  describe('getActiveMarketEvent', () => {
    it('should return undefined when activeMarketEvents is empty or undefined', () => {
      mockGameState.market.activeMarketEvents = undefined as any;
      expect(getActiveMarketEvent(mockGameState)).toBeUndefined();

      mockGameState.market.activeMarketEvents = [];
      expect(getActiveMarketEvent(mockGameState)).toBeUndefined();
    });

    it('should return the first event when there are active events', () => {
      const activeEvent: MarketEvent = { id: 'event-4' } as any;
      mockGameState.market.activeMarketEvents = [activeEvent];
      const result = getActiveMarketEvent(mockGameState);
      expect(result?.id).toBe(activeEvent.id);
    });
  });
});
