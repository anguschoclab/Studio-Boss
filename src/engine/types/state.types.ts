import { Headline, HeadlineCategory, PublicationType, NewsEvent, MarketEvent, Rumor, SimulationReportId, NewsId } from './engine.types';
import { Franchise } from './franchise.types';
import { TalentPact, TalentPactType, Talent, Scandal, Contract } from './talent.types';
import { Project, Opportunity, GenreTrend, Award, FestivalSubmission, CriticConsensus } from './project.types';
import { RivalStudio, Buyer } from './studio.types';
import { 
  type TalentId, 
  type ProjectId, 
  type StudioId, 
  type FranchiseId, 
  type AssetId, 
  type OpportunityId, 
  type ScandalId, 
  type AwardId,
  type BuyerId,
  type ContractId,
  type PactId
} from './shared.types';

export interface CampaignData {
  id: string; // 🌌 Standardized UUID for this campaign
  projectId: ProjectId;
  budget: number;
  targetCategories: string[];
  buzzBonus: number;     // Multiplier for nomination odds
  scandalRisk: number;   // Probability (0-100) of triggering a PR crisis
}

export interface WeeklyFinancialReport {
  id?: SimulationReportId; // 🌌 Standardized UUID for this record
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
  id?: string; // 🌌 Standardized UUID for this snapshot
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
  projectRecoupment?: Record<ProjectId, number>;
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
  id?: AssetId;
  originalProjectId: ProjectId;
  title: string;
  franchiseId?: FranchiseId; 
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
  ownerStudioId?: StudioId;
  isSynergyActive?: boolean; 
  // Unified Storage: Owner tracking
  ownerId: StudioId; // 'player' or rival studio ID
}

export interface IPState {
  vault: IPAsset[];
  franchises: Record<FranchiseId, Franchise>;
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
  | 'AWARD_WON'
  | 'MODAL_TRIGGERED'
  | 'SYSTEM_TICK'
  | 'PILOT_GRADUATED'
  | 'FORMAT_LICENSED'
  | 'MEDICAL_LEAVE_TRIGGERED'
  | 'DEAL_UPDATED'
  | 'MERGER_OFFERED'
  | 'MERGER_RESOLVED'
  | 'RELATIONSHIP_FORMED'
  | 'RELATIONSHIP_UPDATED'
  | 'CLIQUE_FORMED'
  | 'CLIQUE_UPDATED'
  | 'SCREENPLAY_NOTE_CREATED'
  | 'SCREENPLAY_NOTE_IMPLEMENTED'
  | 'PRODUCTION_ADDITION_CREATED'
  | 'CREDIT_SCENE_CREATED'
  | 'CREDIT_SCENE_UPDATED'
  | 'TALK_SHOW_APPEARANCE_CREATED'
  | 'PHOTOSHOOT_CREATED'
  | 'PRESS_TOUR_CREATED'
  | 'BREAKOUT_STAR_CREATED'
  | 'BREAKOUT_STAR_UPDATED'
  | 'GUEST_STAR_OPPORTUNITY'
  | 'GUEST_STAR_BOOKED'
  | 'DISCOVERY_STATE_UPDATED'
  | 'CASTING_CONSTRAINT_VIOLATION'
  | 'CASTING_PREMIUM_DEMAND'
  | 'CASTING_ALTERNATIVE_SUGGESTED'
  | 'CASTING_CONSTRAINT_CHECKED'
  | 'TV_RECOMMENDATION_CREATED'
  | 'TV_RECOMMENDATION_ACCEPTED'
  | 'TV_RECOMMENDATION_STATE_UPDATED';

export interface NewsImpact {
  id: NewsId;
  headline: string;
  description: string;
  category?: HeadlineCategory;
  publication?: PublicationType;
}

export interface ProjectUpdate { projectId: ProjectId; update: Partial<Project> }
export interface TalentUpdate { talentId: TalentId; update: Partial<Talent> }
export interface RivalUpdate { rivalId: StudioId; update: Partial<RivalStudio> }
export interface BuyerUpdate { buyerId: BuyerId; update: Partial<Buyer> }
export interface ScandalUpdate { scandalId: ScandalId; update: Partial<Scandal> }
export interface FranchiseUpdate { franchiseId: FranchiseId; update: Partial<Franchise> }
export interface VaultAssetUpdate { assetId: AssetId; update: Partial<IPAsset> }
export interface OpportunityUpdate { 
  opportunityId: OpportunityId; 
  rivalId: StudioId; 
  bid: { amount: number; terms: string };
}

export interface BuyerUpdateImpact { type: 'BUYER_UPDATED'; payload: BuyerUpdate }
export interface ProjectUpdateImpact { type: 'PROJECT_UPDATED'; payload: ProjectUpdate }
export interface TalentUpdateImpact { type: 'TALENT_UPDATED'; payload: TalentUpdate }
export interface RivalUpdateImpact { type: 'RIVAL_UPDATED'; payload: RivalUpdate }
export interface OpportunityUpdateImpact { type: 'OPPORTUNITY_UPDATED'; payload: OpportunityUpdate }

export interface AwardImpact {
  type: 'AWARD_WON';
  payload: {
    projectId: ProjectId;
    award: Award;
  };
}

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
  removeContracts?: ContractId[]; 
  uiNotifications?: string[];
  newAwards?: Award[];
  cultClassicProjectIds?: ProjectId[];
  razzieWinnerTalents?: TalentId[];
  newFestivalSubmissions?: FestivalSubmission[];
  newProjects?: Project[];
  newContracts?: Contract[];
  newTalents?: Talent[];
  newIPAssets?: IPAsset[];
}

export type StateImpact = 
  | BuyerUpdateImpact
  | ProjectUpdateImpact
  | TalentUpdateImpact
  | RivalUpdateImpact
  | OpportunityUpdateImpact
  | AwardImpact
  | (BaseImpact & { type?: ImpactType });


export interface PendingDealOffer {
  id: PactId;
  talentId: TalentId;
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
