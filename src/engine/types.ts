// Domain models for Studio Boss simulation engine

export type ArchetypeKey = 'major' | 'mid-tier' | 'indie';
export type ProjectStatus = 'development' | 'pitching' | 'needs_greenlight' | 'production' | 'marketing' | 'released' | 'post_release' | 'archived';
export type ProjectFormat = 'film' | 'tv';
export type BudgetTierKey = 'low' | 'mid' | 'high' | 'blockbuster';
export type HeadlineCategory = 'rival' | 'market' | 'talent' | 'awards' | 'general';
export type TvFormatKey = 'sitcom' | 'procedural' | 'prestige_drama' | 'limited_series' | 'animated_comedy' | 'animated_prestige';
export type ReleaseModelKey = 'weekly' | 'binge' | 'split';

export interface AwardsProfile {
  criticScore: number;
  audienceScore: number;
  prestigeScore: number;
  craftScore: number;
  culturalHeat: number;
  campaignStrength: number;
  controversyRisk: number;
  festivalBuzz: number;
  // Hidden values
  academyAppeal: number;
  guildAppeal: number;
  populistAppeal: number;
  indieCredibility: number;
  industryNarrativeScore: number;
}

export type AwardBody =
  | 'Academy Awards'
  | 'Primetime Emmys'
  | 'BAFTAs'
  | 'Golden Globes'
  | 'Independent Spirit Awards'
  | 'SAG Awards'
  | 'Writers Guild Awards'
  | 'Directors Guild Awards'
  | 'Producers Guild Awards'
  | 'Critics Choice Awards'
  | 'Annie Awards'
  | 'Peabody Awards';

export type AwardCategory =
  | 'Best Picture'
  | 'Best Series'
  | 'Best Director'
  | 'Best Actor'
  | 'Best Actress'
  | 'Best Supporting Actor'
  | 'Best Supporting Actress'
  | 'Best Screenplay'
  | 'Best Ensemble'
  | 'Best Animated Feature'
  | 'Best Documentary'
  | 'Special Achievement';



export interface Award {
  id: string;
  projectId: string;
  name: string;      // The name of the award category (e.g., "Best Picture")
  category: string;  // Sometimes used broadly
  body: AwardBody;   // The institution
  status: 'won' | 'nominated';
  year: number;
}


export interface CrisisOption {
  text: string;
  effectDescription: string;
  cashPenalty?: number;
  weeksDelay?: number;
  buzzPenalty?: number;
}

export interface ActiveCrisis {
  description: string;
  options: CrisisOption[];
  resolved: boolean;
}

export interface Project {
  id: string;
  title: string;
  format: ProjectFormat;
  genre: string;
  budgetTier: BudgetTierKey;
  budget: number;
  weeklyCost: number;
  targetAudience: string;
  flavor: string;
  status: ProjectStatus;
  buzz: number;
  contractType?: 'upfront' | 'deficit' | 'standard';
  marketingAngle?: string;
  marketingDomesticSplit?: number;
  marketingBudget?: number;
  weeksInPhase: number;
  developmentWeeks: number;
  productionWeeks: number;
  revenue: number;
  weeklyRevenue: number;
  ancillaryRevenue?: number;
  releaseWeek: number | null;
  activeCrisis?: ActiveCrisis;
  awardsProfile?: AwardsProfile;
  parentProjectId?: string;
  isSpinoff?: boolean;
  reviewScore?: number;
  boxOfficeRank?: number;
}

export interface RivalStudio {
  id: string;
  name: string;
  motto: string;
  archetype: ArchetypeKey;
  strength: number;
  cash: number;
  prestige: number;
  recentActivity: string;
  projectCount: number;
}

export interface Headline {
  id: string;
  text: string;
  week: number;
  category: HeadlineCategory;
}


export interface WeekSummary {
  fromWeek: number;
  toWeek: number;
  cashBefore: number;
  cashAfter: number;
  totalRevenue: number;
  totalCosts: number;
  projectUpdates: string[];
  newHeadlines: Headline[];
  events: string[];
}


export type OpportunityType = 'script' | 'package' | 'pitch' | 'rights';
export type DiscoveryOrigin = 'open_spec' | 'agency_package' | 'writer_sample' | 'heat_list' | 'annual_list' | 'passion_project';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  format: ProjectFormat;
  genre: string;
  budgetTier: BudgetTierKey;
  targetAudience: string;
  flavor: string;
  origin: DiscoveryOrigin;
  costToAcquire: number;
  weeksUntilExpiry: number;
  attachedTalentIds?: string[];
  tvFormat?: TvFormatKey;
  episodes?: number;
  releaseModel?: ReleaseModelKey;
}

export interface GameState {
  opportunities: Opportunity[];
  studio: {
    name: string;
    archetype: ArchetypeKey;
    prestige: number;
  };
  projects: Project[];
  rivals: RivalStudio[];
  headlines: Headline[];
  week: number;
  cash: number;
  financeHistory: FinanceRecord[];
  families: Family[];
  agencies: Agency[];
  agents: Agent[];
  talentPool: TalentProfile[];
  contracts: Contract[];
  buyers: Buyer[];
  awards?: Award[];
}

export interface SaveSlotMeta {
  slot: number;
  studioName: string;
  archetype: ArchetypeKey;
  week: number;
  cash: number;
  timestamp: number;
}


export type AccessLevel = 'outsider' | 'soft-access' | 'legacy' | 'dynasty' | 'comeback';

export type TalentRole = 'director' | 'actor' | 'writer' | 'producer' | 'showrunner';
export type AgencyTier = 'powerhouse' | 'major' | 'mid-tier' | 'boutique' | 'specialist';
export type AgencyCulture = 'shark' | 'family' | 'volume' | 'prestige';
export type AgentSpecialty = 'film_packaging' | 'tv_packaging' | 'literary' | 'talent' | 'comedy' | 'unscripted';

export interface Agency {
  id: string;
  name: string;
  tier: AgencyTier;
  culture: AgencyCulture;
  prestige: number;
  leverage: number; // 0-100
}



export interface Contract {
  id: string;
  talentId: string;
  projectId: string;
  fee: number;
  backendPercent: number;
}
