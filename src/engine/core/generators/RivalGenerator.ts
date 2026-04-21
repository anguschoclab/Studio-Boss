import { ArchetypeKey, RivalStudio } from '../../types/studio.types';
import { ARCHETYPES } from '../../data/archetypes';
import { BrandSystem } from '../../generators/BrandSystem';
import { generateMotto, generateProjectName } from '../../generators/names';
import { RandomGenerator } from '../../utils/rng';
import { ALL_GENRES } from '../../systems/trends';
import { StudioMotivation, TalentPact, Project } from '@/engine/types';
import { type ProjectId, type StudioId, type PactId, type TalentId } from '@/engine/types/shared.types';

interface RivalGeneratorOptions {
  count?: number;
  rivalArchetypes?: ArchetypeKey[];
  usedNames?: Set<string>;
}

export function generateRivals(
  rng: RandomGenerator,
  options: RivalGeneratorOptions = {}
): { rivals: RivalStudio[], projects: Record<ProjectId, Project> } {
  const { count = 10, rivalArchetypes = ['major', 'mid-tier', 'indie'], usedNames = new Set<string>() } = options;

  const rivalStudios: RivalStudio[] = [];
  const allRivalProjects: Record<ProjectId, Project> = {};

  for (let i = 0; i < count; i++) {
    const ident = BrandSystem.generateIdentity(usedNames, rng);
    const name = BrandSystem.getStudioName(ident, rng);
    usedNames.add(name);
    usedNames.add(ident.core);

    const rArch = rng.pick(rivalArchetypes);
    const rArchData = ARCHETYPES[rArch];

    const motivationProfile = {
      financial: rArch === 'major' ? 80 : (rArch === 'mid-tier' ? 60 : 40),
      prestige: rArch === 'indie' ? 90 : (rArch === 'mid-tier' ? 60 : 40),
      legacy: rArch === 'major' ? 70 : 30,
      aggression: rng.rangeInt(40, 80)
    };

    const motivations: StudioMotivation[] = ['CASH_CRUNCH', 'AWARD_CHASE', 'FRANCHISE_BUILDING', 'MARKET_DISRUPTION', 'STABILITY'];

    const rProjects: Record<ProjectId, Project> = {};
    const projCount = rng.rangeInt(2, 5);
    const rivalId = rng.uuid<StudioId>('RIV');

    for (let j = 0; j < projCount; j++) {
      const pId = rng.uuid<ProjectId>('PRJ');
      const isProd = rng.next() < 0.5;
      const isTv = rng.next() < 0.3;
      const genre = rng.pick(ALL_GENRES);
      const hostFormat = isTv ? 'tv' : 'film';

      const projectBase = {
        id: pId,
        title: generateProjectName(hostFormat, genre, rng),
        type: (isTv ? 'SERIES' : 'FILM') as import('@/engine/types').ProjectType,
        format: hostFormat as import('@/engine/types').ProjectFormat,
        genre,
        budgetTier: 'indie' as import('@/engine/types').BudgetTierKey,
        budget: rng.rangeInt(10, 150) * 1_000_000,
        weeklyCost: 0,
        targetAudience: 'four_quadrant',
        flavor: 'Standard',
        state: (isProd ? 'production' : 'development') as import('@/engine/types').ProjectStatus,
        weeksInPhase: rng.rangeInt(1, 10),
        developmentWeeks: rng.rangeInt(4, 12),
        productionWeeks: rng.rangeInt(12, 26),
        revenue: 0,
        weeklyRevenue: 0,
        accumulatedCost: 0,
        progress: 0,
        quality: 50,
        scriptHeat: 50,
        buzz: rng.rangeInt(20, 60),
        momentum: 50,
        ownerId: rivalId,
        reviewScore: 50,
        releaseWeek: null,
        activeCrisis: null,
        activeRoles: [],
        scriptEvents: []
      };

      if (isTv) {
        rProjects[pId] = {
          ...projectBase,
          type: 'SERIES',
          tvFormat: 'Scripted',
          tvDetails: {
            currentSeason: 1,
            episodesOrdered: 10,
            episodesCompleted: 0,
            episodesAired: 0,
            averageRating: 0,
            status: 'IN_DEVELOPMENT'
          }
        } as import('@/engine/types').SeriesProject;
      } else {
        rProjects[pId] = {
          ...projectBase,
          type: 'FILM'
        } as import('@/engine/types').FilmProject;
      }
    }

    rivalStudios.push({
      id: rivalId,
      name,
      motto: generateMotto(rng),
      archetype: rArch,
      foundedWeek: 1,
      parentBrand: ident.core,
      strength: rng.rangeInt(40, 80),
      cash: rArchData.startingCash * rng.range(0.5, 1.2),
      prestige: rArchData.startingPrestige + rng.rangeInt(-10, 10),
      recentActivity: 'Operations initialized.',
      projectCount: projCount,
      motivationProfile,
      currentMotivation: rng.pick(motivations) as StudioMotivation,
      ownedPlatforms: [],
      projectIds: Object.keys(rProjects) as ProjectId[],
      contractIds: [],
      ipAssetIds: [],
      archetypeId: (rArchData as any).id || rArch
    });

    Object.assign(allRivalProjects, rProjects);
  }

  return { rivals: rivalStudios, projects: allRivalProjects };
}

export function assignInitialPactsToRivals(
  rivals: RivalStudio[],
  talentPoolArray: import('@/engine/types').Talent[],
  rng: RandomGenerator
): TalentPact[] {
  const initialContracts: TalentPact[] = [];
  const availableTopTalents = talentPoolArray.filter(t => t.tier === 1 || t.tier === 2);
  let topTalentIndex = 0;

  rivals.forEach(rival => {
    const pactCount = rival.archetype === 'major' ? 3 : (rival.archetype === 'mid-tier' ? 1 : 0);
    for (let i = 0; i < pactCount; i++) {
      let topTalent = undefined;
      while (topTalentIndex < availableTopTalents.length) {
        const candidate = availableTopTalents[topTalentIndex];
        topTalentIndex++;
        if (!candidate.contractId) {
          topTalent = candidate;
          break;
        }
      }

      if (topTalent) {
        const pact: TalentPact = {
          id: rng.uuid<PactId>('PCT'),
          talentId: topTalent.id as TalentId,
          studioId: rival.id as StudioId,
          type: 'first_look',
          startDate: 1,
          endDate: 52,
          weeksRemaining: 51,
          weeklyOverhead: topTalent.fee * 0.05,
          exclusivity: true,
          status: 'active'
        };
        initialContracts.push(pact);
        rival.contractIds.push(pact.id as string);
        topTalent.contractId = pact.id;
      }
    }
  });

  return initialContracts;
}
