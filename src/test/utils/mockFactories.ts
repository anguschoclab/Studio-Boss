import { 
  Project, 
  Talent, 
  GameState, 
  Contract, 
  IPAsset, 
  RivalStudio,
  Buyer,
  ArchetypeKey,
  Agency,
  Opportunity,
  OpportunityUpdate,
  TalentRole,
  TalentTier
} from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';

export const createMockTalent = (overrides: Partial<Talent> = {}): Talent => ({
  id: 'mock-talent',
  name: 'Mock Artist',
  role: 'actor',
  roles: ['actor'],
  tier: 3,
  prestige: 50,
  draw: 50,
  fee: 1000000,
  momentum: 50,
  starMeter: 40,
  bio: 'A mock talent for testing.',
  accessLevel: 'outsider',
  demographics: { age: 30, gender: 'MALE', ethnicity: 'Caucasian', country: 'USA' },
  psychology: { ego: 50, mood: 50, scandalRisk: 10, synergyAffinities: [], synergyConflicts: [] },
  skills: { acting: 70, directing: 20, writing: 20, stardom: 50 },
  commitments: [],
  fatigue: 0,
  preferredGenres: ['Drama'],
  motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
  currentMotivation: 'NONE',
  motivationImpulse: 'NONE',
  ...overrides
});

export const createMockProject = (overrides: Partial<Project> = {}): Project => {
  const type = overrides.type || 'FILM';
  const base: any = {
    id: 'mock-project',
    title: 'Mock Project',
    type,
    format: type === 'SERIES' ? 'tv' : 'film',
    genre: 'Drama',
    budgetTier: 'mid',
    budget: 10000000,
    weeklyCost: 250000,
    targetAudience: 'General',
    flavor: 'A mock project.',
    state: 'development',
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 10,
    productionWeeks: 20,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: null,
    activeCrisis: null,
    momentum: 50,
    progress: 0,
    accumulatedCost: 0,
    ...overrides
  };

  if (type === 'SERIES') {
    return {
      ...base,
      tvDetails: {
        currentSeason: 1,
        episodesOrdered: 10,
        episodesCompleted: 0,
        episodesAired: 0,
        averageRating: 0,
        status: 'IN_DEVELOPMENT',
        ...((overrides as any).tvDetails || {})
      }
    } as Project;
  }

  return {
    ...base,
    scriptHeat: 50,
    activeRoles: [],
    scriptEvents: []
  } as Project;
};

export const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  week: 1,
  gameSeed: 42,
  tickCount: 0,
  game: { currentWeek: 1 },
  finance: {
    cash: 5000000,
    ledger: [],
    weeklyHistory: [],
    marketState: {
      baseRate: 0.05,
      savingsYield: 0.02,
      debtRate: 0.1,
      loanRate: 0.08,
      rateHistory: [],
      sentiment: 50,
      cycle: 'STABLE'
    }
  },
  news: { headlines: [] },
  ip: { vault: [], franchises: {} },
  studio: {
    name: 'Test Studio',
    archetype: 'major',
    prestige: 50,
    internal: { projects: {}, contracts: [] },
    ownedPlatforms: []
  },
  market: { opportunities: [], buyers: [] },
  industry: {
    rivals: [],
    families: [],
    agencies: [],
    agents: [],
    talentPool: {},
    awards: [],
    newsHistory: []
  },
  deals: { activeDeals: [], pendingOffers: [], expiredDeals: [] },
  culture: { genrePopularity: {} },
  history: [],
  eventHistory: [],
  ...overrides
} as GameState);

export const createMockContract = (overrides: Partial<Contract> = {}): Contract => ({
  id: 'mock-contract',
  projectId: 'mock-project',
  talentId: 'mock-talent',
  role: 'actor',
  fee: 500000,
  backendPercent: 0,
  ...overrides
});

export const createMockIPAsset = (overrides: Partial<IPAsset> = {}): IPAsset => ({
  id: 'mock-ip',
  originalProjectId: 'mock-project',
  title: 'Mock IP',
  tier: 'ORIGINAL',
  quality: 70,
  baseValue: 1000000,
  decayRate: 0.2,
  merchandisingMultiplier: 1.0,
  syndicationStatus: 'NONE',
  syndicationTier: 'NONE',
  totalEpisodes: 0,
  rightsExpirationWeek: 100,
  rightsOwner: 'STUDIO',
  ...overrides
});

export const createMockAgency = (overrides: Partial<Agency> = {}): Agency => ({
  id: 'mock-agency',
  name: 'Mock Agency',
  archetype: 'powerhouse',
  tier: 'powerhouse',
  culture: 'shark',
  prestige: 50,
  leverage: 50,
  marketSensitivity: 0.5,
  globalReach: 50,
  ...overrides
});

export const createMockOpportunity = (overrides: Partial<Opportunity> = {}): Opportunity => ({
  id: 'mock-opportunity',
  type: 'script',
  title: 'Mock Opportunity',
  format: 'film',
  genre: 'Drama',
  budgetTier: 'mid',
  targetAudience: 'General',
  flavor: 'Mock flavor',
  origin: 'open_spec',
  costToAcquire: 100000,
  weeksUntilExpiry: 4,
  expirationWeek: 10,
  bids: {},
  bidHistory: [],
  ...overrides
});
