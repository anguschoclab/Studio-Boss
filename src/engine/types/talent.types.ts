// Types related to Talent, Agencies, and Scandals

export type DirectorArchetype = 'auteur' | 'journeyman' | 'visionary' | 'commercial_hack';

export type ScandalType = 'financial' | 'personal' | 'onset_behavior' | 'legal' | 'feud';

export interface Scandal {
  id: string;
  talentId: string;
  severity: number; // 0-100
  type: ScandalType;
  weeksRemaining: number;
}

export type AgencyArchetype = 'powerhouse' | 'boutique' | 'shark';
export type AccessLevel = 'outsider' | 'soft-access' | 'legacy' | 'dynasty' | 'comeback';
export type TalentRole = 'director' | 'actor' | 'writer' | 'producer' | 'showrunner';
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
  gender: 'male' | 'female';
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
  bio?: string;
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
  trivia?: string[];
  // Sprint J / L additions
  directorArchetype?: DirectorArchetype;
  fandomSize?: number; // 0-100 scale representing loyal fan base
  loyalty?: number; // 0-100 studio loyalty
  controversyRisk?: number; // Base chance of spawning scandals
  ego?: number; // 0-100 tracking their demands and attitude
  hasRazzie?: boolean;
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
