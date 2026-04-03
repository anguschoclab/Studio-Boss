import { TalentPsychology } from '../../types/talent.types';
import { RandomGenerator } from '../../utils/rng';

export function generatePsychology(rng: RandomGenerator, tier: string): TalentPsychology {
  const isGlobalSuperstar = tier === 'A-List' || tier === 'S-List';
  const egoBase = isGlobalSuperstar ? 50 : 10;
  
  return {
    ego: Math.min(100, egoBase + ((rng && rng.rangeInt) ? rng.rangeInt.bind(rng) : (min, max) => Math.floor(Math.random() * (max - min + 1)) + min)(0, 50)),
    mood: ((rng && rng.rangeInt) ? rng.rangeInt.bind(rng) : (min, max) => Math.floor(Math.random() * (max - min + 1)) + min)(50, 100),
    scandalRisk: ((rng && rng.rangeInt) ? rng.rangeInt.bind(rng) : (min, max) => Math.floor(Math.random() * (max - min + 1)) + min)(0, 100),
    synergyAffinities: [],
    synergyConflicts: [],
  };
}

