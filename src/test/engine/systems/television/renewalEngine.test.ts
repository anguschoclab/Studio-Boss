import { describe, it, expect } from 'vitest';
import { SeriesProject } from '../../../../engine/types';
import { evaluateRenewal } from '../../../../engine/systems/television/renewalEngine';

describe('Renewal Engine (Target B2)', () => {
  const mockSeries: SeriesProject = {
    id: 'tv2',
    title: 'Canceled Show',
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
    weeksInPhase: 10,
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
    tvDetails: {
      episodesAired: 10,
      episodesOrdered: 10,
      status: 'ON_AIR',
      averageRating: 2.1,
      currentSeason: 1,
      episodesCompleted: 10
    }
  } as SeriesProject;

  it('should cancel a show if its average rating is below the threshold', () => {
      // Assuming threshold for this network is 5.0
      const nextStatus = evaluateRenewal(mockSeries, 2.1, 5.0);
      expect(nextStatus).toBe('CANCELLED');
  });

  it('should renew a show if its average rating is above the threshold', () => {
      const nextStatus = evaluateRenewal(mockSeries, 8.5, 5.0);
      expect(nextStatus).toBe('RENEWED');
  });

  it('should keep a show ON_AIR if season is not finished', () => {
      const unfinishedSeries = {
          ...mockSeries,
          tvDetails: { ...mockSeries.tvDetails, episodesAired: 5, episodesOrdered: 10 }
      } as SeriesProject;
      const nextStatus = evaluateRenewal(unfinishedSeries, 8.5, 5.0);
      expect(nextStatus).toBe('ON_AIR');
  });
});
