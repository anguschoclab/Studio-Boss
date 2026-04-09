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
    id: 'GNR-c7457e1b-51cc-afc9-65fd-b77e3dea',
    name: 'Action & Adventure',
    subGenres: [
      { id: 'GNR-9ed89934-dda0-4c7a-99fc-c55ca14d', name: 'Action' },
      { id: 'GNR-9b9168c3-c4a2-1bfb-d1ed-6987cfba', name: 'Superhero' },
      { id: 'GNR-3668183a-5619-8998-b7bf-11b7f595', name: 'Martial Arts' },
      { id: 'GNR-b88ea222-a97d-77bf-85c8-0fa90014', name: 'Epic' },
      { id: 'GNR-c30dde98-0d8f-528c-f732-85db0fe3', name: 'Video Game Adaptation' }
    ]
  },
  {
    id: 'GNR-551deee5-0556-e153-789e-7468126b',
    name: 'Comedy',
    subGenres: [
      { id: 'GNR-bd1fff34-8e02-be76-d2c0-747e256f', name: 'Rom-Com' },
      { id: 'GNR-415b3b44-c735-0ae6-7347-57fd41a6', name: 'Satire' },
      { id: 'GNR-a7408dbf-9f0e-5af8-b769-a5f5b8aa', name: 'Slapstick' },
      { id: 'GNR-31adf1bc-1617-17bf-b2d9-4defdb05', name: 'Dark Comedy' },
      { id: 'GNR-e4d3e5ee-d78d-b56e-a47d-dd45c0d1', name: 'Sitcom' },
      { id: 'GNR-6bcab2bc-691e-90f6-477e-4e34efcd', name: 'IP Mashup' }
    ]
  },
  {
    id: 'GNR-a44cee70-4ffd-e111-c2c7-fb70cdbd',
    name: 'Drama',
    subGenres: [
      { id: 'GNR-bd066eca-6842-7ce4-8781-068e6cce', name: 'Biopic' },
      { id: 'GNR-659e645e-4d0d-d7af-30d4-b82b43e4', name: 'Historical' },
      { id: 'GNR-966a33df-0c10-8fa6-554c-1888ee70', name: 'Legal' },
      { id: 'GNR-9a05d6e2-9d36-cfea-ec00-deaf0965', name: 'Melodrama' },
      { id: 'GNR-7e6623ca-cbb4-cbf7-c815-006e0134', name: 'Drama' }
    ]
  },
  {
    id: 'GNR-2507bc56-30d6-c1aa-0367-38abbdc9',
    name: 'Horror & Thriller',
    subGenres: [
      { id: 'GNR-87469297-2642-3168-aa51-7ede1cef', name: 'Slasher' },
      { id: 'GNR-2c55a426-06ac-6def-8839-52181730', name: 'Psychological Thriller' },
      { id: 'GNR-98beaa23-e89a-0a3b-ea53-2485fde6', name: 'Paranormal' },
      { id: 'GNR-2aa20225-3650-149e-4037-06160e95', name: 'True Crime' },
      { id: 'GNR-148e9c3f-c5b5-fda5-6fed-59c02cf5', name: 'Horror' },
      { id: 'GNR-58774c16-ed7c-9ac0-77ea-fb9effd9', name: 'Thriller' },
      { id: 'GNR-c9b2aee6-464f-fdcc-cf34-c8c90664', name: 'Elevated Horror' }
    ]
  },
  {
    id: 'GNR-9ed89934-dda0-4c7a-99fc-c55ca14d',
    name: 'Sci-Fi & Fantasy',
    subGenres: [
      { id: 'GNR-9b9168c3-c4a2-1bfb-d1ed-6987cfba', name: 'Cyberpunk' },
      { id: 'GNR-3668183a-5619-8998-b7bf-11b7f595', name: 'Space Opera' },
      { id: 'GNR-b88ea222-a97d-77bf-85c8-0fa90014', name: 'High Fantasy' },
      { id: 'GNR-c30dde98-0d8f-528c-f732-85db0fe3', name: 'Dystopian' },
      { id: 'GNR-551deee5-0556-e153-789e-7468126b', name: 'Sci-Fi' },
      { id: 'GNR-bd1fff34-8e02-be76-d2c0-747e256f', name: 'Fantasy' },
      { id: 'GNR-415b3b44-c735-0ae6-7347-57fd41a6', name: 'Multiverse' }
    ]
  },
  {
    id: 'GNR-a7408dbf-9f0e-5af8-b769-a5f5b8aa',
    name: 'Unscripted',
    subGenres: [
      { id: 'GNR-31adf1bc-1617-17bf-b2d9-4defdb05', name: 'Reality Competition' },
      { id: 'GNR-e4d3e5ee-d78d-b56e-a47d-dd45c0d1', name: 'Docuseries' },
      { id: 'GNR-6bcab2bc-691e-90f6-477e-4e34efcd', name: 'Talk Show' },
      { id: 'GNR-a44cee70-4ffd-e111-c2c7-fb70cdbd', name: 'Variety' },
      { id: 'GNR-bd066eca-6842-7ce4-8781-068e6cce', name: 'Unscripted' }
    ]
  },
  {
    id: 'GNR-659e645e-4d0d-d7af-30d4-b82b43e4',
    name: 'Animation',
    subGenres: [
      { id: 'GNR-966a33df-0c10-8fa6-554c-1888ee70', name: 'Adult Animation' },
      { id: 'GNR-9a05d6e2-9d36-cfea-ec00-deaf0965', name: 'Kids Animation' },
      { id: 'GNR-7e6623ca-cbb4-cbf7-c815-006e0134', name: 'Anime' },
      { id: 'GNR-2507bc56-30d6-c1aa-0367-38abbdc9', name: 'Animation' }
    ]
  },
  {
    id: 'GNR-9d3f3136-7fff-2ec6-79fc-89b1af87',
    name: 'Art House',
    subGenres: [
      { id: 'GNR-21f22cd4-37c7-2eb3-ecfe-cf307efd', name: 'Experimental' },
      { id: 'GNR-5a30431e-cc05-70d2-ee2d-6b8fdd9f', name: 'Indie Drama' },
      { id: 'GNR-81258a19-2163-d5db-eed8-9ffee5ef', name: 'Art House' }
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
  'Legacy Sequel': ['Action', 'Sci-Fi', 'Horror', 'Comedy', 'Drama'],
  // 🌌 The Universe Builder: Live-Action Remakes lean more into pure Action and Drama to justify the medium shift.
  'Live-Action Remake': ['Animation', 'Fantasy', 'Family', 'Musical', 'Action', 'Drama'],
  'Video Game Adaptation': ['Action', 'Sci-Fi', 'Fantasy', 'Animation', 'Horror', 'IP Mashup'],
  'Space Opera': ['Sci-Fi', 'Action', 'Fantasy', 'Multiverse'],
  'Cyberpunk': ['Sci-Fi', 'Action', 'Thriller', 'Crime'],
  // 🌌 The Universe Builder: Added specific subgenre crossover pools for massive event mapping.
  'Psychological Thriller': ['Horror', 'Thriller', 'Drama', 'Crime', 'Elevated Horror'],
  'True Crime': ['Documentary', 'Drama', 'Thriller', 'Crime'],
  'Docuseries': ['Documentary', 'Unscripted', 'True Crime'],
  // 🌌 The Universe Builder: Modern trends crossover affinities.
  'Anime': ['Sci-Fi', 'Fantasy', 'Action', 'Video Game Adaptation', 'IP Mashup'],
  'Adult Animation': ['Comedy', 'Sci-Fi', 'Action', 'IP Mashup'],
  'Reality Competition': ['Unscripted', 'Docuseries']
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
  'Legacy Sequel': 0.45, // 🌌 The Universe Builder: Nostalgia can wear thin if overused
  'Live-Action Remake': 0.85, // 🌌 The Universe Builder: High fatigue for lazy cash grabs
  'Video Game Adaptation': 0.60,
  'Space Opera': 0.65,
  'Cyberpunk': 0.55,
  // 🌌 The Universe Builder: Added true crime and docuseries fatigue risks.
  'Psychological Thriller': 0.35,
  'True Crime': 0.60,
  'Docuseries': 0.20,
  // 🌌 The Universe Builder: Modern trends fatigue risks.
  'Anime': 0.10, // very low fatigue due to dedicated fanbase
  'Adult Animation': 0.15,
  'Reality Competition': 0.55, // burns out fast
};
