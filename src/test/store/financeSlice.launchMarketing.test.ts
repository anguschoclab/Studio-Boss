import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { Project } from '@/engine/types';

vi.mock('@/engine/systems/projects', () => ({
  executeMarketing: vi.fn((project: any) => ({ project: { ...project, marketingBudget: 5_000_000, marketingAngle: 'viral' } })),
  handleReleasePhaseEntry: vi.fn(() => ({ project: {}, update: null })),
}));

vi.mock('@/engine/systems/market/InterestRateSimulator', () => ({
  InterestRateSimulator: Object.assign(
    vi.fn().mockImplementation(() => ({
      getRates: vi.fn(() => ({ baseRate: 0.05, savingsYield: 0.02, debtRate: 0.08, loanRate: 0.06 })),
    })),
    {
      initialize: vi.fn(() => ({ baseRate: 0.05, savingsYield: 0.02, debtRate: 0.08, loanRate: 0.06, rateHistory: [] })),
    }
  ),
}));

describe('financeSlice — launchMarketingCampaign', () => {
  beforeEach(() => {
    useGameStore.setState({
      gameState: {
        week: 10,
        finance: {
          cash: 100_000_000,
          ledger: [],
          weeklyHistory: [],
          marketState: { baseRate: 0.05, savingsYield: 0.02, debtRate: 0.08, loanRate: 0.06, rateHistory: [] },
        },
        studio: {
          id: 'PLR-1',
          name: 'Player Studio',
          archetype: 'major',
          prestige: 50,
          internal: {
            projectHistory: [],
            firstLookDeals: [],
            projects: {},
            contracts: [],
          },
        },
        entities: { projects: {}, releasedProjectIds: [], talents: {}, contracts: {}, rivals: {} },
        market: { opportunities: [], trends: [], activeMarketEvents: [], buyers: [] },
        industry: { families: [], agencies: [], agents: [], awards: [], newsHistory: [], rumors: [], scandals: [], talentPool: {} },
        culture: { genrePopularity: {} },
        news: { headlines: [] },
        ip: { vault: [], franchises: {} },
        history: [],
        eventHistory: [],
        game: { currentWeek: 10 },
        gameSeed: 12345,
        tickCount: 0,
      } as any,
      finance: {
        cash: 100_000_000,
        ledger: [],
        weeklyHistory: [],
        marketState: { baseRate: 0.05, savingsYield: 0.02, debtRate: 0.08, loanRate: 0.06, rateHistory: [] },
      },
    } as any);
  });

  it('returns unchanged state when projectId not found in projects dict', () => {
    const store = useGameStore.getState() as any;
    const before = useGameStore.getState().finance.cash;
    store.launchMarketingCampaign('nonexistent', 1_000_000, 50, 'viral');
    expect(useGameStore.getState().finance.cash).toBe(before);
  });

  it('returns unchanged state when budget > cash', () => {
    const project: any = {
      id: 'proj-1',
      title: 'Test Film',
      genre: 'Action',
      format: 'film',
      state: 'marketing',
      budget: 50_000_000,
      spent: 30_000_000,
      type: 'FILM',
    };
    useGameStore.setState({
      gameState: {
        ...(useGameStore.getState().gameState as any),
        studio: {
          ...(useGameStore.getState().gameState as any).studio,
          internal: {
            projectHistory: [],
            firstLookDeals: [],
            projects: { 'proj-1': project },
            contracts: [],
          },
        },
      },
    } as any);

    const store = useGameStore.getState() as any;
    const before = useGameStore.getState().finance.cash;
    store.launchMarketingCampaign('proj-1', 200_000_000, 50, 'viral');
    expect(useGameStore.getState().finance.cash).toBe(before);
  });

  it('returns unchanged state when project state !== marketing', () => {
    const project: any = {
      id: 'proj-1',
      title: 'Test Film',
      genre: 'Action',
      format: 'film',
      state: 'development',
      budget: 50_000_000,
      spent: 30_000_000,
      type: 'FILM',
    };
    useGameStore.setState({
      gameState: {
        ...(useGameStore.getState().gameState as any),
        studio: {
          ...(useGameStore.getState().gameState as any).studio,
          internal: {
            projectHistory: [],
            firstLookDeals: [],
            projects: { 'proj-1': project },
            contracts: [],
          },
        },
      },
    } as any);

    const store = useGameStore.getState() as any;
    const before = useGameStore.getState().finance.cash;
    store.launchMarketingCampaign('proj-1', 1_000_000, 50, 'viral');
    expect(useGameStore.getState().finance.cash).toBe(before);
  });

  it('deducts budget from cash when project is in marketing state', () => {
    const project: any = {
      id: 'proj-1',
      title: 'Test Film',
      genre: 'Action',
      format: 'film',
      state: 'marketing',
      budget: 50_000_000,
      spent: 30_000_000,
      type: 'FILM',
      marketingBudget: 0,
      marketingAngle: null,
      domesticBoxOffice: 0,
      internationalBoxOffice: 0,
      releaseDate: null,
      buzz: 50,
      tracking: 50,
      reviews: [],
    };
    useGameStore.setState({
      gameState: {
        ...(useGameStore.getState().gameState as any),
        studio: {
          ...(useGameStore.getState().gameState as any).studio,
          internal: {
            projectHistory: [],
            firstLookDeals: [],
            projects: { 'proj-1': project },
            contracts: [],
          },
        },
      },
    } as any);

    const store = useGameStore.getState() as any;
    store.launchMarketingCampaign('proj-1', 5_000_000, 50, 'viral');
    expect(useGameStore.getState().finance.cash).toBe(95_000_000);
  });

  it('works with projects stored as dict (verifies O(1) lookup path)', () => {
    const projects: Record<string, any> = {
      'proj-a': { id: 'proj-a', title: 'A', genre: 'Drama', format: 'film', state: 'development', budget: 10_000_000, spent: 0, type: 'FILM' },
      'proj-b': { id: 'proj-b', title: 'B', genre: 'Comedy', format: 'film', state: 'marketing', budget: 20_000_000, spent: 10_000_000, type: 'FILM', marketingBudget: 0, marketingAngle: null, domesticBoxOffice: 0, internationalBoxOffice: 0, releaseDate: null, buzz: 50, tracking: 50, reviews: [] },
    };
    useGameStore.setState({
      gameState: {
        ...(useGameStore.getState().gameState as any),
        studio: {
          ...(useGameStore.getState().gameState as any).studio,
          internal: {
            projectHistory: [],
            firstLookDeals: [],
            projects,
            contracts: [],
          },
        },
      },
    } as any);

    const store = useGameStore.getState() as any;
    const before = useGameStore.getState().finance.cash;
    store.launchMarketingCampaign('proj-a', 1_000_000, 50, 'viral');
    expect(useGameStore.getState().finance.cash).toBe(before);

    store.launchMarketingCampaign('proj-b', 2_000_000, 50, 'viral');
    expect(useGameStore.getState().finance.cash).toBe(before - 2_000_000);
  });
});
