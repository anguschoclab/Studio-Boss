import { pick } from '../utils';
import { BrandSystem } from './BrandSystem';
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
  const identity = BrandSystem.generateIdentity(existingSet);
  return BrandSystem.getStudioName(identity);
}

export function generateMotto(): string {
  return pick(MOTTOS);
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

export function generateDemographicName(gender: 'MALE' | 'FEMALE' | 'NON_BINARY', country: string, ethnicity: string): string {
  const region = REGIONAL_NAMES[country];
  
  if (region) {
    const first = gender === 'FEMALE' ? pick(region.firstF) : pick(region.firstM);
    return `${first} ${pick(region.last)}`;
  }

  // Fallback to western/US names
  const first = gender === 'FEMALE' ? pick(FEMALE_FIRST_NAMES) : pick(MALE_FIRST_NAMES);
  return `${first} ${pick(LAST_NAMES)}`;
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
