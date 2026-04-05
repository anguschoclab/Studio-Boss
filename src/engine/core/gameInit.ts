import { ArchetypeKey, RivalStudio, GameState } from '../types/studio.types';
import { MarketState, StateImpact } from '../types/state.types';
import { ALL_GENRES, initializeTrends } from '../systems/trends';
import { ARCHETYPES } from '../data/archetypes';
import { BrandSystem } from '../generators/BrandSystem';
import { generateMotto, generateProjectName } from '../generators/names';
import { generateFamilies, generateTalentPool } from '../generators/talent';
import { generateBuyers } from '../generators/buyers';
import { generateAgencies, generateAgents } from '../generators/agencies';
import { RandomGenerator } from '../utils/rng';
import { generateOpportunity } from '../generators/opportunities';
import { Talent, TalentPact, StreamerPlatform, Buyer, StudioMotivation, Contract } from '@/engine/types';

export function initializeGame(studioName: string, archetype: ArchetypeKey, seed: number): GameState {
  const rng = new RandomGenerator(seed);
  const arch = ARCHETYPES[archetype];
  const rivalArchetypes: ArchetypeKey[] = ['major', 'mid-tier', 'indie'];
  const usedNames = new Set<string>([studioName]);

  // Generate 10 Rivals
  const rivals: RivalStudio[] = Array.from({ length: 10 }, () => {
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
        const pId = rng.uuid('p-init');
        const isProd = rng.next() < 0.5;
        const isTv = rng.next() < 0.3; // 30% TV mix
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
      id: rng.uuid('rival'),
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
      ownedPlatforms: []
    };
  });

  const agencies = generateAgencies(rng, 5);
  const agents = generateAgents(rng, agencies, 4);
  const families = generateFamilies(rng, 5);
  
  // SEED: 500 Talents as per Phase 2 TDD
  const talentPoolArray = generateTalentPool(rng, 500);
  const talentPool = talentPoolArray.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {} as Record<string, Talent>);
  
  // Initialize some initial pacts for rivals to make the world feel alive
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
                id: rng.uuid('pact'),
                talentId: topTalent.id,
                studioId: rival.id,
                type: 'first_look',
                exclusivity: true,
                weeklyOverhead: topTalent.fee * 0.05,
                startDate: 1,
                endDate: 52,
                status: 'active'
            };
            rival.contracts.push(pact as unknown as Contract); 
            topTalent.contractId = pact.id;
        }
    }
  });

  const initialTrends = initializeTrends(rng);
  const genrePopularity: Record<string, number> = {};
  ALL_GENRES.forEach(g => {
    const trend = initialTrends.find(t => t.genre === g);
    genrePopularity[g.toLowerCase()] = trend ? trend.heat / 100 : rng.range(0.2, 0.5);
  });

  // Generate initial buyers
  const initialBuyers = generateBuyers(rng, { networks: 4, premium: 4, streamers: 5 });
  
  // Vertical Integration: Assign starting platforms to Majors/Mid-tiers
  const playerOwnedPlatforms: string[] = [];
  if (archetype !== 'indie') {
    const playerBrand = { core: studioName.split(' ')[0], isConglomerate: true };
    const playerStreamer: StreamerPlatform = {
      id: rng.uuid('player-streamer'),
      name: BrandSystem.getStreamingName(playerBrand, rng),
      archetype: 'streamer',
      foundedWeek: 1,
      parentBrand: playerBrand.core,
      ownerId: 'player',
      subscribers: archetype === 'major' ? 25_000_000 : 10_000_000,
      churnRate: 0.05,
      contentLibraryQuality: 60,
      marketingSpend: 2_000_000,
      marketShare: archetype === 'major' ? 0.35 : 0.15,
      reach: archetype === 'major' ? 95 : 70,
      subscriberHistory: [],
      activeLicenses: []
    };
    initialBuyers.push(playerStreamer);
    playerOwnedPlatforms.push(playerStreamer.id);
  }

  // Assign streamers to Rivals
  rivals.forEach(rival => {
    if (rival.archetype !== 'indie' && rng.next() < 0.7) {
      const rivalBrand = { core: rival.parentBrand!, isConglomerate: true };
      const rivalStreamer: StreamerPlatform = {
        id: rng.uuid('rival-streamer'),
        name: BrandSystem.getStreamingName(rivalBrand, rng),
        archetype: 'streamer',
        foundedWeek: 1,
        parentBrand: rivalBrand.core,
        ownerId: rival.id,
        subscribers: rival.archetype === 'major' ? 20_000_000 : 8_000_000,
        churnRate: 0.05,
        contentLibraryQuality: 50,
        marketingSpend: 1_500_000,
        marketShare: rival.archetype === 'major' ? 0.30 : 0.12,
        reach: rival.archetype === 'major' ? 90 : 65,
        subscriberHistory: [],
        activeLicenses: []
      };
      initialBuyers.push(rivalStreamer);
      rival.ownedPlatforms = [rivalStreamer.id];
    }
  });

  return {
    week: 1,
    gameSeed: seed,
    tickCount: 0,
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
          id: rng.uuid('h-init'),
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
      name: studioName,
      archetype,
      prestige: arch.startingPrestige,
      internal: {
        projects: {},
        contracts: [],
      },
      ownedPlatforms: playerOwnedPlatforms
    },
    market: {
      opportunities: Array.from({ length: 4 }, () => generateOpportunity(rng, 1, Object.keys(talentPool))),
      buyers: initialBuyers,
    },
    industry: {
      rivals,
      families,
      agencies,
      agents,
      talentPool,
      awards: [],
      newsHistory: [],
    },
    deals: {
      activeDeals: [],
      pendingOffers: [],
      expiredDeals: [],
    },
    culture: {
      genrePopularity,
    },
    history: [],
    eventHistory: [],
  };
}
