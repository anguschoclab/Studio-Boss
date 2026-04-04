import { describe, it, expect } from 'vitest';
import { tickProduction } from '../../../../engine/systems/productionEngine';
import { GameState, Project, Talent, ProjectUpdateImpact } from '../../../../engine/types';
import { RandomGenerator } from '../../../../engine/utils/rng';

describe('tickProduction', () => {
  const rng = new RandomGenerator(456);
  
  const getInitialState = (): GameState => ({
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    game: { currentWeek: 1 },
    finance: { cash: 1000000, ledger: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    studio: {
      name: 'Test Studio',
      archetype: 'major',
      prestige: 50,
      internal: {
        projects: {}, 
        contracts: [],
      }
    },
    market: { opportunities: [], buyers: [], activeMarketEvents: [] },
    industry: {
      rivals: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {} as Record<string, Talent>,
      newsHistory: [],
      rumors: []
    },
    culture: { genrePopularity: {} },
    history: [],
    eventHistory: []
    } as unknown as GameState);

  const createBaseProject = (id: string, state: Project['state']): Project => ({
    id, title: `Project ${id}`, type: 'FILM', format: 'film', genre: 'Action', budgetTier: 'mid',
    budget: 50_000_000, weeklyCost: 1_000_000, targetAudience: 'General', flavor: 'Boom',
    state, buzz: 50, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4,
    revenue: 0, weeklyRevenue: 0, releaseWeek: null,
    activeCrisis: null, momentum: 50, progress: 0, accumulatedCost: 0,
    contentFlags: [], scriptHeat: 50, activeRoles: [], scriptEvents: []
  } as Project);

  it('ignores projects not in production/development state in the core tick', () => {
    const state = getInitialState();
    const releasedProject = createBaseProject('p1', 'released');
    state.studio.internal.projects['p1'] = releasedProject;

    const impacts = tickProduction(state, rng);

    // Released projects are still ticked (advanceProject runs), producing INDUSTRY_UPDATE
    // plus the empty disputeImpact bag — 2 impacts total
    expect(impacts).toHaveLength(2);
    const disputeImpact = impacts.find(i => i.projectUpdates !== undefined);
    expect(disputeImpact?.projectUpdates).toEqual([]);
  });

  it('generates INDUSTRY_UPDATE impact for production projects', () => {
    const state = getInitialState();
    const prodProject = createBaseProject('p1', 'production');
    state.studio.internal.projects['p1'] = prodProject;

    const impacts = tickProduction(state, rng);

    // Player project updates are batched into INDUSTRY_UPDATE + empty disputeImpact
    expect(impacts).toHaveLength(2);
    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
    expect(industryUpdate).toBeDefined();
    const updatedProject = industryUpdate?.payload?.['studio.internal.projects']?.['p1'];
    expect(updatedProject).toBeDefined();
    expect(updatedProject?.weeksInPhase).toBe(1);
    expect(updatedProject?.progress).toBeGreaterThan(0);
  });
});
