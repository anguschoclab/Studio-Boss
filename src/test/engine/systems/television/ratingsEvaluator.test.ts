import { describe, it, expect } from 'vitest';
import { SeriesProject, StateImpact } from '@/engine/types';
import { calculateWeeklyRating } from '@/engine/systems/television/ratingsEvaluator';

describe('Ratings Evaluator (Target B2)', () => {
  const mockSeries: SeriesProject = {
    id: 'tv1',
    title: 'The Bear',
    type: 'SERIES',
    buzz: 80,
    reviewScore: 90,
    tvDetails: {
      currentSeason: 1,
      episodesOrdered: 8,
      episodesCompleted: 0,
      episodesAired: 2,
      averageRating: 0,
      status: 'ON_AIR'
    }
  } as unknown as SeriesProject;

  it('should calculate viewership based on buzz and quality', () => {
    const rating = calculateWeeklyRating(mockSeries, 80);
    expect(rating).toBeGreaterThan(0);
    expect(rating).toBeLessThanOrEqual(100);
  });

  it('should apply higher decay if the review score is low', () => {
    const badSeries = { ...mockSeries, reviewScore: 20 };
    const rating1 = calculateWeeklyRating(mockSeries, 80);
    const rating2 = calculateWeeklyRating(badSeries, 80);
    // Note: Simple test, logic might vary
    expect(rating2).toBeLessThan(rating1);
  });
});
