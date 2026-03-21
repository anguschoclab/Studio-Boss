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
    description: 'A powerhouse with deep pockets and industry clout. You start with massive capital but sky-high expectations. Talent expects major backend points, and agents will leverage this against you.',
    startingCash: 500_000_000,
    startingPrestige: 30,
  },
  'mid-tier': {
    key: 'mid-tier',
    name: 'Mid-Tier Studio',
    tagline: 'Ambition meets agility.',
    description: 'Nimble and ambitious. You have enough capital to take calculated risks, but cutthroat agencies might pass on your projects for bigger paydays.',
    startingCash: 150_000_000,
    startingPrestige: 50,
  },
  indie: {
    key: 'indie',
    name: 'Indie Studio',
    tagline: 'Art. Grit. Vision.',
    description: 'Boutique and artistic. Every dollar matters, but your creative credibility attracts auteur talent with unusual demands and quirks.',
    startingCash: 30_000_000,
    startingPrestige: 70,
  },
};
