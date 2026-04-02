// Types related to the Simulation Engine, News, and Events

export type HeadlineCategory = 'rival' | 'market' | 'talent' | 'awards' | 'general' | 'rumor';

export type NewsEventType = 'CRISIS' | 'AWARD' | 'RELEASE' | 'STUDIO_EVENT' | 'RIVAL';

export interface NewsEvent {
  id: string;
  week: number;
  type: NewsEventType;
  headline: string;
  description: string;
  impact?: string;
}

export interface CrisisOption {
  text: string;
  effectDescription: string;
  cashPenalty?: number;
  weeksDelay?: number;
  buzzPenalty?: number;
  reputationPenalty?: number;
  removeTalentId?: string;
}

export interface ActiveCrisis {
  crisisId: string;
  triggeredWeek: number;
  haltedProduction: boolean;
  description: string;
  options: CrisisOption[];
  resolved: boolean;
  severity: 'low' | 'medium' | 'high';
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
  newsEvents?: NewsEvent[];
}

export interface FinanceRecord {
  week: number;
  cash: number;
  revenue: number;
  costs: number;
}

export type MarketEventType = 'streaming_boom' | 'theatrical_revival' | 'writers_strike' | 'actors_strike' | 'platform_war' | 'market_crash' | 'awards_season_frenzy';

export interface MarketEvent {
  id: string;
  type: MarketEventType;
  name: string;
  description: string;
  weeksRemaining: number;
  revenueMultiplier: number;
  costMultiplier: number;
  talentAvailabilityModifier: number; // -1 to 1
  economicShock?: {
    sentimentShift: number; // e.g. -20
    baseRateShift: number;  // e.g. 0.02 for +2%
  };
}

export interface Rumor {
  id: string;
  text: string;
  week: number;
  truthful: boolean;
  category: 'talent' | 'rival' | 'market' | 'project';
  resolved: boolean;
  resolutionWeek?: number;
}
