## 2024-05-24 - [Framerate Optimization: Memoization and Set/Map Refactoring]
**Learning:** Found unnecessary React re-renders due to Zustand's strict equality checks missing inner field stability. Also identified O(n^2) and redundant O(n) array lookups in core loops causing excessive garbage collection pressure.
**Action:** Implemented `useShallow` with `useGameStore` in React dashboard panels (`PipelineBoard.tsx`, `FinancePanel.tsx`). Also refactored repetitive array `.find()` logic into single O(n) scans and O(1) map precomputations in `RevenueProcessor.ts`, `finance.ts`, and `willingnessEngine.ts`.
## 2024-05-16 - O(1) Dictionary Lookup for Zustand State
**Learning:** The state tree uses dictionary structures (`Record<string, Project>`). Iterating over `Object.values` just to do a `findIndex` based on ID is an anti-pattern that creates unnecessary O(N) array allocations and O(N) search times.
**Action:** Always use direct O(1) property access (e.g. `projects[id]`) when looking up items by their primary key in Redux/Zustand slice reducers.
## 2025-02-12 - Core Loop Refactoring: Pre-computed Maps & Direct Iteration
**Learning:** Heavy O(N) array loops (like `.find()`, `.map()`, `.forEach()`) executed on hot paths within the `WeekCoordinator` orchestrator (like the awards ceremony logic) introduced severe GC pressure and O(N) linear search regressions inside inner loops. Even `Object.values(projects)` was creating substantial intermediate object graphs.
**Action:** Substituted `.find()` with an O(1) dictionary lookup by pre-computing a fast reference map (`projectToRivalMap`) ahead of inner iteration paths. Used native `for` loops in place of map/forEach to preserve memory references and stop GC chug in tightly-wound simulation phases.
- **festivals:** Replaced O(S * R * P) dictionary array filtering with a pre-computed O(R * P + S) map for rival projects lookup in the festival auction engine.
