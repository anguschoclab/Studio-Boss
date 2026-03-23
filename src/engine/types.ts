// Domain models for Studio Boss simulation engine

export type ArchetypeKey = 'major' | 'mid-tier' | 'indie';
export type ProjectStatus = 'development' | 'needs_greenlight' | 'pitching' | 'production' | 'released' | 'archived';
export type ProjectFormat = 'film' | 'tv' | 'unscripted';
export type BudgetTierKey = 'low' | 'mid' | 'high' | 'blockbuster';
export type HeadlineCategory = 'rival' | 'market' | 'talent' | 'awards' | 'general';
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
}

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
  // TV / Unscripted fields
  tvFormat?: TvFormatKey;
  unscriptedFormat?: UnscriptedFormatKey;
  episodes?: number;
  episodesReleased?: number;
  releaseModel?: ReleaseModelKey;
  season?: number;
  renewable?: boolean;
  buyerId?: string;
}

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
}

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
}

// Talent & Representation

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
  leverage: number;
}

export interface Agent {
  id: string;
  name: string;
  agencyId?: string;
  specialty: AgentSpecialty;
  prestige: number;
  leverage: number;
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
}

export interface Contract {
  id: string;
  talentId: string;
  projectId: string;
  fee: number;
  backendPercent: number;
}

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

export interface GameState {
  opportunities: Opportunity[];
  studio: {
    name: string;
    archetype: ArchetypeKey;
    prestige: number;
  };
  projects: Project[];
  rivals: RivalStudio[];
  headlines: Headline[];
  week: number;
  cash: number;
  financeHistory: FinanceRecord[];
  families: Family[];
  agencies: Agency[];
  agents: Agent[];
  talentPool: TalentProfile[];
  contracts: Contract[];
  buyers: Buyer[];
  awards?: Award[];
}

export interface SaveSlotMeta {
  slot: number;
  studioName: string;
  archetype: ArchetypeKey;
  week: number;
  cash: number;
  timestamp: number;
}


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
  traits?: string[]; // new trait system
}



export interface Contract {
  id: string;
  talentId: string;
  projectId: string;
  fee: number;
  backendPercent: number;
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

export interface Agent {
  id: string;
  agencyId: string;
  name: string;
  specialty: AgentSpecialty;
  skill: number;
  aggression: number;
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
  perks?: string[]; // new perk system
}
