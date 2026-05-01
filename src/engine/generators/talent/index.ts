import { Talent, TalentRole, Family, Agency, Agent, TalentTier } from '../../types/talent.types';
import { generateDemographics } from './demographicsGenerator';
import { psychologyGenerator } from './psychologyGenerator';
import { generateDemographicName } from '../names';
import { randRange, secureRandom, pick, rand, generateId } from '../../utils';


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
  'Demands exclusive gym trailer'
];

export function generateTalent(params: { role: TalentRole; tier: TalentTier; localCountry?: string }): Talent {

  const isGlobalSuperstar = params.tier === 'A_LIST';
  
  const demographics = generateDemographics(isGlobalSuperstar, params.localCountry);
  const psychology = psychologyGenerator(params.tier);
  const name = generateDemographicName(demographics.gender, demographics.country, demographics.ethnicity);

  // Stats Logic (reusing bits from old generator)
  const isNepo = rand() < 0.1; // Reduced for default pool
  const nepoBump = isNepo ? 15 : 0;
  const prestige = Math.floor(randRange(10, 80)) + nepoBump;
  const draw = Math.floor(randRange(10, 80)) + nepoBump;
  const fee = Math.floor(randRange(100000, 5000000)) + (isNepo ? 1000000 : 0);


  // Generate random perks
  const perksCount = Math.floor(rand() * 3);
  const perksPool = [...TALENT_QUIRKS];
  const perks: string[] = [];
  for (let i = 0; i < perksCount; i++) {
    if (perksPool.length > 0) {
      const selected = pick(perksPool);
      perks.push(selected);
      const index = perksPool.indexOf(selected);
      if (index > -1) {
        perksPool.splice(index, 1);
      }
    }
  }

  return {
    id: generateId('TAL'),
    name,
    role: params.role,
    roles: [params.role],
    tier: params.tier,
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
        financial: Math.floor(randRange(20, 80)),
        prestige: Math.floor(randRange(20, 80)),
        legacy: Math.floor(randRange(10, 70)),
        aggression: Math.floor(randRange(10, 60))
    },
    currentMotivation: 'NONE',
    motivationImpulse: 'NONE'
  };
}

export function generateFamilies(count: number): Family[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: generateId('FAM'),
    name: `Family ${i}`, // Improved naming in future turns
    recognition: Math.floor(rand() * 100),
    prestigeLegacy: Math.floor(rand() * 100),
    commercialLegacy: Math.floor(rand() * 100),
    scandalLegacy: Math.floor(rand() * 100),
    volatility: Math.floor(rand() * 100),
    status: 'active'
  }));
}

export function generateTalentPool(
  count: number, 
  families: Family[] = [], 
  agents: Agent[] = [], 
  agencies: Agency[] = [], 
  localCountry?: string
): Talent[] {
    const roles: TalentRole[] = ['actor', 'director', 'writer', 'producer'];
    
    return Array.from({ length: count }).map(() => {
        const role = pick(roles);
        const tierRoll = rand();
        let tier: TalentTier = 'C_LIST';
        if (tierRoll > 0.98) tier = 'A_LIST'; // Simplified for simulation start
        else if (tierRoll > 0.90) tier = 'A_LIST';
        else if (tierRoll > 0.70) tier = 'B_LIST';
        else if (tierRoll < 0.20) tier = 'NEWCOMER';

        return generateTalent({ role, tier, localCountry });
    });
}
