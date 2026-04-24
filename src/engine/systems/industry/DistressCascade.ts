import { GameState, StateImpact, RivalStudio, StreamerPlatform } from '@/engine/types';
import { pick, secureRandom } from '../../utils';
import { getMarketHeat } from './MacroCycle';
import { isAcquirerBlockedByAntitrust } from './Antitrust';

/**
 * DistressCascade — stepwise collapse ladder for insolvent rivals.
 *
 * Why staged: real studios don't instantly vanish when cash turns negative. They
 * shed IP (MGM/Bond), then talent + backlot (Paramount/Nick library), then shop
 * themselves to a richer rival (Lionsgate-Summit, Amazon-MGM), and only then
 * liquidate (Orion, Carolco). Each tick advances at most one stage per rival so
 * the cascade reads like a news cycle, not a mass extinction.
 */

export interface DistressEvent {
  week: number;
  year: number;
  stage: 1 | 2 | 3 | 4;
  kind: 'ip-sale' | 'talent-release' | 'backlot-sale' | 'platform-sale' | 'distressed-ma' | 'bankruptcy';
  studioId: string;
  studioName: string;
  counterpartyId?: string;
  counterpartyName?: string;
  amount?: number;
  note: string;
}

export const distressEventLog: DistressEvent[] = [];

// Track consecutive-weeks-negative per rival (module-level — rival objects are replaced each tick).
const negativeStreak: Record<string, number> = {};
// Cooldown between stage actions on the same rival; prevents one studio burning through
// all four stages in four ticks when we want a slow-motion unraveling.
const lastActionWeek: Record<string, number> = {};
// Per-rival, per-stage action counts. Once a studio has done N actions at a stage, the next
// tick escalates them instead of looping forever on backlot sales.
const stageActionCount: Record<string, { s1: number; s2: number; s3: number }> = {};

const STREAK_STAGE1 = 26;         // ~6 months negative before IP sale
const STAGE_COOLDOWN = 26;        // ~6 months between stage actions on same rival — news-cycle pacing
const MAX_STAGE1 = 1;             // one crown-jewel sale is the realistic ceiling before escalation
const MAX_STAGE2 = 2;             // two asset sales max before forced M&A/bankruptcy
const MAX_STAGE3 = 2;             // at most 2 rejected M&A attempts before bankruptcy
const STAGE1_CASH = 0;            // cash < 0 required
const STAGE2_CASH = -75_000_000;
const STAGE3_CASH = -200_000_000;
const STAGE4_CASH = -400_000_000;

export function resetDistressState() {
  distressEventLog.length = 0;
  for (const k of Object.keys(negativeStreak)) delete negativeStreak[k];
  for (const k of Object.keys(lastActionWeek)) delete lastActionWeek[k];
  for (const k of Object.keys(stageActionCount)) delete stageActionCount[k];
}

function counts(id: string) {
  if (!stageActionCount[id]) stageActionCount[id] = { s1: 0, s2: 0, s3: 0 };
  return stageActionCount[id];
}

function updateStreaks(state: GameState) {
  const rivals = Object.values(state.entities.rivals || {});
  const live = new Set(rivals.map(r => r.id));
  // Prune dead rivals from the trackers so a reused id doesn't inherit stale state.
  for (const k of Object.keys(negativeStreak)) if (!live.has(k)) delete negativeStreak[k];
  for (const k of Object.keys(lastActionWeek)) if (!live.has(k)) delete lastActionWeek[k];
  for (const k of Object.keys(stageActionCount)) if (!live.has(k)) delete stageActionCount[k];
  for (const r of rivals) {
    if ((r.cash || 0) < 0) negativeStreak[r.id] = (negativeStreak[r.id] || 0) + 1;
    else negativeStreak[r.id] = 0;
  }
}

function classifyStage(r: RivalStudio): 0 | 1 | 2 | 3 | 4 {
  const cash = r.cash || 0;
  const streak = negativeStreak[r.id] || 0;
  const c = counts(r.id);

  // Hard escalation: once you've exhausted a stage's action budget, you can't loop — move up.
  // This is what prevents the "100 backlot sales in a row" pathology.
  const s2Done = c.s2 >= MAX_STAGE2;
  const s3Done = c.s3 >= MAX_STAGE3;

  if (cash < STAGE4_CASH || (cash < STAGE3_CASH && s2Done && s3Done)) return 4;
  if (cash < STAGE3_CASH || (cash < STAGE2_CASH && s2Done)) return 3;
  if (cash < STAGE2_CASH) return 2;
  if (cash < STAGE1_CASH && streak >= STREAK_STAGE1 && c.s1 < MAX_STAGE1) return 1;
  return 0;
}

function logEvent(e: DistressEvent) {
  distressEventLog.push(e);
}

// Placeholder franchise names used when the seller has no explicit vault ownership —
// the abstract sale still reads as a real news event for the player-facing log.
const ABSTRACT_FRANCHISE_LABELS = [
  'catalog rights', 'library titles', 'franchise package', 'back-catalog bundle', 'flagship IP'
];

function stage1IPFireSale(
  state: GameState,
  seller: RivalStudio
): StateImpact[] {
  const impacts: StateImpact[] = [];

  const rivals = Object.values(state.entities.rivals || {});
  const buyers = rivals.filter(r => r.id !== seller.id && (r.cash || 0) > 500_000_000);
  if (buyers.length === 0) return impacts;

  const buyer = pick(buyers);
  const heat = getMarketHeat(state.week);
  // Price scales with seller prestige/strength as franchise-value proxy — a beaten-down
  // major still carries real catalog weight; a cold indie commands the floor.
  const franchiseProxy = Math.max(100_000_000, (seller.prestige || 30) * 3_000_000 + (seller.strength || 30) * 2_000_000);
  const basePrice = Math.max(50_000_000, franchiseProxy * 0.5 * heat);
  const price = Math.round(basePrice * 0.7);

  // If the seller does own vault assets, transfer the top one — else run a cash-only transfer.
  const ownedAssets = (state.ip?.vault || []).filter(a => a.ownerStudioId === (seller.id as any));
  let franchiseName: string;
  if (ownedAssets.length > 0) {
    const asset = pick(ownedAssets);
    const newVault = (state.ip.vault || []).map(a =>
      a.id === asset.id ? { ...a, ownerStudioId: buyer.id as any } : a
    );
    impacts.push({ type: 'INDUSTRY_UPDATE', payload: { update: { 'ip.vault': newVault } } as any });
    franchiseName = asset.title;
  } else {
    franchiseName = pick(ABSTRACT_FRANCHISE_LABELS);
  }

  impacts.push({
    type: 'RIVAL_UPDATED',
    payload: { rivalId: seller.id, update: { cash: (seller.cash || 0) + price, prestige: Math.max(0, (seller.prestige || 0) - 5) } } as any
  });
  impacts.push({
    type: 'RIVAL_UPDATED',
    payload: { rivalId: buyer.id, update: { cash: (buyer.cash || 0) - price } } as any
  });

  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: `FIRE SALE: ${seller.name} sells ${franchiseName} to ${buyer.name} for $${(price / 1e6).toFixed(0)}M`,
      description: `Facing sustained losses, ${seller.name} has offloaded ${franchiseName} in a distressed IP sale.`,
      category: 'market'
    }
  });

  logEvent({
    week: state.week, year: Math.floor(state.week / 52) + 1975,
    stage: 1, kind: 'ip-sale',
    studioId: seller.id, studioName: seller.name,
    counterpartyId: buyer.id, counterpartyName: buyer.name,
    amount: price, note: `Sold ${franchiseName}`
  });
  counts(seller.id).s1++;
  return impacts;
}

function stage2AssetLiquidation(state: GameState, seller: RivalStudio): StateImpact[] {
  const impacts: StateImpact[] = [];

  // Choose one of: talent release, backlot sale, or platform-stake sale.
  // Platform sale is the biggest hit and only available to platform-owners.
  const ownsPlatform = (seller.ownedPlatforms || []).length > 0;
  const roll = secureRandom();

  if (ownsPlatform && roll < 0.25) {
    // Sell platform stake — large one-time injection, strips owned platform.
    const platformId = (seller.ownedPlatforms || [])[0];
    const platform = state.market.buyers.find(b => b.id === platformId) as StreamerPlatform | undefined;
    const proceeds = platform
      ? Math.max(500_000_000, Math.min(2_000_000_000, (platform.subscribers || 0) * 8))
      : 500_000_000;
    const newOwned = (seller.ownedPlatforms || []).filter(id => id !== platformId);
    impacts.push({
      type: 'RIVAL_UPDATED',
      payload: { rivalId: seller.id, update: { cash: (seller.cash || 0) + proceeds, ownedPlatforms: newOwned } } as any
    });
    if (platform) {
      impacts.push({
        type: 'BUYER_UPDATED',
        payload: { buyerId: platform.id, update: { ownerId: undefined, parentBrand: undefined } } as any
      });
    }
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `LIQUIDATION: ${seller.name} divests ${platform?.name || 'streaming platform'} for $${(proceeds / 1e6).toFixed(0)}M`,
        description: `${seller.name} has unwound its platform bet to stanch the bleeding.`,
        category: 'market'
      }
    });
    logEvent({
      week: state.week, year: Math.floor(state.week / 52) + 1975,
      stage: 2, kind: 'platform-sale',
      studioId: seller.id, studioName: seller.name, amount: proceeds,
      note: `Sold ${platform?.name || 'platform stake'}`
    });
    counts(seller.id).s2++;
    return impacts;
  }

  if (roll < 0.6) {
    // Backlot / facility sale — flat one-time, prestige tax.
    const proceeds = Math.round(50_000_000 + secureRandom() * 150_000_000);
    impacts.push({
      type: 'RIVAL_UPDATED',
      payload: {
        rivalId: seller.id,
        update: {
          cash: (seller.cash || 0) + proceeds,
          prestige: Math.max(0, (seller.prestige || 0) - 10)
        }
      } as any
    });
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `BACKLOT SALE: ${seller.name} sells production facilities for $${(proceeds / 1e6).toFixed(0)}M`,
        description: `${seller.name} has sold studio real estate and equipment in a distressed asset sale.`,
        category: 'market'
      }
    });
    logEvent({
      week: state.week, year: Math.floor(state.week / 52) + 1975,
      stage: 2, kind: 'backlot-sale',
      studioId: seller.id, studioName: seller.name, amount: proceeds,
      note: 'Backlot liquidation'
    });
    counts(seller.id).s2++;
    return impacts;
  }

  // Talent contract release: recover ~20% of outstanding contract value as cash.
  const contracts = Object.values(state.entities.contracts || {}).filter(
    (c: any) => c.studioId === seller.id || c.ownerId === seller.id
  ) as any[];
  const releaseCount = Math.max(1, Math.floor(contracts.length * (0.3 + secureRandom() * 0.2)));
  const toRelease = contracts.slice(0, releaseCount);
  const recovered = toRelease.reduce(
    (sum, c) => sum + (Number(c.totalValue || c.fee || c.weeklyRate * 10 || 1_000_000)) * 0.2,
    0
  );
  // Fallback floor — even if no contracts are trackable on the rival, the studio still gets some recovery.
  const proceeds = Math.max(25_000_000, Math.round(recovered));
  impacts.push({
    type: 'RIVAL_UPDATED',
    payload: { rivalId: seller.id, update: { cash: (seller.cash || 0) + proceeds } } as any
  });
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: `RELEASE: ${seller.name} releases ${releaseCount || 'several'} talent contracts, recovers $${(proceeds / 1e6).toFixed(0)}M`,
      description: `${seller.name} has torn up talent deals to free cash as losses mount.`,
      category: 'market'
    }
  });
  logEvent({
    week: state.week, year: Math.floor(state.week / 52) + 1975,
    stage: 2, kind: 'talent-release',
    studioId: seller.id, studioName: seller.name, amount: proceeds,
    note: `${releaseCount} contracts released`
  });
  counts(seller.id).s2++;
  return impacts;
}

function stage3DistressedMA(state: GameState, target: RivalStudio): StateImpact[] {
  const impacts: StateImpact[] = [];
  const rivals = Object.values(state.entities.rivals || {});
  // Richest acquirer with >$750M cash, not antitrust-frozen, not the target itself.
  const candidates = rivals
    .filter(r => r.id !== target.id && (r.cash || 0) > 750_000_000)
    .filter(r => !isAcquirerBlockedByAntitrust(r.id, state.week))
    .sort((a, b) => (b.cash || 0) - (a.cash || 0));
  if (candidates.length === 0) {
    // No buyer found — still counts as a failed stage-3 attempt so we escalate to bankruptcy.
    counts(target.id).s3++;
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `SHOPPED: ${target.name} fails to find buyer; bankruptcy looms`,
        description: `${target.name} sought a rescue acquisition but found no willing acquirer.`,
        category: 'market'
      }
    });
    return impacts;
  }

  const acquirer = candidates[0];
  // Fire-sale price: token amount reflecting toxic negative cash.
  const assetValue = Math.max(50_000_000, (target.strength || 20) * 2_000_000 + (target.prestige || 30) * 500_000);
  const price = Math.round(assetValue * (0.3 + secureRandom() * 0.2));

  impacts.push({
    type: 'RIVAL_UPDATED',
    payload: { rivalId: acquirer.id, update: { cash: (acquirer.cash || 0) - price, prestige: Math.min(100, (acquirer.prestige || 0) + 5) } } as any
  });
  impacts.push({
    type: 'INDUSTRY_UPDATE',
    payload: { update: {}, mergedRivalId: target.id, acquirerId: acquirer.id } as any
  });
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: `DISTRESSED M&A: ${acquirer.name} absorbs ${target.name} at fire-sale $${(price / 1e6).toFixed(0)}M`,
      description: `With ${target.name} running a cash deficit, ${acquirer.name} has struck a rescue acquisition on punitive terms.`,
      category: 'market'
    }
  });
  logEvent({
    week: state.week, year: Math.floor(state.week / 52) + 1975,
    stage: 3, kind: 'distressed-ma',
    studioId: target.id, studioName: target.name,
    counterpartyId: acquirer.id, counterpartyName: acquirer.name,
    amount: price, note: 'Rescue acquisition'
  });
  counts(target.id).s3++;
  return impacts;
}

function stage4Bankruptcy(state: GameState, target: RivalStudio): StateImpact[] {
  const impacts: StateImpact[] = [];

  // Remaining IP reverts to open market so indies can pick it up later.
  const orphanedVault = (state.ip.vault || []).map(a =>
    a.ownerStudioId === (target.id as any)
      ? { ...a, ownerStudioId: undefined, rightsOwner: 'MARKET' as const }
      : a
  );
  impacts.push({
    type: 'INDUSTRY_UPDATE',
    payload: { update: { 'ip.vault': orphanedVault }, bankruptRivalId: target.id } as any
  });
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: `BANKRUPTCY: ${target.name} liquidates; catalog reverts to open market`,
      description: `After exhausting asset sales and finding no buyer, ${target.name} has filed Chapter 7.`,
      category: 'market'
    }
  });
  logEvent({
    week: state.week, year: Math.floor(state.week / 52) + 1975,
    stage: 4, kind: 'bankruptcy',
    studioId: target.id, studioName: target.name,
    note: 'Liquidated, IP to public market'
  });
  return impacts;
}

export function tickDistressCascade(state: GameState): StateImpact[] {
  updateStreaks(state);
  const impacts: StateImpact[] = [];
  const rivals = Object.values(state.entities.rivals || {});
  const MIN_FLOOR = 7; // don't let cascade alone collapse the field below the spawner floor

  // Pick distressed rivals, highest-stage first so the worst-off progress before the just-slipping.
  const queue = rivals
    .map(r => ({ r, stage: classifyStage(r) }))
    .filter(x => x.stage > 0)
    .sort((a, b) => b.stage - a.stage);

  for (const { r, stage } of queue) {
    const last = lastActionWeek[r.id] ?? -9999;
    if (state.week - last < STAGE_COOLDOWN) continue;

    let emitted: StateImpact[] = [];
    if (stage === 1) emitted = stage1IPFireSale(state, r);
    else if (stage === 2) emitted = stage2AssetLiquidation(state, r);
    else if (stage === 3) emitted = stage3DistressedMA(state, r);
    else if (stage === 4) {
      if (rivals.length <= MIN_FLOOR) continue;
      emitted = stage4Bankruptcy(state, r);
    }

    if (emitted.length > 0) {
      impacts.push(...emitted);
      lastActionWeek[r.id] = state.week;
      // One cascade action per tick keeps the news cycle legible.
      break;
    }
  }

  return impacts;
}
