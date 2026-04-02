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
export type TalentTier = 'A_LIST' | 'B_LIST' | 'C_LIST' | 'RISING_STAR' | 'NEWCOMER';

export type ScandalType = 'financial' | 'personal' | 'onset_behavior' | 'legal' | 'feud';

export interface Scandal {
  id: string;
  talentId: string;
  severity: number; // 0-100
  type: ScandalType;
  weeksRemaining: number;
}

export type AgencyArchetype = 'powerhouse' | 'boutique' | 'shark' | 'comedy_specialist' | 'lit_agency' | 'mega_corp' | 'streaming_titan' | 'indie_darling' | 'nepotism_mill' | 'international_broker' | 'legacy_defenders' | 'genre_kings' | 'influencer_syndicate';
export type AccessLevel = 'outsider' | 'soft-access' | 'legacy' | 'dynasty' | 'comeback';
export type ProjectRole = 'actor' | 'director' | 'writer' | 'producer' | 'showrunner';
export type TalentRole = 'actor' | 'director' | 'writer' | 'producer';
export type AgencyTier = 'powerhouse' | 'major' | 'mid-tier' | 'boutique' | 'specialist';
export type AgencyCulture = 'shark' | 'family' | 'volume' | 'prestige';
export type AgentSpecialty = 'film_packaging' | 'tv_packaging' | 'literary' | 'talent' | 'comedy' | 'unscripted';

export interface Agency {
  id: string;
  name: string;
  archetype: AgencyArchetype;
  tier: AgencyTier;
  culture: AgencyCulture;
  prestige: number;
  leverage: number; // 0-100
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
  agencyId?: string;
  agentId?: string;
  prestige: number;
  fee: number;
  draw: number;
  familyId?: string;
  accessLevel: AccessLevel;
  momentum: number; // 0-100
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
  
  // AI Motivations
  motivationProfile?: MotivationProfile;
  currentMotivation?: TalentMotivation;
  motivationImpulse?: 'CASH_OUT' | 'AWARDS_RUN' | 'REHAB' | 'VANITY' | 'NONE';
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

export interface FirstLookDeal {
  id: string;
  talentId: string;
  weeksRemaining: number;
  exclusivity: boolean;
}
