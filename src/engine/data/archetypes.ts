import { ArchetypeKey, AgencyArchetype } from '@/engine/types';
import { BudgetTierKey, ProjectFormat } from '@/engine/types/project.types';

export type RivalArchetype =
  | 'legacy_major'       // Disney/WB — franchise-first, defensive IP hoard
  | 'streaming_giant'    // Netflix/Apple — volume + algorithm, global reach
  | 'prestige_house'     // A24/Searchlight — awards-first, auteur-friendly
  | 'genre_specialist'   // Blumhouse/Lionsgate — horror/action, low budget high ROI
  | 'franchise_factory'  // MCU-adjacent — sequel machine, merchandising
  | 'indie_aggressor'    // Annapurna-style — poaches prestige talent
  | 'content_farm'       // low-budget volume — Hallmark/Asylum
  | 'foreign_invader'    // international major entering US market
  | 'talent_agency_arm'  // CAA/WME acquiring studio arm
  | 'tech_disruptor';    // Amazon/Apple — uses cash to destabilize

export interface RivalBehaviorConfig {
  archetype: RivalArchetype;
  greenlight_bias: ProjectFormat[];
  budget_tier_weights: Record<BudgetTierKey, number>;
  pact_aggression: number;      // 0-1: probability of poaching in any given week
  ma_willingness: number;       // 0-1: willingness to attempt acquisition
  festivalParticipation: number; // 0-1: weight for festival submissions
  preferredGenres: string[];
}

export const RIVAL_BEHAVIOR_CONFIGS: Record<RivalArchetype, RivalBehaviorConfig> = {
  legacy_major: {
    archetype: 'legacy_major',
    greenlight_bias: ['film'],
    budget_tier_weights: { low: 0.05, mid: 0.20, high: 0.40, blockbuster: 0.35 },
    pact_aggression: 0.3,
    ma_willingness: 0.6,
    festivalParticipation: 0.2,
    preferredGenres: ['Action', 'Family', 'Animation', 'Fantasy'],
  },
  streaming_giant: {
    archetype: 'streaming_giant',
    greenlight_bias: ['film', 'tv'],
    budget_tier_weights: { low: 0.15, mid: 0.35, high: 0.35, blockbuster: 0.15 },
    pact_aggression: 0.5,
    ma_willingness: 0.4,
    festivalParticipation: 0.5,
    preferredGenres: ['Drama', 'Thriller', 'Comedy', 'Documentary'],
  },
  prestige_house: {
    archetype: 'prestige_house',
    greenlight_bias: ['film'],
    budget_tier_weights: { low: 0.30, mid: 0.45, high: 0.20, blockbuster: 0.05 },
    pact_aggression: 0.4,
    ma_willingness: 0.2,
    festivalParticipation: 0.9,
    preferredGenres: ['Drama', 'Horror', 'Romance', 'Animation'],
  },
  genre_specialist: {
    archetype: 'genre_specialist',
    greenlight_bias: ['film'],
    budget_tier_weights: { low: 0.40, mid: 0.40, high: 0.15, blockbuster: 0.05 },
    pact_aggression: 0.2,
    ma_willingness: 0.2,
    festivalParticipation: 0.3,
    preferredGenres: ['Horror', 'Action', 'Thriller', 'Sci-Fi'],
  },
  franchise_factory: {
    archetype: 'franchise_factory',
    greenlight_bias: ['film'],
    budget_tier_weights: { low: 0.02, mid: 0.10, high: 0.40, blockbuster: 0.48 },
    pact_aggression: 0.5,
    ma_willingness: 0.7,
    festivalParticipation: 0.1,
    preferredGenres: ['Action', 'Sci-Fi', 'Fantasy', 'Superhero'],
  },
  indie_aggressor: {
    archetype: 'indie_aggressor',
    greenlight_bias: ['film'],
    budget_tier_weights: { low: 0.25, mid: 0.50, high: 0.20, blockbuster: 0.05 },
    pact_aggression: 0.6,
    ma_willingness: 0.3,
    festivalParticipation: 0.8,
    preferredGenres: ['Drama', 'Romance', 'Comedy', 'Documentary'],
  },
  content_farm: {
    archetype: 'content_farm',
    greenlight_bias: ['film', 'tv', 'unscripted'],
    budget_tier_weights: { low: 0.70, mid: 0.25, high: 0.05, blockbuster: 0.00 },
    pact_aggression: 0.05,
    ma_willingness: 0.1,
    festivalParticipation: 0.05,
    preferredGenres: ['Comedy', 'Holiday', 'Romance', 'Family'],
  },
  foreign_invader: {
    archetype: 'foreign_invader',
    greenlight_bias: ['film', 'tv'],
    budget_tier_weights: { low: 0.10, mid: 0.30, high: 0.40, blockbuster: 0.20 },
    pact_aggression: 0.4,
    ma_willingness: 0.5,
    festivalParticipation: 0.4,
    preferredGenres: ['Action', 'Drama', 'Thriller'],
  },
  talent_agency_arm: {
    archetype: 'talent_agency_arm',
    greenlight_bias: ['film', 'tv'],
    budget_tier_weights: { low: 0.05, mid: 0.25, high: 0.45, blockbuster: 0.25 },
    pact_aggression: 0.8,
    ma_willingness: 0.4,
    festivalParticipation: 0.3,
    preferredGenres: ['Drama', 'Thriller', 'Comedy'],
  },
  tech_disruptor: {
    archetype: 'tech_disruptor',
    greenlight_bias: ['film', 'tv'],
    budget_tier_weights: { low: 0.10, mid: 0.20, high: 0.40, blockbuster: 0.30 },
    pact_aggression: 0.6,
    ma_willingness: 0.9,
    festivalParticipation: 0.4,
    preferredGenres: ['Sci-Fi', 'Thriller', 'Drama', 'Documentary'],
  },
};

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
