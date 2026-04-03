import { GameState, RivalStudio, Opportunity, StateImpact, ArchetypeKey } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * AI Decision Multipliers.
 * Archetypes now have clear, deterministic bidding biases.
 */
const ArchetypeMultipliers: Record<ArchetypeKey, (genre: string) => number> = {
  'indie': (genre) => (genre === 'Drama' || genre === 'Horror' ? 1.4 : 0.8),
  'major': (genre) => (genre === 'Sci-Fi' || genre === 'Action' ? 1.6 : 0.6),
  'mid-tier': (genre) => 1.15, 
};

/**
 * AI Auction Tick.
 * Generate bidding impacts for all active opportunities.
 */
export function tickAuctions(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currWeek = state.week;
  const opportunities = state.market.opportunities.filter(o => (o.expirationWeek || 0) >= currWeek);

  opportunities.forEach(opportunity => {
    // Current highest bid tracking
    const currentHighest = Object.values(opportunity.bids || {}).reduce((max: number, b) => Math.max(max, b.amount), 0);
    
    state.industry.rivals.forEach(rival => {
      const myBid = opportunity.bids[rival.id]?.amount || 0;

      // Logic for should rebid: Outbid if highest is better AND rival has cash
      // If the player is the highest bidder, AI is more aggressive
      const isPlayerLeading = opportunity.highestBidderId === 'PLAYER';
      const aggressionFactor = isPlayerLeading ? 1.2 : 1.0;

      if (myBid < currentHighest && rival.cash > currentHighest * 1.3) {
        const multiplier = (ArchetypeMultipliers[rival.archetype]?.(opportunity.genre) || 1.0) * aggressionFactor;
        const newBid = Math.floor(currentHighest * rng.range(1.05, 1.2) * multiplier);

        // Cap bid at 35% of total rival cash for "Strategic" behavior
        if (newBid < rival.cash * 0.35) {
          impacts.push({
            type: 'OPPORTUNITY_UPDATED',
            payload: {
              opportunityId: opportunity.id,
              rivalId: rival.id,
              bid: { amount: newBid, terms: 'aggressive' }
            }
          });

          // Industry News for significant bidding wars
          if (newBid > 10_000_000 && (rng && rng.next ? rng.next() : Math.random()) < 0.2) {
            impacts.push({
              type: 'NEWS_ADDED',
              payload: {
                headline: `STREET TALK: ${rival.name} desperate for "${opportunity.title}"?`,
                description: `${rival.name} has escalated the bidding for "${opportunity.title}", signaling they might view it as a cornerstone asset for their next slate.`,
              }
            });
          }
        }
      }
    });
  });

  return impacts;
}

/**
 * Live Reaction Bidding.
 * Used for "1-Click" outbidding where AI might respond immediately.
 */
export function calculateLiveCounterBid(
  opportunity: Opportunity,
  playerBid: number,
  rival: RivalStudio,
  rng: RandomGenerator,
  week: number
): StateImpact | null {
  // Only high-prestige or cash-rich rivals counter immediately to avoid spam
  if (rival.cash < playerBid * 2 || rival.prestige < 60) return null;

  const multiplier = ArchetypeMultipliers[rival.archetype]?.(opportunity.genre) || 1.1;
  const reactionThreshold = 0.3; // 30% chance for immediate response
  
  if ((rng && rng.next ? rng.next() : Math.random()) < reactionThreshold) {
    const counterAmount = Math.floor(playerBid * rng.range(1.05, 1.15) * multiplier);
    if (counterAmount < rival.cash * 0.4) {
      return {
        type: 'OPPORTUNITY_UPDATED',
        payload: {
          opportunityId: opportunity.id,
          rivalId: rival.id,
          bid: { amount: counterAmount, terms: 'aggressive' }
        }
      };
    }
  }

  return null;
}

/**
 * Player UI Helper.
 * Suggests a bid 10% higher than current max, rounded.
 */
export function getLiveCounterBid(opportunity: Opportunity, increment: number = 0.1): number {
  const currentMax = Math.max(...Object.values(opportunity.bids || {}).map(b => b.amount), opportunity.costToAcquire);
  return Math.round(currentMax * (1 + increment) / 1000) * 1000;
}
