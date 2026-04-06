import { Headline, HeadlineCategory, PublicationType, NewsEvent, MarketEvent, Rumor } from './engine.types';
import { Franchise } from './franchise.types';
import { TalentPact, TalentPactType, Talent, Scandal, Contract } from './talent.types';
import { Project, Opportunity, GenreTrend, Award, FestivalSubmission, CriticConsensus } from './project.types';
import { RivalStudio, Buyer } from './studio.types';

export interface CampaignData {
  projectId: string;
  budget: number;
  targetCategories: string[];
  buzzBonus: number;     // Multiplier for nomination odds
  scandalRisk: number;   // Probability (0-100) of triggering a PR crisis
}

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
    interestOnCeb?: number;
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
  ownerStudioId?: string;
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
  | 'DEAL_UPDATED'
  | 'MERGER_OFFERED'
  | 'MERGER_RESOLVED';

export interface NewsImpact {
  id: string;
  headline: string;
  description: string;
  category?: HeadlineCategory;
  publication?: PublicationType;
}

export interface ProjectUpdate { projectId: string; update: Partial<Project> }
export interface TalentUpdate { talentId: string; update: Partial<Talent> }
export interface RivalUpdate { rivalId: string; update: Partial<RivalStudio> }
export interface BuyerUpdate { buyerId: string; update: Partial<Buyer> }
export interface ScandalUpdate { scandalId: string; update: Partial<Scandal> }
export interface FranchiseUpdate { franchiseId: string; update: Partial<Franchise> }
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
  newsEvents?: NewsEvent[];
  newHeadlines?: Headline[];
  newOpportunities?: Opportunity[];
  newTrends?: GenreTrend[];
  newMarketEvents?: MarketEvent[];
  newRumors?: Rumor[];
  newScandals?: Scandal[];
  scandalUpdates?: ScandalUpdate[];
  removeContracts?: string[]; 
  uiNotifications?: string[];
  newAwards?: Award[];
  cultClassicProjectIds?: string[];
  razzieWinnerTalents?: string[];
  newFestivalSubmissions?: FestivalSubmission[];
  newProjects?: Project[];
  newContracts?: Contract[];
  newTalents?: Talent[];
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
