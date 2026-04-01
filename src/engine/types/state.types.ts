import { Headline } from './engine.types';
import { Franchise } from './franchise.types';

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

export interface FinancialSnapshot {
  week: number;
  revenue: {
    theatrical: number;
    streaming: number;
    merch: number;
    passive: number; // From archived IP
  };
  expenses: {
    production: number;
    burn: number; // Studio Overhead
    marketing: number;
    royalties: number; // Talent point payouts
    interest: number; // Debt or Savings
  };
  net: number;
  cash: number;
}

export interface MarketState {
  baseRate: number; // e.g. 0.04 for 4%
  savingsYield: number;
  debtRate: number;
  loanRate: number;
  rateHistory: { week: number; rate: number }[];
}

export interface FinanceState {
  cash: number;
  ledger: WeeklyFinancialReport[];
  weeklyHistory: FinancialSnapshot[];
  marketState: MarketState;
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
  | 'FINANCE_TRANSACTION'
  | 'FINANCE_SNAPSHOT_ADDED'
  | 'SYNC_M_A_FUNDS'
  | 'INDUSTRY_UPDATE'
  | 'SYSTEM_TICK';

export interface ProjectUpdate { projectId: string; update: Partial<import('./project.types').Project> }
export interface TalentUpdate { talentId: string; update: Partial<import('./talent.types').Talent> }
export interface RivalUpdate { rivalId: string; update: Partial<import('./studio.types').RivalStudio> }
export interface BuyerUpdate { buyerId: string; update: Partial<import('./studio.types').BuyerBase> }
export interface ScandalUpdate { scandalId: string; update: Partial<import('./talent.types').Scandal> }

export interface BaseImpact {
  type?: ImpactType;
  payload?: any;
  cashChange?: number;
  prestigeChange?: number;
  projectUpdates?: ProjectUpdate[];
  talentUpdates?: TalentUpdate[];
  rivalUpdates?: RivalUpdate[];
  buyerUpdates?: BuyerUpdate[];
  newsEvents?: import('./engine.types').NewsEvent[];
  newHeadlines?: import('./engine.types').Headline[];
  newOpportunities?: import('./project.types').Opportunity[];
  newTrends?: import('./project.types').GenreTrend[];
  newMarketEvents?: import('./engine.types').MarketEvent[];
  newRumors?: import('./engine.types').Rumor[];
  newScandals?: import('./talent.types').Scandal[];
  scandalUpdates?: ScandalUpdate[];
  removeContracts?: string[]; 
  uiNotifications?: string[];
  newAwards?: import('./project.types').Award[];
  cultClassicProjectIds?: string[];
  razzieWinnerTalents?: string[];
  newFestivalSubmissions?: import('./project.types').FestivalSubmission[];
}

export type StateImpact = 
  | (BaseImpact & { type: 'FUNDS_CHANGED'; payload: { amount: number } })
  | (BaseImpact & { type: 'FUNDS_DEDUCTED'; payload: { amount: number } })
  | (BaseImpact & { type: 'PROJECT_UPDATED'; payload: ProjectUpdate })
  | (BaseImpact & { type: 'PROJECT_REMOVED'; payload: { projectId: string } })
  | (BaseImpact & { type: 'NEWS_ADDED'; payload: { headline: string; description: string } })
  | (BaseImpact & { type: 'TALENT_UPDATED'; payload: TalentUpdate })
  | (BaseImpact & { type: 'PRESTIGE_CHANGED'; payload: { amount: number } })
  | (BaseImpact & { type: 'BUYER_UPDATED'; payload: BuyerUpdate })
  | (BaseImpact & { type: 'RIVAL_UPDATED'; payload: RivalUpdate })
  | (BaseImpact & { type: 'OPPORTUNITY_UPDATED'; payload: { opportunityId: string; rivalId: string; bid: any } })
  | (BaseImpact & { type: 'TRENDS_UPDATED'; payload: { trends: import('./project.types').GenreTrend[] } })
  | (BaseImpact & { type: 'SCANDAL_ADDED'; payload: { scandal: import('./talent.types').Scandal } })
  | (BaseImpact & { type: 'SCANDAL_REMOVED'; payload: { scandalId: string } })
  | (BaseImpact & { type: 'MARKET_EVENT_UPDATED'; payload: { events?: import('./engine.types').MarketEvent[]; marketState?: MarketState } })
  | (BaseImpact & { type: 'LEDGER_UPDATED'; payload: { report: WeeklyFinancialReport } })
  | (BaseImpact & { type: 'FINANCE_TRANSACTION'; payload: { amount: number; description: string } })
  | (BaseImpact & { type: 'FINANCE_SNAPSHOT_ADDED'; payload: { snapshot: FinancialSnapshot } })
  | (BaseImpact & { type: 'SYNC_M_A_FUNDS'; payload: { amount: number } })
  | (BaseImpact & { type: 'SYSTEM_TICK'; payload: { week?: number; tickCount?: number } })
  | BaseImpact; // Support for "merged" impacts with no type
