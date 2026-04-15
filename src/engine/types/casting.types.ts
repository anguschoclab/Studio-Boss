// Casting Constraint System Types
// Handles nudity, stunts, intimacy, and other script requirements

export type ComfortLevelNudity = 'none' | 'tasteful' | 'partial' | 'full';
export type ComfortLevelStunts = 'none' | 'minor' | 'moderate' | 'extreme';
export type ComfortLevelIntimacy = 'none' | 'tasteful' | 'passionate';
export type ComfortLevelRisk = 'conservative' | 'moderate' | 'adventurous';

export interface TalentComfortLevel {
  nudity: ComfortLevelNudity;
  stunts: ComfortLevelStunts;
  intimacy: ComfortLevelIntimacy;
  risk: ComfortLevelRisk;
}

export interface ComfortPremiumRates {
  nudityMultiplier: number; // 1.0 - 3.0
  stuntMultiplier: number;    // 1.0 - 2.5
  intimacyMultiplier: number; // 1.0 - 2.0
}

export type ScriptRequirementType = 'nudity' | 'stunts' | 'intimacy' | 'physical_risk' | 'emotionally_intense';
export type ScriptRequirementLevel = 'mild' | 'moderate' | 'extreme';

export interface ScriptRequirement {
  id: string;
  projectId: string;
  type: ScriptRequirementType;
  level: ScriptRequirementLevel;
  description: string;
  requiredTalentIds: string[]; // Which roles need this
  premiumBonus: number; // Base additional fee
  screenplayNoteId?: string; // Linked to note if applicable
}

export interface CastingConstraintCheck {
  talentId: string;
  requirement: ScriptRequirement;
  willing: boolean;
  requiresPremium: boolean;
  requestedPremium: number;
  refusalReason?: string;
  alternativeTalentIds: string[]; // Suggested replacements
}

export interface CastingConstraintViolation {
  id: string;
  week: number;
  projectId: string;
  talentId: string;
  requirement: ScriptRequirement;
  severity: 'minor' | 'major' | 'dealbreaker';
  options: CastingConstraintOption[];
}

export interface CastingConstraintOption {
  id: string;
  label: string;
  description: string;
  cashCost?: number;
  prestigeCost?: number;
  weeksDelay?: number;
  replaceTalentId?: string;
  removeRequirement?: boolean;
}

// For storage in state
export interface CastingConstraintsState {
  activeRequirements: Record<string, ScriptRequirement>;
  violations: Record<string, CastingConstraintViolation>;
  resolvedChecks: Record<string, CastingConstraintCheck>;
}

// Requirement level to comfort level mapping
export const REQUIREMENT_COMFORT_MAPPING: Record<ScriptRequirementLevel, string[]> = {
  'mild': ['tasteful', 'partial', 'full'],
  'moderate': ['partial', 'full'],
  'extreme': ['full'],
};

// Premium multipliers by comfort level (separate maps for each type to avoid duplicates)
export const NUDITY_PREMIUM_RATES: Record<ComfortLevelNudity, number> = {
  'none': 3.0,      // Won't do it - massive premium if convinced
  'tasteful': 1.5,  // Some discomfort
  'partial': 1.2,   // Moderate comfort
  'full': 1.0,      // Fully comfortable - no premium
};

export const STUNT_PREMIUM_RATES: Record<ComfortLevelStunts, number> = {
  'none': 2.0,
  'minor': 1.2,
  'moderate': 1.5,
  'extreme': 2.5,
};

export const INTIMACY_PREMIUM_RATES: Record<ComfortLevelIntimacy, number> = {
  'none': 2.5,
  'tasteful': 1.3,
  'passionate': 1.8,
};

export const RISK_PREMIUM_RATES: Record<ComfortLevelRisk, number> = {
  'conservative': 2.0,
  'moderate': 1.3,
  'adventurous': 1.0,
};
