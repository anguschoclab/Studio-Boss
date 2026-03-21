export const UNSCRIPTED_GENRES = [
  'Competition Reality', 'Docuseries', 'True Crime', 'Lifestyle / Makeover',
  'Food / Travel', 'Talent Competition', 'Survival / Adventure', 'Social Experiment',
  'Ensemble Reality', 'Game Show / Quiz', 'Talk Show'
] as const;

export const GENRES = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller',
  'Romance', 'Animation', 'Documentary', 'Fantasy', 'Crime', 'Musical',
] as const;

export const TARGET_AUDIENCES = [
  'General Audience', 'Young Adults', 'Adults 25-54',
  'Prestige / Critics', 'Family', 'Genre Fans',
] as const;

export const FRANCHISE_FATIGUE_RISK: Record<string, number> = {
  'Action': 0.35,      // High risk for superhero/action fatigue
  'Sci-Fi': 0.30,      // High risk for sci-fi blockbusters
  'Fantasy': 0.25,     // Moderate risk
  'Horror': 0.15,      // Low risk, very resilient
  'Animation': 0.10,   // Low risk, kids watch them repeatedly
  'Comedy': 0.20,      // Moderate risk, jokes get stale
  'Drama': 0.05,       // Very low risk, rarely franchised heavily
  'Thriller': 0.15,    // Low risk
  'Romance': 0.10,     // Low risk
  'Documentary': 0.05, // Very low risk
  'Crime': 0.20,       // Moderate risk
  'Musical': 0.25,     // Moderate risk
};
