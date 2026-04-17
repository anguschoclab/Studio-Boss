import { ArchetypeKey, RivalStudio, GameState } from '../types/studio.types';
import { MarketState } from '../types/state.types';
import { ALL_GENRES, initializeTrends } from '../systems/trends';
import { ARCHETYPES } from '../data/archetypes';
import { RandomGenerator } from '../utils/rng';
import { generateOpportunity } from '../generators/opportunities';
import { Talent } from '@/engine/types';
import {
  generateRivals,
  assignInitialPactsToRivals,
  generatePlayerProjects,
  initializePlayerStudio,
  generateTalentPoolWithRelationships,
  initializeMarket
} from './generators';

export function initializeGame(studioName: string, archetype: ArchetypeKey, seed: number): GameState {
  const rng = new RandomGenerator(seed);
  const playerStudioId = rng.uuid('PLR'); // 🌌 Standardized player ID
  const arch = ARCHETYPES[archetype];
  const rivalArchetypes: ArchetypeKey[] = ['major', 'mid-tier', 'indie'];
  const usedNames = new Set<string>([studioName]);

  // Generate 10 Rivals
  const rivals = generateRivals(rng, { rivalArchetypes, usedNames });

  // Generate talent pool with agencies, agents, families, and relationships
  const {
    talentPool,
    talentPoolArray,
    agencies,
    agents,
    families,
    talentAgentRelationships
  } = generateTalentPoolWithRelationships(rng);

  // Initialize some initial pacts for rivals to make the world feel alive
  assignInitialPactsToRivals(rivals, talentPoolArray, rng);
  
  // Generate Player Projects based on Archetype
  const playerProjects = generatePlayerProjects(rng, playerStudioId, archetype);

  const initialTrends = initializeTrends(rng);
  const genrePopularity: Record<string, number> = {};
  ALL_GENRES.forEach(g => {
    const trend = initialTrends.find(t => t.genre === g);
    genrePopularity[g.toLowerCase()] = trend ? trend.heat / 100 : rng.range(0.2, 0.5);
  });

  // Initialize market (buyers, platforms)
  const { initialBuyers, playerOwnedPlatforms } = initializeMarket(
    rng,
    rivals,
    playerStudioId,
    archetype,
    studioName
  );

  return {
    week: 1,
    gameSeed: seed,
    tickCount: 0,
    rngState: rng.getState(),
    game: { currentWeek: 1 },
    finance: {
      cash: arch.startingCash,
      ledger: [],
      weeklyHistory: [],
      marketState: {
        baseRate: 0.045,
        savingsYield: 0.025,
        debtRate: 0.095,
        loanRate: 0.07,
        rateHistory: [{ week: 1, rate: 0.045 }],
        sentiment: 50,
        cycle: 'STABLE'
      } as MarketState
    },
    news: {
      headlines: [
        {
          id: rng.uuid('NWS'),
          text: `${studioName} launches operations — the industry takes notice.`,
          week: 1,
          category: 'general' as const,
        },
      ],
    },
    ip: {
      vault: [],
      franchises: {},
    },
    studio: {
      ...initializePlayerStudio(studioName, archetype, playerStudioId, arch),
      ownedPlatforms: playerOwnedPlatforms,
      culture: {
        ...initializePlayerStudio(studioName, archetype, playerStudioId, arch).culture,
        genrePopularity
      }
    },
    market: {
      opportunities: Array.from({ length: 4 }, () => generateOpportunity(rng, 1, Object.keys(talentPool))),
      buyers: initialBuyers,
    },
    industry: {
      families,
      agencies,
      agents,
      awards: [],
      newsHistory: [],
    },
    entities: {
      projects: {
        ...playerProjects,
        ...Object.values(rivals).reduce((acc, r) => {
          // Backward compatibility for projects field
          const rivalProjects = ('projects' in r && r.projects) ? (r as any).projects : {};
          Object.assign(acc, rivalProjects);
          return acc;
        }, {} as Record<string, any>)
      },
      contracts: {},
      talents: talentPool,
      rivals: rivals.reduce((acc, r) => {
        acc[r.id] = r;
        return acc;
      }, {} as Record<string, RivalStudio>),
    },
    deals: {
      activeDeals: [],
      pendingOffers: [],
      expiredDeals: [],
    },
    relationships: {
      relationships: {}
    },
    talentAgentRelationships,
    history: [],
    eventHistory: [],
  };
}
