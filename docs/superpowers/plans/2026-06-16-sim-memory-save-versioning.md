# Sim Memory & Save Versioning (T1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move simulation pacing/history state that currently lives in module-scope variables into `GameState` (so save→reload no longer silently resets it), and add a versioned save-migration layer so future state-shape changes can't corrupt old saves.

**Architecture:** A new `SimMemory` object on `GameState` holds the memory the engine systems currently keep in module variables (`Antitrust.lastActionWeek`, `DistressCascade`'s three records, `FlopMechanics.flopHistory`). Systems read it via a `getSimMemory(state)` helper and write updates back through the existing `INDUSTRY_UPDATE` dot-path impact (the same mechanism used for `ip.vault` and `industry.distressedOffers`). A `saveVersion` field plus a `migrateSave()` step in `loadGame` upgrades older saves (missing `simMemory`) on load.

**Tech Stack:** TypeScript, Zod (save schema), Vitest, the engine's `StateImpact`/`applyImpacts` pipeline.

**Why this matters:** These module variables are *simulation state* — cooldowns, streaks, flop history. Because they live outside `GameState`, every save→reload resets them: an antitrust cooldown vanishes, a rival's 26-week negative-cash streak restarts, flop memory is wiped. The sim behaves differently after every reload, which breaks determinism and makes bugs unreproducible from a save file.

**Verified facts (do not re-derive):**
- `src/engine/systems/industry/Antitrust.ts:38` — `let lastActionWeek = -9999;` read at `:102` (`if (week - lastActionWeek < ACTION_COOLDOWN_WEEKS) return impacts;`), written at `:106`. `resetAntitrustState()` at `:40` also clears two module arrays (`antitrustEventLog`, `antitrustBlockList`).
- `src/engine/systems/industry/DistressCascade.ts:46-52` — `negativeStreak`, `lastActionWeek`, `stageActionCount` module records; `resetDistressState()` at `:64`.
- `src/engine/systems/finance/FlopMechanics.ts:103` — `const flopHistory: Map<string, StudioFlopHistory>`; read in `shouldRestructureStudio(rivalId, currentWeek)` (`:105`), written in `applyFlopPenalties(state, project, ownerId)` (`:137-140`). `StudioFlopHistory` interface is defined at `:96-101`.
- `INDUSTRY_UPDATE` impacts apply `payload.update` as immutable **dot-path sets from the state root** (`industryHandlers.handleIndustryUpdate`), e.g. `{ update: { 'simMemory.distress': value } }` works.
- Save path: `src/persistence/saveLoad.ts` `loadGame(slot)` returns `state as GameState` with no migration; `src/persistence/saveSchema.ts` has a Zod `SAVE_SCHEMA` (passthrough) with **no version field**; `src/engine/migrations/` directory exists and is **empty**.
- Initial state is constructed in `src/engine/core/gameInit.ts`.

**Out of scope (documented follow-up, not forgotten):** `antitrustEventLog` and `antitrustBlockList` (Antitrust.ts:36-37) are also module-scope, and `antitrustBlockList` is *functional* (ConsolidationEngine reads it to refuse M&A bids during a freeze — the freeze also evaporates on reload). Moving them requires refactoring ConsolidationEngine's direct import, which deserves its own pass. This plan moves `lastActionWeek` only and leaves the arrays with a `// FOLLOW-UP:` comment pointing at this plan.

---

## File Structure

| File | Responsibility | Change |
|------|---------------|--------|
| `src/engine/types/state.types.ts` | State types | Add `SimMemory`, move `StudioFlopHistory` here |
| `src/engine/types/studio.types.ts` | `GameState` | Add `simMemory?`, `saveVersion?` fields |
| `src/engine/core/simMemory.ts` | Defaults + accessor | Create |
| `src/engine/migrations/index.ts` | Versioned save migrations | Create |
| `src/persistence/saveLoad.ts` | Load path | Run `migrateSave` on load |
| `src/persistence/saveSchema.ts` | Save validation | Allow `saveVersion` |
| `src/engine/core/gameInit.ts` | New-game state | Initialize the two new fields |
| `src/engine/systems/industry/Antitrust.ts` | Antitrust cooldown | Read/write via simMemory |
| `src/engine/systems/industry/DistressCascade.ts` | Distress pacing | Read/write via simMemory |
| `src/engine/systems/finance/FlopMechanics.ts` | Flop history | Read/write via simMemory |

---

### Task 1: `SimMemory` type, defaults, and accessor

**Files:**
- Modify: `src/engine/types/state.types.ts`
- Modify: `src/engine/types/studio.types.ts` (the `GameState` interface)
- Create: `src/engine/core/simMemory.ts`
- Test: `src/test/engine/simMemory.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/engine/simMemory.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { defaultSimMemory, getSimMemory, CURRENT_SAVE_VERSION } from '@/engine/core/simMemory';
import type { GameState } from '@/engine/types';

describe('simMemory', () => {
  it('defaultSimMemory returns a complete, empty memory', () => {
    const m = defaultSimMemory();
    expect(m.antitrust.lastActionWeek).toBe(-9999);
    expect(m.distress.negativeStreak).toEqual({});
    expect(m.distress.lastActionWeek).toEqual({});
    expect(m.distress.stageActionCount).toEqual({});
    expect(m.flops).toEqual({});
  });

  it('getSimMemory falls back to defaults when state has none (old save)', () => {
    const state = {} as GameState;
    expect(getSimMemory(state).antitrust.lastActionWeek).toBe(-9999);
  });

  it('getSimMemory returns the state-carried memory when present', () => {
    const state = {
      simMemory: { ...defaultSimMemory(), antitrust: { lastActionWeek: 42 } },
    } as unknown as GameState;
    expect(getSimMemory(state).antitrust.lastActionWeek).toBe(42);
  });

  it('exposes a numeric save version >= 2', () => {
    expect(CURRENT_SAVE_VERSION).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/engine/simMemory.test.ts`
Expected: FAIL — module `@/engine/core/simMemory` not found.

- [ ] **Step 3: Add the types**

In `src/engine/types/state.types.ts`, add near the other state interfaces (e.g. below `FinanceState`):

```ts
/** Per-rival flop history (moved here from FlopMechanics so state types don't import systems). */
export interface StudioFlopHistory {
  rivalId: string;
  majorFlops: number;
  catastrophicFlops: number;
  flopWeeks: number[];
}

/**
 * Simulation memory that must survive save/load. Previously module-scope
 * variables in Antitrust / DistressCascade / FlopMechanics, which silently
 * reset on reload and broke determinism.
 */
export interface SimMemory {
  antitrust: { lastActionWeek: number };
  distress: {
    negativeStreak: Record<string, number>;
    lastActionWeek: Record<string, number>;
    stageActionCount: Record<string, { s1: number; s2: number; s3: number }>;
  };
  flops: Record<string, StudioFlopHistory>;
}
```

In `src/engine/types/studio.types.ts`, inside the `GameState` interface (alongside `week`, `gameSeed`, `tickCount` — the top-level scalars), add:

```ts
  /** Save-format version; bumped by src/engine/migrations. Absent = v1. */
  saveVersion?: number;
  /** Engine pacing/history memory — see SimMemory in state.types.ts. */
  simMemory?: import('./state.types').SimMemory;
```

- [ ] **Step 4: Create the accessor**

Create `src/engine/core/simMemory.ts`:

```ts
import type { GameState } from '../types';
import type { SimMemory } from '../types/state.types';

/** Bump when a migration is added in src/engine/migrations. v1 = pre-versioning saves. */
export const CURRENT_SAVE_VERSION = 2;

export function defaultSimMemory(): SimMemory {
  return {
    antitrust: { lastActionWeek: -9999 },
    distress: { negativeStreak: {}, lastActionWeek: {}, stageActionCount: {} },
    flops: {},
  };
}

/** Always returns a complete SimMemory — old saves without one get defaults. */
export function getSimMemory(state: GameState): SimMemory {
  return state.simMemory ?? defaultSimMemory();
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/engine/simMemory.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 6: Keep FlopMechanics compiling — re-export the moved type**

In `src/engine/systems/finance/FlopMechanics.ts`, delete the local `StudioFlopHistory` interface (lines ~96-101) and add at the top:

```ts
import type { StudioFlopHistory } from '../../types/state.types';
export type { StudioFlopHistory };
```

Run: `npm run typecheck 2>&1 | grep -i "StudioFlopHistory"`
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add src/engine/types/state.types.ts src/engine/types/studio.types.ts src/engine/core/simMemory.ts src/engine/systems/finance/FlopMechanics.ts src/test/engine/simMemory.test.ts
git commit -m "feat(engine): add SimMemory state type and accessor"
```

---

### Task 2: Versioned save migrations, wired into load and new-game

**Files:**
- Create: `src/engine/migrations/index.ts`
- Modify: `src/persistence/saveLoad.ts:20-31` (`loadGame`)
- Modify: `src/persistence/saveSchema.ts` (SAVE_SCHEMA)
- Modify: `src/engine/core/gameInit.ts`
- Test: `src/test/persistence/migrations.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/persistence/migrations.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { migrateSave } from '@/engine/migrations';
import { CURRENT_SAVE_VERSION } from '@/engine/core/simMemory';
import type { GameState } from '@/engine/types';

describe('migrateSave', () => {
  it('upgrades a v1 save (no saveVersion, no simMemory) to current', () => {
    const oldSave = { week: 30, finance: { cash: 100 } } as unknown as GameState;
    const migrated = migrateSave(oldSave);
    expect(migrated.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(migrated.simMemory?.antitrust.lastActionWeek).toBe(-9999);
    // Untouched fields survive.
    expect(migrated.week).toBe(30);
  });

  it('leaves a current-version save unchanged (idempotent)', () => {
    const fresh = migrateSave({ week: 1 } as unknown as GameState);
    const again = migrateSave(fresh);
    expect(again).toEqual(fresh);
  });

  it('preserves existing simMemory if a save already has one', () => {
    const save = {
      week: 5,
      saveVersion: 1,
      simMemory: { antitrust: { lastActionWeek: 7 }, distress: { negativeStreak: {}, lastActionWeek: {}, stageActionCount: {} }, flops: {} },
    } as unknown as GameState;
    expect(migrateSave(save).simMemory?.antitrust.lastActionWeek).toBe(7);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/persistence/migrations.test.ts`
Expected: FAIL — module `@/engine/migrations` not found.

- [ ] **Step 3: Create the migration runner**

Create `src/engine/migrations/index.ts`:

```ts
import type { GameState } from '../types';
import { CURRENT_SAVE_VERSION, defaultSimMemory } from '../core/simMemory';

/**
 * Ordered, append-only save migrations. Each entry upgrades a save to
 * `toVersion`. Never edit or remove an entry once shipped — add a new one.
 */
interface Migration {
  toVersion: number;
  migrate: (state: GameState) => GameState;
}

const MIGRATIONS: Migration[] = [
  {
    // v2: simulation memory moved from module scope into GameState.
    toVersion: 2,
    migrate: (s) => ({ ...s, simMemory: s.simMemory ?? defaultSimMemory() }),
  },
];

/** Upgrade a loaded save to the current version. Saves with no version are v1. */
export function migrateSave(raw: GameState): GameState {
  let state = raw;
  let version = raw.saveVersion ?? 1;
  for (const m of MIGRATIONS) {
    if (version < m.toVersion) {
      state = m.migrate(state);
      version = m.toVersion;
    }
  }
  if (state.saveVersion !== version) state = { ...state, saveVersion: version };
  if (version !== CURRENT_SAVE_VERSION) {
    // A migration entry is missing — fail loudly in dev rather than corrupt quietly.
    console.error(`[migrations] Save migrated to v${version} but current is v${CURRENT_SAVE_VERSION}`);
  }
  return state;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/persistence/migrations.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 5: Wire into `loadGame`**

In `src/persistence/saveLoad.ts`, add the import and change the return:

```ts
import { migrateSave } from "@/engine/migrations";
```

and in `loadGame` replace `return state as GameState;` with:

```ts
    return migrateSave(state as GameState);
```

- [ ] **Step 6: Allow the field in the save schema**

In `src/persistence/saveSchema.ts`, inside the `SAVE_SCHEMA` object (alongside `week`, `gameSeed`), add:

```ts
    saveVersion: z.number().int().positive().optional(),
```

(The schema is `.passthrough()` so `simMemory` flows through without an explicit entry.)

- [ ] **Step 7: Initialize on new game**

In `src/engine/core/gameInit.ts`, add the imports:

```ts
import { CURRENT_SAVE_VERSION, defaultSimMemory } from './simMemory';
```

then locate the initial `GameState` object literal this file returns (the literal containing `week: 1` / `gameSeed`) and add two fields to it:

```ts
    saveVersion: CURRENT_SAVE_VERSION,
    simMemory: defaultSimMemory(),
```

- [ ] **Step 8: Verify typecheck + tests**

Run: `npm run typecheck 2>&1 | grep -iE "migrations|simMemory|gameInit|saveLoad" ; npx vitest run src/test/persistence/migrations.test.ts src/test/engine/simMemory.test.ts`
Expected: no grep output; tests PASS.

- [ ] **Step 9: Commit**

```bash
git add src/engine/migrations/index.ts src/persistence/saveLoad.ts src/persistence/saveSchema.ts src/engine/core/gameInit.ts src/test/persistence/migrations.test.ts
git commit -m "feat(persistence): versioned save migrations; init simMemory on new game"
```

---

### Task 3: Antitrust cooldown → simMemory

**Files:**
- Modify: `src/engine/systems/industry/Antitrust.ts:38-44,102-106`
- Test: `src/test/engine/antitrust-memory.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/engine/antitrust-memory.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { tickAntitrust } from '@/engine/systems/industry/Antitrust';
import { defaultSimMemory } from '@/engine/core/simMemory';
import type { GameState } from '@/engine/types';

// Minimal state: extremely concentrated industry so an intervention WOULD fire
// if not for the cooldown carried in simMemory.
function makeState(lastActionWeek: number): GameState {
  return {
    week: 100,
    finance: { cash: 10_000_000 },
    studio: { id: 'PLAYER', name: 'Player' },
    entities: { rivals: { r1: { id: 'r1', name: 'Mega', cash: 100_000_000_000, strength: 90, prestige: 90, archetype: 'major' } } },
    industry: { newsHistory: [] },
    simMemory: { ...defaultSimMemory(), antitrust: { lastActionWeek } },
  } as unknown as GameState;
}

describe('antitrust cooldown lives in simMemory', () => {
  it('a recent action week carried in state suppresses new interventions', () => {
    // lastActionWeek = 99, current week 100 → inside any sane cooldown → no impacts.
    const impacts = tickAntitrust(makeState(99));
    expect(impacts).toEqual([]);
  });

  it('when an intervention fires, the new lastActionWeek is written back via impact', () => {
    const impacts = tickAntitrust(makeState(-9999));
    const memWrite = impacts.find(
      (i: any) => i.type === 'INDUSTRY_UPDATE' && i.payload?.update?.['simMemory.antitrust']
    ) as any;
    // Either an intervention fired (memory write present) or thresholds weren't met —
    // but if ANY other impact fired, the memory write must accompany it.
    if (impacts.length > 0) {
      expect(memWrite.payload.update['simMemory.antitrust'].lastActionWeek).toBe(100);
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/engine/antitrust-memory.test.ts`
Expected: FAIL — the first test fails because the module-level `lastActionWeek` (still `-9999` in a fresh test process) allows the intervention despite state saying week 99.

- [ ] **Step 3: Refactor Antitrust**

In `src/engine/systems/industry/Antitrust.ts`:

(a) Add the import:

```ts
import { getSimMemory } from '../../core/simMemory';
```

(b) Delete line 38 (`let lastActionWeek = -9999;`) and remove `lastActionWeek = -9999;` from `resetAntitrustState()` (keep the function — tests use it for the log arrays). Add above the two remaining module arrays:

```ts
// FOLLOW-UP (see docs/superpowers/plans/2026-06-16-sim-memory-save-versioning.md):
// antitrustEventLog and antitrustBlockList are also module-scope state; blockList
// is functional (ConsolidationEngine reads it) and evaporates on save/reload.
// Moving them requires a ConsolidationEngine refactor — tracked separately.
```

(c) At the cooldown check (was `:102`), replace:

```ts
  if (week - lastActionWeek < ACTION_COOLDOWN_WEEKS) return impacts;
```

with:

```ts
  const mem = getSimMemory(state);
  if (week - mem.antitrust.lastActionWeek < ACTION_COOLDOWN_WEEKS) return impacts;
```

(d) At the write site (was `:106`, `lastActionWeek = week;`), replace with an impact push (place it with the other impact pushes for the intervention):

```ts
  impacts.push({
    type: 'INDUSTRY_UPDATE',
    payload: { update: { 'simMemory.antitrust': { lastActionWeek: week } } },
  } as unknown as StateImpact);
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/test/engine/antitrust-memory.test.ts src/test/engine/systems/industry/antitrust.test.ts`
Expected: PASS. If the pre-existing `antitrust.test.ts` relied on the module variable resetting, update those tests to pass `simMemory` in their state fixtures instead (the pattern in Step 1's `makeState`).

- [ ] **Step 5: Commit**

```bash
git add src/engine/systems/industry/Antitrust.ts src/test/engine/antitrust-memory.test.ts
git commit -m "fix(engine): antitrust cooldown persists in GameState.simMemory"
```

---

### Task 4: DistressCascade records → simMemory

**Files:**
- Modify: `src/engine/systems/industry/DistressCascade.ts:46-70,84-98` (and `tickDistressCascade`)
- Test: `src/test/engine/distress-memory.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/engine/distress-memory.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { tickDistressCascade } from '@/engine/systems/industry/DistressCascade';
import { defaultSimMemory } from '@/engine/core/simMemory';
import type { GameState } from '@/engine/types';

function makeState(streakForR1: number): GameState {
  return {
    week: 200,
    finance: { cash: 0 },
    studio: { id: 'PLAYER', name: 'Player' },
    entities: { rivals: {
      r1: { id: 'r1', name: 'Sinking', cash: -60_000_000, prestige: 30, strength: 20, archetype: 'mid-tier' },
      r2: { id: 'r2', name: 'Rich', cash: 900_000_000, prestige: 50, strength: 60, archetype: 'major' },
    } },
    ip: { franchises: { f1: { id: 'f1', name: 'Saga', ownerId: 'r1' } }, vault: [] },
    industry: { newsHistory: [], distressedOffers: [] },
    simMemory: {
      ...defaultSimMemory(),
      distress: { negativeStreak: { r1: streakForR1 }, lastActionWeek: {}, stageActionCount: {} },
    },
  } as unknown as GameState;
}

describe('distress memory lives in simMemory', () => {
  it('always writes the updated distress memory back as an impact', () => {
    const impacts = tickDistressCascade(makeState(0));
    const memWrite = impacts.find(
      (i: any) => i.type === 'INDUSTRY_UPDATE' && i.payload?.update?.['simMemory.distress']
    ) as any;
    expect(memWrite).toBeTruthy();
    // r1 is negative, so its streak increments from the STATE-carried value.
    expect(memWrite.payload.update['simMemory.distress'].negativeStreak.r1).toBe(1);
  });

  it('a long streak carried in state (as after loading a save) enables stage actions', () => {
    // 30 weeks negative — past the 26-week stage-1 threshold — carried via state,
    // NOT via module memory. Distress actions become possible this tick.
    const impacts = tickDistressCascade(makeState(30));
    const memWrite = impacts.find(
      (i: any) => i.type === 'INDUSTRY_UPDATE' && i.payload?.update?.['simMemory.distress']
    ) as any;
    expect(memWrite.payload.update['simMemory.distress'].negativeStreak.r1).toBe(31);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/engine/distress-memory.test.ts`
Expected: FAIL — no `simMemory.distress` impact is emitted (the system mutates module records instead).

- [ ] **Step 3: Refactor DistressCascade**

In `src/engine/systems/industry/DistressCascade.ts`:

(a) Add the import:

```ts
import { getSimMemory } from '../../core/simMemory';
```

(b) Delete the three module records (lines ~46-52: `negativeStreak`, `lastActionWeek`, `stageActionCount`) and delete `resetDistressState()` (~line 64). Then find its call sites and remove them (state-based memory makes reset unnecessary — a fresh `GameState` carries fresh memory):

```bash
grep -rn "resetDistressState" src
```

For each caller (sim harness and/or tests), delete the call; test fixtures should set `simMemory` on their state instead.

(c) At the top of `tickDistressCascade(state)`, hydrate a **local working copy** from state:

```ts
  const mem = getSimMemory(state);
  const distress = {
    negativeStreak: { ...mem.distress.negativeStreak },
    lastActionWeek: { ...mem.distress.lastActionWeek },
    stageActionCount: Object.fromEntries(
      Object.entries(mem.distress.stageActionCount).map(([k, v]) => [k, { ...v }])
    ) as Record<string, { s1: number; s2: number; s3: number }>,
  };
```

(d) Replace every read/write of the old module records inside this file's tick path with the local `distress.*` equivalents. The existing helpers change mechanically:
- `counts(id)` (which lazily initialized `stageActionCount[id]`) becomes:

```ts
  const counts = (id: string) => {
    if (!distress.stageActionCount[id]) distress.stageActionCount[id] = { s1: 0, s2: 0, s3: 0 };
    return distress.stageActionCount[id];
  };
```

(move it inside `tickDistressCascade` or pass `distress` to it), and the streak update loop (was `:91-92`) becomes:

```ts
    if ((r.cash || 0) < 0) distress.negativeStreak[id] = (distress.negativeStreak[id] || 0) + 1;
    else distress.negativeStreak[id] = 0;
```

- The dead-rival cleanup (was `:84`) filters the local copies the same way.
- `stage1IPFireSale` / stage-2/3 helpers that consulted `lastActionWeek[id]` / `counts(id)` receive `distress` (or the `counts` closure) as a parameter — thread it through their signatures within this file.

(e) At the **end** of `tickDistressCascade`, always push the memory write-back:

```ts
  impacts.push({
    type: 'INDUSTRY_UPDATE',
    payload: { update: { 'simMemory.distress': distress } },
  } as unknown as StateImpact);
  return impacts;
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/test/engine/distress-memory.test.ts src/test/engine/completeFireSale.test.ts src/test/engine/stage1FireSale-offer.test.ts src/test/engine/tickDistressedOffers.test.ts`
Expected: PASS. (The fire-sale tests call exported helpers whose signatures may now take `distress`/`counts` — update those test call sites with `defaultSimMemory().distress`-shaped arguments as needed.)

- [ ] **Step 5: Commit**

```bash
git add src/engine/systems/industry/DistressCascade.ts src/test/engine/distress-memory.test.ts
git commit -m "fix(engine): distress pacing memory persists in GameState.simMemory"
```

---

### Task 5: FlopMechanics history → simMemory

**Files:**
- Modify: `src/engine/systems/finance/FlopMechanics.ts:103-150`
- Test: `src/test/engine/flop-memory.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/engine/flop-memory.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { shouldRestructureStudio } from '@/engine/systems/finance/FlopMechanics';
import { defaultSimMemory } from '@/engine/core/simMemory';
import type { GameState } from '@/engine/types';

function makeState(flopWeeks: number[]): GameState {
  return {
    week: 100,
    simMemory: {
      ...defaultSimMemory(),
      flops: { r1: { rivalId: 'r1', majorFlops: flopWeeks.length, catastrophicFlops: 0, flopWeeks } },
    },
  } as unknown as GameState;
}

describe('flop history lives in simMemory', () => {
  it('3 major flops within a year (carried in state) → restructure', () => {
    expect(shouldRestructureStudio(makeState([60, 70, 80]), 'r1', 100)).toBe(true);
  });
  it('old flops outside the window → no restructure', () => {
    expect(shouldRestructureStudio(makeState([1, 2, 3]), 'r1', 200)).toBe(false);
  });
  it('unknown rival → no restructure', () => {
    expect(shouldRestructureStudio(makeState([]), 'nobody', 100)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/engine/flop-memory.test.ts`
Expected: FAIL — `shouldRestructureStudio` has signature `(rivalId, currentWeek)`, not `(state, rivalId, currentWeek)`.

- [ ] **Step 3: Refactor FlopMechanics**

In `src/engine/systems/finance/FlopMechanics.ts`:

(a) Add the import:

```ts
import { getSimMemory } from '../../core/simMemory';
```

(b) Delete the module Map (line ~103). Change `shouldRestructureStudio` to read from state:

```ts
export function shouldRestructureStudio(state: GameState, rivalId: string, currentWeek: number): boolean {
  const history = getSimMemory(state).flops[rivalId];
  if (!history) return false;
  // ... (body unchanged from here — the window checks on history.flopWeeks etc.)
```

(c) In `applyFlopPenalties` (already receives `state`), replace the Map get/set block (was `:137-140` and the mutations after it) with a copied record + impact:

```ts
  if (isRival) {
    const flops = { ...getSimMemory(state).flops };
    const prev = flops[ownerId] ?? { rivalId: ownerId, majorFlops: 0, catastrophicFlops: 0, flopWeeks: [] };
    const history: StudioFlopHistory = { ...prev, flopWeeks: [...prev.flopWeeks] };

    if (severity === FlopSeverity.MAJOR) {
      history.majorFlops++;
      history.flopWeeks.push(state.week);
    } else if (severity === FlopSeverity.CATASTROPHIC) {
      history.catastrophicFlops++;
      history.flopWeeks.push(state.week);
    }
    flops[ownerId] = history;

    impacts.push({
      type: 'INDUSTRY_UPDATE',
      payload: { update: { 'simMemory.flops': flops } },
    } as unknown as StateImpact);
    // ... (any remaining rival-penalty impacts in the original block stay as-is)
  }
```

(d) Update `shouldRestructureStudio` callers to pass `state`:

```bash
grep -rn "shouldRestructureStudio(" src --include="*.ts" | grep -v FlopMechanics.ts | grep -v test
```

For each call site, add `state` as the first argument (every engine caller has `state` in scope; if one doesn't, thread it from its own caller — the tick pipeline passes `state` everywhere).

- [ ] **Step 4: Run tests + typecheck**

Run: `npx vitest run src/test/engine/flop-memory.test.ts && npm run typecheck 2>&1 | grep -i "FlopMechanics\|shouldRestructure"`
Expected: tests PASS; grep empty.

- [ ] **Step 5: Commit**

```bash
git add src/engine/systems/finance/FlopMechanics.ts src/test/engine/flop-memory.test.ts
git commit -m "fix(engine): flop history persists in GameState.simMemory"
```

---

### Task 6: Verification sweep

- [ ] **Step 1: No module-scope sim state remains in the three systems**

Run:

```bash
grep -nE "^(let |const [a-z][a-zA-Z]* *(: *(Record|Map)[^=]*)? *= *(\{\}|new Map))" src/engine/systems/industry/Antitrust.ts src/engine/systems/industry/DistressCascade.ts src/engine/systems/finance/FlopMechanics.ts
```

Expected: no output (the two Antitrust log arrays are `export const ... = []` and carry the FOLLOW-UP comment).

- [ ] **Step 2: Full engine test pass + app smoke**

Run: `npx vitest run src/test/engine src/test/persistence 2>&1 | tail -5`
Expected: PASS (or only failures that pre-date this plan — compare with a `git stash` run if unsure).

Then: `npm run dev`, open `http://localhost:8081/dashboard?autoStart=true`, advance several weeks, save to a slot, reload the page, load the slot, and advance again — no console errors, and the game continues.

- [ ] **Step 3: Commit any test-fixture fallout**

```bash
git add -A && git commit -m "test: fixture updates for state-carried sim memory"
```

---

## Self-Review Notes

- **Coverage:** SimMemory type/accessor (T1), versioned migrations wired into load + new-game (T2), all three ghost-state systems refactored (T3-T5), verification (T6). The functional `antitrustBlockList` is explicitly scoped out with an in-code FOLLOW-UP comment and rationale.
- **Mechanism consistency:** all write-backs use the proven `INDUSTRY_UPDATE` dot-path (`'simMemory.antitrust' | 'simMemory.distress' | 'simMemory.flops'`); all reads go through `getSimMemory` so pre-migration states can't crash.
- **Signatures:** `shouldRestructureStudio(state, rivalId, currentWeek)` is the one breaking signature change; Task 5 Step 3(d) locates and updates every caller.
- **Ordering note:** systems read the *pre-tick* memory and write the post-tick memory, matching how every other system in `WeekCoordinator` treats state. Each system owns its own memory slice, so there are no cross-system write conflicts within a tick.
