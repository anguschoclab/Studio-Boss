import { TalentProfile, Family, AccessLevel } from '../types';
import { pick, randRange } from '../utils';

const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Oliver',
  'Mia', 'Benjamin', 'Elijah', 'Lucas', 'Mason', 'Logan', 'Alexander', 'Ethan', 'Jacob', 'Michael',
  'Daniel', 'Henry', 'Jackson', 'Sebastian', 'Aiden', 'Matthew', 'Samuel', 'David', 'Joseph', 'Carter',
  'Owen', 'Wyatt', 'John', 'Jack', 'Luke', 'Jayden', 'Dylan', 'Grayson', 'Levi', 'Isaac',
  'Gabriel', 'Julian', 'Mateo', 'Anthony', 'Jaxon', 'Lincoln', 'Joshua', 'Christopher', 'Andrew', 'Theodore'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const FAMOUS_LAST_NAMES = [
  'Coppola', 'Barrymore', 'Fonda', 'Huston', 'Sheen', 'Baldwin', 'Sutherland', 'Bridges', 'Redgrave', 'Skarsgård',
  'Gyllenhaal', 'Arquette', 'Cusack', 'Douglas', 'Howard', 'Reiner', 'Wayans', 'Roberts', 'Eastwood', 'Smith'
];

const TEMPERAMENTS = ['Professional', 'Diva', 'Method', 'Collaborative', 'Volatile', 'Perfectionist', 'Reliable', 'Difficult'];

const TALENT_TYPES: Array<'director' | 'actor' | 'writer' | 'producer'> = ['director', 'actor', 'writer', 'producer'];

export function generateFamilies(count: number): Family[] {
  const families: Family[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name = pick(FAMOUS_LAST_NAMES);
    let attempts = 0;
    while (usedNames.has(name) && attempts < 10) {
      name = pick(LAST_NAMES); // Fallback to normal names if famous ones run out
      attempts++;
    }
    usedNames.add(name);

    families.push({
      id: `fam-${crypto.randomUUID()}`,
      name,
      recognition: Math.floor(randRange(40, 100)),
      prestigeLegacy: Math.floor(randRange(20, 100)),
      commercialLegacy: Math.floor(randRange(20, 100)),
      scandalLegacy: Math.floor(randRange(0, 80)),
      volatility: Math.floor(randRange(10, 90)),
      status: pick(['respected', 'chaotic', 'overexposed', 'revived', 'faded', 'rising'])
    });
  }

  return families;
}

export function generateTalentPool(size: number, families: Family[]): TalentProfile[] {
  const pool: TalentProfile[] = [];

  for (let i = 0; i < size; i++) {
    const isNepo = Math.random() < 0.2 && families.length > 0; // 20% chance to be from a family
    let familyId: string | undefined = undefined;
    let lastName: string;
    let accessLevel: AccessLevel = 'outsider';

    if (isNepo) {
      const family = pick(families);
      familyId = family.id;
      lastName = family.name;

      if (family.recognition > 80) accessLevel = 'dynasty';
      else if (family.recognition > 50) accessLevel = 'legacy';
      else if (family.status === 'faded') accessLevel = 'comeback';
      else accessLevel = 'soft-access';
    } else {
      lastName = pick(LAST_NAMES);
      accessLevel = Math.random() < 0.1 ? 'soft-access' : 'outsider'; // Rare soft-access for non-family
    }

    const firstName = pick(FIRST_NAMES);
    const type = pick(TALENT_TYPES);

    // Nepo babies get a slight bump in starting draw/prestige, but might have higher fee or volatility
    const nepoBump = isNepo ? 10 : 0;
    const prestige = Math.floor(randRange(10, 80)) + nepoBump;
    const draw = Math.floor(randRange(10, 80)) + nepoBump;
    const fee = Math.floor(randRange(100000, 5000000)) + (isNepo ? 500000 : 0);

    let temperament = pick(TEMPERAMENTS);
    if (isNepo && Math.random() < 0.3) {
      temperament = pick(['Diva', 'Volatile', 'Difficult']);
    }

    pool.push({
      id: `talent-${crypto.randomUUID()}`,
      name: `${firstName} ${lastName}`,
      type,
      prestige: Math.min(100, prestige),
      fee,
      draw: Math.min(100, draw),
      temperament,
      familyId,
      accessLevel
    });
  }

  return pool;
}
