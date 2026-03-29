import { GameState, ArchetypeKey, RivalStudio, GenreTrend } from '@/engine/types';
import { ALL_GENRES, initializeTrends } from '../systems/trends';
import { ARCHETYPES } from '../data/archetypes';
import { generateStudioName, generateMotto } from '../generators/names';
import { generateFamilies, generateTalentPool } from '../generators/talent';
import { generateAgencies, generateAgents } from '../generators/agencies';
import { pick, randRange, secureRandom } from '../utils';
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
      strength: 40 + Math.floor(secureRandom() * 40),
      cash: rArchData.startingCash * randRange(0.5, 1.2),
      prestige: rArchData.startingPrestige + Math.floor(randRange(-10, 10)),
      recentActivity: 'Setting up operations for the new season',
      projectCount: 2 + Math.floor(secureRandom() * 5),
    };
  });

  const agencies = generateAgencies(5);
  const agents = generateAgents(agencies, 4);
  const families = generateFamilies(5);
  const talentPool = generateTalentPool(50, families, agents, agencies);
  const initialTrends = initializeTrends();
  const genrePopularity: Record<string, number> = {};
  ALL_GENRES.forEach(g => {
    const trend = initialTrends.find(t => t.genre === g);
    genrePopularity[g.toLowerCase()] = trend ? trend.heat / 100 : 0.2 + secureRandom() * 0.3;
  });

  return {
    week: 1,
    cash: arch.startingCash,
    studio: {
      name: studioName,
      archetype,
      prestige: arch.startingPrestige,
      internal: {
        projects: [],
        contracts: [],
        financeHistory: [{ week: 1, cash: arch.startingCash, revenue: 0, costs: 0 }],
      }
    },
    market: {
      opportunities: Array.from({ length: 4 }, () => generateOpportunity(talentPool.map(t => t.id))),
      buyers: [
        { id: 'b1', name: 'Global Network', archetype: 'network' as const },
        { id: 'b2', name: 'Prestige TV', archetype: 'premium' as const },
        { id: 'b3', name: 'StreamMax', archetype: 'streamer' as const }
      ],
    },
    industry: {
      rivals,
      headlines: [
        {
          id: 'h-init',
          text: `${studioName} launches operations — the industry takes notice.`,
          week: 1,
          category: 'general' as const,
        },
      ],
      families,
      agencies,
      agents,
      talentPool,
      awards: [],
      newsHistory: [],
    },
    // UI Data Vis Extensions (Epic 4)
    culture: {
      genrePopularity,
    },
    finance: {
      bankBalance: arch.startingCash,
      yearToDateRevenue: 0,
      yearToDateExpenses: 0,
    },
    history: [],
  };
}
