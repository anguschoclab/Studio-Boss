import { Buyer, BuyerArchetype, NetworkPlatform, PremiumPlatform, StreamerPlatform } from '@/engine/types';
import { pick, randRange, secureRandom } from '../utils';
import {
  NETWORK_PREFIXES, NETWORK_SUFFIXES,
  PREMIUM_PREFIXES, PREMIUM_SUFFIXES,
  STREAMER_PREFIXES, STREAMER_SUFFIXES
} from '../data/names.data';

function generateBuyerName(archetype: BuyerArchetype, existing: Set<string>): string {
  let name: string;
  let attempts = 0;
  const prefixes = archetype === 'network' ? NETWORK_PREFIXES
    : archetype === 'premium' ? PREMIUM_PREFIXES
    : STREAMER_PREFIXES;
  const suffixes = archetype === 'network' ? NETWORK_SUFFIXES
    : archetype === 'premium' ? PREMIUM_SUFFIXES
    : STREAMER_SUFFIXES;

  do {
    name = `${pick(prefixes)}${archetype === 'streamer' ? '' : ' '}${pick(suffixes)}`;
    attempts++;
  } while (existing.has(name) && attempts < 50);
  return name;
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
      id: `buyer-net-${i}`,
      name,
      archetype: 'network',
      reach: Math.floor(randRange(40, 95)),
    };
    buyers.push(buyer);
  }

  // Generate premium platforms
  for (let i = 0; i < premium; i++) {
    const name = generateBuyerName('premium', usedNames);
    usedNames.add(name);
    const buyer: PremiumPlatform = {
      id: `buyer-prem-${i}`,
      name,
      archetype: 'premium',
      prestigeBonus: Math.floor(randRange(10, 45)),
    };
    buyers.push(buyer);
  }

  // Generate streamers
  for (let i = 0; i < streamers; i++) {
    const name = generateBuyerName('streamer', usedNames);
    usedNames.add(name);
    const buyer: StreamerPlatform = {
      id: `buyer-str-${i}`,
      name,
      archetype: 'streamer',
      subscribers: Math.floor(randRange(5_000_000, 80_000_000)),
      churnRate: parseFloat((secureRandom() * 0.09 + 0.01).toFixed(3)),
      contentLibraryQuality: Math.floor(randRange(30, 90)),
      marketingSpend: Math.floor(randRange(500_000, 5_000_000)),
    };
    buyers.push(buyer);
  }

  return buyers;
}
