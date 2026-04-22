import { describe, it, expect, vi } from 'vitest';
import { runUpfronts } from '../../../../engine/systems/television/upfrontsEngine';
import { GameState, SeriesProject, StateImpact } from '../../../../engine/types';
import { RandomGenerator } from '../../../../engine/utils/rng';

describe('Upfronts Engine (Guild Auditor)', () => {
  const getMockState = (): GameState => ({
    week: 20,
    entities: {
      projects: {},
      talents: {},
      contracts: {},
      rivals: {}
    },
    studio: {
        name: 'Player',
        prestige: 50,
        archetype: 'major',
        internal: { projects: {}, contracts: [] }
    },
    industry: {
        rivals: [],
        families: [],
        agencies: [],
        agents: [],
        talentPool: {},
        newsHistory: [],
        rumors: []
    },
    market: { opportunities: [], buyers: [], activeMarketEvents: [] },
    culture: { genrePopularity: {} },
    finance: { cash: 100, ledger: [], weeklyHistory: [], marketState: { baseRate: 0.04, savingsYield: 0.02, debtRate: 0.08, loanRate: 0.06, rateHistory: [] } },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    game: { currentWeek: 1 },
    history: [],
    eventHistory: []
  } as unknown as GameState);

  const baseProject: SeriesProject = {
    id: 'tv-1',
    title: 'Upfront Show',
    type: 'SERIES',
    format: 'tv',
    genre: 'Drama',
    budgetTier: 'mid',
    budget: 1000000,
    weeklyCost: 100000,
    targetAudience: 'General',
    flavor: 'Cool',
    state: 'development',
    stage: 'pitch', // not pilot
    buzz: 50,
    scriptHeat: 50,
    momentum: 50,
    weeksInPhase: 1,
    developmentWeeks: 10,
    productionWeeks: 10,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: 1,
    activeCrisis: null,
    progress: 100,
    accumulatedCost: 1000000,
    contentFlags: [],
    reviewScore: 50,
    scriptEvents: [],
    activeRoles: [],
    tvDetails: {
      episodesAired: 0,
      episodesOrdered: 0,
      status: 'IN_DEVELOPMENT',
      averageRating: 0,
      currentSeason: 1,
      episodesCompleted: 0
    }
  } as SeriesProject;

  it('handles empty state with no projects gracefully', () => {
    const state = getMockState();
    const rng = new RandomGenerator(42);
    const impacts = runUpfronts(state, rng);
    expect(impacts.length).toBe(0);
  });

  it('passes on terrible projects', () => {
    const state = getMockState();
    state.entities.projects['tv-1'] = {
        ...baseProject,
        buzz: 0,
        scriptHeat: 0,
        momentum: 0
    } as SeriesProject;

    const rng = new RandomGenerator(42);
    // force -10 on range
    vi.spyOn(rng, 'range').mockReturnValue(-10);

    const impacts = runUpfronts(state, rng);

    // We only get a MODAL_TRIGGERED, but no pickups means no news and no project updates
    expect(impacts.length).toBe(1);
    expect(impacts[0].type).toBe('MODAL_TRIGGERED');
    const payload = impacts[0].payload as any;
    expect(payload.payload.results[0].decision).toBe('pass');
  });

  it('gives a limited_order to average projects', () => {
    const state = getMockState();
    state.entities.projects['tv-1'] = {
        ...baseProject,
        buzz: 50,
        scriptHeat: 50,
        momentum: 50
    } as SeriesProject;

    const rng = new RandomGenerator(42);
    // Force rng.range to return 0. quality = 50. (45 <= 50 < 70) => limited_order
    vi.spyOn(rng, 'range').mockReturnValue(0);
    vi.spyOn(rng, 'rangeInt').mockReturnValue(5); // 5 episodes ordered

    const impacts = runUpfronts(state, rng);

    // PROJECT_UPDATED, MODAL_TRIGGERED, NEWS_ADDED
    expect(impacts.length).toBe(3);
    const updateImpact = impacts.find(i => i.type === 'PROJECT_UPDATED');
    expect(updateImpact).toBeDefined();

    const projectUpdate = (updateImpact!.payload as any).update;
    expect(projectUpdate.state).toBe('production');
    expect(projectUpdate.tvDetails.episodesOrdered).toBe(5);

    const modalImpact = impacts.find(i => i.type === 'MODAL_TRIGGERED');
    expect((modalImpact!.payload as any).payload.results[0].decision).toBe('limited_order');
  });

  it('gives a full pickup to amazing projects', () => {
    const state = getMockState();
    state.entities.projects['tv-1'] = {
        ...baseProject,
        buzz: 100,
        scriptHeat: 100,
        momentum: 100,
        budgetTier: 'low'
    } as SeriesProject;

    const rng = new RandomGenerator(42);
    // Force rng.range to 0. Quality = 100 >= 70 => pickup
    vi.spyOn(rng, 'range').mockReturnValue(0);
    vi.spyOn(rng, 'rangeInt').mockReturnValue(10); // 10 episodes ordered

    const impacts = runUpfronts(state, rng);

    const updateImpact = impacts.find(i => i.type === 'PROJECT_UPDATED');
    expect(updateImpact).toBeDefined();

    const projectUpdate = (updateImpact!.payload as any).update;
    expect(projectUpdate.state).toBe('production');
    expect(projectUpdate.tvDetails.episodesOrdered).toBe(10);

    const modalImpact = impacts.find(i => i.type === 'MODAL_TRIGGERED');
    expect((modalImpact!.payload as any).payload.results[0].decision).toBe('pickup');
  });

  it('handles negative stats properly (guild auditor check)', () => {
    const state = getMockState();
    state.entities.projects['tv-1'] = {
        ...baseProject,
        buzz: -100,
        scriptHeat: -50,
        momentum: -500
    } as SeriesProject;

    const rng = new RandomGenerator(42);
    const impacts = runUpfronts(state, rng);

    expect(impacts.length).toBe(1); // just the modal with 'pass'
    expect((impacts[0].payload as any).payload.results[0].decision).toBe('pass');
  });
});
