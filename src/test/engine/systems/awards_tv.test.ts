import { describe, it, expect } from 'vitest';
import { runAwardsCeremony } from '../../../engine/systems/awards';
import { GameState, Project } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';
import { createMockGameState } from '../../utils/mockFactories';

describe('TV Awards Filtering & Taxonomy', () => {
  const rng = new RandomGenerator(123);

  const createTvProject = (id: string, format: any, criticScore: number): Project => ({
    id,
    title: `${id} Show`,
    type: 'SERIES' as const,
    format: 'tv' as const,
    tvFormat: format,
    genre: 'Drama',
    state: 'released' as const,
    releaseWeek: 10,
    budget: 1000000,
    revenue: 0,
    buzz: 50,
    weeksInPhase: 5,
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

  it('should award Best Drama Series to the highest-scoring TV project', () => {
    const dramaShow = createTvProject('drama_1', 'prestige_drama', 95);
    const sitcomShow = createTvProject('sitcom_1', 'sitcom', 80);

    const impacts = runAwardsCeremony(
      baseState({ drama_1: dramaShow, sitcom_1: sitcomShow }),
      37, 2026, rng
    );

    // Awards are stored in INDUSTRY_UPDATE impacts as flattened keys
    const awardImpact = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
    expect(awardImpact).toBeDefined();

    const awardEntries = Object.values(awardImpact?.payload || {}) as any[];
    const dramaAward = awardEntries.find((a: any) => a.category === 'Best Drama Series');

    expect(dramaAward).toBeDefined();
    expect(dramaAward?.projectId).toBeTruthy();
  });

  it('should award Best Comedy Series to the highest-scoring TV project', () => {
    const sitcomShow = createTvProject('sitcom_1', 'sitcom', 95);

    const impacts = runAwardsCeremony(
      baseState({ sitcom_1: sitcomShow }),
      37, 2026, rng
    );

    const awardImpact = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
    expect(awardImpact).toBeDefined();

    const awardEntries = Object.values(awardImpact?.payload || {}) as any[];
    const comedyAward = awardEntries.find((a: any) => a.category === 'Best Comedy Series');

    expect(comedyAward).toBeDefined();
    expect(comedyAward?.projectId).toBe('sitcom_1');
  });
});
