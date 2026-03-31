import { pick } from '../utils';
import { ProjectFormat } from '@/engine/types';
import { 
  PREFIXES, 
  SUFFIXES, 
  MOTTOS, 
  MALE_FIRST_NAMES, 
  FEMALE_FIRST_NAMES, 
  LAST_NAMES, 
  DICTIONARIES,
  PREFIX_PATTERNS,
  CONNECTORS,
  LOCATIONS
} from '../data/names.data';

export function generateStudioName(existing: string[]): string {
  const existingSet = new Set(existing);
  let name: string;
  let attempts = 0;
  do {
    name = `${pick(PREFIXES)} ${pick(SUFFIXES)}`;
    attempts++;
  } while (existingSet.has(name) && attempts < 50);
  return name;
}

export function generateMotto(): string {
  return pick(MOTTOS);
}

export function generateDemographicName(gender: 'MALE' | 'FEMALE' | 'NON_BINARY', country: string, ethnicity: string): string {
  // Simple mapping for now, can be expanded with geo-specific datasets
  if (gender === 'FEMALE') return `${pick(FEMALE_FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  return `${pick(MALE_FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export function generateProjectName(format: ProjectFormat, genre: string): string {
  const dict = DICTIONARIES[genre] || DICTIONARIES['Drama']; // Fallback to Drama

  if (format === 'tv') {
    const tvPatterns = [
      () => `${pick(dict.adjs)} ${pick(dict.nouns)}s`,
      () => `The ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)} ${pick(LOCATIONS)}`,
      () => `${pick(dict.nouns)} and ${pick(dict.nouns)}`,
      () => `${pick(LOCATIONS)} ${pick(dict.nouns)}s`,
      () => `Project: ${pick(dict.nouns)}`,
      () => `${pick(dict.adjs)}`,
    ];
    return pick(tvPatterns)();
  } else {
    // Film
    const filmPatterns = [
      () => `The ${pick(dict.adjs)} ${pick(dict.nouns)}`,
      () => `${pick(PREFIX_PATTERNS)} ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)} of ${pick(LOCATIONS)}`,
      () => `${pick(dict.adjs)} ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)} ${pick(CONNECTORS)} ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)}`,
      () => `The ${pick(dict.nouns)} ${pick(dict.nouns)}`,
    ];
    return pick(filmPatterns)();
  }
}
