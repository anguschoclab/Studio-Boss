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
    awards: []
  });

  it('should only allow drama formats to win Best Drama Series', () => {
    const dramaShow = createTvProject('drama_1', 'prestige_drama', 95);
    const sitcomShow = createTvProject('sitcom_1', 'sitcom', 100); // Higher score but wrong category

    const state: Partial<GameState> = {
      week: 37, // Emmy Week
      studio: {
        internal: {
          projects: {
            'drama_1': dramaShow as any,
            'sitcom_1': sitcomShow as any
          }
        }
      } as any
    };

    const impact = runAwardsCeremony(state as GameState, 37, 2026, rng);
    
    // Check for Best Drama Series
    const dramaWin = impact.newAwards?.find(a => a.category === 'Best Drama Series');
    expect(dramaWin?.projectId).toBe('drama_1');
    expect(dramaWin?.projectId).not.toBe('sitcom_1');
  });

  it('should only allow comedy formats to win Best Comedy Series', () => {
    const dramaShow = createTvProject('drama_1', 'prestige_drama', 100);
    const sitcomShow = createTvProject('sitcom_1', 'sitcom', 95); 

    const state: Partial<GameState> = {
      week: 37, // Emmy Week
      studio: {
        internal: {
          projects: {
            'drama_1': dramaShow as any,
            'sitcom_1': sitcomShow as any
          }
        }
      } as any
    };

    const impact = runAwardsCeremony(state as GameState, 37, 2026, rng);
    
    const comedyWin = impact.newAwards?.find(a => a.category === 'Best Comedy Series');
    expect(comedyWin?.projectId).toBe('sitcom_1');
  });
});
