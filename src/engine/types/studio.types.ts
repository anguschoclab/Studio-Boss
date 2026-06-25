// Types related to Studios, Rivals, and Game State

import { Project, Opportunity, GenreTrend, FestivalSubmission, Award, ReleaseStrategy } from './project.types';
import { Contract, FirstLookDeal, Family, Agency, Agent, Talent, Scandal, MotivationProfile, RivalStrategy } from './talent.types';
import { NewsEvent, Rumor, MarketEvent } from './engine.types';
import { FinanceState, NewsState, IPState } from './state.types';

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
  behaviorId?: string;
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
  archetypeId?: string;
}

export interface StudioCulture {
  prestigeVsCommercial: number; // 0 (commercial) to 100 (prestige)
  talentFriendlyVsControlling: number; // 0 to 100
  nicheVsBroad: number; // 0 to 100
  filmFirstVsTvFirst: number; // 0 to 100
  franchiseOriginal: number; // 0 (original) to 100 (franchise)
}

export interface GameState {
  week: number;
  gameSeed: number;
  tickCount: number;
  rngState?: number;
  game: {
    currentWeek: number;
  };
  finance: FinanceState;
  news: NewsState;
  ip: IPState;
  entities: {
    projects: Record<string, Project>;
    releasedProjectIds: string[];
    talents: Record<string, Talent>;
    contracts: Record<string, Contract>;
    rivals: Record<string, RivalStudio>;
    shingles?: Record<string, import('./talent.types').ProducerShingle>;
  };
  studio: {
    id: string;
    name: string;
    archetype: ArchetypeKey;
    prestige: number;
    culture?: StudioCulture;
    internal: {
      projectHistory: string[]; // List of project IDs
      firstLookDeals?: FirstLookDeal[];
      projects: Record<string, Project>;
      contracts: Contract[];
    };
    ownedPlatforms?: string[];
    // Loan system
    loans?: import('./state.types').LoanRecord[];
    isBankrupt?: boolean;
    // Achievement tracking (array of unlocked achievement IDs)
    achievements?: string[];
    resolvedCrisesCount?: number;
    bookmarks?: Bookmark[];
    snapshotHistory?: unknown[];
    activeCampaigns?: Record<string, unknown>;
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
    newsHistory: NewsEvent[];
    distressedOffers?: import('./distress.types').DistressedAssetOffer[];
  };
  // UI Data Vis Extensions (Epic 4)
  culture: {
    genrePopularity: Record<string, number>;
  };
  history: StudioSnapshot[];
  eventHistory: GameEvent[];
  deals?: { activeDeals: unknown[]; pendingOffers: unknown[]; expiredDeals: unknown[] };
  talentAgentRelationships?: Record<string, unknown>;
  relationships?: { relationships: Record<string, unknown> };
  tvRecommendations?: {
    recommendations: Record<string, import('./tv-recommendations.types').TVShowRecommendation>;
  };
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

export interface StreamerPlatform extends BuyerBase {
  archetype: 'streamer';
  subscribers: number;
  churnRate: number; // 0.01 to 0.10
  contentLibraryQuality: number; // 0-100: Influences growth
  marketingSpend: number; // Weekly burn
  subscriberHistory: { week: number; count: number }[];
}

export type Buyer = NetworkPlatform | PremiumPlatform | StreamerPlatform;

export interface Bookmark {
  id: string;
  type: 'project' | 'talent';
  createdAtWeek: number;
}

export interface StudioSnapshot {
  year: number;
  week: number;
  funds: number;
  activeProjects: number;     // Count of projects not in 'Released' state
  completedProjects: number;  // Count of projects in 'Released' state
  totalPrestige: number;      // Derived from studio prestige/awards
  timestamp: string;          // ISO string of when snapshot was taken
}
