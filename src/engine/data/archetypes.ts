import { ArchetypeKey } from '../types';

export interface ArchetypeData {
  key: ArchetypeKey;
  name: string;
  tagline: string;
  description: string;
  startingCash: number;
  startingPrestige: number;
}

export const ARCHETYPES: Record<ArchetypeKey, ArchetypeData> = {
  major: {
    key: 'major',
    name: 'Major Studio',
    tagline: 'Power. Scale. Expectation.',
    description: 'A powerhouse with deep pockets and industry clout. You start with massive capital but sky-high expectations. Welcome to the combative casting environment, where rival talent agencies constantly pit you against competitors, demanding massive backend points, top billing, guaranteed sequel clauses, and enforcing ridiculous talent quirks and perks.',
    startingCash: 500_000_000,
    startingPrestige: 30,
  },
  'mid-tier': {
    key: 'mid-tier',
    name: 'Mid-Tier Studio',
    tagline: 'Ambition meets agility.',
    description: 'Nimble and ambitious. You have enough capital to take calculated risks, but navigate carefully—ruthless agencies will attempt to poach your talent or pass on your projects to force a bigger payday or leverage streaming exclusivity.',
    startingCash: 150_000_000,
    startingPrestige: 50,
  },
  indie: {
    key: 'indie',
    name: 'Indie Studio',
    tagline: 'Art. Grit. Vision.',
    description: 'Boutique and artistic. Every dollar matters, but your creative credibility attracts auteur talent with intense demands, from daily rewrites and lighting crews to personal onset chefs. Expect friction as powerhouse and legacy talent agencies may refuse to work with you altogether.',
    startingCash: 30_000_000,
    startingPrestige: 70,
  },
};
