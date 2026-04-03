import { pick } from '../utils';
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
  'Japan': {
    firstM: ['Hiroshi', 'Kenji', 'Takashi', 'Akira', 'Satoshi', 'Yuki', 'Kaito', 'Ren', 'Minato', 'Haruto'],
    firstF: ['Yui', 'Akari', 'Himari', 'Hana', 'Ichika', 'Sara', 'Mei', 'Aoi', 'Natsuki', 'Riko'],
    last: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato']
  },
  'South Korea': {
    firstM: ['Min-jun', 'Seo-jun', 'Ha-jun', 'Do-yun', 'Joo-won', 'Si-woo', 'Ji-ho', 'Ye-jun', 'Yu-jun', 'Ji-hun'],
    firstF: ['Seo-yun', 'Ha-yoon', 'Ji-u', 'Seo-hyeon', 'Ha-eun', 'Ji-a', 'Su-bin', 'Ji-won', 'So-yul', 'Ji-min'],
    last: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang', 'Lim']
  },
  'India': {
    firstM: ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Ishaan', 'Krishna', 'Aryan', 'Shaurya', 'Kabir'],
    firstF: ['Aadhya', 'Ananya', 'Diya', 'Ishani', 'Myra', 'Navya', 'Pari', 'Saanvi', 'Zoya', 'Kyra'],
    last: ['Patel', 'Sharma', 'Singh', 'Kumar', 'Das', 'Gupta', 'Mehta', 'Reddy', 'Khan', 'Iyer']
  },
  'Mexico': {
    firstM: ['Santiago', 'Mateo', 'Juan', 'Diego', 'Sebastian', 'Leonardo', 'Daniel', 'Luis', 'Angel', 'Jose'],
    firstF: ['Sofia', 'Isabella', 'Camila', 'Valentina', 'Mariana', 'Ximena', 'Victoria', 'Luciana', 'Daniela', 'Fernanda'],
    last: ['Hernandez', 'Garcia', 'Martinez', 'Lopez', 'Gonzalez', 'Rodriguez', 'Perez', 'Sanchez', 'Ramirez', 'Cruz']
  },
  'France': {
    firstM: ['Gabriel', 'Leo', 'Raphael', 'Arthur', 'Louis', 'Lucas', 'Adam', 'Maël', 'Jules', 'Hugo'],
    firstF: ['Jade', 'Louise', 'Emma', 'Alice', 'Ambre', 'Lina', 'Rose', 'Chloé', 'Mia', 'Léa'],
    last: ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent']
  }
};

export function generateDemographicName(gender: 'MALE' | 'FEMALE' | 'NON_BINARY', country: string, _ethnicity: string, rng?: RandomGenerator): string {
  const region = REGIONAL_NAMES[country];
  
  if (region) {
    const first = gender === 'FEMALE' ? (rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(region.firstF) : pick(region.firstF)) : (rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(region.firstM) : pick(region.firstM));
    return `${first} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(region.last) : pick(region.last)}`;
  }

  // Fallback to western/US names
  const first = gender === 'FEMALE' ? (rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(FEMALE_FIRST_NAMES) : pick(FEMALE_FIRST_NAMES)) : (rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(MALE_FIRST_NAMES) : pick(MALE_FIRST_NAMES));
  return `${first} ${rng ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(LAST_NAMES) : pick(LAST_NAMES)}`;
}

export function generateProjectName(format: ProjectFormat, genre: string, rng?: RandomGenerator): string {
  const dict = DICTIONARIES[genre] || DICTIONARIES['Drama']; // Fallback to Drama

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
