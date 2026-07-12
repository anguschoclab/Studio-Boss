# Delete Zombie UI & Repo Cruft — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the unreachable `src/components/hubs/` UI tree and the accumulated repo-root cruft (sim logs, fix scripts, lint dumps) so bugs have fewer places to hide and the type-error/crash surface shrinks.

**Architecture:** Deletion is destructive, so every removal is gated by a grep proving the target is unreferenced, then verified by typecheck + the all-tabs E2E smoke test (no error count should rise, no tab should break). The live dashboard renders only `src/pages/Dashboard.tsx` → `CommandCenter`, `PipelineBoard`, `IPVault`, `DistributionHub`, `RivalsPanel`, `TalentHub` (from `components/talent`), `FinancePanel`, `DiscoveryBoard`, `BookmarksBoard`. Nothing under `src/components/hubs/` is in that graph.

**Tech Stack:** TypeScript, React, Vite, Vitest, Playwright, git.

> **Dependency:** Run the _Runtime Crash Sweep_ plan first — its Task 5 E2E smoke test (`e2e/all_tabs_render.spec.ts`) and `typecheck` script are the verification harness this plan relies on. If that plan hasn't run, create the `typecheck` script (Crash-Sweep Task 1) before starting.

---

## File Structure

| Target                                                                                                                                                                            | Responsibility                                  | Change                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| `src/components/hubs/**`                                                                                                                                                          | Parallel/dead dashboard + visualization screens | **Delete entire directory**                      |
| Repo-root cruft (`simulation-results-v*.txt`, `fix_*.cjs`, `fix_*.ts`, `benchmark*.ts`, `lint_*.txt`, `lint_*.json`, `*_test_results.txt`, `failures.log`, `all_files.txt`, etc.) | Throwaway logs/scripts from prior AI iteration  | **Delete**                                       |
| `.gitignore`                                                                                                                                                                      | Ignore rules                                    | Add patterns so logs/dumps can't be re-committed |

---

### Task 1: Prove the `hubs/` tree is unreachable, then delete it

`src/components/hubs/` contains 7 top-level screens (`StudioHQ`, `ExecutiveDashboard`, `IntelligenceHub`, `ProductionHub`, `StrategyPanel`, `CrisisTriageDashboard`, `TalentHub`) plus `hq/`, `intelligence/`, `production/`, `talent/`, and `visualizations/` subfolders. `StudioHQ` is imported by nothing; the others are imported only by `StudioHQ` or by nothing; and `visualizations/*` are imported only from within `hubs/`.

**Files:**

- Delete: `src/components/hubs/` (entire directory)

- [ ] **Step 1: Prove no file outside `hubs/` imports anything from `hubs/`**

Run:

```bash
grep -rn "components/hubs/\|from ['\"].*\/hubs\/" src --include="*.tsx" --include="*.ts" | grep -v "/hubs/"
```

Expected: **no output**. If any line appears, STOP — that importer must be migrated or the referenced file kept; do not proceed with the blanket delete. (As of writing, this is empty.)

- [ ] **Step 2: Prove no route or page lazy-loads a hub**

Run:

```bash
grep -rn "hubs" src/routes src/pages src/App.tsx
```

Expected: **no output**. If a route references a hub, STOP and reassess.

- [ ] **Step 3: Capture the pre-deletion typecheck error count (baseline)**

Run: `npm run typecheck 2>&1 | grep -c "error TS"`
Record the number (call it `BEFORE`). Deleting dead code must not _increase_ it.

- [ ] **Step 4: Delete the directory**

```bash
git rm -r "src/components/hubs"
```

- [ ] **Step 5: Verify typecheck error count did not increase**

Run: `npm run typecheck 2>&1 | grep -c "error TS"`
Expected: a number ≤ `BEFORE` (it should _drop_, since the deleted files had their own errors). If it increased, a kept file referenced a deleted one — investigate the new errors and restore only the specific referenced file.

- [ ] **Step 6: Verify the app still renders every tab**

Run: `npx playwright test e2e/all_tabs_render.spec.ts`
Expected: PASS (no tab regressed).

- [ ] **Step 7: Commit**

```bash
git commit -m "chore: delete unreachable src/components/hubs tree (zombie dashboard UI)"
```

---

### Task 2: Remove dead modal types orphaned by the deletion

Some `ModalType` values in `uiStore.ts` are only enqueued from now-deleted hub code. Removing them is optional cleanup, but leaving them is harmless. Only remove a modal type if BOTH its `enqueueModal('TYPE'` call sites AND its `ModalManager` case are gone.

**Files:**

- Modify: `src/store/uiStore.ts` (only if orphans confirmed)
- Modify: `src/components/modals/ModalManager.tsx` (only if orphans confirmed)

- [ ] **Step 1: List modal types with no remaining enqueue call site**

Run:

```bash
for t in CREATE_PACKAGE PACKAGE_DETAIL PACKAGE_DEAL_OFFERED FESTIVAL_MARKET DIRECTORS_CUT_AVAILABLE BIDDING_WAR BREAKOUT_BIDDING_WAR REBOOT_OPPORTUNITY UPFRONTS; do
  echo -n "$t enqueued: "; grep -rl "enqueueModal('$t'\|enqueueModal(\"$t\"\|modalType: '$t'\|modalType: \"$t\"" src --include="*.tsx" --include="*.ts" | grep -v ModalManager | wc -l | tr -d ' ';
done
```

Expected: a count per modal type. **Any type showing `0` is an orphan candidate.**

- [ ] **Step 2: For each orphan (count 0), remove its `ModalManager` case and lazy import, its `ModalType` union member, and its modal component file**

For an orphan named `ORPHAN_TYPE` whose component is `src/components/modals/OrphanModal.tsx`:

- In `src/components/modals/ModalManager.tsx`: delete the `const OrphanModal = React.lazy(...)` line and the `case 'ORPHAN_TYPE': return <OrphanModal .../>;` line.
- In `src/store/uiStore.ts`: delete the `| 'ORPHAN_TYPE'` union member.
- `git rm` the now-unreferenced component file (confirm with `grep -rn OrphanModal src` first — must be empty after the above edits).

> If Step 1 shows all types have ≥1 enqueue site (likely, since most are triggered from the engine via `MODAL_TRIGGERED`), this task is a no-op — skip to Task 3.

- [ ] **Step 3: Verify and commit (only if changes were made)**

Run: `npm run typecheck 2>&1 | grep -c "error TS"` (must be ≤ the count from Task 1 Step 5)
Then: `npx playwright test e2e/all_tabs_render.spec.ts` (PASS)

```bash
git add -A
git commit -m "chore: remove modal types orphaned by hubs deletion"
```

---

### Task 3: Delete repo-root cruft (sim logs, fix scripts, lint dumps)

The repo root holds ~40 throwaway files from prior AI iterations: per-version simulation dumps, one-off `fix_*` scripts, benchmark scratch files, and committed lint/test output.

**Files:**

- Delete (tracked and/or untracked) files matching the patterns below.

- [ ] **Step 1: Preview exactly what will be removed**

Run:

```bash
ls -1 | grep -iE "^simulation-results.*\.txt$|^fix_.*\.(cjs|ts|js|sh|patch)$|^benchmark.*\.ts$|^lint_.*\.(txt|json)$|^test_.*\.(txt|js|html|json|ts)$|^.*_test_results\.(txt|json)$|^full_test_results\.txt$|^final.*test.*\.txt$|^failures\.log$|^all_files\.txt$|^vitest\.json$|^vitest_output\.txt$|^extract_crises\.js$|^summarize_lint\.py$|^optimize_scandals\.patch$"
```

Expected: a list of cruft files (sim dumps, `fix_*`, `benchmark*`, `lint_*`, test result dumps, `failures.log`, `all_files.txt`). **Read the list.** If anything in it looks load-bearing (it should not), exclude that pattern before deleting.

- [ ] **Step 2: Remove them (handles both tracked and untracked)**

```bash
ls -1 | grep -iE "^simulation-results.*\.txt$|^fix_.*\.(cjs|ts|js|sh|patch)$|^benchmark.*\.ts$|^lint_.*\.(txt|json)$|^test_.*\.(txt|js|html|json|ts)$|^.*_test_results\.(txt|json)$|^full_test_results\.txt$|^final.*test.*\.txt$|^failures\.log$|^all_files\.txt$|^vitest\.json$|^vitest_output\.txt$|^extract_crises\.js$|^summarize_lint\.py$|^optimize_scandals\.patch$" \
  | while read -r f; do git rm --cached --ignore-unmatch "$f" >/dev/null 2>&1; rm -f "$f"; done
echo "removed"
```

- [ ] **Step 3: Verify the app still builds and tests still resolve**

Run: `npm run typecheck 2>&1 | grep -c "error TS"` (must be ≤ Task 1 Step 5 count)
Run: `npx vitest run src/test/store/restored-selectors.test.ts` (PASS — proves the test runner config wasn't depending on a deleted `vitest.json` scratch file; if it fails because `vitest.json` was a real config, restore that one file)

> Note: `vitest.config.ts` is the real config; `vitest.json` (244KB) is a committed results dump. Only `vitest.config.ts` must survive.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove repo-root cruft (sim dumps, fix scripts, lint/test output)"
```

---

### Task 4: Add `.gitignore` rules so cruft can't return

**Files:**

- Modify: `.gitignore`

- [ ] **Step 1: Append ignore patterns**

Add to the end of `.gitignore`:

```gitignore
# Throwaway analysis/scratch output (do not commit)
simulation-results*.txt
sim-reports/
fix_*.cjs
fix_*.ts
fix_*.js
fix_*.sh
fix_*.patch
benchmark*.ts
lint_*.txt
lint_*.json
lint_report.json
test_*.txt
*_test_results.txt
*_test_results.json
full_test_results.txt
final*test*.txt
failures.log
all_files.txt
vitest.json
vitest_output.txt
```

- [ ] **Step 2: Verify the patterns don't shadow real source**

Run: `git check-ignore -v src/engine/utils.ts vite.config.ts vitest.config.ts package.json`
Expected: **no output** (none of these real files are ignored).

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: gitignore throwaway sim/lint/test output"
```

---

## Self-Review Notes

- **Spec coverage:** zombie `hubs/` deletion (Task 1), orphaned modal cleanup (Task 2, conditional), root cruft removal (Task 3), regression prevention via `.gitignore` (Task 4).
- **Safety:** every deletion is preceded by a grep proving non-reference and followed by typecheck-count + E2E-render verification. The plan explicitly STOPs if a reference is found.
- **Known interaction:** Task 1 deletes `hubs/hq/MarketingWarRoom.tsx` and `hubs/visualizations/*`, which the Runtime Crash Sweep plan also touched. That's fine — deleting them removes the need for those fixes; the restored selectors (Crash Sweep Task 4) remain valid for any non-hub consumer and for re-introduction later.
- **Not deleted:** `src/components/talent/TalentHub.tsx` (the _live_ Talent tab) is a different file from `src/components/hubs/TalentHub.tsx` (zombie). Only the latter is removed by the `hubs/` delete.
