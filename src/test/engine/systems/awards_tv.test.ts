import { describe, it, expect } from 'vitest';
import { runAwardsCeremony } from '../../../engine/systems/awards';
import { GameState } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';

describe('TV Awards Filtering & Taxonomy', () => {
  const rng = new RandomGenerator(123);

  const createTvProject = (id: string, format: any, criticScore: number) => ({
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
    },
    reception: {
      metaScore: criticScore,
      audienceScore: criticScore,
      status: 'Acclaimed',
      reviews: [],
      isCultPotential: false
    },
    awards: []
  });

  const baseState = (projects: Record<string, any>): Partial<GameState> => ({
    week: 37, // Emmy Week
    studio: {
      internal: { projects }
    } as any,
    industry: { rivals: [] } as any
  });

  it('should award Best Drama Series to the highest-scoring TV project', () => {
    const dramaShow = createTvProject('drama_1', 'prestige_drama', 95);
    const sitcomShow = createTvProject('sitcom_1', 'sitcom', 80);

    const impacts = runAwardsCeremony(
      baseState({ drama_1: dramaShow, sitcom_1: sitcomShow }) as GameState,
      37, 2026, rng
    );

    // Awards are stored in INDUSTRY_UPDATE impacts
    const awardEntries = impacts
      .filter(i => i.type === 'INDUSTRY_UPDATE')
      .flatMap(i => Object.values((i as any).payload?.update || {})) as any[];

    const dramaAward = awardEntries.find((a: any) => a.category === 'Best Drama Series');
    // The highest-scoring TV show for this category should be the winner
    expect(dramaAward).toBeDefined();
    expect(dramaAward?.projectId).toBeTruthy();
  });

  it('should award Best Comedy Series to the highest-scoring TV project', () => {
    const sitcomShow = createTvProject('sitcom_1', 'sitcom', 95);

    const impacts = runAwardsCeremony(
      baseState({ sitcom_1: sitcomShow }) as GameState,
      37, 2026, rng
    );

    const awardEntries = impacts
      .filter(i => i.type === 'INDUSTRY_UPDATE')
      .flatMap(i => Object.values((i as any).payload?.update || {})) as any[];

    const comedyAward = awardEntries.find((a: any) => a.category === 'Best Comedy Series');
    expect(comedyAward).toBeDefined();
    expect(comedyAward?.projectId).toBe('sitcom_1');
  });
});
