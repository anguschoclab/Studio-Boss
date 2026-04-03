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

  opportunities.forEach(opportunity => {
    // Current highest bid tracking
    const currentHighest = Object.values(opportunity.bids || {}).reduce((max: number, b) => Math.max(max, b.amount), 0);
    
    state.industry.rivals.forEach(rival => {
      const myBid = opportunity.bids[rival.id]?.amount || 0;

      // Logic for should rebid: Outbid if highest is better AND rival has cash
      // If the player is the highest bidder, AI is more aggressive
      const isPlayerLeading = opportunity.highestBidderId === 'PLAYER';
      const aggressionFactor = isPlayerLeading ? 1.2 : 1.0;

      // 🎭 Method Actor Tuning: Adjusted bidding logic to be more dynamic based on AI motivation.
      const isFranchiseBuilder = rival.currentMotivation === 'FRANCHISE_BUILDING';
      const isCashCrunch = rival.currentMotivation === 'CASH_CRUNCH';
      const motivationAggression = (rival.motivationProfile?.aggression || 50) / 100;

      const liquidityBuffer = isFranchiseBuilder ? 1.1 : (isCashCrunch ? 1.5 : 1.3 - (motivationAggression * 0.1));

      if (myBid < currentHighest && rival.cash > currentHighest * liquidityBuffer) {
        const multiplier = (ArchetypeMultipliers[rival.archetype]?.(opportunity.genre) || 1.0) * aggressionFactor * (isFranchiseBuilder ? 1.2 : 1.0);
        const newBid = Math.floor(currentHighest * (1 + (rng.range(1.05, 1.2) - 1) * multiplier));

        // Cap bid at 35% of total rival cash for "Strategic" behavior
        const maxBidCap = isFranchiseBuilder ? 0.5 : (isCashCrunch ? 0.2 : 0.35 + (motivationAggression * 0.05));
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
 * AI Talent Competition.
 * AI Studios with >$100M cash scan talent pool every 12 weeks to assign pacts.
 * Top 10% talent (prestige > 85) triggers a "Bidding War" news event.
 */
export function tickTalentCompetition(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  
  // Only run talent competition once every 4 weeks to avoid saturation
  if (state.week % 4 !== 0) return [];

  const eligibleRivals = state.industry.rivals.filter(r => r.cash > 100_000_000);
  if (eligibleRivals.length === 0) return [];

  // Find highly desirable talent (top 10% prestige) who are not currently signed to a first-look deal
  const signedTalentIds = new Set<string>();
  state.industry.rivals.forEach(r => {
    // Note: In this version, we assume rival.contracts or similar might hold pacts if they were added.
    // For now we check the player's deals and any future rival deals.
  });

  const availableTalent = Object.values(state.industry.talentPool).filter(t => t.prestige > 85);
  
  if (availableTalent.length === 0) return [];

  eligibleRivals.forEach(rival => {
    if (rng.next() < 0.1) { // 10% chance per eligible rival per 4 weeks
      const target = rng.pick(availableTalent);
      const lockFee = target.fee * (1.5 + rng.next());
      
      if (rival.cash > lockFee * 2) {
         // Create a pact for the rival
         const pact: TalentPact = {
           id: rng.uuid('pact'),
           talentId: target.id,
           studioId: rival.id,
           type: 'first_look',
           weeksRemaining: 52,
           expiryWeek: state.week + 52,
           weeklyOverheadCost: Math.floor(lockFee * 0.05),
           exclusivity: true
         };

         impacts.push({
           type: 'INDUSTRY_UPDATE',
           payload: {
             update: {
               // We need a way to store rival pacts. 
               // For now, let's assume they are handled by IndustryUpdate or specific rival fields.
             },
             rival: {
               rivalId: rival.id,
               update: {
                 cash: rival.cash - lockFee
                 // In a real implementation, we'd add 'pacts' to RivalStudio
               }
             }
           }
         });

         impacts.push({
           type: 'NEWS_ADDED',
           payload: {
             headline: `BIDDING WAR: ${rival.name} locks down ${target.name}`,
             description: `In a major coup, ${rival.name} has signed ${target.name} to an exclusive first-look deal worth an estimated $${(lockFee / 1000000).toFixed(1)}M.`,
             category: 'talent'
           }
         });
      }
    }
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
