# Player M&A with Antitrust Preview (F1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the player's "hostile takeover" from a silent one-click state mutation into a real strategic decision: show the price, the combined market share, and the regulator's block risk *before* committing — and let the regulator actually block the deal.

**Architecture:** A pure `evaluatePlayerAcquisition(state, targetId)` in the engine combines the existing `evaluateAcquisitionTarget` (price/affordability) with `RegulatorSystem.getMarketShare` (share preview) into one preview object the UI can render without side effects. `executeAcquisition` gains a regulator gate so a blocked deal costs a filing fee and prestige instead of transferring the studio. The UI replaces the bare dropdown item with a confirmation modal showing all three numbers.

**Tech Stack:** TypeScript, Zustand, React, Radix Dialog, Vitest.

**Why this matters:** The acquisition machinery is fully built — `executeAcquisition` already transfers the target's projects, contracts, cash and grants prestige — and `RegulatorSystem` already computes a player-aware `getMarketShare(state, 'player')` and an `isBlocked(...)` verdict. But **they are not connected**: today the player clicks "HOSTILE TAKEOVER" and the studio is simply absorbed, with no price shown, no share preview, and no regulator involvement. This is the cheapest available conversion of modeled depth into player agency.

**Verified facts (do not re-derive):**
- `src/engine/systems/mergers.ts:4` — `evaluateAcquisitionTarget(target, buyerCash)` returns `{ viable, price, reason? }`; price = `max(10M, strength*2M + target.cash)`, ×2.0 for `major`, ×1.2 for `indie`.
- `src/engine/systems/mergers.ts:18` — `executeAcquisition(state, targetId)` returns a new `GameState`: deletes the rival, re-owns its projects (`ownerId: state.studio.id, isAcquired: true`) and contracts, applies `cash - price + target.cash`, raises prestige by `target.strength * 0.2`, and prepends a `STUDIO_EVENT` news entry. **It never consults RegulatorSystem.**
- `src/engine/systems/industry/RegulatorSystem.ts:13` — `static getMarketShare(state, studioId: string | 'player')`; treats `'player'` and `state.studio.id` as the same entity. Share = `prestigeShare*0.6 + subShare*0.4`.
- `RegulatorSystem.isBlocked(state, acquirerId, targetId)` returns `{ blocked, sharePreview, reason? }`; block chance 0 below 25% combined, sliding `0.4 + (share-25)*0.05` from 25–35%, `0.9` above 35%. **It is stochastic** (calls `rand()`), so it must not be used for the UI preview — the preview needs the deterministic share.
- `src/store/slices/rivalSlice.ts` — `acquireRival` and `attemptTakeover` are **duplicates**; both call `executeAcquisition(s.gameState, targetId)`.
- `src/components/rivals/RivalCard.tsx:109` — the "HOSTILE TAKEOVER" dropdown item calls `attemptTakeover(rival.id)` directly, with no confirmation.
- Modal system: `uiStore.ModalType` union + `enqueueModal(type, payload)` / `resolveCurrentModal()`; `ModalManager.tsx` switches on `activeModal.type`. Decision-modal pattern to copy: `src/components/modals/RebootOpportunityModal.tsx`.

---

## File Structure

| File | Responsibility | Change |
|------|---------------|--------|
| `src/engine/systems/mergers.ts` | Acquisition pricing + execution | Add `evaluatePlayerAcquisition`; gate `executeAcquisition` on the regulator |
| `src/store/slices/rivalSlice.ts` | Player M&A actions | Consolidate duplicates; add `previewAcquisition` |
| `src/store/uiStore.ts` | Modal types | Add `'ACQUISITION_CONFIRM'` |
| `src/components/modals/AcquisitionConfirmModal.tsx` | The decision UI | Create |
| `src/components/modals/ModalManager.tsx` | Modal routing | Add case |
| `src/components/rivals/RivalCard.tsx` | Entry point | Open the modal instead of acquiring |

---

### Task 1: `evaluatePlayerAcquisition` — one deterministic preview object

**Files:**
- Modify: `src/engine/systems/mergers.ts`
- Test: `src/test/engine/evaluatePlayerAcquisition.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/engine/evaluatePlayerAcquisition.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { evaluatePlayerAcquisition } from '@/engine/systems/mergers';
import type { GameState } from '@/engine/types';

function makeState(playerCash: number, targetCash = 50_000_000): GameState {
  return {
    week: 40,
    studio: { id: 'PLAYER', name: 'Player Studio', prestige: 50 },
    finance: { cash: playerCash },
    entities: {
      rivals: {
        r1: { id: 'r1', name: 'Target Co', cash: targetCash, strength: 30, prestige: 30, archetype: 'mid-tier' },
        r2: { id: 'r2', name: 'Other', cash: 100_000_000, strength: 40, prestige: 40, archetype: 'major' },
      },
      projects: {},
      contracts: {},
      buyers: {},
    },
    industry: { newsHistory: [] },
  } as unknown as GameState;
}

describe('evaluatePlayerAcquisition', () => {
  it('returns price, affordability and a deterministic combined-share preview', () => {
    const r = evaluatePlayerAcquisition(makeState(5_000_000_000), 'r1');
    expect(r.targetName).toBe('Target Co');
    expect(r.price).toBeGreaterThan(0);
    expect(r.affordable).toBe(true);
    expect(typeof r.combinedShare).toBe('number');
    expect(r.combinedShare).toBeGreaterThanOrEqual(0);
  });

  it('flags unaffordable deals with a reason and blocks the action', () => {
    const r = evaluatePlayerAcquisition(makeState(1), 'r1');
    expect(r.affordable).toBe(false);
    expect(r.canProceed).toBe(false);
    expect(r.reason).toMatch(/fund/i);
  });

  it('is deterministic — same state gives the same preview twice', () => {
    const s = makeState(5_000_000_000);
    expect(evaluatePlayerAcquisition(s, 'r1')).toEqual(evaluatePlayerAcquisition(s, 'r1'));
  });

  it('classifies regulator risk by combined share', () => {
    const r = evaluatePlayerAcquisition(makeState(5_000_000_000), 'r1');
    expect(['none', 'review', 'high']).toContain(r.regulatorRisk);
  });

  it('returns a not-found result for an unknown target', () => {
    const r = evaluatePlayerAcquisition(makeState(5_000_000_000), 'nope');
    expect(r.canProceed).toBe(false);
    expect(r.reason).toMatch(/not found/i);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/engine/evaluatePlayerAcquisition.test.ts`
Expected: FAIL — `evaluatePlayerAcquisition` is not exported.

- [ ] **Step 3: Implement it**

In `src/engine/systems/mergers.ts`, add the import and the function:

```ts
import { RegulatorSystem } from './industry/RegulatorSystem';

export interface AcquisitionPreview {
  targetId: string;
  targetName: string;
  price: number;
  playerCash: number;
  affordable: boolean;
  /** Player share + target share, deterministic (no RNG) — safe to render. */
  combinedShare: number;
  /** none < 25%, review 25–35%, high > 35% — mirrors RegulatorSystem thresholds. */
  regulatorRisk: 'none' | 'review' | 'high';
  /** Approximate probability the regulator blocks, for display only. */
  blockChance: number;
  canProceed: boolean;
  reason?: string;
}

/**
 * Deterministic, side-effect-free preview of a player acquisition.
 *
 * Deliberately does NOT call RegulatorSystem.isBlocked — that rolls RNG and
 * would give a different answer every render. The block roll happens once, at
 * execution time, inside executeAcquisition.
 */
export function evaluatePlayerAcquisition(state: GameState, targetId: string): AcquisitionPreview {
  const target = state.entities.rivals[targetId];
  if (!target) {
    return {
      targetId, targetName: 'Unknown', price: 0, playerCash: state.finance.cash,
      affordable: false, combinedShare: 0, regulatorRisk: 'none', blockChance: 0,
      canProceed: false, reason: 'Target studio not found.',
    };
  }

  const { viable, price, reason } = evaluateAcquisitionTarget(target, state.finance.cash);
  const combinedShare =
    RegulatorSystem.getMarketShare(state, 'player') + RegulatorSystem.getMarketShare(state, targetId);

  let regulatorRisk: AcquisitionPreview['regulatorRisk'] = 'none';
  let blockChance = 0;
  if (combinedShare > 35) {
    regulatorRisk = 'high';
    blockChance = 0.9;
  } else if (combinedShare > 25) {
    regulatorRisk = 'review';
    blockChance = 0.4 + (combinedShare - 25) * 0.05;
  }

  return {
    targetId,
    targetName: target.name,
    price,
    playerCash: state.finance.cash,
    affordable: viable,
    combinedShare,
    regulatorRisk,
    blockChance,
    canProceed: viable,
    reason: viable ? undefined : reason,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/engine/evaluatePlayerAcquisition.test.ts`
Expected: PASS (5 passed).

- [ ] **Step 5: Commit**

```bash
git add src/engine/systems/mergers.ts src/test/engine/evaluatePlayerAcquisition.test.ts
git commit -m "feat(mergers): deterministic player acquisition preview"
```

---

### Task 2: Let the regulator actually block a player acquisition

**Files:**
- Modify: `src/engine/systems/mergers.ts` (`executeAcquisition`)
- Test: `src/test/engine/acquisition-blocked.test.ts`

**Design:** a blocked bid is not free — the studio eats a **filing fee of 2% of the price** and **-3 prestige**, and a news item announces the rejection. That's what makes the share preview a real risk decision rather than a free reroll.

- [ ] **Step 1: Write the failing test**

Create `src/test/engine/acquisition-blocked.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { executeAcquisition } from '@/engine/systems/mergers';
import { RegulatorSystem } from '@/engine/systems/industry/RegulatorSystem';
import type { GameState } from '@/engine/types';

function makeState(): GameState {
  return {
    week: 40,
    studio: { id: 'PLAYER', name: 'Player Studio', prestige: 50 },
    finance: { cash: 5_000_000_000 },
    entities: {
      rivals: { r1: { id: 'r1', name: 'Target Co', cash: 50_000_000, strength: 30, prestige: 30, archetype: 'mid-tier' } },
      projects: {}, contracts: {}, buyers: {},
    },
    industry: { newsHistory: [] },
  } as unknown as GameState;
}

afterEach(() => vi.restoreAllMocks());

describe('executeAcquisition regulator gate', () => {
  it('BLOCKED: target survives, no ownership transfer, fee + prestige penalty applied', () => {
    vi.spyOn(RegulatorSystem, 'isBlocked').mockReturnValue({
      blocked: true, sharePreview: 40, reason: 'Severe Concentration of Media Power',
    });
    const before = makeState();
    const after = executeAcquisition(before, 'r1');

    expect(after.entities.rivals.r1).toBeDefined();           // not absorbed
    expect(after.finance.cash).toBeLessThan(before.finance.cash); // filing fee charged
    expect(after.studio.prestige).toBeLessThan(before.studio.prestige);
    expect(after.industry.newsHistory[0].headline).toMatch(/block|reject/i);
  });

  it('ALLOWED: target absorbed and prestige rises', () => {
    vi.spyOn(RegulatorSystem, 'isBlocked').mockReturnValue({ blocked: false, sharePreview: 10 });
    const before = makeState();
    const after = executeAcquisition(before, 'r1');

    expect(after.entities.rivals.r1).toBeUndefined();         // absorbed
    expect(after.studio.prestige).toBeGreaterThan(before.studio.prestige);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/engine/acquisition-blocked.test.ts`
Expected: FAIL on the BLOCKED case — the rival is absorbed regardless, because no regulator check exists.

- [ ] **Step 3: Add the gate**

In `src/engine/systems/mergers.ts`, inside `executeAcquisition`, immediately after the existing viability check (`if (!evalResult.viable) return state;`), insert:

```ts
  // Regulator gate. The roll happens exactly once, here — the UI preview is
  // deterministic and shows the risk; this is where the dice are thrown.
  const verdict = RegulatorSystem.isBlocked(state, 'player', targetId);
  if (verdict.blocked) {
    const filingFee = Math.round(evalResult.price * 0.02);
    return {
      ...state,
      finance: { ...state.finance, cash: state.finance.cash - filingFee },
      studio: { ...state.studio, prestige: Math.max(0, state.studio.prestige - 3) },
      industry: {
        ...state.industry,
        newsHistory: [
          {
            id: generateId('NEWS'),
            week: state.week,
            type: 'STUDIO_EVENT' as const,
            headline: `BLOCKED: Regulators reject ${state.studio.name}'s bid for ${target.name}`,
            description: `${verdict.reason ?? 'Competition concerns'} — combined share would reach ${verdict.sharePreview.toFixed(1)}%. ${state.studio.name} forfeits $${(filingFee / 1e6).toFixed(1)}M in filing costs.`,
          },
          ...state.industry.newsHistory,
        ].slice(0, 50),
      },
    };
  }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/engine/acquisition-blocked.test.ts`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add src/engine/systems/mergers.ts src/test/engine/acquisition-blocked.test.ts
git commit -m "feat(mergers): regulator can block player acquisitions (fee + prestige penalty)"
```

---

### Task 3: Store — consolidate the duplicate actions and expose the preview

**Files:**
- Modify: `src/store/slices/rivalSlice.ts`
- Test: `src/test/store/rivalSlice-acquisition.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/store/rivalSlice-acquisition.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import type { GameState } from '@/engine/types';

function seed(): GameState {
  return {
    week: 40,
    studio: { id: 'PLAYER', name: 'Player Studio', prestige: 50 },
    finance: { cash: 5_000_000_000 },
    entities: {
      rivals: { r1: { id: 'r1', name: 'Target Co', cash: 50_000_000, strength: 30, prestige: 30, archetype: 'mid-tier' } },
      projects: {}, contracts: {}, buyers: {},
    },
    industry: { newsHistory: [] },
  } as unknown as GameState;
}

beforeEach(() => useGameStore.setState({ gameState: seed() } as any));

describe('rivalSlice acquisition', () => {
  it('previewAcquisition returns a preview without mutating state', () => {
    const before = useGameStore.getState().gameState;
    const preview = useGameStore.getState().previewAcquisition('r1');
    expect(preview?.targetName).toBe('Target Co');
    expect(useGameStore.getState().gameState).toBe(before); // identical reference
  });

  it('previewAcquisition returns null when there is no game', () => {
    useGameStore.setState({ gameState: null } as any);
    expect(useGameStore.getState().previewAcquisition('r1')).toBeNull();
  });

  it('acquireRival changes state', () => {
    useGameStore.getState().acquireRival('r1');
    expect(useGameStore.getState().gameState).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/store/rivalSlice-acquisition.test.ts`
Expected: FAIL — `previewAcquisition is not a function`.

- [ ] **Step 3: Update the slice**

Replace `src/store/slices/rivalSlice.ts` with:

```ts
import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import {
  executeAcquisition,
  executeSabotage,
  executePoach,
  evaluatePlayerAcquisition,
  type AcquisitionPreview,
} from "@/engine/systems/mergers";

export interface RivalSlice {
  /** Side-effect-free preview for the confirmation modal. */
  previewAcquisition: (targetId: string) => AcquisitionPreview | null;
  acquireRival: (targetId: string) => void;
  corporateSabotage: (targetId: string) => void;
  poachExec: (targetId: string) => void;
}

export const createRivalSlice: StateCreator<GameStore, [], [], RivalSlice> = (set, get) => ({
  previewAcquisition: (targetId) => {
    const state = get().gameState;
    if (!state) return null;
    return evaluatePlayerAcquisition(state, targetId);
  },

  acquireRival: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      const next = executeAcquisition(s.gameState, targetId);
      return { gameState: next, finance: next.finance };
    });
  },

  corporateSabotage: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      return { gameState: executeSabotage(s.gameState, targetId) };
    });
  },

  poachExec: (targetId) => {
    set((s) => {
      if (!s.gameState) return s;
      return { gameState: executePoach(s.gameState, targetId) };
    });
  },
});
```

> `attemptTakeover` is removed — it was a byte-for-byte duplicate of `acquireRival`. Task 5 updates its only caller.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/store/rivalSlice-acquisition.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add src/store/slices/rivalSlice.ts src/test/store/rivalSlice-acquisition.test.ts
git commit -m "feat(store): acquisition preview action; drop duplicate attemptTakeover"
```

---

### Task 4: The confirmation modal

**Files:**
- Modify: `src/store/uiStore.ts` (`ModalType`)
- Create: `src/components/modals/AcquisitionConfirmModal.tsx`
- Modify: `src/components/modals/ModalManager.tsx`

- [ ] **Step 1: Add the modal type**

In `src/store/uiStore.ts`, add to the `ModalType` union:

```ts
  | 'ACQUISITION_CONFIRM';
```

- [ ] **Step 2: Create the modal**

Create `src/components/modals/AcquisitionConfirmModal.tsx`:

```tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Building2, ShieldAlert, X } from 'lucide-react';

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

const RISK_COPY = {
  none: { label: 'Clear', tone: 'text-emerald-400', note: 'Combined share is below the regulator review threshold.' },
  review: { label: 'Under Review', tone: 'text-amber-400', note: 'Regulators are likely to scrutinise this deal.' },
  high: { label: 'High Risk', tone: 'text-rose-400', note: 'Severe concentration — regulators will probably block this.' },
} as const;

export const AcquisitionConfirmModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const previewAcquisition = useGameStore((s) => s.previewAcquisition);
  const acquireRival = useGameStore((s) => s.acquireRival);

  if (!activeModal || activeModal.type !== 'ACQUISITION_CONFIRM') return null;

  const targetId = (activeModal.payload as { targetId?: string })?.targetId;
  const preview = targetId ? previewAcquisition(targetId) : null;
  if (!preview) {
    resolveCurrentModal();
    return null;
  }

  const risk = RISK_COPY[preview.regulatorRisk];

  const handleConfirm = () => {
    acquireRival(preview.targetId);
    resolveCurrentModal();
  };

  return (
    <Dialog open onOpenChange={resolveCurrentModal}>
      <DialogContent className="max-w-lg bg-card/90 backdrop-blur-2xl border border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground not-italic">
              Acquisition Review
            </span>
          </div>
          <DialogTitle className="font-display font-black text-xl tracking-tight uppercase not-italic">
            Acquire {preview.targetName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            You inherit their slate, contracts and cash reserves. Regulators review the combined entity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="border border-border bg-muted/30 p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Purchase Price</span>
            <span className="font-display text-lg font-bold tabular-nums">{fmt(preview.price)}</span>
          </div>
          <div className="border border-border bg-muted/20 p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your Cash</span>
            <span className={`font-display text-lg font-bold tabular-nums ${preview.affordable ? 'text-foreground' : 'text-rose-400'}`}>
              {fmt(preview.playerCash)}
            </span>
          </div>
          <div className="border border-border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldAlert className="h-4 w-4" /> Regulator Outlook
              </span>
              <span className={`font-display text-sm font-bold uppercase not-italic ${risk.tone}`}>
                {risk.label}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
              <span>Combined market share</span>
              <span>{preview.combinedShare.toFixed(1)}%</span>
            </div>
            {preview.blockChance > 0 && (
              <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
                <span>Estimated block chance</span>
                <span>{Math.round(preview.blockChance * 100)}%</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground/70">{risk.note}</p>
            {preview.blockChance > 0 && (
              <p className="text-xs text-amber-400/80">
                A blocked bid still costs a 2% filing fee and 3 prestige.
              </p>
            )}
          </div>
          {!preview.affordable && preview.reason && (
            <p className="text-xs text-rose-400">{preview.reason}</p>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={resolveCurrentModal}>
            <X className="h-4 w-4 mr-2" />
            Walk Away
          </Button>
          <Button className="flex-1" disabled={!preview.canProceed} onClick={handleConfirm}>
            <Building2 className="h-4 w-4 mr-2" />
            Bid {fmt(preview.price)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

- [ ] **Step 3: Register it in `ModalManager.tsx`**

Add the lazy import with the others:

```tsx
const AcquisitionConfirmModal = React.lazy(() => import('./AcquisitionConfirmModal').then(m => ({ default: m.AcquisitionConfirmModal })));
```

Add the case in the switch:

```tsx
          case 'ACQUISITION_CONFIRM':
            return <AcquisitionConfirmModal key={activeModal.id} />;
```

- [ ] **Step 4: Verify it typechecks**

Run: `npm run typecheck 2>&1 | grep -E "AcquisitionConfirmModal|uiStore|ModalManager"`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/store/uiStore.ts src/components/modals/AcquisitionConfirmModal.tsx src/components/modals/ModalManager.tsx
git commit -m "feat(ui): acquisition confirmation modal with antitrust preview"
```

---

### Task 5: Wire the RivalCard entry point

**Files:**
- Modify: `src/components/rivals/RivalCard.tsx` (the takeover dropdown item, ~line 109)
- Modify: the parent that passes `attemptTakeover` into `RivalCard`

- [ ] **Step 1: Find the parent passing the prop**

Run: `grep -rn "attemptTakeover" src/components`
Note every file — the prop is declared in `RivalCard.tsx:29`, destructured at `:37`, used at `:109`, and passed by its parent (`RivalsPanel`).

- [ ] **Step 2: Replace the prop with the modal opener in `RivalCard.tsx`**

Remove `attemptTakeover` from the props interface (line ~29) and the destructure (line ~37). Add at the top of the component body:

```tsx
  const enqueueModal = useUIStore((s) => s.enqueueModal);
```

(with `import { useUIStore } from '@/store/uiStore';` at the top of the file), and change the dropdown item's handler:

```tsx
              onClick={() => enqueueModal('ACQUISITION_CONFIRM', { targetId: rival.id })}
```

Also update the item's label so it reads honestly — it now opens a review, not an instant takeover:

```tsx
                  ACQUIRE STUDIO
```

- [ ] **Step 3: Remove the now-unused prop from the parent**

In the parent found in Step 1 (`RivalsPanel`), delete the `attemptTakeover={...}` prop passed to `<RivalCard>` and any `attemptTakeover` selector pulled from the store.

- [ ] **Step 4: Verify**

Run: `npm run typecheck 2>&1 | grep -iE "attemptTakeover|RivalCard|RivalsPanel"`
Expected: no output.

Run: `npx eslint "src/components/rivals/*.tsx"`
Expected: exit 0.

- [ ] **Step 5: Manual smoke**

Run `npm run dev`, open `http://localhost:8081/dashboard?autoStart=true`, go to the **Industry Intelligence** tab, open a rival's ⋮ menu, and click **Acquire Studio**. Confirm the modal shows a price, your cash, a combined share % and a regulator outlook; "Walk Away" closes it with no state change; "Bid" either absorbs the rival or produces a `BLOCKED:` news headline.

- [ ] **Step 6: Commit**

```bash
git add src/components/rivals/
git commit -m "feat(ui): rival acquisition goes through the confirmation modal"
```

---

## Self-Review Notes

- **Coverage:** deterministic preview (T1), regulator gate with a real cost for failure (T2), store consolidation + preview action (T3), modal (T4), entry point (T5).
- **Determinism split is deliberate:** `evaluatePlayerAcquisition` never calls `isBlocked` (which rolls RNG), so the modal shows a stable number across re-renders; the single block roll happens inside `executeAcquisition`. Mixing these would make the preview flicker and let players reroll by reopening the modal.
- **Type consistency:** `AcquisitionPreview` fields (`targetId, targetName, price, playerCash, affordable, combinedShare, regulatorRisk, blockChance, canProceed, reason`) are used identically in T1, T3 and T4; `previewAcquisition(targetId)` and `acquireRival(targetId)` signatures match across store and UI.
- **Removed duplicate:** `attemptTakeover` is deleted rather than left as a second path into `executeAcquisition` — two entry points would let the UI bypass the confirmation modal.
- **Balance note for playtesting:** the 2% filing fee and −3 prestige are starting values chosen so a blocked bid stings without being ruinous; expect to tune them once the antitrust ceiling is actually reachable in a run.
