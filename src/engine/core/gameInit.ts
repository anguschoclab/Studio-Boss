import { ArchetypeKey, RivalStudio, GameState } from '../types/studio.types';
import { MarketState } from '../types/state.types';
import { ALL_GENRES, initializeTrends } from '../systems/trends';
import { ARCHETYPES } from '../data/archetypes';
import { BrandSystem } from '../generators/BrandSystem';
import { generateMotto } from '../generators/names';
import { generateFamilies, generateTalentPool } from '../generators/talent';
import { generateBuyers } from '../generators/buyers';
import { generateAgencies, generateAgents } from '../generators/agencies';
import { pick, randRange, setDeterministicSeed, rand, generateId } from '../utils';
import { generateOpportunity } from '../generators/opportunities';
import { generateProjectTitle } from '../generators/titles';

export function initializeGame(studioName: string, archetype: ArchetypeKey, seed?: number): GameState {
  // 1. Initialize PRNG for determinism
  const gameSeed = seed ?? Math.floor(rand() * 1_000_000);
  setDeterministicSeed(gameSeed);

  const arch = ARCHETYPES[archetype];
  const rivalArchetypes: ArchetypeKey[] = ['major', 'mid-tier', 'indie'];
  const usedNames = new Set<string>([studioName]);

  // Generate 10 Rivals
  const rivals: RivalStudio[] = Array.from({ length: 10 }, () => {
    const ident = BrandSystem.generateIdentity(usedNames);
    const name = BrandSystem.getStudioName(ident);
    usedNames.add(name);
    usedNames.add(ident.core);
    
    const rArch = pick(rivalArchetypes);
    const rArchData = ARCHETYPES[rArch];

    const motivationProfile = {
       financial: rArch === 'major' ? 80 : (rArch === 'mid-tier' ? 60 : 40),
       prestige: rArch === 'indie' ? 90 : (rArch === 'mid-tier' ? 60 : 40),
       legacy: rArch === 'major' ? 70 : 30,
       aggression: 40 + Math.floor(rand() * 40)
    };

    const motivations: import('@/engine/types').StudioMotivation[] = ['CASH_CRUNCH', 'AWARD_CHASE', 'FRANCHISE_BUILDING', 'MARKET_DISRUPTION', 'STABILITY'];

    return {
      id: generateId('RIV'),
      name,
      motto: generateMotto(),
      archetype: rArch,
      foundedWeek: 1,
      parentBrand: ident.core,
      strength: 40 + Math.floor(rand() * 40),
      cash: rArchData.startingCash * randRange(0.5, 1.2),
      prestige: rArchData.startingPrestige + Math.floor(randRange(-10, 10)),
      recentActivity: 'Setting up operations for the new season',
      projectCount: 2 + Math.floor(rand() * 5),
      motivationProfile,
      currentMotivation: pick(motivations),
      projects: {},
      contracts: [],
      ownedPlatforms: []
    };
  });

  const agencies = generateAgencies(5);
  const agents = generateAgents(agencies, 4);
  const families = generateFamilies(5);
  const talentPoolArray = generateTalentPool(50, families, agents, agencies);
  const talentPool = talentPoolArray.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {} as Record<string, import('@/engine/types').Talent>);
  const initialTrends = initializeTrends();
  const genrePopularity: Record<string, number> = {};
  ALL_GENRES.forEach(g => {
    const trend = initialTrends.find(t => t.genre === g);
    genrePopularity[g.toLowerCase()] = trend ? trend.heat / 100 : 0.2 + rand() * 0.3;
  });

  // Generate initial buyers
  const initialBuyers = generateBuyers({ networks: 4, premium: 4, streamers: 5 });
  
  // Vertical Integration: Assign starting platforms to Majors/Mid-tiers
  const playerOwnedPlatforms: string[] = [];
  if (archetype !== 'indie') {
    const playerBrand = { core: studioName.split(' ')[0], isConglomerate: true };
    const playerStreamer: import('@/engine/types').StreamerPlatform = {
      id: generateId('BUY'),
      name: BrandSystem.getStreamingName(playerBrand),
      archetype: 'streamer',
      foundedWeek: 1,
      parentBrand: playerBrand.core,
      ownerId: 'PLR-STUDIO-1', // Simplified placeholder for now, will be updated below
      subscribers: archetype === 'major' ? 25_000_000 : 10_000_000,
      churnRate: 0.05,
      contentLibraryQuality: 60,
      marketingSpend: 2_000_000,
      marketShare: archetype === 'major' ? 0.35 : 0.15,
      reach: archetype === 'major' ? 95 : 70,
      subscriberHistory: [],
    };
    initialBuyers.push(playerStreamer);
    playerOwnedPlatforms.push(playerStreamer.id);
  }

  // Assign streamers to Rivals
  rivals.forEach(rival => {
    if (rival.archetype !== 'indie' && rand() < 0.7) {
      const rivalBrand = { core: rival.parentBrand!, isConglomerate: true };
      const rivalStreamer: import('@/engine/types').StreamerPlatform = {
        id: generateId('BUY'),
        name: BrandSystem.getStreamingName(rivalBrand),
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
      };
      initialBuyers.push(rivalStreamer);
      rival.ownedPlatforms = [rivalStreamer.id];
    }
  });

  const rivalsRecord = rivals.reduce((acc, r) => {
      acc[r.id] = r;
      return acc;
  }, {} as Record<string, RivalStudio>);

  // Seed each rival with 2-4 starter vault assets so Stage 1 distress IP sales
  // have concrete named catalog titles to trade (no more phantom "catalog rights").
  const starterVault: import('@/engine/types').IPAsset[] = [];
  rivals.forEach(rival => {
    const count = 2 + Math.floor(rand() * 3); // 2..4
    for (let i = 0; i < count; i++) {
      const genre = pick(ALL_GENRES);
      const title = generateProjectTitle(genre);
      starterVault.push({
        id: generateId('IPA'),
        originalProjectId: `seed-${rival.id}-${i}`,
        title,
        baseValue: 40_000_000 + Math.floor(rand() * 120_000_000),
        decayRate: 0.0005,
        merchandisingMultiplier: 1 + rand() * 0.5,
        syndicationStatus: 'NONE',
        syndicationTier: 'NONE',
        totalEpisodes: 0,
        rightsExpirationWeek: 99999,
        rightsOwner: 'RIVAL',
        ownerStudioId: rival.id as unknown as string,
      } as unknown as Franchise);
    }
  });

  const studioId = generateId('PLR');

  // Fix ownerId for player streamer
  if (playerOwnedPlatforms.length > 0) {
    const platform = initialBuyers.find(b => b.id === playerOwnedPlatforms[0]);
    if (platform) platform.ownerId = studioId;
  }

  return {
    week: 1,
    gameSeed,
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
        rateHistory: [{ week: 1, rate: 0.045 }]
      } as MarketState
    },
    news: {
      headlines: [
        {
          id: generateId('NWS'),
          text: `${studioName} launches operations — the industry takes notice.`,
          week: 1,
          category: 'general' as const,
        },
      ],
    },
    ip: {
      vault: starterVault,
      franchises: {},
    },
    entities: {
      projects: {},
      talents: talentPool,
      contracts: {},
      rivals: rivalsRecord,
      shingles: {}
    },
    studio: {
      id: studioId,
      name: studioName,
      archetype,
      prestige: arch.startingPrestige,
      internal: {
        projectHistory: [],
        firstLookDeals: [],
      },
      ownedPlatforms: playerOwnedPlatforms
    },
    market: {
      opportunities: Array.from({ length: 4 }, () => generateOpportunity(Object.keys(talentPool))),
      buyers: initialBuyers,
    },
    industry: {
      families,
      agencies,
      agents,
      awards: [],
      newsHistory: [],
    },
    culture: {
      genrePopularity,
    },
    history: [],
    eventHistory: [],
  };
}
