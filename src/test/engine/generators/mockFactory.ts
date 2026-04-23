import { GameState, RivalStudio, Talent, Project, Contract, Buyer } from '../../../engine/types';

/**
 * Centralized factory for creating compliant GameState objects for testing.
 * Automatically aligns with the Phase 7 'entities' record structure and deterministic standards.
 */
export const createMockGameState = (overrides: Partial<GameState> = {}): GameState => {
  const defaultState: GameState = {
    week: 1,
    gameSeed: 12345,
    tickCount: 0,
    game: { currentWeek: 1 },
    finance: {
      cash: 100_000_000,
      ledger: [],
      weeklyHistory: [],
      marketState: {
        baseRate: 0.05,
        savingsYield: 0.02,
        debtRate: 0.08,
        loanRate: 0.06,
        rateHistory: []
      }
    },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    entities: {
      projects: {},
      talents: {},
      contracts: {},
      rivals: {}
    },
    studio: {
      id: 'PLR-1',
      name: 'Player Studio',
      archetype: 'major',
      prestige: 50,
      internal: {
        projects: {},
        contracts: [],
        firstLookDeals: [],
        projectHistory: []
      }
    },
    market: {
      opportunities: [],
      trends: [],
      activeMarketEvents: [],
      buyers: []
    },
    industry: {
      families: [],
      agencies: [],
      agents: [],
      rivals: [],
      awards: [],
      newsHistory: [],
      rumors: [],
      scandals: []
    },
    culture: {
      genrePopularity: {}
    },
    relationships: {
      discovery: {}
    },
    history: [],
    eventHistory: []
  };

  return { ...defaultState, ...overrides };
};

import { RandomGenerator } from '../../../engine/utils/rng';

export const createMockTickContext = (overrides: Partial<import('../../../engine/services/WeekCoordinator').TickContext> = {}): import('../../../engine/services/WeekCoordinator').TickContext => {
  return {
    week: 1,
    tickCount: 0,
    rng: new RandomGenerator(12345),
    timestamp: Date.now(),
    impacts: [],
    events: [],
    ...overrides
  };
};

export const createMockRival = (overrides: Partial<RivalStudio> = {}): RivalStudio => {
  return {
    id: 'RIV-1',
    name: 'Test Rival',
    motto: 'Competing for tests',
    archetype: 'mid-tier',
    strength: 50,
    cash: 50_000_000,
    prestige: 50,
    foundedWeek: 1,
    recentActivity: 'NONE',
    projectCount: 0,
    motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
    currentMotivation: 'STABILITY',
    projects: {},
    contracts: [],
    ...overrides
  };
};

export const createMockTalent = (overrides: Partial<Talent> = {}): Talent => {
  return {
    id: 'TAL-1',
    name: 'Test Actor',
    role: 'actor',
    roles: ['actor'],
    tier: 'A_LIST',
    prestige: 70,
    fee: 5_000_000,
    draw: 80,
    accessLevel: 'soft-access',
    momentum: 50,
    demographics: { age: 30, gender: 'MALE', ethnicity: 'Unknown', country: 'USA' },
    psychology: { ego: 50, mood: 100, scandalRisk: 10, synergyAffinities: [], synergyConflicts: [] },
    motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
    currentMotivation: 'NONE',
    ...overrides
  };
};

export const createMockProject = (overrides: Partial<Project> = {}): Project => {
  return {
    id: 'PRJ-1',
    title: 'Test Project',
    genre: 'Drama',
    format: 'movie',
    status: 'Development',
    budget: 50_000_000,
    spent: 0,
    targetQuality: 70,
    currentQuality: 0,
    weekStarted: 1,
    weeksInProduction: 0,
    estimatedWeeks: 10,
    talents: [],
    ...overrides
  } as Project;
};

export const createMockBuyer = (overrides: Partial<Buyer> = {}): Buyer => {
  return {
    id: 'BUY-1',
    name: 'Test Network',
    archetype: 'network',
    reach: 70,
    marketShare: 0.1,
    foundedWeek: 1,
    ...overrides
  } as Buyer;
};

export const createMockContract = (overrides: Partial<Contract> = {}): Contract => {
  return {
    id: 'CON-1',
    projectId: 'PRJ-1',
    talentId: 'TAL-1',
    type: 'acting',
    status: 'active',
    fee: 1_000_000,
    weeksRemaining: 10,
    ...overrides
  };
};
