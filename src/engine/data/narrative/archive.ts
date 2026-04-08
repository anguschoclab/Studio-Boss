import { z } from 'zod';

/**
 * The Bard Engine Archive Schema
 * Structured by Domain -> SubDomain -> Tier
 */

export const NarrativeTierSchema = z.array(z.string());

export const NarrativeSubDomainSchema = z.record(z.string(), NarrativeTierSchema);

export const NarrativeDomainSchema = z.record(z.string(), NarrativeSubDomainSchema);

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
  [key: string]: any;
}

/**
 * Metadata Mapper helper types
 */
export type NarrativeDomainKey = 'Review' | 'Greenlight' | 'Talent' | 'Industry' | 'Market' | 'Crisis' | 'Scandal' | 'Festival' | 'Trend';

export type NarrativeTone = 'Trade' | 'Tabloid' | 'Social' | 'Standard';

export interface ResolutionRequest {
  domain: NarrativeDomainKey;
  subDomain: string;
  intensity: number; // 0-100
  tone?: NarrativeTone;
  variant?: string; // Specific key in the SubDomain (e.g. for Options or specific story beats)
  context?: NarrativeContext;
}
