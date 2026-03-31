import { Buyer, StreamerPlatform, GameState } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { pick, secureRandom, randRange } from '../utils';

const MERGER_HEADLINES = [
  (a: string, b: string) => `BREAKING: ${a} acquires ${b} in landmark media deal!`,
  (a: string, b: string) => `Industry shocked as ${a} announces hostile takeover of ${b}.`,
  (a: string, b: string) => `${a} and ${b} announce merger — regulators concerned.`,
  (a: string, b: string) => `${a} absorbs ${b} in a bid for streaming dominance.`,
  (a: string, b: string) => `Consolidation continues: ${a} swallows ${b} whole.`,
];

const VULNERABILITY_HEADLINES = [
  (name: string) => `${name} reportedly exploring strategic options amid subscriber losses.`,
  (name: string) => `Analysts downgrade ${name} — acquisition target rumors swirl.`,
  (name: string) => `${name} cash reserves dwindling — sale imminent?`,
];

const STREAMER_GROWTH_EVENTS = [
  (name: string) => `${name} reports record subscriber growth this quarter.`,
  (name: string) => `${name} announces ambitious content spending increase.`,
  (name: string) => `${name} poaches top executive from rival platform.`,
];

const STREAMER_DECLINE_EVENTS = [
  (name: string) => `${name} faces backlash over sudden price hike.`,
  (name: string) => `${name} loses exclusive rights to major franchise.`,
  (name: string) => `Subscriber exodus hits ${name} after controversial content purge.`,
];

/**
 * Simulate weekly buyer/platform dynamics — subscriber fluctuations, 
 * financial health, and M&A activity.
 */
export function advanceBuyers(state: GameState): StateImpact {
  const impact: StateImpact = {
    buyerUpdates: [],
    newHeadlines: [],
  };

  const buyers = state.market.buyers;
  const activeBuyers = buyers.filter(b => !b.acquiredBy);

  // Update each active buyer
  for (const buyer of activeBuyers) {
    const update: Partial<Buyer> = {};

    // Financial simulation
    const currentCash = buyer.cash ?? 50_000_000;
    const currentStrength = buyer.strength ?? 60;

    if (buyer.archetype === 'streamer') {
      const streamer = buyer as StreamerPlatform;
      // Subscriber fluctuation
      const growth = secureRandom() < 0.6 ? 1 : -1;
      const delta = Math.floor(streamer.subscribers * streamer.churnRate * growth);
      const newSubs = Math.max(1_000_000, streamer.subscribers + delta);
      
      // Revenue correlates with subscribers
      const revenue = newSubs * 0.8; // ~$0.80/sub/week simplified
      const costs = streamer.marketingSpend + (streamer.contentLibraryQuality * 50_000);
      const newCash = currentCash + revenue - costs;

      (update as Partial<StreamerPlatform>).subscribers = newSubs;
      update.cash = newCash;
      update.strength = Math.max(10, Math.min(100, currentStrength + (growth * randRange(0, 3))));

      // Occasional headlines
      if (secureRandom() < 0.03) {
        const templates = growth > 0 ? STREAMER_GROWTH_EVENTS : STREAMER_DECLINE_EVENTS;
        impact.newHeadlines!.push({
          category: 'market',
          text: pick(templates)(buyer.name),
        });
      }
    } else {
      // Network / Premium — simpler cash simulation
      const cashDelta = randRange(-2_000_000, 5_000_000);
      update.cash = currentCash + cashDelta;
      update.strength = Math.max(10, Math.min(100, currentStrength + randRange(-2, 2)));
    }

    // Check vulnerability
    const finalCash = update.cash ?? currentCash;
    const finalStrength = update.strength ?? currentStrength;

    if (finalCash < 10_000_000 && finalStrength < 35) {
      if (!buyer.isAcquirable) {
        update.isAcquirable = true;
        impact.newHeadlines!.push({
          category: 'market',
          text: pick(VULNERABILITY_HEADLINES)(buyer.name),
        });
      }
    } else {
      update.isAcquirable = false;
    }

    impact.buyerUpdates!.push({ buyerId: buyer.id, update });
  }

  // M&A: Strong buyers may acquire vulnerable ones
  if (secureRandom() < 0.08) { // ~8% chance per week
    const vulnerable = activeBuyers.filter(b => b.isAcquirable);
    const strong = activeBuyers.filter(b => !b.isAcquirable && (b.strength ?? 60) > 60);

    if (vulnerable.length > 0 && strong.length > 0) {
      const acquirer = pick(strong);
      const target = pick(vulnerable);

      if (acquirer.id !== target.id) {
        // Execute merger
        impact.buyerUpdates!.push({
          buyerId: target.id,
          update: {
            acquiredBy: acquirer.id,
            parentCompany: acquirer.name,
          }
        });

        impact.buyerUpdates!.push({
          buyerId: acquirer.id,
          update: {
            ownedPlatforms: [...(acquirer.ownedPlatforms || []), target.id],
            strength: Math.min(100, (acquirer.strength ?? 60) + 10),
          }
        });

        impact.newHeadlines!.push({
          category: 'market',
          text: pick(MERGER_HEADLINES)(acquirer.name, target.name),
        });
      }
    }
  }

  return impact;
}
