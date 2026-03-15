import { GameState, ArchetypeKey, RivalStudio } from '../types';
import { ARCHETYPES } from '../data/archetypes';
import { generateStudioName, generateMotto } from '../generators/names';
import { generateFamilies, generateTalentPool } from '../generators/talent';
import { pick, randRange } from '../utils';
import { generateOpportunity } from '../generators/opportunities';

export function initializeGame(studioName: string, archetype: ArchetypeKey): GameState {
  const arch = ARCHETYPES[archetype];
  const rivalArchetypes: ArchetypeKey[] = ['major', 'mid-tier', 'indie'];
  const existingNames = [studioName];

  const rivals: RivalStudio[] = Array.from({ length: 4 }, (_, i) => {
    const name = generateStudioName(existingNames);
    existingNames.push(name);
    const rArch = pick(rivalArchetypes);
    const rArchData = ARCHETYPES[rArch];
    return {
      id: `rival-${i}`,
      name,
      motto: generateMotto(),
      archetype: rArch,
      strength: 40 + Math.floor(Math.random() * 40),
      cash: rArchData.startingCash * randRange(0.5, 1.2),
      prestige: rArchData.startingPrestige + Math.floor(randRange(-10, 10)),
      recentActivity: 'Setting up operations for the new season',
      projectCount: 2 + Math.floor(Math.random() * 5),
    };
  });

  const families = generateFamilies(5);
  const talentPool = generateTalentPool(50, families);

  return {
    studio: { name: studioName, archetype, prestige: arch.startingPrestige },
    projects: [],
    rivals,
    headlines: [
      {
        id: 'h-init',
        text: `${studioName} launches operations — the industry takes notice.`,
        week: 1,
        category: 'general',
      },
    ],
    week: 1,
    cash: arch.startingCash,
    financeHistory: [{ week: 1, cash: arch.startingCash, revenue: 0, costs: 0 }],
    families,
    opportunities: Array.from({ length: 4 }, () => generateOpportunity(talentPool.map(t => t.id))),
    talentPool,
    contracts: [],
    awards: [],
  };
}
