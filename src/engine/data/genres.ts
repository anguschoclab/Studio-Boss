export const UNSCRIPTED_GENRES = [
  'Competition Reality', 'Docuseries', 'True Crime', 'Lifestyle / Makeover',
  'Food / Travel', 'Talent Competition', 'Survival / Adventure', 'Social Experiment',
  'Ensemble Reality', 'Game Show / Quiz', 'Talk Show'
] as const;

export const GENRES = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller',
  'Romance', 'Animation', 'Documentary', 'Fantasy', 'Crime', 'Musical',
  'Superhero',
] as const;

export const TARGET_AUDIENCES = [
  'General Audience', 'Young Adults', 'Adults 25-54',
  'Prestige / Critics', 'Family', 'Genre Fans',
] as const;

export const CROSSOVER_AFFINITY: Record<string, string[]> = {
  'Superhero': ['Action', 'Sci-Fi', 'Fantasy', 'Comedy', 'Animation'],
  'Action': ['Sci-Fi', 'Thriller', 'Crime', 'Superhero', 'Comedy'],
  'Sci-Fi': ['Action', 'Horror', 'Fantasy', 'Animation', 'Thriller'],
  'Horror': ['Sci-Fi', 'Thriller', 'Comedy', 'Fantasy'],
  'Fantasy': ['Action', 'Romance', 'Animation', 'Sci-Fi'],
  'Comedy': ['Romance', 'Action', 'Animation', 'Superhero', 'Musical'],
  'Crime': ['Thriller', 'Drama', 'Action', 'Horror'],
  'Thriller': ['Horror', 'Crime', 'Sci-Fi', 'Drama', 'Action'],
  'Romance': ['Comedy', 'Drama', 'Musical', 'Fantasy'],
  'Animation': ['Comedy', 'Family', 'Musical', 'Fantasy', 'Sci-Fi', 'Superhero'],
  'Drama': ['Romance', 'Crime', 'Thriller', 'Documentary'],
  'Musical': ['Romance', 'Comedy', 'Animation', 'Drama'],
  'Documentary': ['Drama', 'Crime'] // Sometimes true crime or dramatic docs
};

export const FRANCHISE_FATIGUE_RISK: Record<string, number> = {
  'Superhero': 0.60,   // Extreme risk, very sensitive to market saturation
  'Action': 0.35,      // High risk for generic action fatigue
  'Sci-Fi': 0.30,      // High risk for sci-fi blockbusters
  'Fantasy': 0.25,     // Moderate risk
  'Horror': 0.15,      // Low risk, very resilient
  'Animation': 0.15,   // Low risk, kids watch them repeatedly, but can grow stale if overused
  'Comedy': 0.25,      // Moderate risk, jokes get stale faster in modern era
  'Drama': 0.05,       // Very low risk, rarely franchised heavily
  'Thriller': 0.15,    // Low risk
  'Romance': 0.10,     // Low risk
  'Documentary': 0.05, // Very low risk
  'Crime': 0.20,       // Moderate risk
  'Musical': 0.25,     // Moderate risk
};
