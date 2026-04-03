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
    pacts: number;
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
    passive: number; 
  };
  expenses: {
    production: number;
    burn: number; 
    marketing: number;
    pacts: number; 
    royalties: number; 
    interest: number; 
  };
  net: number;
  cash: number;
  projectRecoupment?: Record<string, number>;
}

export type MarketCycle = 'BOOM' | 'STABLE' | 'BEAR' | 'RECESSION' | 'RECOVERY';

export interface MarketState {
  baseRate: number; 
  savingsYield: number;
  debtRate: number;
  loanRate: number;
  rateHistory: { week: number; rate: number }[];
  sentiment: number; 
  cycle: MarketCycle;
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

export type IPAssetTier = 'ORIGINAL' | 'BLOCKBUSTER' | 'CULT_CLASSIC' | 'LEGACY';

export interface IPAsset {
  id: string;
  originalProjectId: string;
  title: string;
  franchiseId?: string; 
  tier: IPAssetTier;
  quality: number; 
  baseValue: number; 
  decayRate: number; 
  merchandisingMultiplier: number; 
  syndicationStatus: 'NONE' | 'SYNDICATED';
  syndicationTier: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD';
  totalEpisodes: number;
  rightsExpirationWeek: number; 
  rightsOwner: 'STUDIO' | 'MARKET' | 'RIVAL';
  isSynergyActive?: boolean; 
}

export interface IPState {
  vault: IPAsset[];
  franchises: Record<string, Franchise>;
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
  | 'FRANCHISE_UPDATED'
  | 'SCANDAL_ADDED'
  | 'SCANDAL_REMOVED'
  | 'MARKET_EVENT_UPDATED'
  | 'LEDGER_UPDATED'
  | 'FINANCE_TRANSACTION'
  | 'FINANCE_SNAPSHOT_ADDED'
  | 'SYNC_M_A_FUNDS'
  | 'VAULT_ASSET_UPDATED'
  | 'INDUSTRY_UPDATE'
  | 'MODAL_TRIGGERED'
  | 'SYSTEM_TICK';

export interface ProjectUpdate { projectId: string; update: Partial<import('./project.types').Project> }
export interface TalentUpdate { talentId: string; update: Partial<import('./talent.types').Talent> }
export interface RivalUpdate { rivalId: string; update: Partial<import('./studio.types').RivalStudio> }
export interface BuyerUpdate { buyerId: string; update: Partial<import('./studio.types').Buyer> }
export interface ScandalUpdate { scandalId: string; update: Partial<import('./talent.types').Scandal> }
export interface FranchiseUpdate { franchiseId: string; update: Partial<import('./franchise.types').Franchise> }
export interface VaultAssetUpdate { assetId: string; update: Partial<IPAsset> }

export interface BaseImpact {
  payload?: unknown;
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

export type StateImpact = BaseImpact & { type?: ImpactType ; payload?: any };
