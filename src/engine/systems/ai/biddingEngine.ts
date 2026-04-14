import { GameState, RivalStudio, Opportunity, StateImpact, ArchetypeKey, TalentPact, Project } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { AgencyLeverageEngine } from './AgencyLeverage';
import { TalentAgentInteractionEngine } from '../talent/talentAgentInteractions';
import { calculateWillingness } from '../talent/willingnessEngine';

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
    
    // ⚡ Bolt: Hoisted leverage calculation out of the rivals loop to prevent O(R * A) repeated agency lookups
    let opportunityLeverageAggression = 1.0;
    if (opportunity.attachedTalentIds && opportunity.attachedTalentIds.length > 0) {
      const mainTalent = state.entities.talents[opportunity.attachedTalentIds[0]];
      if (mainTalent) {
        const agency = mainTalent.agencyId ? state.industry.agencies.find(a => a.id === mainTalent.agencyId) : undefined;
        const agent = mainTalent.agentId ? state.industry.agents.find(a => a.id === mainTalent.agentId) : undefined;
        const leverage = AgencyLeverageEngine.calculateNegotiationLeverage(
          mainTalent,
          agency,
          agent,
          state.finance.marketState
        );
        // High leverage agencies make the project more desirable/expensive
        opportunityLeverageAggression = 1.0 + (leverage.score * 0.3);
      }
    }

    rivalsList.forEach(rival => {
      const myBid = opportunity.bids[rival.id]?.amount || 0;

      // Logic for should rebid: Outbid if highest is better AND rival has cash
      // If the player is the highest bidder, AI is more aggressive
      // 🎭 The Method Actor Tuning: Player threat makes rivals significantly more aggressive.
      const isPlayerLeading = opportunity.highestBidderId === 'PLAYER';
      const aggressionFactor = isPlayerLeading ? 1.5 : 1.0;

      const isFranchiseBuilder = rival.currentMotivation === 'FRANCHISE_BUILDING';
      const isCashCrunch = rival.currentMotivation === 'CASH_CRUNCH';
      const isMarketDisruptor = rival.currentMotivation === 'MARKET_DISRUPTION';
      const isAwardChaser = rival.currentMotivation === 'AWARD_CHASE';
      const motivationAggression = (rival.motivationProfile?.aggression || 50) / 100;

      // 🎭 The Method Actor Tuning: Franchise builders are willing to run low on liquidity to grab key assets.
      // Market disruptors run even lower.
      const liquidityBuffer = isMarketDisruptor ? 1.02 : (isFranchiseBuilder ? 1.05 : (isAwardChaser ? 1.10 : (isCashCrunch ? 1.5 : 1.25 - (motivationAggression * 0.15))));

      // Determine the minimum bid floor (current highest or reserve cost)
      const bidFloor = Math.max(currentHighest, opportunity.costToAcquire);

      if (myBid < bidFloor && rival.cash > bidFloor * liquidityBuffer) {
        // Phase 2: Agency Leverage Integration
        const leverageAggression = opportunityLeverageAggression;

        // 🎭 The Method Actor Tuning: Massive spike in multiplier if franchise builders bid on Sci-Fi/Action.
        const isKeyIPGenre = opportunity.genre === 'Sci-Fi' || opportunity.genre === 'Action' || opportunity.genre === 'Fantasy';
        const franchiseAggression = isFranchiseBuilder && isKeyIPGenre ? 1.5 : (isFranchiseBuilder ? 1.2 : 1.0);

        // 🎭 The Method Actor Tuning: Award chasers aggressively overpay for Drama/Historical.
        const isPrestigeGenre = opportunity.genre === 'Drama' || opportunity.genre === 'Historical' || opportunity.genre === 'Biopic';
        const awardAggression = isAwardChaser && isPrestigeGenre ? 1.4 : (isAwardChaser ? 1.1 : 1.0);

        // 🎭 The Method Actor Tuning: Disruptors bid aggressively across the board to box out competitors.
        const disruptorAggression = isMarketDisruptor ? 1.6 : 1.0;

        const multiplier = (ArchetypeMultipliers[rival.archetype]?.(opportunity.genre) || 1.0) * aggressionFactor * franchiseAggression * awardAggression * disruptorAggression * leverageAggression;
        const newBid = Math.floor(bidFloor * (1 + (rng.range(1.05, 1.25) - 1) * multiplier));

        // 🎭 The Method Actor Tuning: Raise the max bid cap for franchise builders and aggressive studios so they don't give up easily.
        const maxBidCap = Math.min(0.95, (isMarketDisruptor ? 0.90 : (isFranchiseBuilder ? 0.80 : (isAwardChaser && isPrestigeGenre ? 0.75 : (isCashCrunch ? 0.15 : 0.40 + (motivationAggression * 0.1))))) * leverageAggression);
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
                id: rng.uuid('NWS'),
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

      // Headless NPC: Use willingnessEngine to evaluate talent willingness for pact signing
      // Create a dummy project for willingness calculation (pacts are studio-wide, not project-specific)
      const dummyProject: Project = {
        id: 'dummy-pact-project',
        title: 'First-Look Pact',
        genre: 'Drama', // Neutral genre for pact evaluation
        budget: rival.cash * 0.1, // Representative budget
        buzz: rival.prestige,
        reviewScore: 70,
        state: 'development',
        weeksInPhase: 0,
        ownerId: rival.id
      } as any;

      const willingnessReport = calculateWillingness(target, dummyProject, state);

      // Skip if talent is unwilling to sign with this studio
      if (willingnessReport.finalVerdict === 'unwilling') {
        return;
      }

      // 🎭 The Method Actor Tuning: Auteur directors heavily favor prestige, demanding massive premiums if the studio lacks it, but will accept major discounts for highly prestigious studios.
      const isAuteur = target.prestige > 85;
      const prestigeDelta = target.prestige - rival.prestige;
      const isMoneyGrabber = target.currentMotivation === 'MONEY_GRABBER';

      // 🎭 The Method Actor Tuning: Auteurs heavily favor prestige. They will flat-out reject low prestige studios unless they are money grabbers.
      if (isAuteur && prestigeDelta > 20 && !isMoneyGrabber) {
          return;
      }

      let prestigePenalty = 0;
      // 🎭 The Method Actor Tuning: Money grabbers ignore prestige penalties but demand massive base fee increases.
      if (isAuteur && !isMoneyGrabber) {
        if (prestigeDelta > 10) {
          prestigePenalty = prestigeDelta * 0.40; // Massive penalty for low prestige
        } else if (prestigeDelta < -10) {
          prestigePenalty = -0.6; // Massive discount for high prestige
        } else if (prestigeDelta > 0) {
          prestigePenalty = prestigeDelta * 0.1;
        }
      }

      let lockFeeMultiplier = 1.5;
      if (isMoneyGrabber) {
        lockFeeMultiplier = 2.0;
      }

      const lockFee = target.fee * (lockFeeMultiplier + rng.next() + prestigePenalty);
      
      // Phase 2: Agency Leverage Integration
      const agency = target.agencyId ? state.industry.agencies.find(a => a.id === target.agencyId) : undefined;
      const agent = target.agentId ? state.industry.agents.find(a => a.id === target.agentId) : undefined;
      const leverage = AgencyLeverageEngine.calculateNegotiationLeverage(
        target,
        agency,
        agent,
        state.finance.marketState
      );
      let leveragedFee = AgencyLeverageEngine.getRequiredFee(lockFee, leverage);

      // Phase 3: Talent-Agent Relationship Bonus
      let relationshipBonus = 0;
      if (target.agentId) {
        const relationship = state.talentAgentRelationships[`${target.id}-${target.agentId}`];
        if (relationship) {
          relationshipBonus = TalentAgentInteractionEngine.getLoyaltyBonus(relationship);
          // Apply loyalty bonus to reduce lock fee
          leveragedFee = leveragedFee * (1 - (relationshipBonus / 100));
        }
      }

      if (rival.cash > leveragedFee * 2) {
         impacts.push({
           type: 'RIVAL_UPDATED',
           payload: {
             rivalId: rival.id,
             update: {
               cash: rival.cash - leveragedFee
             }
           }
         });

         impacts.push({
           type: 'NEWS_ADDED',
           payload: {
             id: rng.uuid('NWS'),
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
  // 🎭 The Method Actor Tuning: Increased reaction aggression
  const reactionThreshold = 0.3;
  
  // 🎭 The Method Actor Tuning: Adjust reaction thresholds and multipliers based on motivation
  let adjustedThreshold = reactionThreshold;
  let adjustedMultiplier = multiplier;
  if (rival.currentMotivation === 'AWARD_CHASE' && (opportunity.genre === 'Drama' || opportunity.genre === 'Historical')) {
    adjustedThreshold += 0.2;
    adjustedMultiplier *= 1.3;
  }
  if (rival.currentMotivation === 'FRANCHISE_BUILDING' && (opportunity.genre === 'Sci-Fi' || opportunity.genre === 'Action' || opportunity.genre === 'Fantasy')) {
    adjustedThreshold += 0.25;
    adjustedMultiplier *= 1.4;
  }
  if (rival.currentMotivation === 'MARKET_DISRUPTION') {
    adjustedThreshold += 0.35;
    adjustedMultiplier *= 1.5;
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

/**
 * Player UI Helper.
 */
export function getLiveCounterBid(opportunity: Opportunity, increment: number = 0.1): number {
  const currentMax = Math.max(...Object.values(opportunity.bids || {}).map(b => b.amount), opportunity.costToAcquire);
  return Math.round(currentMax * (1 + increment) / 1000) * 1000;
}
