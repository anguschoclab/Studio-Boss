import { describe, it, expect } from 'vitest';
import { Project, FilmProject, SeriesProject } from '@/engine/types/project.types';

describe('Unified Project Schema (Target A1)', () => {
  it('should allow casting a BaseProject to a FilmProject via discriminator', () => {
    const project: Project = {
      id: 'p1',
      title: 'Interstellar 2',
      type: 'FILM',
      format: 'film',
      genre: 'Sci-Fi',
      budgetTier: 'blockbuster',
      budget: 200000000,
      weeklyCost: 1000000,
      targetAudience: 'General',
      flavor: 'Space epic',
      state: 'production',
      buzz: 50,
      weeksInPhase: 5,
      developmentWeeks: 20,
      productionWeeks: 20,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: null,
      activeCrisis: null,
      momentum: 50,
      progress: 0,
      accumulatedCost: 0
    } as Project;

    expect(project.type).toBe('FILM');
    if (project.type === 'FILM') {
      const film: FilmProject = project;
      expect(film.type).toBe('FILM');
    }
  });

  it('should allow casting a BaseProject to a SeriesProject via discriminator', () => {
    const project: Project = {
      id: 'p2',
      title: 'The Office 2.0',
      type: 'SERIES',
      format: 'tv',
      genre: 'Comedy',
      budgetTier: 'mid',
      budget: 20000000,
      weeklyCost: 100000,
      targetAudience: 'General',
      flavor: 'Workplace comedy',
      state: 'production',
      buzz: 50,
      weeksInPhase: 5,
      developmentWeeks: 20,
      productionWeeks: 20,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: null,
      activeCrisis: null,
      scriptHeat: 50,
      activeRoles: [],
      scriptEvents: [],
      momentum: 50,
      progress: 0,
      accumulatedCost: 0,
      tvDetails: {
        currentSeason: 1,
        episodesOrdered: 10,
        episodesCompleted: 0,
        episodesAired: 0,
        averageRating: 0,
        status: 'ON_AIR'
      }
    } as Project;

    expect(project.type).toBe('SERIES');
    if (project.type === 'SERIES' && project.format === 'tv' && 'tvDetails' in project && 'scriptHeat' in project) {
      const series: SeriesProject = project;
      expect(series.tvDetails).toBeDefined();
      expect(series.tvDetails?.status).toBe('ON_AIR');
    }
  });
});
