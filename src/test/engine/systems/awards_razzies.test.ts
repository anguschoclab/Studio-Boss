import { describe, it, expect, vi } from 'vitest';
import { processRazzies } from '../../../engine/systems/awards';
import { GameState, Project, Talent } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';

describe('Razzies Award System', () => {
  const createProject = (id: string, budget: number, score: number, flavor: string, genre: string): Project => ({
    id,
    title: `Title ${id}`,
    type: 'FILM',
    format: 'film',
    genre,
    budgetTier: 'high',
    budget,
    weeklyCost: 10,
    targetAudience: 'General Audience',
    flavor,
    state: 'released',
    buzz: 50,
    weeksInPhase: 1,
    developmentWeeks: 1,
    productionWeeks: 1,
    revenue: 10,
    weeklyRevenue: 10,
    releaseWeek: 1,
    reviewScore: score,
    activeCrisis: null,
    momentum: 50,
    progress: 100,
    accumulatedCost: budget,
    contentFlags: [],
    scriptHeat: 50,
    activeRoles: [],
    scriptEvents: [],
    ownerId: 'PLAYER'
  } as Project);

  it('Razzies are only awarded to projects with Budget >= 50M and Score <= 30', () => {
    const bigFlop = createProject('big', 60_000_000, 20, '', 'Action');
    const smallFlop = createProject('small', 40_000_000, 20, '', 'Action'); // Below budget threshold
    const goodFilm = createProject('good', 60_000_000, 80, '', 'Action'); // Above score threshold

    const state = {
      week: 4,
      entities: {
        projects: {
          big: bigFlop,
          small: smallFlop,
          good: goodFilm
        }
      },
      industry: {
        talentPool: {} as Record<string, Talent>
      }
    } as unknown as GameState;

    const rng = new RandomGenerator(1);
    const result = processRazzies(state, 4, rng);

    // Should return impacts for eligible projects
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Should have PROJECT_UPDATED impact for the eligible project
    const projectUpdate = result.find(imp => imp.type === 'PROJECT_UPDATED');
    expect(projectUpdate).toBeDefined();
    expect((projectUpdate?.payload as any).projectId).toBe('big');
    expect((projectUpdate?.payload as any).update.razzieWinner).toBe(true);

    // Should have NEWS_ADDED impact
    const newsImpact = result.find(imp => imp.type === 'NEWS_ADDED');
    expect(newsImpact).toBeDefined();
  });

  it('Razzie win triggers Studio Prestige penalty and marks cult classic if absurd', () => {
    const absurdFlop = createProject('absurd', 60_000_000, 20, 'a bizarre and absurd mess', 'Action');
    const state = {
      week: 4,
      entities: {
        projects: {
          absurd: absurdFlop
        }
      },
      industry: {
        talentPool: {} as Record<string, Talent>
      }
    } as unknown as GameState;

    const rng = new RandomGenerator(1);
    const result = processRazzies(state, 4, rng);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Should mark as Razzie winner
    const projectUpdate = result.find(imp => imp.type === 'PROJECT_UPDATED');
    expect(projectUpdate).toBeDefined();
    expect((projectUpdate?.payload as any).update.razzieWinner).toBe(true);

    // Should mark as cult classic due to absurd flavor
    expect((projectUpdate?.payload as any).update.isCultClassic).toBe(true);

    // Should have prestige penalty
    const prestigeImpact = result.find(imp => imp.type === 'PRESTIGE_CHANGED');
    expect(prestigeImpact).toBeDefined();
    expect(prestigeImpact?.payload).toBeLessThan(0);

    // Should have news event about cult following
    const cultNews = result.filter(imp => imp.type === 'NEWS_ADDED').find(imp => 
      (imp.payload as any).headline.includes('cult')
    );
    expect(cultNews).toBeDefined();
  });
});
