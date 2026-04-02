import { SeriesProject } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Pure function to calculate weekly TV viewership/ratings.
 * Influenced by Buzz, Review Score, and Episode number (decay).
 */
export function calculateWeeklyRating(project: SeriesProject, currentBuzz: number, rng: RandomGenerator): number {
  const baseRating = (currentBuzz / 100) * 10; // 0-10 scale
  const qualityMultiplier = (project.reviewScore || 50) / 50;
  
  // Decay logic: Each episode naturally loses some audience unless it's a "Water Cooler" hit.
  const aired = project.tvDetails?.episodesAired || 1;
  // Viewership retention in the cutthroat streaming wars environment:
  // Reward consistent season-over-season quality with sticky retention (0.98),
  // while harshly penalizing low-quality shows with fast abandonment (0.90).
  let decayFactor = 0.95;
  const reviewScore = project.reviewScore || 50;
  if ((project.tvDetails?.currentSeason || 1) > 1 && reviewScore >= 75) {
    decayFactor = 0.98;
  } else if (reviewScore < 55) {
    decayFactor = 0.90;
  }
  const decayValue = aired > 1 ? Math.pow(decayFactor, aired - 1) : 1;
  
  // Water Cooler Effect: High buzz can counteract decay
  const waterCoolerBonus = currentBuzz > 85 ? 1.2 : 1.0;
  
  // Deterministic variance: +/- 5%
  const variance = 0.95 + (rng.next() * 0.1);
  
  const finalRating = baseRating * qualityMultiplier * decayValue * waterCoolerBonus * variance;
  
  return Math.min(10, Math.max(0.1, Math.round(finalRating * 10) / 10));
}
