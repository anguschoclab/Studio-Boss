## 2025-04-18 - Optimized weekAdvance Performance Benchmark

### Deals System (`advanceDeals`)
- Transformed O(N) map + O(N) filter into a single O(N) `for` loop in `advanceDeals`.
- Reduced memory allocations by eliminating the intermediate mapped array.
- Measured a ~21% reduction in execution time for heavy loads (100k items, 100 iterations) from ~849ms to ~669ms.
## 2026-03-31 - Iterate over State Records using for...in loops
**Learning:** Using Object.values() on high-frequency State Records (like projects) causes O(N) array allocation per tick, leading to garbage collection spikes.
**Action:** Replace Object.values() with for...in loops when iterating over high-frequency State Records in the engine to avoid O(N) array allocation overhead.
## 2026-04-01 - Avoid nested O(N^2) iterations with Object.values/flatMap in loops
**Learning:** Combining \`Object.values\` and \`flatMap\` to create a unified array before an outer loop creates O(N^2) complexity and GC pressure because it executes the inner mapping operations across all entities every tick.
**Action:** Replace nested array creation and mapping before loops with a single pass aggregation using a \`for...in\` loop directly into a hash map before iterating, preventing O(N^2) complexity.
## 2026-04-25 - Replace redundant Array filter in O(N) loops with pre-computed lookup Records
**Learning:** Evaluating `contracts.filter(c => c.projectId === project.id)` inside a loop over projects creates O(Projects * Contracts) complexity.
**Action:** Pre-group contracts by `projectId` into a `Record<string, Contract[]>` before the loop to achieve O(Projects + Contracts) complexity. Measured ~25x improvement in `SchedulingEngine.tick` (from ~50ms to ~2ms for 500 projects and 5000 contracts).
## 2026-05-18 - Optimize WeekCoordinator Array Allocations
**Learning:** `WeekCoordinator.ts` was performing multiple `Object.values()` calls on the global `projects` and `rivals` dictionaries in every tick. Given the high frequency of this orchestration file, these intermediate array allocations caused compounding garbage collection spikes during core loops.
**Action:** Replaced sequential `Object.values().forEach()` and `Object.values().filter()` operations across `runProductionFilter`, `runIPFilter`, `runAIFilter`, and `runFinanceFilter` with direct `for...in` loops. By interacting with the record's keys directly, O(N) memory allocations were entirely eliminated in these hot paths, reducing GC load and overall tick duration.
## 2026-05-20 - Eliminate intermediate array allocations in Deals system
**Learning:** Functions like `countDealsByStudio` and `createShingle` in the Deals system (`ShingleSystem.ts` and `ShinglePitchRouter.ts`) were calling `Object.values()` coupled with `.filter()`, `.map()`, or `.some()` to process GameState records. This caused redundant intermediate array allocations that compound GC spikes.
**Action:** Replaced these chains with direct `for...in` loops in `ShingleSystem.ts` and `ShinglePitchRouter.ts` to process record entities directly, eliminating O(N) array allocation overhead.
## 2026-05-23 - Avoid array iteration inside mapping of large sets for lookups
**Learning:** In `IPVaultManager.ts`, evaluating IP vault assets requires checking the associated source projects. The original code used `Object.values(state.entities.projects).find(p => p.id === updatedAsset.originalProjectId)` TWICE inside a map of the entire vault, leading to O(N*M) complexity (vault size * project size) due to iterating over an array allocated per loop.
**Action:** Instead of iterating over `Object.values()` to find a project by ID, use direct property access on `state.entities.projects` dictionary (`state.entities.projects[updatedAsset.originalProjectId]`). This provides an O(1) lookup, dramatically reducing processing time during the weekly IP Vault tick.
