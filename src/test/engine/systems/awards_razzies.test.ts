import { describe, it, expect } from 'vitest';
import { processRazzies } from '../../../engine/systems/awards';
<<<<<<< Updated upstream
import { Project, StateImpact } from '../../../engine/types';
import { createMockGameState } from '../../engine/generators/mockFactory';
=======
import { Project, NewsImpact, PrestigeImpact, ProjectUpdateImpact } from '../../../engine/types';
import { createMockGameState } from '../../mockFactory';
>>>>>>> Stashed changes
import { RandomGenerator } from '../../../engine/utils/rng';

describe('Razzies Award System', () => {
  const rng = new RandomGenerator(42);

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
    scriptEvents: []
  } as Project);

  it('Razzies are only awarded to projects with Budget >= 50M and Score <= 30', () => {
    const goodProject = createProject('good', 100_000_000, 80, '', 'Action');
    const cheapFlop = createProject('cheap', 10_000_000, 10, '', 'Action');
    const bigFlop = createProject('big', 60_000_000, 20, '', 'Action');

    const state = createMockGameState({
      week: 4,
      entities: {
        projects: {
          good: goodProject, 
          cheap: cheapFlop, 
          big: bigFlop 
        },
        talents: {},
        contracts: {},
        rivals: {},
      }
    });

    const impacts = processRazzies(state, 4, rng);

    // Only the bigFlop is eligible. Worst Picture should trigger a headline mentioning it.
<<<<<<< Updated upstream
    const newsImpact = impacts.find(i => i.type === 'NEWS_ADDED') as StateImpact;
    expect((newsImpact.payload as any).headline).toContain('Title big');
    
    const prestigeImpact = impacts.find(i => i.type === 'PRESTIGE_CHANGED') as StateImpact;
    expect((prestigeImpact.payload as any).amount).toBeLessThan(0);
=======
    const newsImpact = impacts.find(i => i.type === 'NEWS_ADDED') as NewsImpact;
    expect(newsImpact.payload.headline).toContain('Title big');
    
    const prestigeImpact = impacts.find(i => i.type === 'PRESTIGE_CHANGED') as PrestigeImpact;
    expect(prestigeImpact.payload).toBeLessThan(0);
>>>>>>> Stashed changes
  });

  it('Razzie win triggers Studio Prestige penalty and marks cult classic if absurd', () => {
    const absurdFlop = createProject('absurd', 60_000_000, 20, 'a bizarre and absurd mess', 'Action');
    const state = createMockGameState({
      week: 4,
      entities: {
        projects: { absurd: absurdFlop },
        talents: {},
        contracts: {},
        rivals: {},
      }
    });

    const impacts = processRazzies(state, 4, rng);

<<<<<<< Updated upstream
    const prestigeImpact = impacts.find(i => i.type === 'PRESTIGE_CHANGED') as StateImpact;
    expect((prestigeImpact.payload as any).amount).toBeLessThan(0);
    
    const projectImpact = impacts.find(i => i.type === 'PROJECT_UPDATED' && (i.payload as any).update?.isCultClassic) as StateImpact;
    expect((projectImpact.payload as any).projectId).toBe('absurd');
=======
    const prestigeImpact = impacts.find(i => i.type === 'PRESTIGE_CHANGED') as PrestigeImpact;
    expect(prestigeImpact.payload).toBeLessThan(0);
    
    const projectImpact = impacts.find(i => i.type === 'PROJECT_UPDATED' && i.payload.update.isCultClassic) as ProjectUpdateImpact;
    expect(projectImpact.payload.projectId).toBe('absurd');
>>>>>>> Stashed changes
  });
});
