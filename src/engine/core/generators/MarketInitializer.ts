import { ArchetypeKey, RivalStudio } from '../../types/studio.types';
import { BrandSystem } from '../../generators/BrandSystem';
import { generateBuyers } from '../../generators/buyers';
import { RandomGenerator } from '../../utils/rng';
import { StreamerPlatform } from '@/engine/types';

interface MarketInitializerOptions {
  networks?: number;
  premium?: number;
  streamers?: number;
}

export function initializeMarket(
  rng: RandomGenerator,
  rivals: RivalStudio[],
  playerStudioId: string,
  playerArchetype: ArchetypeKey,
  studioName: string,
  options: MarketInitializerOptions = {}
): {
  initialBuyers: import('@/engine/types').Buyer[];
  playerOwnedPlatforms: string[];
} {
  const { networks = 4, premium = 4, streamers = 5 } = options;

  const initialBuyers = generateBuyers(rng, { networks, premium, streamers });
  const playerOwnedPlatforms: string[] = [];

  // Vertical Integration: Assign starting platforms to Majors/Mid-tiers
  if (playerArchetype !== 'indie') {
    const playerBrand = { core: studioName.split(' ')[0], isConglomerate: true };
    const playerStreamer: StreamerPlatform = {
      id: rng.uuid('BUY'),
      name: BrandSystem.getStreamingName(playerBrand, rng),
      archetype: 'streamer',
      foundedWeek: 1,
      parentBrand: playerBrand.core,
      ownerId: playerStudioId,
      subscribers: playerArchetype === 'major' ? 25_000_000 : 10_000_000,
      churnRate: 0.05,
      contentLibraryQuality: 60,
      marketingSpend: 2_000_000,
      marketShare: playerArchetype === 'major' ? 0.35 : 0.15,
      reach: playerArchetype === 'major' ? 95 : 70,
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
        id: rng.uuid('BUY'),
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

  return { initialBuyers, playerOwnedPlatforms };
}
