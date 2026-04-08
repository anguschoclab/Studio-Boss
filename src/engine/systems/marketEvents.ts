import { pick } from '../utils';
import { GameState, MarketEvent } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { RandomGenerator } from '../utils/rng';
import { BardResolver } from './bardResolver';

export function getActiveMarketEvent(state: GameState): MarketEvent | undefined {
  if (!state.market.activeMarketEvents || state.market.activeMarketEvents.length === 0) return undefined;
  return state.market.activeMarketEvents[0]; // For simplicity, only 1 global event at a time
}

export function advanceMarketEvents(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  let activeEvents = state.market.activeMarketEvents || [];
  
  // Tick active events down
  activeEvents = activeEvents.map(e => ({
    ...e,
    weeksRemaining: e.weeksRemaining - 1
  }));
  
  // Resolve expired events
  const expired = activeEvents.filter(e => e.weeksRemaining <= 0);
  activeEvents = activeEvents.filter(e => e.weeksRemaining > 0);
  
  for (const exp of expired) {
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('NWS'),
        week: state.week,
        headline: 'Market Normalizes',
        description: `The ${exp.name} has finally ended.`,
      }
    });
  }
  
  // Chance to spawn new event if none active
  if (activeEvents.length === 0 && rng.next() < 0.02) {
    const type = rng.next() > 0.5 ? 'BOOM' : 'CRASH';
    const id = rng.uuid('EVT');
    const intensity = type === 'BOOM' ? 80 : 20;

    const newEvent: MarketEvent = {
        id,
        type: type === 'BOOM' ? 'streaming_boom' : 'market_crash',
        name: BardResolver.resolve({
            domain: 'Market',
            subDomain: 'Headline',
            intensity,
            context: {},
            rng
        }),
        description: BardResolver.resolve({
            domain: 'Market',
            subDomain: 'Event',
            intensity,
            context: {},
            rng
        }),
        weeksRemaining: Math.floor(rng.range(12, 52)),
        revenueMultiplier: type === 'BOOM' ? 1.5 : 0.7,
        costMultiplier: type === 'BOOM' ? 1.2 : 0.9,
        talentAvailabilityModifier: type === 'BOOM' ? -0.1 : 0.3,
        economicShock: { sentimentShift: type === 'BOOM' ? 20 : -50, baseRateShift: type === 'BOOM' ? -0.01 : 0.04 }
    };
    
    activeEvents.push(newEvent);
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('NWS'),
        week: state.week,
        headline: `MAJOR INDUSTRY EVENT: ${newEvent.name}`,
        description: newEvent.description,
      }
    });
  }
  
  impacts.push({
    type: 'MARKET_EVENT_UPDATED',
    payload: { events: activeEvents }
  });

  return impacts;
}
