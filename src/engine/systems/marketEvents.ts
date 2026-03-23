import { GameState, MarketEvent, MarketEventType } from '../types';
import { pick, randRange } from '../utils';

const EVENT_TEMPLATES: Omit<MarketEvent, 'id' | 'weeksRemaining'>[] = [
  {
    type: 'streaming_boom',
    name: 'Streaming Subscription Boom',
    description: 'A global lock-down or tech shift leads to massive streaming growth.',
    revenueMultiplier: 1.5,
    costMultiplier: 1.2,
    talentAvailabilityModifier: -0.1
  },
  {
    type: 'theatrical_revival',
    name: 'Theatrical Revival',
    description: 'Audiences are flocking back to cinemas globally.',
    revenueMultiplier: 1.4,
    costMultiplier: 1.0,
    talentAvailabilityModifier: 0.1
  },
  {
    type: 'writers_strike',
    name: 'WGA Strike',
    description: 'Writers are striking for better streaming residuals.',
    revenueMultiplier: 1.0,
    costMultiplier: 1.5,
    talentAvailabilityModifier: -0.8
  },
  {
    type: 'actors_strike',
    name: 'SAG-AFTRA Strike',
    description: 'Actors hit the picket lines over AI replacement fears.',
    revenueMultiplier: 0.8,
    costMultiplier: 1.5,
    talentAvailabilityModifier: -0.9
  },
  {
    type: 'market_crash',
    name: 'Economic Recession',
    description: 'An economic downturn dries up credit and suppresses entertainment spending.',
    revenueMultiplier: 0.7,
    costMultiplier: 0.9,
    talentAvailabilityModifier: 0.3
  }
];

export function getActiveMarketEvent(state: GameState): MarketEvent | undefined {
  if (!state.activeMarketEvents || state.activeMarketEvents.length === 0) return undefined;
  return state.activeMarketEvents[0]; // For simplicity, only 1 global event at a time
}

export function advanceMarketEvents(state: GameState): GameState {
  let activeEvents = state.activeMarketEvents || [];
  const newHeadlines = [...state.headlines];
  
  // Tick active events down
  activeEvents = activeEvents.map(e => ({
    ...e,
    weeksRemaining: e.weeksRemaining - 1
  }));
  
  // Resolve expired events
  const expired = activeEvents.filter(e => e.weeksRemaining <= 0);
  activeEvents = activeEvents.filter(e => e.weeksRemaining > 0);
  
  for (const exp of expired) {
    newHeadlines.unshift({
      id: crypto.randomUUID(),
      week: state.week,
      category: 'market',
      text: `Market Normalizes: The ${exp.name} has finally ended.`
    });
  }
  
  // Chance to spawn new event if none active
  if (activeEvents.length === 0 && Math.random() < 0.01) {
    const template = pick(EVENT_TEMPLATES);
    const newEvent: MarketEvent = {
      ...template,
      id: crypto.randomUUID(),
      weeksRemaining: randRange(12, 52)
    };
    
    activeEvents.push(newEvent);
    newHeadlines.unshift({
      id: crypto.randomUUID(),
      week: state.week,
      category: 'market',
      text: `MAJOR INDUSTRY EVENT: ${newEvent.name} - ${newEvent.description}`
    });
  }
  
  return {
    ...state,
    activeMarketEvents: activeEvents,
    headlines: newHeadlines.slice(0, 50)
  };
}
