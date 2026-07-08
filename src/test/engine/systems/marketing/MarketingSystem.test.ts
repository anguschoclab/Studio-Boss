import { describe, it, expect } from 'vitest';
import { GameState } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { tickMarketing } from '@/engine/systems/marketing/MarketingSystem';
import { createMockProject } from '@/test/utils/mockFactories';

/**
 * Helpers to build a minimal deterministic GameState for marketing tests.
 * No backwards-compat concerns: types may be extended freely.
 */
function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    week: 10,
    gameSeed: 12345,
    tickCount: 10,
    finance: { cash: 100_000_000, ledger: [], weeklyHistory: [], marketState: {} as any },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    entities: {
      projects: {},
      releasedProjectIds: [],
      talents: {},
      contracts: {},
      rivals: {},
    },
    studio: {
      id: 'player',
      name: 'Test Studio',
      archetype: 'major',
      prestige: 50,
      internal: { projectHistory: [], projects: {}, contracts: [] },
    },
    market: {
      opportunities: [],
      trends: [],
      activeMarketEvents: [],
      buyers: [],
      marketingIntensity: 0,
    },
    industry: {
      families: [],
      agencies: [],
      agents: [],
      newsHistory: [],
    },
    culture: { genrePopularity: {} },
    ...overrides,
  } as unknown as GameState;
}

function marketingProject(overrides: any = {}) {
  return createMockProject({
    id: 'proj-1',
    title: 'Marketing Test Film',
    genre: 'Action',
    state: 'marketing',
    buzz: 50,
    weeksInPhase: 2,
    marketingCampaign: {
      domesticBudget: 20_000_000,
      foreignBudget: 20_000_000,
      primaryAngle: 'SELL_THE_SPECTACLE',
      weeksInMarketing: 2,
    },
    ...overrides,
  });
}

describe('tickMarketing', () => {
  it('accrues awareness from weekly spend', () => {
    const project = marketingProject();
    const state = makeState({
      entities: { projects: { [project.id]: project }, releasedProjectIds: [], talents: {}, contracts: {}, rivals: {} } as any,
    });

    const impacts = tickMarketing(state, new RandomGenerator(12345));

    const upd = impacts.find(i => i.type === 'PROJECT_UPDATED');
    expect(upd).toBeDefined();
    const updated = (upd!.payload as any).update;
    expect(updated.awareness).toBeGreaterThan(0);
    expect(updated.awareness).toBeLessThanOrEqual(100);
  });

  it('respects diminishing returns after week 4', () => {
    const fresh = marketingProject({ weeksInPhase: 1, marketingCampaign: { domesticBudget: 40_000_000, foreignBudget: 40_000_000, primaryAngle: 'SELL_THE_SPECTACLE', weeksInMarketing: 1 } });
    const stale = marketingProject({ id: 'proj-2', weeksInPhase: 8, marketingCampaign: { domesticBudget: 40_000_000, foreignBudget: 40_000_000, primaryAngle: 'SELL_THE_SPECTACLE', weeksInMarketing: 8 } });

    const state = makeState({
      entities: { projects: { [fresh.id]: fresh, [stale.id]: stale }, releasedProjectIds: [], talents: {}, contracts: {}, rivals: {} } as any,
    });

    const impacts = tickMarketing(state, new RandomGenerator(999));
    const byId = (id: string) => (impacts.find(i => i.type === 'PROJECT_UPDATED' && (i.payload as any).projectId === id)!.payload as any).update;

    expect(byId('proj-1').awareness).toBeGreaterThan(byId('proj-2').awareness);
  });

  it('secondary angle contributes to accrual', () => {
    const primaryOnly = marketingProject({ id: 'p1', marketingCampaign: { domesticBudget: 30_000_000, foreignBudget: 30_000_000, primaryAngle: 'SELL_THE_SPECTACLE', weeksInMarketing: 1 } });
    const withSecondary = marketingProject({ id: 'p2', marketingCampaign: { domesticBudget: 30_000_000, foreignBudget: 30_000_000, primaryAngle: 'SELL_THE_SPECTACLE', secondaryAngle: 'SELL_THE_STARS', weeksInMarketing: 1 } });

    const state = makeState({
      entities: { projects: { [primaryOnly.id]: primaryOnly, [withSecondary.id]: withSecondary }, releasedProjectIds: [], talents: {}, contracts: {}, rivals: {} } as any,
    });

    const impacts = tickMarketing(state, new RandomGenerator(7));
    const byId = (id: string) => (impacts.find(i => i.type === 'PROJECT_UPDATED' && (i.payload as any).projectId === id)!.payload as any).update;
    expect(byId('p2').awareness).toBeGreaterThanOrEqual(byId('p1').awareness);
  });

  it('share-of-voice reduces accrual when rivals outspend', () => {
    const project = marketingProject();
    const lowIntensity = makeState({
      market: { opportunities: [], trends: [], activeMarketEvents: [], buyers: [], marketingIntensity: 10_000_000 } as any,
      entities: { projects: { [project.id]: project }, releasedProjectIds: [], talents: {}, contracts: {}, rivals: {} } as any,
    });
    const highIntensity = makeState({
      market: { opportunities: [], trends: [], activeMarketEvents: [], buyers: [], marketingIntensity: 500_000_000 } as any,
      entities: { projects: { [project.id]: project }, releasedProjectIds: [], talents: {}, contracts: {}, rivals: {} } as any,
    });

    const low = tickMarketing(lowIntensity, new RandomGenerator(3), 0);
    const high = tickMarketing(highIntensity, new RandomGenerator(3), 500_000_000);
    const lowAware = (low.find(i => i.type === 'PROJECT_UPDATED')!.payload as any).update.awareness;
    const highAware = (high.find(i => i.type === 'PROJECT_UPDATED')!.payload as any).update.awareness;
    expect(lowAware).toBeGreaterThan(highAware);
  });

  it('writes the marketingIntensity aggregate', () => {
    const project = marketingProject();
    const state = makeState({
      entities: { projects: { [project.id]: project }, releasedProjectIds: [], talents: {}, contracts: {}, rivals: {} } as any,
    });

    const impacts = tickMarketing(state, new RandomGenerator(5));
    const marketImpact = impacts.find(i => i.type === 'MARKET_EVENT_UPDATED');
    expect(marketImpact).toBeDefined();
    const intensity = (marketImpact!.payload as any).marketingIntensity;
    // total spend = 40M across the single campaign
    expect(intensity).toBeGreaterThanOrEqual(40_000_000);
  });

  it('is a no-op when no active campaigns', () => {
    const state = makeState({
      entities: { projects: { 'x': marketingProject({ marketingCampaign: undefined }) }, releasedProjectIds: [], talents: {}, contracts: {}, rivals: {} } as any,
    });
    const impacts = tickMarketing(state, new RandomGenerator(1));
    expect(impacts.filter(i => i.type === 'PROJECT_UPDATED').length).toBe(0);
  });

  it('is deterministic for a fixed seed', () => {
    const project = marketingProject();
    const build = () => makeState({
      entities: { projects: { [project.id]: marketingProject() }, releasedProjectIds: [], talents: {}, contracts: {}, rivals: {} } as any,
    });
    const a = tickMarketing(build(), new RandomGenerator(42));
    const b = tickMarketing(build(), new RandomGenerator(42));
    const awA = (a.find(i => i.type === 'PROJECT_UPDATED')!.payload as any).update.awareness;
    const awB = (b.find(i => i.type === 'PROJECT_UPDATED')!.payload as any).update.awareness;
    expect(awA).toBe(awB);
  });
});
