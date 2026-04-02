import { TalentPsychology } from '../../types/talent.types';
import { RandomGenerator } from '../../utils/rng';

export function generatePsychology(rng: RandomGenerator, tier: string): TalentPsychology {
  const isGlobalSuperstar = tier === 'A-List' || tier === 'S-List';
  const egoBase = isGlobalSuperstar ? 50 : 10;
  
  return {
    ego: Math.min(100, egoBase + rng.rangeInt(0, 50)),
    mood: rng.rangeInt(50, 100),
    scandalRisk: rng.rangeInt(0, 100),
    synergyAffinities: [],
    synergyConflicts: [],
  };
}

