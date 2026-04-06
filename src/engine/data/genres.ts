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
      { id: 'epic', name: 'Epic' },
      { id: 'video_game', name: 'Video Game Adaptation' }
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
      { id: 'sitcom', name: 'Sitcom' },
      { id: 'ip_mashup', name: 'IP Mashup' }
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
      { id: 'thriller_standard', name: 'Thriller' },
      { id: 'elevated_horror', name: 'Elevated Horror' }
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
      { id: 'fantasy_standard', name: 'Fantasy' },
      { id: 'multiverse', name: 'Multiverse' }
    ]
  },
  {
    id: 'unscripted',
    name: 'Unscripted',
    subGenres: [
      { id: 'reality_competition', name: 'Reality Competition' },
      { id: 'docuseries', name: 'Docuseries' },
      { id: 'talk_show', name: 'Talk Show' },
      { id: 'variety', name: 'Variety' },
      { id: 'unscripted_standard', name: 'Unscripted' }
    ]
  },
  {
    id: 'animation',
    name: 'Animation',
    subGenres: [
      { id: 'adult_animation', name: 'Adult Animation' },
      { id: 'kids_animation', name: 'Kids Animation' },
      { id: 'anime', name: 'Anime' },
      { id: 'animation_standard', name: 'Animation' }
    ]
  },
  {
    id: 'art_house',
    name: 'Art House',
    subGenres: [
      { id: 'experimental', name: 'Experimental' },
      { id: 'indie_drama', name: 'Indie Drama' },
      { id: 'art_house_standard', name: 'Art House' }
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
  'Superhero': ['Action', 'Sci-Fi', 'Fantasy', 'Comedy', 'Animation', 'Crime', 'Horror', 'Multiverse', 'IP Mashup'],
  'Action': ['Sci-Fi', 'Thriller', 'Crime', 'Superhero', 'Comedy', 'Video Game Adaptation'],
  'Sci-Fi': ['Action', 'Horror', 'Fantasy', 'Animation', 'Thriller', 'Video Game Adaptation', 'Multiverse', 'Space Opera', 'Cyberpunk'],
  'Horror': ['Sci-Fi', 'Thriller', 'Comedy', 'Fantasy', 'Documentary', 'Elevated Horror'],
  'Fantasy': ['Action', 'Romance', 'Animation', 'Sci-Fi', 'Multiverse'],
  'Comedy': ['Romance', 'Action', 'Animation', 'Superhero', 'Musical', 'Horror', 'IP Mashup'],
  'Crime': ['Thriller', 'Drama', 'Action', 'Horror', 'Documentary'],
  'Thriller': ['Horror', 'Crime', 'Sci-Fi', 'Drama', 'Action', 'Elevated Horror'],
  'Romance': ['Comedy', 'Drama', 'Musical', 'Fantasy'],
  'Animation': ['Comedy', 'Family', 'Musical', 'Fantasy', 'Sci-Fi', 'Superhero', 'Action', 'Video Game Adaptation', 'IP Mashup'],
  'Drama': ['Romance', 'Crime', 'Thriller', 'Documentary'],
  'Musical': ['Romance', 'Comedy', 'Animation', 'Drama'],
  'Documentary': ['Drama', 'Crime', 'Horror'],
  'Unscripted': ['Comedy', 'Documentary', 'Drama'],
  'Multiverse': ['Superhero', 'Sci-Fi', 'Fantasy', 'Action', 'Animation', 'IP Mashup'],
  'Elevated Horror': ['Horror', 'Thriller', 'Drama', 'Psychological Thriller'],
  'IP Mashup': ['Comedy', 'Action', 'Animation', 'Superhero', 'Multiverse', 'Sci-Fi', 'Video Game Adaptation'],
  'Video Game Adaptation': ['Action', 'Sci-Fi', 'Fantasy', 'Animation', 'Horror', 'IP Mashup'],
  'Space Opera': ['Sci-Fi', 'Action', 'Fantasy', 'Multiverse'],
  'Cyberpunk': ['Sci-Fi', 'Action', 'Thriller', 'Crime'],
  // 🌌 The Universe Builder: Added specific subgenre crossover pools for massive event mapping.
  'Psychological Thriller': ['Horror', 'Thriller', 'Drama', 'Crime', 'Elevated Horror'],
  'True Crime': ['Documentary', 'Drama', 'Thriller', 'Crime'],
  'Docuseries': ['Documentary', 'Unscripted', 'True Crime']
};

export const FRANCHISE_FATIGUE_RISK: Record<string, number> = {
  'Superhero': 1.20, // 🌌 The Universe Builder: Increased fatigue risk to reflect rapid audience burnout.
  'Action': 0.50,
  'Sci-Fi': 0.45,
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
  'Unscripted': 0.40, // Reality/Unscripted can fatigue quickly if over-saturated
  'Multiverse': 1.25, // 🌌 The Universe Builder: Extremely high fatigue risk if overdone. Increased to reflect hyper-saturation.
  'Elevated Horror': 0.20,
  'IP Mashup': 0.85, // 🌌 The Universe Builder: High burnout potential
  'Video Game Adaptation': 0.60,
  'Space Opera': 0.65,
  'Cyberpunk': 0.55,
  // 🌌 The Universe Builder: Added true crime and docuseries fatigue risks.
  'Psychological Thriller': 0.35,
  'True Crime': 0.60,
  'Docuseries': 0.20,
};
