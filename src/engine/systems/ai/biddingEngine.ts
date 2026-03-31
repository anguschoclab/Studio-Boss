import { GameState, RivalStudio, Opportunity, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

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
export function tickAuctions(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currWeek = state.week;
  const opportunities = state.market.opportunities.filter(o => (o.expirationWeek || 0) >= currWeek);

  opportunities.forEach(opportunity => {
    state.industry.rivals.forEach(rival => {
      // Logic for should rebid
      const currentHighest = Object.values(opportunity.bids || {}).reduce((max: number, b: any) => Math.max(max, Number(b)), 0);
      const myBid = (opportunity.bids as any)[rival.id] || 0;

      if (myBid < currentHighest && rival.cash > currentHighest * 1.5) {
        const multiplier = ArchetypeMultipliers[rival.archetype]?.(opportunity.genre) || 1.0;
        const newBid = Math.floor(currentHighest * rng.range(1.05, 1.15) * multiplier);

        if (newBid < rival.cash * 0.4) {
          impacts.push({
            type: 'OPPORTUNITY_UPDATED',
            payload: {
              opportunityId: opportunity.id,
              rivalId: rival.id,
              bid: newBid
            }
          });

          if (rng.next() < 0.1) {
            impacts.push({
              type: 'NEWS_ADDED',
              payload: {
                headline: `BIDDING WAR: ${rival.name} raises the stakes for ${opportunity.title}.`,
                description: `${rival.name} has submitted a significantly higher bid for the rights to "${opportunity.title}", signaling intense industry interest.`,
              }
            });
          }
        }
      }
    });
  });

  return impacts;
}
