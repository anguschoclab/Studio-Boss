// Types related to Studios, Rivals, and Game State

import { Project, Opportunity, GenreTrend, FestivalSubmission, Award } from './project.types';
import { Contract, TalentPact, Family, Agency, Agent, Talent, Scandal, MotivationProfile, RivalStrategy } from './talent.types';
import { NewsEvent, Rumor, MarketEvent } from './engine.types';
import { FinanceState, NewsState, IPState, DealsState } from './state.types';

export interface GameEvent {
  id: string;
  week: number;
  type: 'PROJECT_FINISHED' | 'STUDIO_MERGED' | 'AWARD_WON' | 'BANKRUPTCY_WARNING' | 'MARKET_CRASH' | 'TALENT_SCANDAL' | 'GENERAL';
  title: string;
  description: string;
  data?: unknown;
}

export type ArchetypeKey = 'major' | 'mid-tier' | 'indie';

export type StudioMotivation = 'CASH_CRUNCH' | 'AWARD_CHASE' | 'FRANCHISE_BUILDING' | 'MARKET_DISRUPTION' | 'STABILITY';

export interface RivalStudio {
  id: string;
  name: string;
  motto: string;
  archetype: ArchetypeKey;
  strength: number;
  cash: number;
  prestige: number;
  foundedWeek: number;
  recentActivity: string;
  projectCount: number;
  // AI Motivations
  motivationProfile: MotivationProfile;
  currentMotivation: StudioMotivation;
  // Dynamic State
  projects: Record<string, Project>;
  contracts: Contract[];
  // Consolidation & Vertical Integration
  ownedPlatforms?: string[]; // IDs of platforms this studio owns
  parentBrand?: string;
  marketShare?: number; // 0-100: Calculated based on revenue and prestige
  strategy?: RivalStrategy;
  genreFocus?: string;
  acquisitionTarget?: string;
  isAcquirable?: boolean;
  behaviorId?: string; // 🌌 PHASE 2: Links to AI_ARCHETYPES
  ipAssets?: Record<string, import('./state.types').IPAsset>;
  weeklyHistory?: import('./state.types').FinancialSnapshot[];
}

export interface StudioCulture {
  prestigeVsCommercial: number; // -100 (prestige) to 100 (commercial)
  talentFriendlyVsControlling: number; // -100 (friendly) to 100 (controlling)
  nicheVsBroad: number; // -100 (niche) to 100 (broad)
  filmFirstVsTvFirst: number; // -100 (film) to 100 (tv)
}

export interface GameState {
  entities: {
    projects: Record<string, Project>;
    contracts: Record<string, Contract>;
    talents: Record<string, Talent>;
    rivals: Record<string, RivalStudio>;
  };
  week: number;
  gameSeed: number;
  tickCount: number;
  rngState: number;
  game: {
    currentWeek: number;
  };
  finance: FinanceState;
  news: NewsState;
  ip: IPState;
  studio: {
    id: string; // 🌌 Standardized UUID for the player studio
    name: string;
    archetype: ArchetypeKey;
    prestige: number;
    culture?: StudioCulture;
    internal: {
      firstLookDeals?: TalentPact[];
      projectHistory: Project[]; // 🌌 PHASE 2: The Vault
    };
    snapshotHistory: StudioSnapshot[]; // Renamed from history to avoid collision
    ownedPlatforms?: string[];
    isAcquirable?: boolean;
    marketShare?: number; // 🌌 PHASE 2: FTC Anti-Trust Cap (0.0 to 1.0)
  };
  market: {
    opportunities: Opportunity[];
    trends?: GenreTrend[];
    activeMarketEvents?: MarketEvent[];
    buyers: Buyer[];
  };
  industry: {
    families: Family[];
    agencies: Agency[];
    agents: Agent[];
    awards?: Award[];
    festivalSubmissions?: FestivalSubmission[];
    rumors?: Rumor[];
    scandals?: Scandal[];
    activeMergers?: Merger[];
    newsHistory: NewsEvent[];
  };
  deals: DealsState;
  activeCampaigns: Record<string, import('./state.types').CampaignData>;
  // UI Data Vis Extensions (Epic 4)
  culture: {
    genrePopularity: Record<string, number>;
  };
  history: StudioSnapshot[];
  eventHistory: GameEvent[];
}

export interface SaveSlotMeta {
  slot: number;
  studioName: string;
  archetype: ArchetypeKey;
  week: number;
  cash: number;
  timestamp: number;
}

export type BuyerArchetype = 'network' | 'premium' | 'streamer';

export interface BuyerMandate {
  type: import('./project.types').MandateType;
  activeUntilWeek: number;
}

export interface BuyerBase {
  id: string;
  name: string;
  archetype: BuyerArchetype;
  currentMandate?: BuyerMandate;
  foundedWeek: number;
  parentBrand?: string;
  // M&A and Vertical Integration
  ownerId?: string; // ID of the studio that owns this platform
  cash?: number;
  strength?: number;
  isAcquirable?: boolean;
  acquiredBy?: string; // id of buyer that acquired this one
  ownedPlatforms?: string[]; // ids of platforms this buyer has acquired
  parentCompany?: string; // name of parent company after merger
  marketShare: number; // 0-1.0
  reach: number; // 0-100
  maHistory?: { week: number; event: string; value?: number }[];
}

export interface NetworkPlatform extends BuyerBase {
  archetype: 'network';
  reach: number; // 0-100: Influences initial rating
}

export interface PremiumPlatform extends BuyerBase {
  archetype: 'premium';
  prestigeBonus: number; // 0-50: Influences review scores
}

export interface StreamingLicense {
  projectId: string;
  expiryWeek: number;
  isAnchor: boolean; // If true, losing this causes mass churn
  originalOwnerId: string;
}

export interface StreamerPlatform extends BuyerBase {
  archetype: 'streamer';
  subscribers: number;
  churnRate: number; // 0.01 to 0.10
  contentLibraryQuality: number; // 0-100: Influences growth
  marketingSpend: number; // Weekly burn
  subscriberHistory: { week: number; count: number }[];
  activeLicenses: StreamingLicense[];
}

export type Buyer = NetworkPlatform | PremiumPlatform | StreamerPlatform;

export interface StudioSnapshot {
  year: number;
  week: number;
  funds: number;
  activeProjects: number;     // Count of projects not in 'Released' state
  completedProjects: number;  // Count of projects in 'Released' state
  totalPrestige: number;      // Derived from studio prestige/awards
  timestamp: string;          // ISO string of when snapshot was taken
}

export interface Merger {
  id: string;
  buyerId: string;
  targetId: string;
  valuation: number;
  activeUntilWeek: number;
  status: 'pending' | 'completed' | 'cancelled';
}
