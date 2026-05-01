import { GameState, RivalStudio, Opportunity, StateImpact, ArchetypeKey } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * AI Decision Multipliers.
 * Archetypes now have clear, deterministic bidding biases.
 */
const ArchetypeMultipliers: Record<ArchetypeKey, (genre: string) => number> = {
  'indie': (genre) => (genre === 'Drama' || genre === 'Horror' ? 1.4 : 0.8),
  'major': (genre) => (genre === 'Sci-Fi' || genre === 'Action' ? 1.6 : 0.6),
  'mid-tier': () => 1.15,
};

/**
 * AI Auction Tick.
 * Generate bidding impacts for all active opportunities.
 */
export function tickAuctions(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currWeek = state.week;
  const opportunities = state.market.opportunities.filter(o => (o.expirationWeek || 0) >= currWeek);
  const ALL_RIVALS = Object.values(state.entities.rivals);

  opportunities.forEach(opportunity => {
    // Current highest bid tracking
    const currentHighest = Object.values(opportunity.bids || {}).reduce((max: number, b) => Math.max(max, b.amount), 0);
    
    ALL_RIVALS.forEach(rival => {
      const myBid = opportunity.bids[rival.id]?.amount || 0;

      // Logic for should rebid: Outbid if highest is better AND rival has cash
      // If the player is the highest bidder, AI is more aggressive
      const isPlayerLeading = opportunity.highestBidderId === state.studio.id || opportunity.highestBidderId === 'PLAYER';
      const aggressionFactor = isPlayerLeading ? 1.2 : 1.0;

      // 🎭 The Method Actor Tuning: Rivals with FRANCHISE_BUILDING motivation will aggressively outbid for IP-driven genres, tolerating higher caps. CASH_CRUNCH rivals will be highly conservative.
      let adjustedCashThreshold = 1.3;
      let bidCapPercentage = 0.35;
      let motivationMultiplier = 1.0;

      if (rival.currentMotivation === 'FRANCHISE_BUILDING' && (opportunity.genre === 'Sci-Fi' || opportunity.genre === 'Action' || opportunity.genre === 'Fantasy')) {
        adjustedCashThreshold = 1.1; // More willing to bid with less cash buffer
        bidCapPercentage = 0.60; // Tolerate a much higher portion of their cash
        motivationMultiplier = 1.6; // Bid more aggressively
      } else if (rival.currentMotivation === 'CASH_CRUNCH') {
        adjustedCashThreshold = 2.0; // Needs double the cash to bid
        bidCapPercentage = 0.15; // Only use a tiny fraction of cash
        motivationMultiplier = 0.8; // Bid weakly
      } else if (rival.currentMotivation === 'AWARD_CHASE' && (opportunity.genre === 'Drama' || opportunity.genre === 'Historical')) {
        adjustedCashThreshold = 1.0; // Will spend almost to zero for prestige
        bidCapPercentage = 0.50;
        motivationMultiplier = 1.3;
      } else if (rival.currentMotivation === 'MARKET_DISRUPTION' && isPlayerLeading) {
        // 🎭 The Method Actor Tuning: Rivals with MARKET_DISRUPTION motivation will aggressively spite-bid when the player is leading, overextending themselves just to steal the opportunity.
        adjustedCashThreshold = 0.8; // Actually reckless spite bidding (bidding even when short on cash reserves)
        bidCapPercentage = 0.40;
        motivationMultiplier = 1.8; // Massively aggressive bidding
      }

      if (myBid < currentHighest && rival.cash > currentHighest * adjustedCashThreshold) {
        const totalMultiplier = (ArchetypeMultipliers[rival.archetype]?.(opportunity.genre) || 1.0) * aggressionFactor * motivationMultiplier;
        const newBid = Math.floor(currentHighest * (1 + rng.range(0.05, 0.20) * totalMultiplier));

        // Apply genre trend multiplier based on market heat
        let trendMultiplier = 1.0;
        const genreTrend = state.market.trends?.find(t =>
          t.genre?.toLowerCase() === opportunity.genre?.toLowerCase()
        );
        if (genreTrend) {
          // heat >= 60 → trending up → rivals bid more aggressively (×1.2)
          // heat <= 30 → trending down → rivals bid less (×0.8)
          if (genreTrend.heat >= 60) trendMultiplier = 1.2;
          else if (genreTrend.heat <= 30) trendMultiplier = 0.8;
        }
        const trendAdjustedBid = Math.floor(newBid * trendMultiplier);

        // Cap bid at adjusted percentage of total rival cash for "Strategic" behavior
        if (trendAdjustedBid < rival.cash * bidCapPercentage) {
          impacts.push({
            type: 'OPPORTUNITY_UPDATED',
            payload: {
              opportunityId: opportunity.id,
              rivalId: rival.id,
              bid: { amount: trendAdjustedBid, terms: 'aggressive' }
            }
          });

          // Industry News for significant bidding wars
          if (trendAdjustedBid > 10_000_000 && rng.next() < 0.2) {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  week: number
): StateImpact | null {
  // Only high-prestige or cash-rich rivals counter immediately to avoid spam
  if (rival.cash < playerBid * 2 || rival.prestige < 60) return null;

  let multiplier = ArchetypeMultipliers[rival.archetype]?.(opportunity.genre) || 1.1;
  let reactionThreshold = 0.3; // 30% chance for immediate response
  
  // 🎭 The Method Actor Tuning: Adjust reaction logic based on motivation
  if (rival.currentMotivation === 'FRANCHISE_BUILDING' && (opportunity.genre === 'Sci-Fi' || opportunity.genre === 'Action' || opportunity.genre === 'Fantasy')) {
    reactionThreshold = 0.6;
    multiplier = 1.4;
  } else if (rival.currentMotivation === 'MARKET_DISRUPTION') {
    reactionThreshold = 0.5;
    multiplier = 1.3;
  }

  if (rng.next() < reactionThreshold) {
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
