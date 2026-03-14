// Domain models for Studio Boss simulation engine

export type ArchetypeKey = 'major' | 'mid-tier' | 'indie';
export type ProjectStatus = 'development' | 'production' | 'released' | 'archived';
export type ProjectFormat = 'film' | 'tv';
export type BudgetTierKey = 'low' | 'mid' | 'high' | 'blockbuster';
export type HeadlineCategory = 'rival' | 'market' | 'talent' | 'awards' | 'general';
export type TvFormatKey = 'sitcom' | 'procedural' | 'prestige_drama' | 'limited_series' | 'animated_comedy' | 'animated_prestige';
export type ReleaseModelKey = 'weekly' | 'binge' | 'split';

export interface Studio {
  name: string;
  archetype: ArchetypeKey;
  prestige: number;
}

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

export type AwardStatus = 'won' | 'nominated';

export interface Award {
  id: string;
  projectId: string;
  name: string;      // The name of the award category (e.g., "Best Picture")
  category: string;  // Sometimes used broadly
  body: AwardBody;   // The institution
  status: AwardStatus;
  year: number;
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
  weeksInPhase: number;
  developmentWeeks: number;
  productionWeeks: number;
  revenue: number;
  weeklyRevenue: number;
  releaseWeek: number | null;
  awardsProfile?: AwardsProfile;
  // TV specific fields
  tvFormat?: TvFormatKey;
  episodes?: number;
  season?: number;
  releaseModel?: ReleaseModelKey;
  episodesReleased?: number;
  renewable?: boolean;
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

export interface FinanceRecord {
  week: number;
  cash: number;
  revenue: number;
  costs: number;
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

export interface GameState {
  studio: Studio;
  projects: Project[];
  rivals: RivalStudio[];
  headlines: Headline[];
  week: number;
  cash: number;
  financeHistory: FinanceRecord[];
  talentPool: TalentProfile[];
  contracts: Contract[];
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

// Future system stubs
export interface TalentProfile {
  id: string;
  name: string;
  type: 'director' | 'actor' | 'writer' | 'producer';
  prestige: number;
  fee: number;
  draw: number;
}

export interface Contract {
  id: string;
  talentId: string;
  projectId: string;
  fee: number;
  backendPercent: number;
}
