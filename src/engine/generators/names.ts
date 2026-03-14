import { pick } from '../utils';
import { ProjectFormat } from '../types';

const PREFIXES = [
  'Apex', 'Summit', 'Horizon', 'Pinnacle', 'Sterling', 'Monarch',
  'Titan', 'Obsidian', 'Crimson', 'Golden', 'Silver', 'Pacific',
  'Atlantic', 'Zenith', 'Vanguard', 'Eclipse', 'Meridian', 'Solaris',
  'Nebula', 'Infinity', 'Starlight', 'Galactic', 'Universal', 'Global',
  'Paramount', 'Supreme', 'Grand', 'Royal', 'Imperial', 'Majestic',
  'Crown', 'Diamond', 'Platinum', 'Neon', 'Velvet', 'Midnight',
  'Onyx', 'Ivory', 'Crystal', 'Sapphire', 'Emerald', 'Ruby',
  'Cobalt', 'Indigo', 'Violet', 'Scarlet', 'Amber', 'Topaz'
];

const SUFFIXES = [
  'Pictures', 'Studios', 'Entertainment', 'Films', 'Media', 'Productions',
  'Cinema', 'Motion Pictures', 'Network', 'Broadcasting', 'Vision', 'Works',
  'Arts', 'Interactive', 'Digital', 'Creative', 'Features', 'Releasing'
];

const MOTTOS = [
  'Where stories come alive',
  'Entertainment without limits',
  'The future of cinema',
  'Bold stories, bigger audiences',
  'Defining the culture',
  'Every frame matters',
  'Dream factory',
  'Stories that move the world',
  'Inspiring the imagination',
  'Creating the extraordinary',
  'Beyond the screen',
  'Magic in every moment',
  'Your ticket to adventure',
  'Unleashing creativity',
  'The art of storytelling',
  'Cinematic perfection',
  'Bringing visions to life',
  'Worlds without end'
];

const MALE_FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
  'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian',
  'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott',
  'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Frank', 'Alexander', 'Raymond',
  'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam', 'Henry',
  'Nathan', 'Douglas', 'Zachary', 'Peter', 'Kyle', 'Walter', 'Ethan', 'Jeremy',
  'Harold', 'Keith', 'Christian', 'Roger', 'Noah', 'Gerald', 'Carl', 'Terry',
  'Sean', 'Austin', 'Arthur', 'Lawrence', 'Jesse', 'Dylan', 'Bryan', 'Joe',
  'Jordan', 'Billy', 'Bruce', 'Albert', 'Willie', 'Gabriel', 'Logan', 'Alan',
  'Juan', 'Wayne', 'Ralph', 'Roy', 'Eugene', 'Randy', 'Vincent', 'Russell',
  'Louis', 'Philip', 'Bobby', 'Johnny', 'Bradley'
];

const FEMALE_FIRST_NAMES = [
  'Mary', 'Patricia', 'Linda', 'Barbara', 'Elizabeth', 'Jennifer', 'Maria', 'Susan',
  'Margaret', 'Dorothy', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen', 'Sandra',
  'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura', 'Sarah', 'Kimberly',
  'Deborah', 'Jessica', 'Shirley', 'Cynthia', 'Angela', 'Melissa', 'Brenda', 'Amy',
  'Anna', 'Rebecca', 'Virginia', 'Kathleen', 'Pamela', 'Martha', 'Debra', 'Amanda',
  'Stephanie', 'Carolyn', 'Christine', 'Marie', 'Janet', 'Catherine', 'Frances',
  'Ann', 'Joyce', 'Diane', 'Alice', 'Julie', 'Heather', 'Teresa', 'Doris', 'Gloria',
  'Evelyn', 'Jean', 'Cheryl', 'Mildred', 'Katherine', 'Joan', 'Ashley', 'Judith',
  'Rose', 'Janice', 'Kelly', 'Nicole', 'Judy', 'Christina', 'Kathy', 'Theresa',
  'Beverly', 'Denise', 'Tammy', 'Irene', 'Jane', 'Lori', 'Rachel', 'Marilyn',
  'Andrea', 'Kathryn', 'Louise', 'Sara', 'Anne', 'Jacqueline', 'Wanda', 'Bonnie',
  'Julia', 'Ruby', 'Lois', 'Tina', 'Phyllis', 'Norma', 'Paula', 'Diana', 'Annie',
  'Lillian', 'Emily', 'Robin'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson',
  'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz',
  'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long',
  'Ross', 'Foster', 'Jimenez'
];

// Dictionaries by Genre
const DICTIONARIES: Record<string, { nouns: string[], adjs: string[] }> = {
  'Action': {
    nouns: ['Vengeance', 'Protocol', 'Strike', 'Force', 'Bullet', 'Assassin', 'Mercenary', 'Mission', 'Target', 'Rogue', 'Agent', 'Sniper', 'Vendetta', 'Cartel', 'Reckoning', 'Escape', 'Heist', 'Pursuit', 'Squad', 'Fist'],
    adjs: ['Lethal', 'Deadly', 'Blind', 'Rogue', 'Final', 'Relentless', 'Silent', 'Hostile', 'Covert', 'Extreme', 'Tactical', 'Ruthless', 'Explosive', 'Unstoppable', 'Furious', 'Savage', 'Brutal']
  },
  'Comedy': {
    nouns: ['Weekend', 'Trip', 'Boss', 'Neighbors', 'Party', 'Wedding', 'Hangover', 'Mistake', 'Disaster', 'Fool', 'Family', 'Date', 'Road', 'Vacation', 'Mix-up', 'Camp', 'School', 'College', 'Misfits', 'Idiots'],
    adjs: ['Crazy', 'Bad', 'Awkward', 'Wild', 'Stupid', 'Dumb', 'Messy', 'Clumsy', 'Hilarious', 'Unlucky', 'Fake', 'Worst', 'Accidental', 'Unexpected', 'Secret', 'Embarrassing']
  },
  'Drama': {
    nouns: ['Tears', 'Silence', 'Promise', 'Secret', 'Shadow', 'Past', 'Letter', 'Journey', 'Heart', 'Sorrow', 'Truth', 'Lie', 'Winter', 'Summer', 'River', 'Road', 'House', 'Family', 'Son', 'Daughter', 'Wife', 'Husband', 'Memory', 'Sins'],
    adjs: ['Broken', 'Hidden', 'Fading', 'Lost', 'Quiet', 'Dark', 'Cold', 'Bitter', 'Tender', 'Forgiven', 'Forgotten', 'Silent', 'Distant', 'Empty', 'Shattered', 'Blind']
  },
  'Horror': {
    nouns: ['Demon', 'Ghost', 'House', 'Woods', 'Cabin', 'Night', 'Curse', 'Entity', 'Devil', 'Spirits', 'Shadows', 'Darkness', 'Blood', 'Scream', 'Fear', 'Nightmare', 'Mirror', 'Doll', 'Asylum', 'Graveyard'],
    adjs: ['Haunted', 'Cursed', 'Possessed', 'Demonic', 'Evil', 'Creepy', 'Sinister', 'Dead', 'Undead', 'Macabre', 'Bloody', 'Terrifying', 'Wicked', 'Twisted', 'Unholy']
  },
  'Sci-Fi': {
    nouns: ['Planet', 'Star', 'Galaxy', 'Alien', 'Space', 'Future', 'Ship', 'Void', 'Dimension', 'Colony', 'Matrix', 'Cyborg', 'Robot', 'Nexus', 'Anomaly', 'Singularity', 'Orbit', 'System', 'Engine', 'Clone'],
    adjs: ['Galactic', 'Cosmic', 'Quantum', 'Cyber', 'Neon', 'Infinite', 'Parallel', 'Unknown', 'Alien', 'Virtual', 'Solar', 'Lunar', 'Stellar', 'Digital', 'Synthetic']
  },
  'Thriller': {
    nouns: ['Suspect', 'Clue', 'Murder', 'Witness', 'Motive', 'Secret', 'Deception', 'Web', 'Trap', 'Game', 'Conspiracy', 'Plot', 'Alibi', 'Lies', 'Truth', 'Stalker', 'Stranger', 'Window', 'Room', 'Identity'],
    adjs: ['Fatal', 'Guilty', 'Innocent', 'Twisted', 'Deceptive', 'Hidden', 'Missing', 'Buried', 'Dark', 'Blind', 'Dangerous', 'Obsessive', 'Paranoid', 'Suspicious', 'Cold']
  },
  'Romance': {
    nouns: ['Love', 'Heart', 'Kiss', 'Embrace', 'Sunset', 'Rain', 'Stars', 'Letters', 'Vows', 'Desire', 'Passion', 'Romance', 'Soulmate', 'Destiny', 'Spark', 'Flame', 'Valentine', 'Rose', 'Autumn', 'Spring'],
    adjs: ['Sweet', 'Endless', 'True', 'First', 'Last', 'Secret', 'Forbidden', 'Passionate', 'Crazy', 'Perfect', 'Beautiful', 'Tender', 'Romantic', 'Wild', 'Unexpected']
  },
  'Animation': {
    nouns: ['Pets', 'Toys', 'Bugs', 'Monsters', 'Magic', 'Adventure', 'Quest', 'Kingdom', 'Friends', 'Tale', 'Legend', 'Beasts', 'Dragons', 'Heroes', 'Critters', 'Machines', 'Dreams', 'Wonders', 'Island', 'Journey'],
    adjs: ['Magical', 'Incredible', 'Amazing', 'Secret', 'Lost', 'Brave', 'Little', 'Giant', 'Tiny', 'Super', 'Happy', 'Flying', 'Talking', 'Wonderful', 'Fantastic']
  },
  'Documentary': {
    nouns: ['Truth', 'Story', 'Life', 'World', 'Planet', 'History', 'Nature', 'Crime', 'Mystery', 'Secret', 'Rise', 'Fall', 'Behind', 'Inside', 'Mind', 'Earth', 'Ocean', 'Wild', 'People', 'Voices'],
    adjs: ['Untold', 'Hidden', 'Real', 'True', 'Secret', 'Dark', 'Ancient', 'Modern', 'Wild', 'Lost', 'Forgotten', 'Invisible', 'Unseen', 'Inside', 'Making']
  },
  'Fantasy': {
    nouns: ['Dragon', 'Sword', 'King', 'Queen', 'Kingdom', 'Magic', 'Spell', 'Curse', 'Prophecy', 'Realm', 'Crown', 'Throne', 'Elf', 'Wizard', 'Shadow', 'Light', 'Ring', 'Stone', 'Chronicles', 'Tale'],
    adjs: ['Ancient', 'Magical', 'Cursed', 'Hidden', 'Lost', 'Dark', 'Epic', 'Mystic', 'Crystal', 'Golden', 'Silver', 'Shadow', 'Blood', 'Iron', 'Fire']
  },
  'Crime': {
    nouns: ['Mob', 'Mafia', 'Gang', 'Heist', 'Bank', 'City', 'Streets', 'Detective', 'Cop', 'Robbery', 'Cartel', 'Underworld', 'Syndicate', 'Job', 'Score', 'Deal', 'Hustle', 'Cash', 'Gun', 'Law'],
    adjs: ['Corrupt', 'Dirty', 'Crooked', 'Bad', 'Ruthless', 'Violent', 'Bloody', 'Underground', 'Guilty', 'Cold', 'Hard', 'Blind', 'Fatal', 'Deadly', 'Broken']
  },
  'Musical': {
    nouns: ['Song', 'Dance', 'Rhythm', 'Beat', 'Melody', 'Stage', 'Lights', 'Chorus', 'Voice', 'Music', 'Harmony', 'Band', 'Singer', 'Star', 'Dream', 'Show', 'Broadway', 'Street', 'Sound', 'Heart'],
    adjs: ['Singing', 'Dancing', 'Loud', 'Sweet', 'Golden', 'Star', 'Neon', 'Bright', 'Magic', 'Rhythmic', 'Harmonic', 'Electric', 'Acoustic', 'Vocal', 'Grand']
  }
};

const PREFIX_PATTERNS = [
  'The', 'A', 'Return of the', 'Rise of the', 'Fall of the', 'Revenge of the', 'Curse of the', 'Secret of the', 'Legend of the', 'Tale of the'
];

const CONNECTORS = [
  'and the', 'in the', 'of the', 'from the', 'without', 'vs', 'meets'
];

const LOCATIONS = [
  'New York', 'Los Angeles', 'London', 'Paris', 'Tokyo', 'Vegas', 'Miami', 'Chicago', 'Texas', 'Hollywood', 'Space', 'Mars', 'Earth', 'Hell', 'Heaven', 'Island', 'Mountain', 'River', 'City', 'Town'
];

export function generateStudioName(existing: string[]): string {
  const existingSet = new Set(existing);
  let name: string;
  let attempts = 0;
  do {
    name = `${pick(PREFIXES)} ${pick(SUFFIXES)}`;
    attempts++;
  } while (existingSet.has(name) && attempts < 50);
  return name;
}

export function generateMotto(): string {
  return pick(MOTTOS);
}

export function generateActorName(): string {
  return `${pick(MALE_FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export function generateActressName(): string {
  return `${pick(FEMALE_FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export function generateProjectName(format: ProjectFormat, genre: string): string {
  const dict = DICTIONARIES[genre] || DICTIONARIES['Drama']; // Fallback to Drama

  if (format === 'tv') {
    const tvPatterns = [
      () => `${pick(dict.adjs)} ${pick(dict.nouns)}s`,
      () => `The ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)} ${pick(LOCATIONS)}`,
      () => `${pick(dict.nouns)} and ${pick(dict.nouns)}`,
      () => `${pick(LOCATIONS)} ${pick(dict.nouns)}s`,
      () => `Project: ${pick(dict.nouns)}`,
      () => `${pick(dict.adjs)}`,
    ];
    return pick(tvPatterns)();
  } else {
    // Film
    const filmPatterns = [
      () => `The ${pick(dict.adjs)} ${pick(dict.nouns)}`,
      () => `${pick(PREFIX_PATTERNS)} ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)} of ${pick(LOCATIONS)}`,
      () => `${pick(dict.adjs)} ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)} ${pick(CONNECTORS)} ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)}`,
      () => `The ${pick(dict.nouns)} ${pick(dict.nouns)}`,
    ];
    return pick(filmPatterns)();
  }
}
