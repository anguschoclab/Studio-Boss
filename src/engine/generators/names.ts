import { pick } from '../utils';

const PREFIXES = [
  'Apex', 'Summit', 'Horizon', 'Pinnacle', 'Sterling', 'Monarch',
  'Titan', 'Obsidian', 'Crimson', 'Golden', 'Silver', 'Pacific',
  'Atlantic', 'Zenith', 'Vanguard', 'Eclipse', 'Meridian', 'Solaris',
];

const SUFFIXES = [
  'Pictures', 'Studios', 'Entertainment', 'Films', 'Media', 'Productions',
];

const MOTTOS = [
  'Where stories come alive',
  'Entertainment without limits',
  'The future of cinema',
  'Bold stories, bigger audiences',
  'Defining the culture',
  'Every frame matters',
  'Dream factory',
  'Stories that move the world',
];

export function generateStudioName(existing: string[]): string {
  let name: string;
  let attempts = 0;
  do {
    name = `${pick(PREFIXES)} ${pick(SUFFIXES)}`;
    attempts++;
  } while (existing.includes(name) && attempts < 50);
  return name;
}

export function generateMotto(): string {
  return pick(MOTTOS);
}
