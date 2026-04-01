import { ArchetypeKey, RivalStudio, GameState } from '../types/studio.types';
import { MarketState } from '../types/state.types';
import { ALL_GENRES, initializeTrends } from '../systems/trends';
import { ARCHETYPES } from '../data/archetypes';
import { BrandSystem } from '../generators/BrandSystem';
import { generateMotto } from '../generators/names';
import { generateFamilies, generateTalentPool } from '../generators/talent';
import { generateBuyers } from '../generators/buyers';
import { generateAgencies, generateAgents } from '../generators/agencies';
import { pick, secureRandom, randRange } from '../utils';
import { generateOpportunity } from '../generators/opportunities';

export function initializeGame(studioName: string, archetype: ArchetypeKey): GameState {
  const arch = ARCHETYPES[archetype];
  const rivalArchetypes: ArchetypeKey[] = ['major', 'mid-tier', 'indie'];
  const usedNames = new Set<string>([studioName]);

  // Generate 10 Rivals
  const rivals: RivalStudio[] = Array.from({ length: 10 }, (_, i) => {
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
       aggression: 40 + Math.floor(secureRandom() * 40)
    };

    const motivations: import('@/engine/types').StudioMotivation[] = ['CASH_CRUNCH', 'AWARD_CHASE', 'FRANCHISE_BUILDING', 'MARKET_DISRUPTION', 'STABILITY'];

    return {
      id: `rival-${i}-${Date.now()}`,
      name,
      motto: generateMotto(),
      archetype: rArch,
      foundedWeek: 1,
      parentBrand: ident.core,
      strength: 40 + Math.floor(secureRandom() * 40),
      cash: rArchData.startingCash * randRange(0.5, 1.2),
      prestige: rArchData.startingPrestige + Math.floor(randRange(-10, 10)),
      recentActivity: 'Setting up operations for the new season',
      projectCount: 2 + Math.floor(secureRandom() * 5),
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
    genrePopularity[g.toLowerCase()] = trend ? trend.heat / 100 : 0.2 + secureRandom() * 0.3;
  });

  // Generate initial buyers
  const initialBuyers = generateBuyers({ networks: 4, premium: 4, streamers: 5 });
  
  // Vertical Integration: Assign starting platforms to Majors/Mid-tiers
  // Finding player's starting streamer if applicable
  const playerOwnedPlatforms: string[] = [];
  if (archetype !== 'indie') {
    const playerBrand = { core: studioName.split(' ')[0], isConglomerate: true };
    const playerStreamer: import('@/engine/types').StreamerPlatform = {
      id: `player-streamer-${Date.now()}`,
      name: BrandSystem.getStreamingName(playerBrand),
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
    };
    initialBuyers.push(playerStreamer);
    playerOwnedPlatforms.push(playerStreamer.id);
  }

  // Assign streamers to Rivals
  rivals.forEach(rival => {
    if (rival.archetype !== 'indie' && secureRandom() < 0.7) {
      const rivalBrand = { core: rival.parentBrand!, isConglomerate: true };
      const rivalStreamer: import('@/engine/types').StreamerPlatform = {
        id: `rival-streamer-${rival.id}`,
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

  return {
    week: 1,
    gameSeed: Math.floor(secureRandom() * 1_000_000),
    tickCount: 0,
    game: { currentWeek: 1 },
    projects: { active: [] },
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
          id: 'h-init',
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
      opportunities: Array.from({ length: 4 }, () => generateOpportunity(Object.keys(talentPool))),
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
    culture: {
      genrePopularity,
    },
    history: [],
    eventHistory: [],
  };
}
