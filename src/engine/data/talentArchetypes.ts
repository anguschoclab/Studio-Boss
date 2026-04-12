import { ActorArchetype, WriterArchetype, ProducerArchetype, PersonalityArchetype, TalentPersonality, TalentTier } from '../types/talent.types';

/**
 * Archetype configuration interface
 */
export interface ArchetypeConfig {
  id: string;
  key: string;
  name: string;
  description: string;
  tierBias: TalentTier[]; // Which tiers are more likely to have this archetype
  projectPreferences: {
    formats: ('film' | 'tv' | 'streaming' | 'unscripted')[];
    budgetTiers: ('indie' | 'low' | 'mid' | 'high' | 'blockbuster')[];
    genres: string[];
  };
  negotiationBehavior: {
    feeModifier: number; // 0.5-2.0 multiplier on base fee
    demandCreativeControl: boolean;
    demandPackageDeal: boolean;
    aggressiveness: number; // 0-100
  };
  collaborationStyle: {
    teamworkBonus: number; // -20 to +20
    conflictRisk: number; // 0-100
    adaptability: number; // 0-100
  };
  performanceModifier: number; // 0.5-1.5 multiplier on project quality
  crisisSusceptibility: number; // 0-100
  careerTrajectory: CareerTrajectory;
}

/**
 * Career trajectory type
 */
export type CareerTrajectory = 'rising' | 'peak' | 'declining' | 'resurgent';

/**
 * Actor Archetypes
 */
export const ACTOR_ARCHETYPES: Record<ActorArchetype, ArchetypeConfig> = {
  movie_star: {
    id: 'ARC-ACTOR-001',
    key: 'movie_star',
    name: 'Movie Star',
    description: 'Big-screen actors who prefer films over TV, command high fees, and have strong brand recognition.',
    tierBias: [1, 2],
    projectPreferences: {
      formats: ['film'],
      budgetTiers: ['high', 'blockbuster'],
      genres: ['Action', 'Drama', 'Sci-Fi', 'Thriller']
    },
    negotiationBehavior: {
      feeModifier: 1.5,
      demandCreativeControl: true,
      demandPackageDeal: false,
      aggressiveness: 75
    },
    collaborationStyle: {
      teamworkBonus: -10,
      conflictRisk: 40,
      adaptability: 50
    },
    performanceModifier: 1.2,
    crisisSusceptibility: 30,
    careerTrajectory: 'peak'
  },
  tv_star: {
    id: 'ARC-ACTOR-002',
    key: 'tv_star',
    name: 'TV Star',
    description: 'Television actors who prefer series work, may transition to films for prestige.',
    tierBias: [2, 3],
    projectPreferences: {
      formats: ['tv', 'streaming'],
      budgetTiers: ['mid', 'high'],
      genres: ['Drama', 'Comedy', 'Thriller', 'Romance']
    },
    negotiationBehavior: {
      feeModifier: 1.2,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 50
    },
    collaborationStyle: {
      teamworkBonus: 10,
      conflictRisk: 25,
      adaptability: 70
    },
    performanceModifier: 1.1,
    crisisSusceptibility: 25,
    careerTrajectory: 'rising'
  },
  character_actor: {
    id: 'ARC-ACTOR-003',
    key: 'character_actor',
    name: 'Character Actor',
    description: 'Versatile actors known for playing diverse roles, often in supporting but memorable parts.',
    tierBias: [2, 3, 4],
    projectPreferences: {
      formats: ['film', 'tv'],
      budgetTiers: ['indie', 'low', 'mid'],
      genres: ['Drama', 'Comedy', 'Horror', 'Romance']
    },
    negotiationBehavior: {
      feeModifier: 1.0,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 30
    },
    collaborationStyle: {
      teamworkBonus: 20,
      conflictRisk: 15,
      adaptability: 80
    },
    performanceModifier: 1.15,
    crisisSusceptibility: 20,
    careerTrajectory: 'peak'
  },
  action_hero: {
    id: 'ARC-ACTOR-004',
    key: 'action_hero',
    name: 'Action Hero',
    description: 'Physical performers specializing in action films, often in franchise roles.',
    tierBias: [1, 2],
    projectPreferences: {
      formats: ['film'],
      budgetTiers: ['high', 'blockbuster'],
      genres: ['Action', 'Sci-Fi', 'Thriller', 'Adventure']
    },
    negotiationBehavior: {
      feeModifier: 1.4,
      demandCreativeControl: false,
      demandPackageDeal: true,
      aggressiveness: 60
    },
    collaborationStyle: {
      teamworkBonus: 0,
      conflictRisk: 30,
      adaptability: 60
    },
    performanceModifier: 1.1,
    crisisSusceptibility: 45,
    careerTrajectory: 'peak'
  },
  comedy_star: {
    id: 'ARC-ACTOR-005',
    key: 'comedy_star',
    name: 'Comedy Star',
    description: 'Comedic actors who excel in comedies and romantic comedies.',
    tierBias: [2, 3],
    projectPreferences: {
      formats: ['film', 'tv'],
      budgetTiers: ['low', 'mid', 'high'],
      genres: ['Comedy', 'Romance', 'Family']
    },
    negotiationBehavior: {
      feeModifier: 1.1,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 40
    },
    collaborationStyle: {
      teamworkBonus: 15,
      conflictRisk: 20,
      adaptability: 75
    },
    performanceModifier: 1.1,
    crisisSusceptibility: 20,
    careerTrajectory: 'rising'
  },
  prestige_actor: {
    id: 'ARC-ACTOR-006',
    key: 'prestige_actor',
    name: 'Prestige Actor',
    description: 'Critically acclaimed actors who prioritize artistic projects over commercial success.',
    tierBias: [1, 2],
    projectPreferences: {
      formats: ['film'],
      budgetTiers: ['indie', 'mid', 'high'],
      genres: ['Drama', 'Horror', 'Romance', 'Documentary']
    },
    negotiationBehavior: {
      feeModifier: 1.0,
      demandCreativeControl: true,
      demandPackageDeal: false,
      aggressiveness: 35
    },
    collaborationStyle: {
      teamworkBonus: 5,
      conflictRisk: 35,
      adaptability: 55
    },
    performanceModifier: 1.25,
    crisisSusceptibility: 25,
    careerTrajectory: 'peak'
  },
  indie_darling: {
    id: 'ARC-ACTOR-007',
    key: 'indie_darling',
    name: 'Indie Darling',
    description: 'Actors who made their name in independent films, often seeking artistic fulfillment.',
    tierBias: [2, 3, 4],
    projectPreferences: {
      formats: ['film'],
      budgetTiers: ['indie', 'low'],
      genres: ['Drama', 'Horror', 'Romance', 'Comedy']
    },
    negotiationBehavior: {
      feeModifier: 0.8,
      demandCreativeControl: true,
      demandPackageDeal: false,
      aggressiveness: 25
    },
    collaborationStyle: {
      teamworkBonus: 15,
      conflictRisk: 20,
      adaptability: 85
    },
    performanceModifier: 1.15,
    crisisSusceptibility: 15,
    careerTrajectory: 'rising'
  },
  viral_sensation: {
    id: 'ARC-ACTOR-008',
    key: 'viral_sensation',
    name: 'Viral Sensation',
    description: 'Actors who gained fame through social media or viral content, often with limited traditional training.',
    tierBias: [3, 4],
    projectPreferences: {
      formats: ['tv', 'streaming', 'unscripted'],
      budgetTiers: ['low', 'mid'],
      genres: ['Comedy', 'Reality', 'Romance']
    },
    negotiationBehavior: {
      feeModifier: 1.3,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 55
    },
    collaborationStyle: {
      teamworkBonus: -5,
      conflictRisk: 45,
      adaptability: 40
    },
    performanceModifier: 0.9,
    crisisSusceptibility: 50,
    careerTrajectory: 'rising'
  },
  kid_actor: {
    id: 'ARC-ACTOR-009',
    key: 'kid_actor',
    name: 'Kid Actor',
    description: 'Child actors who typically start in family-friendly content and must navigate career transitions as they age.',
    tierBias: [3, 4],
    projectPreferences: {
      formats: ['tv', 'film'],
      budgetTiers: ['low', 'mid', 'high'],
      genres: ['Family', 'Comedy', 'Animation', 'Adventure']
    },
    negotiationBehavior: {
      feeModifier: 0.7,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 20
    },
    collaborationStyle: {
      teamworkBonus: 20,
      conflictRisk: 15,
      adaptability: 80
    },
    performanceModifier: 0.95,
    crisisSusceptibility: 60,
    careerTrajectory: 'rising'
  },
  young_adult: {
    id: 'ARC-ACTOR-010',
    key: 'young_adult',
    name: 'Young Adult',
    description: 'Actors in their late teens to early twenties transitioning from child roles to adult content.',
    tierBias: [2, 3],
    projectPreferences: {
      formats: ['tv', 'film', 'streaming'],
      budgetTiers: ['mid', 'high'],
      genres: ['Drama', 'Romance', 'Comedy', 'Thriller', 'Action']
    },
    negotiationBehavior: {
      feeModifier: 1.0,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 45
    },
    collaborationStyle: {
      teamworkBonus: 10,
      conflictRisk: 30,
      adaptability: 70
    },
    performanceModifier: 1.05,
    crisisSusceptibility: 40,
    careerTrajectory: 'rising'
  },
  veteran: {
    id: 'ARC-ACTOR-011',
    key: 'veteran',
    name: 'Veteran',
    description: 'Established actors with decades of experience, often taking mentorship roles or character parts.',
    tierBias: [1, 2],
    projectPreferences: {
      formats: ['film', 'tv', 'streaming'],
      budgetTiers: ['indie', 'mid', 'high', 'blockbuster'],
      genres: ['Drama', 'Thriller', 'Action', 'Comedy', 'Horror']
    },
    negotiationBehavior: {
      feeModifier: 1.1,
      demandCreativeControl: true,
      demandPackageDeal: false,
      aggressiveness: 30
    },
    collaborationStyle: {
      teamworkBonus: 25,
      conflictRisk: 10,
      adaptability: 90
    },
    performanceModifier: 1.3,
    crisisSusceptibility: 15,
    careerTrajectory: 'peak'
  }
};

/**
 * Writer Archetypes
 * Note: Writer archetypes include 'showrunner' as one of the archetype options
 */
export const WRITER_ARCHETYPES: Record<WriterArchetype, ArchetypeConfig> = {
  showrunner: {
    id: 'ARC-WRITER-001',
    key: 'showrunner',
    name: 'Showrunner',
    description: 'Writer-creators who run TV series, with creative control over the show.',
    tierBias: [1, 2],
    projectPreferences: {
      formats: ['tv', 'streaming'],
      budgetTiers: ['mid', 'high', 'blockbuster'],
      genres: ['Drama', 'Comedy', 'Sci-Fi', 'Thriller']
    },
    negotiationBehavior: {
      feeModifier: 1.4,
      demandCreativeControl: true,
      demandPackageDeal: true,
      aggressiveness: 70
    },
    collaborationStyle: {
      teamworkBonus: -15,
      conflictRisk: 50,
      adaptability: 45
    },
    performanceModifier: 1.3,
    crisisSusceptibility: 35,
    careerTrajectory: 'peak'
  },
  screenwriter: {
    id: 'ARC-WRITER-002',
    key: 'screenwriter',
    name: 'Screenwriter',
    description: 'Traditional screenwriters who work on film scripts.',
    tierBias: [2, 3, 4],
    projectPreferences: {
      formats: ['film'],
      budgetTiers: ['low', 'mid', 'high'],
      genres: ['Drama', 'Comedy', 'Horror', 'Thriller']
    },
    negotiationBehavior: {
      feeModifier: 1.0,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 35
    },
    collaborationStyle: {
      teamworkBonus: 10,
      conflictRisk: 25,
      adaptability: 70
    },
    performanceModifier: 1.1,
    crisisSusceptibility: 20,
    careerTrajectory: 'rising'
  },
  script_doctor: {
    id: 'ARC-WRITER-003',
    key: 'script_doctor',
    name: 'Script Doctor',
    description: 'Writers hired to fix or improve existing scripts.',
    tierBias: [2, 3, 4],
    projectPreferences: {
      formats: ['film', 'tv'],
      budgetTiers: ['mid', 'high'],
      genres: ['Drama', 'Comedy', 'Action']
    },
    negotiationBehavior: {
      feeModifier: 0.9,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 25
    },
    collaborationStyle: {
      teamworkBonus: 5,
      conflictRisk: 30,
      adaptability: 80
    },
    performanceModifier: 1.15,
    crisisSusceptibility: 15,
    careerTrajectory: 'peak'
  },
  novelist: {
    id: 'ARC-WRITER-004',
    key: 'novelist',
    name: 'Novelist',
    description: 'Authors adapting their own work to screen, often with strong artistic vision.',
    tierBias: [1, 2],
    projectPreferences: {
      formats: ['film', 'tv'],
      budgetTiers: ['mid', 'high', 'blockbuster'],
      genres: ['Drama', 'Romance', 'Fantasy', 'Sci-Fi']
    },
    negotiationBehavior: {
      feeModifier: 1.2,
      demandCreativeControl: true,
      demandPackageDeal: false,
      aggressiveness: 55
    },
    collaborationStyle: {
      teamworkBonus: -10,
      conflictRisk: 40,
      adaptability: 50
    },
    performanceModifier: 1.2,
    crisisSusceptibility: 30,
    careerTrajectory: 'peak'
  },
  comedy_writer: {
    id: 'ARC-WRITER-005',
    key: 'comedy_writer',
    name: 'Comedy Writer',
    description: 'Writers specializing in comedy content for film and TV.',
    tierBias: [2, 3, 4],
    projectPreferences: {
      formats: ['film', 'tv', 'streaming'],
      budgetTiers: ['low', 'mid', 'high'],
      genres: ['Comedy', 'Romance', 'Family']
    },
    negotiationBehavior: {
      feeModifier: 1.0,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 30
    },
    collaborationStyle: {
      teamworkBonus: 15,
      conflictRisk: 20,
      adaptability: 75
    },
    performanceModifier: 1.1,
    crisisSusceptibility: 20,
    careerTrajectory: 'rising'
  },
  genre_specialist: {
    id: 'ARC-WRITER-006',
    key: 'genre_specialist',
    name: 'Genre Specialist',
    description: 'Writers who excel in specific genres like horror, sci-fi, or romance.',
    tierBias: [2, 3],
    projectPreferences: {
      formats: ['film', 'tv', 'streaming'],
      budgetTiers: ['low', 'mid', 'high'],
      genres: ['Horror', 'Sci-Fi', 'Romance', 'Thriller']
    },
    negotiationBehavior: {
      feeModifier: 1.0,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 35
    },
    collaborationStyle: {
      teamworkBonus: 10,
      conflictRisk: 25,
      adaptability: 65
    },
    performanceModifier: 1.15,
    crisisSusceptibility: 25,
    careerTrajectory: 'peak'
  },
  prestige_writer: {
    id: 'ARC-WRITER-007',
    key: 'prestige_writer',
    name: 'Prestige Writer',
    description: 'Critically acclaimed writers who prioritize artistic projects.',
    tierBias: [1, 2],
    projectPreferences: {
      formats: ['film', 'tv'],
      budgetTiers: ['indie', 'mid', 'high'],
      genres: ['Drama', 'Documentary', 'Romance']
    },
    negotiationBehavior: {
      feeModifier: 1.1,
      demandCreativeControl: true,
      demandPackageDeal: false,
      aggressiveness: 40
    },
    collaborationStyle: {
      teamworkBonus: 5,
      conflictRisk: 35,
      adaptability: 60
    },
    performanceModifier: 1.25,
    crisisSusceptibility: 25,
    careerTrajectory: 'peak'
  }
};

/**
 * Producer Archetypes
 */
export const PRODUCER_ARCHETYPES: Record<ProducerArchetype, ArchetypeConfig> = {
  blockbuster_producer: {
    id: 'ARC-PRODUCER-001',
    key: 'blockbuster_producer',
    name: 'Blockbuster Producer',
    description: 'Producers who specialize in big-budget franchise films.',
    tierBias: [1, 2],
    projectPreferences: {
      formats: ['film'],
      budgetTiers: ['high', 'blockbuster'],
      genres: ['Action', 'Sci-Fi', 'Fantasy', 'Superhero']
    },
    negotiationBehavior: {
      feeModifier: 1.5,
      demandCreativeControl: true,
      demandPackageDeal: true,
      aggressiveness: 80
    },
    collaborationStyle: {
      teamworkBonus: -10,
      conflictRisk: 45,
      adaptability: 40
    },
    performanceModifier: 1.2,
    crisisSusceptibility: 40,
    careerTrajectory: 'peak'
  },
  indie_producer: {
    id: 'ARC-PRODUCER-002',
    key: 'indie_producer',
    name: 'Indie Producer',
    description: 'Producers who work on independent films with artistic focus.',
    tierBias: [2, 3, 4],
    projectPreferences: {
      formats: ['film'],
      budgetTiers: ['indie', 'low'],
      genres: ['Drama', 'Horror', 'Romance', 'Comedy']
    },
    negotiationBehavior: {
      feeModifier: 0.7,
      demandCreativeControl: true,
      demandPackageDeal: false,
      aggressiveness: 20
    },
    collaborationStyle: {
      teamworkBonus: 20,
      conflictRisk: 15,
      adaptability: 85
    },
    performanceModifier: 1.15,
    crisisSusceptibility: 15,
    careerTrajectory: 'rising'
  },
  studio_exec: {
    id: 'ARC-PRODUCER-003',
    key: 'studio_exec',
    name: 'Studio Executive',
    description: 'Producers with studio backgrounds who prioritize commercial success.',
    tierBias: [1, 2],
    projectPreferences: {
      formats: ['film', 'tv'],
      budgetTiers: ['mid', 'high', 'blockbuster'],
      genres: ['Action', 'Comedy', 'Family', 'Fantasy']
    },
    negotiationBehavior: {
      feeModifier: 1.4,
      demandCreativeControl: false,
      demandPackageDeal: true,
      aggressiveness: 70
    },
    collaborationStyle: {
      teamworkBonus: -5,
      conflictRisk: 40,
      adaptability: 50
    },
    performanceModifier: 1.1,
    crisisSusceptibility: 35,
    careerTrajectory: 'peak'
  },
  packager: {
    id: 'ARC-PRODUCER-004',
    key: 'packager',
    name: 'Packager',
    description: 'Producers who package multiple projects together for sale.',
    tierBias: [2, 3],
    projectPreferences: {
      formats: ['tv', 'streaming'],
      budgetTiers: ['mid', 'high'],
      genres: ['Drama', 'Comedy', 'Reality']
    },
    negotiationBehavior: {
      feeModifier: 1.2,
      demandCreativeControl: false,
      demandPackageDeal: true,
      aggressiveness: 65
    },
    collaborationStyle: {
      teamworkBonus: 0,
      conflictRisk: 35,
      adaptability: 55
    },
    performanceModifier: 1.05,
    crisisSusceptibility: 30,
    careerTrajectory: 'rising'
  },
  line_producer: {
    id: 'ARC-PRODUCER-005',
    key: 'line_producer',
    name: 'Line Producer',
    description: 'Producers focused on budget management and production logistics.',
    tierBias: [2, 3, 4],
    projectPreferences: {
      formats: ['film', 'tv'],
      budgetTiers: ['low', 'mid', 'high'],
      genres: ['Drama', 'Comedy', 'Action', 'Thriller']
    },
    negotiationBehavior: {
      feeModifier: 0.9,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 25
    },
    collaborationStyle: {
      teamworkBonus: 15,
      conflictRisk: 20,
      adaptability: 80
    },
    performanceModifier: 1.0,
    crisisSusceptibility: 20,
    careerTrajectory: 'rising'
  },
  creative_producer: {
    id: 'ARC-PRODUCER-006',
    key: 'creative_producer',
    name: 'Creative Producer',
    description: 'Producers with strong creative input and artistic vision.',
    tierBias: [1, 2],
    projectPreferences: {
      formats: ['film', 'tv'],
      budgetTiers: ['mid', 'high'],
      genres: ['Drama', 'Horror', 'Romance', 'Sci-Fi']
    },
    negotiationBehavior: {
      feeModifier: 1.1,
      demandCreativeControl: true,
      demandPackageDeal: false,
      aggressiveness: 45
    },
    collaborationStyle: {
      teamworkBonus: 5,
      conflictRisk: 35,
      adaptability: 60
    },
    performanceModifier: 1.2,
    crisisSusceptibility: 30,
    careerTrajectory: 'peak'
  }
};

/**
 * Personality Archetypes
 */
export const PERSONALITY_ARCHETYPES: Record<PersonalityArchetype, ArchetypeConfig> = {
  influencer: {
    id: 'ARC-PERSONALITY-001',
    key: 'influencer',
    name: 'Influencer',
    description: 'Social media personalities with large followings.',
    tierBias: [3, 4],
    projectPreferences: {
      formats: ['streaming', 'unscripted', 'tv'],
      budgetTiers: ['low', 'mid'],
      genres: ['Reality', 'Comedy', 'Romance']
    },
    negotiationBehavior: {
      feeModifier: 1.2,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 50
    },
    collaborationStyle: {
      teamworkBonus: -10,
      conflictRisk: 40,
      adaptability: 50
    },
    performanceModifier: 0.85,
    crisisSusceptibility: 45,
    careerTrajectory: 'rising'
  },
  reality_star: {
    id: 'ARC-PERSONALITY-002',
    key: 'reality_star',
    name: 'Reality Star',
    description: 'Personalities from reality television seeking mainstream opportunities.',
    tierBias: [3, 4],
    projectPreferences: {
      formats: ['unscripted', 'tv', 'streaming'],
      budgetTiers: ['low', 'mid'],
      genres: ['Reality', 'Comedy', 'Family']
    },
    negotiationBehavior: {
      feeModifier: 1.0,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 40
    },
    collaborationStyle: {
      teamworkBonus: 0,
      conflictRisk: 35,
      adaptability: 60
    },
    performanceModifier: 0.8,
    crisisSusceptibility: 50,
    careerTrajectory: 'rising'
  },
  talk_show_host: {
    id: 'ARC-PERSONALITY-003',
    key: 'talk_show_host',
    name: 'Talk Show Host',
    description: 'Television hosts with strong communication skills and personality.',
    tierBias: [2, 3],
    projectPreferences: {
      formats: ['tv', 'streaming'],
      budgetTiers: ['mid', 'high'],
      genres: ['Comedy', 'Talk', 'News']
    },
    negotiationBehavior: {
      feeModifier: 1.3,
      demandCreativeControl: true,
      demandPackageDeal: false,
      aggressiveness: 60
    },
    collaborationStyle: {
      teamworkBonus: -5,
      conflictRisk: 45,
      adaptability: 45
    },
    performanceModifier: 1.0,
    crisisSusceptibility: 40,
    careerTrajectory: 'peak'
  },
  news_anchor: {
    id: 'ARC-PERSONALITY-004',
    key: 'news_anchor',
    name: 'News Anchor',
    description: 'Journalists and news presenters.',
    tierBias: [2, 3, 4],
    projectPreferences: {
      formats: ['tv', 'streaming'],
      budgetTiers: ['mid', 'high'],
      genres: ['News', 'Documentary', 'Drama']
    },
    negotiationBehavior: {
      feeModifier: 1.1,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 30
    },
    collaborationStyle: {
      teamworkBonus: 10,
      conflictRisk: 20,
      adaptability: 70
    },
    performanceModifier: 1.0,
    crisisSusceptibility: 25,
    careerTrajectory: 'peak'
  },
  viral_creator: {
    id: 'ARC-PERSONALITY-005',
    key: 'viral_creator',
    name: 'Viral Creator',
    description: 'Digital content creators who gained fame through online platforms.',
    tierBias: [3, 4],
    projectPreferences: {
      formats: ['streaming', 'unscripted', 'tv'],
      budgetTiers: ['low', 'mid'],
      genres: ['Comedy', 'Reality', 'Horror']
    },
    negotiationBehavior: {
      feeModifier: 1.1,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 45
    },
    collaborationStyle: {
      teamworkBonus: -5,
      conflictRisk: 35,
      adaptability: 55
    },
    performanceModifier: 0.85,
    crisisSusceptibility: 40,
    careerTrajectory: 'rising'
  },
  legacy_personality: {
    id: 'ARC-PERSONALITY-006',
    key: 'legacy_personality',
    name: 'Legacy Personality',
    description: 'Established personalities with long careers and name recognition.',
    tierBias: [1, 2],
    projectPreferences: {
      formats: ['tv', 'film'],
      budgetTiers: ['mid', 'high'],
      genres: ['Drama', 'Comedy', 'Romance']
    },
    negotiationBehavior: {
      feeModifier: 1.4,
      demandCreativeControl: false,
      demandPackageDeal: false,
      aggressiveness: 55
    },
    collaborationStyle: {
      teamworkBonus: 5,
      conflictRisk: 30,
      adaptability: 60
    },
    performanceModifier: 1.05,
    crisisSusceptibility: 30,
    careerTrajectory: 'peak'
  }
};

/**
 * Universal Personality Traits
 * These are personality traits that can apply to any talent regardless of role
 */
export const PERSONALITY_TRAITS: Record<TalentPersonality, {
  description: string;
  negotiationModifier: number;
  collaborationModifier: number;
  performanceModifier: number;
  crisisModifier: number;
}> = {
  perfectionist: {
    description: 'Obsessed with quality and detail, may be difficult to work with',
    negotiationModifier: 1.2,
    collaborationModifier: -15,
    performanceModifier: 1.2,
    crisisModifier: 25
  },
  collaborative: {
    description: 'Team player who works well with others',
    negotiationModifier: 0.9,
    collaborationModifier: 20,
    performanceModifier: 1.1,
    crisisModifier: -15
  },
  difficult: {
    description: 'Known for being challenging and demanding',
    negotiationModifier: 1.3,
    collaborationModifier: -20,
    performanceModifier: 0.95,
    crisisModifier: 35
  },
  charismatic: {
    description: 'Natural charm that helps in negotiations and public relations',
    negotiationModifier: 1.1,
    collaborationModifier: 10,
    performanceModifier: 1.05,
    crisisModifier: -10
  },
  method: {
    description: 'Immersive actor who stays in character, can be intense',
    negotiationModifier: 1.15,
    collaborationModifier: -10,
    performanceModifier: 1.25,
    crisisModifier: 20
  },
  pragmatic: {
    description: 'Practical and business-focused in decisions',
    negotiationModifier: 1.0,
    collaborationModifier: 5,
    performanceModifier: 1.0,
    crisisModifier: -5
  },
  artistic: {
    description: 'Prioritizes creative vision over commercial concerns',
    negotiationModifier: 1.1,
    collaborationModifier: -5,
    performanceModifier: 1.2,
    crisisModifier: 20
  },
  commercial: {
    description: 'Focused on commercial success and marketability',
    negotiationModifier: 1.2,
    collaborationModifier: 0,
    performanceModifier: 0.95,
    crisisModifier: 10
  },
  loyal: {
    description: 'Committed to long-term relationships and repeat collaborations',
    negotiationModifier: 0.95,
    collaborationModifier: 15,
    performanceModifier: 1.05,
    crisisModifier: -20
  },
  ambitious: {
    description: 'Driven to advance career and achieve success',
    negotiationModifier: 1.15,
    collaborationModifier: -5,
    performanceModifier: 1.1,
    crisisModifier: 15
  }
};

/**
 * Get archetype configuration by role and key
 */
export function getArchetypeConfig(role: string, archetypeKey: string): ArchetypeConfig | null {
  switch (role) {
    case 'actor':
      return ACTOR_ARCHETYPES[archetypeKey as ActorArchetype] || null;
    case 'writer':
    case 'showrunner':
      return WRITER_ARCHETYPES[archetypeKey as WriterArchetype] || null;
    case 'producer':
      return PRODUCER_ARCHETYPES[archetypeKey as ProducerArchetype] || null;
    case 'personality':
      return PERSONALITY_ARCHETYPES[archetypeKey as PersonalityArchetype] || null;
    default:
      return null;
  }
}

/**
 * Generate a random archetype for a given role and tier
 */
export function generateArchetypeForRole(role: string, tier: TalentTier, rng: { next: () => number }): string {
  let archetypes: string[] = [];
  
  switch (role) {
    case 'actor':
      archetypes = Object.keys(ACTOR_ARCHETYPES).filter(key => 
        ACTOR_ARCHETYPES[key as ActorArchetype].tierBias.includes(tier)
      );
      break;
    case 'writer':
    case 'showrunner':
      archetypes = Object.keys(WRITER_ARCHETYPES).filter(key => 
        WRITER_ARCHETYPES[key as WriterArchetype].tierBias.includes(tier)
      );
      break;
    case 'producer':
      archetypes = Object.keys(PRODUCER_ARCHETYPES).filter(key => 
        PRODUCER_ARCHETYPES[key as ProducerArchetype].tierBias.includes(tier)
      );
      break;
    case 'personality':
      archetypes = Object.keys(PERSONALITY_ARCHETYPES).filter(key => 
        PERSONALITY_ARCHETYPES[key as PersonalityArchetype].tierBias.includes(tier)
      );
      break;
    default:
      archetypes = [];
  }
  
  // Fallback to all archetypes if tier filter yields none
  if (archetypes.length === 0) {
    switch (role) {
      case 'actor':
        archetypes = Object.keys(ACTOR_ARCHETYPES);
        break;
      case 'writer':
      case 'showrunner':
        archetypes = Object.keys(WRITER_ARCHETYPES);
        break;
      case 'producer':
        archetypes = Object.keys(PRODUCER_ARCHETYPES);
        break;
      case 'personality':
        archetypes = Object.keys(PERSONALITY_ARCHETYPES);
        break;
    }
  }
  
  const index = Math.floor(rng.next() * archetypes.length);
  return archetypes[index];
}

/**
 * Generate a random personality trait
 */
export function generatePersonalityTrait(rng: { next: () => number }): TalentPersonality {
  const traits = Object.keys(PERSONALITY_TRAITS) as TalentPersonality[];
  const index = Math.floor(rng.next() * traits.length);
  return traits[index];
}

/**
 * Generate career trajectory based on tier
 */
export function generateCareerTrajectory(tier: TalentTier): CareerTrajectory {
  // Higher tiers more likely to be at peak
  // Lower tiers more likely to be rising
  if (tier === 1) {
    return Math.random() > 0.3 ? 'peak' : 'declining';
  } else if (tier === 2) {
    const roll = Math.random();
    if (roll < 0.3) return 'rising';
    if (roll < 0.6) return 'peak';
    return 'declining';
  } else if (tier === 3) {
    const roll = Math.random();
    if (roll < 0.5) return 'rising';
    if (roll < 0.8) return 'peak';
    return 'declining';
  } else {
    return 'rising'; // Tier 4 is always rising
  }
}
