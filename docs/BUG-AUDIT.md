# Studio-Boss — Prioritized Bug & Debt Register

_Consolidated from the Round-5 exhaustive audit (2026-11-03) + Rounds 1–4 ledgers in `CONSOLIDATION-VERDICT.md`. Every item carries evidence (`file:line`), a severity, and a suggested fix. Update this file as items land — new findings get the next free `BUG-0xx` id._

**Severity legend:** P0 = security/data-loss, fix now · P1 = correctness/architecture, next round · P2 = perf/tech-debt, scheduled · P3 = hygiene/cosmetic, opportunistic.

---

## P0 — Critical (action required)

| ID | Finding | Evidence | Suggested fix | Status |
|---|---|---|---|---|
| BUG-001 | **`GEMINI_API_KEY` recoverable from git history** | Committed in `c5a0862f`/`72a02b11`; `.env` is untracked now but the old value persists in objects | Rotate the key (only the user can) — then optionally `git filter-repo`/BFG purge of `.env` blobs | **OPEN — user action required** |

## P1 — Correctness / architecture

| ID | Finding | Evidence | Suggested fix | Status |
|---|---|---|---|---|
| BUG-002 | **`tvRecommendations` is a write-only system** — produced every 4 weeks, nothing reads it | `tickTVRecommendationSystem` runs at `WeekCoordinator.ts:307`; zero readers of `state.tvRecommendations` in `src/components`, `src/store`, `src/pages`, `src/hooks` | Wire a UI surface (talent TV offers feed) OR delete the write path; decide as a product call | OPEN |
| BUG-003 | **`getTVRecommendationsForTalent` / `acceptTVRecommendation` — dead public APIs** | Zero callers repo-wide (grep-verified) | Remove if BUG-002 resolves to "delete"; keep if UI wiring planned | OPEN (tied to BUG-002) |
| BUG-004 | **`SchedulingEngine.processPacts` — dead method; verify pact lifecycle** | `schedulingEngine.ts:88`; `SchedulingEngine.tick` never calls it; no other caller. **Open question:** if nothing decrements `weeksRemaining`, weekly-fee pacts never expire — possible real gameplay bug, not just dead code | Trace pact expiry: if no path decrements, wire `processPacts` into the tick (and add regression test); else delete the method | OPEN — needs lifecycle trace |
| BUG-005 | **`FORMAT_LICENSED` — registered handler, zero emitters** | `ImpactType` declared `state.types.ts:219`, handler `ipHandlers.ts:52` in registry slot `index.ts:132`; no emitter anywhere | Keep as reserved vocabulary (consistent with MERGER_* policy) or remove type + handler together | OPEN (documented-dead per policy) |
| BUG-006 | **`MERGER_OFFERED` / `MERGER_RESOLVED` — dead reserved vocabulary** | `state.types.ts:190–191, 579–584`; zero emitters, no handlers needed | Same policy as BUG-005 | OPEN (documented-dead) |
| BUG-007 | **`request()` waits full 30 s when worker is null** | `PersistenceService.ts:62–75` — `this.worker?.postMessage` no-ops with null worker but the 30 s timer still runs; observed as `SAVE_GAME request timed out` stderr in workerless test env | Early-reject in `request()` when `!this.worker` (return `PersistenceUnavailableError` immediately) | OPEN — cheap hardening |

## P2 — Performance / tech-debt

| ID | Finding | Evidence | Suggested fix | Status |
|---|---|---|---|---|
| BUG-008 | **102 `Object.values/keys/entries` sites across 51 engine files** — allocation debt in tick paths | grep census (was ~129 in R2; convention: iterate `Record` directly) | Only fix measurably-hot sites; standing convention already recorded | STANDING DEBT |
| BUG-009 | **`secureRandom` legacy alias** — second name for `rand()` | `engine/utils.ts:86` delegates to seeded `rand()` | Rename/deprecate for a single canonical name; update ~10 call sites | OPEN (cosmetic) |
| BUG-010 | **Bench coverage is thin** — only `PipelineBoard`, `schedulingEngine`, `weekAdvance` | `src/test/performance/` | Add benches for `applyImpacts`, `calculateConsolidatedExpenses`, `selectAwardsProbability` if perf work continues | OPEN |
| BUG-011 | **`Math.random` in `sidebar.tsx:635`** — skeleton width shimmer | `components/ui/sidebar.tsx` | Cosmetic; replace with deterministic width or keep — honesty-audit note only | OPEN (cosmetic) |
| BUG-012 | **`saveSchema` optional entity fields remain `unknown`** | `persistence/saveSchema.ts` — load-bearing fields + referential integrity enforced (R4); optional fields unchecked | Deeper optional-field validation if save-corruption reports appear | STANDING DEBT |

## P3 — Hygiene / cosmetic

| ID | Finding | Evidence | Suggested fix | Status |
|---|---|---|---|---|
| BUG-013 | **139-file Prettier drift** — `format:check` red repo-wide | measured 2026-11-03 | One dedicated `bun run format` commit + add `format:check` to CI to prevent recurrence | OPEN |
| BUG-014 | **~75 lucide JSX usages lack explicit `aria-hidden`/`aria-label`** | grep census; convention enforced only where test-locked (decorativeIcons*.test.tsx) | Systematic a11y sweep: decorative → `aria-hidden`, interactive icon-buttons → `aria-label`; extend test locks | OPEN |
| BUG-015 | **Snapshots test emits SaveLoad-timeout stderr** | `snapshots.test.ts` workerless jsdom → 30 s request timeout → console.error | Benign noise; optionally mock `persistenceService` in the test to silence + speed it up | OPEN (cosmetic) |
| BUG-016 | **Untracked `.npmrc` in working dir** | `git status` — local registry config | Keep untracked (never commit); optionally add to `.gitignore` to make it explicit | OPEN |

## Process notes (non-code)

- **Bots still active:** Jules re-pushed a branch after Round-5 cleanup; dependabot now proposes weekly bumps post-ecosystem-fix. Recurring branch/PR cleanup or bot deactivation may be desired.
- **Dependabot majors deferred:** #941–#945 (vite 5→8, electron 33→45, @types/node 22→26, react-resizable-panels 2→4, globals 15→17) closed as breaking majors — each needs a dedicated migration PR, not a blind merge.
- **e2e/bench:** last run locally in R3; R5 relied on CI (ubuntu) as the authoritative gate.

---

## Fixed in Round 5 (record — do not reopen)

| Item | Fix |
|---|---|
| Merge-conflict markers committed to `main` (`decorativeIcons.app.test.tsx`) — broke all new-branch CI | Resolved to HEAD side, `9e4b6b3c` |
| `dependabot.yml` `package-ecosystem: ""` (silently inert) | → `"bun"` |
| `CeremonyRunner` `as unknown as` (last non-dispatch cast) | `newAwards?: Award[]` declared on `IndustryUpdateImpact.payload` |
| 10 zero-reference components | deleted (Icons, Stack, Section, ProgressIndicator, RadarChart, SkeletonCard, SparklineChart, TalentAttachmentPanel, TalentGanttChart, TimeSeriesChart) |
| 12× `pathSecurity` Windows EPERM | symlink probe + `describe.skipIf` |
| `stress_determinism` 300 s timeout | → 600 s (passed at 461 s, bit-identical) |
| 14 decorative icons missing `aria-hidden` | PRs #927/#928/#940 integrated + test-locked |
| Electron unrestricted permissions | deny-all request + check handlers on both sessions |
| `codebase_audit.md` `studio.internal` drift | re-synced to deprecated status |

## Resolved in earlier rounds (spot-checked, stays resolved)

- `selectBoxOfficeData` `Math.random` selector — deleted in R3/R4 dead-code purge.
- `STRATEGY_CHOICE` modal type — removed; `CASTING_CONSTRAINT` implemented.
- `studio.internal` mirror — deprecated, never written.
