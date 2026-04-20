import { z } from 'zod';
import { RandomGenerator } from '../../utils/rng';

/**
 * The Bard Engine Archive Schema
 * Structured by Domain -> SubDomain -> Tier
 */

export const NarrativeTierSchema = z.array(z.string());

/**
 * Discriminated Unions for Domain-SubDomain synchronization
 */
export type NarrativeDomainKey = 
  | 'Review' 
  | 'Greenlight' 
  | 'Talent' 
  | 'Industry' 
  | 'Market' 
  | 'Crisis' 
  | 'Scandal' 
  | 'Festival' 
  | 'Trend' 
  | 'Project' 
  | 'Dictionary';

export type ReviewSubDomain = 'Standard' | 'Critic';
export type GreenlightSubDomain = 'Finance' | 'Talent' | 'MarketSat' | 'Marketing';
export type TalentSubDomain = 'Career' | 'Health' | 'Scandal';
export type IndustrySubDomain = 'Merger' | 'Rumor' | 'Scandal' | 'Award';
export type MarketSubDomain = 'Headline' | 'Event';
export type CrisisSubDomain = 'PR' | 'Production';
export type ProjectSubDomain = 'Title';
export type DictionarySubDomain = 'ADJECTIVE' | 'NOUN' | 'VERB' | 'PLACE' | 'STUDIO_SUFFIX' | 'FIRST_NAME_MALE' | 'FIRST_NAME_FEMALE';

export type SubDomainKey<D extends NarrativeDomainKey> = 
  D extends 'Review' ? ReviewSubDomain :
  D extends 'Greenlight' ? GreenlightSubDomain :
  D extends 'Talent' ? TalentSubDomain :
  D extends 'Industry' ? IndustrySubDomain :
  D extends 'Market' ? MarketSubDomain :
  D extends 'Crisis' ? CrisisSubDomain :
  D extends 'Project' ? ProjectSubDomain :
  D extends 'Dictionary' ? DictionarySubDomain :
  string;

// A subdomain can contain either flat tiers (string -> string[]) 
// or nested tones/variants (string -> string -> string[])
export const NarrativeSubDomainSchema = z.record(
  z.string(),
  z.union([
    NarrativeTierSchema,
    z.record(z.string(), NarrativeTierSchema),
    z.record(z.string(), z.record(z.string(), NarrativeTierSchema))
  ])
);

export const NarrativeDomainSchema = z.record(z.string(), z.union([NarrativeSubDomainSchema, NarrativeTierSchema]));

export const NarrativeArchiveSchema = z.record(z.string(), NarrativeDomainSchema);

export type NarrativeArchive = z.infer<typeof NarrativeArchiveSchema>;

export interface NarrativeContext {
  actor?: string;
  target?: string;
  project?: string;
  rival?: string;
  amount?: string | number;
  pct?: string | number;
  genre?: string;
  platform?: string;
  week?: number;
  message?: string;
  body?: string;
  count?: number;
  [key: string]: string | number | boolean | undefined;
}

export type NarrativeTone = 'Trade' | 'Tabloid' | 'Social' | 'Standard';

export interface ResolutionRequest<D extends NarrativeDomainKey = NarrativeDomainKey> {
  domain: D;
  subDomain: SubDomainKey<D>;
  intensity: number; // 0-100
  tone?: NarrativeTone;
  variant?: string;
  context?: NarrativeContext;
  rng?: RandomGenerator;
}
