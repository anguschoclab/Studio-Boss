import { Headline } from './engine.types';
import { Franchise } from './franchise.types';
import { TalentPact, TalentPactType } from './talent.types';

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
  ownerStudioId?: string; // Specific ID for rival or player ownership
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
  | 'TALENT_ADDED'
  | 'TALENT_REMOVED'
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
  | 'SYSTEM_TICK'
  | 'PILOT_GRADUATED'
  | 'FORMAT_LICENSED'
  | 'MEDICAL_LEAVE_TRIGGERED'
  | 'DEAL_UPDATED';

export interface NewsImpact {
  id: string;
  headline: string;
  description: string;
  category?: import('./engine.types').HeadlineCategory;
  publication?: import('./engine.types').PublicationType;
}

export interface ProjectUpdate { projectId: string; update: Partial<import('./project.types').Project> }
export interface TalentUpdate { talentId: string; update: Partial<import('./talent.types').Talent> }
export interface RivalUpdate { rivalId: string; update: Partial<import('./studio.types').RivalStudio> }
export interface BuyerUpdate { buyerId: string; update: Partial<import('./studio.types').Buyer> }
export interface ScandalUpdate { scandalId: string; update: Partial<import('./talent.types').Scandal> }
export interface FranchiseUpdate { franchiseId: string; update: Partial<import('./franchise.types').Franchise> }
export interface VaultAssetUpdate { assetId: string; update: Partial<IPAsset> }
export interface OpportunityUpdate { 
  opportunityId: string; 
  rivalId: string; 
  bid: { amount: number; terms: string };
}

export interface BuyerUpdateImpact { type: 'BUYER_UPDATED'; payload: BuyerUpdate }
export interface ProjectUpdateImpact { type: 'PROJECT_UPDATED'; payload: ProjectUpdate }
export interface TalentUpdateImpact { type: 'TALENT_UPDATED'; payload: TalentUpdate }
export interface RivalUpdateImpact { type: 'RIVAL_UPDATED'; payload: RivalUpdate }
export interface OpportunityUpdateImpact { type: 'OPPORTUNITY_UPDATED'; payload: OpportunityUpdate }

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
  newProjects?: import('./project.types').Project[];
  newContracts?: import('./talent.types').Contract[];
  newTalents?: import('./talent.types').Talent[];
  newIPAssets?: IPAsset[];
}

export type StateImpact = BaseImpact & { type?: ImpactType ; payload?: any };

export interface PendingDealOffer {
  id: string;
  talentId: string;
  type: TalentPactType;
  offeredWeek: number;
  expiresWeek: number;
  terms: Partial<TalentPact>;
}

export interface DealsState {
  activeDeals: TalentPact[];
  pendingOffers: PendingDealOffer[];
  expiredDeals: TalentPact[];
}
