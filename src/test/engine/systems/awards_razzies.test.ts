import { describe, it, expect, vi } from 'vitest';
import { processRazzies } from '../../../engine/systems/awards';
import { GameState, Project } from '../../../engine/types';

describe('Razzies Award System', () => {
  const createProject = (id: string, budget: number, score: number, flavor: string, genre: string): Project => ({
    id, title: `Title ${id}`, format: 'film', genre, budgetTier: 'high', budget, weeklyCost: 10,
    targetAudience: 'General Audience', flavor, status: 'released', buzz: 50, weeksInPhase: 0,
    developmentWeeks: 1, productionWeeks: 1, revenue: 10, weeklyRevenue: 10, releaseWeek: null,
    reviewScore: score
  } as Project);

  it('Razzies are only awarded to projects with Budget > 50M and Score < 30', () => {
    const goodProject = createProject('good', 100_000_000, 80, '', 'Action');
    const cheapFlop = createProject('cheap', 10_000_000, 10, '', 'Action');
    const bigFlop = createProject('big', 60_000_000, 20, '', 'Action');

    const state = {
      studio: { internal: { projects: { 
        good: goodProject, 
        cheap: cheapFlop, 
        big: bigFlop 
      }, contracts: [] } },
      industry: { talentPool: {} }
    } as unknown as GameState;

    const result = processRazzies(state, 4);

    // Only the bigFlop is eligible. Worst Picture should trigger a headline mentioning it.
    expect(result.newHeadlines![0].text).toContain('Title big');
    expect(result.prestigeChange).toBe(-10);
  });

  it('Razzie win triggers Studio Prestige penalty and marks cult classic if absurd', () => {
    const absurdFlop = createProject('absurd', 60_000_000, 20, 'a bizarre and absurd mess', 'Action');
    const state = {
      studio: { internal: { projects: { absurd: absurdFlop }, contracts: [] } },
      industry: { talentPool: {} }
    } as unknown as GameState;

    const result = processRazzies(state, 4);

    expect(result.prestigeChange).toBe(-10);
    expect(result.cultClassicProjectIds).toContain('absurd');
  });
});
