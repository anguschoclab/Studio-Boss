import { describe, it, expect } from 'vitest';
import {
  calculateNielsenRatings,
  buildNielsenProfile,
  rankShows,
  NielsenSnapshot
} from '../../../../engine/systems/television/nielsenSystem';
import { SeriesProject } from '../../../../engine/types';
import { RandomGenerator } from '../../../../engine/utils/rng';

describe('Nielsen System (Guild Auditor)', () => {
  const mockSeries: SeriesProject = {
    id: 'tv-1',
    title: 'Test Show',
    type: 'SERIES',
    format: 'tv',
    genre: 'Drama',
    budgetTier: 'mid',
    budget: 10_000_000,
    weeklyCost: 1_000_000,
    targetAudience: 'Prestige',
    flavor: 'Gritty',
    state: 'released',
    buzz: 50,
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
    reviewScore: 50,
    scriptHeat: 50,
    scriptEvents: [],
    activeRoles: [],
    tvDetails: {
      episodesAired: 0,
      episodesOrdered: 10,
      status: 'ON_AIR',
      averageRating: 0,
      currentSeason: 1,
      episodesCompleted: 10
    }
  } as SeriesProject;

  describe('calculateNielsenRatings', () => {
    it('calculates ratings with standard values', () => {
      const rng = new RandomGenerator(42);
      const snapshot = calculateNielsenRatings(mockSeries, 1, 10, rng);

      expect(snapshot.week).toBeDefined();
      expect(snapshot.totalViewers).toBeGreaterThan(0);
      expect(snapshot.demoRatings.length).toBeGreaterThan(0);
      expect(snapshot.trend).toBe('PREMIERE');
    });

    it('handles negative or zero buzz and reviewScore safely', () => {
      const rng = new RandomGenerator(42);
      const terribleSeries = { ...mockSeries, buzz: -100, reviewScore: -50 } as SeriesProject;
      const snapshot = calculateNielsenRatings(terribleSeries, 5, 10, rng);

      expect(snapshot.totalViewers).toBeGreaterThanOrEqual(0);
      // It shouldn't crash or return NaN
      expect(Number.isNaN(snapshot.totalViewers)).toBe(false);
    });

    it('calculates ratings safely when there are 0 total shows (division by zero prevention)', () => {
      const rng = new RandomGenerator(42);
      const snapshot = calculateNielsenRatings(mockSeries, 1, 0, rng);
      expect(snapshot.totalViewers).toBeGreaterThan(0);
      expect(snapshot.householdShare).toBeDefined();
    });

    it('handles negative episodes aired safely', () => {
      const rng = new RandomGenerator(42);
      const snapshot = calculateNielsenRatings(mockSeries, -5, 10, rng);
      // Trend logic falls back to PREMIERE if episodes <= 1
      expect(snapshot.trend).toBe('STABLE');
      expect(snapshot.totalViewers).toBeDefined();
    });
  });

  describe('buildNielsenProfile', () => {
    it('calculates averages and retention correctly from snapshots', () => {
      const mockSnapshots: NielsenSnapshot[] = [
        { week: 1, episodeNumber: 1, totalViewers: 10_000_000, liveSDViewers: 10_000_000, live7Viewers: 10_000_000, keyDemo: 2.0, timeSlot: '9PM', demoRatings: [], householdRating: 2.0, householdShare: 5.0, rank: 1, trend: 'PREMIERE' },
        { week: 2, episodeNumber: 2, totalViewers: 8_000_000, liveSDViewers: 8_000_000, live7Viewers: 8_000_000, keyDemo: 1.6, timeSlot: '9PM', demoRatings: [], householdRating: 1.6, householdShare: 4.0, rank: 2, trend: 'DOWN' },
        { week: 3, episodeNumber: 3, totalViewers: 9_000_000, liveSDViewers: 9_000_000, live7Viewers: 9_000_000, keyDemo: 1.8, timeSlot: '9PM', demoRatings: [], householdRating: 1.8, householdShare: 4.5, rank: 2, trend: 'UP' }
      ];

      const profile = buildNielsenProfile(mockSnapshots, '9PM');

      expect(profile.timeSlot).toBe('9PM');
      expect(profile.seasonAvgViewers).toBe(9_000_000); // (10 + 8 + 9) / 3
      expect(profile.audienceRetention).toBe(90); // 9m / 10m * 100
    });

    it('handles empty snapshots safely', () => {
      const profile = buildNielsenProfile([], 'LATE_NIGHT');

      expect(profile.seasonAvgViewers).toBe(0);
      expect(profile.audienceRetention).toBe(100);
      expect(profile.peakViewers).toBe(0);
      expect(profile.snapshots).toEqual([]);
    });

    it('handles a single snapshot safely', () => {
      const mockSnapshots: NielsenSnapshot[] = [
        { week: 1, episodeNumber: 1, totalViewers: 10_000_000, liveSDViewers: 10_000_000, live7Viewers: 10_000_000, keyDemo: 2.0, timeSlot: '9PM', demoRatings: [], householdRating: 2.0, householdShare: 5.0, rank: 1, trend: 'PREMIERE' }
      ];
      const profile = buildNielsenProfile(mockSnapshots, '9PM');
      expect(profile.seasonAvgViewers).toBe(10_000_000);
      expect(profile.audienceRetention).toBe(100);
    });
  });

  describe('rankShows', () => {
    it('ranks shows based on A18-49 demo rating', () => {
      const map = new Map<string, NielsenSnapshot>();
      map.set('show1', {
        week: 1, episodeNumber: 1, totalViewers: 100, liveSDViewers: 100, live7Viewers: 100, timeSlot: '9PM', keyDemo: 1.5, householdRating: 1, householdShare: 1, rank: 0, trend: 'STABLE',
        demoRatings: [{ demo: 'A18-49', label: 'Adults 18-49', rating: 1.5, viewers: 50 }, { demo: 'P2+', label: 'Total Viewers', rating: 2.0, viewers: 100 }]
      });
      map.set('show2', {
        week: 1, episodeNumber: 1, totalViewers: 100, liveSDViewers: 100, live7Viewers: 100, timeSlot: '9PM', keyDemo: 2.5, householdRating: 1, householdShare: 1, rank: 0, trend: 'STABLE',
        demoRatings: [{ demo: 'A18-49', label: 'Adults 18-49', rating: 2.5, viewers: 80 }]
      });
      map.set('show3', {
        week: 1, episodeNumber: 1, totalViewers: 100, liveSDViewers: 100, live7Viewers: 100, timeSlot: '9PM', keyDemo: 0.5, householdRating: 1, householdShare: 1, rank: 0, trend: 'STABLE',
        demoRatings: [{ demo: 'A18-49', label: 'Adults 18-49', rating: 0.5, viewers: 20 }]
      });

      const ranked = rankShows(map);

      expect(ranked.get('show2')?.rank).toBe(1);
      expect(ranked.get('show1')?.rank).toBe(2);
      expect(ranked.get('show3')?.rank).toBe(3);
    });

    it('handles empty map safely', () => {
      const map = new Map<string, NielsenSnapshot>();
      const ranked = rankShows(map);
      expect(ranked.size).toBe(0);
    });

    it('handles snapshots missing the A18-49 demo gracefully', () => {
      const map = new Map<string, NielsenSnapshot>();
      map.set('show1', {
        week: 1, episodeNumber: 1, totalViewers: 100, liveSDViewers: 100, live7Viewers: 100, timeSlot: '9PM', keyDemo: 0, householdRating: 1, householdShare: 1, rank: 0, trend: 'STABLE',
        demoRatings: [{ demo: 'P2+', label: 'Total Viewers', rating: 2.0, viewers: 100 }] // Missing A18-49
      });
      map.set('show2', {
        week: 1, episodeNumber: 1, totalViewers: 100, liveSDViewers: 100, live7Viewers: 100, timeSlot: '9PM', keyDemo: 1.5, householdRating: 1, householdShare: 1, rank: 0, trend: 'STABLE',
        demoRatings: [{ demo: 'A18-49', label: 'Adults 18-49', rating: 1.5, viewers: 50 }]
      });

      const ranked = rankShows(map);
      // show2 should be rank 1 because it has an A18-49 rating, show1 has 0
      expect(ranked.get('show2')?.rank).toBe(1);
      expect(ranked.get('show1')?.rank).toBe(2);
    });
  });
});
