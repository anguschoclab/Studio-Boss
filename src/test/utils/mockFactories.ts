import { 
  Project, 
  Talent, 
  GameState, 
  Contract, 
  IPAsset, 
  RivalStudio,
  Buyer,
  Agency,
  Opportunity,
  MarketState,
  TVSeasonDetails,
  CriticConsensus,
  AwardsProfile,
} from '@/engine/types';

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
  const id = overrides.id || 'mock-project';
  const type = overrides.type || 'FILM';
  const title = overrides.title || 'Mock Project';
  
  const base: any = {
    id,
    title,
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
    scriptHeat: 50,
    activeRoles: [],
    scriptEvents: [],
    marketingBudget: 0,
    marketingLevel: 'none',
    awards: [],
    reception: {
      metaScore: 0,
      audienceScore: 0,
      reviews: [],
      status: 'Mixed',
      isCultPotential: false
    } as CriticConsensus,
    awardsProfile: {
      criticScore: 0,
      audienceScore: 0,
      prestigeScore: 0,
      craftScore: 0,
      culturalHeat: 0,
      campaignStrength: 0,
      controversyRisk: 0,
      festivalBuzz: 0,
      academyAppeal: 0,
      guildAppeal: 0,
      populistAppeal: 0,
      indieCredibility: 0,
      industryNarrativeScore: 0
    } as AwardsProfile,
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
      } as TVSeasonDetails
    } as SeriesProject;
  }

  return base as FilmProject;
};

export const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  week: 1,
  gameSeed: 42,
  tickCount: 0,
  entities: {
    projects: {},
    talents: {},
    contracts: {},
    rivals: {}
  },
  finance: {
    cash: 5000000,
    ledger: [],
    weeklyHistory: [],
    marketState: createMockMarketState()
  },
  news: { headlines: [] },
  ip: { vault: [], franchises: {} },
  studio: {
    name: 'Test Studio',
    archetype: 'major',
    prestige: 50,
    ownedPlatforms: [],
    internal: {
        projectHistory: [],
    },
    culture: { 
      prestigeVsCommercial: 0,
      talentFriendlyVsControlling: 0,
      nicheVsBroad: 50,
      filmFirstVsTvFirst: 0,
      genrePopularity: { 'Drama': 50, 'Comedy': 50, 'Action': 50, 'Sci-Fi': 50, 'Horror': 50, 'Romance': 50 }
    },
    activeCampaigns: {},
  },
  market: { opportunities: [], buyers: [] },
  industry: {
    families: [],
    agencies: [],
    agents: [],
    awards: [],
    newsHistory: [],
    scandals: []
  },
  deals: { activeDeals: [], pendingOffers: [], expiredDeals: [] },
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

export const createMockRival = (overrides: Partial<RivalStudio> = {}): RivalStudio => ({
  id: 'mock-rival',
  name: 'Mock Rival',
  motto: 'Mock Motto',
  archetype: 'major',
  strength: 50,
  cash: 100000000,
  prestige: 50,
  foundedWeek: 1,
  recentActivity: 'None',
  projectCount: 0,
  strategy: 'acquirer',
  projects: {},
  contracts: {},
  motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
  currentMotivation: 'STABILITY',
  ...overrides
});

export const createMockBuyer = (overrides: Partial<Buyer> = {}): Buyer => {
  const archetype = overrides.archetype || 'streamer';
  const base: any = {
    id: 'mock-buyer',
    name: 'Mock Buyer',
    archetype,
    foundedWeek: 1,
    marketShare: 0.1,
    reach: 50,
    ...overrides
  };

  if (archetype === 'streamer') {
    return {
      ...base,
      subscribers: 1000000,
      churnRate: 0.05,
      contentLibraryQuality: 50,
      marketingSpend: 10000,
      subscriberHistory: [],
      activeLicenses: []
    } as Buyer;
  }

  if (archetype === 'premium') {
    return {
      ...base,
      prestigeBonus: 20
    } as Buyer;
  }

  return base as Buyer;
};

export const createMockMarketState = (overrides: Partial<MarketState> = {}): MarketState => ({
  baseRate: 0.05,
  savingsYield: 0.02,
  debtRate: 0.1,
  loanRate: 0.08,
  rateHistory: [],
  sentiment: 50,
  cycle: 'STABLE',
  ...overrides
});
