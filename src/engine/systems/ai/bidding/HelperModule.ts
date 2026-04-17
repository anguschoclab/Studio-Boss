import { RivalStudio, Opportunity, StateImpact, ArchetypeKey } from '@/engine/types';
import { RandomGenerator } from '../../../utils/rng';

const ArchetypeMultipliers: Record<ArchetypeKey, (genre: string) => number> = {
  'indie': (genre) => (genre === 'Drama' || genre === 'Horror' ? 1.4 : 0.8),
  'major': (genre) => (genre === 'Sci-Fi' || genre === 'Action' ? 1.6 : 0.6),
  'mid-tier': (genre) => 1.15, 
};

export function calculateLiveCounterBid(
  opportunity: Opportunity,
  playerBid: number,
  rival: RivalStudio,
  rng: RandomGenerator,
  week: number
): StateImpact | null {
  if (rival.cash < playerBid * 2 || rival.prestige < 60) return null;

  const multiplier = ArchetypeMultipliers[rival.archetype]?.(opportunity.genre) || 1.1;
  const reactionThreshold = 0.3;
  
  let adjustedThreshold = reactionThreshold;
  let adjustedMultiplier = multiplier;
  if (rival.currentMotivation === 'AWARD_CHASE' && (opportunity.genre === 'Drama' || opportunity.genre === 'Historical')) {
    adjustedThreshold += 0.2;
    adjustedMultiplier *= 1.3;
  }
  // 🎭 The Method Actor Tuning: Make rivals with FRANCHISE_BUILDING and MARKET_DISRUPTION motivations bid more aggressively.
  if (rival.currentMotivation === 'FRANCHISE_BUILDING' && (opportunity.genre === 'Sci-Fi' || opportunity.genre === 'Action' || opportunity.genre === 'Fantasy')) {
    adjustedThreshold += 0.25;
    adjustedMultiplier *= 1.6;
  }
  if (rival.currentMotivation === 'MARKET_DISRUPTION') {
    adjustedThreshold += 0.35;
    adjustedMultiplier *= 1.8;
  }

  if (rng.next() < adjustedThreshold) {
    const counterAmount = Math.floor(playerBid * rng.range(1.05, 1.15) * adjustedMultiplier);
    const cashLimit = rival.currentMotivation === 'MARKET_DISRUPTION' ? 0.8 : (rival.currentMotivation === 'FRANCHISE_BUILDING' ? 0.6 : 0.4);
    if (counterAmount < rival.cash * cashLimit) {
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

export function getLiveCounterBid(opportunity: Opportunity, increment: number = 0.1): number {
  const currentMax = Math.max(...Object.values(opportunity.bids || {}).map(b => b.amount), opportunity.costToAcquire);
  return Math.round(currentMax * (1 + increment) / 1000) * 1000;
}
