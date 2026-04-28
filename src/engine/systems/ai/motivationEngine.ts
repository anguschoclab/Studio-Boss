import { GameState, RivalStudio, StudioMotivation, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Utility Scores for each Studio Motivation.
 * Each function returns a weight (0-100) based on the current context.
 */
const MotivationScores: Record<StudioMotivation, (rival: RivalStudio, state: GameState) => number> = {
  // 🎭 The Method Actor Tuning: Studio motivations emerge dynamically from their material conditions.
  // Desperate studios with low cash heavily index towards CASH_CRUNCH.
  CASH_CRUNCH: (rival) => {
    if (rival.cash < 5000000) return 100;
    if (rival.cash < 10000000) return 60;
    return 0;
  },
  // 🎭 The Method Actor Tuning: Wealthy or highly prestigious studios chase awards, but so do aggressive upstarts looking for credibility.
  AWARD_CHASE: (rival) => {
    let score = rival.prestige > 75 ? 85 : 30;
    if (rival.prestige < 40 && rival.motivationProfile.aggression > 60) score += 40; // Desperate for credibility
    if (rival.cash > 15000000 && rival.prestige > 70) score += 40; // Rich studios pivot to awards
    return score;
  },
  // 🎭 The Method Actor Tuning: Cash-rich studios aggressively focus on building franchises to secure long-term revenue.
  FRANCHISE_BUILDING: (rival) => {
    let score = Object.keys(rival.projects).length > 3 ? 60 : 20;
    if (rival.cash > 10000000) score += 40; // Got cash, want IP
    if (rival.cash > 20000000) score += 30; // Extreme cash makes them hoard IP
    return score;
  },
  // 🎭 The Method Actor Tuning: Highly aggressive studios naturally lean towards market disruption, especially if they have cash to burn.
  MARKET_DISRUPTION: (rival) => {
    let score = rival.motivationProfile.aggression > 70 ? 75 : 10;
    if (rival.cash > 15000000) score += 20; // Enough cash to cause trouble
    if (rival.prestige > 75 && rival.motivationProfile.aggression > 70) score += 40; // Prestige bullies
    return score;
  },
  // 🎭 The Method Actor Tuning: Stability is the fallback for wealthy, low-aggression studios.
  STABILITY: (rival) => (rival.cash > 5000000 && rival.motivationProfile.aggression < 50 ? 80 : 20),
};

/**
 * AI Decision Brain (Target C1).
 * Pure function that evaluates the best focus for a Rival Studio.
 */
export function calculateRivalMotivation(rival: RivalStudio, state: GameState, rng: RandomGenerator): StudioMotivation {
  let bestScore = -1;
  let bestMotivation: StudioMotivation = 'STABILITY';

  const profileMap: Record<StudioMotivation, keyof import('@/engine/types').MotivationProfile> = {
    CASH_CRUNCH: 'financial',
    AWARD_CHASE: 'prestige',
    FRANCHISE_BUILDING: 'legacy',
    MARKET_DISRUPTION: 'aggression',
    STABILITY: 'financial'
  };

  Object.entries(MotivationScores).forEach(([motivation, scorer]) => {
    // Add profile bias
    const baseScore = scorer(rival, state);
    const profileKey = profileMap[motivation as StudioMotivation];
    const bias = Number(rival.motivationProfile[profileKey as keyof typeof rival.motivationProfile]) || 0;
    
    // Add small stochastic variance for strategy shifts
    const variance = rng.range(-5, 5);
    const finalScore = baseScore + bias + variance;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestMotivation = motivation as StudioMotivation;
    }
  });

  return bestMotivation;
}

/**
 * Weekly tick to update AI mindsets across the industry.
 */
export function tickAIMinds(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  Object.values(state.entities.rivals || {}).forEach(rival => {
    let newMotivation: StudioMotivation = calculateRivalMotivation(rival, state, rng);

    // Fix 3: Prestige decay — rivals that haven't won an award in 2+ years drift toward AWARD_CHASE
    const lastAwardWin = (rival as Record<string, unknown>).lastAwardWin as number | undefined;
    const weeksSinceLastAward = lastAwardWin
      ? (state.week - lastAwardWin)
      : 999;

    // 🎭 The Method Actor Tuning: Prestige studios panic and pivot to chasing awards much faster (1 year vs 2 years) if they are starved.
    const awardStarvedThreshold = rival.prestige > 75 ? 52 : 104;

    if (weeksSinceLastAward > awardStarvedThreshold && newMotivation !== 'AWARD_CHASE' && rng.next() < 0.15) {
      // 15% chance per week to switch to AWARD_CHASE if award-starved
      newMotivation = 'AWARD_CHASE';
    }

    impacts.push({
      type: 'RIVAL_UPDATED',
      payload: {
        rivalId: rival.id,
        update: { currentMotivation: newMotivation }
      }
    });

    // CASH_CRUNCH rivals seek emergency financing when nearly broke
    if (newMotivation === 'CASH_CRUNCH' && rival.cash < 2_000_000 && rng.next() < 0.12) {
      const loanAmount = rng.range(5_000_000, 15_000_000);
      impacts.push({
        type: 'RIVAL_UPDATED',
        payload: { rivalId: rival.id, update: { cash: rival.cash + loanAmount } }
      });
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: `${rival.name} SECURES EMERGENCY FINANCING`,
          description: `${rival.name} draws on a credit facility to stabilise operations amid cash pressure.`,
        }
      } as import('@/engine/types').StateImpact);
    }

    // Fix 2: FRANCHISE_BUILDING rivals track IP syndication potential
    if (rival.currentMotivation === 'FRANCHISE_BUILDING') {
      const releasedProjects = Object.values(state.entities.projects || {})
        .filter(p => p.ownerId === rival.id && p.state === 'released');

      const syndicationEligible = releasedProjects.filter(p => {
        // TV projects with enough aired episodes qualify for syndication
        return p.format === 'tv' && (p as import('@/engine/types').SeriesProject).tvDetails?.episodesAired !== undefined && (p as import('@/engine/types').SeriesProject).tvDetails!.episodesAired >= 65;
      });

      if (syndicationEligible.length > 0) {
        // Generate passive income for rival from syndicated IP
        const syndicationRevenue = syndicationEligible.length * 200000; // $200k per show per week
        impacts.push({
          type: 'RIVAL_UPDATED',
          payload: {
            rivalId: rival.id,
            update: { cash: rival.cash + syndicationRevenue }
          }
        });
      }
    }
  });

  return impacts;
}
