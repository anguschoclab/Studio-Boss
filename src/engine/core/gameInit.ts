import { GameState, ArchetypeKey, RivalStudio, Buyer } from '../types';
import { ARCHETYPES } from '../data/archetypes';
import { generateStudioName, generateMotto } from '../generators/names';
import { pick, randRange } from '../utils';

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

  const initialBuyers: Buyer[] = [
    { id: 'b-net-1', name: 'Globe Broadcasting', archetype: 'network', currentMandate: { type: 'broad_appeal', activeUntilWeek: 24 } },
    { id: 'b-net-2', name: 'National Television', archetype: 'network', currentMandate: { type: 'comedy', activeUntilWeek: 16 } },
    { id: 'b-str-1', name: 'ViewMax', archetype: 'streamer', currentMandate: { type: 'sci-fi', activeUntilWeek: 32 } },
    { id: 'b-str-2', name: 'StreamFlix', archetype: 'streamer', currentMandate: { type: 'drama', activeUntilWeek: 20 } },
    { id: 'b-pre-1', name: 'Premium TV', archetype: 'premium', currentMandate: { type: 'prestige', activeUntilWeek: 48 } },
  ];

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
    buyers: initialBuyers,
    contracts: [],
    talentPool: [],
  };
}
