import { TalentPsychology } from '../../types/talent.types';

export function generatePsychology(tier: string): TalentPsychology {
  const isGlobalSuperstar = tier === 'A-List' || tier === 'S-List';
  const egoBase = isGlobalSuperstar ? 50 : 10;
  
  return {
    ego: Math.min(100, egoBase + Math.floor(Math.random() * 50)),
    mood: 50 + Math.floor(Math.random() * 50),
    scandalRisk: Math.floor(Math.random() * 100),
    synergyAffinities: [],
    synergyConflicts: [],
  };
}
