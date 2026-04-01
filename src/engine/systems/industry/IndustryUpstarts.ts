import { GameState, RivalStudio, StateImpact, Buyer, StreamerPlatform } from '@/engine/types';
import { BrandSystem } from '../../generators/BrandSystem';
import { pick, secureRandom, randRange } from '../../utils';
import { ARCHETYPES } from '../../data/archetypes';
import { generateMotto } from '../../generators/names';

/**
 * Studio Boss - Industry Upstarts
 * Spawns new companies to ensure the market doesn't become a ghost town after mergers.
 */
export function tickIndustryUpstarts(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currentRivals = state.industry.rivals.length;
  const currentStreamers = state.market.buyers.filter(b => b.archetype === 'streamer').length;

  const usedNames = new Set(state.industry.rivals.map(r => r.name));
  state.market.buyers.forEach(b => usedNames.add(b.name));

  // Minimum thresholds
  const MIN_RIVALS = 8;
  const MIN_STREAMERS = 10;

  // Spawn Studio Upstart
  if (currentRivals < MIN_RIVALS && secureRandom() < 0.1) {
    const ident = BrandSystem.generateIdentity(usedNames);
    const name = BrandSystem.getStudioName(ident);
    const archetype = 'indie'; // Upstarts usually start small
    const archData = ARCHETYPES[archetype];

    const newStudio: RivalStudio = {
      id: `upstart-studio-${Date.now()}`,
      name,
      motto: generateMotto(),
      archetype: archetype as any,
      foundedWeek: state.week,
      parentBrand: ident.core,
      strength: 30 + Math.floor(secureRandom() * 20),
      cash: archData.startingCash * 0.8,
      prestige: 50 + Math.floor(randRange(0, 20)),
      recentActivity: 'A new boutique studio enters the fray with big ambitions.',
      projects: {},
      contracts: [],
      projectCount: 0,
      motivationProfile: { financial: 50, prestige: 80, legacy: 40, aggression: 70 },
      currentMotivation: 'MARKET_DISRUPTION',
      ownedPlatforms: []
    };

    impacts.push({
      type: 'INDUSTRY_UPDATE',
      payload: { 
        update: {},
        rival: { rivalId: newStudio.id, update: newStudio }
      }
    });

    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `NEW PLAYER: ${name} launches as artisanal studio`,
        description: `With a focus on quality over volume, ${name} has officially entered the market as a boutique ${archetype} studio.`,
        category: 'general'
      }
    });
  }

  // Spawn Streamer Upstart
  if (currentStreamers < MIN_STREAMERS && secureRandom() < 0.1) {
     const ident = BrandSystem.generateIdentity(usedNames);
     const name = BrandSystem.getStreamingName(ident);
     
     const newStreamer: StreamerPlatform = {
        id: `upstart-streamer-${Date.now()}`,
        name,
        archetype: 'streamer',
        foundedWeek: state.week,
        parentBrand: ident.core,
        subscribers: 2_000_000,
        churnRate: 0.08,
        contentLibraryQuality: 30,
        marketingSpend: 1_000_000,
        subscriberHistory: [{ week: state.week, count: 2_000_000 }],
        marketShare: 0.02,
        reach: 40
     };

     impacts.push({
        type: 'BUYER_UPDATED',
        payload: {
           buyerId: newStreamer.id,
           update: newStreamer
        }
     });

     impacts.push({
        type: 'NEWS_ADDED',
        payload: {
           headline: `DISRUPTOR: ${name} enters the streaming wars`,
           description: `A new streaming platform, ${name}, has launched today with an aggressive subscriber acquisition strategy.`,
           category: 'market'
        }
     });
  }

  return impacts;
}
