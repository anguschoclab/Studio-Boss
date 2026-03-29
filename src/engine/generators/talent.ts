import { TalentProfile, Family, AccessLevel, TalentRole, Agent, Agency } from '@/engine/types';
import { pick, randRange, secureRandom } from '../utils';
import { LAST_NAMES, MALE_FIRST_NAMES, FEMALE_FIRST_NAMES } from './names';

const FAMOUS_LAST_NAMES = [
  'Coppola', 'Barrymore', 'Fonda', 'Huston', 'Sheen', 'Baldwin', 'Sutherland', 'Bridges', 'Redgrave', 'Skarsgård',
  'Gyllenhaal', 'Arquette', 'Cusack', 'Douglas', 'Howard', 'Reiner', 'Wayans', 'Roberts', 'Eastwood', 'Smith'
];

const TEMPERAMENTS = ['Professional', 'Diva', 'Method', 'Collaborative', 'Volatile', 'Perfectionist', 'Reliable', 'Difficult', 'Refuses to do press', 'Brings their own script doctor', 'Refuses to do rewrites', 'Mandatory private jet', 'Demands final cut', 'Always late to set', 'Requires trailer bigger than co-stars', 'Refuses to work with indie studios', 'Demands co-star approval', 'Requires personal onset chef', 'Only shoots in Europe', 'Refuses to do sequels', 'Requires ridiculous VFX double', 'Notorious for walk-outs', 'Refuses to do streaming', 'Brings their own lighting crew', 'Requires daily rewrites', 'Demands top billing', 'Only works with A-List co-stars', 'Requires 20-person entourage', 'Refuses to work past 4 PM', 'Demands exclusive merchandising rights', 'Refuses to promote on social media', 'Only works with their specific DP', 'Requires a personal onset gym', 'Demands guaranteed marketing spend', 'Refuses to work with first-time directors', 'Requires guaranteed sequel clauses', 'Demands creative control over casting', 'Refuses to do table reads', 'Refuses to do chemistry reads', 'Only communicates through manager', 'Demands constant schedule changes', 'Requires excessive vanity credits', 'Threatens to walk over minor slights', 'Only works with their preferred editor'];

export const PERK_TEMPERAMENTS = [
  'Refuses to do press',
  'Brings their own script doctor',
  'Refuses to do rewrites',
  'Mandatory private jet',
  'Demands final cut',
  'Always late to set',
  'Requires trailer bigger than co-stars',
  'Refuses to work with indie studios',
  'Demands co-star approval',
  'Requires personal onset chef',
  'Only shoots in Europe',
  'Refuses to do sequels',
  'Requires ridiculous VFX double',
  'Notorious for walk-outs',
  'Refuses to do streaming',
  'Brings their own lighting crew',
  'Requires daily rewrites',
  'Demands top billing',
  'Only works with A-List co-stars',
  'Requires 20-person entourage',
  'Refuses to work past 4 PM',
  'Demands exclusive merchandising rights',
  'Refuses to promote on social media',
  'Only works with their specific DP',
  'Requires a personal onset gym',
  'Demands guaranteed marketing spend',
  'Refuses to work with first-time directors',
  'Requires guaranteed sequel clauses',
  'Demands creative control over casting',
  'Refuses to do table reads',
  'Refuses to do chemistry reads',
  'Only communicates through manager',
  'Demands constant schedule changes',
  'Requires excessive vanity credits',
  'Threatens to walk over minor slights',
  'Only works with their preferred editor'
];


const TALENT_TYPES: Array<TalentRole> = ['actor', 'director', 'writer', 'producer'];

export function generateFamilies(count: number): Family[] {
  const families: Family[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name = pick(FAMOUS_LAST_NAMES);
    let attempts = 0;
    while (usedNames.has(name) && attempts < 10) {
      name = pick(LAST_NAMES);
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

const TRIVIA_POOL = [
  'Once worked as a waiter before their big break.',
  'Known for performing their own stunts in action sequences.',
  'A classically trained Shakespearean actor.',
  'Broke out in a low-budget indie horror film that became a cult hit.',
  'Fluent in three languages, which helped their international career.',
  'Notorious for never looking at their own dailies.',
  'Almost quit acting before being cast in their most famous role.',
  'Has a side hobby of restoring vintage motorcycles.',
  'Is a second-generation actor, following in their parents footsteps.',
  'Known for their extreme method acting preparations.',
  'Refuses to use social media despite their massive following.',
  'Originally studied to be a marine biologist.',
  'Won a prestigious acting scholarship when they were only sixteen.',
  'Has a collection of over 500 rare first-edition books.',
  'Once spent three months living in a cabin to prepare for a role.',
  'Known for their charitable work in ocean conservation.',
  'Started their career in musical theater on Broadway.',
  'Was discovered while working at a juice bar in West Hollywood.',
  'Has never been seen without their signature sunglasses on set.',
  'Once turned down a lead role in a major superhero franchise.',
  'Is known for writing their own dialogue in several hit films.',
  'Owns a small organic farm in upstate New York.',
  'Practices Transcendental Meditation before every shoot.'
];

const PAST_PROJECT_TITLES = [
  'Midnight in Berlin', 'The Silent Echo', 'Last Train to Nowhere', 'Blue Horizon', 'Neon Nights',
  'Broken Promises', 'The Secret Vault', 'Summer of 84', 'Shadow Protocol', 'Final Vengeance',
  'The Last Samurai', 'Empire of Dust', 'Under a Cold Moon', 'The Glass City', 'Wildfire',
  'Into the Abyss', 'Quantum Leap', 'The Great Escape', 'Lost in Translation', 'American Dream',
  'The Forgotten King', 'Revenge of the Sith', 'Shadows of Rome', 'Terminal Velocity', 'Deep Impact'
];

export function generateTalentPool(size: number, families: Family[], agents: Agent[], agencies: Agency[]): TalentProfile[] {
  const pool: TalentProfile[] = [];

  for (let i = 0; i < size; i++) {
    const isNepo = secureRandom() < 0.2 && families.length > 0;
    const gender = secureRandom() < 0.5 ? 'male' : 'female';
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
      accessLevel = secureRandom() < 0.1 ? 'soft-access' : 'outsider';
    }

    const firstName = gender === 'male' ? pick(MALE_FIRST_NAMES) : pick(FEMALE_FIRST_NAMES);
    const primaryRole = pick(TALENT_TYPES);
    const rolesList: TalentRole[] = [primaryRole];

    if (secureRandom() < 0.2) {
      if (primaryRole === 'actor') rolesList.push('producer');
      else if (primaryRole === 'writer') rolesList.push(pick(['director', 'producer']));
      else if (primaryRole === 'director') rolesList.push('producer');
    }

    const uniqueRoles = Array.from(new Set(rolesList));
    const nepoBump = isNepo ? 10 : 0;
    const prestige = Math.floor(randRange(10, 80)) + nepoBump;
    const draw = Math.floor(randRange(10, 80)) + nepoBump;
    const fee = Math.floor(randRange(100000, 5000000)) + (isNepo ? 500000 : 0);

    let assignedAgentId: string | undefined = undefined;
    let assignedAgencyId: string | undefined = undefined;
    const agencyMap = new Map(agencies.map(ag => [ag.id, ag]));

    if (agents.length > 0 && secureRandom() < 0.8) {
      const targetAgent = agents.find(a => {
         const agency = a.agencyId ? agencyMap.get(a.agencyId) : undefined;
         if (agency?.tier === 'powerhouse') return prestige > 70;
         if (agency?.tier === 'major') return prestige > 50;
         return true;
      }) || pick(agents);
      assignedAgentId = targetAgent.id;
      assignedAgencyId = targetAgent.agencyId;
    }

    let temperament = pick(TEMPERAMENTS);
    if (isNepo && secureRandom() < 0.3) {
      temperament = pick(['Diva', 'Volatile', 'Difficult', 'Refuses to do press', 'Brings their own script doctor', 'Mandatory private jet', 'Demands final cut', 'Always late to set', 'Demands top billing', 'Refuses to do chemistry reads', 'Only communicates through manager', 'Demands constant schedule changes', 'Requires excessive vanity credits']);
    }

    const perks: string[] = [];
    if (PERK_TEMPERAMENTS.includes(temperament)) {
      perks.push(temperament);
      temperament = pick(['Diva', 'Volatile', 'Difficult', 'Method']);
    }

    const age = Math.floor(randRange(18, 75));
    const unscriptedExperience = secureRandom() < 0.2 ? Math.floor(randRange(30, 90)) : 0;
    const showrunningExperience = uniqueRoles.includes('writer') ? Math.floor(randRange(0, 100)) : 0;

    // Generate Filmography & Stats
    const filmographyCount = Math.floor(randRange(2, 6));
    const filmography = Array.from({ length: filmographyCount }).map(() => {
      const type = secureRandom() < 0.3 ? 'tv' : 'movie';
      const gross = type === 'movie' ? randRange(10000000, 500000000) : 0;
      const salary = randRange(50000, fee);
      return {
        title: pick(PAST_PROJECT_TITLES),
        year: 2026 - Math.floor(randRange(1, 10)),
        role: pick(uniqueRoles),
        gross,
        salary,
        type: type as 'movie' | 'tv'
      };
    }).sort((a, b) => b.year - a.year);

    const careerGross = filmography.reduce((sum, f) => sum + f.gross, 0);
    const movieCredits = filmography.filter(f => f.type === 'movie');
    const tvCredits = filmography.filter(f => f.type === 'tv');

    const highestSalaryMovie = movieCredits.length > 0 
      ? movieCredits.reduce((prev, curr) => (curr.salary > prev.salary ? curr : prev), movieCredits[0])
      : undefined;

    const highestSalaryTv = tvCredits.length > 0
      ? tvCredits.reduce((prev, curr) => (curr.salary > prev.salary ? curr : prev), tvCredits[0])
      : undefined;

    const knownFor = filmography
      .slice()
      .sort((a, b) => (b.gross || b.salary) - (a.gross || a.salary))
      .slice(0, 3)
      .map(f => f.title);

    // Star Meter Algorithm: (Prestige * 0.4) + (Draw * 0.4) + (Recent Momentum * 0.2)
    const momentum = prestige; // Placeholder for initial pool, logic updates during week advance
    const starMeter = Math.floor((prestige * 0.4) + (draw * 0.4) + (momentum * 0.2));

    const triviaCount = Math.floor(randRange(1, 4));
    const triviaPool = [...TRIVIA_POOL];
    const trivia: string[] = [];
    for (let j = 0; j < triviaCount; j++) {
      const t = pick(triviaPool);
      trivia.push(t);
      triviaPool.splice(triviaPool.indexOf(t), 1);
    }

    const bio = `${firstName} ${lastName} (${age}) is a ${uniqueRoles.join('-')} known for their ${temperament.toLowerCase()} approach. ${isNepo ? 'Coming from a prominent industry family, they have had a unique vantage point on Hollywood since childhood.' : 'An outsider who worked their way up, they are seen as a rising force in the industry.'} ${unscriptedExperience > 50 ? 'Having started in the unscripted world, they have successfully transitioned into scripted storytelling.' : ''}`;

    pool.push({
      id: `talent-${crypto.randomUUID()}`,
      name: `${firstName} ${lastName}`,
      gender,
      roles: uniqueRoles,
      agencyId: assignedAgencyId,
      agentId: assignedAgentId,
      prestige: Math.min(100, prestige),
      fee,
      draw: Math.min(100, draw),
      temperament,
      familyId,
      accessLevel,
      perks,
      age,
      bio,
      filmography,
      careerGross,
      knownFor,
      starMeter,
      showrunningExperience,
      unscriptedExperience,
      highestSalaryMovie: highestSalaryMovie ? { amount: highestSalaryMovie.salary, project: highestSalaryMovie.title, year: highestSalaryMovie.year } : undefined,
      highestSalaryTv: highestSalaryTv ? { amount: highestSalaryTv.salary, project: highestSalaryTv.title, year: highestSalaryTv.year } : undefined,
      trivia
    });
  }

  return pool;
}
