# Runtime Crash Sweep — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every screen in the app render without crashing by fixing the class of runtime errors (missing imports, missing store selectors) that currently white-screen multiple tabs, and add a regression gate so they can't come back.

**Architecture:** Three fix categories — (1) missing icon/chart imports that throw `ReferenceError` at render, (2) three store selectors that `chartSelectors.ts` imports but `selectors.ts` no longer exports (crashes every visualization screen), (3) a Playwright smoke test that visits every dashboard tab and fails if React's error boundary appears. A `typecheck` npm script makes the first two categories discoverable in CI.

**Tech Stack:** TypeScript, React 18, Vite (dev server on port 8081), Zustand, Recharts, lucide-react, Vitest (unit), Playwright (e2e, `baseURL: http://localhost:8081`).

> **Cross-plan note:** `src/components/hubs/hq/MarketingWarRoom.tsx` (Task 2) is slated for deletion in the *Delete Zombie UI* plan. Fixing its import here is still correct and harmless; if the zombie-UI plan lands first, skip the MarketingWarRoom step in Task 2.

---

## File Structure

| File | Responsibility | Change |
|------|---------------|--------|
| `src/components/finance/PiracyImpactMonitor.tsx` | Piracy widget | Add `Globe` import |
| `src/components/finance/RecoupmentTracker.tsx` | Recoupment widget | Add `CheckCircle2`, `Clock` imports |
| `src/components/hubs/hq/MarketingWarRoom.tsx` | Marketing panel | Add `Users` import |
| `src/components/talent/tabs/StatsTab.tsx` | Talent stats charts | Add Recharts imports |
| `src/store/selectors.ts` | Derived-state selectors | Restore 3 missing exports |
| `package.json` | Scripts | Add `typecheck` script |
| `e2e/all_tabs_render.spec.ts` | E2E smoke test | Create — visits every tab |

---

### Task 1: Add a `typecheck` script (the discovery tool)

**Files:**
- Modify: `package.json` (scripts block)

- [ ] **Step 1: Add the script**

In `package.json`, inside `"scripts"`, add a `typecheck` entry alongside the existing `lint`:

```json
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.app.json --noEmit",
    "preview": "vite preview",
```

- [ ] **Step 2: Run it to capture the baseline crash set**

Run: `npm run typecheck 2>&1 | grep "error TS2304: Cannot find name" | grep -vE "test/|mockFactories"`

Expected: a short list of `Cannot find name 'X'` errors in `PiracyImpactMonitor.tsx`, `RecoupmentTracker.tsx`, `MarketingWarRoom.tsx`, and `StatsTab.tsx`. These are the render-time crashes Tasks 2–3 fix.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add typecheck npm script"
```

---

### Task 2: Fix missing `lucide-react` icon imports

These icons are referenced in JSX but never imported, so the component throws `ReferenceError: X is not defined` the moment it renders.

**Files:**
- Modify: `src/components/finance/PiracyImpactMonitor.tsx:3`
- Modify: `src/components/finance/RecoupmentTracker.tsx:3`
- Modify: `src/components/hubs/hq/MarketingWarRoom.tsx:12`

- [ ] **Step 1: Fix PiracyImpactMonitor**

Replace line 3:

```tsx
import { AlertTriangle, Download, Lock } from 'lucide-react';
```

with:

```tsx
import { AlertTriangle, Download, Lock, Globe } from 'lucide-react';
```

- [ ] **Step 2: Fix RecoupmentTracker**

Replace line 3:

```tsx
import { AlertCircle } from 'lucide-react';
```

with:

```tsx
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
```

- [ ] **Step 3: Fix MarketingWarRoom**

Replace line 12:

```tsx
import { Target, TrendingUp, Sparkles, DollarSign, X } from "lucide-react";
```

with:

```tsx
import { Target, TrendingUp, Sparkles, DollarSign, X, Users } from "lucide-react";
```

- [ ] **Step 4: Verify these three no longer report missing names**

Run: `npm run typecheck 2>&1 | grep -E "PiracyImpactMonitor|RecoupmentTracker|MarketingWarRoom" | grep "Cannot find name"`
Expected: no output (empty).

- [ ] **Step 5: Commit**

```bash
git add src/components/finance/PiracyImpactMonitor.tsx src/components/finance/RecoupmentTracker.tsx src/components/hubs/hq/MarketingWarRoom.tsx
git commit -m "fix: add missing lucide-react icon imports that crashed finance/marketing screens"
```

---

### Task 3: Fix missing Recharts imports in StatsTab

`StatsTab.tsx` renders a bar chart but only imports `CartesianGrid, Cell` from recharts; `Bar`, `BarChart`, `XAxis`, `YAxis`, and `ResponsiveContainer` are used but never imported.

**Files:**
- Modify: `src/components/talent/tabs/StatsTab.tsx:5`

- [ ] **Step 1: Fix the recharts import**

Replace line 5:

```tsx
import { CartesianGrid, Cell } from "recharts";
```

with:

```tsx
import { CartesianGrid, Cell, Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
```

- [ ] **Step 2: Verify no missing names remain in StatsTab**

Run: `npm run typecheck 2>&1 | grep "StatsTab" | grep "Cannot find name"`
Expected: no output (empty).

- [ ] **Step 3: Verify the whole `Cannot find name` crash class is cleared**

Run: `npm run typecheck 2>&1 | grep "error TS2304: Cannot find name" | grep -vE "test/|mockFactories|GameState|NarrativeDomainKey|NarrativeContext|ArchetypeKey|archetype"`
Expected: no output. (The excluded names are non-render type-only errors handled outside this plan.)

- [ ] **Step 4: Commit**

```bash
git add src/components/talent/tabs/StatsTab.tsx
git commit -m "fix: add missing recharts imports that crashed talent StatsTab"
```

---

### Task 4: Restore the three missing store selectors

`src/store/chartSelectors.ts` imports `selectLatestSnapshot`, `selectRecoupmentMap`, and `selectMarketMetrics` from `./selectors`, but `selectors.ts` no longer exports them. This is an ES-module error that crashes **every** component importing `chartSelectors` (all `src/components/hubs/visualizations/*`). Restore them, adapted to the current types.

**Type facts (already verified):**
- `state.finance.weeklyHistory: FinancialSnapshot[]` where `FinancialSnapshot` has `{ week, revenue: {theatrical, streaming, merch, passive}, expenses: {...}, net, cash }`.
- `state.finance.marketState: MarketState` has `{ baseRate, savingsYield, debtRate, loanRate, rateHistory }` — note: **no `sentiment` or `cycle` field** (they were removed in a refactor).
- `selectMarketMetrics`'s only consumer is `chartSelectors.ts:582`: `50 + (marketMetrics.sentiment || 0) / 2`. Returning `sentiment: 0` is a correct, neutral default that un-crashes it.
- `selectRecoupmentMap` is **imported but never called** in `chartSelectors.ts`; a minimal correct implementation satisfies the import.

**Files:**
- Modify: `src/store/selectors.ts` (add 3 exports near the existing `selectFinance` / `selectRecoupmentStatus`)
- Test: `src/test/store/restored-selectors.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `src/test/store/restored-selectors.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  selectLatestSnapshot,
  selectRecoupmentMap,
  selectMarketMetrics,
} from '@/store/selectors';
import type { GameState } from '@/engine/types';

// Minimal GameState shape exercised by these three selectors.
function makeState(over: Partial<any> = {}): GameState {
  return {
    finance: {
      cash: 1000,
      weeklyHistory: [
        { week: 1, revenue: { theatrical: 10, streaming: 5, merch: 2, passive: 1 }, expenses: { production: 3, burn: 1, marketing: 1, royalties: 0, interest: 0 }, net: 13, cash: 1000 },
      ],
      marketState: { baseRate: 0.04, savingsYield: 0.03, debtRate: 0.06, loanRate: 0.08, rateHistory: [] },
      ledger: [],
    },
    entities: { projects: {} },
    ...over,
  } as unknown as GameState;
}

describe('restored selectors', () => {
  it('selectLatestSnapshot returns the last weekly snapshot', () => {
    expect(selectLatestSnapshot(makeState())?.week).toBe(1);
  });

  it('selectLatestSnapshot returns null when no history', () => {
    const s = makeState({ finance: { weeklyHistory: [], marketState: {}, cash: 0, ledger: [] } });
    expect(selectLatestSnapshot(s)).toBeNull();
  });

  it('selectMarketMetrics exposes a numeric sentiment and the real rate fields', () => {
    const m = selectMarketMetrics(makeState());
    expect(typeof m.sentiment).toBe('number');
    expect(m.debtRate).toBe(0.06);
    expect(m.savingsRate).toBe(0.03);
  });

  it('selectRecoupmentMap returns a record keyed by released project id', () => {
    const s = makeState({
      entities: { projects: { p1: { id: 'p1', state: 'released', revenue: 200, accumulatedCost: 100 } } },
    });
    const map = selectRecoupmentMap(s);
    expect(map.p1).toBeCloseTo(200, 0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/store/restored-selectors.test.ts`
Expected: FAIL — import error / "does not provide an export named 'selectLatestSnapshot'".

- [ ] **Step 3: Add the three selectors to `selectors.ts`**

In `src/store/selectors.ts`, immediately after the existing `selectRecoupmentStatus` selector (around line 140), add:

```ts
/**
 * The most recent weekly financial snapshot, or null if none recorded yet.
 * Consumed by chartSelectors.selectRevenueBreakdown.
 */
export const selectLatestSnapshot = (state: GameState | null) => {
  const history = state?.finance?.weeklyHistory ?? [];
  return history.length > 0 ? history[history.length - 1] : null;
};

/**
 * Map of released-project id -> recoup percentage (revenue / cost * 100).
 * The pre-refactor snapshot.projectRecoupment field no longer exists, so this
 * is derived directly from current project state.
 */
export const selectRecoupmentMap = (state: GameState | null): Record<string, number> => {
  const projects = Object.values(state?.entities?.projects ?? {});
  const map: Record<string, number> = {};
  for (const p of projects) {
    if (p.state === 'released' && (p.accumulatedCost ?? 0) > 0) {
      map[p.id] = ((p.revenue ?? 0) / p.accumulatedCost) * 100;
    }
  }
  return map;
};

/**
 * Macro market metrics for studio-health scoring. MarketState no longer carries
 * a sentiment/cycle signal, so sentiment defaults to 0 (neutral) until a real
 * sentiment source is wired; debtRate/savingsRate are the live values.
 */
export const selectMarketMetrics = (state: GameState | null) => {
  const m = state?.finance?.marketState;
  return {
    sentiment: 0,
    debtRate: m?.debtRate ?? 0,
    savingsRate: m?.savingsYield ?? 0,
  };
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/store/restored-selectors.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Verify the missing-export crash is gone**

Run: `npm run typecheck 2>&1 | grep -E "selectLatestSnapshot|selectMarketMetrics|selectRecoupmentMap"`
Expected: no output (empty).

- [ ] **Step 6: Commit**

```bash
git add src/store/selectors.ts src/test/store/restored-selectors.test.ts
git commit -m "fix: restore selectLatestSnapshot/selectRecoupmentMap/selectMarketMetrics exports"
```

---

### Task 5: E2E smoke test — every tab renders without the error boundary

The app's `CatchBoundaryImpl` renders **"Something went wrong!"** when a tab throws. This test visits each tab and fails if that text appears, locking in the fixes from Tasks 2–4.

**Files:**
- Create: `e2e/all_tabs_render.spec.ts`

**Reference facts:**
- Dev server runs on `http://localhost:8081` (Playwright `webServer` is already configured in `playwright.config.ts`).
- `http://localhost:8081/dashboard?autoStart=true` boots a game with no setup.
- The sidebar nav buttons carry `aria-label` equal to their label (see `src/components/layout/StudioSidebar.tsx` `NAV_ITEMS`): `COMMAND CENTER`, `PRODUCTION PIPELINE`, `THE TRADES`, `TALENT HUB`, `DISTRIBUTION HUB`, `IP VAULT`, `INDUSTRY INTELLIGENCE`, `FINANCE COMMAND`, `WATCHLIST`.

- [ ] **Step 1: Write the test**

Create `e2e/all_tabs_render.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const TABS = [
  'COMMAND CENTER',
  'PRODUCTION PIPELINE',
  'THE TRADES',
  'TALENT HUB',
  'DISTRIBUTION HUB',
  'IP VAULT',
  'INDUSTRY INTELLIGENCE',
  'FINANCE COMMAND',
  'WATCHLIST',
];

test('every dashboard tab renders without the error boundary', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/dashboard?autoStart=true');
  // Wait for the game shell to mount.
  await expect(page.getByRole('button', { name: 'COMMAND CENTER' })).toBeVisible({ timeout: 15000 });

  for (const tab of TABS) {
    await page.getByRole('button', { name: tab }).click();
    // The CatchBoundary renders this exact text when a tab throws.
    await expect(page.getByText('Something went wrong!')).toHaveCount(0);
    // Give lazy chunks a beat to mount and potentially throw.
    await page.waitForTimeout(400);
    await expect(page.getByText('Something went wrong!')).toHaveCount(0);
  }

  expect(errors, `Uncaught page errors:\n${errors.join('\n')}`).toEqual([]);
});
```

- [ ] **Step 2: Run the test**

Run: `npx playwright test e2e/all_tabs_render.spec.ts`
Expected: PASS. If any tab still throws (e.g. an unimported icon in a screen not covered above), the test names the failing tab and the uncaught error — fix that import the same way as Task 2 and re-run.

- [ ] **Step 3: Commit**

```bash
git add e2e/all_tabs_render.spec.ts
git commit -m "test(e2e): assert every dashboard tab renders without the error boundary"
```

---

## Self-Review Notes

- **Spec coverage:** Missing icons (Tasks 2–3), missing selectors (Task 4), regression gate (Tasks 1 & 5). All four crashing files from the measured `Cannot find name` set are covered, plus the visualization-wide selector crash.
- **Known out of scope:** The other ~1,400 `tsc` errors are type-noise, not render crashes; the broader green-build effort is a separate plan. The `GameState`/`ArchetypeKey`/`NarrativeContext` missing-name errors are type-only (engine), not render crashes, and are explicitly excluded in Task 3 Step 3.
- **Ordering vs zombie-UI plan:** If the *Delete Zombie UI* plan runs first, `MarketingWarRoom.tsx` and the `hubs/visualizations/*` consumers of `selectMarketMetrics` may be gone; the selector restoration (Task 4) is still required by any remaining consumer and is safe regardless.
