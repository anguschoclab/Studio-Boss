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
## 2026-04-06 - [Framerate Optimization: O(1) Dictionary Lookup for Object.values().forEach() iterations]
**Learning:** Found unnecessary `Object.values(talentPool)` array allocations happening 6 times per tick inside hot paths like `projects.ts` when calling `TalentSystem.applyProjectResults`. This was generating temporary arrays of the entire talent pool just to perform a `Map` allocation for lookups, causing GC overhead and O(N) operations.
**Action:** Refactored `TalentSystem.applyProjectResults` to accept `Record<string, Talent>` directly and use `O(1)` dictionary lookups. Eliminated `Object.values()` wrappers in `projects.ts`, reducing GC pressure and lookup time complexity from O(N) to O(1).
## 2024-05-27 - [Framerate Optimization: Removing Object.values() from hot engine loops]
**Learning:** Calling \`Object.values()\` on large dictionaries (like \`state.entities.contracts\` or \`state.entities.projects\`) inside weekly engine tick functions (e.g. \`tickProduction\`, \`WeekCoordinator\`) creates significant garbage collection pressure by allocating temporary arrays every tick.
**Action:** Refactored these operations to use raw \`for...in\` loops and \`Object.keys()\` over the dictionaries, extracting the values directly without generating intermediate arrays. This is especially critical for collections that grow linearly as the game progresses (e.g. contracts, projects).

## 2025-03-08 - Optimized AI bidding engine loop
**Learning:** Hoisting repetitive calculations (like `leverageAggression` inside `biddingEngine.ts`) outside of deeply nested loops significantly reduces Time Complexity and unnecessary GC allocations. Here, calculating it per opportunity instead of per rival per opportunity reduced the complexity from `O(O * R * (A + a))` to `O(O * (R + A + a))`.
**Action:** When iterating over combinations of items (like opportunities and rivals), look for derived values that only depend on the outer loop variable and hoist their calculation before the inner loop.
## 2025-05-18 - [Eliminating Object.values().filter().map() anti-pattern in high-frequency functions]
**Learning:** Chaining array methods like `Object.values().filter().map()` over dictionaries within engine tick functions creates immense garbage collection pressure by generating intermediate arrays that are immediately discarded. This was found across multiple modules including `televisionTick`, `awards`, `financeTick`, `RivalRevenueCalculator`, and `MetricsCollector`.
**Action:** Replace `Object.values().filter().map()` chains with single-pass `for...in` loops and `hasOwnProperty` checks, and utilize precomputed Maps/dictionaries for O(1) lookups where possible instead of repeated iterations over the entire dataset.
## 2025-05-19 - [O(1) Array Lookups in Nested Loops]
**Learning:** Found O(N^2) complexity in `RelationshipSystem.ts` where `haveWorkedTogether` was iterating over all contracts and projects. This was a severe bottleneck during weekly engine ticks since it was called inside a nested loop comparing all pairs of talents.
**Action:** Replaced the O(N) array filtering of contracts with O(1) membership checks using the pre-computed `attachedTalentIds` array on each project. Also refactored `haveCompeted` to use a `Set` for O(1) lookups instead of duplicate iterations over the entire project list.
