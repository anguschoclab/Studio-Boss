// TV Show Recommendation System Types
// Provides intelligent TV role recommendations for talents based on their attributes

export type TVRoleType = 'guest_star' | 'recurring' | 'series_regular' | 'lead' | 'showrunner' | 'creator';
export type TVGenre = 'drama' | 'comedy' | 'thriller' | 'sci-fi' | 'horror' | 'action' | 'romance' | 'reality' | 'documentary';
export type TVPlatform = 'broadcast' | 'cable' | 'streaming' | 'premium_cable';

export interface TVShowRecommendation {
  id: string;
  talentId: string;
  roleType: TVRoleType;
  genre: TVGenre;
  platform: TVPlatform;
  matchScore: number; // 0-100, how well the talent fits this role
  reasoning: string[];
  suggestedShowTitles: string[];
  estimatedFee: number;
  prestigeBoost: number;
  starMeterBoost: number;
  generatedWeek: number;
  expiresWeek: number;
}

export interface TVRecommendationCriteria {
  talentId: string;
  currentTier: number;
  currentPrestige: number;
  starMeter: number;
  preferredGenres: string[];
  personality: string;
  careerTrajectory: string;
  skills: {
    acting: number;
    writing: number;
    directing: number;
    stardom: number;
  };
  recentProjectTypes: string[];
  age: number;
  gender: string;
}

export interface TVRecommendationConfig {
  maxRecommendationsPerTalent: number;
  recommendationLifetimeWeeks: number;
  minMatchScore: number;
  genreWeights: Record<TVGenre, number>;
  platformWeights: Record<TVPlatform, number>;
}

// Platform prestige tiers
export const PLATFORM_PRESTIGE: Record<TVPlatform, number> = {
  'broadcast': 40,
  'cable': 55,
  'streaming': 70,
  'premium_cable': 85,
};

// Role type multipliers for prestige
export const ROLE_PRESTIGE_MULTIPLIERS: Record<TVRoleType, number> = {
  'guest_star': 0.5,
  'recurring': 0.7,
  'series_regular': 0.9,
  'lead': 1.2,
  'showrunner': 1.5,
  'creator': 1.8,
};

// Default configuration
export const DEFAULT_TV_RECOMMENDATION_CONFIG: TVRecommendationConfig = {
  maxRecommendationsPerTalent: 3,
  recommendationLifetimeWeeks: 12,
  minMatchScore: 50,
  genreWeights: {
    'drama': 1.0,
    'comedy': 1.0,
    'thriller': 0.9,
    'sci-fi': 0.8,
    'horror': 0.7,
    'action': 0.9,
    'romance': 0.8,
    'reality': 0.5,
    'documentary': 0.6,
  },
  platformWeights: {
    'broadcast': 0.8,
    'cable': 0.9,
    'streaming': 1.2,
    'premium_cable': 1.5,
  },
};

// Famous TV show titles by genre/platform
export const TV_SHOW_TEMPLATES: Record<TVGenre, Record<TVPlatform, string[]>> = {
  'drama': {
    'broadcast': ['Hospital Drama', 'Legal Drama', 'Family Saga', 'Police Procedural'],
    'cable': ['Character Study', 'Period Piece', 'Crime Anthology'],
    'streaming': ['Binge-worthy Drama', 'International Crossover', 'Limited Series'],
    'premium_cable': ['Gritty Drama', 'Political Thriller', 'Character-driven Epic'],
  },
  'comedy': {
    'broadcast': ['Workplace Comedy', 'Family Sitcom', 'Single-cam Comedy'],
    'cable': ['Dark Comedy', 'Satire', 'Ensemble Comedy'],
    'streaming': ['Comedy Anthology', 'Stand-up Series', 'Rom-Com Series'],
    'premium_cable': ['Adult Animation', 'Provocative Comedy', 'Dark Satire'],
  },
  'thriller': {
    'broadcast': ['Mystery Series', 'Procedural Thriller'],
    'cable': ['Psychological Thriller', 'Crime Drama'],
    'streaming': ['Limited Thriller', 'International Thriller'],
    'premium_cable': ['Noir Thriller', 'Complex Mystery'],
  },
  'sci-fi': {
    'broadcast': ['Space Opera', 'Sci-fi Adventure'],
    'cable': ['Hard Sci-Fi', 'Dystopian Series'],
    'streaming': ['Epic Sci-Fi', 'Time Travel Series'],
    'premium_cable': ['Hard Sci-Fi Drama', 'Space Opera'],
  },
  'horror': {
    'broadcast': ['Supernatural Series', 'Horror Anthology'],
    'cable': ['Psychological Horror', 'Slasher Series'],
    'streaming': ['Limited Horror', 'Supernatural Thriller'],
    'premium_cable': ['Arthouse Horror', 'Psychological Terror'],
  },
  'action': {
    'broadcast': ['Action Procedural', 'Superhero Series'],
    'cable': ['Gritty Action', 'Spy Thriller'],
    'streaming': ['High-concept Action', 'International Action'],
    'premium_cable': ['Realistic Action', 'Military Drama'],
  },
  'romance': {
    'broadcast': ['Romantic Drama', 'Rom-com Series'],
    'cable': ['Period Romance', 'Modern Romance'],
    'streaming': ['Romance Anthology', 'International Romance'],
    'premium_cable': ['Adult Romance', 'Complex Romance'],
  },
  'reality': {
    'broadcast': ['Competition Reality', 'Docu-soap'],
    'cable': ['Lifestyle Reality', 'Reality Competition'],
    'streaming': ['Social Experiment', 'Docu-series'],
    'premium_cable': ['Behind-the-scenes Reality', 'Celebrity Reality'],
  },
  'documentary': {
    'broadcast': ['Docu-series', 'Investigative Doc'],
    'cable': ['True Crime Doc', 'Nature Documentary'],
    'streaming': ['Limited Docu-series', 'Investigative Series'],
    'premium_cable': ['Feature Doc Series', 'Artistic Documentary'],
  },
};
