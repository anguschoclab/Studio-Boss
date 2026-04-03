import { Talent, TalentRole, Family } from '../../types/talent.types';
import { generateDemographics } from './demographicsGenerator';
import { generatePsychology } from './psychologyGenerator';
import { generateDemographicName } from '../names';
import { RandomGenerator } from '../../utils/rng';

const TALENT_QUIRKS = [
  'Refuses to do press',
  'Brings their own script doctor',
  'Demands daily fresh sushi',
  'Will only work with auteur directors',
  'Refuses to shoot on digital',
  'Requires a private jet for all travel',
  'Notorious for throwing phones at PAs',
  'Demands final cut approval',
  'Mandates an astrologer on set',
  'Refuses to leave their trailer',
  'Requires an entourage of 20 people',
  'Demands their dog gets a producer credit',
  'Requires all dialogue to be whispered',
  'Insists on writing their own stunts',
  'Refuses to work past 4 PM',
  'Demands exclusive gym trailer',
  'Requires mandatory daily rewrites',
  'Refuses to work with first-time directors',
  'Forces entire cast to do method acting',
  'Only communicates through their assistant',
  'Demands a guaranteed percentage of merchandising',
  'Refuses to look co-stars in the eye',
  'Requires a dedicated onset therapist',
  'Demands their own dedicated lighting director',
  'Will only eat blue M&Ms',
  'Mandates a full orchestra on set',
  'Refuses to memorize lines, uses an earpiece',
  'Requires a personal psychic reading before every take',
  'Demands a completely closed set with no eye contact',
  'Refuses to shoot in locations under 70 degrees',
  'Requires all their wardrobe to be designer originals'
];

export function generateTalent(rng: RandomGenerator, params: { role: TalentRole; tier: string; localCountry?: string }): Talent {
  const isGlobalSuperstar = params.tier === 'A_LIST' || params.tier === 'S_LIST';
  
  const demographics = generateDemographics(rng, isGlobalSuperstar, params.localCountry);
  const psychology = generatePsychology(rng, params.tier);
  const name = generateDemographicName(demographics.gender, demographics.country, demographics.ethnicity, rng);

  const isNepo = rng.next() < 0.1;
  const nepoBump = isNepo ? 15 : 0;
  const prestige = rng.rangeInt(10, 80) + nepoBump;
  const draw = rng.rangeInt(10, 80) + nepoBump;
  const fee = rng.rangeInt(100000, 5000000) + (isNepo ? 1000000 : 0);

  // Generate random perks
  const perksCount = rng.rangeInt(0, 2);
  const perksPool = [...TALENT_QUIRKS];
  const perks: string[] = [];
  for (let i = 0; i < perksCount; i++) {
    if (perksPool.length > 0) {
      const selected = rng.pick(perksPool);
      perks.push(selected);
      const index = perksPool.indexOf(selected);
      if (index > -1) {
        perksPool.splice(index, 1);
      }
    }
  }

  const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Musical', 'Documentary', 'Western'];

  return {
    id: rng.uuid('talent'),
    name,
    role: params.role,
    roles: [params.role],
    tier: params.tier as import('../../types/talent.types').TalentTier,
    demographics,
    psychology,
    prestige: Math.min(100, prestige),
    fee,
    draw: Math.min(100, draw),
    accessLevel: isNepo ? 'legacy' : 'outsider',
    momentum: 50,
    perks,
    starMeter: Math.floor((prestige * 0.4) + (draw * 0.4) + (prestige * 0.2)),
    bio: `${name} is a ${params.tier} ${params.role}.`,
    motivationProfile: {
        financial: rng.rangeInt(20, 80),
        prestige: rng.rangeInt(20, 80),
        legacy: rng.rangeInt(10, 70),
        aggression: rng.rangeInt(10, 60)
    },
    currentMotivation: 'NONE',
    motivationImpulse: 'NONE',
    commitments: [],
    fatigue: 0,
    preferredGenres: Array.from({ length: rng.rangeInt(1, 3) }, () => rng.pick(GENRES))
  };
}

export function generateFamilies(rng: RandomGenerator, count: number): Family[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: rng.uuid('family'),
    name: `Family ${i}`,
    recognition: rng.rangeInt(0, 100),
    prestigeLegacy: rng.rangeInt(0, 100),
    commercialLegacy: rng.rangeInt(0, 100),
    scandalLegacy: rng.rangeInt(0, 100),
    volatility: rng.rangeInt(0, 100),
    status: 'active'
  }));
}

export function generateTalentPool(
  rng: RandomGenerator,
  count: number, 
  localCountry?: string
): Talent[] {
    const roles: TalentRole[] = ['actor', 'director', 'writer', 'producer'];
    
    return Array.from({ length: count }).map(() => {
        const role = rng.pick(roles);
        const tierRoll = rng.next();
        let tier = 'C_LIST';
        if (tierRoll > 0.98) tier = 'S_LIST';
        else if (tierRoll > 0.90) tier = 'A_LIST';
        else if (tierRoll > 0.70) tier = 'B_LIST';
        else if (tierRoll < 0.20) tier = 'NEWCOMER';

        return generateTalent(rng, { role, tier, localCountry });
    });
}

