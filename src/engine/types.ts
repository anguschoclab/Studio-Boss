// Domain models for Studio Boss simulation engine

export type ArchetypeKey = 'major' | 'mid-tier' | 'indie';
export type ProjectStatus = 'development' | 'needs_greenlight' | 'pitching' | 'production' | 'marketing' | 'released' | 'post_release' | 'archived';
export type ProjectFormat = 'film' | 'tv' | 'unscripted';
export type BudgetTierKey = 'low' | 'mid' | 'high' | 'blockbuster';
export type HeadlineCategory = 'rival' | 'market' | 'talent' | 'awards' | 'general' | 'rumor';
export type TvFormatKey =
  | 'sitcom'
  | 'procedural'
  | 'prestige_drama'
  | 'limited_series'
  | 'animated_comedy'
  | 'animated_prestige'
  | 'daytime_soap'
  | 'late_night_talk'
  | 'sketch_comedy'
  | 'sci_fi_epic'
  | 'teen_drama'
  | 'fantasy_epic'
  | 'anthology_series'
  | 'telenovela'
  | 'historical_drama'
  | 'medical_procedural'
  | 'superhero_serial'
  | 'espionage_thriller'
  | 'mockumentary'
  | 'neo_western'
  | 'legal_drama'
  | 'sports_drama'
  | 'mystery_box'
  | 'cyberpunk_dystopia'
  | 'musical_dramedy'
  | 'dark_academia'
  | 'political_thriller'
  | 'satirical_comedy'
  | 'family_drama'
  | 'vampire_romance'
  | 'true_crime_dramatization'
  | 'retro_sitcom'
  | 'military_action'
  | 'workplace_comedy'
  | 'zombie_apocalypse'
  | 'erotic_thriller';

export type UnscriptedFormatKey =
  | 'competition'
  | 'docuseries'
  | 'reality_ensemble'
  | 'game_show'
  | 'lifestyle'
  | 'dating_island'
  | 'true_crime_doc'
  | 'hidden_camera'
  | 'travel_food'
  | 'talent_competition'
  | 'home_renovation'
  | 'survival_challenge'
  | 'pawn_shop_doc'
  | 'celebrity_reality'
  | 'paranormal_investigation'
  | 'business_pitch'
  | 'cooking_battle'
  | 'cult_expose_doc'
  | 'social_experiment'
  | 'baking_championship'
  | 'dating_experiment'
  | 'sports_docuseries'
  | 'nature_doc'
  | 'wedding_reality'
  | 'true_con_doc'
  | 'luxury_real_estate'
  | 'child_pageant'
  | 'polygamy_doc'
  | 'plastic_surgery'
  | 'hoarder_cleanup'
  | 'tattoo_competition'
  | 'gold_mining'
  | 'extreme_cheapskates'
  | 'bounty_hunter'
  | 'vintage_restoration';
export type ReleaseModelKey = 'weekly' | 'binge' | 'split';
export type ProjectContractType = 'upfront' | 'deficit' | 'standard';
export type MandateType = 'sci-fi' | 'comedy' | 'drama' | 'budget_freeze' | 'broad_appeal' | 'prestige';

// --- Ratings & Content (Sprint H) ---
export type ProjectRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'Unrated';
export type ContentFlag = 'violence' | 'profanity' | 'nudity' | 'gore' | 'political';

// --- Demographics (Sprint I) ---
export type DemographicGroup = 'gen-z' | 'millennial' | 'gen-x' | 'boomer';
export type AudienceQuadrant = 'male_under_25' | 'female_under_25' | 'male_over_25' | 'female_over_25' | 'four_quadrant';

// --- Directors (Sprint J) ---
export type DirectorArchetype = 'auteur' | 'journeyman' | 'visionary' | 'commercial_hack';

// --- Scandals & PR (Sprint L) ---
export type ScandalType = 'financial' | 'personal' | 'onset_behavior' | 'legal' | 'feud';
export interface Scandal {
  id: string;
  talentId: string;
  severity: number; // 0-100
  type: ScandalType;
  weeksRemaining: number;
}

// --- Awards ---

export interface AwardsProfile {
  criticScore: number;
  audienceScore: number;
  prestigeScore: number;
  craftScore: number;
  culturalHeat: number;
  campaignStrength: number;
  controversyRisk: number;
  festivalBuzz: number;
  academyAppeal: number;
  guildAppeal: number;
  populistAppeal: number;
  indieCredibility: number;
  industryNarrativeScore: number;
}

export type AwardBody =
  | 'Academy Awards'
  | 'Primetime Emmys'
  | 'BAFTAs'
  | 'Golden Globes'
  | 'Independent Spirit Awards'
  | 'SAG Awards'
  | 'Writers Guild Awards'
  | 'Directors Guild Awards'
  | 'Producers Guild Awards'
  | 'Critics Choice Awards'
  | 'Annie Awards'
  | 'Peabody Awards'
  | 'Cannes Film Festival'
  | 'Sundance Film Festival'
  | 'Venice Film Festival'
  | 'Berlin International Film Festival'
  | 'Toronto International Film Festival'
  | 'SXSW Film Festival'
  | 'Tribeca Film Festival';

export type AwardCategory =
  | 'Best Picture'
  | 'Best Series'
  | 'Best Director'
  | 'Best Actor'
  | 'Best Actress'
  | 'Best Supporting Actor'
  | 'Best Supporting Actress'
  | 'Best Screenplay'
  | 'Best Ensemble'
  | 'Best Animated Feature'
  | 'Best Documentary'
  | 'Special Achievement'
  | 'Palme d\'Or'
  | 'Grand Jury Prize'
  | 'Golden Lion'
  | 'Golden Bear'
  | 'Audience Award'
  | 'Best Narrative Feature';

export type AwardStatus = 'won' | 'nominated';

export interface Award {
  id: string;
  projectId: string;
  name: string;
  category: string;
  body: AwardBody;
  status: AwardStatus;
  year: number;
}

// --- Crisis ---

export interface CrisisOption {
  text: string;
  effectDescription: string;
  cashPenalty?: number;
  weeksDelay?: number;
  buzzPenalty?: number;
}

export interface ActiveCrisis {
  description: string;
  options: CrisisOption[];
  resolved: boolean;
  severity?: 'low' | 'medium' | 'high' | 'catastrophic';
}

// --- IP Rights (Sprint E) ---

export interface IPRights {
  rightsOwner: 'studio' | 'shared' | 'external';
  reversionWeek?: number;
  catalogValue: number;
}

// --- Project ---

export interface Project {
  id: string;
  title: string;
  format: ProjectFormat;
  genre: string;
  budgetTier: BudgetTierKey;
  budget: number;
  weeklyCost: number;
  targetAudience: string;
  flavor: string;
  status: ProjectStatus;
  buzz: number;
  contractType?: ProjectContractType;
  weeksInPhase: number;
  developmentWeeks: number;
  productionWeeks: number;
  revenue: number;
  weeklyRevenue: number;
  ancillaryRevenue?: number;
  releaseWeek: number | null;
  activeCrisis?: ActiveCrisis;
  awardsProfile?: AwardsProfile;
  parentProjectId?: string;
  isSpinoff?: boolean;
  // Release simulation fields
  reviewScore?: number;
  boxOfficeRank?: number;
  // Marketing fields
  marketingBudget?: number;
  marketingDomesticSplit?: number;
  marketingAngle?: string;
  // IP Rights (Sprint E)
  ipRights?: IPRights;
  // TV / Unscripted fields
  tvFormat?: TvFormatKey;
  unscriptedFormat?: UnscriptedFormatKey;
  episodes?: number;
  episodesReleased?: number;
  releaseModel?: ReleaseModelKey;
  season?: number;
  renewable?: boolean;
  buyerId?: string;
  // Sprint H / I additions
  rating?: ProjectRating;
  contentFlags?: ContentFlag[];
  targetDemographic?: AudienceQuadrant;
}

// --- Rivals ---

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

// --- Headlines & News ---

export interface Headline {
  id: string;
  text: string;
  week: number;
  category: HeadlineCategory;
}

export interface WeekSummary {
  fromWeek: number;
  toWeek: number;
  cashBefore: number;
  cashAfter: number;
  totalRevenue: number;
  totalCosts: number;
  projectUpdates: string[];
  newHeadlines: Headline[];
  events: string[];
}

// --- Discovery ---

export type OpportunityType = 'script' | 'package' | 'pitch' | 'rights';
export type DiscoveryOrigin = 'open_spec' | 'agency_package' | 'writer_sample' | 'heat_list' | 'annual_list' | 'passion_project';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  format: ProjectFormat;
  genre: string;
  budgetTier: BudgetTierKey;
  targetAudience: string;
  flavor: string;
  origin: DiscoveryOrigin;
  costToAcquire: number;
  weeksUntilExpiry: number;
  attachedTalentIds?: string[];
  tvFormat?: TvFormatKey;
  unscriptedFormat?: UnscriptedFormatKey;
  episodes?: number;
  releaseModel?: ReleaseModelKey;
  qualityBonus?: number;
}

// --- Finance ---

export interface FinanceRecord {
  week: number;
  cash: number;
  revenue: number;
  costs: number;
}

// --- Talent & Representation ---

export type AccessLevel = 'outsider' | 'soft-access' | 'legacy' | 'dynasty' | 'comeback';
export type TalentRole = 'director' | 'actor' | 'writer' | 'producer' | 'showrunner';
export type AgencyTier = 'powerhouse' | 'major' | 'mid-tier' | 'boutique' | 'specialist';
export type AgencyCulture = 'shark' | 'family' | 'volume' | 'prestige';
export type AgentSpecialty = 'film_packaging' | 'tv_packaging' | 'literary' | 'talent' | 'comedy' | 'unscripted';

export interface Agency {
  id: string;
  name: string;
  tier: AgencyTier;
  culture: AgencyCulture;
  prestige: number;
  leverage: number; // 0-100
  traits?: string[];
}

export interface Agent {
  id: string;
  name: string;
  agencyId?: string;
  specialty: AgentSpecialty;
  prestige: number;
  leverage: number;
  skill?: number;
  aggression?: number;
}

export interface Family {
  id: string;
  name: string;
  recognition: number;
  prestigeLegacy: number;
  commercialLegacy: number;
  scandalLegacy: number;
  volatility: number;
  status: string;
}

export interface TalentProfile {
  id: string;
  name: string;
  roles: TalentRole[];
  agencyId?: string;
  agentId?: string;
  prestige: number;
  fee: number;
  draw: number;
  temperament: string;
  familyId?: string;
  accessLevel: AccessLevel;
  perks?: string[];
  // Sprint J / L additions
  directorArchetype?: DirectorArchetype;
  fandomSize?: number; // 0-100 scale representing loyal fan base
  loyalty?: number; // 0-100 studio loyalty
  controversyRisk?: number; // Base chance of spawning scandals
}

export interface Contract {
  id: string;
  talentId: string;
  projectId: string;
  fee: number;
  backendPercent: number;
  // Sprint E enrichments
  creativeControl?: boolean;
  sequelOption?: boolean;
  backendEscalator?: number; // % bump if revenue exceeds threshold
}

// --- Buyers ---

export type BuyerArchetype = 'network' | 'premium' | 'streamer';

export interface BuyerMandate {
  type: MandateType;
  activeUntilWeek: number;
}

export interface Buyer {
  id: string;
  name: string;
  archetype: BuyerArchetype;
  currentMandate?: BuyerMandate;
}

// --- Genre Trends (Sprint F) ---

export type TrendDirection = 'hot' | 'rising' | 'stable' | 'cooling' | 'dead';

export interface GenreTrend {
  genre: string;
  heat: number; // 0-100
  direction: TrendDirection;
  weeksRemaining: number;
}

// --- Studio Culture (Sprint F) ---

export interface StudioCulture {
  prestigeVsCommercial: number; // -100 (prestige) to 100 (commercial)
  talentFriendlyVsControlling: number; // -100 (friendly) to 100 (controlling)
  nicheVsBroad: number; // -100 (niche) to 100 (broad)
  filmFirstVsTvFirst: number; // -100 (film) to 100 (tv)
}

// --- First-Look Deals (Sprint E) ---

export interface FirstLookDeal {
  id: string;
  talentId: string;
  weeksRemaining: number;
  exclusivity: boolean;
}

// --- Market Events (Sprint G) ---

export type MarketEventType = 'streaming_boom' | 'theatrical_revival' | 'writers_strike' | 'actors_strike' | 'platform_war' | 'market_crash' | 'awards_season_frenzy';

export interface MarketEvent {
  id: string;
  type: MarketEventType;
  name: string;
  description: string;
  weeksRemaining: number;
  revenueMultiplier: number;
  costMultiplier: number;
  talentAvailabilityModifier: number; // -1 to 1
}

// --- Festival Submissions (Sprint G) ---

export type FestivalSubmissionStatus = 'submitted' | 'selected' | 'rejected' | 'won' | 'special_mention';

export interface FestivalSubmission {
  id: string;
  projectId: string;
  festivalBody: AwardBody;
  status: FestivalSubmissionStatus;
  buzzGain: number;
  week: number;
}

// --- Rumors (Sprint G) ---

export interface Rumor {
  id: string;
  text: string;
  week: number;
  truthful: boolean;
  category: 'talent' | 'rival' | 'market' | 'project';
  resolved: boolean;
  resolutionWeek?: number;
}

// --- Game State ---

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
  };
}

// --- Save/Load ---

export interface SaveSlotMeta {
  slot: number;
  studioName: string;
  archetype: ArchetypeKey;
  week: number;
  cash: number;
  timestamp: number;
}
