import { describe, it, expect } from 'vitest';
import { processRazzies } from '../../../engine/systems/awards';
import { Project, StateImpact } from '../../../engine/types';
import { createMockGameState } from '../../utils/mockFactories';
import { RandomGenerator } from '../../../engine/utils/rng';

describe('Razzies Award System', () => {
  const rng = Math.random();
// @ts-ignore
const _unusedRng = rng;

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

    const impacts = processRazzies(state, 4);

    // Only the bigFlop is eligible. Worst Picture should trigger a headline mentioning it.
    expect(impacts.newHeadlines).toBeDefined();
    expect(impacts.newHeadlines!.some(h => h.text.includes('Title big'))).toBe(true);
    
    expect(impacts.prestigeChange).toBeLessThan(0);
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

    const impacts = processRazzies(state, 4);

    expect(impacts.prestigeChange).toBeLessThan(0);
    
    expect(impacts.cultClassicProjectIds).toBeDefined();
    expect(impacts.cultClassicProjectIds).toContain('absurd');
  });
});
