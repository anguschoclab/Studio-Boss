import { TalentPsychology } from '../../types/talent.types';
import { rand } from '../../utils';

export function psychologyGenerator(tier: string): TalentPsychology {
  const isGlobalSuperstar = tier === 'A_LIST';
  const egoBase = isGlobalSuperstar ? 50 : 10;
  
  return {
    ego: Math.min(100, egoBase + Math.floor(rand() * 50)),
    mood: 50 + Math.floor(rand() * 50),
    scandalRisk: Math.floor(rand() * 100),
    synergyAffinities: [],
    synergyConflicts: [],
  };
}
