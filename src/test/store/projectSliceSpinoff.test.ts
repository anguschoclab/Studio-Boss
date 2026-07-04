import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { calculateFranchiseFatigue } from '@/engine/systems/ip/fatigueEngine';
import { generateSpinoffProposal } from '@/engine/systems/ip/spinoffFactory';

vi.mock('@/engine/utils/rng', () => ({
  RandomGenerator: vi.fn().mockImplementation(() => ({
    next: vi.fn(() => 0.5),
    uuid: vi.fn(() => 'mock-uuid'),
    getState: vi.fn(() => ({ seed: 12345 })),
  })),
}));

vi.mock('@/engine/systems/ip/spinoffFactory', () => ({
  generateSpinoffProposal: vi.fn(() => ({
    title: 'Spinoff Movie',
    genre: 'Action',
    format: 'film',
    budgetTier: 'mid',
    targetAudience: 'General',
    flavor: 'Boom',
  })),
}));

vi.mock('@/engine/systems/ip/fatigueEngine', () => ({
  calculateFranchiseFatigue: vi.fn(() => 0.5),
}));

vi.mock('@/engine/systems/culture', () => ({
  updateCultureFromProject: vi.fn(),
}));

vi.mock('@/engine/systems/projects', () => ({
  releaseProject: vi.fn(),
}));

vi.mock('@/engine/systems/buyers', () => ({
  negotiateContract: vi.fn(),
}));

vi.mock('@/engine/systems/crises', () => ({
  resolveCrisis: vi.fn(),
}));

vi.mock('@/engine/systems/festivals', () => ({
  submitToFestival: vi.fn(),
}));

vi.mock('@/engine/systems/awards', () => ({
  submitForAward: vi.fn(),
}));

vi.mock('@/store/storeUtils', () => ({
  buildProjectAndContracts: vi.fn(() => ({
    project: { id: 'new-proj-1', title: 'Spinoff Movie', genre: 'Action', state: 'development', budget: 50_000_000, type: 'FILM' },
    newContracts: [],
    talentFees: 0,
  })),
  applyStateImpact: vi.fn((state: any) => state),
  CreateProjectParams: {} as any,
}));

function makeFranchiseState(genreProjects: Array<{ id: string; genre: string; franchiseId?: string }>) {
  const projects: Record<string, any> = {};
  for (const p of genreProjects) {
    projects[p.id] = p;
  }
  return {
    week: 100,
    finance: { cash: 100_000_000, ledger: [], weeklyHistory: [] },
    studio: {
      id: 'PLR-1',
      name: 'Player Studio',
      archetype: 'major',
      prestige: 50,
      internal: { projectHistory: [], firstLookDeals: [], projects, contracts: [] },
    },
    entities: { projects: {}, releasedProjectIds: [], talents: {}, contracts: {}, rivals: {} },
    market: { opportunities: [], trends: [], activeMarketEvents: [], buyers: [] },
    industry: { families: [], agencies: [], agents: [], awards: [], newsHistory: [], rumors: [], scandals: [] },
    culture: { genrePopularity: {} },
    news: { headlines: [] },
    ip: {
      vault: [],
      franchises: {
        'FR-1': {
          id: 'FR-1',
          name: 'Action Universe',
          assetIds: ['PRJ-1', 'PRJ-2'],
          lastReleaseWeeks: [10],
        },
      },
    },
    history: [],
    eventHistory: [],
    game: { currentWeek: 100 },
    gameSeed: 12345,
    tickCount: 0,
    rngState: { seed: 12345 },
  } as any;
}

describe('projectSlice — exploitFranchise genreSaturation count', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('counts 0 same-genre projects correctly', () => {
    useGameStore.setState({
      gameState: makeFranchiseState([
        { id: 'PRJ-1', genre: 'Action', franchiseId: 'FR-1' },
      ]),
    } as any);

    const store = useGameStore.getState() as any;
    store.exploitFranchise('PRJ-1');

    expect(calculateFranchiseFatigue).toHaveBeenCalled();
    const callArgs = (calculateFranchiseFatigue as any).mock.calls[0];
    // genreSaturation is the 2nd arg — should be 1 (only PRJ-1 itself matches)
    expect(callArgs[1]).toBe(1);
  });

  it('counts multiple same-genre projects correctly', () => {
    useGameStore.setState({
      gameState: makeFranchiseState([
        { id: 'PRJ-1', genre: 'Action', franchiseId: 'FR-1' },
        { id: 'PRJ-2', genre: 'Action' },
        { id: 'PRJ-3', genre: 'Action' },
        { id: 'PRJ-4', genre: 'Drama' },
      ]),
    } as any);

    const store = useGameStore.getState() as any;
    store.exploitFranchise('PRJ-1');

    expect(calculateFranchiseFatigue).toHaveBeenCalled();
    const callArgs = (calculateFranchiseFatigue as any).mock.calls[0];
    // 3 Action projects out of 4 total
    expect(callArgs[1]).toBe(3);
  });

  it('calls generateSpinoffProposal with HEALTHY status and 0 relatedCount when project has no franchiseId', () => {
    useGameStore.setState({
      gameState: makeFranchiseState([
        { id: 'PRJ-1', genre: 'Action' },
      ]),
    } as any);

    const store = useGameStore.getState() as any;
    store.exploitFranchise('PRJ-1');

    expect(generateSpinoffProposal).toHaveBeenCalled();
    const callArgs = (generateSpinoffProposal as any).mock.calls[0];
    expect(callArgs[1]).toBe('HEALTHY');
    expect(callArgs[2]).toBe(0);
  });
});
