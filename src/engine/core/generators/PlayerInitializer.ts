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
): Record<string, import('@/engine/types').Project> {
  const { startingProjectCount = archetype === 'major' ? 3 : (archetype === 'mid-tier' ? 1 : 0) } = options;
  
  const playerProjects: Record<string, import('@/engine/types').Project> = {};
  for (let i = 0; i < startingProjectCount; i++) {
    const pId = rng.uuid('PRJ');
    const genre = rng.pick(ALL_GENRES);
    const format = rng.next() < 0.3 ? 'tv' : 'film';
    
    const project: any = { // Partial to satisfy union
      id: pId,
      title: generateProjectName(format, genre, rng),
      type: format === 'tv' ? 'SERIES' : 'FILM',
      format,
      genre,
      budgetTier: archetype === 'major' ? 'high' : 'mid',
      budget: (archetype === 'major' ? 100 : 40) * 1_000_000,
      weeklyCost: 0,
      targetAudience: 'four_quadrant',
      flavor: 'Standard',
      state: 'production',
      weeksInPhase: rng.rangeInt(1, 4),
      productionWeeks: rng.rangeInt(12, 20),
      developmentWeeks: rng.rangeInt(4, 8),
      revenue: 0,
      weeklyRevenue: 0,
      accumulatedCost: 0,
      progress: 0,
      quality: 50,
      scriptHeat: 50,
      buzz: 40,
      momentum: 50,
      ownerId: playerStudioId,
      reviewScore: 0
    };

    if (format === 'tv') {
      project.tvFormat = 'Scripted';
      project.tvDetails = {
        currentSeason: 1,
        episodesOrdered: 10,
        episodesCompleted: 0,
        episodesAired: 0,
        averageRating: 0,
        status: 'IN_PRODUCTION'
      };
      project.activeRoles = [];
      project.scriptEvents = [];
    } else {
      project.activeRoles = [];
      project.scriptEvents = [];
    }

    playerProjects[pId] = project as import('@/engine/types').Project;
  }

  return playerProjects;
}

export function initializePlayerStudio(
  studioName: string,
  archetype: ArchetypeKey,
  playerStudioId: string,
  arch: import('../../data/archetypes').StudioArchetype
): import('@/engine/types').PlayerStudio {
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
