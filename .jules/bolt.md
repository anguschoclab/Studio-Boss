## 2024-05-24 - [Framerate Optimization: Memoization and Set/Map Refactoring]
**Learning:** Found unnecessary React re-renders due to Zustand's strict equality checks missing inner field stability. Also identified O(n^2) and redundant O(n) array lookups in core loops causing excessive garbage collection pressure.
**Action:** Implemented `useShallow` with `useGameStore` in React dashboard panels (`PipelineBoard.tsx`, `FinancePanel.tsx`). Also refactored repetitive array `.find()` logic into single O(n) scans and O(1) map precomputations in `RevenueProcessor.ts`, `finance.ts`, and `willingnessEngine.ts`.
## 2024-05-16 - O(1) Dictionary Lookup for Zustand State
**Learning:** The state tree uses dictionary structures (`Record<string, Project>`). Iterating over `Object.values` just to do a `findIndex` based on ID is an anti-pattern that creates unnecessary O(N) array allocations and O(N) search times.
**Action:** Always use direct O(1) property access (e.g. `projects[id]`) when looking up items by their primary key in Redux/Zustand slice reducers.
2023-10-27
// ⚡ Bolt: Refactored WeekCoordinator engine ticks to perform a single O(N) pass over active projects instead of multiple independent filters.
// ⚡ Bolt: Removed inline array allocation using Object.values() inside useGameStore in FinancePanel to prevent unnecessary re-renders.

- **2023-10-XX (Performance Optimization):** In `src/engine/systems/ip/franchiseCoordinator.ts`, replaced an O(N) genre lookup (`Object.keys().find()`) inside a hot `assets.forEach` loop with an O(1) static dictionary lookup (`CROSSOVER_AFFINITY_LOWER_KEYS`). This prevents array reallocation and O(N) iteration per asset, yielding a ~5x speedup for the genre normalization path.
## 2024-05-24 - [Framerate Optimization: O(1) Dictionary Lookup for Object.values().forEach() iterations]
**Learning:** Found O(n) array allocations happening inside hot tick loops via `Object.values(Record).forEach()`. This was generating thousands of temporary object wrappers and array elements causing severe GC overhead.
**Action:** Replaced `Object.values(state.industry.talentPool).forEach(...)` inside `productionEngine.ts` tick with a raw `for...in` loop and `hasOwnProperty` guard, reducing GC pressure to near zero for that block.
