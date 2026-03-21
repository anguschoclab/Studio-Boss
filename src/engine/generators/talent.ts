import { TalentProfile, Family, AccessLevel, TalentRole, Agent, Agency } from '../types';
import { pick, randRange } from '../utils';
import { LAST_NAMES } from './names';

const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Oliver',
  'Mia', 'Benjamin', 'Elijah', 'Lucas', 'Mason', 'Logan', 'Alexander', 'Ethan', 'Jacob', 'Michael',
  'Daniel', 'Henry', 'Jackson', 'Sebastian', 'Aiden', 'Matthew', 'Samuel', 'David', 'Joseph', 'Carter',
  'Owen', 'Wyatt', 'John', 'Jack', 'Luke', 'Jayden', 'Dylan', 'Grayson', 'Levi', 'Isaac',
  'Gabriel', 'Julian', 'Mateo', 'Anthony', 'Jaxon', 'Lincoln', 'Joshua', 'Christopher', 'Andrew', 'Theodore'
];

const FAMOUS_LAST_NAMES = [
  'Coppola', 'Barrymore', 'Fonda', 'Huston', 'Sheen', 'Baldwin', 'Sutherland', 'Bridges', 'Redgrave', 'Skarsgård',
  'Gyllenhaal', 'Arquette', 'Cusack', 'Douglas', 'Howard', 'Reiner', 'Wayans', 'Roberts', 'Eastwood', 'Smith'
];

const TEMPERAMENTS = ['Professional', 'Diva', 'Method', 'Collaborative', 'Volatile', 'Perfectionist', 'Reliable', 'Difficult', 'Refuses to do press', 'Brings their own script doctor', 'Refuses to do rewrites'];

const TALENT_TYPES: Array<TalentRole> = ['director', 'actor', 'writer', 'producer', 'showrunner'];

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

export function generateTalentPool(size: number, families: Family[], agents: Agent[], agencies: Agency[]): TalentProfile[] {
  const pool: TalentProfile[] = [];

  for (let i = 0; i < size; i++) {
    const isNepo = Math.random() < 0.2 && families.length > 0; // 20% chance to be from a family
    let familyId: string | undefined = undefined;
    let lastName: string;
    let accessLevel: AccessLevel;

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
    const primaryRole = pick(TALENT_TYPES);
    const roles: TalentRole[] = [primaryRole];

    // Add secondary roles for multi-hyphenates (20% chance)
    if (Math.random() < 0.2) {
      if (primaryRole === 'actor') roles.push('producer');
      else if (primaryRole === 'writer') roles.push(pick(['director', 'producer', 'showrunner']));
      else if (primaryRole === 'director') roles.push('producer');
      else if (primaryRole === 'showrunner') roles.push('writer');
    }

    // Deduplicate
    const uniqueRoles = Array.from(new Set(roles));

    // Nepo babies get a slight bump in starting draw/prestige, but might have higher fee or volatility
    const nepoBump = isNepo ? 10 : 0;
    const prestige = Math.floor(randRange(10, 80)) + nepoBump;
    const draw = Math.floor(randRange(10, 80)) + nepoBump;
    const fee = Math.floor(randRange(100000, 5000000)) + (isNepo ? 500000 : 0);

    // Assign Representation
    let assignedAgentId: string | undefined = undefined;
    let assignedAgencyId: string | undefined = undefined;

    const agencyMap = new Map(agencies.map(ag => [ag.id, ag]));

    if (agents.length > 0 && Math.random() < 0.8) { // 80% have representation
      // Powerhouses take top talent
      const targetAgent = agents.find(a => {
         const agency = a.agencyId ? agencyMap.get(a.agencyId) : undefined;
         if (agency?.tier === 'powerhouse') return prestige > 70;
         if (agency?.tier === 'major') return prestige > 50;
         return true; // boutique/mid-tier take anyone
      }) || pick(agents);

      assignedAgentId = targetAgent.id;
      assignedAgencyId = targetAgent.agencyId;
    }

    let temperament = pick(TEMPERAMENTS);
    if (isNepo && Math.random() < 0.3) {
      temperament = pick(['Diva', 'Volatile', 'Difficult', 'Refuses to do press', 'Brings their own script doctor']);
    }

    // Convert new temperaments into a perks/quirks system visually
    const perks: string[] = [];
    if (temperament === 'Refuses to do press' || temperament === 'Brings their own script doctor' || temperament === 'Refuses to do rewrites') {
      perks.push(temperament);
      // Keep a valid legacy temperament for the UI fallback
      temperament = pick(['Diva', 'Volatile', 'Difficult', 'Method']);
    }

    pool.push({
      id: `talent-${crypto.randomUUID()}`,
      name: `${firstName} ${lastName}`,
      roles: uniqueRoles,
      agencyId: assignedAgencyId,
      agentId: assignedAgentId,
      prestige: Math.min(100, prestige),
      fee,
      draw: Math.min(100, draw),
      temperament,
      familyId,
      accessLevel,
      perks
    });
  }

  return pool;
}
