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
  FilmProject,
  SeriesProject,
  StreamerPlatform,
  PremiumPlatform,
  NetworkPlatform,
  ProjectBase,
  ProjectType,
  ScriptMetrics,
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
  isBreakout: false,
  onMedicalLeave: false,
  ...overrides
});

export const createMockProject = (overrides: Partial<Project> = {}): Project => {
  const id = overrides.id || 'mock-project';
  const type = overrides.type || 'FILM';
  const title = overrides.title || 'Mock Project';
  
  const commonReception: CriticConsensus = {
    metaScore: 0,
    audienceScore: 0,
    reviews: [],
    status: 'Mixed',
    isCultPotential: false
  };

  const commonAwardsProfile: AwardsProfile = {
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
  };

  const baseProperties: ProjectBase = {
    id,
    title,
    type: (type as ProjectType), // Discriminated later
    format: 'film', // Default, overwritten by subtypes
    genre: overrides.genre || 'Drama',
    budgetTier: overrides.budgetTier || 'mid',
    budget: overrides.budget || 10000000,
    weeklyCost: overrides.weeklyCost || 250000,
    targetAudience: overrides.targetAudience || 'General',
    flavor: overrides.flavor || 'A mock project.',
    state: overrides.state || 'development',
    buzz: overrides.buzz || 50,
    weeksInPhase: overrides.weeksInPhase || 0,
    developmentWeeks: overrides.developmentWeeks || 10,
    productionWeeks: overrides.productionWeeks || 20,
    revenue: overrides.revenue || 0,
    weeklyRevenue: overrides.weeklyRevenue || 0,
    releaseWeek: overrides.releaseWeek !== undefined ? overrides.releaseWeek : null,
    activeCrisis: overrides.activeCrisis !== undefined ? overrides.activeCrisis : null,
    momentum: overrides.momentum || 50,
    quality: overrides.quality || 50,
    scriptHeat: overrides.scriptHeat || 50,
    progress: overrides.progress || 0,
    accumulatedCost: overrides.accumulatedCost || 0,
    ownerId: overrides.ownerId || 'player',
    reviewScore: overrides.reviewScore || 50,
    buzz: overrides.buzz || 50,
    genre: overrides.genre || 'Drama',
    budgetTier: overrides.budgetTier || 'mid',
    budget: overrides.budget || 10000000,
    targetAudience: overrides.targetAudience || 'General',
    state: overrides.state || 'development',
    awards: overrides.awards || [],
    reception: overrides.reception || commonReception,
    awardsProfile: overrides.awardsProfile || commonAwardsProfile,
    ...overrides
  };

  if (type === 'SERIES') {
    const seriesOverrides = overrides as Partial<SeriesProject>;
    const series: SeriesProject = {
      ...baseProperties,
      type: 'SERIES',
      format: seriesOverrides.format || 'tv',
      activeRoles: seriesOverrides.activeRoles || [],
      scriptEvents: seriesOverrides.scriptEvents || [],
      tvDetails: {
        currentSeason: 1,
        episodesOrdered: 10,
        episodesCompleted: 0,
        episodesAired: 0,
        averageRating: 0,
        status: 'IN_DEVELOPMENT',
        ...seriesOverrides.tvDetails
      }
    };
    return series;
  }

  const filmOverrides = overrides as Partial<FilmProject>;
  const film: FilmProject = {
    ...baseProperties,
    type: 'FILM',
    format: 'film',
    activeRoles: filmOverrides.activeRoles || [],
    scriptEvents: filmOverrides.scriptEvents || [],
  };
  return film;
};

export const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  week: 1,
  gameSeed: 42,
  tickCount: 0,
  rngState: 12345,
  game: { currentWeek: 1 },
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
    id: 'player-studio',
    name: 'Test Studio',
    archetype: 'major',
    prestige: 50,
    ownedPlatforms: [],
    internal: {
        projectHistory: [],
    },
    snapshotHistory: [],
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
  talentAgentRelationships: {},
  relationships: {
    relationships: {}
  },
  history: [],
  eventHistory: [],
  ...overrides
});

export const createMockContract = (overrides: Partial<Contract> = {}): Contract => ({
  id: 'mock-contract',
  projectId: 'mock-project',
  talentId: 'mock-talent',
  role: 'actor',
  fee: 500000,
  backendPercent: 0,
  ownerId: 'player',
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
  ownerId: 'player',
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
  projectIds: [],
  contractIds: [],
  ipAssetIds: [],
  motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
  currentMotivation: 'STABILITY',
  ...overrides
});

export const createMockBuyer = (overrides: Partial<Buyer> = {}): Buyer => {
  const archetype = overrides.archetype || 'streamer';
  const baseDefaults = {
    id: 'mock-buyer',
    name: 'Mock Buyer',
    archetype,
    foundedWeek: 1,
    marketShare: 0.1,
    reach: 50,
  };

  if (archetype === 'streamer') {
    const streamerOverrides = overrides as Partial<StreamerPlatform>;
    const streamer: StreamerPlatform = {
      ...baseDefaults,
      archetype: 'streamer',
      subscribers: streamerOverrides.subscribers || 1000000,
      churnRate: streamerOverrides.churnRate || 0.05,
      contentLibraryQuality: streamerOverrides.contentLibraryQuality || 50,
      marketingSpend: streamerOverrides.marketingSpend || 10000,
      subscriberHistory: streamerOverrides.subscriberHistory || [],
      activeLicenses: streamerOverrides.activeLicenses || [],
    };
    return streamer;
  }

  if (archetype === 'premium') {
    const premiumOverrides = overrides as Partial<PremiumPlatform>;
    const premium: PremiumPlatform = {
      ...baseDefaults,
      archetype: 'premium',
      prestigeBonus: premiumOverrides.prestigeBonus || 20,
    };
    return premium;
  }

  const networkOverrides = overrides as Partial<NetworkPlatform>;
  const network: NetworkPlatform = {
    ...baseDefaults,
    archetype: 'network',
  };
  return network;
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

