# Studio-Boss Repository Consolidation — Final Verdict

## Round 1 (2026-08-25) — Summary

**Merge commit:** `fbfe6cba` · **Integration branch:** `consolidation/integration-ade03b` (deleted) · **18 remote branches deleted**

Triaged PRs #820–#837 (12 cherry-picked, 5 superseded/rejected, 1 approved-as-duplicate): Bolt `for...in`+`hasOwnProperty` engine optimizations, Palette ARIA fixes, Sentinel input `maxLength`. Also fixed broken `{type, X}` import syntax in 7 files, deleted 135-line dead `applyProjectResults`, completed SubNav `role="tablist"`, removed 5 `as any` casts in gameStore + 9 in projects.ts. Round-1 end state: lint 0 err / 66 warn · typecheck 23 err · tests 1740 pass / 16 fail (pathSecurity 12, settingsStore 4) · build green. Per-PR detail preserved in git history.

---

## Round 2 (2026-09-12)

**Commits:** `254c41ca` (test-first suite) → `f83c25a7` (production integration) → `6da61ced` (autoStart fix)
**Integration branch:** `consolidation/integration-r2` (merged fast-forward to `main`, deleted)
**Remote cleanup:** 38 PRs commented + closed, 38 remote branches deleted — verified `gh pr list --state open` = 0 and `git ls-remote --heads origin` = `main` only.

### Per-PR Verdict Table

| PR | Cluster | Verdict | Rationale |
| ---- | --------- | --------- | ----------- |
| #838 | palette close-icons | **Superseded** | 9-file diff; extra 6 files were stale merge-base import churn already fixed on main. Real content = same dialog/sheet aria-hidden, covered by #874. |
| #839, #842, #845, #853, #855, #860, #862, #864, #870 | palette close-icons | **Superseded** | Identical dialog/sheet/toast `aria-hidden` diffs (#874 vs #845 byte-identical modulo `.Jules` metadata). |
| #874 | palette close-icons | **Integrated** | Winning variant: `aria-hidden` on decorative X icons in `dialog.tsx`, `sheet.tsx`, `toast.tsx`. |
| #847 | palette | **Integrated** | `tooltip` on disabled Greenlight button (`CreateProjectModal.tsx`) + `TooltipProvider` test wrappers. |
| #856 | palette | **Integrated** | `aria-hidden` on roster Bookmark icon (`TalentHub.tsx`). |
| #867 | palette | **Integrated** | `aria-label="Clear secondary marketing angle"` on Clear button (`ProjectMarketingTab.tsx`). No `.jules` metadata (draft assumption disproven). |
| #840 | bolt ipRetention | **Integrated** | `advanceIPRights`/`catalogValue` switched to `Record` iteration + `WeekCoordinator` caller updated. Winning variant of pair. |
| #846 | bolt ipRetention | **Superseded** | Duplicate of #840. |
| #865 | bolt motivationEngine | **Integrated** | Winning variant of 7-PR cluster — cached property iteration. |
| #841, #843, #844, #850, #851, #861 | bolt motivationEngine | **Superseded** | Duplicates of #865 (#844 also carried stray `test_motivation_engine.ts`). |
| #848 | bolt | **Integrated** | `AgentBrain` poach-target selection loop optimization. |
| #859 | bolt | **Integrated** | `RelationshipSystem` + `relationshipFormation` `Object.keys` elimination. |
| #868 | bolt | **Integrated + modified** | `RegulatorSystem` filter+reduce fused into single loop; also fixed to emit `impact.newsEvents` (see news verdict). |
| #871 | bolt | **Integrated** | `talentAgentInteractions` compatibility-matrix GC fix. |
| #875 | bolt | **Integrated** | `selectTalentSatisfaction` single-pass `for...in` — allocation reduction (not memoization as PR claimed). |
| #849, #852, #854, #857, #858, #863, #866, #869, #872, #873 | sentinel navigation | **Superseded — intent implemented** | All 10 move nav guards into `web-contents-created`. Instead of picking one variant, the guard logic was extracted into unit-testable `electron/navigationGuards.cjs` and installed globally — strictly better than any single PR. Stray `test-grep.cjs`/`test_script.sh` files never landed. |

**Totals: 12 integrated, 26 superseded/rejected, 0 unresolved.**

### Plan-Validation Findings (approve/disprove record)

| Claim | Verdict | Outcome |
| ------- | --------- | --------- |
| 38 PRs ↔ 38 branches, no stale refs | **Approved** | Verified; cleanup verified post-deletion. |
| Sentinel cluster ≈ 10 near-identical | **Approved** | Implemented via extracted module instead of one variant. |
| Palette close-icons ≈ 10 duplicates | **Approved** | #874 integrated; 10 superseded (incl. #838's stale churn). |
| News refactor breakage test-side only | **Disproven** | Production `industryHandlers.ts` wrote a removed `state.news` field — a real dead-store bug that silently dropped regulator and rumor headlines from the feed. |
| Unified model = `industry.newsHistory` | **Disproven** | Actual model: `impact.newsEvents`/`NEWS_ADDED` → `WeekCoordinator.buildSummary` → `WeekSummary.newsEvents`. Fix followed the real model. |
| Baseline = round-1's 16 failures | **Disproven (stale)** | Fresh baseline: 1752 pass / 4 fail (settingsStore env), typecheck 22 err, lint 0/66. |
| Electron tests hard to write | **Disproven** | Solved by extracting `navigationGuards.cjs` — pure functions unit-testable without importing `main.cjs`; `main.test.ts` now asserts the global wiring by source inspection. |
| #875 is memoization | **Partially disproven** | It is allocation reduction; verdict recorded as such. |

### News Refactor Completion (production bug fix)

- `handleHeadlinePosted` is now a pass-through and `handleIndustryRumorsUpdated` only updates `industry.rumors` — the phantom `state.news` writes are deleted (`industryHandlers.ts`).
- `RegulatorSystem.tick` attaches the REGULATORY WATCH headline as `impact.newsEvents`; `RumorProcessor` moves `payload.headlines` to top-level `newsEvents`. Headlines reach `WeekSummary.newsEvents` again — a **behavior restoration**, not just a type fix.

### Test-Environment Fixes

- **settingsStore ×4 baseline failures (root cause):** Node ≥ 22 ships an experimental `localStorage` that shadows jsdom's and is unusable without `--localstorage-file`; zustand's `persist` captured `undefined` at module init because `setup.ts`'s hoisted imports loaded the store before the shim ran. Fixed two ways: (a) new dependency-free `src/test/storageShim.ts` imported **first** in `setup.ts`; (b) `settingsStore` now passes an explicit `createJSONStorage` getter that tolerates `localStorage` access throwing (returns `undefined` → zustand skips persistence gracefully). Browser/Electron persistence unchanged.

### Additional Bugs Found & Fixed This Round

| Bug | File | Fix |
| ----- | ------ | ----- |
| Regulator/rumor headlines silently dropped | `industryHandlers.ts`, `RegulatorSystem.ts`, `RumorProcessor.ts` | Route through `impact.newsEvents` |
| `?autoStart=true` at `/` dead-ends (redirect required existing gameState) | `TitleScreen.tsx` | `devAutoInit()` before navigate, matching Dashboard + dev-bypass button |
| e2e `getByText("Alpha Studios")` strict-mode violation (4 matches) | `e2e/auto_start.spec.ts` | `getByRole("heading")` + nav timeout |
| Missing `weekSummaries` in mock GameState | `test/engine/generators/mockFactory.ts` | Added field |

### Phase-1 Findings Ledger — Deferred / Out of Scope

- ~129 `Object.values/keys/entries` in engine hot paths remain (round-1's 71 + more); only PR-touched sites optimized this round. Convention stands: pass `Record`/`Map`, don't array-ify to iterate.
- `selectBoxOfficeData` uses `Math.random()` in a selector (non-deterministic display data) — flagged for a future honesty audit, not changed.
- ~113 `as any` and ~172 eslint-disables repo-wide — only files touched this round were cleaned.
- 66 pre-existing lint warnings — unchanged, none introduced.
- `main.test.ts` verifies global wiring by source inspection rather than executing `main.cjs` under mocks (import-time `app.whenReady` side effects make direct import brittle) — behavioral coverage lives in `navigationGuards.test.ts` against the real exported functions.

### Test-First Audit

- [x] Phase-3 commit `254c41ca` contains ALL new/updated tests; production changes first appear in `f83c25a7`.
- [x] 13 tests were red for the correct reasons pre-integration (nav-guard module missing, missing aria-hidden/aria-label, missing `impact.newsEvents`, Record-signature mismatch); all green post-integration.
- [x] 4 pre-existing settingsStore env failures fixed via shim + explicit storage.
- [x] 3 test-authoring bugs caught and fixed during the red run (Radix `<Tabs>` wrapper, relationship key format `lower-higher`, chart-selector expectation) — distinguished from legit red.

### Verification Results (baseline → final)

| Check | Baseline | Final |
| ------- | ---------- | ------- |
| `bun run lint` | 0 err / 66 warn | 0 err / 66 warn |
| `bun run typecheck` | 22 errors | **0 errors** |
| `bun run test` | 1752 pass / 4 fail | **1801 pass / 0 fail** (260 files) |
| `bun run build` | pass | pass (~40s) |
| `node --check electron/*.cjs` | pass | pass |
| Playwright e2e | 2 pass / 2 fail (brittleness + real autoStart bug) | **4 pass / 0 fail** |

### Acceptance Checklist

- [x] All tests authored/committed before production changes; red→green verified
- [x] All 38 PRs have explicit verdicts (table above + GitHub comments)
- [x] News refactor completed to zero typecheck errors without resurrecting `state.news`/`industry.newsHistory`
- [x] settingsStore persistence fixed robustly (browser + test + throw-safe)
- [x] Navigation guards applied globally to every webContents via extracted module
- [x] All merge conflicts resolved (none arose — fast-forward)
- [x] `main` pushed; all 38 PRs closed; all 38 remote branches deleted; integration branch deleted
- [x] Authoritative verification: `gh pr list --state open` = 0; `git ls-remote --heads origin` = main only

---

## Round 3 (2026-09-23)

**Commits:** `23610ffb` (test-first red suite) → `dbb02f07` (correctness sweep + dead-code removal) → `d6a5a8f4` (sentinel normalization, navigation, PR integrations) → `9852eb9a` (electron list-saves fix) → `5d8679b6` (modal pipeline + electron hardening + honesty sweep)
**Branch strategy:** applied directly on `main` (zero back-compat mandate); all 16 PR diffs manually integrated — `.jules` metadata and generated artifacts excluded.

### Per-PR Verdict Table

| PR | Cluster | Verdict | Rationale |
| ---- | --------- | --------- | ----------- |
| #876 | bolt nielsen | **Integrated** | Nielsen aggregation loop optimization in `nielsenSystem.ts`. |
| #877 | bolt crisis | **Integrated** | Crisis evaluator loop optimization. |
| #878 | palette disabled-tooltip | **Integrated + root-fixed** | Disabled attach-button tooltip; the underlying inert-tooltip bug was fixed in `button.tsx` (span wrapper for disabled buttons), making this actually functional. |
| #879 | palette sidebar | **Integrated** | Collapsed-sidebar tooltips in `StudioSidebar.tsx`. |
| #880 | bolt map-alloc | **Integrated** | Eliminated redundant Map allocation. |
| #881 | palette aria-hidden | **Integrated** | Winning variant of the icon aria-hidden cluster (`select.tsx`, `accordion.tsx`, `pagination.tsx`). |
| #882 | sentinel textarea | **Integrated + fixed** | `maxLength={5000}` default — prop order corrected so an explicit `maxLength` prop can't silently disable the cap. |
| #883 | bolt regional-ratings | **Integrated** | Regional ratings loop optimizations. |
| #884 | palette disabled-tooltip | **Integrated + root-fixed** | Disabled-tooltips PR; functional after the `button.tsx` disabled-tooltip fix. |
| #885 | palette aria-hidden | **Superseded** | Byte-identical subset of #881. |
| #886 | bolt map-lookup | **Integrated + modified** | `Map` trend lookups in `biddingEngine.ts`/`finance.ts` — rewritten to preserve first-match semantics (`Map.set` is last-wins vs `.find()` first-wins). |
| #887 | palette aria-hidden | **Integrated** | Icon aria-hidden variant; stray 353-line `vitest.out` artifact excluded. |
| #888 | bolt timeline-selector | **Moot — target deleted** | Optimized `selectProjectTimelineData`, which was deleted as dead code this round. |
| #889 | palette aria-hidden | **Superseded** | Byte-identical subset of #881. |
| #890 | bolt distress-cascade | **Integrated + tightened** | DistressCascade loop/allocation optimization; `Record<string, any>` leak replaced with the real value type. |
| #891 | palette a11y | **Integrated** | StudioPulse icon aria-hidden. |

**Totals: 12 integrated (3 with corrections), 3 superseded, 1 moot, 0 unresolved.**

### Verified Bugs Fixed This Round (beyond PRs)

| Finding | Fix |
| --------- | ----- |
| **Talent pool starvation (CRITICAL)** — `TALENT_ADDED` emitted `{newTalents}` but handler read `payload.talent` → replenishment silently dropped, pool drained to 0 over long sims | Emitters aligned to `payload.talents`; handler reads the array |
| **Modal pipeline broken** — engine MODAL_TRIGGERED impacts enqueued `{priority, payload:{...}}` but every modal reads `payload.<field>` flat → all engine-triggered modals received empty data; `ModalManager` was never mounted so most types never rendered and could jam the queue | Payload normalized (nested + flat conventions); real `WeekSummary` attached to SUMMARY; `ModalManager` mounted in Dashboard; unhandled types auto-resolve |
| **Dual finance mirror** — top-level `s.finance` went stale vs `gameState.finance` (FestivalMarketModal bid on stale cash) | Mirror deleted; all consumers read `gameState.finance` |
| **Impure `set()` updaters** — `appendNewsEvents` called inside zustand updaters (double-invoke → duplicate news) | Hoisted outside `set()` |
| **`advanceWeek` cache** — content-insensitive `lp === tc` check could return a stale result from a different game | Removed the clause |
| **Player-sentinel fragmentation** — `"player"`/`"PLAYER"`/`studio.id` checked inconsistently; MetricsCollector reported 0 player projects; liquidation orphaned acquired assets | Normalized via `isPlayerOwner`/`getPlayerId` |
| **Rival-acquisition dropped assets** — player path transferred vault IP but dropped the rival's projects + platforms | Projects transferred to `entities.projects` with player `ownerId`; platforms appended to `studio.ownedPlatforms` |
| **`handleFinanceTransaction`** — player-targeted transactions fell into the rival branch and silently dropped | Player-id gate fixed; rival cash NaN-clamped |
| **`handleCliqueUpdated`** — wrote clique but didn't rebuild `memberCliqueMap` | Map rebuilt on update |
| **Tick-path agent hires** — `createRelationship` return discarded → `talentAgentRelationships` never populated for AI-initiated hires | Emits `RELATIONSHIP_UPDATED` |
| **CommandPalette navigation** — `setActiveSubTab` was a no-op (nothing read it) | Commands now call `setActiveTab` with real `TabId`s |
| **Disabled-button tooltips inert** — `TooltipTrigger asChild` on a disabled `<button>` gets no pointer events | Button wraps in `<span>` when disabled + tooltip |
| **Honesty sweep** — fabricated rival `projectCount` drift, `Date.now()` save timestamps, dead "cash guard" | `projectCount` derived from real slate; `savedAt` stamped at save; dead conditions removed |
| **Electron** — `list-saves` leaked NaN slots; `import-save` had no size cap; store IPC accepted `__proto__` keys; dead worker stubs + protocol registration | All fixed (`main.cjs`/`preload.cjs`) |
| **CI** — no typecheck or e2e gates | Both added to `ci.yml` |
| **Autosave** — unbounded FIFO queue | Coalesced to latest pending state |
| **Persistence** — worker requests could hang forever | 30s timeout → reject |

### Dead Code Removed

- `deals.ts` first-look subsystem (`FirstLookDeal`, `offerFirstLookDeal`, `advanceDeals` — zero callers; the TalentPact path in `deals.activeDeals` is live)
- `advanceProject` + phase helpers in `projects.ts` (~200 lines; tick path uses `projectHandlers/*`)
- `aiService.ts` + `@google/generative-ai` dep + broken `refill-narrative.yml` cron (ran a nonexistent script)
- ~19 dead chart selectors (fabricated `theaters`/`slippage`/flat-history data, zero consumers) — `chartSelectors.ts` slimmed to live exports; `selectors.ts` deduplicated
- Orphan `src/engine/utils.test.ts` (outside vitest include; merged into live test)
- Legacy modal flags in `uiStore` (shadowed by the modal queue)
- Tracked junk: `.env` (contained `GEMINI_API_KEY` — **rotate it**), `test-results.json`, `verification/` artifacts
- Dead worker IPC stubs (`worker-init-game`/`worker-advance-week`) and `setAsDefaultProtocolClient` (no handlers)

### Plan-Validation Record (approve/disprove)

| Claim | Verdict |
| ------- | --------- |
| 16 PRs ↔ 16 branches, all merge-bases on current main | **Approved** |
| #885/#889 byte-identical subsets of #881 | **Approved** |
| `.env` tracked secret | **Approved — confirmed; `git rm --cached` applied; rotation flagged to user** |
| `TalentAvatar` `dangerouslySetInnerHTML` unsafe | **Disproven** — already DOMPurify-sanitized |
| `.DS_Store`/empty dirs are repo problems | **Disproven** — untracked local junk only |
| Disabled-button tooltips inert | **Approved — fixed via span wrapper** |
| `releaseSimulation` global `randRange` breaks determinism | **Partially disproven** — module `rand()` is re-seeded per tick, so draws are deterministic per-tick; parallel-stream correlation (F-025) documented as an architectural note |
| 49 `as unknown as StateImpact` casts = missing union members | **Partially approved** — most are payload-shape mismatches, not missing types; recorded as type-debt rather than expanded |
| `saveSchema` passthrough is a hardening gap | **Approved** — deferred (schema validates load-bearing fields; deeper validation logged as follow-up) |

### Verification Results

| Check | Result |
| ------- | -------- |
| `bun run typecheck` | **0 errors** |
| `bun run lint` | 0 errors / **58 warnings** (baseline: 66) |
| `bun run test` | **1743 pass / 0 fail** (255 files; two 52-week sim tests now yield to the event loop to avoid vitest RPC heartbeat timeouts) |
| `bun run build` | **pass** (4.4s; existing >500kB chunk warning unchanged) |
| Playwright e2e | **4/4 pass** |
| Determinism | **bit-identical** per seed (1234, 5678); cross-seed divergence confirmed |
| `node --check electron/*.cjs` | pass |
| Benchmarks | MediaPage 5.49x optimized; PipelineBoard 1.30x; SchedulingEngine ~146k hz |

### Remaining Known Limitations (honest list)

- `src/routes/` file-route tree is vestigial — the live router is inline in `App.tsx`. Left in place; flagged for removal or adoption.
- `STRATEGY_CHOICE`/`CASTING_CONSTRAINT` modal types have no renderer — auto-resolved so they can't jam the queue.
- ~49 `as unknown as StateImpact` casts remain (payload-shape mismatches) — typed surface improved but not eliminated.
- `saveSchema` remains passthrough on `entities`/`market`/`industry` — malformed-but-valid saves could still crash edge paths.
- 58 lint warnings remain (pre-existing class; none new).
- `GEMINI_API_KEY` in git history needs rotation — untracked going forward but the old value is recoverable from history.

---

## Round-3 Continuation — Deferred & Optional Items Implemented

All items previously deferred or marked out-of-scope have been implemented under the zero-backward-compatibility mandate.

| Item | Outcome |
| ------ | -------- |
| F-055 impact union | **Done** — `GenericImpact` (`type: string; payload?`) added to `StateImpact`; all 49 `as unknown as StateImpact` casts removed across 23 emitter files |
| F-067 rng threading | **Disproven** — `WeekCoordinator.execute` calls `setDeterministicSeed(gameSeed + tickCount)` before the pipeline, so `randRange` draws are already deterministic per-tick; UI draws between ticks are wiped by reseed. Verified, no change needed |
| F-056 saveSchema | **Done** — `entities` now requires `projects`/`releasedProjectIds`/`talents`/`contracts`/`rivals`/contract indexes; `market` validates `opportunities`/`buyers`; `industry` validates `families`/`agencies`/`agents`; `studio.internal` and `finance` structure required; `saveVersion` now required |
| F-057 migrations | **Done** — migration framework deleted; `migrateSave` throws on any version ≠ `CURRENT_SAVE_VERSION`, backfills `simMemory` defensively. Tests rewritten for the zero-compat policy |
| F-009 tabs ref warning | **Fixed** — root cause: framer-motion v12 `PopChild` reads `props.ref` (React-18 dev warning). `AnimatePresence` removed from `TabsContent`; `asChild` now composes `motion.div` directly. Regression test: `src/test/components/ui/tabs.test.tsx` |
| F-017 bundle size | **Fixed** — routes `NewGame`/`Dashboard` lazy; all 9 tab panels lazy; `manualChunks` splits react/motion/charts/radix/icons/vendor/engine. Largest chunk now 363 kB (was 2,071 kB); zero >500 kB warnings |
| F-072 medicalLeave undefined | **Fixed** — `handleTalentUpdated` treats explicit `undefined` as field deletion; entities serialize identically after round-trip |
| F-073 rival cash floor | **Fixed** — `Math.max(0, …)` floors removed in `FlopMechanics` + `AgentBrain`; rivals can go negative, which `DistressCascade` stage-1 (`cash < 0`) requires |
| F-075 replenishment spike | **Fixed** — bounded to `maxWeeklyReplenishment = 100` talents/week (was: full 2,500-pool deficit in one tick) |
| F-085 modal payloads | **Done** — `ModalPayloadMap` discriminated union keyed by `ModalType`; `QueuedModal` is now a mapped discriminated union so `type` narrows `payload`. All modals re-verified against emitted shapes |
| F-086 workerless save | **Done** — `PersistenceUnavailableError` thrown; `saveGame` returns `SaveResult`; `saveToSlot` surfaces a toast on failure |
| STRATEGY_CHOICE | **Removed** — never emitted; deleted from `ModalType` |
| CASTING_CONSTRAINT | **Implemented** — `CastingConstraintModal` + `resolveCastingConstraint` slice action (applies cashCost/prestigeCost/weeksDelay/recast); registered in `ModalManager` |
| FESTIVAL_MARKET crash | **Fixed** — modal expected `payload.project`, emitter sent `{results, festivalBody, week}`; rendered null forever → queue jam. Rewired to real results payload with accept/decline + submission status settlement |
| Vestigial `src/routes/` | **Removed** — `routeTree.gen.ts` + 7 route files deleted; inline `App.tsx` router is authoritative |
| docs/codebase_audit.md | **Rewritten** — reflects slices, normalized entities, impact pipeline, persistence policy, residual debt |
| bench script | **Added** — `bun run bench` → `vitest bench src/test/performance` |
| Lint warnings | **0 remaining** (was 58) — all unused vars/imports/directives swept; 2 real bugs found in the process (write-only `rng` test declarations) |
| Latent bug: CRISIS without `projectId` | **Fixed** — `ratingEditing` emits CRISIS sans `projectId`; `CrisisModal` previously indexed `projects[undefined]` — now guards and auto-resolves |

### Residual debt (documented, not silently ignored)

- ~90 `as any` / file-level `no-explicit-any` disables remain across ~40 files (heaviest: `talentSlice.ts`, `projectSlice.ts`, `OrganicEventEnhancer.ts`, `ProductionEnhancementSystem.ts`, `RivalSpawner.ts`). These are genuine shape friction between loose engine object literals and strict `GameState` interfaces — fixing them properly means declaring real union members/fields, not renames.
- `GenericImpact` accepts `payload?: any` by design — registered types are still preferred; unregistered literals hit the `console.warn` passthrough.
- `saveSchema` validates structure, not per-entity record contents.
- `GEMINI_API_KEY` still recoverable from git history — **user must rotate**.
