import { ArchetypeKey } from '../../types/studio.types';
import { ARCHETYPES } from '../../data/archetypes';
import { generateProjectName } from '../../generators/names';
import { RandomGenerator } from '../../utils/rng';
import { ALL_GENRES } from '../../systems/trends';
import { type StudioId, type ProjectId } from '@/engine/types/shared.types';
import { Project, PlayerStudio } from '@/engine/types';

interface PlayerProjectOptions {
  startingProjectCount?: number;
  archetype?: ArchetypeKey;
}

export function generatePlayerProjects(
  rng: RandomGenerator,
  playerStudioId: StudioId,
  archetype: ArchetypeKey,
  options: PlayerProjectOptions = {}
): Record<ProjectId, Project> {
  const { startingProjectCount = archetype === 'major' ? 3 : (archetype === 'mid-tier' ? 1 : 0) } = options;
  
  const playerProjects: Record<ProjectId, Project> = {};
  for (let i = 0; i < startingProjectCount; i++) {
    const pId = rng.uuid<ProjectId>('PRJ');
    const genre = rng.pick(ALL_GENRES);
    const format = rng.next() < 0.3 ? 'tv' : 'film';
    
    const projectBase = {
      id: pId,
      title: generateProjectName(format, genre, rng),
      type: (format === 'tv' ? 'SERIES' : 'FILM') as ProjectType,
      format: format as ProjectFormat,
      genre,
      budgetTier: (archetype === 'major' ? 'high' : 'mid') as BudgetTierKey,
      budget: (archetype === 'major' ? 100 : 40) * 1_000_000,
      weeklyCost: 0,
      targetAudience: 'four_quadrant',
      flavor: 'Standard',
      state: 'production' as ProjectStatus,
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
      reviewScore: 0,
      releaseWeek: null,
      activeCrisis: null,
      activeRoles: [],
      scriptEvents: []
    };

    let project: Project;
    if (format === 'tv') {
      project = {
        ...projectBase,
        type: 'SERIES',
        tvFormat: 'Scripted',
        tvDetails: {
          currentSeason: 1,
          episodesOrdered: 10,
          episodesCompleted: 0,
          episodesAired: 0,
          averageRating: 0,
          status: 'IN_PRODUCTION'
        }
      } as SeriesProject;
    } else {
      project = {
        ...projectBase,
        type: 'FILM'
      } as FilmProject;
    }

    playerProjects[pId] = project;
  }

  return playerProjects;
}

export function initializePlayerStudio(
  studioName: string,
  archetype: ArchetypeKey,
  playerStudioId: StudioId,
  arch: import('../../data/archetypes').StudioArchetype
): PlayerStudio {
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
