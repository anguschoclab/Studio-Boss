import { SeriesProject } from '@/engine/types';

/**
 * Pure function to calculate weekly TV viewership/ratings.
 * Influenced by Buzz, Review Score, and Episode number (decay).
 */
export function calculateWeeklyRating(project: SeriesProject, currentBuzz: number): number {
  const baseRating = (currentBuzz / 100) * 10; // 0-10 scale
  const qualityMultiplier = (project.reviewScore || 50) / 50;
  
  // Decay logic: Each episode naturally loses some audience unless it's a "Water Cooler" hit.
  const aired = project.tvDetails?.episodesAired || 1;
  const decayValue = aired > 1 ? Math.pow(0.95, aired - 1) : 1;
  
  // Water Cooler Effect: High buzz can counteract decay
  const waterCoolerBonus = currentBuzz > 85 ? 1.2 : 1.0;
  
  const finalRating = baseRating * qualityMultiplier * decayValue * waterCoolerBonus;
  
  return Math.min(10, Math.max(0.1, Math.round(finalRating * 10) / 10));
}
