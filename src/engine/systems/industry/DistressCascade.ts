import { GameState, StateImpact, RivalStudio, StreamerPlatform, IPAsset, Franchise, Project } from "@/engine/types";
import { pick, secureRandom } from "../../utils";
import { getMarketHeat } from "./MacroCycle";
import { isAcquirerBlockedByAntitrust } from "./Antitrust";
import { cancelHighestOverheadDeal } from "../deals/ShingleSystem";
import type { DistressedAssetOffer } from "@/engine/types/distress.types";
import { getPlayerId } from "@/engine/utils/ownership";
import { impacts as I } from "../../core/impacts";
import { applyImpacts } from "../../core/impactReducer";
import { getSimMemory } from "../../core/simMemory";
import type { SimMemory } from "@/engine/types/state.types";

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
  kind:
    | "ip-sale"
    | "shelve-project"
    | "library-sale"
    | "backend-sale"
    | "layoffs"
    | "backlot-sale"
    | "platform-sale"
    | "distressed-ma"
    | "bankruptcy";
  studioId: string;
  studioName: string;
  counterpartyId?: string;
  counterpartyName?: string;
  amount?: number;
  note: string;
}

const OFFER_WINDOW_WEEKS = 2; // weeks the player has to decide before the AI buyer takes it

type DistressMem = SimMemory["distress"];

const STREAK_STAGE1 = 26; // ~6 months negative before IP sale
const STAGE_COOLDOWN = 26; // ~6 months between stage actions on same rival — news-cycle pacing
const MAX_STAGE1 = 1; // one crown-jewel sale is the realistic ceiling before escalation
const MAX_STAGE2 = 2; // two asset sales max before forced M&A/bankruptcy
const MAX_STAGE3 = 2; // at most 2 rejected M&A attempts before bankruptcy
const STAGE1_CASH = 0; // cash < 0 required
const STAGE2_CASH = -75_000_000;
const STAGE3_CASH = -200_000_000;
const STAGE4_CASH = -400_000_000;

function counts(distress: DistressMem, id: string) {
  if (!distress.stageActionCount[id]) distress.stageActionCount[id] = { s1: 0, s2: 0, s3: 0 };
  return distress.stageActionCount[id];
}

function updateStreaks(state: GameState, distress: DistressMem) {
  const rivalsObj = state.entities.rivals || {};
  const live = new Set<string>();
  for (const id in rivalsObj) {
    live.add(id);
  }
  for (const k of Object.keys(distress.negativeStreak)) if (!live.has(k)) delete distress.negativeStreak[k];
  for (const k of Object.keys(distress.lastActionWeek)) if (!live.has(k)) delete distress.lastActionWeek[k];
  for (const k of Object.keys(distress.stageActionCount)) if (!live.has(k)) delete distress.stageActionCount[k];

  for (const id in rivalsObj) {
    const r = rivalsObj[id];
    if ((r.cash || 0) < 0) distress.negativeStreak[id] = (distress.negativeStreak[id] || 0) + 1;
    else distress.negativeStreak[id] = 0;
  }
}

function classifyStage(r: RivalStudio, distress: DistressMem): 0 | 1 | 2 | 3 | 4 {
  const cash = r.cash || 0;
  const streak = distress.negativeStreak[r.id] || 0;
  const c = counts(distress, r.id);

  const s2Done = c.s2 >= MAX_STAGE2;
  const s3Done = c.s3 >= MAX_STAGE3;

  if (cash < STAGE4_CASH || (cash < STAGE3_CASH && s2Done && s3Done)) return 4;
  if (cash < STAGE3_CASH || (cash < STAGE2_CASH && s2Done)) return 3;
  if (cash < STAGE2_CASH) return 2;
  if (cash < STAGE1_CASH && streak >= STREAK_STAGE1 && c.s1 < MAX_STAGE1) return 1;
  return 0;
}

function withLogImpact(state: GameState, impacts: StateImpact[], newEvents: DistressEvent[]): StateImpact[] {
  if (newEvents.length === 0) return impacts;
  const existingLog = getSimMemory(state).eventLogs.distress;
  return [...impacts, I.industryUpdate({ "simMemory.eventLogs.distress": [...existingLog, ...newEvents] })];
}

/**
 * Move a distressed asset to `buyerId` (rival OR the player) and settle cash.
 * Pure: returns the impacts; callers apply them. Reused by the AI fallback and
 * by the player's Acquire action.
 */
export function completeFireSale(
  state: GameState,
  offer: DistressedAssetOffer,
  buyerId: string
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const isPlayerBuyer = buyerId === getPlayerId(state);
  const seller = state.entities.rivals?.[offer.sellerId];

  // 1. Transfer ownership.
  if (offer.assetKind === "franchise") {
    impacts.push(I.franchiseUpdated(offer.assetId, { ownerId: buyerId }));
  } else {
    const newVault = (state.ip.vault || []).map((a) =>
      a.id === offer.assetId
        ? {
            ...a,
            ownerStudioId: buyerId,
            rightsOwner: isPlayerBuyer ? "STUDIO" : "RIVAL",
          } as IPAsset
        : a
    );
    impacts.push(I.industryUpdate({ "ip.vault": newVault }));
  }

  // 2. Credit the seller (and the standard -5 prestige hit for a distressed sale).
  if (seller) {
    impacts.push(
      I.rivalUpdated(offer.sellerId, {
        cash: (seller.cash || 0) + offer.price,
        prestige: Math.max(0, (seller.prestige || 0) - 5),
      }),
    );
  }

  // 3. Debit the buyer.
  if (isPlayerBuyer) {
    impacts.push(I.fundsDeducted(offer.price));
  } else {
    const buyer = state.entities.rivals?.[buyerId];
    if (buyer) {
      impacts.push(I.rivalUpdated(buyerId, { cash: (buyer.cash || 0) - offer.price }));
    }
  }

  // 4. News.
  const buyerName = isPlayerBuyer
    ? state.studio.name
    : (state.entities.rivals?.[buyerId]?.name ?? "a rival");
  impacts.push(
    I.newsAdded({
      headline: `FIRE SALE: ${offer.sellerName} sells ${offer.assetLabel} to ${buyerName} for $${(offer.price / 1e6).toFixed(0)}M`,
      description: `Facing sustained losses, ${offer.sellerName} has offloaded ${offer.assetLabel} in a distressed IP sale.`,
      category: "market",
    }),
  );

  return impacts;
}

/**
 * Weekly: any distressed offer the player let expire is completed to its AI
 * fallback buyer and removed from the offer list.
 */
export function tickDistressedOffers(state: GameState): StateImpact[] {
  const offers = state.industry?.distressedOffers ?? [];
  if (offers.length === 0) return [];

  const expired = offers.filter((o) => state.week >= o.expiresWeek);
  if (expired.length === 0) return [];

  const impacts: StateImpact[] = [];
  let runningState = state;
  for (const offer of expired) {
    const offerImpacts = completeFireSale(runningState, offer, offer.aiBuyerId);
    impacts.push(...offerImpacts);
    // Fold state forward so the next offer sees updated seller/buyer cash.
    runningState = applyImpacts(runningState, offerImpacts);
  }
  const remaining = offers.filter((o) => state.week < o.expiresWeek);
  impacts.push(I.industryUpdate({ "industry.distressedOffers": remaining }));
  return impacts;
}

export function stage1IPFireSale(state: GameState, seller: RivalStudio, distress?: DistressMem): StateImpact[] {
  const d = distress ?? { negativeStreak: {}, lastActionWeek: {}, stageActionCount: {} };
  const impacts: StateImpact[] = [];
  const newEvents: DistressEvent[] = [];

  // Need either a named franchise or vault asset to sell. Otherwise skip Stage 1 —
  // distressed rivals with no concrete IP fall through to Stage 2 liquidation.
  const ownedFranchises: Franchise[] = [];
  const franchisesDict = state.ip?.franchises || {};
  for (const id in franchisesDict) {
    if (Object.prototype.hasOwnProperty.call(franchisesDict, id)) {
      if (franchisesDict[id].ownerId === seller.id) {
        ownedFranchises.push(franchisesDict[id]);
      }
    }
  }

  const ownedAssets: IPAsset[] = [];
  const vaultArr = state.ip?.vault || [];
  for (let i = 0; i < vaultArr.length; i++) {
    if (vaultArr[i].ownerStudioId === seller.id) {
      ownedAssets.push(vaultArr[i]);
    }
  }
  if (ownedFranchises.length === 0 && ownedAssets.length === 0) return impacts;

  const buyers: RivalStudio[] = [];
  const rivalsDict = state.entities.rivals || {};
  for (const id in rivalsDict) {
    if (Object.prototype.hasOwnProperty.call(rivalsDict, id)) {
      const r = rivalsDict[id];
      if (r.id !== seller.id && (r.cash || 0) > 500_000_000) {
        buyers.push(r);
      }
    }
  }
  if (buyers.length === 0) return impacts;

  const buyer = pick(buyers);
  const heat = getMarketHeat(state.week);
  const franchiseProxy = Math.max(
    100_000_000,
    (seller.prestige || 30) * 3_000_000 + (seller.strength || 30) * 2_000_000
  );
  const basePrice = Math.max(50_000_000, franchiseProxy * 0.5 * heat);
  const price = Math.round(basePrice * 0.7);

  // Build the offer (asset id/label + AI fallback buyer + price are already chosen above).
  let assetKind: "franchise" | "vault";
  let assetId: string;
  let assetLabel: string;
  if (ownedFranchises.length > 0) {
    const franchise = pick(ownedFranchises);
    assetKind = "franchise";
    assetId = franchise.id;
    assetLabel = `franchise '${franchise.name}'`;
  } else {
    const named = ownedAssets.filter((a) => {
      const t = a.title;
      return typeof t === "string" && t.trim().length > 0;
    });
    if (named.length === 0) return [];
    const asset = pick(named);
    assetKind = "vault";
    assetId = asset.id;
    assetLabel = `'${asset.title}'`;
  }

  const offer: import("@/engine/types/distress.types").DistressedAssetOffer = {
    id: `distress-${seller.id}-${state.week}`,
    sellerId: seller.id,
    sellerName: seller.name,
    assetKind,
    assetId,
    assetLabel,
    price,
    aiBuyerId: buyer.id,
    aiBuyerName: buyer.name,
    createdWeek: state.week,
    expiresWeek: state.week + OFFER_WINDOW_WEEKS,
  };

  counts(d, seller.id).s1++;

  // Player gets first right of refusal only if solvent enough to buy.
  const playerCanAfford = (state.finance?.cash ?? 0) >= price;
  if (playerCanAfford) {
    const existing = state.industry?.distressedOffers ?? [];
    impacts.push(I.industryUpdate({ "industry.distressedOffers": [...existing, offer] }));
    impacts.push(I.modalTriggered("DISTRESSED_ASSET_OFFER", { offerId: offer.id }));
    newEvents.push({
      week: state.week,
      year: Math.floor(state.week / 52) + 1975,
      stage: 1,
      kind: "ip-sale",
      studioId: seller.id,
      studioName: seller.name,
      counterpartyId: "player",
      counterpartyName: state.studio.name,
      amount: price,
      note: `Offered ${assetLabel} to player`,
    });
    return withLogImpact(state, impacts, newEvents);
  }

  // Player can't afford it — AI buyer completes immediately (original behavior).
  impacts.push(...completeFireSale(state, offer, buyer.id));
  newEvents.push({
    week: state.week,
    year: Math.floor(state.week / 52) + 1975,
    stage: 1,
    kind: "ip-sale",
    studioId: seller.id,
    studioName: seller.name,
    counterpartyId: buyer.id,
    counterpartyName: buyer.name,
    amount: price,
    note: `Sold ${assetLabel}`,
  });
  return withLogImpact(state, impacts, newEvents);
}

export function stage2AssetLiquidation(state: GameState, seller: RivalStudio, distress?: DistressMem): StateImpact[] {
  const d = distress ?? { negativeStreak: {}, lastActionWeek: {}, stageActionCount: {} };
  const impacts: StateImpact[] = [];
  const newEvents: DistressEvent[] = [];

  // Menu: shelve in-production project, library-catalog sale, backend-participation sale,
  // layoffs, backlot sale, or platform divestiture. Talent are free-agents on per-project
  // contracts (see talent.types.ts Contract) — there is no studio payroll to shed.
  const ownsPlatform = (seller.ownedPlatforms || []).length > 0;
  const roll = secureRandom();

  // Shingle-cancellation branch: if the rival has an overhead deal, there's a real-world
  // precedent (WB dropping first-looks during 2023 cuts) to use it as the first-stage-2 move.
  if (roll < 0.15) {
    const cancelImpacts = cancelHighestOverheadDeal(state, seller.id);
    if (cancelImpacts) {
      impacts.push(...cancelImpacts);
      newEvents.push({
        week: state.week,
        year: Math.floor(state.week / 52) + 1975,
        stage: 2,
        kind: "layoffs",
        studioId: seller.id,
        studioName: seller.name,
        note: "Shingle deal cancelled",
      });
      counts(d, seller.id).s2++;
      return withLogImpact(state, impacts, newEvents);
    }
    // No shingle to cancel — fall through to other stage-2 actions.
  }

  if (ownsPlatform && roll < 0.18) {
    // Sell platform stake — large one-time injection, strips owned platform.
    const platformId = (seller.ownedPlatforms || [])[0];
    const platform = state.market.buyers.find((b) => b.id === platformId) as
      StreamerPlatform | undefined;
    const proceeds = platform
      ? Math.max(500_000_000, Math.min(2_000_000_000, (platform.subscribers || 0) * 8))
      : 500_000_000;
    const newOwned = (seller.ownedPlatforms || []).filter((id) => id !== platformId);
    impacts.push(
      I.rivalUpdated(seller.id, {
        cash: (seller.cash || 0) + proceeds,
        ownedPlatforms: newOwned,
      }),
    );
    if (platform) {
      impacts.push(
        I.buyerUpdated(platform.id, { ownerId: undefined, parentBrand: undefined }),
      );
    }
    impacts.push(
      I.newsAdded({
        headline: `LIQUIDATION: ${seller.name} divests ${platform?.name || "streaming platform"} for $${(proceeds / 1e6).toFixed(0)}M`,
        description: `${seller.name} has unwound its platform bet to stanch the bleeding.`,
        category: "market",
      }),
    );
    newEvents.push({
      week: state.week,
      year: Math.floor(state.week / 52) + 1975,
      stage: 2,
      kind: "platform-sale",
      studioId: seller.id,
      studioName: seller.name,
      amount: proceeds,
      note: `Sold ${platform?.name || "platform stake"}`,
    });
    counts(d, seller.id).s2++;
    return withLogImpact(state, impacts, newEvents);
  }

  if (roll < 0.36) {
    // Backlot / facility sale — flat one-time, prestige tax.
    const proceeds = Math.round(50_000_000 + secureRandom() * 150_000_000);
    impacts.push(
      I.rivalUpdated(seller.id, {
        cash: (seller.cash || 0) + proceeds,
        prestige: Math.max(0, (seller.prestige || 0) - 10),
      }),
    );
    impacts.push(
      I.newsAdded({
        headline: `BACKLOT SALE: ${seller.name} sells production facilities for $${(proceeds / 1e6).toFixed(0)}M`,
        description: `${seller.name} has sold studio real estate and equipment in a distressed asset sale.`,
        category: "market",
      }),
    );
    newEvents.push({
      week: state.week,
      year: Math.floor(state.week / 52) + 1975,
      stage: 2,
      kind: "backlot-sale",
      studioId: seller.id,
      studioName: seller.name,
      amount: proceeds,
      note: "Backlot liquidation",
    });
    counts(d, seller.id).s2++;
    return withLogImpact(state, impacts, newEvents);
  }

  if (roll < 0.58) {
    // Shelve an in-production project — Batgirl-style tax write-down. Cancel the most
    // expensive active project, recover ~40% of sunk cost as salvage + write-off value.
    // ⚡ Bolt: Replaced Object.values().filter().sort() with a single for...in maximum-find pass
    const allProjects = state.entities.projects || {};
    let target: Project | undefined = undefined;
    let maxCost = -1;
    for (const id in allProjects) {
      const p = allProjects[id];
      if (
        p.ownerId === seller.id &&
        (p.state === "development" ||
          p.state === "pitching" ||
          p.state === "needs_greenlight" ||
          p.state === "production" ||
          p.state === "post_production")
      ) {
        const cost = p.accumulatedCost || p.budget || 0;
        if (cost > maxCost) {
          maxCost = cost;
          target = p;
        }
      }
    }
    if (target) {
      const sunk = Math.max(target.accumulatedCost || 0, (target.budget || 0) * 0.4);
      const proceeds = Math.max(20_000_000, Math.round(sunk * 0.4));
      impacts.push(
        I.projectUpdated(target.id, { state: "archived", weeklyCost: 0, weeklyRevenue: 0 }),
      );
      impacts.push(
        I.rivalUpdated(seller.id, {
          cash: (seller.cash || 0) + proceeds,
          prestige: Math.max(0, (seller.prestige || 0) - 5),
        }),
      );
      impacts.push(
        I.newsAdded({
          headline: `SHELVED: ${seller.name} scraps ${target.title} mid-production, claims $${(proceeds / 1e6).toFixed(0)}M write-off`,
          description: `${seller.name} has abandoned ${target.title} and will book the sunk cost as a tax write-down.`,
          category: "market",
        }),
      );
      newEvents.push({
        week: state.week,
        year: Math.floor(state.week / 52) + 1975,
        stage: 2,
        kind: "shelve-project",
        studioId: seller.id,
        studioName: seller.name,
        amount: proceeds,
        note: `Shelved ${target.title}`,
      });
      counts(d, seller.id).s2++;
      return withLogImpact(state, impacts, newEvents);
    }
    // Fall through to library sale if no active projects.
  }

  if (roll < 0.78) {
    // Library / back-catalog sale — flip future streaming & ancillary revenue on released titles
    // to a rival or financial buyer for a lump sum. Those IP assets transfer ownership.
    const vaultArr = state.ip?.vault || [];
    const ownedAssets: IPAsset[] = [];
    for (let i = 0; i < vaultArr.length; i++) {
      if (vaultArr[i].ownerStudioId === seller.id) {
        ownedAssets.push(vaultArr[i]);
      }
    }
    if (ownedAssets.length >= 2) {
      const buyers: RivalStudio[] = [];
      const rivalsDict = state.entities.rivals || {};
      for (const id in rivalsDict) {
        if (Object.prototype.hasOwnProperty.call(rivalsDict, id)) {
          const r = rivalsDict[id];
          if (r.id !== seller.id && (r.cash || 0) > 300_000_000) buyers.push(r);
        }
      }
      const buyer = buyers.length > 0 ? pick(buyers) : undefined;
      const bundleSize = Math.min(ownedAssets.length, 3 + Math.floor(secureRandom() * 4));
      const bundle = ownedAssets.slice(0, bundleSize);
      const rawValue = bundle.reduce((s, a) => s + (a.baseValue || 50_000_000), 0);
      const prestigeMult = 0.8 + (seller.prestige || 30) / 100;
      const proceeds = Math.max(
        100_000_000,
        Math.min(500_000_000, Math.round(rawValue * 0.45 * prestigeMult))
      );
      const buyerIdForVault = buyer?.id;
      const bundleIds = new Set(bundle.map((b) => b.id));
      const newVault: IPAsset[] = [];
      for (let i = 0; i < vaultArr.length; i++) {
        const a = vaultArr[i];
        if (bundleIds.has(a.id)) {
          newVault.push({
            ...a,
            ownerStudioId: buyerIdForVault,
            rightsOwner: buyer ? "RIVAL" : "MARKET",
          });
        } else {
          newVault.push(a);
        }
      }
      impacts.push(I.industryUpdate({ "ip.vault": newVault }));
      impacts.push(
        I.rivalUpdated(seller.id, {
          cash: (seller.cash || 0) + proceeds,
          prestige: Math.max(0, (seller.prestige || 0) - 3),
        }),
      );
      if (buyer) {
        impacts.push(I.rivalUpdated(buyer.id, { cash: (buyer.cash || 0) - proceeds }));
      }
      impacts.push(
        I.newsAdded({
          headline: `LIBRARY SALE: ${seller.name} offloads ${bundleSize} back-catalog titles${buyer ? ` to ${buyer.name}` : ""} for $${(proceeds / 1e6).toFixed(0)}M`,
          description: `${seller.name} has sold ongoing streaming and ancillary rights on ${bundleSize} released titles to raise cash.`,
          category: "market",
        }),
      );
      newEvents.push({
        week: state.week,
        year: Math.floor(state.week / 52) + 1975,
        stage: 2,
        kind: "library-sale",
        studioId: seller.id,
        studioName: seller.name,
        counterpartyId: buyer?.id,
        counterpartyName: buyer?.name,
        amount: proceeds,
        note: `${bundleSize} titles`,
      });
      counts(d, seller.id).s2++;
      return withLogImpact(state, impacts, newEvents);
    }
    // Not enough catalog depth — fall through to backend sale.
  }

  if (roll < 0.92) {
    // Backend / participation sale — sell a % of future franchise cashflow (not ownership)
    // for immediate cash. Franchise stays with studio; proceeds scale with franchise value proxy.
    const franchiseProxy =
      (seller.prestige || 30) * 2_000_000 + (seller.strength || 30) * 1_500_000;
    const proceeds = Math.max(
      50_000_000,
      Math.min(300_000_000, Math.round(franchiseProxy * (0.4 + secureRandom() * 0.4)))
    );
    impacts.push(I.rivalUpdated(seller.id, { cash: (seller.cash || 0) + proceeds }));
    impacts.push(
      I.newsAdded({
        headline: `SLATE FINANCING: ${seller.name} sells backend stake on franchise slate for $${(proceeds / 1e6).toFixed(0)}M`,
        description: `${seller.name} has sold a share of future franchise revenue to outside financiers. The studio keeps ownership; backers collect the upside.`,
        category: "market",
      }),
    );
    newEvents.push({
      week: state.week,
      year: Math.floor(state.week / 52) + 1975,
      stage: 2,
      kind: "backend-sale",
      studioId: seller.id,
      studioName: seller.name,
      amount: proceeds,
      note: "Slate-backend financing",
    });
    counts(d, seller.id).s2++;
    return withLogImpact(state, impacts, newEvents);
  }

  // Layoffs / overhead cuts — trim non-talent staff (execs, dev, marketing, post).
  // Smaller cash recovery than asset sales, prestige and morale tax.
  const proceeds = Math.round(20_000_000 + secureRandom() * 60_000_000);
  impacts.push(
    I.rivalUpdated(seller.id, {
      cash: (seller.cash || 0) + proceeds,
      prestige: Math.max(0, (seller.prestige || 0) - 5),
    }),
  );
  impacts.push(
    I.newsAdded({
      headline: `LAYOFFS: ${seller.name} cuts overhead staff, saves $${(proceeds / 1e6).toFixed(0)}M annualized`,
      description: `${seller.name} has laid off executives, development, and marketing staff in a company-wide restructuring.`,
      category: "market",
    }),
  );
  newEvents.push({
    week: state.week,
    year: Math.floor(state.week / 52) + 1975,
    stage: 2,
    kind: "layoffs",
    studioId: seller.id,
    studioName: seller.name,
    amount: proceeds,
    note: "Overhead layoffs",
  });
  counts(d, seller.id).s2++;
  return withLogImpact(state, impacts, newEvents);
}

function stage3DistressedMA(state: GameState, target: RivalStudio, distress?: DistressMem): StateImpact[] {
  const d = distress ?? { negativeStreak: {}, lastActionWeek: {}, stageActionCount: {} };
  const impacts: StateImpact[] = [];
  const newEvents: DistressEvent[] = [];

  // ⚡ Bolt: Replaced Object.values().filter().sort() with single-pass maximum find
  // Richest acquirer with >$750M cash, not antitrust-frozen, not the target itself.
  const allRivals = state.entities.rivals || {};
  let acquirer: RivalStudio | undefined = undefined;
  let maxCash = 0;

  for (const id in allRivals) {
    const r = allRivals[id];
    const cash = r.cash || 0;
    if (r.id !== target.id && cash > 750_000_000 && cash > maxCash) {
      if (!isAcquirerBlockedByAntitrust(state, r.id, state.week)) {
        acquirer = r;
        maxCash = cash;
      }
    }
  }

  if (!acquirer) {
    // No buyer found — still counts as a failed stage-3 attempt so we escalate to bankruptcy.
    counts(d, target.id).s3++;
    impacts.push({
      type: "NEWS_ADDED",
      payload: {
        headline: `SHOPPED: ${target.name} fails to find buyer; bankruptcy looms`,
        description: `${target.name} sought a rescue acquisition but found no willing acquirer.`,
        category: "market",
      },
    });
    return impacts;
  }
  // Fire-sale price: token amount reflecting toxic negative cash.
  const assetValue = Math.max(
    50_000_000,
    (target.strength || 20) * 2_000_000 + (target.prestige || 30) * 500_000
  );
  const price = Math.round(assetValue * (0.3 + secureRandom() * 0.2));

  impacts.push(
    I.rivalUpdated(acquirer.id, {
      cash: (acquirer.cash || 0) - price,
      prestige: Math.min(100, (acquirer.prestige || 0) + 5),
    }),
  );
  impacts.push(
    I.industryUpdate({}, { mergedRivalId: target.id, acquirerId: acquirer.id }),
  );
  impacts.push(
    I.newsAdded({
      headline: `DISTRESSED M&A: ${acquirer.name} absorbs ${target.name} at fire-sale $${(price / 1e6).toFixed(0)}M`,
      description: `With ${target.name} running a cash deficit, ${acquirer.name} has struck a rescue acquisition on punitive terms.`,
      category: "market",
    }),
  );
  newEvents.push({
    week: state.week,
    year: Math.floor(state.week / 52) + 1975,
    stage: 3,
    kind: "distressed-ma",
    studioId: target.id,
    studioName: target.name,
    counterpartyId: acquirer.id,
    counterpartyName: acquirer.name,
    amount: price,
    note: "Rescue acquisition",
  });
  counts(d, target.id).s3++;
  return withLogImpact(state, impacts, newEvents);
}

function stage4Bankruptcy(state: GameState, target: RivalStudio): StateImpact[] {
  const impacts: StateImpact[] = [];
  const newEvents: DistressEvent[] = [];

  // Remaining IP reverts to open market so indies can pick it up later.
  const orphanedVault = (state.ip.vault || []).map((a) =>
    a.ownerStudioId === target.id
      ? { ...a, ownerStudioId: undefined, rightsOwner: "MARKET" as const }
      : a
  );
  impacts.push(
    I.industryUpdate({ "ip.vault": orphanedVault }, { bankruptRivalId: target.id }),
  );
  impacts.push(
    I.newsAdded({
      headline: `BANKRUPTCY: ${target.name} liquidates; catalog reverts to open market`,
      description: `After exhausting asset sales and finding no buyer, ${target.name} has filed Chapter 7.`,
      category: "market",
    }),
  );
  newEvents.push({
    week: state.week,
    year: Math.floor(state.week / 52) + 1975,
    stage: 4,
    kind: "bankruptcy",
    studioId: target.id,
    studioName: target.name,
    note: "Liquidated, IP to public market",
  });
  return withLogImpact(state, impacts, newEvents);
}

export function tickDistressCascade(state: GameState): StateImpact[] {
  const mem = getSimMemory(state);
  const distress: DistressMem = {
    negativeStreak: { ...mem.distress.negativeStreak },
    lastActionWeek: { ...mem.distress.lastActionWeek },
    stageActionCount: Object.fromEntries(
      Object.entries(mem.distress.stageActionCount).map(([k, v]) => [k, { ...v }])
    ),
  };

  updateStreaks(state, distress);
  const impacts: StateImpact[] = [];
  const allRivals = state.entities.rivals || {};
  const MIN_FLOOR = 7; // don't let cascade alone collapse the field below the spawner floor

  const queue: { r: RivalStudio; stage: 0 | 1 | 2 | 3 | 4 }[] = [];
  let rivalsCount = 0;
  for (const id in allRivals) {
    rivalsCount++;
    const r = allRivals[id];
    const stage = classifyStage(r, distress);
    if (stage > 0) {
      queue.push({ r, stage });
    }
  }
  queue.sort((a, b) => b.stage - a.stage);

  for (const { r, stage } of queue) {
    const last = distress.lastActionWeek[r.id] ?? -9999;
    if (state.week - last < STAGE_COOLDOWN) continue;

    let emitted: StateImpact[] = [];
    if (stage === 1) emitted = stage1IPFireSale(state, r, distress);
    else if (stage === 2) emitted = stage2AssetLiquidation(state, r, distress);
    else if (stage === 3) emitted = stage3DistressedMA(state, r, distress);
    else if (stage === 4) {
      if (rivalsCount <= MIN_FLOOR) continue;
      emitted = stage4Bankruptcy(state, r);
    }

    if (emitted.length > 0) {
      impacts.push(...emitted);
      distress.lastActionWeek[r.id] = state.week;
      // One cascade action per tick keeps the news cycle legible.
      break;
    }
  }

  impacts.push(I.industryUpdate({ "simMemory.distress": distress }));
  return impacts;
}
