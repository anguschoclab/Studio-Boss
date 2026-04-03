import { SeriesProject } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Pure function to calculate weekly TV viewership/ratings.
 * Influenced by Buzz, Review Score, and Episode number (decay).
 */
export function calculateWeeklyRating(project: SeriesProject, currentBuzz: number, rng: RandomGenerator): number {
  const baseRating = (currentBuzz / 100) * 10; // 0-10 scale
  const qualityMultiplier = (project.reviewScore || 50) / 50;
  
  // 📺 The Syndication Baron: Increased baseline decay for the cutthroat streaming era (viewer retention is harder).
  // Softens decay for established shows to reward consistent season-over-season quality.
  const aired = project.tvDetails?.episodesAired || 1;
  const currentSeason = project.tvDetails?.currentSeason || 1;
  const baseDecayRate = Math.min(0.96, 0.92 + (currentSeason - 1) * 0.01);
  const decayValue = aired > 1 ? Math.pow(baseDecayRate, aired - 1) : 1;
  
  // Water Cooler Effect: High buzz can counteract decay
  const waterCoolerBonus = currentBuzz > 85 ? 1.2 : 1.0;
  
  // Deterministic variance: +/- 5%
  const variance = 0.95 + (rng.next() * 0.1);
  
  const finalRating = baseRating * qualityMultiplier * decayValue * waterCoolerBonus * variance;
  
  return Math.min(10, Math.max(0.1, Math.round(finalRating * 10) / 10));
}
