import { ArchetypeKey } from '../../types/studio.types';
import { ARCHETYPES } from '../../data/archetypes';
import { generateProjectName } from '../../generators/names';
import { RandomGenerator } from '../../utils/rng';
import { ALL_GENRES } from '../../systems/trends';

interface PlayerProjectOptions {
  startingProjectCount?: number;
  archetype?: ArchetypeKey;
}

export function generatePlayerProjects(
  rng: RandomGenerator,
  playerStudioId: string,
  archetype: ArchetypeKey,
  options: PlayerProjectOptions = {}
): Record<string, any> {
  const { startingProjectCount = archetype === 'major' ? 3 : (archetype === 'mid-tier' ? 1 : 0) } = options;
  const arch = ARCHETYPES[archetype];

  const playerProjects: Record<string, any> = {};
  for (let i = 0; i < startingProjectCount; i++) {
    const pId = rng.uuid('PRJ');
    const genre = rng.pick(ALL_GENRES);
    const format = rng.next() < 0.3 ? 'tv' : 'film';
    playerProjects[pId] = {
      id: pId,
      title: generateProjectName(format, genre, rng),
      type: format === 'tv' ? 'SERIES' : 'FILM',
      state: 'production',
      weeksInPhase: rng.rangeInt(1, 4),
      productionWeeks: rng.rangeInt(12, 20),
      developmentWeeks: rng.rangeInt(4, 8),
      budget: (archetype === 'major' ? 100 : 40) * 1_000_000,
      buzz: 40,
      genre,
      format,
      reviewScore: 0,
      revenue: 0,
      accumulatedCost: 0,
      studioId: playerStudioId
    };
    if (format === 'tv') {
      playerProjects[pId].tvDetails = {
        currentSeason: 1,
        episodesOrdered: 10,
        episodesCompleted: 0,
        episodesAired: 0,
        averageRating: 0,
        status: 'IN_PRODUCTION'
      };
    }
  }

  return playerProjects;
}

export function initializePlayerStudio(
  studioName: string,
  archetype: ArchetypeKey,
  playerStudioId: string,
  arch: any
): any {
  return {
    id: playerStudioId,
    name: studioName,
    archetype,
    prestige: arch.startingPrestige,
    internal: {
      projectHistory: [],
    },
    ownedPlatforms: [],
    snapshotHistory: [],
    culture: {
      prestigeVsCommercial: 0,
      talentFriendlyVsControlling: 0,
      nicheVsBroad: 50,
      filmFirstVsTvFirst: 0,
      genrePopularity: { 'Drama': 50, 'Comedy': 50, 'Action': 50, 'Sci-Fi': 50, 'Horror': 50, 'Romance': 50 }
    },
    activeCampaigns: {},
  };
}
