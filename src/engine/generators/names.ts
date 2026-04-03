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

import { rng } from '../utils';
export function generateStudioName(existing: string[], rng?: RandomGenerator): string {
  const existingSet = new Set(existing);
  const identity = BrandSystem.generateIdentity(existingSet, rng);
  return BrandSystem.getStudioName(identity, rng);
}

export function generateMotto(rng?: RandomGenerator): string {
  return rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(MOTTOS) : pick(MOTTOS);
}

const REGIONAL_NAMES: Record<string, { firstM: string[], firstF: string[], last: string[] }> = {
  // ... (data remains same)
};

export function generateDemographicName(gender: 'MALE' | 'FEMALE' | 'NON_BINARY', country: string, _ethnicity: string, rng: RandomGenerator): string {
  const region = REGIONAL_NAMES[country];
  
  if (region) {
    const first = gender === 'FEMALE' ? (rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(region.firstF) : pick(region.firstF)) : (rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(region.firstM) : pick(region.firstM));
    return `${first} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(region.last) : pick(region.last)}`;
  }

  // Fallback to western/US names
  const first = gender === 'FEMALE' ? (rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(FEMALE_FIRST_NAMES) : pick(FEMALE_FIRST_NAMES)) : (rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(MALE_FIRST_NAMES) : pick(MALE_FIRST_NAMES));
  return `${first} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(LAST_NAMES) : pick(LAST_NAMES)}`;
}

export function generateProjectName(format: ProjectFormat, genre: string, rng: RandomGenerator): string {
  const dict = DICTIONARIES[genre] || DICTIONARIES['Drama'];

  if (format === 'tv') {
    const tvPatterns = [
      () => `${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.adjs) : pick(dict.adjs)} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)}s`,
      () => `The ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)}`,
      () => `${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(LOCATIONS) : pick(LOCATIONS)}`,
      () => `${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)} and ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)}`,
      () => `${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(LOCATIONS) : pick(LOCATIONS)} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)}s`,
      () => `Project: ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)}`,
      () => `${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.adjs) : pick(dict.adjs)}`,
    ];
    return rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(tvPatterns)() : pick(tvPatterns)();
  } else {
    // Film
    const filmPatterns = [
      () => `The ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.adjs) : pick(dict.adjs)} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)}`,
      () => `${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(PREFIX_PATTERNS) : pick(PREFIX_PATTERNS)} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)}`,
      () => `${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)} of ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(LOCATIONS) : pick(LOCATIONS)}`,
      () => `${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.adjs) : pick(dict.adjs)} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)}`,
      () => `${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(CONNECTORS) : pick(CONNECTORS)} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)}`,
      () => `${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)}`,
      () => `The ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(dict.nouns) : pick(dict.nouns)}`,
    ];
    return rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(filmPatterns)() : pick(filmPatterns)();
  }
}
