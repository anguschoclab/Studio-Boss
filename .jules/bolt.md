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
## 2026-05-23 - Replace O(N) array search inside mapping loop with O(1) dictionary lookup
**Learning:** Using `Object.values(state.entities.projects).find()` inside a mapping function over high-frequency state objects (like `state.ip.vault.map()`) creates O(N*M) time complexity and massive garbage collection pressure by regenerating and searching arrays on every iteration.
**Action:** Replace `Object.values(projects).find(p => p.id === id)` with a direct `for...in` loop to iterate or standard O(1) dictionary lookup (`state.entities.projects[id]`) when possible to eliminate the nested iteration and intermediate array allocations.

## 2026-05-23 - Optimize ProductionEnhancementSystem Array Allocations
**Learning:** Functions like `getProjectQualityBonus`, `generateScreenplayNotes`, and `tickProductionEnhancementSystem` in `ProductionEnhancementSystem.ts` were performing multiple `Object.values()` calls coupled with `.filter()`, `.map()`, and `.reduce()` on high-frequency state records (contracts, enhancements, projects). Given these functions run every tick for active projects, these intermediate array allocations caused compounding garbage collection spikes during core loops.
**Action:** Replaced these chains with direct `for...in` loops. By interacting with the record's keys directly, O(N) memory allocations were entirely eliminated in these hot paths, reducing GC load and overall tick duration.

## 2026-05-03 - Extracted TalentProfileModal components
**Learning:** `TalentProfileModal.tsx` grew to 470+ lines due to dense tabs content, decreasing maintainability.
**Action:** Extracted inner Tab content blocks into dedicated smaller sub-components (`BioTab`, `StatsTab`, `KnownForTab`, and `FilmographyTab`) under `src/components/talent/tabs/`. This separation of concerns improves component readability and maintainability.
## 2026-05-25 - Replace Object.values with for...in loops in MarketingPromotionSystem.ts
**Learning:** `MarketingPromotionSystem.ts` was doing multiple `Object.values()` calls with `.filter()` on state records (talents, projects, contracts). It runs on every tick and creates an intermediate array, which adds memory allocation and garbage collection overhead. Furthermore, doing this lookup of contracts by filtering inside an outer iteration loop creates an O(Projects * Contracts) complexity loop.
**Action:** Replace `Object.values(state.entities...)` with `for...in` loops in `MarketingPromotionSystem.ts` and pre-group `contractsByProject` to reduce O(N*M) lookups.
## 2026-05-26 - Reduce AI Bidding Engine Loop GC Spikes
**Learning:** Found high-frequency array allocation due to `Object.values` and chained methods (`.reduce`) being called on nested properties inside double loops in `biddingEngine.ts`.
**Action:** Replace `Object.values` chained functions with `for...in` loops to eliminate intermediate array GC spikes in `tickAuctions`.
## 2025-05-26 - Eliminate intermediate array allocations in IndustryUpstarts
**Learning:** `IndustryUpstarts.ts` was performing `Object.values(state.entities.rivals || {})` and then immediately calling `.length` and `.map(r => r.name)` on the result. Given this function runs frequently in the engine tick loop, these intermediate array allocations caused compounding garbage collection spikes.
**Action:** Replaced `Object.values()` and `.map()` with a direct `for...in` loop to populate the `usedNames` Set and count the total active rivals simultaneously, eliminating O(N) array allocation overhead.
## 2026-05-27 - Replace Object.values with for...in loops in AI Motivation Engine
**Learning:** Iterating over high-frequency state records (like rivals and projects) using `Object.values()` coupled with array methods (`forEach`, `filter`) in `motivationEngine.ts` creates intermediate O(N) array allocation overhead per tick. Doing this inside an outer loop creates O(N*M) complexity and compounding GC spikes.
**Action:** Replaced `Object.values()` chains with direct `for...in` loops in `tickAIMinds` to iterate over state entities efficiently without creating intermediate arrays.
## 2026-05-26 - Replace O(N log N) sorts and array chain allocations with O(N) single-pass maximum find
**Learning:** Finding the maximum or best matching element (like finding a rescue acquirer in `DistressCascade`) using `Object.values().filter().sort()[0]` creates O(N) array allocations and an O(N log N) sort overhead on every tick.
**Action:** Replace `Object.values().filter().sort()` chains when only the single top candidate is needed by using a direct `for...in` loop to track the maximum value in a single O(N) pass, reducing time complexity and eliminating GC pressure.
## 2026-05-27 - Delay Cloning Expensive State Objects Until Affected Elements Are Found
**Learning:** `handleScandalAdded` in `industryHandlers.ts` was doing a shallow clone of the entire `state.entities.projects` dictionary unconditionally, even if the scandal involved a talent with zero active contracts. This caused huge memory allocation/GC overhead per scandal impact. Furthermore, iterating contracts to collect duplicate project IDs, followed by re-iterating project IDs, is inefficient.
**Action:** Replaced `Object.values` and unneeded full object clones by using a `for...in` loop to collect affected project IDs in a `Set`. `projects` is only cloned if `projectIds.size > 0`. This optimization dropped execution time for unmatched scandals from ~1222ms to ~796ms, and from ~2223ms to ~1154ms for matched scandals in benchmarks.
