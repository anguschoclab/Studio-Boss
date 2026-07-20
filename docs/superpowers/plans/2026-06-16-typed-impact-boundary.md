# Typed Impact Boundary (T2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `as unknown as StateImpact` / `as any` casts at the engine's impact boundary with typed constructor functions, so field renames and removed properties become compile errors instead of runtime crashes — and add a lint gate that stops new casts from entering `src/engine/`.

**Architecture:** A single `src/engine/core/impacts.ts` exports one small factory per impact type (`impacts.newsAdded(...)`, `impacts.rivalUpdated(...)`, …). Each factory takes typed arguments and returns a correctly-shaped `StateImpact` with **zero casts inside**, so the cast exists in exactly one reviewed place instead of 230 scattered ones. Systems are migrated file-by-file (highest-traffic first), then an ESLint override makes `@typescript-eslint/no-explicit-any` an error under `src/engine/` so the count can only go down.

**Tech Stack:** TypeScript, ESLint (flat config, `typescript-eslint`), Vitest.

**Why this matters:** 230 `as any` / `as unknown as` casts live in `src/engine` (925 across `src/`), overwhelmingly on impact payloads. That cast is precisely the mechanism by which drift ships silently — `MarketState` lost `sentiment`, `selectors.ts` lost three exports, and `RivalStudio` never had `annualRevenue`, yet nothing failed at compile time because the payloads were `any`. Every one of those became a runtime crash instead of a red build.

**Verified facts (do not re-derive):**
- `StateImpact` is a discriminated union declared at `src/engine/types/state.types.ts:491`, with ~45 members (`FundsImpact`, `NewsImpact`, `RivalUpdateImpact`, `IndustryUpdateImpact`, `ModalTriggeredImpact`, …).
- Payload shapes confirmed: `FundsDeductedImpact` = `{ amount: number }`; `RivalUpdateImpact` = `{ rivalId, update }`; `ModalTriggeredImpact` = `{ modalType: string; priority: number; payload: any }`; `IndustryUpdateImpact` applies `payload.update` as immutable **dot-path sets from the state root**.
- `NEWS_ADDED` payloads in the wild carry `{ headline, description, category }`.
- `FRANCHISE_UPDATED` is handled by `ipHandlers.handleFranchiseUpdated`, which shallow-merges `payload.update` into `state.ip.franchises[franchiseId]`.
- ESLint config is flat (`eslint.config.js`) and already contains a per-directory override block for `src/test/**` that switches `@typescript-eslint/no-explicit-any` off — the same mechanism is used here in reverse for `src/engine/**`.
- Baseline: `grep -roE "as any|as unknown as" src/engine --include="*.ts" | wc -l` → **230**.

**Scope boundary (deliberate, YAGNI):** This plan does **not** eliminate all 230 casts. It builds the typed surface, migrates the two highest-traffic engine files as proof, and installs the ratchet that prevents regression. Migrating the remaining files is mechanical follow-on work that the lint rule will surface file-by-file; a big-bang rewrite of 230 call sites in one PR would be unreviewable.

---

## File Structure

| File | Responsibility | Change |
|------|---------------|--------|
| `src/engine/core/impacts.ts` | Typed impact constructors — the single place casts are allowed | Create |
| `src/engine/systems/industry/DistressCascade.ts` | Highest-cast-density system | Migrate to constructors |
| `src/engine/services/WeekCoordinator.ts` | Tick pipeline | Migrate its inline casts |
| `eslint.config.js` | Lint gate | Add `src/engine/**` override |

---

### Task 1: Build the typed impact constructors

**Files:**
- Create: `src/engine/core/impacts.ts`
- Test: `src/test/engine/impacts.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/engine/impacts.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { impacts } from '@/engine/core/impacts';

describe('typed impact constructors', () => {
  it('newsAdded builds a NEWS_ADDED impact', () => {
    const i = impacts.newsAdded({ headline: 'H', description: 'D', category: 'market' });
    expect(i.type).toBe('NEWS_ADDED');
    expect(i.payload.headline).toBe('H');
    expect(i.payload.category).toBe('market');
  });

  it('fundsDeducted builds a FUNDS_DEDUCTED impact', () => {
    const i = impacts.fundsDeducted(500);
    expect(i.type).toBe('FUNDS_DEDUCTED');
    expect(i.payload.amount).toBe(500);
  });

  it('rivalUpdated carries rivalId and a partial update', () => {
    const i = impacts.rivalUpdated('r1', { cash: 10 });
    expect(i.type).toBe('RIVAL_UPDATED');
    expect(i.payload.rivalId).toBe('r1');
    expect(i.payload.update.cash).toBe(10);
  });

  it('franchiseUpdated carries franchiseId and update', () => {
    const i = impacts.franchiseUpdated('f1', { ownerId: 'PLAYER' });
    expect(i.type).toBe('FRANCHISE_UPDATED');
    expect(i.payload.franchiseId).toBe('f1');
  });

  it('industryUpdate takes dot-path keys from the state root', () => {
    const i = impacts.industryUpdate({ 'ip.vault': [] });
    expect(i.type).toBe('INDUSTRY_UPDATE');
    expect(i.payload.update['ip.vault']).toEqual([]);
  });

  it('modalTriggered defaults priority and passes a payload through', () => {
    const i = impacts.modalTriggered('CRISIS', { projectId: 'p1' });
    expect(i.type).toBe('MODAL_TRIGGERED');
    expect(i.payload.modalType).toBe('CRISIS');
    expect(typeof i.payload.priority).toBe('number');
    expect((i.payload.payload as { projectId: string }).projectId).toBe('p1');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/engine/impacts.test.ts`
Expected: FAIL — module `@/engine/core/impacts` not found.

- [ ] **Step 3: Create the constructors**

Create `src/engine/core/impacts.ts`:

```ts
import type { StateImpact } from '../types';
import type { RivalStudio } from '../types';
import type { Franchise } from '../types/franchise.types';

/**
 * Typed constructors for engine impacts.
 *
 * This module is the ONLY place an impact literal should be assembled. Building
 * impacts through these functions means a renamed or removed payload field is a
 * compile error at the call site instead of an `as any` that fails at runtime —
 * which is exactly how the selectors/MarketState drift shipped unnoticed.
 */

export type NewsCategory = 'market' | 'general' | 'scandal' | 'talent' | 'awards';

export interface NewsPayload {
  headline: string;
  description?: string;
  category?: NewsCategory;
}

export const impacts = {
  newsAdded(payload: NewsPayload): Extract<StateImpact, { type: 'NEWS_ADDED' }> {
    return { type: 'NEWS_ADDED', payload } as Extract<StateImpact, { type: 'NEWS_ADDED' }>;
  },

  fundsDeducted(amount: number): Extract<StateImpact, { type: 'FUNDS_DEDUCTED' }> {
    return { type: 'FUNDS_DEDUCTED', payload: { amount } };
  },

  fundsChanged(amount: number): Extract<StateImpact, { type: 'FUNDS_CHANGED' }> {
    return { type: 'FUNDS_CHANGED', payload: { amount } };
  },

  rivalUpdated(
    rivalId: string,
    update: Partial<RivalStudio>
  ): Extract<StateImpact, { type: 'RIVAL_UPDATED' }> {
    return { type: 'RIVAL_UPDATED', payload: { rivalId, update } } as Extract<
      StateImpact,
      { type: 'RIVAL_UPDATED' }
    >;
  },

  franchiseUpdated(
    franchiseId: string,
    update: Partial<Franchise>
  ): Extract<StateImpact, { type: 'FRANCHISE_UPDATED' }> {
    return { type: 'FRANCHISE_UPDATED', payload: { franchiseId, update } } as Extract<
      StateImpact,
      { type: 'FRANCHISE_UPDATED' }
    >;
  },

  /**
   * Generic immutable dot-path write from the state root, e.g.
   * `industryUpdate({ 'ip.vault': nextVault })`.
   * Prefer a specific constructor when one exists — this is the escape hatch.
   */
  industryUpdate(
    update: Record<string, unknown>
  ): Extract<StateImpact, { type: 'INDUSTRY_UPDATE' }> {
    return { type: 'INDUSTRY_UPDATE', payload: { update } } as Extract<
      StateImpact,
      { type: 'INDUSTRY_UPDATE' }
    >;
  },

  modalTriggered(
    modalType: string,
    payload: unknown = {},
    priority = 10
  ): Extract<StateImpact, { type: 'MODAL_TRIGGERED' }> {
    return { type: 'MODAL_TRIGGERED', payload: { modalType, priority, payload } } as Extract<
      StateImpact,
      { type: 'MODAL_TRIGGERED' }
    >;
  },
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/engine/impacts.test.ts`
Expected: PASS (6 passed).

- [ ] **Step 5: Commit**

```bash
git add src/engine/core/impacts.ts src/test/engine/impacts.test.ts
git commit -m "feat(engine): typed impact constructors"
```

---

### Task 2: Migrate `DistressCascade.ts` to the constructors

The highest-density cast site in the engine, and the file the distressed-asset feature also touches.

**Files:**
- Modify: `src/engine/systems/industry/DistressCascade.ts`

- [ ] **Step 1: Record the baseline cast count for this file**

Run: `grep -c "as any\|as unknown as" src/engine/systems/industry/DistressCascade.ts`
Record the number (call it `BEFORE_DC`).

- [ ] **Step 2: Add the import**

```ts
import { impacts as I } from '../../core/impacts';
```

- [ ] **Step 3: Replace impact literals with constructors**

Apply these mechanical substitutions throughout the file:

```ts
// news
impacts.push({ type: 'NEWS_ADDED', payload: { headline: H, description: D, category: 'market' } });
// becomes
impacts.push(I.newsAdded({ headline: H, description: D, category: 'market' }));

// rival cash / prestige
impacts.push({ type: 'RIVAL_UPDATED', payload: { rivalId: id, update: { cash: c } } } as any);
// becomes
impacts.push(I.rivalUpdated(id, { cash: c }));

// franchise ownership transfer
impacts.push({ type: 'FRANCHISE_UPDATED', payload: { franchiseId: fid, update: { ownerId: b } } } as any);
// becomes
impacts.push(I.franchiseUpdated(fid, { ownerId: b }));

// vault / dot-path writes
impacts.push({ type: 'INDUSTRY_UPDATE', payload: { update: { 'ip.vault': v } } } as any);
// becomes
impacts.push(I.industryUpdate({ 'ip.vault': v }));

// player debit
impacts.push({ type: 'FUNDS_DEDUCTED', payload: { amount: price } } as any);
// becomes
impacts.push(I.fundsDeducted(price));

// modal
impacts.push({ type: 'MODAL_TRIGGERED', payload: { modalType: 'X', offerId } } as any);
// becomes
impacts.push(I.modalTriggered('X', { offerId }));
```

> If a call site fails to compile after substitution, that is the point of this task — the payload was wrong and the cast was hiding it. Fix the argument, don't re-add a cast.

- [ ] **Step 4: Verify the file's cast count dropped and nothing broke**

Run: `grep -c "as any\|as unknown as" src/engine/systems/industry/DistressCascade.ts`
Expected: substantially lower than `BEFORE_DC`.

Run: `npm run typecheck 2>&1 | grep "DistressCascade"`
Expected: no output.

Run: `npx vitest run src/test/engine 2>&1 | tail -5`
Expected: PASS (or only failures that pre-date this plan).

- [ ] **Step 5: Commit**

```bash
git add src/engine/systems/industry/DistressCascade.ts
git commit -m "refactor(engine): DistressCascade uses typed impact constructors"
```

---

### Task 3: Migrate `WeekCoordinator.ts`

**Files:**
- Modify: `src/engine/services/WeekCoordinator.ts`

- [ ] **Step 1: Add the import**

```ts
import { impacts as I } from '../core/impacts';
```

- [ ] **Step 2: Replace the two known cast sites**

The weekly summary modal trigger:

```ts
    context.impacts.push({ type: 'MODAL_TRIGGERED', payload: { modalType: 'SUMMARY' } });
```
becomes:
```ts
    context.impacts.push(I.modalTriggered('SUMMARY'));
```

The loan write-back in `runFinanceFilter` (currently a `SYSTEM_TICK` carrying `__studioUpdate` with a double cast):

```ts
      context.impacts.push({
        type: 'SYSTEM_TICK',
        payload: { __studioUpdate: { loans: updatedLoans } }
      } as unknown as import('@/engine/types').StateImpact);
```
becomes:
```ts
      context.impacts.push(I.industryUpdate({ 'studio.loans': updatedLoans }));
```

> This also fixes a latent oddity: `SYSTEM_TICK`'s declared payload is `{ week?, tickCount? }`, so `__studioUpdate` was never part of its type — the cast was hiding a payload the handler had to special-case. `INDUSTRY_UPDATE`'s dot-path write is the mechanism actually designed for this.

- [ ] **Step 3: Verify the loans path still works**

Run: `npx vitest run src/test/engine 2>&1 | tail -5`
Expected: PASS.

Then confirm the write reaches state — run `npm run dev`, open `http://localhost:8081/dashboard?autoStart=true`, take a loan from the Finance tab, advance a week, and confirm `weeksRemaining` decrements (loans list shrinks as they pay off) with no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/engine/services/WeekCoordinator.ts
git commit -m "refactor(engine): WeekCoordinator uses typed impact constructors"
```

---

### Task 4: Install the lint ratchet

**Files:**
- Modify: `eslint.config.js`

- [ ] **Step 1: Record the current engine cast baseline**

Run: `grep -roE "as any|as unknown as" src/engine --include="*.ts" | wc -l`
Record the number (call it `ENGINE_CASTS`). It should now be below 230.

- [ ] **Step 2: Add the engine override block**

In `eslint.config.js`, add a new config object **after** the existing `src/components/**` boundary block and **before** the `src/test/**` relaxed block:

```js
  {
    /* ENGINE TYPE DISCIPLINE: the impact boundary must stay typed.
       Build impacts via src/engine/core/impacts.ts instead of casting. */
    files: ["src/engine/**/*.ts"],
    ignores: ["src/engine/core/impacts.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
```

> It starts as `warn`, not `error`, on purpose: there are still ~200 legacy sites, and a hard error would make `npm run lint` unusable today. The warning makes every remaining site visible in the lint output so they can be burned down file-by-file. Flip it to `"error"` once the count reaches zero — that is the ratchet.

- [ ] **Step 3: Verify lint runs and reports the remaining sites**

Run: `npx eslint "src/engine/**/*.ts" 2>&1 | tail -5`
Expected: the command completes and reports warnings (not a crash). The warning count approximates the remaining migration work.

- [ ] **Step 4: Document the burn-down for the next engineer**

Append to the repo's `CONTRIBUTING.md`:

```markdown
## Engine impact typing

Impacts must be built with the constructors in `src/engine/core/impacts.ts`
(`impacts.newsAdded(...)`, `impacts.rivalUpdated(...)`, …), never as inline object
literals with `as any`. ESLint warns on `any` under `src/engine/**`; when the
warning count reaches zero, change that rule to `"error"` in `eslint.config.js`.
If you need an impact type that has no constructor yet, add one to `impacts.ts`
rather than casting at the call site.
```

- [ ] **Step 5: Commit**

```bash
git add eslint.config.js CONTRIBUTING.md
git commit -m "chore(engine): lint ratchet for impact-boundary typing"
```

---

## Self-Review Notes

- **Coverage:** typed constructors (T1), two highest-traffic files migrated as proof (T2, T3), ratchet + documented burn-down (T4).
- **Scope honesty:** the plan explicitly does not claim to remove all 230 casts; it makes the remaining ones *visible and mechanical*. The `warn`→`error` flip is the stated finish line.
- **Type consistency:** `impacts.*` names, argument order (`rivalUpdated(id, update)`, `franchiseUpdated(id, update)`, `industryUpdate(record)`, `modalTriggered(type, payload, priority)`) are identical across Tasks 1–3.
- **Interaction with other plans:** the distressed-asset plan writes `INDUSTRY_UPDATE` dot-path impacts and the sim-memory plan writes `'simMemory.*'` — both should use `I.industryUpdate({...})` once this lands. If those plans ship first, Task 2's substitutions cover their call sites too.
- **Cast-inside-constructors caveat:** the constructors themselves still use one `as Extract<...>` per function. That is deliberate — it confines the unavoidable union-narrowing cast to a single reviewed, test-covered file instead of 230 call sites.
