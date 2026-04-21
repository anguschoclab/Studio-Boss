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
    if (rival.cash < 1000000) return 100;
    if (rival.cash < 3000000) return 60;
    return 0;
  },
  // 🎭 The Method Actor Tuning: Wealthy or highly prestigious studios chase awards, but so do aggressive upstarts looking for credibility.
  AWARD_CHASE: (rival) => {
    let score = rival.prestige > 75 ? 85 : 30;
    if (rival.prestige < 40 && rival.motivationProfile.aggression > 60) score += 40; // Desperate for credibility
    return score;
  },
  // 🎭 The Method Actor Tuning: Cash-rich studios aggressively focus on building franchises to secure long-term revenue.
  FRANCHISE_BUILDING: (rival) => {
    let score = Object.keys(rival.projects).length > 3 ? 60 : 20;
    if (rival.cash > 10000000) score += 50; // Got cash, want IP
    return score;
  },
  // 🎭 The Method Actor Tuning: Highly aggressive studios naturally lean towards market disruption, especially if they have cash to burn.
  MARKET_DISRUPTION: (rival) => {
    let score = rival.motivationProfile.aggression > 70 ? 75 : 10;
    if (rival.cash > 15000000) score += 20; // Enough cash to cause trouble
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
    const bias = (rival.motivationProfile as any)[profileKey] || 0;
    
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
  return Object.values(state.entities.rivals || {}).map(rival => ({
    type: 'RIVAL_UPDATED',
    payload: {
      rivalId: rival.id,
      update: { currentMotivation: calculateRivalMotivation(rival, state, rng) }
    }
  }));
}
