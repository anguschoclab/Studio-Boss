import { Talent, TalentRole, Family, Agency, Agent } from '../../types/talent.types';
import { generateDemographics } from './demographicsGenerator';
import { generatePsychology } from './psychologyGenerator';
import { generateDemographicName } from '../names';
import { randRange, secureRandom, pick } from '../../utils';

export function generateTalent(params: { role: TalentRole; tier: string; localCountry?: string }): Talent {
  const isGlobalSuperstar = params.tier === 'A-List' || params.tier === 'S-List';
  
  const demographics = generateDemographics(isGlobalSuperstar, params.localCountry);
  const psychology = generatePsychology(params.tier);
  const name = generateDemographicName(demographics.gender, demographics.country, demographics.ethnicity);

  // Stats Logic (reusing bits from old generator)
  const isNepo = secureRandom() < 0.1; // Reduced for default pool
  const nepoBump = isNepo ? 15 : 0;
  const prestige = Math.floor(randRange(10, 80)) + nepoBump;
  const draw = Math.floor(randRange(10, 80)) + nepoBump;
  const fee = Math.floor(randRange(100000, 5000000)) + (isNepo ? 1000000 : 0);

  return {
    id: `talent-${crypto.randomUUID()}`,
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
    id: `family-${i}`,
    name: `Family ${i}`, // Improved naming in future turns
    recognition: Math.floor(Math.random() * 100),
    prestigeLegacy: Math.floor(Math.random() * 100),
    commercialLegacy: Math.floor(Math.random() * 100),
    scandalLegacy: Math.floor(Math.random() * 100),
    volatility: Math.floor(Math.random() * 100),
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
    const tiers = ['S-List', 'A-List', 'B-List', 'C-List', 'D-List'];
    
    return Array.from({ length: count }).map(() => {
        const role = pick(roles);
        const tierRoll = Math.random();
        let tier = 'C-List';
        if (tierRoll > 0.98) tier = 'S-List';
        else if (tierRoll > 0.90) tier = 'A-List';
        else if (tierRoll > 0.70) tier = 'B-List';
        else if (tierRoll < 0.20) tier = 'D-List';

        return generateTalent({ role, tier, localCountry });
    });
}
