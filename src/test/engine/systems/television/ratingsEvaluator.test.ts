import { describe, it, expect } from 'vitest';
import { SeriesProject } from '../../../../engine/types';
import { calculateWeeklyRating } from '../../../../engine/systems/television/ratingsEvaluator';
import { RandomGenerator } from '../../../../engine/utils/rng';

describe('Ratings Evaluator (Target B2)', () => {
  const rng = new RandomGenerator(12345);
  
  const mockSeries: SeriesProject = {
    id: 'tv1',
    title: 'The Bear',
    type: 'SERIES',
    format: 'tv',
    genre: 'Drama',
    budgetTier: 'mid',
    budget: 10_000_000,
    weeklyCost: 1_000_000,
    targetAudience: 'Prestige',
    flavor: 'Cooking stress',
    state: 'released',
    buzz: 80,
    weeksInPhase: 1,
    developmentWeeks: 10,
    productionWeeks: 10,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: 1,
    activeCrisis: null,
    momentum: 50,
    progress: 100,
    accumulatedCost: 10_000_000,
    contentFlags: [],
    reviewScore: 90,
    scriptHeat: 50,
    scriptEvents: [],
    activeRoles: [],
    tvDetails: {
      currentSeason: 1,
      episodesOrdered: 8,
      episodesCompleted: 8,
      episodesAired: 2,
      averageRating: 0,
      status: 'ON_AIR'
    }
  };

  it('should calculate viewership based on buzz and quality (0-10 scale)', () => {
    const rating = calculateWeeklyRating(mockSeries, 80, rng);
    expect(rating).toBeGreaterThan(0.1);
    expect(rating).toBeLessThanOrEqual(10);
  });

  it('should apply higher decay if the review score is low', () => {
    const badSeries = { ...mockSeries, reviewScore: 20 } as SeriesProject;
    const rating1 = calculateWeeklyRating(mockSeries, 80, rng);
    const rating2 = calculateWeeklyRating(badSeries, 80, rng);
    
    expect(rating2).toBeLessThan(rating1);
  });
});
