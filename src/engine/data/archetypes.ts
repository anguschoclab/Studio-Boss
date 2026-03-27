import { ArchetypeKey, AgencyArchetype } from '@/engine/types';

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
    description: 'A powerhouse with deep pockets and industry clout. You start with massive capital but sky-high expectations. Welcome to the combative casting environment, where rival talent agencies like Apex Predators and Viper Management constantly pit you against competitors, demanding massive backend points, top billing, guaranteed sequel clauses, and enforcing ridiculous talent quirks and perks.',
    startingCash: 500_000_000,
    startingPrestige: 30,
  },
  'mid-tier': {
    key: 'mid-tier',
    name: 'Mid-Tier Studio',
    tagline: 'Ambition meets agility.',
    description: 'Nimble and ambitious. You have enough capital to take calculated risks, but navigate carefully—ruthless Ten-Percenter agencies will attempt to poach your talent, threaten media smear campaigns, or pass on your projects to force a bigger payday or leverage streaming exclusivity.',
    startingCash: 150_000_000,
    startingPrestige: 50,
  },
  indie: {
    key: 'indie',
    name: 'Indie Studio',
    tagline: 'Art. Grit. Vision.',
    description: 'Boutique and artistic. Every dollar matters, but your creative credibility attracts auteur talent with intense combative demands, from refusing chemistry reads to threatening to walk over minor slights. Expect massive friction as powerhouse talent agencies may refuse to work with you altogether.',
    startingCash: 30_000_000,
    startingPrestige: 70,
  },
};


export interface AgencyArchetypeData {
  key: AgencyArchetype;
  name: string;
  description: string;
}

export const AGENCY_ARCHETYPES: Record<AgencyArchetype, AgencyArchetypeData> = {
  powerhouse: {
    key: 'powerhouse',
    name: 'Powerhouse',
    description: 'Identity: The Powerhouse — Controls the biggest stars and demands complete package deals. They represent elite showrunners and will ruthlessly force unwanted co-stars onto your projects or outright refuse to work with indie studios.'
  },
  boutique: {
    key: 'boutique',
    name: 'Boutique',
    description: 'Identity: The Boutique — Highly specialized but aggressively protective of their talent. They prioritize auteur directors and will unapologetically require final cut privileges or bring in their own script doctors without your approval.'
  },
  shark: {
    key: 'shark',
    name: 'Shark',
    description: 'Identity: The Shark — The quintessential cutthroat Ten-Percenter. They will mercilessly demand massive backend points, aggressively poach talent from rivals, and casually threaten media smear campaigns to get their way.'
  }
};
