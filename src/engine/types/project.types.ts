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

export type ProjectStatus = 'development' | 'needs_greenlight' | 'pitching' | 'production' | 'marketing' | 'released' | 'post_release' | 'archived' | 'turnaround' | 'pilot' | 'shopping';
export type ProjectFormat = 'film' | 'tv' | 'unscripted' | 'animation';
export type BudgetTierKey = 'low' | 'mid' | 'high' | 'blockbuster';

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
  | 'erotic_thriller'
  | 'cooking_showdown'
  | 'docudrama'
  | 'space_opera'
  | 'paranormal_romance'
  | 'sports_comedy'
  | 'supernatural_teen_drama'
  | 'heist_thriller'
  | 'post_apocalyptic_survival'
  | 'musical_competition'
  | 'sketch_show_revival'
  | 'sci_fi_anthology'
  | 'true_crime_miniseries'
  | 'superhero_teamup'
  | 'dark_comedy_thriller'
  | 'historical_fiction_epic'
  | 'music_industry_drama'
  | 'sports_docudrama'
  | 'cyberpunk_anime'
  | 'cozy_mystery'
  | 'satirical_news'
  | 'prestige_limited_series'
  | 'binge_thriller'
  | 'adult_animation'
  | 'franchise_spinoff'
  | 'prestige_horror_anthology'
  | 'international_thriller'
  | 'gritty_reboot'
  | 'high_concept_comedy'
  | 'tech_dystopia'
  | 'prestige_biopic'
  | 'fantasy_prequel'
  | 'interactive_special'
  | 'micro_series'
  | 'foreign_language_hit'
  | 'live_event_series'
  | 'nostalgia_reunion'
  | 'docu_comedy'
  | 'sci_fi_noir'
  | 'holiday_miniseries'
  | 'vr_immersive_show'
  | 'sports_soap_opera'
  | 'teen_mystery'
  | 'scifi_procedural'
  | 'spy_comedy'
  | 'sports_anime'
  | 'historical_romance'
  | 'political_satire'
  | 'superhero_parody'
  | 'gothic_horror'
  | 'musical_soap'
  | 'true_crime_spoof'
  | 'action_comedy'
  | 'workplace_thriller'
  | 'teen_supernatural_comedy'
  | 'western_procedural'
  | 'space_western'
  | 'k_drama_adaptation'
  | 'live_action_anime'
  | 'neo_noir_procedural'
  | 'multiverse_anthology'
  | 'standup_comedy_series'
  | 'cyberpunk_satire'
  | 'steampunk_fantasy'
  | 'post_apocalyptic_soap'
  | 'supernatural_procedural'
  | 'historical_heist'
  | 'mecha_anime'
  | 'vampire_sitcom'
  | 'retro_sci_fi'
  | 'fantasy_workplace_comedy'
  | 'time_travel_romance'
  | 'trashy_dating_island'
  | 'true_crime_docuseries'
  | 'superhero_origin'
  | 'high_fantasy_epic'
  | 'teen_mystery_box'
  | 'workplace_mockumentary'
  | 'satirical_news_show'
    | 'historical_romance'
  | 'medical_soap'
  | 'alien_invasion_thriller'
  | 'political_family_drama'
  | 'historical_comedy'
  | 'superhero_parody_sitcom'
  | 'prestige_espionage_miniseries'
  | 'lawyer_comedy'
  | 'gothic_romance'
  | 'tech_startup_thriller'
  | 'suburban_mystery';

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
  | 'vintage_restoration'
  | 'celebrity_rehab'
  | 'extreme_fitness'
  | 'dating_in_the_dark'
  | 'treasure_hunting'
  | 'influencer_house'
  | 'survival_island'
  | 'pet_rescue'
  | 'baking_disasters'
  | 'tiny_house_hunters'
  | 'flea_market_flip'
  | 'celebrity_dating'
  | 'extreme_survival_coop'
  | 'luxury_yacht_crew'
  | 'true_crime_cold_case'
  | 'tech_startup_doc'
  | 'amateur_baking_disasters'
  | 'paranormal_reality'
  | 'high_stakes_poker'
  | 'fashion_design_competition'
  | 'travel_adventure_race'
  | 'trashy_dating_island'
  | 'true_crime_docuseries'
  | 'reality_real_estate'
  | 'survival_betrayal'
  | 'celebrity_escape_room'
  | 'social_media_experiment'
  | 'extreme_baking_wars'
  | 'poly_dating_experiment'
  | 'cult_survivor_doc'
  | 'influencer_survival'
  | 'celebrity_boxing_league'
  | 'cult_exposé_doc'
  | 'wildlife_rescue'
  | 'standup_special_event'
  | 'ghost_hunting_extreme'
  | 'undercover_boss_parody'
  | 'survival_dating'
  | 'crypto_scam_investigation'
  | 'celebrity_house_flip'
  | 'toddler_beauty_pageant_reunion'
  | 'doomsday_preppers_elite'
  | 'extreme_cooking'
  | 'dating_competition'
  | 'celebrity_survival_challenge'
  | 'poly_dating_drama'
  | 'billionaire_lifestyle'
  | 'startup_pitch_wars'
  | 'prank_show_escalation'
  | 'makeover_intervention_extreme'
  | 'hidden_treasure_race'
  | 'celebrity_ghost_hunting'
  | 'true_crime_live_investigation'
  | 'reality_courtroom'
  | 'extreme_cheap_travel_show'
  | 'sports_wives_drama'
  | 'tattoo_coverup_disasters'
  | 'influencer_boxing_league'
  | 'virtual_reality_dating'
  | 'extreme_job_swap'
  | 'celebrity_farm_survival'
  | 'niche_hobby_competition'
  | 'paranormal_renovation'
  | 'extreme_pet_makeover'
  | 'rich_kids_survival'
  | 'crypto_millionaire_matchmaker'
  | 'ai_dating_experiment'
  | 'zombie_survival_reality'
  | 'toddler_chef_competition'
  | 'underground_fight_club_doc'
  | 'space_tourism_reality'
  | 'extreme_couponing_wars'
  | 'extreme_makeover_cult'
  | 'crypto_scam_expose'
  | 'child_star_documentary'
    | 'billionaire_yacht_crew'
  | 'historical_reenactment_doc'
  | 'celebrity_cooking_disasters'
  | 'high_school_sports_doc'
  | 'extreme_body_mods'
  | 'polygraph_interrogation'
  | 'rich_pets_of_instagram'
  | 'survival_island_celebrity'
  | 'art_forgery_expose'
  | 'underground_racing_doc'
  | 'extreme_decluttering';

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
  parentProjectId?: string;
  isSpinoff?: boolean;
  isGlobalIcon?: boolean;
  razzieWinner?: boolean;
  franchiseId?: string;
  originalProjectId?: string; // Links to the vault asset it's rebooting/spinning off
  // Release simulation fields
  reviewScore?: number;
  boxOfficeRank?: number;
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
}

export interface ScriptedProject extends ProjectBase {
  scriptHeat: number; // 0-100: Influences evolution events
  activeRoles: CharacterArchetype[];
  scriptEvents: ScriptEvent[];
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
