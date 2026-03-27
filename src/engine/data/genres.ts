export interface SubGenre {
  id: string;
  name: string;
}

export interface GenreCategory {
  id: string;
  name: string;
  subGenres: SubGenre[];
}

export const GENRE_TAXONOMY: GenreCategory[] = [
  {
    id: 'action_adventure',
    name: 'Action & Adventure',
    subGenres: [
      { id: 'action', name: 'Action' },
      { id: 'superhero', name: 'Superhero' },
      { id: 'martial_arts', name: 'Martial Arts' },
      { id: 'epic', name: 'Epic' }
    ]
  },
  {
    id: 'comedy',
    name: 'Comedy',
    subGenres: [
      { id: 'rom_com', name: 'Rom-Com' },
      { id: 'satire', name: 'Satire' },
      { id: 'slapstick', name: 'Slapstick' },
      { id: 'dark_comedy', name: 'Dark Comedy' },
      { id: 'sitcom', name: 'Sitcom' }
    ]
  },
  {
    id: 'drama',
    name: 'Drama',
    subGenres: [
      { id: 'biopic', name: 'Biopic' },
      { id: 'historical', name: 'Historical' },
      { id: 'legal', name: 'Legal' },
      { id: 'melodrama', name: 'Melodrama' },
      { id: 'drama_standard', name: 'Drama' }
    ]
  },
  {
    id: 'horror_thriller',
    name: 'Horror & Thriller',
    subGenres: [
      { id: 'slasher', name: 'Slasher' },
      { id: 'psychological', name: 'Psychological Thriller' },
      { id: 'paranormal', name: 'Paranormal' },
      { id: 'true_crime', name: 'True Crime' },
      { id: 'horror_standard', name: 'Horror' },
      { id: 'thriller_standard', name: 'Thriller' }
    ]
  },
  {
    id: 'scifi_fantasy',
    name: 'Sci-Fi & Fantasy',
    subGenres: [
      { id: 'cyberpunk', name: 'Cyberpunk' },
      { id: 'space_opera', name: 'Space Opera' },
      { id: 'high_fantasy', name: 'High Fantasy' },
      { id: 'dystopian', name: 'Dystopian' },
      { id: 'scifi_standard', name: 'Sci-Fi' },
      { id: 'fantasy_standard', name: 'Fantasy' }
    ]
  },
  {
    id: 'unscripted',
    name: 'Unscripted',
    subGenres: [
      { id: 'reality_competition', name: 'Reality Competition' },
      { id: 'docuseries', name: 'Docuseries' },
      { id: 'talk_show', name: 'Talk Show' },
      { id: 'variety', name: 'Variety' }
    ]
  }
];

// Flat lists for backward compatibility where needed (will migration later)
export const GENRES = GENRE_TAXONOMY.flatMap(cat => cat.subGenres.map(sg => sg.name));

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
  'Animation': ['Comedy', 'Family', 'Musical', 'Fantasy', 'Sci-Fi', 'Superhero', 'Action'],
  'Drama': ['Romance', 'Crime', 'Thriller', 'Documentary'],
  'Musical': ['Romance', 'Comedy', 'Animation', 'Drama'],
  'Documentary': ['Drama', 'Crime']
};

export const FRANCHISE_FATIGUE_RISK: Record<string, number> = {
  'Superhero': 0.65,
  'Action': 0.40,
  'Sci-Fi': 0.35,
  'Fantasy': 0.30,
  'Horror': 0.15,
  'Animation': 0.15,
  'Comedy': 0.25,
  'Drama': 0.05,
  'Thriller': 0.15,
  'Romance': 0.10,
  'Documentary': 0.05,
  'Crime': 0.20,
  'Musical': 0.25,
};
