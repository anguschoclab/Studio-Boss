# Codebase Architecture Audit: Studio Boss

_Last refreshed after the Round-3 consolidation sweep (see `CONSOLIDATION-VERDICT.md`)._

## Overview

Studio Boss is a deterministic, tick-based studio simulation: React 18 + Vite frontend, Zustand store, a headless TypeScript engine under `src/engine/`, and an Electron shell with OPFS persistence via a Web Worker.

### Current architecture

- **Engine** (`src/engine/`): `WeekCoordinator.execute(state)` runs the weekly tick — seeds `gameSeed + tickCount` into both the module `rand()` source and a `RandomGenerator` instance in `TickContext`, runs the system pipeline, and returns `{newState, summary, impacts}`. State mutations go exclusively through `StateImpact` objects applied by `applyImpacts`/`handlerRegistry` (`src/engine/core/`).
- **Entities**: normalized under `entities` (`projects`, `talents`, `contracts`, `rivals`, `contractsByProjectId`, `contractsByTalentId`, `releasedProjectIds`). `studio.internal.projects` is the player's own project map.
- **Store** (`src/store/`): composed Zustand slices (`projectSlice`, `financeSlice`, `talentSlice`, `rivalSlice`, `newsSlice`, `snapshotSlice`, `loanSlice`, `bookmarkSlice`, `distressSlice`, `marketingSlice`, `projectEventsSlice`). Store actions call pure engine functions and commit via `applyStateImpact`.
- **Selectors** (`src/store/selectors.ts`, `chartSelectors.ts`): derived-state reads. The dead/divergent visualization selector layer was removed in Round 3; `chartSelectors.ts` currently exports only the live `selectMediaCoverage` selector.
- **Routing**: inline TanStack Router tree in `src/App.tsx` (`/`, `/new-game`, `/dashboard`). `Dashboard` and `NewGame` are lazy; every dashboard tab panel and modal is code-split. The vestigial `src/routes/` file-router tree and `routeTree.gen.ts` were deleted — no file-router plugin is configured.
- **Modals**: `uiStore` holds a `modalQueue` + `activeModal` discriminated union (`QueuedModal`) keyed by `ModalType` with a per-type `ModalPayloadMap`. Engine `MODAL_TRIGGERED` impacts are normalized to flat payloads in `gameStore` and rendered by `ModalManager`; unknown types auto-resolve so the queue can't jam.
- **Persistence** (`src/persistence/`): `PersistenceService` talks to `saveWorker.ts` (OPFS) via a typed request/response protocol (`request<T>`; worker payloads are `unknown`). Saves carry `savedAt` and `saveVersion = CURRENT_SAVE_VERSION`. `saveSchema.ts` validates structure plus per-entity load-bearing fields (project `title`/`type`/`state` enums, talent `name`/`tier`, rival `name`/`archetype`/`cash`, contract `projectId`/`talentId`/`fee`) and referential integrity (key↔id match, contract refs, ghost index ids, `releasedProjectIds`, `studio.internal.projects` orphans) via `checkReferentialIntegrity`. `migrateSave` enforces the current version outright — **no backward compatibility with older save versions**; missing `simMemory` is backfilled defensively. Workerless environments surface `PersistenceUnavailableError` → `saveGame` returns `{ok:false, reason:"worker-unavailable"}` → `saveToSlot` shows a toast.
- **Electron** (`electron/`): contextIsolation on, navigation guards, validated IPC (numeric save-slot filtering, `__proto__` key rejection, import-size cap), narrow preload API.

## Resolved since the original audit

- Store monolith → split into slices; inline business logic moved to engine systems.
- Dual finance mirror removed — `gameState.finance` is the single source.
- Impure `set()` updaters (news appends inside updaters) hoisted out.
- `Math.max(0, rival.cash)` floors removed — rival insolvency now flows to `DistressCascade`.
- `advanceWeek`'s content-insensitive memo cache removed.
- Dead code deleted: `projects.ts` phase helpers, `deals.ts`/`FirstLookDeal` subsystem (the TalentPact path is live), dead selectors, vestigial routes.
- Talent updates treat explicit `undefined` as field deletion — serialization-stable.
- Talent replenishment bounded to 100/week (was: entire 2,500-pool deficit in one tick).
- `FESTIVAL_MARKET` modal rewired to its real emitted payload (auction results accept/decline) — previously rendered null and jammed the queue.
- `CASTING_CONSTRAINT` modal implemented (`CastingConstraintModal` + `resolveCastingConstraint`); `STRATEGY_CHOICE` removed as dead.
- Lint: 0 errors / 0 warnings (from 0/58).

## Known limitations / remaining debt

- **Committed secret**: a `GEMINI_API_KEY` was committed in `c5a0862f`/`72a02b11` and remains recoverable from git history — rotate the key; `.env` is untracked but history persists.
- **Impact dispatch**: `StateImpact` is a closed discriminated union (65 `ImpactType` literals); `GenericImpact` was removed. The handler registry is a mapped type over `ImpactType`, so every registered type is checked against a real handler signature. One intentional cast remains at the dispatch site (`applySingleImpact`) where TS cannot correlate a dynamic union key to the mapped handler signature.
- **`as any` / `as unknown as` debt: eliminated** in production code. File-level `no-explicit-any` disables are all removed. Remaining `any` usage lives in test fixtures (deliberately partial entities) — out of scope by policy.
- **`saveSchema` validates load-bearing fields + referential integrity**, not full entity mirrors: optional entity fields stay `unknown`, but required identity/lifecycle fields and all cross-references are enforced (see Persistence above).
- **Pre-existing dev-mode noise**: framer-motion v12's `PopChild` reads `props.ref` (React-18 warning) on any `AnimatePresence` child — avoided in `tabs.tsx`; other `AnimatePresence` usages may still log it until React 19.
- **`studio.internal.projects` diverges from `entities.projects` post-creation**: player projects are written to both maps at creation (`projectSlice`), but `handleProjectUpdated` only writes `entities.projects` and no sync exists in `applyImpacts`, `weekAdvance`, or the store — so `internal.projects` goes stale after the first `PROJECT_UPDATED` (e.g., `weeksInPhase` never advances). Components must read `entities.projects[id] ?? internal.projects[id]` (canonical-first); `useProjectDetailData` does this for the detail modal. Other consumers reading `internal.projects` for live fields may still show stale data.

## Verification commands

```bash
bun run typecheck   # tsc -p tsconfig.app.json --noEmit
bun run lint        # eslint . — 0 errors, 0 warnings
bun run test        # vitest run
bun run build       # vite build — all chunks < 500 kB
bun run bench       # vitest bench src/test/performance
bunx playwright test # e2e
node --check electron/main.cjs && node --check electron/preload.cjs
```
