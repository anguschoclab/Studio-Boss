import { Headline } from "./engine.types";
import { Franchise } from "./franchise.types";
import { Project } from "./project.types";

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

export interface FinancialCausalityEntry {
  factor: string;
  effect: string;
  magnitude: number;
  description: string;
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
  causality?: FinancialCausalityEntry[];
}

export interface MarketState {
  baseRate: number; // e.g. 0.04 for 4%
  savingsYield: number;
  debtRate: number;
  loanRate: number;
  rateHistory: { week: number; rate: number }[];
  sentiment?: number;
  cycle?: string;
}

export interface LoanRecord {
  id: string;
  principal: number;
  interestRate: number;
  weeklyPayment: number;
  weeksRemaining: number;
  startWeek: number;
  lenderName: string;
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
  syndicationStatus: "NONE" | "SYNDICATED";
  syndicationTier: "NONE" | "BRONZE" | "SILVER" | "GOLD";
  totalEpisodes: number;
  rightsExpirationWeek: number;
  rightsOwner: "STUDIO" | "MARKET" | "RIVAL";
  ownerStudioId?: string;
}

export interface IPState {
  vault: IPAsset[];
  franchises: Record<string, Franchise>; // Centralized Meta-Hub
}

export type ImpactType =
  | "FUNDS_CHANGED"
  | "FUNDS_DEDUCTED"
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_REMOVED"
  | "AWARD_WON"
  | "PILOT_GRADUATED"
  | "NEWS_ADDED"
  | "TALENT_UPDATED"
  | "TALENT_ADDED"
  | "TALENT_REMOVED"
  | "CASTING_CONSTRAINT_CHECKED"
  | "MEDICAL_LEAVE_TRIGGERED"
  | "PRESTIGE_CHANGED"
  | "BUYER_UPDATED"
  | "RIVAL_UPDATED"
  | "OPPORTUNITY_UPDATED"
  | "TRENDS_UPDATED"
  | "SCANDAL_ADDED"
  | "SCANDAL_REMOVED"
  | "SCANDAL_UPDATED"
  | "MARKET_EVENT_UPDATED"
  | "LEDGER_UPDATED"
  | "FINANCE_TRANSACTION"
  | "FINANCE_SNAPSHOT_ADDED"
  | "SYNC_M_A_FUNDS"
  | "INDUSTRY_UPDATE"
  | "MERGER_OFFERED"
  | "MERGER_RESOLVED"
  | "SYSTEM_TICK"
  | "MODAL_TRIGGERED"
  | "SHINGLE_CREATED"
  | "SHINGLE_UPDATED"
  | "SHINGLE_DISSOLVED"
  | "TV_RECOMMENDATION_CREATED"
  | "TV_RECOMMENDATION_ACCEPTED"
  | "TV_RECOMMENDATION_STATE_UPDATED"
  | "RELATIONSHIP_FORMED"
  | "RELATIONSHIP_UPDATED"
  | "CLIQUE_FORMED"
  | "CLIQUE_UPDATED"
  | "SCREENPLAY_NOTE_CREATED"
  | "SCREENPLAY_NOTE_IMPLEMENTED"
  | "PRODUCTION_ADDITION_CREATED"
  | "CREDIT_SCENE_CREATED"
  | "CREDIT_SCENE_UPDATED"
  | "TALK_SHOW_APPEARANCE_CREATED"
  | "PHOTOSHOOT_CREATED"
  | "PRESS_TOUR_CREATED"
  | "BREAKOUT_STAR_CREATED"
  | "BREAKOUT_STAR_UPDATED"
  | "GUEST_STAR_OPPORTUNITY"
  | "GUEST_STAR_BOOKED"
  | "DISCOVERY_STATE_UPDATED"
  | "FRANCHISE_UPDATED"
  | "VAULT_ASSET_UPDATED"
  | "FORMAT_LICENSED"
  | "DEAL_UPDATED"
  | "CASTING_CONSTRAINT_VIOLATION"
  | "CASTING_PREMIUM_DEMAND"
  | "CASTING_ALTERNATIVE_SUGGESTED"
  | "CONTRACT_ADDED";

export interface ProjectUpdate {
  projectId: string;
  update: Partial<import("./project.types").Project>;
}
export interface TalentUpdate {
  talentId: string;
  update: Partial<import("./talent.types").Talent>;
}
export interface RivalUpdate {
  rivalId: string;
  update: Partial<import("./studio.types").RivalStudio>;
}
export interface BuyerUpdate {
  buyerId: string;
  update: Partial<import("./studio.types").Buyer>;
}
export interface ScandalUpdate {
  scandalId: string;
  update: Partial<import("./talent.types").Scandal>;
}

export interface BaseImpact {
  payload?: unknown;
  cashChange?: number;
  prestigeChange?: number;
  projectUpdates?: ProjectUpdate[];
  talentUpdates?: TalentUpdate[];
  rivalUpdates?: RivalUpdate[];
  buyerUpdates?: BuyerUpdate[];
  newsEvents?: import("./engine.types").NewsEvent[];
  newHeadlines?: import("./engine.types").Headline[];
  newOpportunities?: import("./project.types").Opportunity[];
  newTrends?: import("./project.types").GenreTrend[];
  newMarketEvents?: import("./engine.types").MarketEvent[];
  newRumors?: import("./engine.types").Rumor[];
  newScandals?: import("./talent.types").Scandal[];
  scandalUpdates?: ScandalUpdate[];
  removeContracts?: string[];
  newContracts?: import("./talent.types").Contract[];
  newProjects?: import("./project.types").Project[];
  uiNotifications?: string[];
  newAwards?: import("./project.types").Award[];
  cultClassicProjectIds?: string[];
  razzieWinnerTalents?: string[];
  newFestivalSubmissions?: import("./project.types").FestivalSubmission[];
}

export interface CampaignData {
  id: string;
  projectId: string;
  budget: number;
  targetCategories: string[];
  buzzBonus: number;
  scandalRisk: number;
}

export interface FundsImpact extends BaseImpact {
  type: "FUNDS_CHANGED";
  payload: { amount: number };
}
export interface FundsDeductedImpact extends BaseImpact {
  type: "FUNDS_DEDUCTED";
  payload: { amount: number };
}
export interface ProjectCreatedImpact extends BaseImpact {
  type: "PROJECT_CREATED";
  payload: { project: Project };
}
export interface ProjectUpdateImpact extends BaseImpact {
  type: "PROJECT_UPDATED";
  payload: ProjectUpdate;
}
export type ProjectRemovedImpact = BaseImpact & {
  type: "PROJECT_REMOVED";
  payload: { projectId: string };
};
export type NewsImpact = BaseImpact & {
  type: "NEWS_ADDED";
  payload: {
    headline: string;
    description: string;
    category?: import("./engine.types").HeadlineCategory;
  };
};
export type TalentUpdateImpact = BaseImpact & { type: "TALENT_UPDATED"; payload: TalentUpdate };
export interface PrestigeChangedImpact extends BaseImpact {
  type: "PRESTIGE_CHANGED";
  payload: { amount: number };
}
export interface BuyerUpdateImpact extends BaseImpact {
  type: "BUYER_UPDATED";
  payload: BuyerUpdate;
}
export interface RivalUpdateImpact extends BaseImpact {
  type: "RIVAL_UPDATED";
  payload: RivalUpdate;
}
export interface OpportunityUpdateImpact extends BaseImpact {
  type: "OPPORTUNITY_UPDATED";
  payload: { opportunityId: string; rivalId: string; bid: { amount: number; terms: string } };
}
export interface TrendsUpdateImpact extends BaseImpact {
  type: "TRENDS_UPDATED";
  payload: { trends: import("./project.types").GenreTrend[] };
}
export interface ScandalAddedImpact extends BaseImpact {
  type: "SCANDAL_ADDED";
  payload: { scandal: import("./talent.types").Scandal };
}
export interface ScandalRemovedImpact extends BaseImpact {
  type: "SCANDAL_REMOVED";
  payload: { scandalId: string };
}
export interface ScandalUpdatedImpact extends BaseImpact {
  type: "SCANDAL_UPDATED";
  payload: { scandalUpdates: ScandalUpdate[] };
}
export interface MarketEventUpdateImpact extends BaseImpact {
  type: "MARKET_EVENT_UPDATED";
  payload: { events?: import("./engine.types").MarketEvent[]; marketState?: MarketState };
}
export interface LedgerImpact extends BaseImpact {
  type: "LEDGER_UPDATED";
  payload: { report: WeeklyFinancialReport };
}
export interface FinanceTransactionImpact extends BaseImpact {
  type: "FINANCE_TRANSACTION";
  payload: { amount: number; description: string };
}
export interface FinanceSnapshotImpact extends BaseImpact {
  type: "FINANCE_SNAPSHOT_ADDED";
  payload: { snapshot: FinancialSnapshot };
}
export interface SyncMAFundsImpact extends BaseImpact {
  type: "SYNC_M_A_FUNDS";
  payload: { amount: number };
}
export interface SystemTickImpact extends BaseImpact {
  type: "SYSTEM_TICK";
  payload: { week?: number; tickCount?: number };
}
export interface ModalTriggeredImpact extends BaseImpact {
  type: "MODAL_TRIGGERED";
  payload: { modalType: string; priority: number; payload: any };
}
export interface PilotGraduatedImpact extends BaseImpact {
  type: "PILOT_GRADUATED";
  payload: { projectId: string; nextState: "production" };
}
export interface ShingleCreatedImpact extends BaseImpact {
  type: "SHINGLE_CREATED";
  payload: { shingle: import("./talent.types").ProducerShingle };
}
export interface ShingleUpdatedImpact extends BaseImpact {
  type: "SHINGLE_UPDATED";
  payload: { shingleId: string; update: Partial<import("./talent.types").ProducerShingle> };
}
export interface ShingleDissolvedImpact extends BaseImpact {
  type: "SHINGLE_DISSOLVED";
  payload: { shingleId: string };
}
export interface TVRecommendationCreatedImpact extends BaseImpact {
  type: "TV_RECOMMENDATION_CREATED";
  payload: {
    recommendation: import("./tv-recommendations.types").TVShowRecommendation;
    notification?: string;
  };
}
export interface TVRecommendationAcceptedImpact extends BaseImpact {
  type: "TV_RECOMMENDATION_ACCEPTED";
  payload: { recommendationId: string; talentId?: string; notification?: string };
}
export interface TVRecommendationStateUpdatedImpact extends BaseImpact {
  type: "TV_RECOMMENDATION_STATE_UPDATED";
  payload: {
    tvRecommendations: Record<string, import("./tv-recommendations.types").TVShowRecommendation>;
  };
}
export interface IndustryUpdateImpact extends BaseImpact {
  type: "INDUSTRY_UPDATE";
  payload: {
    update: Record<string, unknown>;
    rival?: RivalUpdate;
    mergedRivalId?: string;
    acquirerId?: string;
    bankruptRivalId?: string;
  };
}

// Generic impact interfaces for typed impacts whose payloads are handled by their respective handler modules
export interface AwardWonImpact extends BaseImpact {
  type: "AWARD_WON";
}
export interface TalentAddedImpact extends BaseImpact {
  type: "TALENT_ADDED";
}
export interface TalentRemovedImpact extends BaseImpact {
  type: "TALENT_REMOVED";
}
export interface CastingConstraintCheckedImpact extends BaseImpact {
  type: "CASTING_CONSTRAINT_CHECKED";
}
export interface MedicalLeaveTriggeredImpact extends BaseImpact {
  type: "MEDICAL_LEAVE_TRIGGERED";
}
export interface RelationshipFormedImpact extends BaseImpact {
  type: "RELATIONSHIP_FORMED";
}
export interface RelationshipUpdatedImpact extends BaseImpact {
  type: "RELATIONSHIP_UPDATED";
}
export interface CliqueFormedImpact extends BaseImpact {
  type: "CLIQUE_FORMED";
}
export interface CliqueUpdatedImpact extends BaseImpact {
  type: "CLIQUE_UPDATED";
}
export interface ScreenplayNoteCreatedImpact extends BaseImpact {
  type: "SCREENPLAY_NOTE_CREATED";
}
export interface ScreenplayNoteImplementedImpact extends BaseImpact {
  type: "SCREENPLAY_NOTE_IMPLEMENTED";
}
export interface ProductionAdditionCreatedImpact extends BaseImpact {
  type: "PRODUCTION_ADDITION_CREATED";
}
export interface CreditSceneCreatedImpact extends BaseImpact {
  type: "CREDIT_SCENE_CREATED";
}
export interface CreditSceneUpdatedImpact extends BaseImpact {
  type: "CREDIT_SCENE_UPDATED";
}
export interface TalkShowAppearanceCreatedImpact extends BaseImpact {
  type: "TALK_SHOW_APPEARANCE_CREATED";
}
export interface PhotoshootCreatedImpact extends BaseImpact {
  type: "PHOTOSHOOT_CREATED";
}
export interface PressTourCreatedImpact extends BaseImpact {
  type: "PRESS_TOUR_CREATED";
}
export interface BreakoutStarCreatedImpact extends BaseImpact {
  type: "BREAKOUT_STAR_CREATED";
}
export interface BreakoutStarUpdatedImpact extends BaseImpact {
  type: "BREAKOUT_STAR_UPDATED";
}
export interface GuestStarOpportunityImpact extends BaseImpact {
  type: "GUEST_STAR_OPPORTUNITY";
}
export interface GuestStarBookedImpact extends BaseImpact {
  type: "GUEST_STAR_BOOKED";
}
export interface DiscoveryStateUpdatedImpact extends BaseImpact {
  type: "DISCOVERY_STATE_UPDATED";
}
export interface MergerOfferedImpact extends BaseImpact {
  type: "MERGER_OFFERED";
}
export interface MergerResolvedImpact extends BaseImpact {
  type: "MERGER_RESOLVED";
}
export interface FranchiseUpdatedImpact extends BaseImpact {
  type: "FRANCHISE_UPDATED";
}
export interface VaultAssetUpdatedImpact extends BaseImpact {
  type: "VAULT_ASSET_UPDATED";
}
export interface FormatLicensedImpact extends BaseImpact {
  type: "FORMAT_LICENSED";
}
export interface DealUpdatedImpact extends BaseImpact {
  type: "DEAL_UPDATED";
}
export interface CastingConstraintViolationImpact extends BaseImpact {
  type: "CASTING_CONSTRAINT_VIOLATION";
}
export interface CastingPremiumDemandImpact extends BaseImpact {
  type: "CASTING_PREMIUM_DEMAND";
}
export interface CastingAlternativeSuggestedImpact extends BaseImpact {
  type: "CASTING_ALTERNATIVE_SUGGESTED";
}
export interface ContractAddedImpact extends BaseImpact {
  type: "CONTRACT_ADDED";
}

export type StateImpact =
  | FundsImpact
  | FundsDeductedImpact
  | ProjectCreatedImpact
  | ProjectUpdateImpact
  | ProjectRemovedImpact
  | NewsImpact
  | TalentUpdateImpact
  | PrestigeChangedImpact
  | BuyerUpdateImpact
  | RivalUpdateImpact
  | OpportunityUpdateImpact
  | TrendsUpdateImpact
  | ScandalAddedImpact
  | ScandalRemovedImpact
  | ScandalUpdatedImpact
  | MarketEventUpdateImpact
  | LedgerImpact
  | FinanceTransactionImpact
  | FinanceSnapshotImpact
  | SyncMAFundsImpact
  | SystemTickImpact
  | ModalTriggeredImpact
  | PilotGraduatedImpact
  | IndustryUpdateImpact
  | ShingleCreatedImpact
  | ShingleUpdatedImpact
  | ShingleDissolvedImpact
  | TVRecommendationCreatedImpact
  | TVRecommendationAcceptedImpact
  | TVRecommendationStateUpdatedImpact
  | AwardWonImpact
  | TalentAddedImpact
  | TalentRemovedImpact
  | CastingConstraintCheckedImpact
  | MedicalLeaveTriggeredImpact
  | RelationshipFormedImpact
  | RelationshipUpdatedImpact
  | CliqueFormedImpact
  | CliqueUpdatedImpact
  | ScreenplayNoteCreatedImpact
  | ScreenplayNoteImplementedImpact
  | ProductionAdditionCreatedImpact
  | CreditSceneCreatedImpact
  | CreditSceneUpdatedImpact
  | TalkShowAppearanceCreatedImpact
  | PhotoshootCreatedImpact
  | PressTourCreatedImpact
  | BreakoutStarCreatedImpact
  | BreakoutStarUpdatedImpact
  | GuestStarOpportunityImpact
  | GuestStarBookedImpact
  | DiscoveryStateUpdatedImpact
  | MergerOfferedImpact
  | MergerResolvedImpact
  | FranchiseUpdatedImpact
  | VaultAssetUpdatedImpact
  | FormatLicensedImpact
  | DealUpdatedImpact
  | CastingConstraintViolationImpact
  | CastingPremiumDemandImpact
  | CastingAlternativeSuggestedImpact
  | ContractAddedImpact
  | (BaseImpact & { type?: undefined }); // The "Bag" impact
