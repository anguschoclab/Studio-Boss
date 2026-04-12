// Types related to Projects, Formats, and Markets
import { ActiveCrisis } from './engine.types';

export type CharacterArchetype = 
  | 'protagonist'
  | 'antagonist'
  | 'mentor'
  | 'love_interest'
  | 'comic_relief'
  | 'anti_hero'
  | 'sidekick'
  | 'femme_fatale'
  | 'loose_cannon'
  | 'everyman'
  | 'chosen_one'
  | 'wise_fool';

export interface ScriptEvent {
  week: number;
  type: 'ROLE_MERGE' | 'ROLE_SPLIT' | 'ARCHETYPE_CHANGE' | 'PLOT_TWIST_ADDED' | 'DIALOGUE_POLISH';
  description: string;
  qualityImpact: number;
  heatGain: number;
}

export interface ScriptMetrics {
  structure: number;        // 0-100: Narrative coherence, pacing, act structure
  dialogue: number;         // 0-100: Character voice, subtext, memorable lines
  originality: number;      // 0-100: Fresh concepts, avoiding clichés
  pacing: number;           // 0-100: Rhythm, tension building, scene economy
  emotionalImpact: number;  // 0-100: Audience engagement, stakes, payoff
  commercialViability: number; // 0-100: Market appeal, four-quadrant potential
  overallScore: number;     // 0-100: Weighted average of above metrics
  trend: 'improving' | 'stable' | 'declining';
  lastCalculatedWeek: number; // Track when metrics were calculated
}

export type MarketingAngle = 
  | 'SELL_THE_SPECTACLE' 
  | 'SELL_THE_STORY' 
  | 'SELL_THE_STARS' 
  | 'FAMILY_ADVENTURE' 
  | 'AWARDS_PUSH'
  | 'GRASSROOTS'
  | 'GLOBAL_BLITZ'
  | 'CONTROVERSY';

export interface MarketingCampaign {
  domesticBudget: number;
  foreignBudget: number;
  primaryAngle: MarketingAngle;
  efficiencyMultiplier?: number; // Calculated at release (e.g., 0.5 = bomb, 1.5 = viral hit)
  weeksInMarketing?: number; // For decay calculation
  feedbackText?: string; 
}

export interface BoxOfficeResult {
  openingWeekendDomestic: number;
  openingWeekendForeign: number;
  totalDomestic: number;
  totalForeign: number;
  multiplier: number;
}

export interface StreamingViewershipEntry {
  week: number;
  hoursWatched: number;      // Total hours watched that week
  uniqueViewers: number;      // Unique viewers that week
  completionRate: number;    // % of viewers who finished
  dropoffRate: number;        // % drop from previous week
  platform: string;          // Platform ID (Netflix, etc.)
}

export interface StreamingViewershipHistory {
  platform: string;
  entries: StreamingViewershipEntry[];
  totalHoursWatched: number;
  peakViewers: number;
  peakWeek: number;
  averageCompletionRate: number;
}

export type ProjectStatus = 'development' | 'needs_greenlight' | 'pitching' | 'production' | 'marketing' | 'released' | 'post_release' | 'archived' | 'turnaround' | 'pilot' | 'shopping';
export type ProjectFormat = 'film' | 'tv' | 'unscripted' | 'animation';
export type BudgetTierKey = 'indie' | 'low' | 'mid' | 'high' | 'blockbuster';

export type TvFormatKey = string;

export type UnscriptedFormatKey = string;


export type ReleaseModelKey = 'weekly' | 'binge' | 'split';
export type ProjectContractType = 'upfront' | 'deficit' | 'standard';
export type MandateType = 'sci-fi' | 'comedy' | 'drama' | 'budget_freeze' | 'broad_appeal' | 'prestige';

export type RatingMarket = 'us' | 'uk' | 'europe' | 'china' | 'india' | 'latam' | 'middleeast' | 'apac';

export type FilmRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'Unrated';
export type TvRating = 'TV-Y' | 'TV-G' | 'TV-PG' | 'TV-14' | 'TV-MA';
export type ProjectRating = FilmRating | TvRating;

export type RatingCutType = 'theatrical' | 'directors_cut' | 'unrated' | 'sanitized';

export type ContentFlag = 'violence' | 'profanity' | 'nudity' | 'gore' | 'political'
  | 'sexual_content' | 'drug_use' | 'lgbtq_themes' | 'religious' | 'supernatural' | 'gambling';

export interface RegionalRating {
  market: RatingMarket;
  rating: ProjectRating;
  isBanned: boolean;
  restrictionLevel: 'none' | 'minor' | 'major' | 'banned';
}

export interface RatingCut {
  type: RatingCutType;
  rating: ProjectRating;
  contentFlags: ContentFlag[];
  buzzCost: number;
  revenueMultiplier: number;
}

export interface RatingEconomics {
  theaterAccessPct: number;
  audienceReachMultiplier: number;
  merchMultiplier: number;
  awardsPrestigeBonus: number;
  streamingPremium: number;
}

export type DemographicGroup = 'gen-z' | 'millennial' | 'gen-x' | 'boomer';
export type AudienceQuadrant = 'male_under_25' | 'female_under_25' | 'male_over_25' | 'female_over_25' | 'four_quadrant';

export interface Review {
  criticName: string;
  score: number;
  text: string;
}

export interface CriticConsensus {
  metaScore: number;       // 0-100
  audienceScore: number;   // 0-100
  reviews: Review[];
  status: 'Acclaimed' | 'Mixed' | 'Panned';
  isCultPotential: boolean;
}

export interface AwardsProfile {
  criticScore: number;
  audienceScore: number;
  prestigeScore: number;
  awards?: Award[];
  isCultClassic?: boolean;
  isBoxOfficeSuccess?: boolean;
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
  | 'Tribeca Film Festival'
  | 'Telluride Film Festival'
  | 'Slamdance Film Festival'
  | 'The Razzies';

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
  | 'Best Narrative Feature'
  | 'Best Drama Series'
  | 'Best Comedy Series'
  | 'Best Limited Series'
  | 'Best TV Movie'
  | 'Best Actor (Drama)'
  | 'Best Actress (Drama)'
  | 'Best Actor (Comedy)'
  | 'Best Actress (Comedy)'
  | 'Best Supporting Actor (TV)'
  | 'Best Supporting Actress (TV)';

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

export interface IPRights {
  rightsOwner: 'studio' | 'shared' | 'external';
  reversionWeek?: number;
  catalogValue: number;
}

export interface TVSeasonDetails {
  currentSeason: number;
  episodesOrdered: number;
  episodesCompleted: number;
  episodesAired: number;
  averageRating: number; // 1-100 scale
  status: 'IN_DEVELOPMENT' | 'ON_AIR' | 'ON_BUBBLE' | 'RENEWED' | 'CANCELLED' | 'SYNDICATED';
}

export type ProjectType = 'FILM' | 'SERIES';

export interface ProjectBase {
  id: string;
  title: string;
  type: ProjectType;
  format: ProjectFormat;
  genre: string;
  budgetTier: BudgetTierKey;
  budget: number;
  weeklyCost: number;
  targetAudience: string;
  flavor: string;
  state: ProjectStatus;
  buzz: number;
  awards?: Award[];
  contractType?: ProjectContractType;
  weeksInPhase: number;
  developmentWeeks: number;
  productionWeeks: number;
  revenue: number;
  weeklyRevenue: number;
  ancillaryRevenue?: number;
  releaseWeek: number | null;
  activeCrisis: ActiveCrisis | null;
  momentum: number; // 1-100: Influences budget burn and final quality
  progress: number; // 0-100
  accumulatedCost: number;
  awardsProfile?: AwardsProfile;
  reception?: CriticConsensus; 
  parentProjectId?: string;
  isSpinoff?: boolean;
  isGlobalIcon?: boolean;
  razzieWinner?: boolean;
  franchiseId?: string;
  originalProjectId?: string; // Links to the vault asset it's rebooting/spinning off
  // Release simulation fields
  reviewScore?: number;
  boxOfficeRank?: number;
  acquisitionCost?: number; // 🌌 PHASE 2: Price paid in auction/market
  // Marketing fields
  marketingBudget?: number;
  marketingLevel?: 'none' | 'basic' | 'blockbuster';
  marketingDomesticSplit?: number;
  marketingAngle?: string;
  // IP Rights
  ipRights?: IPRights;
  // Common Sprint H / I additions
  rating?: ProjectRating;
  contentFlags?: ContentFlag[];
  targetDemographic?: AudienceQuadrant;
  isCultClassic?: boolean;
  marketingCampaign?: MarketingCampaign;
  boxOffice?: BoxOfficeResult;
  isAcquired?: boolean;
  distributionStatus?: 'theatrical' | 'streaming' | 'syndicated';
  buyerId?: string;
  // Phase 2: Dynamic Scheduling & Pipeline Management
  isRecasting?: boolean;
  turnaroundStartWeek?: number;
  estimatedWindow?: { startWeek: number; endWeek: number };
  // Ratings System
  activeCut?: RatingCutType;
  availableCuts?: RatingCut[];
  regionalRatings?: RegionalRating[];
  directorsCutNotified?: boolean;
  // Phase 2: Deal & Revenue Mechanics
  dealModel?: 'cost_plus' | 'deficit_financing' | 'self_distributed' | 'independent';
  backendPoints?: number;       // 0-100, % of net backend revenue to player
  isPrimetimeAnchor?: boolean;  // triggers international format rights on season 2+ renewal
  stage?: 'pilot' | 'series' | 'shopping'; // sub-state for TV projects
  shoppingExpiresWeek?: number; // week when 'shopping' status lapses
  streamingViewership?: StreamingViewershipHistory[]; // NEW FIELD for Phase 6
  // Unified Storage: Owner tracking
  ownerId: string; // 'player' or rival studio ID
  archetypeId?: string; // Links to StudioArchetype for archetype-driven behavior
}

export interface ScriptedProject extends ProjectBase {
  scriptHeat: number; // 0-100: Influences evolution events
  activeRoles: CharacterArchetype[];
  scriptEvents: ScriptEvent[];
  scriptMetrics?: ScriptMetrics;
}

export interface UnscriptedProject extends ProjectBase {
  unscriptedFormat: UnscriptedFormatKey;
}

export interface FilmProject extends ScriptedProject {
  type: 'FILM';
}

export interface SeriesProject extends ScriptedProject {
  type: 'SERIES';
  tvFormat?: TvFormatKey;
  tvDetails: TVSeasonDetails;
  releaseModel?: ReleaseModelKey;
  nielsenProfile?: import('../systems/television/nielsenSystem').NielsenProfile;
}

export type Project = FilmProject | SeriesProject | (UnscriptedProject & { type: 'SERIES' });

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
  bids: Record<string, { amount: number; terms: string }>; // StudioId -> Bid Data
  highestBidderId?: string | 'PLAYER';
  bidHistory: { rivalId: string | 'PLAYER'; amount: number; week: number }[];
  expirationWeek: number; // When the auction resolves
}

export type TrendDirection = 'hot' | 'rising' | 'stable' | 'cooling' | 'dead';

export interface GenreTrend {
  genre: string;
  heat: number; // 0-100
  direction: TrendDirection;
  weeksRemaining: number;
  description?: string;
}

export type FestivalSubmissionStatus = 'submitted' | 'selected' | 'rejected' | 'won' | 'special_mention';

export interface FestivalSubmission {
  id: string;
  projectId: string;
  festivalBody: AwardBody;
  status: FestivalSubmissionStatus;
  buzzGain: number;
  week: number;
}
