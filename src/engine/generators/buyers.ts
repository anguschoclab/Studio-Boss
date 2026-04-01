import { Buyer, BuyerArchetype, NetworkPlatform, PremiumPlatform, StreamerPlatform } from '@/engine/types';
import { pick, randRange, secureRandom } from '../utils';
import { 
  NETWORK_PREFIXES, NETWORK_SUFFIXES,
  PREMIUM_PREFIXES, PREMIUM_SUFFIXES,
  STREAMER_PREFIXES, STREAMER_SUFFIXES
} from '../data/names.data';
import { BrandSystem } from './BrandSystem';

function generateBuyerName(archetype: BuyerArchetype, existing: Set<string>): string {
  const identity = BrandSystem.generateIdentity(existing);
  switch (archetype) {
    case 'network': return BrandSystem.getNetworkName(identity);
    case 'premium': {
       const prefix = pick(PREMIUM_PREFIXES);
       const suffix = pick(PREMIUM_SUFFIXES);
       return `${prefix} ${suffix}`;
    }
    case 'streamer': return BrandSystem.getStreamingName(identity);
  }
}

export function generateBuyers(config?: { networks?: number; premium?: number; streamers?: number }): Buyer[] {
  const { networks = 2, premium = 2, streamers = 3 } = config || {};
  const buyers: Buyer[] = [];
  const usedNames = new Set<string>();

  // Generate networks
  for (let i = 0; i < networks; i++) {
    const name = generateBuyerName('network', usedNames);
    usedNames.add(name);
    const buyer: NetworkPlatform = {
      id: `buyer-net-${i}-${Date.now()}`,
      name,
      archetype: 'network',
      foundedWeek: 1,
      reach: Math.floor(randRange(40, 95)),
      marketShare: randRange(0.1, 0.2),
    };
    buyers.push(buyer);
  }

  // Generate premium platforms
  for (let i = 0; i < premium; i++) {
    const name = generateBuyerName('premium', usedNames);
    usedNames.add(name);
    const buyer: PremiumPlatform = {
      id: `buyer-prem-${i}-${Date.now()}`,
      name,
      archetype: 'premium',
      foundedWeek: 1,
      prestigeBonus: Math.floor(randRange(10, 45)),
      marketShare: randRange(0.05, 0.1),
      reach: Math.floor(randRange(30, 60)),
    };
    buyers.push(buyer);
  }

  // Generate streamers
  for (let i = 0; i < streamers; i++) {
    const name = generateBuyerName('streamer', usedNames);
    usedNames.add(name);
    const buyer: StreamerPlatform = {
      id: `buyer-str-${i}-${Date.now()}`,
      name,
      archetype: 'streamer',
      foundedWeek: 1,
      subscribers: Math.floor(randRange(5_000_000, 80_000_000)),
      churnRate: parseFloat((secureRandom() * 0.09 + 0.01).toFixed(3)),
      contentLibraryQuality: Math.floor(randRange(30, 90)),
      marketingSpend: Math.floor(randRange(500_000, 5_000_000)),
      marketShare: randRange(0.2, 0.4),
      reach: Math.floor(randRange(70, 95)),
      subscriberHistory: [],
    };
    buyers.push(buyer);
  }

  return buyers;
}
