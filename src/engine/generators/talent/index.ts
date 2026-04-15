import { Talent, TalentRole, Family, TalentTier, DirectorArchetype } from '../../types/talent.types';
import { generateDemographics } from './demographicsGenerator';
import { generatePsychology } from './psychologyGenerator';
import { generateDemographicName } from '../names';
import { RandomGenerator } from '../../utils/rng';
import { generateArchetypeForRole, generatePersonalityTrait, generateCareerTrajectory } from '../../data/talentArchetypes';
import { applyComfortLevelToTalent } from '../../systems/talent/CastingConstraintSystem';

const TALENT_QUIRKS = [
  'method_actor', 'difficult', 'box_office_draw', 'critics_darling', 
  'party_animal', 'professional', 'under_rehab', 'social_media_star',
  'indie_spirit', 'franchise_loyalist', 'secret_addiction', 'hidden_gem'
];

export function generateTalent(rng: RandomGenerator, params: { role: TalentRole; tier: TalentTier; localCountry?: string }): Talent {
  const isGlobalSuperstar = params.tier === 1;
  
  const demographics = generateDemographics(rng, isGlobalSuperstar, params.localCountry);
  const psychology = generatePsychology(rng, params.tier === 1 ? 'S_LIST' : params.tier === 2 ? 'A_LIST' : 'B_LIST'); // Mapping for legacy compat until psychology is updated
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

  // Generate archetypes and personality traits
  const archetype = generateArchetypeForRole(params.role, params.tier, rng);
  const personality = generatePersonalityTrait(rng);
  const careerTrajectory = generateCareerTrajectory(params.tier, rng);

  // Generate comfort levels for casting constraints
  const comfortData = applyComfortLevelToTalent({ personality, prestige, tier: params.tier } as Talent, rng);

  // Set role-specific archetype fields
  let actorArchetype, writerArchetype, producerArchetype, personalityArchetype, directorArchetype;
  
  if (params.role === 'actor') {
    actorArchetype = archetype as any;
  } else if (params.role === 'writer' || params.role === 'showrunner') {
    writerArchetype = archetype as any;
  } else if (params.role === 'producer') {
    producerArchetype = archetype as any;
  } else if (params.role === 'personality') {
    personalityArchetype = archetype as any;
  } else if (params.role === 'director') {
    // Use existing directorArchetype system
    const directorArchetypes: DirectorArchetype[] = ['auteur', 'journeyman', 'visionary', 'commercial_hack'];
    const tierBias = params.tier === 1 ? ['auteur', 'visionary'] : params.tier === 2 ? ['auteur', 'visionary', 'journeyman'] : ['journeyman', 'commercial_hack'];
    const availableArchetypes = directorArchetypes.filter(a => tierBias.includes(a));
    directorArchetype = availableArchetypes[Math.floor(rng.next() * availableArchetypes.length)] || 'journeyman';
  }

  return {
    id: rng.uuid('TAL'),
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
    bio: `${name} is a Tier ${params.tier} ${params.role}.`,
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
    preferredGenres: Array.from({ length: rng.rangeInt(1, 3) }, () => rng.pick(GENRES)),
    // Role-specific archetypes
    actorArchetype,
    writerArchetype,
    producerArchetype,
    personalityArchetype,
    directorArchetype,
    // Universal personality trait
    personality,
    // Career trajectory
    careerTrajectory,
    // Casting constraint comfort levels
    comfortLevel: comfortData.comfortLevel,
    comfortPremiumRates: comfortData.comfortPremiumRates
  };
}

export function generateFamilies(rng: RandomGenerator, count: number): Family[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: rng.uuid('FAM'),
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
    const talent: Talent[] = [];

    // TDD Distribution:
    // 275 Actors (55%)
    // 75 Directors (15%)
    // 60 Writers (12%)
    // 40 Producers (8%)
    // 50 Personalities (10%)
    
    const rolePercentages: { role: TalentRole; pct: number }[] = [
      { role: 'actor', pct: 0.55 },
      { role: 'director', pct: 0.15 },
      { role: 'writer', pct: 0.12 },
      { role: 'producer', pct: 0.08 },
      { role: 'personality', pct: 0.10 },
    ];

    const exact = rolePercentages.map(r => ({ ...r, exact: count * r.pct }));
    const floors = exact.map(r => ({ ...r, n: Math.floor(r.exact), frac: r.exact - Math.floor(r.exact) }));
    const currentSum = floors.reduce((s, r) => s + r.n, 0);
    const remainder = count - currentSum;
    
    // Distribute remainder to roles with largest fractional parts
    floors.sort((a, b) => b.frac - a.frac);
    for (let j = 0; j < remainder; j++) {
      floors[j].n++;
    }

    const roleStats = floors.map(r => ({ role: r.role, count: r.n }));

    roleStats.forEach(stat => {
      for (let i = 0; i < stat.count; i++) {
        const tierRoll = rng.next();
        let tier: TalentTier = 4;
        
        if (tierRoll > 0.95) tier = 1; // 5%
        else if (tierRoll > 0.80) tier = 2; // 15%
        else if (tierRoll > 0.40) tier = 3; // 40%
        else tier = 4; // 40%

        talent.push(generateTalent(rng, { role: stat.role, tier, localCountry }));
      }
    });

    return talent;
}
