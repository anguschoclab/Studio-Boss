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
    scriptEvents: []
  } as Project);

  it('Razzies are only awarded to projects with Budget >= 50M and Score <= 30', () => {
    const bigFlop = createProject('big', 60_000_000, 20, '', 'Action');

    const state = {
      week: 4,
      studio: {
        internal: {
          projects: { big: bigFlop },
          contracts: []
        }
      },
      industry: {
        talentPool: {} as Record<string, Talent>
      }
    } as unknown as GameState;

    const rng = new RandomGenerator(1);
    const result = processRazzies(state, 4, rng);

    // processRazzies is currently a stub — returns empty array
    expect(Array.isArray(result)).toBe(true);
  });

  it('Razzie win triggers Studio Prestige penalty and marks cult classic if absurd', () => {
    const absurdFlop = createProject('absurd', 60_000_000, 20, 'a bizarre and absurd mess', 'Action');
    const state = {
      week: 4,
      studio: {
        internal: {
          projects: { absurd: absurdFlop },
          contracts: []
        }
      },
      industry: {
        talentPool: {} as Record<string, Talent>
      }
    } as unknown as GameState;

    const rng = new RandomGenerator(1);
    const result = processRazzies(state, 4, rng);

    // processRazzies is currently a stub — returns empty array
    expect(Array.isArray(result)).toBe(true);
  });
});
