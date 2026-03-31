import { NewsEvent, Headline, Project, Scandal, Opportunity, GenreTrend, MarketEvent, Rumor, Buyer, FestivalSubmission, FinanceRecord, Franchise } from './index';

export interface WeeklyFinancialReport {
  week: number;
  year: number;
  startingCash: number;
  revenue: {
    boxOffice: number;
    distribution: number;
    other: number;
  };
  expenses: {
    production: number;
    marketing: number;
    overhead: number;
  };
  endingCash: number;
  netProfit: number;
}

export interface FinanceState {
  cash: number;
  ledger: WeeklyFinancialReport[];
}

export interface NewsState {
  headlines: Headline[];
}

export interface IPAsset {
  id: string;
  originalProjectId: string;
  title: string;
  franchiseId?: string; // New field for Shared Universe grouping
  baseValue: number; // Based on box office / ratings success
  decayRate: number; // Drops every week
  merchandisingMultiplier: number; 
  syndicationStatus: 'NONE' | 'SYNDICATED';
  syndicationTier: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD';
  totalEpisodes: number;
  rightsExpirationWeek: number; 
  rightsOwner: 'STUDIO' | 'MARKET' | 'RIVAL';
}

export interface IPState {
  vault: IPAsset[];
  franchises: Record<string, Franchise>; // Centralized Meta-Hub
}

export type ImpactType = 
  | 'FUNDS_CHANGED' 
  | 'FUNDS_DEDUCTED'
  | 'PROJECT_UPDATED' 
  | 'PROJECT_REMOVED' 
  | 'NEWS_ADDED' 
  | 'TALENT_UPDATED' 
  | 'PRESTIGE_CHANGED'
  | 'BUYER_UPDATED'
  | 'RIVAL_UPDATED'
  | 'OPPORTUNITY_UPDATED'
  | 'TRENDS_UPDATED'
  | 'SCANDAL_ADDED'
  | 'SCANDAL_REMOVED'
  | 'MARKET_EVENT_UPDATED'
  | 'LEDGER_UPDATED'
  | 'SYSTEM_TICK';

export interface StateImpact {
  type?: ImpactType;
  payload?: any;
  [key: string]: any;
}

