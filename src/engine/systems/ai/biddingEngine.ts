import { GameState, RivalStudio, Opportunity, StateImpact, ArchetypeKey, TalentPact } from '@/engine/types';
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

  const rivalsList = Object.values(state.entities.rivals || {});

  opportunities.forEach(opportunity => {
    // Current highest bid tracking
    const currentHighest = Object.values(opportunity.bids || {}).reduce((max: number, b) => Math.max(max, b.amount), 0);
    
    rivalsList.forEach(rival => {
      const myBid = opportunity.bids[rival.id]?.amount || 0;

      // Logic for should rebid: Outbid if highest is better AND rival has cash
      // If the player is the highest bidder, AI is more aggressive
      // 🎭 Method Actor Tuning: Player threat makes rivals significantly more aggressive.
      const isPlayerLeading = opportunity.highestBidderId === 'PLAYER';
      const aggressionFactor = isPlayerLeading ? 1.35 : 1.0;

      const isFranchiseBuilder = rival.currentMotivation === 'FRANCHISE_BUILDING';
      const isCashCrunch = rival.currentMotivation === 'CASH_CRUNCH';
      const motivationAggression = (rival.motivationProfile?.aggression || 50) / 100;

      // 🎭 Method Actor Tuning: Franchise builders are willing to run low on liquidity to grab key assets.
      const liquidityBuffer = isFranchiseBuilder ? 1.05 : (isCashCrunch ? 1.5 : 1.25 - (motivationAggression * 0.15));

      // Determine the minimum bid floor (current highest or reserve cost)
      const bidFloor = Math.max(currentHighest, opportunity.costToAcquire);

      if (myBid < bidFloor && rival.cash > bidFloor * liquidityBuffer) {
        // 🎭 Method Actor Tuning: Massive spike in multiplier if franchise builders bid on Sci-Fi/Action.
        const isKeyIPGenre = opportunity.genre === 'Sci-Fi' || opportunity.genre === 'Action' || opportunity.genre === 'Fantasy';
        const franchiseAggression = isFranchiseBuilder && isKeyIPGenre ? 1.5 : (isFranchiseBuilder ? 1.2 : 1.0);

        const multiplier = (ArchetypeMultipliers[rival.archetype]?.(opportunity.genre) || 1.0) * aggressionFactor * franchiseAggression;
        const newBid = Math.floor(bidFloor * (1 + (rng.range(1.05, 1.25) - 1) * multiplier));

        // 🎭 Method Actor Tuning: Raise the max bid cap for franchise builders and aggressive studios so they don't give up easily.
        const maxBidCap = isFranchiseBuilder ? 0.65 : (isCashCrunch ? 0.15 : 0.40 + (motivationAggression * 0.1));
        if (newBid < rival.cash * maxBidCap) {
          impacts.push({
            type: 'OPPORTUNITY_UPDATED',
            payload: {
              opportunityId: opportunity.id,
              rivalId: rival.id,
              bid: { amount: newBid, terms: 'aggressive' }
            }
          });

          // Industry News for significant bidding wars
          if (newBid > 10_000_000 && rng.next() < 0.2) {
            impacts.push({
              type: 'NEWS_ADDED',
              payload: {
                id: rng.uuid('news'),
                headline: `STREET TALK: ${rival.name} desperate for "${opportunity.title}"?`,
                description: `${rival.name} has escalated the bidding for "${opportunity.title}", signaling they might view it as a cornerstone asset for their next slate.`,
                category: 'market',
                week: state.week
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
 * AI Talent Competition.
 * AI Studios with >$100M cash scan talent pool every 4 weeks to assign pacts.
 */
export function tickTalentCompetition(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  if (state.week % 4 !== 0) return [];

  const rivalsList = Object.values(state.entities.rivals || {});
  const eligibleRivals = rivalsList.filter(r => r.cash > 100_000_000);
  if (eligibleRivals.length === 0) return [];

  const availableTalent = Object.values(state.entities.talents).filter(t => t.prestige > 85 && !t.contractId);
  
  if (availableTalent.length === 0) return [];

  eligibleRivals.forEach(rival => {
    if (rng.next() < 0.1) {
      const target = rng.pick(availableTalent);

      // 🎭 Method Actor Tuning: Auteur directors heavily favor prestige, demanding massive premiums if the studio lacks it, but will accept major discounts for highly prestigious studios.
      const isAuteur = target.prestige > 85;
      const prestigeDelta = target.prestige - rival.prestige;
      let prestigePenalty = 0;
      if (isAuteur) {
        if (prestigeDelta > 10) {
          prestigePenalty = prestigeDelta * 0.25; // Massive penalty for low prestige
        } else if (prestigeDelta < -10) {
          prestigePenalty = -0.6; // Massive discount for high prestige
        } else if (prestigeDelta > 0) {
          prestigePenalty = prestigeDelta * 0.1;
        }
      }

      const lockFee = target.fee * (1.5 + rng.next() + prestigePenalty);
      
      if (rival.cash > lockFee * 2) {
         const pact: TalentPact = {
           id: rng.uuid('pact'),
           talentId: target.id,
           studioId: rival.id,
           type: 'first_look',
           startDate: state.week,
           endDate: state.week + 52,
           weeklyOverhead: Math.floor(lockFee * 0.05),
           exclusivity: true,
           status: 'active'
         };

         impacts.push({
           type: 'RIVAL_UPDATED',
           payload: {
             rivalId: rival.id,
             update: {
               cash: rival.cash - lockFee
               // Removed pacts update as it is not on RivalStudio type
             }
           }
         });

         impacts.push({
           type: 'NEWS_ADDED',
           payload: {
             id: rng.uuid('news'),
             headline: `BIDDING WAR: ${rival.name} locks down ${target.name}`,
             description: `In a major coup, ${rival.name} has signed ${target.name} to an exclusive first-look deal worth an estimated $${(lockFee / 1000000).toFixed(1)}M.`,
             category: 'talent',
             week: state.week
           }
         });
      }
    }
  });

  return impacts;
}

/**
 * Live Reaction Bidding.
 */
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
 */
export function getLiveCounterBid(opportunity: Opportunity, increment: number = 0.1): number {
  const currentMax = Math.max(...Object.values(opportunity.bids || {}).map(b => b.amount), opportunity.costToAcquire);
  return Math.round(currentMax * (1 + increment) / 1000) * 1000;
}
