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
    description: 'A powerhouse with deep pockets and industry clout. You start with massive capital but sky-high expectations. Welcome to the combative casting environment, where rival talent agencies like Apex Predators and Viper Management constantly pit you against competitors, demanding massive backend points, multi-picture deals, and cross-promotional tie-ins while enforcing ridiculous talent quirks like mandating an astrologer on set.',
    startingCash: 500_000_000,
    startingPrestige: 30,
  },
  'mid-tier': {
    key: 'mid-tier',
    name: 'Mid-Tier Studio',
    tagline: 'Ambition meets agility.',
    description: 'Nimble and ambitious. You have enough capital to take calculated risks, but navigate carefully—ruthless Ten-Percenter agencies will attempt to poach your talent, threaten media smear campaigns, or pass on your projects to force a bigger payday or leverage streaming exclusivity, while their talent refuses to speak directly to your directors.',
    startingCash: 150_000_000,
    startingPrestige: 50,
  },
  indie: {
    key: 'indie',
    name: 'Indie Studio',
    tagline: 'Art. Grit. Vision.',
    description: 'Boutique and artistic. Every dollar matters, but your creative credibility attracts auteur talent with intense combative demands, from demanding closed-set rehearsals to mandating analog film shoots. Expect massive friction as powerhouse talent agencies may refuse to work with you altogether, forcing you to navigate the ruthless demands of smaller, cutthroat agencies.',
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
    description: 'Identity: The Powerhouse — Controls the biggest stars and demands complete package deals. They represent elite showrunners and will ruthlessly force unwanted co-stars onto your projects, mandate specific release windows, require overall deal commitments, or outright refuse to work with indie studios.'
  },
  boutique: {
    key: 'boutique',
    name: 'Boutique',
    description: 'Identity: The Boutique — Highly specialized but aggressively protective of their talent. They prioritize auteur directors and will unapologetically require final cut privileges, mandate analog film shoots, demand closed-set rehearsals, or bring in their own script doctors without your approval.'
  },
  shark: {
    key: 'shark',
    name: 'Shark',
    description: 'Identity: The Shark — The quintessential cutthroat Ten-Percenter. They will mercilessly demand massive backend points, aggressively poach talent from rivals, force the casting of nepo babies, sabotage rival projects, and casually threaten media smear campaigns to get their way.'
  },
  comedy_specialist: {
    key: 'comedy_specialist',
    name: 'Comedy Specialist',
    description: 'Identity: The Comedy Specialist — A relentless agency exclusively representing comedy talent. They mandate high script punch-up fees, require their own stand-up openers, and fiercely negotiate for massive backend points in streaming deals.'
  },
  lit_agency: {
    key: 'lit_agency',
    name: 'Literary Agency',
    description: 'Identity: The Literary Agency — Represents the most coveted writers in town. They force package deals with unproven directors they want to break, demand aggressive credit arbitration, and require complete creative control over scripts.'
  },
  mega_corp: {
    key: 'mega_corp',
    name: 'Mega-Corp',
    description: 'Identity: The Mega-Corp — A sprawling conglomerate agency. They mandate absurd crossover cameos, force cross-promotional brand integrations into your films, and leverage media empires to guarantee award campaigns.'
  }
};
