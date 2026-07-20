# Awards Season Screen (F2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give awards season a real playable surface — a reachable Awards tab showing the eligible slate, live win odds, and three-tier FYC campaign spend — by repairing and wiring up the `AwardsHQ` screen that already exists but is dead code.

**Architecture:** `AwardsHQ.tsx` is fully written but unreachable and broken: it imports `selectAwardsEligibleProjects`, which does not exist, and reads `studio.activeCampaigns` through an untyped `Record<string, unknown>`. This plan adds the missing selector, types the campaign record properly, adds an `awards` tab to the UI store / dashboard / sidebar, and surfaces per-project odds from the existing `selectAwardsProbability`. No new engine systems — the ceremony runner, Razzie processor, campaign tiers and backlash roll all already run each week.

**Tech Stack:** TypeScript, Zustand, React, Vitest.

**Why this matters:** The awards subsystem is one of the most complete in the engine — `runAwardsCeremony` executes weekly against an internal calendar, `processRazzies` runs annually, `CAMPAIGN_TIERS` defines Grassroots/Trade/Blitz spend with buzz and scandal-risk tradeoffs, and `checkCampaignBacklash` punishes over-campaigning a weak film. The player's only touchpoint is a button buried inside `ProjectDetailModal`. Prestige already has mechanical teeth (talent rates, deal leverage), so this converts finished systems into the prestige-strategy player's loop for very little new code.

**Verified facts (do not re-derive):**
- `src/components/awards/AwardsHQ.tsx` exists (~140 lines), renders the header, eligible-project list and campaign-tier buttons, and is **imported by nothing** (`grep -rln "AwardsHQ" src --include="*.tsx"` matches only itself).
- It imports `selectAwardsEligibleProjects` from `@/store/selectors` — that export **does not exist** (`tsc` error TS2305).
- `studio.activeCampaigns?: Record<string, unknown>` exists at `src/engine/types/studio.types.ts:139`; `AwardsHQ` reads `.activeCampaigns[project.id]` and fails to typecheck because the value is `unknown` (errors at `AwardsHQ.tsx:53,78`).
- `CampaignData` is defined at `src/engine/types/state.types.ts:217` as `{ id, projectId, budget, targetCategories, buzzBonus, scandalRisk }`.
- `CAMPAIGN_TIERS` is exported from `src/store/slices/marketingSlice.ts:16`; `launchAwardsCampaign(projectId, tierKey: "Grassroots" | "Trade" | "Blitz")` is at `:49`, deducts `tier.cost`, writes `studio.activeCampaigns[projectId]`, and rolls `checkCampaignBacklash`.
- `selectAwardsProbability` exists at `src/store/selectors.ts:335`; it maps projects with an `awardsProfile` to `{ projectTitle, probability }` — **keyed by title, not id**.
- Tabs: `TabId` union in `src/store/uiStore.ts:30`; `TAB_CONTENT` map in `src/pages/Dashboard.tsx:31`; sidebar entries in `NAV_ITEMS` in `src/components/layout/StudioSidebar.tsx:33`.
- Engine: `runAwardsCeremony(state, week, year, rng)` (`awards/CeremonyRunner.ts:8`) and `processRazzies(...)` (`awards/RazzieProcessor.ts:5`) are already wired into `WeekCoordinator.runProductionFilter`.

---

## File Structure

| File | Responsibility | Change |
|------|---------------|--------|
| `src/engine/types/studio.types.ts` | `studio.activeCampaigns` typing | Type as `Record<string, CampaignData>` |
| `src/store/selectors.ts` | Awards selectors | Add `selectAwardsEligibleProjects`, `selectAwardsOddsById` |
| `src/store/uiStore.ts` | Tab ids | Add `'awards'` |
| `src/pages/Dashboard.tsx` | Tab routing | Map `awards` → `AwardsHQ` |
| `src/components/layout/StudioSidebar.tsx` | Navigation | Add the Awards nav item |
| `src/components/awards/AwardsHQ.tsx` | The screen | Repair odds display + campaign state |

---

### Task 1: Type `activeCampaigns` properly

**Files:**
- Modify: `src/engine/types/studio.types.ts:139`

- [ ] **Step 1: Replace the untyped record**

Change line 139 from:

```ts
    activeCampaigns?: Record<string, unknown>;
```

to:

```ts
    activeCampaigns?: Record<string, import("./state.types").CampaignData>;
```

- [ ] **Step 2: See what the real type surfaces**

Run: `npm run typecheck 2>&1 | grep -iE "activeCampaigns|AwardsHQ|marketingSlice"`
Expected: the two `AwardsHQ.tsx` errors about `activeCampaigns` change shape or disappear. If `marketingSlice.ts:49` now errors because the object it writes is missing a `CampaignData` field, fix the object literal there — it already builds `{ id, projectId, budget, targetCategories, buzzBonus, scandalRisk }`, which matches, so this should be clean.

- [ ] **Step 3: Commit**

```bash
git add src/engine/types/studio.types.ts
git commit -m "fix(types): type studio.activeCampaigns as Record<string, CampaignData>"
```

---

### Task 2: Add the missing awards selectors

**Files:**
- Modify: `src/store/selectors.ts`
- Test: `src/test/store/awards-selectors.test.ts`

**Eligibility rule:** a project is awards-eligible when it has been released (`state === 'released'` or `'post_release'`) and carries an `awardsProfile`. Unreleased films can't be nominated, and a project with no awards profile has no academy signal to campaign on.

- [ ] **Step 1: Write the failing test**

Create `src/test/store/awards-selectors.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { selectAwardsEligibleProjects, selectAwardsOddsById } from '@/store/selectors';
import type { GameState } from '@/engine/types';

function makeState(): GameState {
  return {
    entities: {
      projects: {
        p1: { id: 'p1', title: 'Contender', state: 'released', awardsProfile: { criticScore: 80, academyAppeal: 70 }, reception: { metaScore: 85 } },
        p2: { id: 'p2', title: 'In Production', state: 'production', awardsProfile: { criticScore: 90, academyAppeal: 90 } },
        p3: { id: 'p3', title: 'No Profile', state: 'released' },
        p4: { id: 'p4', title: 'Late Run', state: 'post_release', awardsProfile: { criticScore: 60, academyAppeal: 50 } },
      },
    },
  } as unknown as GameState;
}

describe('awards selectors', () => {
  it('selectAwardsEligibleProjects returns released projects that have an awardsProfile', () => {
    const ids = selectAwardsEligibleProjects(makeState()).map((p) => p.id).sort();
    expect(ids).toEqual(['p1', 'p4']);
  });

  it('excludes unreleased projects even with a strong profile', () => {
    expect(selectAwardsEligibleProjects(makeState()).some((p) => p.id === 'p2')).toBe(false);
  });

  it('selectAwardsOddsById maps project id to a 0-100 probability', () => {
    const odds = selectAwardsOddsById(makeState());
    expect(odds.p1).toBeGreaterThan(0);
    expect(odds.p1).toBeLessThanOrEqual(100);
    expect(odds.p3).toBeUndefined(); // no awardsProfile
  });

  it('returns an empty list for a null state', () => {
    expect(selectAwardsEligibleProjects(null)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/store/awards-selectors.test.ts`
Expected: FAIL — "does not provide an export named 'selectAwardsEligibleProjects'".

- [ ] **Step 3: Add the selectors**

In `src/store/selectors.ts`, add near the existing `selectAwardsProbability` (around line 335):

```ts
/**
 * Projects that can actually campaign: released (or in their post-release window)
 * AND carrying an awardsProfile. Unreleased films can't be nominated, and a
 * project with no profile has no academy signal to spend against.
 */
export const selectAwardsEligibleProjects = createSelector([selectProjects], (projects) =>
  projects.filter(
    (p) => (p.state === 'released' || p.state === 'post_release') && !!p.awardsProfile
  )
);

/**
 * Win odds keyed by project id. selectAwardsProbability keys by title, which
 * breaks when two projects share a name — the screen needs id-keyed lookup.
 */
export const selectAwardsOddsById = createSelector([selectProjects], (projects) => {
  const odds: Record<string, number> = {};
  for (const p of projects) {
    const ap = p.awardsProfile;
    if (!ap) continue;
    odds[p.id] = Math.min(100, Math.round((ap.criticScore + ap.academyAppeal) / 2 + 5));
  }
  return odds;
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/store/awards-selectors.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Confirm the AwardsHQ import error is gone**

Run: `npm run typecheck 2>&1 | grep "selectAwardsEligibleProjects"`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/store/selectors.ts src/test/store/awards-selectors.test.ts
git commit -m "feat(store): add awards eligibility and id-keyed odds selectors"
```

---

### Task 3: Make the Awards tab reachable

**Files:**
- Modify: `src/store/uiStore.ts:30`
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/components/layout/StudioSidebar.tsx`

- [ ] **Step 1: Add the tab id**

In `src/store/uiStore.ts`, extend the `TabId` union:

```ts
export type TabId = 'command' | 'pipeline' | 'ip' | 'distribution' | 'talent' | 'finance' | 'trades' | 'industry' | 'awards' | 'bookmarks';
```

- [ ] **Step 2: Route the tab in `Dashboard.tsx`**

Add the import with the other tab components:

```tsx
import { AwardsHQ } from '@/components/awards/AwardsHQ';
```

and add the entry to the `TAB_CONTENT` map:

```tsx
  awards: <AwardsHQ key="awards" />,
```

- [ ] **Step 3: Add the sidebar nav item**

In `src/components/layout/StudioSidebar.tsx`, add `Trophy` to the `lucide-react` import list, then add this entry to `NAV_ITEMS` (place it after the `industry` entry):

```tsx
  {
    id: "awards",
    label: "AWARDS SEASON",
    icon: Trophy,
    tooltip: "ELIGIBLE SLATE FYC CAMPAIGNS AND WIN ODDS",
  },
```

> Note the label and tooltip use spaces, not underscores — required by `docs/UI_UX_Design_Bible.md` §4.3 / §16.2.

- [ ] **Step 4: Verify it renders**

Run: `npm run typecheck 2>&1 | grep -iE "AwardsHQ|uiStore|Dashboard|StudioSidebar"`
Expected: no output.

Run `npm run dev`, open `http://localhost:8081/dashboard?autoStart=true`, click **AWARDS SEASON** in the sidebar. The screen should render without the error boundary (it will be empty early in a run — no released films yet).

- [ ] **Step 5: Commit**

```bash
git add src/store/uiStore.ts src/pages/Dashboard.tsx src/components/layout/StudioSidebar.tsx
git commit -m "feat(ui): reachable Awards Season tab"
```

---

### Task 4: Surface odds and campaign state on the screen

**Files:**
- Modify: `src/components/awards/AwardsHQ.tsx`

- [ ] **Step 1: Wire the new selectors in**

At the top of `AwardsHQ.tsx`, add `selectAwardsOddsById` to the selectors import:

```tsx
import { selectAwardsEligibleProjects, selectAwardsOddsById } from "@/store/selectors";
```

and inside the component, after `eligibleProjects`, add:

```tsx
  const oddsById = useMemo(() => selectAwardsOddsById(gameState), [gameState]);
  const activeCampaigns = gameState?.studio.activeCampaigns ?? {};
```

- [ ] **Step 2: Render odds and campaign status per project**

In the eligible-project row, render the odds and either the active campaign or the tier buttons. Use this block as the row's right-hand side:

```tsx
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground not-italic">
                    Win Odds
                  </div>
                  <div className="font-display text-2xl font-bold not-italic tabular-nums">
                    {oddsById[project.id] ?? 0}%
                  </div>
                </div>

                {activeCampaigns[project.id] ? (
                  <div className="border border-primary/30 bg-primary/5 px-4 py-2 text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary not-italic">
                      Campaign Active
                    </div>
                    <div className="text-xs tabular-nums text-muted-foreground">
                      {formatMoney(activeCampaigns[project.id].budget)} · +{activeCampaigns[project.id].buzzBonus} buzz
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {(["Grassroots", "Trade", "Blitz"] as const).map((tierKey) => {
                      const tier = CAMPAIGN_TIERS[tierKey];
                      const affordable = (gameState?.finance.cash ?? 0) >= tier.cost;
                      return (
                        <Button
                          key={tierKey}
                          size="sm"
                          variant="outline"
                          disabled={!affordable}
                          onClick={() => launchAwardsCampaign(project.id, tierKey)}
                          title={`${formatMoney(tier.cost)} · +${tier.buzz} buzz · ${Math.round(tier.risk * 100)}% backlash risk`}
                        >
                          {tierKey}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
```

- [ ] **Step 3: Add an honest empty state**

Where the list renders, guard it so an empty slate explains itself rather than showing a blank panel (required by Design Bible §16.5):

```tsx
          {eligibleProjects.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.015] py-16 text-center text-sm text-muted-foreground/50">
              No awards-eligible films yet. Release a film with an awards profile to start campaigning.
            </div>
          ) : (
            eligibleProjects.map((project) => (
              /* existing row markup, with the block from Step 2 as its right-hand side */
            ))
          )}
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck 2>&1 | grep "AwardsHQ"`
Expected: no output.

Run: `npx eslint "src/components/awards/AwardsHQ.tsx"`
Expected: exit 0.

- [ ] **Step 5: Manual smoke**

Run `npm run dev` and open `http://localhost:8081/dashboard?autoStart=true`. Advance weeks until at least one film is released (~week 30–40 with a default slate), then open **AWARDS SEASON**: the film should appear with a win-odds percentage and three campaign buttons. Click **Grassroots** — cash should drop by the tier cost and the row should switch to "Campaign Active". Keep advancing to a ceremony week and confirm an awards result appears in the news feed.

- [ ] **Step 6: Commit**

```bash
git add src/components/awards/AwardsHQ.tsx
git commit -m "feat(awards): odds, campaign state and honest empty state on Awards Season"
```

---

## Self-Review Notes

- **Coverage:** campaign typing (T1), missing selectors (T2), reachable tab (T3), odds + campaign state + empty state (T4).
- **Type consistency:** `selectAwardsEligibleProjects(state) → Project[]` and `selectAwardsOddsById(state) → Record<string, number>` are used with the same shapes in T2 and T4; `launchAwardsCampaign(projectId, tierKey)` matches the existing `marketingSlice` signature exactly; `CampaignData` fields used in T4 (`budget`, `buzzBonus`) match the type from T1.
- **Why a new odds selector:** `selectAwardsProbability` keys by `projectTitle`, which collides when two projects share a title and can't be looked up from a row that only has an id. `selectAwardsOddsById` is added alongside rather than replacing it, so existing consumers keep working.
- **No engine changes:** the ceremony runner, Razzie processor and backlash roll are already wired into `WeekCoordinator`. This plan is purely the missing player surface.
- **Follow-up worth noting (out of scope):** `launchAwardsCampaign` hardcodes `targetCategories: ["Best Picture"]`. Letting the player choose categories is the natural next iteration once this screen is in players' hands.
