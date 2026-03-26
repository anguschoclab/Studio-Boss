// Types related to Studios, Rivals, and Game State

import { Project, Opportunity, GenreTrend, FestivalSubmission, Award, MandateType } from './project.types';
import { Contract, FirstLookDeal, Family, Agency, Agent, TalentProfile, Scandal } from './talent.types';
import { FinanceRecord, NewsEvent, Headline, Rumor, MarketEvent } from './engine.types';

export type ArchetypeKey = 'major' | 'mid-tier' | 'indie';

export type RivalStrategy = 'blockbuster_focused' | 'prestige_chaser' | 'genre_specialist' | 'acquirer' | 'poacher' | 'balanced';

export interface RivalStudio {
  id: string;
  name: string;
  motto: string;
  archetype: ArchetypeKey;
  strength: number;
  cash: number;
  prestige: number;
  recentActivity: string;
  projectCount: number;
  // Sprint F additions
  strategy?: RivalStrategy;
  genreFocus?: string;
  acquisitionTarget?: string;
  isAcquirable?: boolean;
}

export interface StudioCulture {
  prestigeVsCommercial: number; // -100 (prestige) to 100 (commercial)
  talentFriendlyVsControlling: number; // -100 (friendly) to 100 (controlling)
  nicheVsBroad: number; // -100 (niche) to 100 (broad)
  filmFirstVsTvFirst: number; // -100 (film) to 100 (tv)
}

export interface GameState {
  week: number;
  cash: number;
  studio: {
    name: string;
    archetype: ArchetypeKey;
    prestige: number;
    culture?: StudioCulture;
    internal: {
      projects: Project[];
      contracts: Contract[];
      financeHistory: FinanceRecord[];
      firstLookDeals?: FirstLookDeal[];
    };
  };
  market: {
    opportunities: Opportunity[];
    trends?: GenreTrend[];
    activeMarketEvents?: MarketEvent[];
    buyers: Buyer[];
  };
  industry: {
    rivals: RivalStudio[];
    headlines: Headline[];
    families: Family[];
    agencies: Agency[];
    agents: Agent[];
    talentPool: TalentProfile[];
    awards?: Award[];
    festivalSubmissions?: FestivalSubmission[];
    rumors?: Rumor[];
    scandals?: Scandal[];
    newsHistory: NewsEvent[];
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

export interface Buyer {
  id: string;
  name: string;
  archetype: BuyerArchetype;
  currentMandate?: BuyerMandate;
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
