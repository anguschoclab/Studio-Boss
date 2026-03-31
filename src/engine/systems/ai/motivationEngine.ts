import { GameState, RivalStudio, StudioMotivation, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Utility Scores for each Studio Motivation.
 * Each function returns a weight (0-100) based on the current context.
 */
const MotivationScores: Record<StudioMotivation, (rival: RivalStudio, state: GameState) => number> = {
  CASH_CRUNCH: (rival) => (rival.cash < 500000 ? 100 : 0),
  AWARD_CHASE: (rival) => (rival.prestige > 70 ? 80 : 20),
  FRANCHISE_BUILDING: (rival) => (Object.keys(rival.projects).length > 3 ? 90 : 30),
  MARKET_DISRUPTION: (rival) => (rival.motivationProfile.aggression > 70 ? 70 : 10),
  STABILITY: (rival) => (rival.cash > 2000000 ? 50 : 0),
};

/**
 * AI Decision Brain (Target C1).
 * Pure function that evaluates the best focus for a Rival Studio.
 */
export function calculateRivalMotivation(rival: RivalStudio, state: GameState, rng: RandomGenerator): StudioMotivation {
  let bestScore = -1;
  let bestMotivation: StudioMotivation = 'STABILITY';

  Object.entries(MotivationScores).forEach(([motivation, scorer]) => {
    // Add profile bias
    const baseScore = scorer(rival, state);
    const bias = (rival.motivationProfile as any)[motivation.toLowerCase()] || 0;
    
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
  return state.industry.rivals.map(rival => ({
    type: 'RIVAL_UPDATED',
    payload: {
      rivalId: rival.id,
      update: { currentMotivation: calculateRivalMotivation(rival, state, rng) }
    }
  }));
}
