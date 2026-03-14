// Domain models for Studio Boss simulation engine

export type ArchetypeKey = 'major' | 'mid-tier' | 'indie';
export type ProjectStatus = 'development' | 'production' | 'released' | 'archived';
export type ProjectFormat = 'film' | 'tv';
export type BudgetTierKey = 'low' | 'mid' | 'high' | 'blockbuster';
export type HeadlineCategory = 'rival' | 'market' | 'talent' | 'awards' | 'general';

export interface Studio {
  name: string;
  archetype: ArchetypeKey;
  prestige: number;
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
}

export interface Award {
  id: string;
  name: string;
  category: string;
}

export interface Contract {
  id: string;
  talentId: string;
  projectId: string;
  terms: Record<string, unknown>;
}
