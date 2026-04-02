import { Buyer, StreamerPlatform, GameState } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { RandomGenerator } from '../utils/rng';

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
 * Simulate weekly buyer/platform dynamics — financial health and M&A activity.
 * Subscriber fluctuations are handled by platformEngine.ts.
 */
export function advanceBuyers(state: GameState, rng: RandomGenerator): StateImpact {
  const impact: StateImpact = {
    buyerUpdates: [],
    newHeadlines: [],
  };

  const currWeek = state.week;
  const buyers = state.market.buyers;
  const activeBuyers = buyers.filter(b => !b.acquiredBy);

  // Update each active buyer's financial health
  for (const buyer of activeBuyers) {
    const update: Partial<Buyer> = {};
    const currentCash = buyer.cash ?? 50_000_000;
    const currentStrength = buyer.strength ?? 60;

    let performance = 0;

    if (buyer.archetype === 'streamer') {
      const streamer = buyer as StreamerPlatform;
      // Financials based on existing subscribers (updated in platformEngine)
      const revenue = streamer.subscribers * 0.8; 
      const costs = (streamer.marketingSpend || 0) + (streamer.contentLibraryQuality * 50_000);
      const newCash = currentCash + revenue - costs;

      update.cash = newCash;
      // Strength drifts based on financial performance
      performance = (revenue - costs) / 1_000_000;
      update.strength = Math.max(10, Math.min(100, currentStrength + performance));

      if (rng.next() < 0.02) {
        impact.newHeadlines!.push({
          id: rng.uuid('hl'),
          week: currWeek,
          category: 'market',
          text: rng.pick(performance > 0 ? STREAMER_GROWTH_EVENTS : STREAMER_DECLINE_EVENTS)(buyer.name),
        });
      }
    } else {
      const cashDelta = Math.floor(rng.range(-2_000_000, 5_000_000));
      update.cash = currentCash + cashDelta;
      update.strength = Math.max(10, Math.min(100, currentStrength + Math.floor(rng.range(-2, 2))));
    }

    // Vulnerability Check
    const finalCash = update.cash ?? currentCash;
    const finalStrength = update.strength ?? currentStrength;

    if (finalCash < 10_000_000 && finalStrength < 35) {
      if (!buyer.isAcquirable) {
        update.isAcquirable = true;
        impact.newHeadlines!.push({
          id: rng.uuid('hl'),
          week: currWeek,
          category: 'market',
          text: rng.pick(VULNERABILITY_HEADLINES)(buyer.name),
        });
      }
    } else {
      update.isAcquirable = false;
    }

    impact.buyerUpdates!.push({ buyerId: buyer.id, update });
  }

  // M&A Execution
  if (rng.next() < 0.08) { 
    const vulnerable = activeBuyers.filter(b => b.isAcquirable);
    const strong = activeBuyers.filter(b => !b.isAcquirable && (b.strength ?? 60) > 70);

    if (vulnerable.length > 0 && strong.length > 0) {
      const acquirer = rng.pick(strong);
      const target = rng.pick(vulnerable);

      if (acquirer.id !== target.id) {
        const maHistory = [...(target.maHistory || [])];
        maHistory.push({
          week: currWeek,
          event: `Acquired by ${acquirer.name}`,
          value: target.cash // Using cash as proxy for valuation
        });

        impact.buyerUpdates!.push({
          buyerId: target.id,
          update: {
            acquiredBy: acquirer.id,
            parentCompany: acquirer.name,
            maHistory
          }
        });

        impact.buyerUpdates!.push({
          buyerId: acquirer.id,
          update: {
            ownedPlatforms: [...(acquirer.ownedPlatforms || []), target.id],
            strength: Math.min(100, (acquirer.strength ?? 60) + 12),
          }
        });

        impact.newHeadlines!.push({
          id: rng.uuid('hl'),
          week: currWeek,
          category: 'market',
          text: rng.pick(MERGER_HEADLINES)(acquirer.name, target.name),
        });
      }
    }
  }

  return impact;
}
