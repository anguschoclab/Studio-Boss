import { GameState, RivalStudio, StudioMotivation, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Utility Scores for each Studio Motivation.
 * Each function returns a weight (0-100) based on the current context.
 */
const MotivationScores: Record<StudioMotivation, (rival: RivalStudio, state: GameState) => number> = {
  // 🎭 Method Actor Tuning: Adjusted motivation scores to create more emergent and realistic studio behavior.
  CASH_CRUNCH: (rival) => (rival.cash < 1000000 ? 100 : 0),
  AWARD_CHASE: (rival) => (rival.prestige < 60 && rival.cash > 5000000 ? 95 : (rival.prestige > 80 ? 85 : 30)) + (rival.motivationProfile.prestige > 70 ? 20 : 0),
  FRANCHISE_BUILDING: (rival) => {
    let score = rival.cash > 4000000 && rival.projectCount < 2 ? 120 : (rival.projectCount > 4 ? 80 : 40);
    // 🎭 The Method Actor Tuning: Prioritize franchise potential by adding 20 to the score when the rival studio cash reserves are low.
    if (rival.cash < 5000000) {
      score += 20;
    }
    return score;
  },
  MARKET_DISRUPTION: (rival) => {
    let score = (rival.motivationProfile.aggression > 75 && rival.cash > 2000000 ? 85 : 15) + (rival.motivationProfile.aggression > 80 && rival.cash > 10000000 ? 40 : 0);
    // 🎭 The Method Actor Tuning: Substantial score boost for mega-studios to simulate aggressive market leaders starving out smaller competitors.
    if (rival.cash > 50000000 && rival.prestige > 70) {
      score += 40;
    }
    return score;
  },
  // 🎭 The Method Actor Tuning: Studios in dire financial straits will aggressively seek stability rather than continuing to spend normally.
  STABILITY: (rival) => (rival.cash < 2000000 ? 90 : (rival.cash <= 3000000 ? 60 : 10)),
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
  const rivalsList = Object.values(state.entities.rivals || {});
  return rivalsList.map(rival => ({
    type: 'RIVAL_UPDATED',
    payload: {
      rivalId: rival.id,
      update: { currentMotivation: calculateRivalMotivation(rival, state, rng) }
    }
  }));
}
