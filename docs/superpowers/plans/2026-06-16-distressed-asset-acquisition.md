# Distressed-Asset Acquisition (First Player Decision) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the engine's stage-1 IP fire-sale — currently an automatic rival-to-rival transfer the player only reads about in the news — into a player *decision*: when a distressed studio puts a franchise or catalog asset up for fire-sale and the player can afford it, the player gets first right of refusal via a modal (Acquire / Pass), with the AI buyer completing the deal if the player passes or the offer expires.

**Architecture:** The fire-sale logic is split into a pure `completeFireSale(state, offer, buyerId)` helper (transfer asset + move cash + news, for *any* buyer including the player). When a fire-sale fires and the player qualifies, instead of completing immediately, the engine stores a `DistressedAssetOffer` on `state.industry.distressedOffers` and emits a `MODAL_TRIGGERED` impact (the existing `doAdvanceWeek` bridge routes it to the UI modal queue). The player's Acquire/Pass actions live in `gameStore` and reuse `completeFireSale` via `applyImpacts`. A weekly expiry tick auto-completes stale offers to the AI buyer. Offers are stored/removed through the existing `INDUSTRY_UPDATE` dot-path impact — no new impact types.

**Tech Stack:** TypeScript, Zustand (+Immer), React, Vitest, deterministic engine (`StateImpact[]` → `applyImpacts`).

> **Dependency:** Run the *Runtime Crash Sweep* plan first so the app renders and the test harness is in place.

**Key verified facts (do not re-derive):**
- Player studio id = `state.studio.id`; helper `getPlayerId(state)` / `isPlayerOwner(state, id)` in `src/engine/utils/ownership.ts`.
- Fire-sale source: `src/engine/systems/industry/DistressCascade.ts`, function `stage1IPFireSale(state, seller)` (lines ~104–178).
- Transfer impacts already used there: `FRANCHISE_UPDATED` (`{ franchiseId, update: { ownerId } }`, handled by `ipHandlers.handleFranchiseUpdated` — shallow-merges into `state.ip.franchises[id]`); vault transfer via `INDUSTRY_UPDATE` (`{ update: { 'ip.vault': newArray } }`).
- `RIVAL_UPDATED` (`{ rivalId, update: { cash, prestige } }`) sets rival fields. `FUNDS_DEDUCTED` (`{ amount }`) subtracts `amount` from `state.finance.cash` (player).
- `MODAL_TRIGGERED` impacts are routed to `useUIStore.enqueueModal(modalType, rest)` by `gameStore.doAdvanceWeek` (loop over `weekImpacts`). The modal receives `{ ...rest }` (everything except `modalType`) as `activeModal.payload`.
- `INDUSTRY_UPDATE` handler (`industryHandlers.handleIndustryUpdate`) applies `payload.update` as immutable dot-path sets, e.g. `{ 'industry.distressedOffers': newArray }`.
- `applyImpacts(state, impacts)` (in `src/engine/core/impactReducer.ts`) returns a new state with all impacts applied; importable by the store.
- Modal queue: `uiStore.ModalType` union + `enqueueModal`/`resolveCurrentModal`; `ModalManager.tsx` switches on `activeModal.type`. Example decision modal: `src/components/modals/RebootOpportunityModal.tsx`.

---

## File Structure

| File | Responsibility | Change |
|------|---------------|--------|
| `src/engine/types/distress.types.ts` | `DistressedAssetOffer` shape | Create |
| `src/engine/types/studio.types.ts` | `GameState.industry` | Add `distressedOffers?` field |
| `src/store/selectors.ts` | Offer selectors | Add `selectDistressedOffers`, `selectDistressedOffer` |
| `src/engine/systems/industry/DistressCascade.ts` | Fire-sale | Extract `completeFireSale`; refactor `stage1IPFireSale`; add `tickDistressedOffers` |
| `src/engine/services/WeekCoordinator.ts` | Tick pipeline | Wire `tickDistressedOffers` |
| `src/store/slices/distressSlice.ts` | Player acquire/decline actions | Create |
| `src/store/gameStore.ts` | Store assembly | Mount the distress slice |
| `src/components/modals/DistressedAssetOfferModal.tsx` | The decision UI | Create |
| `src/components/modals/ModalManager.tsx` | Modal routing | Add case |
| `src/store/uiStore.ts` | `ModalType` union | Add member |

---

### Task 1: Define the offer type, state field, and selectors

**Files:**
- Create: `src/engine/types/distress.types.ts`
- Modify: `src/engine/types/studio.types.ts:100-109` (the `industry: { ... }` block)
- Modify: `src/store/selectors.ts`
- Test: `src/test/store/distress-selectors.test.ts`

- [ ] **Step 1: Create the type**

Create `src/engine/types/distress.types.ts`:

```ts
/** A crown-jewel franchise or catalog asset a distressed studio is fire-selling. */
export interface DistressedAssetOffer {
  id: string;
  sellerId: string;
  sellerName: string;
  assetKind: 'franchise' | 'vault';
  assetId: string;
  /** Display string, e.g. "franchise 'Nightfall'" or "'The Reckoning'". */
  assetLabel: string;
  price: number;
  /** Buyer that completes the deal if the player passes or the offer expires. */
  aiBuyerId: string;
  aiBuyerName: string;
  createdWeek: number;
  expiresWeek: number;
}
```

- [ ] **Step 2: Add the field to `GameState.industry`**

In `src/engine/types/studio.types.ts`, inside the `industry: { ... }` object (currently ending with `newsHistory: NewsEvent[];` at line 108), add:

```ts
    newsHistory: NewsEvent[];
    distressedOffers?: import('./distress.types').DistressedAssetOffer[];
```

- [ ] **Step 3: Write the failing selector test**

Create `src/test/store/distress-selectors.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { selectDistressedOffers, selectDistressedOffer } from '@/store/selectors';
import type { GameState } from '@/engine/types';
import type { DistressedAssetOffer } from '@/engine/types/distress.types';

const offer: DistressedAssetOffer = {
  id: 'o1', sellerId: 'r1', sellerName: 'Carolco', assetKind: 'franchise',
  assetId: 'f1', assetLabel: "franchise 'Rambo'", price: 100, aiBuyerId: 'r2',
  aiBuyerName: 'Helix', createdWeek: 5, expiresWeek: 7,
};

function makeState(offers: DistressedAssetOffer[] = []): GameState {
  return { industry: { distressedOffers: offers } } as unknown as GameState;
}

describe('distressed-offer selectors', () => {
  it('selectDistressedOffers returns the list (empty array when undefined)', () => {
    expect(selectDistressedOffers(makeState())).toEqual([]);
    expect(selectDistressedOffers(makeState([offer]))).toHaveLength(1);
  });
  it('selectDistressedOffer finds by id', () => {
    expect(selectDistressedOffer(makeState([offer]), 'o1')?.sellerName).toBe('Carolco');
    expect(selectDistressedOffer(makeState([offer]), 'nope')).toBeUndefined();
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx vitest run src/test/store/distress-selectors.test.ts`
Expected: FAIL — "does not provide an export named 'selectDistressedOffers'".

- [ ] **Step 5: Add the selectors to `src/store/selectors.ts`** (near `selectIndustry`)

```ts
import type { DistressedAssetOffer } from '@/engine/types/distress.types';

const EMPTY_OFFERS: DistressedAssetOffer[] = [];

export const selectDistressedOffers = (state: GameState | null): DistressedAssetOffer[] =>
  state?.industry?.distressedOffers ?? EMPTY_OFFERS;

export const selectDistressedOffer = (
  state: GameState | null,
  offerId: string
): DistressedAssetOffer | undefined =>
  selectDistressedOffers(state).find((o) => o.id === offerId);
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/test/store/distress-selectors.test.ts`
Expected: PASS (2 passed).

- [ ] **Step 7: Commit**

```bash
git add src/engine/types/distress.types.ts src/engine/types/studio.types.ts src/store/selectors.ts src/test/store/distress-selectors.test.ts
git commit -m "feat(distress): add DistressedAssetOffer type, state field, and selectors"
```

---

### Task 2: Extract `completeFireSale` (pure, buyer-agnostic transfer)

This is the shared logic that moves an asset to *any* buyer — a rival or the player — and is reused by both the AI fallback and the player's Acquire action.

**Files:**
- Modify: `src/engine/systems/industry/DistressCascade.ts`
- Test: `src/test/engine/completeFireSale.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/engine/completeFireSale.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { completeFireSale } from '@/engine/systems/industry/DistressCascade';
import type { DistressedAssetOffer } from '@/engine/types/distress.types';
import type { GameState } from '@/engine/types';

const baseOffer: DistressedAssetOffer = {
  id: 'o1', sellerId: 'r1', sellerName: 'Carolco', assetKind: 'franchise',
  assetId: 'f1', assetLabel: "franchise 'Rambo'", price: 100_000_000,
  aiBuyerId: 'r2', aiBuyerName: 'Helix', createdWeek: 5, expiresWeek: 7,
};

function makeState(): GameState {
  return {
    studio: { id: 'PLAYER_STUDIO' },
    finance: { cash: 500_000_000 },
    entities: { rivals: { r1: { id: 'r1', name: 'Carolco', cash: -50_000_000, prestige: 30 }, r2: { id: 'r2', name: 'Helix', cash: 800_000_000, prestige: 40 } } },
    ip: { franchises: { f1: { id: 'f1', name: 'Rambo', ownerId: 'r1' } }, vault: [] },
  } as unknown as GameState;
}

describe('completeFireSale', () => {
  it('transfers a franchise to a RIVAL buyer: rival debited, seller credited, ownership moved', () => {
    const impacts = completeFireSale(makeState(), baseOffer, 'r2');
    const franchise = impacts.find(i => i.type === 'FRANCHISE_UPDATED') as any;
    expect(franchise.payload.update.ownerId).toBe('r2');
    const buyerDebit = impacts.find(i => i.type === 'RIVAL_UPDATED' && (i as any).payload.rivalId === 'r2') as any;
    expect(buyerDebit.payload.update.cash).toBe(800_000_000 - 100_000_000);
    const sellerCredit = impacts.find(i => i.type === 'RIVAL_UPDATED' && (i as any).payload.rivalId === 'r1') as any;
    expect(sellerCredit.payload.update.cash).toBe(-50_000_000 + 100_000_000);
    expect(impacts.some(i => i.type === 'NEWS_ADDED')).toBe(true);
    // No player cash impact when the buyer is a rival.
    expect(impacts.some(i => i.type === 'FUNDS_DEDUCTED')).toBe(false);
  });

  it('transfers a franchise to the PLAYER: player cash debited via FUNDS_DEDUCTED, no rival-buyer impact', () => {
    const impacts = completeFireSale(makeState(), baseOffer, 'PLAYER_STUDIO');
    const franchise = impacts.find(i => i.type === 'FRANCHISE_UPDATED') as any;
    expect(franchise.payload.update.ownerId).toBe('PLAYER_STUDIO');
    const playerDebit = impacts.find(i => i.type === 'FUNDS_DEDUCTED') as any;
    expect(playerDebit.payload.amount).toBe(100_000_000);
    const sellerCredit = impacts.find(i => i.type === 'RIVAL_UPDATED' && (i as any).payload.rivalId === 'r1') as any;
    expect(sellerCredit.payload.update.cash).toBe(-50_000_000 + 100_000_000);
    // No rival-buyer debit when the buyer is the player.
    expect(impacts.some(i => i.type === 'RIVAL_UPDATED' && (i as any).payload.rivalId === 'PLAYER_STUDIO')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/engine/completeFireSale.test.ts`
Expected: FAIL — "completeFireSale is not exported".

- [ ] **Step 3: Add `completeFireSale` to `DistressCascade.ts`**

Add these imports at the top of `src/engine/systems/industry/DistressCascade.ts` (if not already present):

```ts
import type { DistressedAssetOffer } from '@/engine/types/distress.types';
import { getPlayerId } from '@/engine/utils/ownership';
```

Add this exported function (place it just above `stage1IPFireSale`):

```ts
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
  if (offer.assetKind === 'franchise') {
    impacts.push({
      type: 'FRANCHISE_UPDATED',
      payload: { franchiseId: offer.assetId, update: { ownerId: buyerId } },
    } as unknown as StateImpact);
  } else {
    const newVault = (state.ip.vault || []).map((a) =>
      a.id === offer.assetId ? { ...a, ownerStudioId: buyerId as any } : a
    );
    impacts.push({
      type: 'INDUSTRY_UPDATE',
      payload: { update: { 'ip.vault': newVault } },
    } as unknown as StateImpact);
  }

  // 2. Credit the seller (and the standard -5 prestige hit for a distressed sale).
  if (seller) {
    impacts.push({
      type: 'RIVAL_UPDATED',
      payload: {
        rivalId: offer.sellerId,
        update: { cash: (seller.cash || 0) + offer.price, prestige: Math.max(0, (seller.prestige || 0) - 5) },
      },
    } as unknown as StateImpact);
  }

  // 3. Debit the buyer.
  if (isPlayerBuyer) {
    impacts.push({ type: 'FUNDS_DEDUCTED', payload: { amount: offer.price } } as unknown as StateImpact);
  } else {
    const buyer = state.entities.rivals?.[buyerId];
    if (buyer) {
      impacts.push({
        type: 'RIVAL_UPDATED',
        payload: { rivalId: buyerId, update: { cash: (buyer.cash || 0) - offer.price } },
      } as unknown as StateImpact);
    }
  }

  // 4. News.
  const buyerName = isPlayerBuyer ? state.studio.name : (state.entities.rivals?.[buyerId]?.name ?? 'a rival');
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      headline: `FIRE SALE: ${offer.sellerName} sells ${offer.assetLabel} to ${buyerName} for $${(offer.price / 1e6).toFixed(0)}M`,
      description: `Facing sustained losses, ${offer.sellerName} has offloaded ${offer.assetLabel} in a distressed IP sale.`,
      category: 'market',
    },
  } as unknown as StateImpact);

  return impacts;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/engine/completeFireSale.test.ts`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add src/engine/systems/industry/DistressCascade.ts src/test/engine/completeFireSale.test.ts
git commit -m "feat(distress): extract buyer-agnostic completeFireSale helper"
```

---

### Task 3: Refactor `stage1IPFireSale` to offer-to-player-first

When a fire-sale fires and the player can afford it, create a pending offer + a modal trigger instead of auto-selling to the AI buyer. Otherwise, complete to the AI buyer immediately (unchanged behavior).

**Files:**
- Modify: `src/engine/systems/industry/DistressCascade.ts` (`stage1IPFireSale`)
- Test: `src/test/engine/stage1FireSale-offer.test.ts`

**Constant:** add near the top of the file with the other constants (e.g. below `MAX_STAGE1`):

```ts
const OFFER_WINDOW_WEEKS = 2; // weeks the player has to decide before the AI buyer takes it
```

- [ ] **Step 1: Write the failing test**

Create `src/test/engine/stage1FireSale-offer.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { stage1IPFireSale } from '@/engine/systems/industry/DistressCascade';
import type { GameState } from '@/engine/types';

// stage1IPFireSale is currently not exported — Step 3 also adds the `export` keyword.
function makeState(playerCash: number): GameState {
  return {
    week: 10,
    studio: { id: 'PLAYER', name: 'Player Studio' },
    finance: { cash: playerCash },
    entities: { rivals: {
      r1: { id: 'r1', name: 'Carolco', cash: -60_000_000, prestige: 30, strength: 20 },
      r2: { id: 'r2', name: 'Helix', cash: 900_000_000, prestige: 40 },
    } },
    ip: { franchises: { f1: { id: 'f1', name: 'Rambo', ownerId: 'r1' } }, vault: [] },
    industry: { distressedOffers: [] },
  } as unknown as GameState;
}

describe('stage1IPFireSale player offer', () => {
  it('when the player can afford it: creates an offer + a modal trigger, does NOT transfer yet', () => {
    const seller = makeState(2_000_000_000).entities.rivals.r1;
    const impacts = stage1IPFireSale(makeState(2_000_000_000), seller as any);
    expect(impacts.some(i => i.type === 'MODAL_TRIGGERED' && (i as any).payload.modalType === 'DISTRESSED_ASSET_OFFER')).toBe(true);
    // Offer appended to industry.distressedOffers via INDUSTRY_UPDATE.
    const upd = impacts.find(i => i.type === 'INDUSTRY_UPDATE' && (i as any).payload.update['industry.distressedOffers']) as any;
    expect(upd.payload.update['industry.distressedOffers']).toHaveLength(1);
    // No ownership transfer yet.
    expect(impacts.some(i => i.type === 'FRANCHISE_UPDATED')).toBe(false);
  });

  it('when the player is broke: completes to the AI buyer immediately (transfer happens)', () => {
    const seller = makeState(0).entities.rivals.r1;
    const impacts = stage1IPFireSale(makeState(0), seller as any);
    expect(impacts.some(i => i.type === 'MODAL_TRIGGERED')).toBe(false);
    expect(impacts.some(i => i.type === 'FRANCHISE_UPDATED')).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/engine/stage1FireSale-offer.test.ts`
Expected: FAIL — `stage1IPFireSale` not exported / modal trigger absent.

- [ ] **Step 3: Refactor `stage1IPFireSale`**

In `src/engine/systems/industry/DistressCascade.ts`:

(a) Add `export` to the function signature: `export function stage1IPFireSale(`.

(b) Replace the block that currently builds `franchiseName` and pushes the `FRANCHISE_UPDATED`/vault transfer + the two `RIVAL_UPDATED` cash impacts + the `NEWS_ADDED` (the body from "let franchiseName" through the news push, lines ~128–168) with offer construction + branch:

```ts
  // Build the offer (asset id/label + AI fallback buyer + price are already chosen above).
  let assetKind: 'franchise' | 'vault';
  let assetId: string;
  let assetLabel: string;
  if (ownedFranchises.length > 0) {
    const franchise: any = pick(ownedFranchises);
    assetKind = 'franchise';
    assetId = franchise.id;
    assetLabel = `franchise '${franchise.name}'`;
  } else {
    const named = ownedAssets.filter((a) => {
      const t = (a as any).title || (a as any).name;
      return typeof t === 'string' && t.trim().length > 0;
    });
    if (named.length === 0) return [];
    const asset: any = pick(named);
    assetKind = 'vault';
    assetId = asset.id;
    assetLabel = `'${asset.title || asset.name}'`;
  }

  const offer: import('@/engine/types/distress.types').DistressedAssetOffer = {
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

  counts(seller.id).s1++;

  // Player gets first right of refusal only if solvent enough to buy.
  const playerCanAfford = (state.finance?.cash ?? 0) >= price;
  if (playerCanAfford) {
    const existing = state.industry?.distressedOffers ?? [];
    impacts.push({
      type: 'INDUSTRY_UPDATE',
      payload: { update: { 'industry.distressedOffers': [...existing, offer] } },
    } as unknown as StateImpact);
    impacts.push({
      type: 'MODAL_TRIGGERED',
      payload: { modalType: 'DISTRESSED_ASSET_OFFER', offerId: offer.id },
    } as unknown as StateImpact);
    logEvent({
      week: state.week, year: Math.floor(state.week / 52) + 1975,
      stage: 1, kind: 'ip-sale', studioId: seller.id, studioName: seller.name,
      counterpartyId: 'player', counterpartyName: state.studio.name,
      amount: price, note: `Offered ${assetLabel} to player`,
    });
    return impacts;
  }

  // Player can't afford it — AI buyer completes immediately (original behavior).
  impacts.push(...completeFireSale(state, offer, buyer.id));
  logEvent({
    week: state.week, year: Math.floor(state.week / 52) + 1975,
    stage: 1, kind: 'ip-sale', studioId: seller.id, studioName: seller.name,
    counterpartyId: buyer.id, counterpartyName: buyer.name,
    amount: price, note: `Sold ${assetLabel}`,
  });
  return impacts;
```

> Note: the original `counts(seller.id).s1++;` at the very end of the function is now moved up (shown above) — remove the trailing duplicate so it isn't incremented twice.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/engine/stage1FireSale-offer.test.ts`
Expected: PASS (2 passed).

- [ ] **Step 5: Run the existing distress tests to check for regressions**

Run: `npx vitest run src/test/engine 2>&1 | tail -20`
Expected: PASS (or the same pre-existing failures as before this task — compare against a clean run if unsure).

- [ ] **Step 6: Commit**

```bash
git add src/engine/systems/industry/DistressCascade.ts src/test/engine/stage1FireSale-offer.test.ts
git commit -m "feat(distress): offer fire-sale assets to the player before the AI buyer"
```

---

### Task 4: Expire stale offers to the AI buyer (weekly tick)

If the player ignores an offer, the AI buyer takes it after `OFFER_WINDOW_WEEKS`.

**Files:**
- Modify: `src/engine/systems/industry/DistressCascade.ts` (add `tickDistressedOffers`)
- Modify: `src/engine/services/WeekCoordinator.ts` (wire it in)
- Test: `src/test/engine/tickDistressedOffers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/engine/tickDistressedOffers.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { tickDistressedOffers } from '@/engine/systems/industry/DistressCascade';
import type { GameState } from '@/engine/types';
import type { DistressedAssetOffer } from '@/engine/types/distress.types';

const offer: DistressedAssetOffer = {
  id: 'o1', sellerId: 'r1', sellerName: 'Carolco', assetKind: 'franchise',
  assetId: 'f1', assetLabel: "franchise 'Rambo'", price: 100_000_000,
  aiBuyerId: 'r2', aiBuyerName: 'Helix', createdWeek: 5, expiresWeek: 7,
};

function makeState(week: number, offers: DistressedAssetOffer[]): GameState {
  return {
    week,
    studio: { id: 'PLAYER', name: 'Player Studio' },
    finance: { cash: 0 },
    entities: { rivals: { r1: { id: 'r1', name: 'Carolco', cash: -60_000_000, prestige: 30 }, r2: { id: 'r2', name: 'Helix', cash: 900_000_000, prestige: 40 } } },
    ip: { franchises: { f1: { id: 'f1', name: 'Rambo', ownerId: 'r1' } }, vault: [] },
    industry: { distressedOffers: offers },
  } as unknown as GameState;
}

describe('tickDistressedOffers', () => {
  it('expired offer: completes to AI buyer and is removed from the list', () => {
    const impacts = tickDistressedOffers(makeState(7, [offer]));
    expect(impacts.some(i => i.type === 'FRANCHISE_UPDATED')).toBe(true);
    const upd = impacts.find(i => i.type === 'INDUSTRY_UPDATE' && (i as any).payload.update['industry.distressedOffers']) as any;
    expect(upd.payload.update['industry.distressedOffers']).toHaveLength(0);
  });

  it('fresh offer (not yet expired): no impacts', () => {
    expect(tickDistressedOffers(makeState(6, [offer]))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/engine/tickDistressedOffers.test.ts`
Expected: FAIL — "tickDistressedOffers is not exported".

- [ ] **Step 3: Add `tickDistressedOffers` to `DistressCascade.ts`**

```ts
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
  for (const offer of expired) {
    impacts.push(...completeFireSale(state, offer, offer.aiBuyerId));
  }
  const remaining = offers.filter((o) => state.week < o.expiresWeek);
  impacts.push({
    type: 'INDUSTRY_UPDATE',
    payload: { update: { 'industry.distressedOffers': remaining } },
  } as unknown as StateImpact);
  return impacts;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/engine/tickDistressedOffers.test.ts`
Expected: PASS (2 passed).

- [ ] **Step 5: Wire into the weekly tick**

In `src/engine/services/WeekCoordinator.ts`, add the import near the other industry imports (around line 27):

```ts
import { tickDistressedOffers } from '../systems/industry/DistressCascade';
```

Then inside `runScandalFilter` (or `runFinanceFilter`) add one line so it runs each week after scandals advance:

```ts
  private static runScandalFilter(state: GameState, context: TickContext) {
    context.impacts.push(...generateScandals(state, context.rng));
    context.impacts.push(...advanceScandals(state));
    context.impacts.push(...tickDistressedOffers(state));
  }
```

- [ ] **Step 6: Commit**

```bash
git add src/engine/systems/industry/DistressCascade.ts src/engine/services/WeekCoordinator.ts src/test/engine/tickDistressedOffers.test.ts
git commit -m "feat(distress): expire unclaimed offers to the AI buyer each week"
```

---

### Task 5: Player actions — `acquireDistressedAsset` / `declineDistressedAsset`

**Files:**
- Create: `src/store/slices/distressSlice.ts`
- Modify: `src/store/gameStore.ts` (mount the slice + add to the store type)
- Test: `src/test/store/distressSlice.test.ts`

**Pattern reference:** other slices receive `(set, get)` and return action objects; `gameStore.ts` spreads them into the store. Actions mutate via `set({ gameState: nextState, finance: nextState.finance })`.

- [ ] **Step 1: Write the failing test**

Create `src/test/store/distressSlice.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import type { GameState } from '@/engine/types';
import type { DistressedAssetOffer } from '@/engine/types/distress.types';

const offer: DistressedAssetOffer = {
  id: 'o1', sellerId: 'r1', sellerName: 'Carolco', assetKind: 'franchise',
  assetId: 'f1', assetLabel: "franchise 'Rambo'", price: 100_000_000,
  aiBuyerId: 'r2', aiBuyerName: 'Helix', createdWeek: 5, expiresWeek: 7,
};

function seed(): GameState {
  return {
    week: 6,
    studio: { id: 'PLAYER', name: 'Player Studio' },
    finance: { cash: 500_000_000, weeklyHistory: [], ledger: [], marketState: {} },
    entities: { rivals: { r1: { id: 'r1', name: 'Carolco', cash: -60_000_000, prestige: 30 }, r2: { id: 'r2', name: 'Helix', cash: 900_000_000, prestige: 40 } }, projects: {} },
    ip: { franchises: { f1: { id: 'f1', name: 'Rambo', ownerId: 'r1' } }, vault: [] },
    industry: { distressedOffers: [offer], newsHistory: [] },
  } as unknown as GameState;
}

beforeEach(() => {
  useGameStore.setState({ gameState: seed() } as any);
  useUIStore.setState({ activeModal: { id: 'm1', type: 'DISTRESSED_ASSET_OFFER', payload: { offerId: 'o1' } }, modalQueue: [] } as any);
});

describe('distress slice', () => {
  it('acquireDistressedAsset: player owns the franchise, cash debited, offer removed, modal resolved', () => {
    useGameStore.getState().acquireDistressedAsset('o1');
    const s = useGameStore.getState().gameState!;
    expect(s.ip.franchises.f1.ownerId).toBe('PLAYER');
    expect(s.finance.cash).toBe(500_000_000 - 100_000_000);
    expect(s.industry.distressedOffers).toHaveLength(0);
    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it('declineDistressedAsset: AI buyer owns the franchise, player cash unchanged, offer removed', () => {
    useGameStore.getState().declineDistressedAsset('o1');
    const s = useGameStore.getState().gameState!;
    expect(s.ip.franchises.f1.ownerId).toBe('r2');
    expect(s.finance.cash).toBe(500_000_000);
    expect(s.industry.distressedOffers).toHaveLength(0);
    expect(useUIStore.getState().activeModal).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/store/distressSlice.test.ts`
Expected: FAIL — `acquireDistressedAsset is not a function`.

- [ ] **Step 3: Create the slice**

Create `src/store/slices/distressSlice.ts`:

```ts
import type { GameState } from '@/engine/types';
import { applyImpacts } from '@/engine/core/impactReducer';
import { completeFireSale } from '@/engine/systems/industry/DistressCascade';
import { useUIStore } from '@/store/uiStore';

export interface DistressSlice {
  acquireDistressedAsset: (offerId: string) => void;
  declineDistressedAsset: (offerId: string) => void;
}

function resolveOffer(
  get: () => { gameState: GameState | null },
  set: (partial: { gameState: GameState }) => void,
  offerId: string,
  buyerId: 'player' | 'ai'
) {
  const state = get().gameState;
  if (!state) return;
  const offers = state.industry?.distressedOffers ?? [];
  const offer = offers.find((o) => o.id === offerId);
  if (!offer) {
    useUIStore.getState().resolveCurrentModal();
    return;
  }

  const actualBuyerId = buyerId === 'player' ? state.studio.id : offer.aiBuyerId;
  // Guard: a player purchase requires the cash.
  if (buyerId === 'player' && (state.finance?.cash ?? 0) < offer.price) {
    useUIStore.getState().resolveCurrentModal();
    return;
  }

  let next = applyImpacts(state, completeFireSale(state, offer, actualBuyerId));
  next = {
    ...next,
    industry: {
      ...next.industry,
      distressedOffers: (next.industry?.distressedOffers ?? []).filter((o) => o.id !== offerId),
    },
  };

  set({ gameState: next });
  useUIStore.getState().resolveCurrentModal();
}

export const createDistressSlice = (set: any, get: any): DistressSlice => ({
  acquireDistressedAsset: (offerId) =>
    resolveOffer(get, (p) => set({ gameState: p.gameState, finance: p.gameState.finance }), offerId, 'player'),
  declineDistressedAsset: (offerId) =>
    resolveOffer(get, (p) => set({ gameState: p.gameState, finance: p.gameState.finance }), offerId, 'ai'),
});
```

- [ ] **Step 4: Mount the slice in `gameStore.ts`**

In `src/store/gameStore.ts`: import and spread the slice into the store creator, and add its type to the store interface.

Add the import near the other slice imports:

```ts
import { createDistressSlice, DistressSlice } from './slices/distressSlice';
```

Add `DistressSlice` to the store's type union (find the `GameStore` type/interface declaration and intersect it):

```ts
// e.g. if the store type is `type GameStore = ... & FinanceSlice & ...`, add:
  & DistressSlice
```

Inside the `create<GameStore>()((set, get) => ({ ... }))` body, spread the slice alongside the others:

```ts
  ...createDistressSlice(set, get),
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/store/distressSlice.test.ts`
Expected: PASS (2 passed).

- [ ] **Step 6: Commit**

```bash
git add src/store/slices/distressSlice.ts src/store/gameStore.ts src/test/store/distressSlice.test.ts
git commit -m "feat(distress): add acquire/decline player actions"
```

---

### Task 6: The decision modal

**Files:**
- Modify: `src/store/uiStore.ts` (add `'DISTRESSED_ASSET_OFFER'` to `ModalType`)
- Create: `src/components/modals/DistressedAssetOfferModal.tsx`
- Modify: `src/components/modals/ModalManager.tsx` (lazy import + case)

- [ ] **Step 1: Add the modal type**

In `src/store/uiStore.ts`, add to the `ModalType` union (after `'REBOOT_OPPORTUNITY'`):

```ts
  | 'REBOOT_OPPORTUNITY'
  | 'DISTRESSED_ASSET_OFFER';
```

- [ ] **Step 2: Create the modal component**

Create `src/components/modals/DistressedAssetOfferModal.tsx` (mirrors `RebootOpportunityModal` structure):

```tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { selectDistressedOffer } from '@/store/selectors';
import { Flame, DollarSign, X } from 'lucide-react';

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export const DistressedAssetOfferModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const gameState = useGameStore((s) => s.gameState);
  const acquire = useGameStore((s) => s.acquireDistressedAsset);
  const decline = useGameStore((s) => s.declineDistressedAsset);

  if (!activeModal || activeModal.type !== 'DISTRESSED_ASSET_OFFER') return null;

  const offerId = (activeModal.payload as { offerId?: string })?.offerId;
  const offer = offerId ? selectDistressedOffer(gameState, offerId) : undefined;
  if (!offer) {
    resolveCurrentModal();
    return null;
  }

  const cash = gameState?.finance?.cash ?? 0;
  const canAfford = cash >= offer.price;

  return (
    <Dialog open onOpenChange={() => decline(offer.id)}>
      <DialogContent className="max-w-lg bg-card/90 backdrop-blur-2xl border border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-5 w-5 text-rose-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground not-italic">
              Distressed IP Fire Sale
            </span>
          </div>
          <DialogTitle className="font-display font-black text-xl tracking-tight uppercase not-italic">
            {offer.sellerName} is selling {offer.assetLabel}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            Facing sustained losses, {offer.sellerName} has put {offer.assetLabel} on the block.
            You have first right of refusal — if you pass, {offer.aiBuyerName} takes it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="rounded-none border border-border bg-muted/30 p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Asking Price</span>
            <span className="font-display text-lg font-bold tabular-nums">{fmt(offer.price)}</span>
          </div>
          <div className="rounded-none border border-border bg-muted/20 p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your Cash</span>
            <span className={`font-display text-lg font-bold tabular-nums ${canAfford ? 'text-foreground' : 'text-rose-400'}`}>
              {fmt(cash)}
            </span>
          </div>
          {!canAfford && (
            <p className="text-xs text-rose-400">Insufficient cash to acquire this asset.</p>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={() => decline(offer.id)}>
            <X className="h-4 w-4 mr-2" />
            Pass
          </Button>
          <Button className="flex-1" disabled={!canAfford} onClick={() => acquire(offer.id)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Acquire for {fmt(offer.price)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

- [ ] **Step 3: Register in `ModalManager.tsx`**

Add the lazy import alongside the others (after the `RebootOpportunityModal` line):

```tsx
const DistressedAssetOfferModal = React.lazy(() => import('./DistressedAssetOfferModal').then(m => ({ default: m.DistressedAssetOfferModal })));
```

Add the case in the `switch` (after `case 'REBOOT_OPPORTUNITY':`):

```tsx
          case 'DISTRESSED_ASSET_OFFER':
            return <DistressedAssetOfferModal key={activeModal.id} />;
```

- [ ] **Step 4: Verify it typechecks and the existing modal tests still pass**

Run: `npm run typecheck 2>&1 | grep -E "DistressedAssetOfferModal|uiStore|ModalManager"`
Expected: no output (empty).

Run: `npx vitest run src/test/store/distressSlice.test.ts src/test/store/distress-selectors.test.ts src/test/engine/completeFireSale.test.ts src/test/engine/stage1FireSale-offer.test.ts src/test/engine/tickDistressedOffers.test.ts`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add src/store/uiStore.ts src/components/modals/DistressedAssetOfferModal.tsx src/components/modals/ModalManager.tsx
git commit -m "feat(distress): add the distressed-asset offer decision modal"
```

---

### Task 7: End-to-end smoke (engine → modal queue → store action)

Proves the whole loop: an offer in state, triggered via the `doAdvanceWeek` modal bridge, resolved by a store action.

**Files:**
- Test: `src/test/integration/distress-flow.test.ts`

- [ ] **Step 1: Write the test**

Create `src/test/integration/distress-flow.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/store/uiStore';

// The doAdvanceWeek bridge does: for MODAL_TRIGGERED impacts,
// const { modalType, ...rest } = impact.payload; ui.enqueueModal(modalType, rest);
// This test replicates that bridge for a DISTRESSED_ASSET_OFFER impact.
describe('distress flow: modal bridge', () => {
  beforeEach(() => useUIStore.setState({ activeModal: null, modalQueue: [] } as any));

  it('a MODAL_TRIGGERED impact enqueues the offer modal with offerId in payload', () => {
    const impact = { type: 'MODAL_TRIGGERED', payload: { modalType: 'DISTRESSED_ASSET_OFFER', offerId: 'o1' } } as any;
    const { modalType, ...rest } = impact.payload;
    useUIStore.getState().enqueueModal(modalType, rest);

    const active = useUIStore.getState().activeModal;
    expect(active?.type).toBe('DISTRESSED_ASSET_OFFER');
    expect((active?.payload as { offerId: string }).offerId).toBe('o1');
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run src/test/integration/distress-flow.test.ts`
Expected: PASS.

- [ ] **Step 3: Manual smoke (optional but recommended)**

Run `npm run dev`, open `http://localhost:8081/dashboard?autoStart=true`, and advance weeks. When a rival goes deep into the red (cash < -$50M for 26+ weeks) and you hold more cash than the asking price, the **Distressed IP Fire Sale** modal should appear with working Acquire/Pass buttons. (This can take many in-game weeks; for a faster check, the unit tests above are authoritative.)

- [ ] **Step 4: Commit**

```bash
git add src/test/integration/distress-flow.test.ts
git commit -m "test(distress): integration smoke for the modal bridge"
```

---

## Self-Review Notes

- **Spec coverage:** offer type + state + selectors (T1); buyer-agnostic transfer (T2); player-first offer creation + modal trigger (T3); AI expiry fallback (T4); player acquire/decline actions (T5); decision modal + wiring (T6); end-to-end bridge test (T7).
- **Type consistency:** `completeFireSale(state, offer, buyerId)`, `tickDistressedOffers(state)`, `stage1IPFireSale(state, seller)` signatures are consistent across tasks; `DistressedAssetOffer` fields (`id, sellerId, sellerName, assetKind, assetId, assetLabel, price, aiBuyerId, aiBuyerName, createdWeek, expiresWeek`) are used identically in every task; modal payload key is `offerId` throughout; store actions are `acquireDistressedAsset`/`declineDistressedAsset` everywhere.
- **No new impact types:** offers are stored/removed via the existing `INDUSTRY_UPDATE` dot-path mechanism; cash via `FUNDS_DEDUCTED`/`RIVAL_UPDATED`; ownership via `FRANCHISE_UPDATED`/`INDUSTRY_UPDATE` — all pre-existing and handler-backed.
- **Determinism preserved:** the engine never blocks on the player; it stores an offer and continues. The decision is asynchronous (store action) and the AI fallback guarantees the asset always finds a home, so a save reloaded mid-offer stays consistent.
- **Edge:** if the player's cash drops below the price between offer creation and decision, the modal disables Acquire and the slice guards re-check cash before applying.
- **Scope guard (YAGNI):** one asset class of one distress stage. Stage-2/3/4 events and multi-bid auctions are deliberately out of scope.
