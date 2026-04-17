import { GameState, Talent } from '../../../types';
import { RandomGenerator } from '../../../utils/rng';
import {
  HiddenTalent,
  DiscoveryEvent,
} from '../../../types/discovery.types';

// Hidden talent generation
const HIDDEN_TALENT_POOL_SIZE = 20;
const DISCOVERY_CHANCE = 0.05; // 5% per week per studio

export function generateHiddenTalent(rng: RandomGenerator): HiddenTalent {
  const potential = rng.rangeInt(60, 100);
  const currentSkill = rng.rangeInt(30, potential);
  const age = rng.rangeInt(18, 35);

  return {
    id: rng.uuid('HTL'),
    name: generateHiddenTalentName(rng),
    age,
    potential,
    currentSkill,
    discoveryMethod: rng.pick(['audition', 'recommendation', 'scouting', 'viral_discovery']),
    askingPrice: rng.rangeInt(50000, 200000),
    charisma: rng.rangeInt(40, 95),
    prestige: rng.rangeInt(20, 60),
    draw: rng.rangeInt(30, 70),
    viralChance: rng.next() < 0.1 ? rng.rangeInt(30, 80) : 0,
  };
}

function generateHiddenTalentName(rng: RandomGenerator): string {
  const firstNames = ['Maya', 'River', 'Zion', 'Sage', 'Phoenix', 'Indigo', 'Orion', 'Nova',
                      'Luna', 'Stella', 'Axel', 'Jett', 'Cruz', 'Knox', 'Blake', 'Quinn'];
  const lastNames = ['Chen', 'Patel', 'Kim', 'Sato', 'Okafor', 'Baptiste', 'Andersson',
                     'Leroy', 'Rossi', 'Kowalski', 'Yilmaz', 'Santos', 'Reyes', 'Khan'];

  return `${rng.pick(firstNames)} ${rng.pick(lastNames)}`;
}

export function discoverHiddenTalent(
  hiddenTalent: HiddenTalent,
  studioId: string,
  week: number,
  state: GameState,
  rng: RandomGenerator
): { talent: Talent; event: DiscoveryEvent } {
  // Convert hidden talent to full talent
  const newTalent: Talent = {
    id: hiddenTalent.id,
    name: hiddenTalent.name,
    role: 'actor',
    roles: ['actor'],
    tier: 4, // Start as unknown
    demographics: {
      age: hiddenTalent.age,
      gender: rng.next() < 0.5 ? 'MALE' : 'FEMALE',
      country: rng.pick(['USA', 'UK', 'Canada', 'Australia', 'Other']),
      ethnicity: 'varied',
    },
    accessLevel: 'outsider',
    momentum: 50,
    skills: {
      acting: hiddenTalent.currentSkill,
      directing: rng.rangeInt(20, 50),
      writing: rng.rangeInt(20, 50),
      stardom: hiddenTalent.charisma,
    },
    prestige: hiddenTalent.prestige,
    starMeter: rng.rangeInt(15, 35), // Unknown
    draw: hiddenTalent.draw,
    fee: hiddenTalent.askingPrice,
    commitments: [],
    fatigue: 0,
    preferredGenres: [],
    psychology: {
      ego: rng.rangeInt(30, 70),
      mood: rng.rangeInt(40, 80),
      scandalRisk: rng.rangeInt(20, 60),
      synergyAffinities: [],
      synergyConflicts: [],
    },
    personality: rng.pick(['charismatic', 'collaborative', 'difficult', 'perfectionist']),
    actorArchetype: rng.pick(['movie_star', 'prestige_actor', 'tv_star', 'character_actor']),
  };

  const event: DiscoveryEvent = {
    week,
    talentId: newTalent.id,
    method: hiddenTalent.discoveryMethod,
    studioId,
  };

  return { talent: newTalent, event };
}
