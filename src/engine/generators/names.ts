import { BrandSystem } from './BrandSystem';
import { ProjectFormat } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { 
  MOTTOS, 
  MALE_FIRST_NAMES, 
  FEMALE_FIRST_NAMES, 
  LAST_NAMES, 
  DICTIONARIES,
  PREFIX_PATTERNS,
  CONNECTORS,
  LOCATIONS
} from '../data/names.data';

export function generateStudioName(existing: string[], rng: RandomGenerator): string {
  const existingSet = new Set(existing);
  const identity = BrandSystem.generateIdentity(existingSet, rng);
  return BrandSystem.getStudioName(identity, rng);
}

export function generateMotto(rng: RandomGenerator): string {
  return rng.pick(MOTTOS);
}

const REGIONAL_NAMES: Record<string, { firstM: string[], firstF: string[], last: string[] }> = {
  'USA': { firstM: MALE_FIRST_NAMES, firstF: FEMALE_FIRST_NAMES, last: LAST_NAMES },
  // Additional regions could be added here
};

export function generateDemographicName(gender: 'MALE' | 'FEMALE' | 'NON_BINARY', country: string, _ethnicity: string, rng: RandomGenerator): string {
  const region = REGIONAL_NAMES[country] || REGIONAL_NAMES['USA'];
  
  const firstPool = gender === 'FEMALE' ? region.firstF : region.firstM;
  const first = rng.pick(firstPool);
  const last = rng.pick(region.last);
  
  return `${first} ${last}`;
}

export function generateProjectName(format: ProjectFormat, genre: string, rng: RandomGenerator): string {
  const dict = DICTIONARIES[genre] || DICTIONARIES['Drama'];

  if (format === 'tv') {
    const tvPatterns = [
      () => `${rng.pick(dict.adjs)} ${rng.pick(dict.nouns)}s`,
      () => `The ${rng.pick(dict.nouns)}`,
      () => `${rng.pick(dict.nouns)} ${rng.pick(LOCATIONS)}`,
      () => `${rng.pick(dict.nouns)} and ${rng.pick(dict.nouns)}`,
      () => `${rng.pick(LOCATIONS)} ${rng.pick(dict.nouns)}s`,
      () => `Project: ${rng.pick(dict.nouns)}`,
      () => `${rng.pick(dict.adjs)}`,
    ];
    return rng.pick(tvPatterns)();
  } else {
    // Film
    const filmPatterns = [
      () => `The ${rng.pick(dict.adjs)} ${rng.pick(dict.nouns)}`,
      () => `${rng.pick(PREFIX_PATTERNS)} ${rng.pick(dict.nouns)}`,
      () => `${rng.pick(dict.nouns)} of ${rng.pick(LOCATIONS)}`,
      () => `${rng.pick(dict.adjs)} ${rng.pick(dict.nouns)}`,
      () => `${rng.pick(dict.nouns)} ${rng.pick(CONNECTORS)} ${rng.pick(dict.nouns)}`,
      () => `${rng.pick(dict.nouns)}`,
      () => `The ${rng.pick(dict.nouns)} ${rng.pick(dict.nouns)}`,
    ];
    return rng.pick(filmPatterns)();
  }
}
