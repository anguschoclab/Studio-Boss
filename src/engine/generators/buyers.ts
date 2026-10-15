import {
  Buyer,
  BuyerArchetype,
  NetworkPlatform,
  PremiumPlatform,
  StreamerPlatform,
} from "@/engine/types";
import { pick, randRange, generateId, rand } from "../utils";
import { PREMIUM_PREFIXES, PREMIUM_SUFFIXES } from "../data/names.data";
import { BrandSystem } from "./BrandSystem";

function generateBuyerName(
  archetype: BuyerArchetype,
  existing: Set<string>
): { name: string; core?: string } {
  if (archetype === "premium") {
    // Premium names ignore the brand identity — dedupe on the full name.
    for (let attempt = 0; attempt < 50; attempt++) {
      const name = `${pick(PREMIUM_PREFIXES)} ${pick(PREMIUM_SUFFIXES)}`;
      if (!existing.has(name)) return { name };
    }
    return { name: `${pick(PREMIUM_PREFIXES)} ${pick(PREMIUM_SUFFIXES)}` };
  }
  const identity = BrandSystem.generateIdentity(existing);
  const name =
    archetype === "network"
      ? BrandSystem.getNetworkName(identity)
      : BrandSystem.getStreamingName(identity);
  return { name, core: identity.core };
}

export function generateBuyers(config?: {
  networks?: number;
  premium?: number;
  streamers?: number;
}): Buyer[] {
  const { networks = 2, premium = 2, streamers = 3 } = config || {};
  const buyers: Buyer[] = [];
  const usedNames = new Set<string>();

  // Generate networks
  for (let i = 0; i < networks; i++) {
    const { name, core } = generateBuyerName("network", usedNames);
    usedNames.add(name);
    if (core) usedNames.add(core);
    const buyer: NetworkPlatform = {
      id: generateId("BUY"),
      name,
      archetype: "network",
      foundedWeek: 1,
      reach: Math.floor(randRange(40, 95)),
      marketShare: randRange(0.1, 0.2),
    };
    buyers.push(buyer);
  }

  // Generate premium platforms
  for (let i = 0; i < premium; i++) {
    const { name } = generateBuyerName("premium", usedNames);
    usedNames.add(name);
    const buyer: PremiumPlatform = {
      id: generateId("BUY"),
      name,
      archetype: "premium",
      foundedWeek: 1,
      prestigeBonus: Math.floor(randRange(10, 45)),
      marketShare: randRange(0.05, 0.1),
      reach: Math.floor(randRange(30, 60)),
    };
    buyers.push(buyer);
  }

  // Generate streamers
  for (let i = 0; i < streamers; i++) {
    const { name, core } = generateBuyerName("streamer", usedNames);
    usedNames.add(name);
    if (core) usedNames.add(core);
    const buyer: StreamerPlatform = {
      id: generateId("BUY"),
      name,
      archetype: "streamer",
      foundedWeek: 1,
      subscribers: Math.floor(randRange(5_000_000, 80_000_000)),
      churnRate: parseFloat((rand() * 0.09 + 0.01).toFixed(3)),
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
