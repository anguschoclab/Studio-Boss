# Player-Initiated Sequels & Reboots (F3) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the player develop a sequel or reboot from any studio-owned IP asset directly in the IP Vault — with franchise fatigue shown as the risk — instead of only reacting when the engine randomly offers one.

**Architecture:** A `developFromOwnedIP(assetId)` store action mirrors the existing `acquireAndRebootIP` (which only works on `MARKET` assets and charges a purchase price) but for `STUDIO`-owned assets, where there is no acquisition cost — the cost is the production budget and the risk is fatigue. Fatigue is computed from the existing `calculateFranchiseFatigue` and surfaced on the asset card. This plan also repairs two real bugs in the existing engine-initiated reboot path that currently make that modal render blank.

**Tech Stack:** TypeScript, Zustand, React, Vitest.

**Why this matters:** The IP Vault is currently a museum — owned assets have no action at all (only `MARKET` assets get an "ACQUIRE & REBOOT" button). Meanwhile `ipRebootEngine`, `fatigueEngine` and `spinoffFactory` are all built and the engine already spawns reboot offers *at* the player once a year. Flipping the direction turns the vault into the strategy centrepiece, and it completes the loop with the distressed-asset plan: buy a rival's fire-sale franchise, then actually exploit it.

**Verified facts (do not re-derive):**
- `src/store/slices/projectSlice.ts:285` — `acquireAndRebootIP(ipAssetId)`: guards `asset.rightsOwner !== "MARKET"`, requires `cash >= asset.baseValue`, builds a `CreateProjectParams`, calls `buildProjectAndContracts(state, params)`, applies `FUNDS_DEDUCTED` + `NEWS_ADDED` via `applyStateImpact`, then merges `newContracts` into `entities.contracts`. **This is the exact pattern to copy.**
- `CreateProjectParams` (`src/store/storeUtils.ts`) = `{ title, format, genre, budgetTier, targetAudience, flavor, attachedTalentIds?, tvFormat?, unscriptedFormat?, episodes?, releaseModel?, parentProjectId?, isSpinoff?, initialBuzzBonus?, franchiseId? }`.
- `IPAsset` (`src/engine/types/state.types.ts:79`) = `{ id, originalProjectId, title, franchiseId?, baseValue, decayRate, merchandisingMultiplier, syndicationStatus, syndicationTier, totalEpisodes, rightsExpirationWeek, rightsOwner: "STUDIO"|"MARKET"|"RIVAL", ownerStudioId? }`.
- `calculateFranchiseFatigue(franchise, genreSaturation, genre = "Action")` at `src/engine/systems/ip/fatigueEngine.ts:18` returns a number; it reads `franchise.activeProjectIds`.
- `src/components/ip/IPAssetCard.tsx` — `IPAssetFooter` renders the "ACQUIRE & REBOOT" button **only when `isMarket`**; the card receives `{ asset, isMarket? }`. `IPVault.tsx:118` renders owned assets as `<IPAssetCard key={asset.id} asset={asset} />` (no `isMarket`).
- **Bug A:** `src/components/modals/RebootOpportunityModal.tsx:8` imports the type `RebootProposal` from `@/engine/systems/ip/ipRebootEngine` — **that type does not exist** (the module exports only `applyRebootNostalgia` and `generateRebootProposal`, the latter returning `any`).
- **Bug B:** `generateRebootProposal` returns `{ ipId, ipTitle, suggestedBudget, estimatedNostalgiaBonus, description }`, but `RebootOpportunityModal` destructures `{ proposal, assetTitle, assetTier, estimatedBuzz, developmentCostMultiplier, angle, logline }` — **completely different shape**. Additionally `AnnualScans.ts:108` emits `payload: { modalType, priority, payload: proposal }`, and the `doAdvanceWeek` bridge spreads `{ ...rest }`, so the modal receives `{ priority, payload }` and never sees the proposal fields at all. The engine-initiated reboot modal therefore renders blank today.

---

## File Structure

| File | Responsibility | Change |
|------|---------------|--------|
| `src/engine/systems/ip/ipRebootEngine.ts` | Reboot proposal shape | Export a real `RebootProposal` type; add `buildRebootParams` |
| `src/store/slices/projectSlice.ts` | Player actions | Add `developFromOwnedIP` |
| `src/store/selectors.ts` | Fatigue lookup | Add `selectFatigueForAsset` |
| `src/components/ip/IPAssetCard.tsx` | Vault card | "Develop Sequel" action + fatigue badge for owned assets |
| `src/components/modals/RebootOpportunityModal.tsx` | Engine-offered reboots | Fix the broken type + payload shape |
| `src/engine/services/filters/AnnualScans.ts` | Reboot offer emission | Emit a flat payload the modal can read |

---

### Task 1: Give the reboot proposal a real type and a params builder

**Files:**
- Modify: `src/engine/systems/ip/ipRebootEngine.ts`
- Test: `src/test/engine/rebootProposal.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/engine/rebootProposal.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildRebootParams } from '@/engine/systems/ip/ipRebootEngine';
import type { IPAsset } from '@/engine/types';

const asset = {
  id: 'a1',
  originalProjectId: 'p0',
  title: 'Nightfall',
  franchiseId: 'f1',
  baseValue: 200_000_000,
  decayRate: 0.4,
  merchandisingMultiplier: 1,
  syndicationStatus: 'NONE',
  syndicationTier: 'NONE',
  totalEpisodes: 0,
  rightsExpirationWeek: 999,
  rightsOwner: 'STUDIO',
} as IPAsset;

describe('buildRebootParams', () => {
  it('carries the asset title, franchise link and marks it a spinoff', () => {
    const p = buildRebootParams(asset, 0);
    expect(p.title).toContain('Nightfall');
    expect(p.franchiseId).toBe('f1');
    expect(p.isSpinoff).toBe(true);
    expect(p.parentProjectId).toBe('p0');
  });

  it('picks a blockbuster tier for a high-value asset and high tier otherwise', () => {
    expect(buildRebootParams(asset, 0).budgetTier).toBe('blockbuster');
    expect(buildRebootParams({ ...asset, baseValue: 20_000_000 }, 0).budgetTier).toBe('high');
  });

  it('fatigue reduces the starting buzz bonus but never below zero', () => {
    const fresh = buildRebootParams(asset, 0).initialBuzzBonus ?? 0;
    const tired = buildRebootParams(asset, 90).initialBuzzBonus ?? 0;
    expect(tired).toBeLessThan(fresh);
    expect(tired).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/engine/rebootProposal.test.ts`
Expected: FAIL — `buildRebootParams` is not exported.

- [ ] **Step 3: Add the type and builder**

In `src/engine/systems/ip/ipRebootEngine.ts`, add:

```ts
import type { CreateProjectParams } from '@/store/storeUtils';

/**
 * The shape generateRebootProposal actually returns. Previously untyped (`any`),
 * which let RebootOpportunityModal consume a completely different shape without
 * a compile error — that's why the engine-offered reboot modal rendered blank.
 */
export interface RebootProposal {
  ipId: string;
  ipTitle: string;
  suggestedBudget: number;
  estimatedNostalgiaBonus: number;
  description: string;
}

/**
 * Turn an owned IP asset into project-creation params.
 * Fatigue (0-100) erodes the nostalgia buzz a revival starts with — reviving a
 * franchise the audience is tired of is the actual risk the player is taking.
 */
export function buildRebootParams(asset: IPAsset, fatigue: number): CreateProjectParams {
  const baseBuzz = Math.floor(asset.decayRate * 50) + 20;
  const initialBuzzBonus = Math.max(0, Math.round(baseBuzz * (1 - fatigue / 100)));
  return {
    title: `${asset.title} (Revival)`,
    format: 'film',
    genre: 'DRAMA',
    budgetTier: asset.baseValue > 100_000_000 ? 'blockbuster' : 'high',
    targetAudience: 'GENERAL',
    flavor: 'reboot',
    franchiseId: asset.franchiseId,
    parentProjectId: asset.originalProjectId,
    isSpinoff: true,
    initialBuzzBonus,
  };
}
```

Then change the return type of `generateRebootProposal` from `any` to `RebootProposal | null`:

```ts
export function generateRebootProposal(vault: IPAsset[], rng: any): RebootProposal | null {
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/engine/rebootProposal.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add src/engine/systems/ip/ipRebootEngine.ts src/test/engine/rebootProposal.test.ts
git commit -m "feat(ip): typed RebootProposal and buildRebootParams"
```

---

### Task 2: Fatigue selector for a vault asset

**Files:**
- Modify: `src/store/selectors.ts`
- Test: `src/test/store/fatigue-selector.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/store/fatigue-selector.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { selectFatigueForAsset } from '@/store/selectors';
import type { GameState } from '@/engine/types';

function makeState(activeProjectIds: string[]): GameState {
  return {
    entities: { projects: {} },
    market: { trends: [] },
    ip: {
      vault: [{ id: 'a1', title: 'Nightfall', franchiseId: 'f1', rightsOwner: 'STUDIO' }],
      franchises: { f1: { id: 'f1', name: 'Nightfall', activeProjectIds } },
    },
  } as unknown as GameState;
}

describe('selectFatigueForAsset', () => {
  it('returns 0 for an asset with no franchise', () => {
    const s = makeState([]);
    (s.ip.vault[0] as any).franchiseId = undefined;
    expect(selectFatigueForAsset(s, 'a1')).toBe(0);
  });

  it('returns a number for a franchised asset', () => {
    expect(typeof selectFatigueForAsset(makeState(['p1', 'p2']), 'a1')).toBe('number');
  });

  it('more active entries means more fatigue', () => {
    const few = selectFatigueForAsset(makeState(['p1']), 'a1');
    const many = selectFatigueForAsset(makeState(['p1', 'p2', 'p3', 'p4', 'p5']), 'a1');
    expect(many).toBeGreaterThanOrEqual(few);
  });

  it('returns 0 for an unknown asset id', () => {
    expect(selectFatigueForAsset(makeState([]), 'nope')).toBe(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/store/fatigue-selector.test.ts`
Expected: FAIL — `selectFatigueForAsset` is not exported.

- [ ] **Step 3: Add the selector**

In `src/store/selectors.ts`, add:

```ts
import { calculateFranchiseFatigue } from '@/engine/systems/ip/fatigueEngine';

/**
 * Franchise fatigue (0-100) for a vault asset. Standalone assets have no
 * franchise and therefore no fatigue.
 */
export const selectFatigueForAsset = (state: GameState | null, assetId: string): number => {
  const asset = state?.ip?.vault?.find((a) => a.id === assetId);
  if (!asset?.franchiseId) return 0;
  const franchise = state?.ip?.franchises?.[asset.franchiseId];
  if (!franchise) return 0;

  // Genre saturation = how many active rival/studio projects share the genre.
  const genre = (asset as { genre?: string }).genre ?? 'Action';
  const saturation = Object.values(state?.entities?.projects ?? {}).filter(
    (p) => p.genre === genre && p.state !== 'released' && p.state !== 'archived'
  ).length;

  return calculateFranchiseFatigue(franchise, saturation, genre);
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/store/fatigue-selector.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Commit**

```bash
git add src/store/selectors.ts src/test/store/fatigue-selector.test.ts
git commit -m "feat(store): selectFatigueForAsset"
```

---

### Task 3: `developFromOwnedIP` store action

**Files:**
- Modify: `src/store/slices/projectSlice.ts`
- Test: `src/test/store/developFromOwnedIP.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/store/developFromOwnedIP.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import type { GameState } from '@/engine/types';

function seed(rightsOwner: 'STUDIO' | 'MARKET' = 'STUDIO'): GameState {
  return {
    week: 20,
    gameSeed: 42,
    rngState: 42,
    studio: { id: 'PLAYER', name: 'Player Studio', prestige: 50, internal: { projectHistory: [], projects: {}, contracts: [] } },
    finance: { cash: 900_000_000, weeklyHistory: [], ledger: [], marketState: {} },
    entities: { projects: {}, contracts: {}, talents: {}, rivals: {}, buyers: {} },
    market: { trends: [] },
    ip: {
      vault: [{
        id: 'a1', originalProjectId: 'p0', title: 'Nightfall', franchiseId: 'f1',
        baseValue: 200_000_000, decayRate: 0.4, merchandisingMultiplier: 1,
        syndicationStatus: 'NONE', syndicationTier: 'NONE', totalEpisodes: 0,
        rightsExpirationWeek: 999, rightsOwner,
      }],
      franchises: { f1: { id: 'f1', name: 'Nightfall', activeProjectIds: [] } },
    },
    industry: { newsHistory: [] },
    news: { headlines: [] },
  } as unknown as GameState;
}

beforeEach(() => useGameStore.setState({ gameState: seed() } as any));

describe('developFromOwnedIP', () => {
  it('creates a project from an owned asset and announces it', () => {
    const before = Object.keys(useGameStore.getState().gameState!.entities.projects).length;
    useGameStore.getState().developFromOwnedIP('a1');
    const s = useGameStore.getState().gameState!;
    expect(Object.keys(s.entities.projects).length).toBe(before + 1);
    expect(s.industry.newsHistory[0].headline).toMatch(/Nightfall/i);
  });

  it('does NOT charge an acquisition fee for already-owned IP', () => {
    const cashBefore = useGameStore.getState().gameState!.finance.cash;
    useGameStore.getState().developFromOwnedIP('a1');
    // Production costs are drawn down weekly by the engine, not at greenlight,
    // so cash is unchanged at creation time for an asset the studio already owns.
    expect(useGameStore.getState().gameState!.finance.cash).toBe(cashBefore);
  });

  it('refuses assets the studio does not own', () => {
    useGameStore.setState({ gameState: seed('MARKET') } as any);
    useGameStore.getState().developFromOwnedIP('a1');
    expect(Object.keys(useGameStore.getState().gameState!.entities.projects).length).toBe(0);
  });

  it('is a no-op for an unknown asset id', () => {
    useGameStore.getState().developFromOwnedIP('nope');
    expect(Object.keys(useGameStore.getState().gameState!.entities.projects).length).toBe(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/store/developFromOwnedIP.test.ts`
Expected: FAIL — `developFromOwnedIP is not a function`.

- [ ] **Step 3: Add the action**

In `src/store/slices/projectSlice.ts`:

(a) Add to the `ProjectSlice` interface (next to `acquireAndRebootIP`):

```ts
  developFromOwnedIP: (ipAssetId: string) => void;
```

(b) Add the imports:

```ts
import { buildRebootParams } from "@/engine/systems/ip/ipRebootEngine";
import { selectFatigueForAsset } from "../selectors";
```

(c) Add the implementation directly after `acquireAndRebootIP`:

```ts
  developFromOwnedIP: (ipAssetId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const asset = state.ip.vault.find((a) => a.id === ipAssetId);
      // Owned IP only — MARKET assets go through acquireAndRebootIP, which
      // charges the rights purchase. Here the studio already owns the rights.
      if (!asset || asset.rightsOwner !== "STUDIO") return s;

      const fatigue = selectFatigueForAsset(state, ipAssetId);
      const params = buildRebootParams(asset, fatigue);
      const { project, newContracts } = buildProjectAndContracts(state, params);

      const impacts: StateImpact[] = [
        {
          type: "NEWS_ADDED" as const,
          payload: {
            headline: `${state.studio.name} revives "${asset.title}"`,
            description:
              fatigue > 60
                ? `A risky return to a well-worn property — audiences have seen a lot of ${asset.title}.`
                : `The studio puts a new take on ${asset.title} into development.`,
          },
        },
      ];

      const intermediateState = applyStateImpact(state, impacts);

      const contracts = { ...intermediateState.entities.contracts };
      newContracts.forEach((c) => {
        contracts[c.id] = c;
      });

      const nextState = {
        ...intermediateState,
        entities: {
          ...intermediateState.entities,
          projects: { ...intermediateState.entities.projects, [project.id]: project },
          contracts,
        },
      };

      return { gameState: nextState, finance: nextState.finance };
    });
  },
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/store/developFromOwnedIP.test.ts`
Expected: PASS (4 passed).

> If the "does not charge" assertion fails because `buildProjectAndContracts` deducts an upfront cost in this codebase, update that one assertion to match the real behaviour (assert cash decreased by the development spend rather than staying equal) — the point of the test is that there is **no rights-acquisition fee**, not that cash is frozen.

- [ ] **Step 5: Commit**

```bash
git add src/store/slices/projectSlice.ts src/test/store/developFromOwnedIP.test.ts
git commit -m "feat(ip): developFromOwnedIP player action"
```

---

### Task 4: Surface the action and fatigue in the IP Vault

**Files:**
- Modify: `src/components/ip/IPAssetCard.tsx`

- [ ] **Step 1: Wire the store and fatigue into the card**

In `IPAssetCard.tsx`, inside the main `IPAssetCard` component, add:

```tsx
  const developFromOwnedIP = useGameStore((s) => s.developFromOwnedIP);
  const fatigue = useGameStore((s) => selectFatigueForAsset(s.gameState, asset.id));
```

with the import:

```tsx
import { selectFatigueForAsset } from "@/store/selectors";
```

- [ ] **Step 2: Extend the footer to handle owned assets**

Change `IPAssetFooterProps` and the component so owned assets get the develop action and a fatigue readout:

```tsx
interface IPAssetFooterProps {
  asset: IPAsset;
  isMarket: boolean;
  acquireAndRebootIP: (id: string) => void;
  developFromOwnedIP: (id: string) => void;
  fatigue: number;
}

const IPAssetFooter = ({ asset, isMarket, acquireAndRebootIP, developFromOwnedIP, fatigue }: IPAssetFooterProps) => {
  const owned = !isMarket && asset.rightsOwner === "STUDIO";
  const fatigueTone =
    fatigue > 60 ? "text-rose-400" : fatigue > 30 ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="pt-6 mt-auto border-t border-white/5 flex justify-between items-center gap-4">
      <div className="flex flex-col gap-1">
        <div className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 leading-none">
          EXPIRES WEEK {asset.rightsExpirationWeek}
        </div>
        {owned && (
          <div className={`text-[10px] font-semibold uppercase tracking-[0.12em] tabular-nums not-italic ${fatigueTone}`}>
            Fatigue {Math.round(fatigue)}%
          </div>
        )}
      </div>

      {isMarket && (
        <Button
          size="sm"
          variant="outline"
          className="h-10 text-[9px] font-black bg-secondary/5 hover:bg-secondary text-secondary hover:text-black border border-secondary/20 px-6 rounded-none uppercase tracking-[0.15em] transition-all"
          onClick={(e) => {
            e.stopPropagation();
            acquireAndRebootIP(asset.id);
          }}
        >
          ACQUIRE &amp; REBOOT
        </Button>
      )}

      {owned && (
        <Button
          size="sm"
          variant="outline"
          className="h-10 text-[9px] font-black px-6 rounded-none uppercase tracking-[0.15em] transition-all"
          title={
            fatigue > 60
              ? "Audiences are tired of this franchise — expect a muted opening."
              : "Develop a new film from this owned property."
          }
          onClick={(e) => {
            e.stopPropagation();
            developFromOwnedIP(asset.id);
          }}
        >
          DEVELOP SEQUEL
        </Button>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Pass the new props at the call site**

Where `IPAssetCard` renders `<IPAssetFooter ... />`, add the two new props:

```tsx
        <IPAssetFooter
          asset={asset}
          isMarket={!!isMarket}
          acquireAndRebootIP={acquireAndRebootIP}
          developFromOwnedIP={developFromOwnedIP}
          fatigue={fatigue}
        />
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck 2>&1 | grep -iE "IPAssetCard|IPVault"`
Expected: no output.

Run: `npx eslint "src/components/ip/*.tsx"`
Expected: exit 0.

- [ ] **Step 5: Manual smoke**

Run `npm run dev`, open `http://localhost:8081/dashboard?autoStart=true`, advance until a film releases and enters the vault, then open **IP VAULT**. An owned asset should show a **Fatigue %** and a **DEVELOP SEQUEL** button; clicking it should add a project to the Production Pipeline and post a "revives" headline.

- [ ] **Step 6: Commit**

```bash
git add src/components/ip/IPAssetCard.tsx
git commit -m "feat(ip): Develop Sequel action and fatigue readout on owned vault assets"
```

---

### Task 5: Repair the engine-offered reboot modal

The annual reboot offer currently renders a blank modal — the payload is double-nested and the component consumes a shape the engine never produces.

**Files:**
- Modify: `src/engine/services/filters/AnnualScans.ts:105-118`
- Modify: `src/components/modals/RebootOpportunityModal.tsx`

- [ ] **Step 1: Flatten the emitted payload**

In `src/engine/services/filters/AnnualScans.ts`, replace the reboot `MODAL_TRIGGERED` push with:

```ts
        context.impacts.push({
          type: "MODAL_TRIGGERED",
          payload: {
            modalType: "REBOOT_OPPORTUNITY",
            priority: 30,
            proposal,
          },
        });
```

> The `doAdvanceWeek` bridge destructures `{ modalType, ...rest }` and passes `rest` as the modal payload, so the modal will now receive `{ priority, proposal }` — a flat shape it can actually read. The previous nested `payload: proposal` produced `{ priority, payload }`, which the modal silently destructured into `undefined`s.

- [ ] **Step 2: Rewrite the modal to the real proposal shape**

Replace `src/components/modals/RebootOpportunityModal.tsx` with:

```tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Film, X } from 'lucide-react';
import type { RebootProposal } from '@/engine/systems/ip/ipRebootEngine';

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export const RebootOpportunityModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const developFromOwnedIP = useGameStore((s) => s.developFromOwnedIP);

  if (!activeModal || activeModal.type !== 'REBOOT_OPPORTUNITY') return null;

  const proposal = (activeModal.payload as { proposal?: RebootProposal })?.proposal;
  if (!proposal) {
    resolveCurrentModal();
    return null;
  }

  const handleGreenlight = () => {
    developFromOwnedIP(proposal.ipId);
    resolveCurrentModal();
  };

  return (
    <Dialog open onOpenChange={resolveCurrentModal}>
      <DialogContent className="max-w-lg bg-card/90 backdrop-blur-2xl border border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Film className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground not-italic">
              Reboot Opportunity
            </span>
          </div>
          <DialogTitle className="font-display font-black text-xl tracking-tight uppercase not-italic">
            {proposal.ipTitle}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            {proposal.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="border border-border bg-muted/30 p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Suggested Budget</span>
            <span className="font-display text-lg font-bold tabular-nums">{fmt(proposal.suggestedBudget)}</span>
          </div>
          <div className="border border-border bg-muted/20 p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Nostalgia Bonus</span>
            <span className="font-display text-lg font-bold tabular-nums">+{proposal.estimatedNostalgiaBonus}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Passing leaves the property on the shelf — you can still develop it later from the IP Vault.
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={resolveCurrentModal}>
            <X className="h-4 w-4 mr-2" />
            Pass
          </Button>
          <Button className="flex-1" onClick={handleGreenlight}>
            <Film className="h-4 w-4 mr-2" />
            Greenlight Revival
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

- [ ] **Step 3: Verify the broken import is gone**

Run: `npm run typecheck 2>&1 | grep -iE "RebootOpportunityModal|RebootProposal|AnnualScans"`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/engine/services/filters/AnnualScans.ts src/components/modals/RebootOpportunityModal.tsx
git commit -m "fix(ip): repair engine-offered reboot modal payload and type"
```

---

## Self-Review Notes

- **Coverage:** typed proposal + params builder (T1), fatigue selector (T2), player action (T3), vault UI (T4), and repair of the pre-existing broken engine-offered path (T5).
- **Type consistency:** `buildRebootParams(asset, fatigue) → CreateProjectParams`, `selectFatigueForAsset(state, assetId) → number`, and `developFromOwnedIP(assetId)` have identical signatures in every task that references them. `RebootProposal` fields (`ipId, ipTitle, suggestedBudget, estimatedNostalgiaBonus, description`) match what `generateRebootProposal` actually returns — verified against the implementation, not assumed.
- **Two paths, one action:** the modal (T5) and the vault button (T4) both call `developFromOwnedIP`, so engine-offered and player-initiated revivals produce identical results. The `MARKET`-asset path stays on `acquireAndRebootIP` because it must charge for rights.
- **Fatigue is the risk, not a blocker:** high fatigue reduces starting buzz and changes the news copy, but never disables the button — the player is allowed to make the bad call, which is what makes it a decision.
- **Interaction with the distressed-asset plan:** a franchise bought in a fire sale lands in the vault as `STUDIO`-owned, so it immediately gains a **DEVELOP SEQUEL** action. That is the intended buy→exploit loop; no extra wiring needed.
