import { describe, it, expect } from 'vitest';
import { runAwardsCeremony } from '../../../engine/systems/awards';
import { GameState, Project } from '../../../engine/types';
import { createMockGameState } from '../../utils/mockFactories';

describe('TV Awards Filtering & Taxonomy', () => {
  // const rng = new RandomGenerator(state.seed + 123);

  const createTvProject = (id: string, format: any, criticScore: number, genre: string = 'Comedy'): Project => ({
    id,
    title: `${id} Show`,
    type: 'SERIES' as const,
    format: 'tv' as const,
    tvFormat: format,
    genre,
    state: 'released' as const,
    releaseWeek: 10,
    budget: 1000000,
    revenue: 0,
    buzz: 50,
    weeksInPhase: 5,
    reviewScore: criticScore,
    awardsProfile: {
      criticScore,
      prestigeScore: criticScore,
      craftScore: criticScore,
      culturalHeat: 50,
      campaignStrength: 0,
      academyAppeal: 0,
      guildAppeal: 0,
      populistAppeal: 0,
      indieCredibility: 0,
      industryNarrativeScore: 0
    },
    reception: {
      metaScore: criticScore,
      audienceScore: criticScore,
      status: 'Acclaimed',
      reviews: [],
      isCultPotential: false
    },
    awards: []
  } as any);

  const baseState = (projects: Record<string, any>): GameState => {
    const state = createMockGameState({ week: 37 }); // Primetime Emmy Week
    state.entities.projects = projects;
    return state;
  };

  it('should award Best Series at Primetime Emmys to a high-scoring TV project', () => {
    const dramaShow = createTvProject('drama_1', 'prestige_drama', 95, 'Drama');
    const sitcomShow = createTvProject('sitcom_1', 'sitcom', 80, 'Comedy');

    const impacts = runAwardsCeremony(
      baseState({ drama_1: dramaShow, sitcom_1: sitcomShow }),
      37, 2026
    );

    expect(impacts.newAwards).toBeDefined();
    const bestSeries = impacts.newAwards?.find((a: any) => a.category === 'Best Series');

    expect(bestSeries).toBeDefined();
    expect(bestSeries?.projectId).toBeTruthy();
  });

  it('should award Best Series to the highest-scoring TV project at Emmys', () => {
    const sitcomShow = createTvProject('sitcom_1', 'sitcom', 95);

    const impacts = runAwardsCeremony(
      baseState({ sitcom_1: sitcomShow }),
      37, 2026
    );

    const bestSeries = impacts.newAwards?.find((a: any) => a.category === 'Best Series');

    expect(bestSeries).toBeDefined();
    expect(bestSeries?.projectId).toBe('sitcom_1');
  });
});
