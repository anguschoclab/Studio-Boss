import { pick } from '../utils';
import { GameState, MarketEvent } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { RandomGenerator } from '../utils/rng';

const EVENT_TEMPLATES: Omit<MarketEvent, 'id' | 'weeksRemaining'>[] = [
  {
    type: 'streaming_boom',
    name: 'Streaming Subscription Boom',
    description: 'A global lock-down or tech shift leads to massive streaming growth.',
    revenueMultiplier: 1.5,
    costMultiplier: 1.2,
    talentAvailabilityModifier: -0.1,
    economicShock: { sentimentShift: 20, baseRateShift: -0.01 } // Lower rates for growth
  },
  {
    type: 'theatrical_revival',
    name: 'Theatrical Revival',
    description: 'Audiences are flocking back to cinemas globally.',
    revenueMultiplier: 1.4,
    costMultiplier: 1.0,
    talentAvailabilityModifier: 0.1,
    economicShock: { sentimentShift: 10, baseRateShift: 0 }
  },
  {
    type: 'writers_strike',
    name: 'WGA Strike',
    description: 'Writers are striking for better streaming residuals.',
    revenueMultiplier: 1.0,
    costMultiplier: 1.5,
    talentAvailabilityModifier: -0.8,
    economicShock: { sentimentShift: -15, baseRateShift: 0.005 } // Slight rate hike from inflation
  },
  {
    type: 'actors_strike',
    name: 'SAG-AFTRA Strike',
    description: 'Actors hit the picket lines over AI replacement fears.',
    revenueMultiplier: 0.8,
    costMultiplier: 1.5,
    talentAvailabilityModifier: -0.9,
    economicShock: { sentimentShift: -20, baseRateShift: 0.005 }
  },
  {
    type: 'market_crash',
    name: 'Economic Recession',
    description: 'An economic downturn dries up credit and suppresses entertainment spending.',
    revenueMultiplier: 0.7,
    costMultiplier: 0.9,
    talentAvailabilityModifier: 0.3,
    economicShock: { sentimentShift: -50, baseRateShift: 0.04 } // Massive rate hike to combat inflation
  }
];

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
        id: (rng && rng.uuid ? rng.uuid.bind(rng) : (prefix) => `${prefix}-${Math.random()}`)('news'),
        week: state.week,
        headline: 'Market Normalizes',
        description: `The ${exp.name} has finally ended.`,
      }
    });
  }
  
  // Chance to spawn new event if none active
  if (activeEvents.length === 0 && (rng && rng.next ? rng.next() : Math.random()) < 0.02) {
    const template = (rng && rng.pick ? rng.pick.bind(rng) : pick)(EVENT_TEMPLATES);
    const newEvent: MarketEvent = {
      ...template,
      id: (rng && rng.uuid ? rng.uuid.bind(rng) : (prefix) => `${prefix}-${Math.random()}`)('market-event'),
      weeksRemaining: Math.floor(rng.range(12, 52))
    };
    
    activeEvents.push(newEvent);
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: (rng && rng.uuid ? rng.uuid.bind(rng) : (prefix) => `${prefix}-${Math.random()}`)('news'),
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
