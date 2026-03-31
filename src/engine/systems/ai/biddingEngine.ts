import { GameState, RivalStudio, Opportunity, StateImpact } from '@/engine/types';
import { secureRandom, pick, randRange } from '../../utils';

/**
 * AI Decision Multipliers (Target C2).
 * Archetypes now have clear, deterministic bidding biases.
 */
const ArchetypeMultipliers: Record<string, (genre: string) => number> = {
  PRESTIGE_INDIE: (genre) => (genre === 'Drama' || genre === 'Horror' ? 1.3 : 0.8),
  FRANCHISE_FACTORY: (genre) => (genre === 'Sci-Fi' || genre === 'Action' ? 1.5 : 0.7),
  CAPITALIST_PIONEER: (genre) => 1.1, // High bids across the board but calculated
  BALANCED: (genre) => 1.0,
};

/**
 * AI Auction Tick (Target C2).
 * Pure function that generates bidding impacts for all active opportunities.
 */
export function tickAuctions(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const opportunities = state.market.opportunities.filter(o => o.expirationWeek >= state.week);

  opportunities.forEach(opportunity => {
    state.industry.rivals.forEach(rival => {
      // Logic for should rebid
      const currentHighest = Object.values(opportunity.bids).reduce((max, b) => Math.max(max, b), 0);
      const myBid = opportunity.bids[rival.id] || 0;

      if (myBid < currentHighest && rival.cash > currentHighest * 1.5) {
        const multiplier = ArchetypeMultipliers[rival.archetype]?.(opportunity.genre) || 1.0;
        const newBid = Math.floor(currentHighest * randRange(1.05, 1.15) * multiplier);

        if (newBid < rival.cash * 0.4) {
          impacts.push({
            type: 'PROJECT_UPDATED', // Bids are temporarily stored on opportunity
            payload: {
              opportunityId: opportunity.id,
              rivalId: rival.id,
              bid: newBid
            }
          });

          if (secureRandom() < 0.1) {
            impacts.push({
              type: 'NEWS_ADDED',
              payload: {
                headline: {
                  week: state.week,
                  category: 'market',
                  text: `BIDDING WAR: ${rival.name} raises the stakes for ${opportunity.title}.`
                }
              }
            });
          }
        }
      }
    });
  });

  return impacts;
}
