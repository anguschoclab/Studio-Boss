import { ArchetypeKey, RivalStudio } from '../../types/studio.types';
import { ARCHETYPES } from '../../data/archetypes';
import { BrandSystem } from '../../generators/BrandSystem';
import { generateMotto, generateProjectName } from '../../generators/names';
import { RandomGenerator } from '../../utils/rng';
import { ALL_GENRES } from '../../systems/trends';
import { StudioMotivation, TalentPact, Contract } from '@/engine/types';

interface RivalGeneratorOptions {
  count?: number;
  rivalArchetypes?: ArchetypeKey[];
  usedNames?: Set<string>;
}

export function generateRivals(
  rng: RandomGenerator,
  options: RivalGeneratorOptions = {}
): RivalStudio[] {
  const { count = 10, rivalArchetypes = ['major', 'mid-tier', 'indie'], usedNames = new Set<string>() } = options;

  return Array.from({ length: count }, () => {
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

    const rProjects: Record<string, any> = {};
    const projCount = rng.rangeInt(2, 5);
    for (let i = 0; i < projCount; i++) {
      const pId = rng.uuid('PRJ');
      const isProd = rng.next() < 0.5;
      const isTv = rng.next() < 0.3;
      const genre = rng.pick(ALL_GENRES);
      const format = isTv ? 'tv' : 'film';

      rProjects[pId] = {
        id: pId,
        title: generateProjectName(format, genre, rng),
        type: isTv ? 'SERIES' : 'FILM',
        state: isProd ? 'production' : 'development',
        weeksInPhase: rng.rangeInt(1, 10),
        productionWeeks: rng.rangeInt(12, 26),
        developmentWeeks: rng.rangeInt(4, 12),
        budget: rng.rangeInt(10, 150) * 1_000_000,
        buzz: rng.rangeInt(20, 60),
        genre,
        format,
        reviewScore: 50,
        revenue: 0,
        accumulatedCost: 0
      };

      if (isTv) {
        rProjects[pId].tvDetails = {
          currentSeason: 1,
          episodesOrdered: 10,
          episodesCompleted: 0,
          episodesAired: 0,
          averageRating: 0,
          status: 'IN_DEVELOPMENT'
        };
      }
    }

    return {
      id: rng.uuid('RIV'),
      name,
      motto: generateMotto(rng),
      archetype: rArch,
      foundedWeek: 1,
      parentBrand: ident.core,
      strength: rng.rangeInt(40, 80),
      cash: rArchData.startingCash * rng.range(0.5, 1.2),
      prestige: rArchData.startingPrestige + rng.rangeInt(-10, 10),
      recentActivity: 'Setting up operations for the new season',
      projectCount: projCount,
      motivationProfile,
      currentMotivation: rng.pick(motivations),
      projects: rProjects,
      contracts: [],
      ownedPlatforms: [],
      projectIds: Object.keys(rProjects),
      contractIds: [],
      ipAssetIds: [],
      archetypeId: rArchData.id || rArch
    } as any;
  });
}

export function assignInitialPactsToRivals(
  rivals: RivalStudio[],
  talentPoolArray: any[],
  rng: RandomGenerator
): void {
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
          id: rng.uuid('PCT'),
          talentId: topTalent.id,
          studioId: rival.id,
          type: 'first_look',
          exclusivity: true,
          weeklyOverhead: topTalent.fee * 0.05,
          startDate: 1,
          endDate: 52,
          status: 'active'
        };
        const rivalContracts = ('contracts' in rival && rival.contracts) ? (rival as any).contracts : [];
        rivalContracts.push(pact as unknown as Contract);
        topTalent.contractId = pact.id;
      }
    }
  });
}
