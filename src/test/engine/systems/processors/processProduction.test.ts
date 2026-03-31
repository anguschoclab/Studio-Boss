import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processProduction } from '@/engine/systems/processors/processProduction';
import { GameState, Project } from '@/engine/types';

vi.mock('@/engine/systems/production/crisisEvaluator', () => ({
  evaluateProjectCrises: vi.fn()
}));
vi.mock('@/engine/systems/production/progressCalculator', () => ({
  advanceProjectProgress: vi.fn()
}));

import { evaluateProjectCrises } from '@/engine/systems/production/crisisEvaluator';
import { advanceProjectProgress } from '@/engine/systems/production/progressCalculator';

describe('processProduction', () => {
  const getInitialState = (): GameState => ({
    week: 1,
    game: { currentWeek: 1 },
    projects: { active: [] },
    finance: {} as any,
    news: {} as any,
    studio: {} as any,
    market: {} as any,
    industry: {} as any,
    culture: { genrePopularity: {} },
    history: []
  });

  const createBaseProject = (id: string, state: Project['state']): Project => ({
    id, title: `Project ${id}`, format: 'film', genre: 'Action', budgetTier: 'mid',
    budget: 50000000, weeklyCost: 1000000, targetAudience: 'General Audience', flavor: 'Boom',
    state, buzz: 50, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4,
    revenue: 0, weeklyRevenue: 0, releaseWeek: null,
    activeCrisis: null, momentum: 50, progress: 0, accumulatedCost: 0
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ignores projects not in production state', () => {
    const state = getInitialState();
    const devProject = createBaseProject('p1', 'development');
    state.projects.active = [devProject];

    const newState = processProduction(state);
    
    expect(evaluateProjectCrises).not.toHaveBeenCalled();
    expect(advanceProjectProgress).not.toHaveBeenCalled();
    expect(newState.projects.active[0]).toBe(devProject);
  });

  it('delegates to crisisEvaluator and progressCalculator for production projects', () => {
    const state = getInitialState();
    const prodProject = createBaseProject('p1', 'production');
    state.projects.active = [prodProject];

    const nextProject1 = { ...prodProject, id: 'p1_after_crisis' };
    const nextProject2 = { ...nextProject1, id: 'p1_after_progress' };

    vi.mocked(evaluateProjectCrises).mockReturnValue(nextProject1 as Project);
    vi.mocked(advanceProjectProgress).mockReturnValue(nextProject2 as Project);

    const newState = processProduction(state);
    
    expect(evaluateProjectCrises).toHaveBeenCalledWith(prodProject, 1);
    expect(advanceProjectProgress).toHaveBeenCalledWith(nextProject1);
    expect(newState.projects.active[0]).toBe(nextProject2);
  });
});
