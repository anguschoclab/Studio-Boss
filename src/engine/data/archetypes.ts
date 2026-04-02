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
    description: 'Identity: The Powerhouse — Controls the biggest stars and demands complete package deals. They represent elite showrunners and will ruthlessly force unwanted co-stars onto your projects, mandate guaranteed trilogies, dictate release windows, demand overall deal commitments, or outright refuse to work with indie studios.'
  },
  boutique: {
    key: 'boutique',
    name: 'Boutique',
    description: 'Identity: The Boutique — Highly specialized but aggressively protective of their talent. They prioritize auteur directors and will unapologetically require final cut privileges, mandate analog film shoots, demand closed-set rehearsals, or bring in their own script doctors without your approval.'
  },
  shark: {
    key: 'shark',
    name: 'Shark',
    description: 'Identity: The Shark — The quintessential cutthroat Ten-Percenter. They will mercilessly demand massive backend points, aggressively poach talent from rivals, force the casting of nepo babies, sabotage rival projects, casually threaten media smear campaigns to get their way, and demand exclusive personal security details.'
  },
  comedy_specialist: {
    key: 'comedy_specialist',
    name: 'Comedy Specialist',
    description: 'Identity: The Comedy Specialist — A relentless agency exclusively representing comedy talent. They mandate high script punch-up fees, require their own stand-up openers, fiercely negotiate for massive backend points in streaming deals, and routinely refuse dramatic cross-over projects.'
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
,
  streaming_titan: {
    key: 'streaming_titan',
    name: 'Streaming Titan',
    description: 'Identity: The Streaming Titan — Specialized in packaging talent directly to major streaming platforms. They aggressively demand immediate upfront payments and massive backend points tied to algorithmic viewership metrics, and consistently require their clients to skip traditional theatrical windows.'
  },
  indie_darling: {
    key: 'indie_darling',
    name: 'Indie Darling',
    description: 'Identity: The Indie Darling — Highly influential among festival circuits and independent financiers. They refuse to let their clients participate in commercial franchises and constantly mandate analog shoots, auteur directors, and extended rehearsal schedules.'
  }
,
  nepotism_mill: {
    key: 'nepotism_mill',
    name: 'Nepotism Mill',
    description: 'Identity: The Nepotism Mill — Specialized in placing entirely unqualified offspring of Hollywood royalty into leading roles. They demand massive ego-stroking, completely unearned top billing, and aggressively suppress any reviews that point out their clients\' lack of talent.'
  },
  international_broker: {
    key: 'international_broker',
    name: 'International Broker',
    description: 'Identity: The International Broker — Bridges global markets. They fiercely negotiate for absurd cross-cultural pandering scenes, demand separate international press tours, and mandate that foreign box office grosses trigger massive backend escalators.'
  },
  legacy_defenders: {
    key: 'legacy_defenders',
    name: 'Legacy Defenders',
    description: 'Identity: The Legacy Defenders — Represents aging icons clinging to relevance. They demand outdated legacy salaries, enforce ridiculous onset perks like their own private chefs, and outright refuse projects that don\'t offer guaranteed theatrical releases and massive first-dollar gross.'
  },
  genre_kings: {
    key: 'genre_kings',
    name: 'Genre Kings',
    description: 'Identity: The Genre Kings — Unapologetic masters of horror, sci-fi, and action. They mandate high script punch-up fees for their own writers, demand significant backend escalators for international gross, and strictly prohibit their talent from doing prestigious dramatic roles.'
  },
  influencer_syndicate: {
    key: 'influencer_syndicate',
    name: 'Influencer Syndicate',
    description: 'Identity: The Influencer Syndicate — Represents the TikTok and YouTube elite. They aggressively demand immediate upfront payments, mandate daily social media integration into scripts, and force the casting of fellow influencers with zero acting ability into supporting roles.'
  }
};
