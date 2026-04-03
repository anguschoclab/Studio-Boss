import { Buyer, BuyerArchetype, NetworkPlatform, PremiumPlatform, StreamerPlatform } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { 
  PREMIUM_PREFIXES, PREMIUM_SUFFIXES,
} from '../data/names.data';
import { BrandSystem } from './BrandSystem';

function generateBuyerName(archetype: BuyerArchetype, existing: Set<string>, rng: RandomGenerator): string {
  const identity = BrandSystem.generateIdentity(existing, rng);
  switch (archetype) {
    case 'network': return BrandSystem.getNetworkName(identity, rng);
    case 'premium': {
       const prefix = rng.pick(PREMIUM_PREFIXES);
       const suffix = rng.pick(PREMIUM_SUFFIXES);
       return `${prefix} ${suffix}`;
    }
    case 'streamer': return BrandSystem.getStreamingName(identity, rng);
  }
}

export function generateBuyers(rng: RandomGenerator, config?: { networks?: number; premium?: number; streamers?: number }): Buyer[] {
  const { networks = 2, premium = 2, streamers = 3 } = config || {};
  const buyers: Buyer[] = [];
  const usedNames = new Set<string>();

  // Generate networks
  for (let i = 0; i < networks; i++) {
    const name = generateBuyerName('network', usedNames, rng);
    usedNames.add(name);
    const buyer: NetworkPlatform = {
      id: rng.uuid('buyer-net'),
      name,
      archetype: 'network',
      foundedWeek: 1,
      reach: Math.floor(rng.range(40, 95)),
      marketShare: rng.range(0.1, 0.2),
    };
    buyers.push(buyer);
  }

  // Generate premium platforms
  for (let i = 0; i < premium; i++) {
    const name = generateBuyerName('premium', usedNames, rng);
    usedNames.add(name);
    const buyer: PremiumPlatform = {
      id: rng.uuid('buyer-prem'),
      name,
      archetype: 'premium',
      foundedWeek: 1,
      prestigeBonus: Math.floor(rng.range(10, 45)),
      marketShare: rng.range(0.05, 0.1),
      reach: Math.floor(rng.range(30, 60)),
    };
    buyers.push(buyer);
  }

  // Generate streamers
  for (let i = 0; i < streamers; i++) {
    const name = generateBuyerName('streamer', usedNames, rng);
    usedNames.add(name);
    const buyer: StreamerPlatform = {
      id: rng.uuid('buyer-str'),
      name,
      archetype: 'streamer',
      foundedWeek: 1,
      subscribers: Math.floor(rng.range(5_000_000, 80_000_000)),
      churnRate: parseFloat(((rng.next()) * 0.09 + 0.01).toFixed(3)),
      contentLibraryQuality: Math.floor(rng.range(30, 90)),
      marketingSpend: Math.floor(rng.range(500_000, 5_000_000)),
      marketShare: rng.range(0.2, 0.4),
      reach: Math.floor(rng.range(70, 95)),
      subscriberHistory: [],
    };
    buyers.push(buyer);
  }

  return buyers;
}
