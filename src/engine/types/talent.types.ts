// Types related to Talent, Agencies, and Scandals

export interface MotivationProfile {
  financial: number; // 0-100, prioritizing profit/cash
  prestige: number;  // 0-100, prioritizing awards/critics
  legacy: number;    // 0-100, prioritizing long-term IP/history (talent only: artistry)
  aggression: number; // 0-100, likelihood of hostile moves
}

export type TalentMotivation = 'FAME_SEEKER' | 'PRESTIGE_HUNTER' | 'MONEY_GRABBER' | 'REHAB_ARC' | 'CREATIVE_FREEDOM' | 'NONE';
export type AgencyMotivation = 'THE_PACKAGER' | 'THE_CLIMBER' | 'THE_PROTECTOR' | 'THE_SHARK' | 'VOLUME_RETAIL';
export type RivalStrategy = 'blockbuster_focused' | 'prestige_chaser' | 'genre_specialist' | 'acquirer' | 'poacher' | 'balanced';

export type DirectorArchetype = 'auteur' | 'journeyman' | 'visionary' | 'commercial_hack';

// Role-specific archetypes for talent
export type ActorArchetype = 'movie_star' | 'tv_star' | 'character_actor' | 'action_hero' | 'comedy_star' | 'prestige_actor' | 'indie_darling' | 'viral_sensation' | 'kid_actor' | 'young_adult' | 'veteran';
export type WriterArchetype = 'showrunner' | 'screenwriter' | 'script_doctor' | 'novelist' | 'comedy_writer' | 'genre_specialist' | 'prestige_writer';
export type ProducerArchetype = 'blockbuster_producer' | 'indie_producer' | 'studio_exec' | 'packager' | 'line_producer' | 'creative_producer';
export type PersonalityArchetype = 'influencer' | 'reality_star' | 'talk_show_host' | 'news_anchor' | 'viral_creator' | 'legacy_personality';

// Universal personality traits applicable to all talents
export type TalentPersonality = 'perfectionist' | 'collaborative' | 'difficult' | 'charismatic' | 'method' | 'pragmatic' | 'artistic' | 'commercial' | 'loyal' | 'ambitious';

// Career trajectory for talent lifecycle
export type CareerTrajectory = 'rising' | 'peak' | 'declining' | 'resurgent';

export type TalentTier = 1 | 2 | 3 | 4;

export type ScandalType = 'financial' | 'personal' | 'onset_behavior' | 'legal' | 'feud'
  | 'rating_controversy' | 'director_speaks_out' | 'foreign_market_cut' | 'banned_in_market';

export type DeathType =
  | 'natural'           // Age-related
  | 'accident'          // On-set accident or general accident
  | 'overdose'          // Substance-related
  | 'suicide'           // Mental health
  | 'violence'          // Crime/murder
  | 'illness';          // Disease during filming

export interface DeathEvent {
  id: string;
  talentId: string;
  week: number;
  type: DeathType;
  cause: string;
  location: string;
  isPublic: boolean;
  impactsProduction: boolean;
  griefLevel: number; // 0-100, affects co-stars
  isDuringProduction: boolean;
  projectId?: string; // If died during production
}

export interface Scandal {
  id: string;
  talentId: string;
  severity: number; // 0-100
  type: ScandalType;
  weeksRemaining: number;
}

export type AgencyArchetype = 'powerhouse' | 'boutique' | 'shark' | 'comedy_specialist' | 'lit_agency' | 'mega_corp' | 'streaming_titan' | 'indie_darling' | 'nepotism_mill' | 'international_broker' | 'legacy_defenders' | 'genre_kings' | 'influencer_syndicate' | 'talent_agency_arm';
export type AccessLevel = 'outsider' | 'soft-access' | 'legacy' | 'dynasty' | 'comeback';
export type ProjectRole = 'actor' | 'director' | 'writer' | 'producer' | 'showrunner' | 'personality';
export type TalentRole = 'actor' | 'director' | 'writer' | 'producer' | 'personality' | 'showrunner';
export type AgencyTier = 'powerhouse' | 'major' | 'mid-tier' | 'boutique' | 'specialist';
export type AgencyCulture = 'shark' | 'family' | 'volume' | 'prestige';
export type AgentSpecialty = 'film_packaging' | 'tv_packaging' | 'literary' | 'talent' | 'comedy' | 'unscripted';

export interface TalentCommitment {
  projectId: string;
  projectTitle: string;
  startWeek: number;
  endWeek: number;
  role: TalentRole;
  format: 'feature' | 'series' | 'unscripted' | 'animation';
  isHoldingDeal?: boolean;
  isShowrunner?: boolean;
}

export type TalentPactType = 'first_look' | 'vanity_shingle' | 'overall_deal';

export interface TalentPact {
  id?: string;
  talentId: string;
  studioId: string;
  type: TalentPactType;
  startDate: number;
  endDate: number;
  expiryWeek?: number; // Phase 2: Explicit tracking
  weeklyOverhead: number;
  upfrontCost?: number; // Phase 2: Signing bonus
  exclusivity: boolean;
  status: 'active' | 'expired' | 'terminated';
  spinoffCooldownWeek?: number; // week when next spinoff commission is allowed (overall_deal only)
}

export interface Agency {
  id: string;
  name: string;
  archetype: AgencyArchetype;
  tier: AgencyTier;
  culture: AgencyCulture;
  prestige: number;
  leverage: number; // 0-100
  marketSensitivity: number; // 0-1.0 (How much market cycles affect their demands)
  globalReach: number; // 0-100 (Influences foreign box office & distribution)
  traits?: string[];
  motivationProfile?: MotivationProfile;
  currentMotivation?: AgencyMotivation;
}

export interface Agent {
  id: string;
  name: string;
  agencyId?: string;
  specialty: AgentSpecialty;
  prestige: number;
  leverage: number;
  negotiationTactic: 'SHARK' | 'DIPLOMAT' | 'VOLUME' | 'PRESTIGE';
  personality?: import('../systems/talent/talentAgentInteractions').AgentPersonality;
  skill?: number;
  aggression?: number;
  motivationProfile?: MotivationProfile;
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
  motivationProfile?: MotivationProfile;
}

export interface TalentDemographics {
  age: number;
  gender: 'MALE' | 'FEMALE' | 'NON_BINARY';
  ethnicity: string;
  country: string;
}

export interface TalentPsychology {
  ego: number;         // 1-100
  mood: number;        // 1-100
  scandalRisk: number; // 1-100
  synergyAffinities: string[]; // Talent IDs
  synergyConflicts: string[];  // Talent IDs
}

export interface Talent {
  id: string;
  name: string;
  role: string; // Primary role
  roles: TalentRole[]; // All roles
  tier: TalentTier;
  contractId?: string; // ID of active TalentPact
  agencyId?: string;
  agentId?: string;
  prestige: number;
  fee: number;
  draw: number;
  familyId?: string;
  accessLevel: AccessLevel;
  momentum: number; // 0-100
  skills: {
    acting: number;
    directing: number;
    writing: number;
    stardom: number;
  };
  perks?: string[];
  bio?: string;
  demographics: TalentDemographics;
  psychology: TalentPsychology;
  
  filmography?: {
    title: string;
    year: number;
    role: string;
    gross: number;
    salary: number;
    type: 'movie' | 'tv';
  }[];
  careerGross?: number;
  highestSalary?: {
    amount: number;
    project: string;
    type: 'movie' | 'tv';
  };
  hasRazzie?: boolean;
  razzieWinner?: boolean; // 🌌 PHASE 2: Added for high-fidelity career tracking.
  
  // SBDB & Career Tracking
  knownFor?: string[]; // Top 3 Project IDs
  starMeter?: number; // 0-100 derived metric
  showrunningExperience?: number; // 0-100 (Writers only)
  unscriptedExperience?: number; // 0-100 (Transition potential)
  
  // Advanced Relational Data
  highestSalaryMovie?: {
    amount: number;
    project: string;
    year: number;
  };
  highestSalaryTv?: {
    amount: number;
    project: string; // Per episode or total
    year: number;
  };
  trivia?: string[];
  
  // Director-specific
  directorArchetype?: DirectorArchetype;

  // Role-specific archetypes
  actorArchetype?: ActorArchetype;
  writerArchetype?: WriterArchetype;
  producerArchetype?: ProducerArchetype;
  personalityArchetype?: PersonalityArchetype;

  // Universal personality trait
  personality?: TalentPersonality;

  // Career trajectory
  careerTrajectory?: CareerTrajectory;

  // AI Motivations
  motivationProfile?: MotivationProfile;
  currentMotivation?: TalentMotivation;
  motivationImpulse?: 'CASH_OUT' | 'AWARDS_RUN' | 'REHAB' | 'VANITY' | 'NONE';

  // Phase 2 Expansion: Commitments & Fatigue
  commitments: TalentCommitment[];
  fatigue: number; // 0-100: Influences performance and conflict chance
  preferredGenres: string[];
  lastReleaseWeek?: number; // Last week a release happened (for prestige decay)
  onMedicalLeave?: boolean;
  medicalLeaveEndsWeek?: number;

  // Dynasty System: Family relationships
  parentIds?: string[]; // IDs of parent talents (nepo baby lineage)
  childIds?: string[]; // IDs of children in talent pool
  isNepoBaby?: boolean; // True if has at least one parent in industry
  spouseId?: string; // Current spouse/partner
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
  // Phase 2: Dynamic Scheduling
  role: TalentRole;
  // Unified Storage: Owner tracking
  ownerId: string; // 'player' or rival studio ID
}
