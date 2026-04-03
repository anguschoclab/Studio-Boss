import { Talent, TalentRole, Family, TalentTier } from '../../types/talent.types';
import { generateDemographics } from './demographicsGenerator';
import { generatePsychology } from './psychologyGenerator';
import { generateDemographicName } from '../names';
import { RandomGenerator } from '../../utils/rng';

const TALENT_QUIRKS = [
  'method_actor', 'difficult', 'box_office_draw', 'critics_darling', 
  'party_animal', 'professional', 'under_rehab', 'social_media_star',
  'indie_spirit', 'franchise_loyalist', 'secret_addiction', 'hidden_gem'
];

export function generateTalent(rng: RandomGenerator, params: { role: TalentRole; tier: TalentTier; localCountry?: string }): Talent {
  const isGlobalSuperstar = params.tier === 'A_LIST' || params.tier === 'S_LIST';
  
  const demographics = generateDemographics(rng, isGlobalSuperstar, params.localCountry);
  const psychology = generatePsychology(rng, params.tier);
  const name = generateDemographicName(demographics.gender, demographics.country, demographics.ethnicity, rng);

  const isNepo = rng.next() < 0.1;
  const nepoBump = isNepo ? 15 : 0;
  const prestige = rng.rangeInt(10, 80) + nepoBump;
  const draw = rng.rangeInt(10, 80) + nepoBump;
  const fee = rng.rangeInt(100_000, 5_000_000) + (isNepo ? 1_000_000 : 0);

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

  const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Musical', 'Documentary', 'Western', 'Fantasy', 'Adventure'];

  return {
    id: rng.uuid('talent'),
    name,
    role: params.role,
    roles: [params.role],
    tier: params.tier,
    demographics,
    psychology,
    accessLevel: isGlobalSuperstar ? 'legacy' : 'outsider' as any,
    skills: {
      acting: params.role === 'actor' ? rng.rangeInt(40, 95) : rng.rangeInt(10, 40),
      directing: params.role === 'director' ? rng.rangeInt(40, 95) : rng.rangeInt(10, 40),
      writing: params.role === 'writer' ? rng.rangeInt(40, 95) : rng.rangeInt(10, 40),
      stardom: rng.rangeInt(10, 90),
    },
    prestige: Math.max(0, Math.min(100, prestige)),
    draw: Math.max(0, Math.min(100, draw)),
    fee,
    momentum: rng.rangeInt(40, 60),
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
    const tiers: TalentTier[] = ['S_LIST', 'A_LIST', 'B_LIST', 'C_LIST', 'RISING_STAR', 'NEWCOMER'];
    
    return Array.from({ length: count }).map(() => {
        const roleRoll = rng.next();
        let role: TalentRole = 'actor';
        if (roleRoll > 0.50 && roleRoll <= 0.70) role = 'director';
        else if (roleRoll > 0.70 && roleRoll <= 0.90) role = 'writer';
        else if (roleRoll > 0.90) role = 'producer';

        const tierRoll = rng.next();
        let tier: TalentTier = 'C_LIST';
        
        if (tierRoll > 0.985) tier = 'S_LIST';
        else if (tierRoll > 0.92) tier = 'A_LIST';
        else if (tierRoll > 0.75) tier = 'B_LIST';
        else if (tierRoll < 0.15) tier = 'NEWCOMER';
        else if (tierRoll < 0.35) tier = 'RISING_STAR';

        return generateTalent(rng, { role, tier, localCountry });
    });
}
