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

## 2026-06-11 - Replace Object.values with for...in loops in RegulatorSystem

**Learning:** The RegulatorSystem was computing market share using `Object.values(state.entities.rivals).reduce()`, which caused unnecessary array allocation per call.
**Action:** Replaced `Object.values` with a direct `for...in` loop to iterate over the `state.entities.rivals` object and sum up the prestige, avoiding the O(N) intermediate array allocation and reducing GC overhead.

## 2026-05-28 - Optimize HeadlessController active project evaluation

**Learning:** Checking active player projects using `Object.values(state.entities.projects).filter(...)` in `HeadlessController.tick` creates an unnecessary `O(N)` array allocation and iteration overhead per simulated tick. Since the simulation loop only checks the aggregate length (`< 10`), generating and filtering the array is extremely inefficient.
**Action:** Replace `Object.values().filter()` chained methods with an in-place `for...in` loop and a simple counter to verify state without creating intermediate objects, reducing garbage collection spikes in hot loops.

## 2025-06-09 - [Awards Ceremony Optimization]

**Learning:**
I found that `runAwardsCeremony` was iterating over `state.entities.projects` multiple times, assuming it only held player projects, which led to pushing ALL projects (player and rival) to the eligibility arrays, then re-scanning and duplicating rival projects again while simultaneously building a short-lived `Map` object for lookup. It also had a logical bug where `!!state.entities.projects[bestProject.id]` was always true because the projects dictionary contains all projects (player and rival).
**Action:**
I eliminated the duplicate iterations and the `Map` construction entirely. The eligibility array is now correctly built in a single O(N) pass, and rival relationships are resolved dynamically using O(1) direct dictionary lookups on `state.entities.rivals` via `bestProject.ownerId`, reducing the benchmark processing time from ~85ms to ~49ms (approx. 42% performance boost).

## 2026-05-27 - Delay Cloning Expensive State Objects Until Affected Elements Are Found

**Learning:** `handleScandalAdded` in `industryHandlers.ts` was doing a shallow clone of the entire `state.entities.projects` dictionary unconditionally, even if the scandal involved a talent with zero active contracts. This caused huge memory allocation/GC overhead per scandal impact. Furthermore, iterating contracts to collect duplicate project IDs, followed by re-iterating project IDs, is inefficient.
**Action:** Replaced `Object.values` and unneeded full object clones by using a `for...in` loop to collect affected project IDs in a `Set`. `projects` is only cloned if `projectIds.size > 0`. This optimization dropped execution time for unmatched scandals from ~1222ms to ~796ms, and from ~2223ms to ~1154ms for matched scandals in benchmarks.

## 2024-05-18 - [Optimize Deep Path Update Cloning]

**Learning:** Deeply nested updates using string paths (e.g. `a.b.c.d`) were causing an excessive number of array/object spreads when many paths shared the same prefix. The old handler looped over paths and unconditionally cloned the hierarchy for every path, leading to O(N * D) clones and high garbage collection overhead.
**Action:** Introduced a `clonedRefs = new Set<unknown>([nextState])` cache locally within the batch update scope to check `!clonedRefs.has(nextTarget)` before spreading, reducing the allocations to O(N + D) for clustered path updates while maintaining strict immutability.

## 2024-06-13 - O(1) Pre-grouping in nested loops

**Learning:** When iterating over a large dictionary (like projects) and simultaneously needing to filter another large dictionary (like contracts) based on a foreign key relationship (`projectId`), calling `Object.values().filter()` inside the loop creates an O(M*N) bottleneck.
**Action:** Iterate through the child dictionary ONCE before the loop to group items into a map/record keyed by the foreign ID. This replaces the inner O(N) array allocation/filter with a fast O(1) property access, drastically reducing garbage collection and execution time.

## 2026-06-03 - Pre-group items in dictionary lookup to avoid O(N*M) loop performance overhead

**Learning:** `tickAgencies` was performing an `Object.values(state.entities.talents)` allocation per tick, and then filtering that array per agency inside an inner loop. This resulted in O(Agencies * Talents) operations on every tick, causing significant garbage collection pressure.
**Action:** Replace `Object.values` and inner `.filter()` array operations with a single-pass grouping `for...in` loop that clusters talents by `agencyId`. This drops the inner loop search to O(1) dictionary lookups for matching clients, drastically improving performance.

## 2026-05-28 - Avoid O(N*M) nested array creation inside AgentBrain tick loop

**Learning:** The `tickAgencies` function inside `src/engine/systems/ai/AgentBrain.ts` was doing `Object.values(state.entities.rivals || {})` and filtering all `allTalents` iteratively inside an `.forEach` loop over `state.industry.agencies`. This caused massive O(Agencies * Talents) and O(Agencies * Rivals) complexity and repeated array allocations inside a core game tick function.
**Action:** Pre-grouped talents by `agencyId` at the start of the function and cached `brands` array outside the agency loop. This avoids the O(N*M) penalty of regenerating arrays inside high-frequency iterations.

## 2024-05-18 - [Optimize Shingle System Count Deals]

**Learning:** Checking for entity counts inside deeply nested logic like bidder evaluations loops can degrade into O(N*M) or O(N^2) complexity, leading to enormous performance overhead in background simulations over hundreds of game ticks.
**Action:** When a loop requires aggregating counts of an entity type (e.g., `countDealsByStudio`), pre-aggregate the counts into a dictionary (O(N)) before the loop, converting the subsequent lookups into O(1) accesses.

## 2026-05-28 - Replace Object.values arrays with for...in loops in MetricsCollector and SimulationHarness

**Learning:** High-frequency metrics and snapshot reporting loops (like `MetricsCollector.record` and `SimulationHarness.run`) cause significant garbage collection pressure when calling `Object.values()` coupled with array methods (`filter`, `reduce`, `map`) to iterate over GameState entities, creating intermediate O(N) array allocation overhead per tick.
**Action:** Replace `Object.values` chained functions with direct `for...in` loops to iterate over state entities (`rivals`, `talents`, `projects`) efficiently without creating intermediate arrays, reducing time complexity and eliminating GC pressure.

## 2026-06-18 - Replacing Object.values spread with for...in

**Learning:** `Math.max(...Object.values(obj).map(...))` creates two intermediate arrays and places them into the spread operator arguments array, causing massive GC overhead during tight game simulation loops (like bidding ticks).
**Action:** Always refactor dictionary aggregate loops in game engine modules to use direct `for...in` manual aggregation to maintain O(N) speed with O(1) memory.

## 2026-06-15 - Replace Object.values arrays with for...in loops in getLiveCounterBid

**Learning:** `getLiveCounterBid` iterates over opportunity bids by creating arrays with `Object.values(opportunity.bids || {}).map(...)` and `Math.max(...)`. When called frequently inside the auction tick loops, this creates compounding garbage collection spikes.
**Action:** Replace `Object.values().map()` chains with direct `for...in` loops to iterate over opportunity bids efficiently without creating intermediate arrays.

## 2026-06-21 - Replace Object.values with for...in loops in TalentDiscoverySystem

**Learning:** `tickTalentDiscoverySystem` was generating arrays on every game tick by calling `Object.values()` coupled with array methods (`filter`, `map`) on state records (like `projects`, `contracts`, `talents`, and `guestStarBookings`). Iterating and filtering the `contracts` array for every project inside an outer loop caused an O(N*M) nested bottleneck that generated severe garbage collection spikes.
**Action:** Replaced `Object.values().filter()` chains with direct `for...in` loops. Additionally, pre-grouped `contracts` by `projectId` before entering the projects loop to convert O(N) internal array filters into O(1) dictionary lookups.

## 2026-06-25 - Replace Object.values arrays with for...in loops in WorldSimulator

**Learning:** High-frequency event generation loops like `tickWorldEvents` cause significant garbage collection pressure when calling `Object.values()` coupled with array methods (`forEach`) to iterate over GameState entities, creating intermediate O(N) array allocation overhead per tick.
**Action:** Replace `Object.values` chained functions with direct `for...in` loops to iterate over state entities (`projects`) efficiently without creating intermediate arrays, reducing time complexity and eliminating GC pressure.

## 2026-06-25 - Prevent nested array allocations during distress cascades

**Learning:** `DistressCascade` heavily filters entities to find buyers for assets during bankruptcy events (e.g. `stage1IPFireSale`, `stage2Liquidation`). Calling `Object.values(state.entities.rivals).filter()` sequentially creates multiple intermediate array garbage overheads. During game simulation loops, these allocations cause performance spikes.
**Action:** Replace `Object.values().filter()` chains with direct `for...in` loops to gather eligible entities (like buyers) into a single targeted array. Always wrap the logic inside an `Object.prototype.hasOwnProperty.call()` check to avoid prototype pollution and comply with static analysis.

## 2026-06-26 - Eliminate Object.values chained allocations in Zustand slices

**Learning:** Checking aggregate conditions in Zustand store slices (like finding genre saturation, aggressive rivals, or project contracts) by using `Object.values(state).filter()` creates unnecessary O(N) array allocation.
**Action:** Replace `Object.values().filter()` chained methods with in-place `for...in` loops to evaluate state without creating intermediate arrays, reducing garbage collection spikes.

## 2024-07-01 - Avoid Object.values() for Entity Dictionaries in Hot Loops

**Learning:** In the game state architecture, retrieving all entities (like contracts) via `Object.values(state.entities.X)` inside high-frequency game ticks (e.g. `advanceScandals`, `generateScandals`) allocates huge intermediate arrays causing severe Garbage Collection pressure and O(N) penalties.
**Action:** Iterate directly using `for...in` loops and explicitly access properties (e.g., `const id in dict; const item = dict[id];`) to drastically reduce overhead.

## 2026-06-28 - Optimize BiographyGenerator with pre-computed Sets and for...in loops

**Learning:** `tickBiographyGenerator` was calling `Object.values()` on talents, relationships, cliques, and scandals every tick, then using `.filter()` and `.some()` inside the talent loop — creating O(N*M) complexity and multiple intermediate array allocations per tick.
**Action:** Replaced `Object.values()` with `for...in` loops and pre-grouped recent relationship talent IDs, clique member IDs, and active scandal talent IDs into `Set<string>` for O(1) lookup per talent. Also removed unused imports (`TalentRelationship`, `BreakoutStar`, `TVShowRecommendation`), removed unused `BioSection` interface, and inlined `shouldUpdateBio` logic to eliminate the function call overhead.

## 2026-06-28 - Replace Object.values().find() with for...in in hasCreativeControl

**Learning:** `hasCreativeControl` in `directors.ts` used `Object.values(state.entities.contracts).find()` which allocates an intermediate array and performs a linear scan on every call. Since this function is called during production checks, this creates unnecessary GC pressure.
**Action:** Replaced with a `for...in` loop that iterates contracts directly and returns early on match. Added optional chaining on `roles?.includes("director")` for defensive null-safety.

## 2026-06-28 - Replace getTalentRelationships() calls with pre-computed friendsMap in CliqueSystem

**Learning:** `findPotentialCliques` in `CliqueSystem.ts` called `getTalentRelationships()` for every talent in the pool inside a nested loop, creating O(N*M) complexity where N is talent count and M is relationships per talent. Each call also allocated intermediate arrays for filtering and mapping.
**Action:** Pre-computed a `friendsMap` adjacency map (Map<string, Set<string>>) before the main loop, iterating the relationships array once. Replaced `getTalentRelationships()` calls with direct Map lookups. Used get-or-create pattern for Map entries. Added defensive `if (!center) continue;` check. Removed unused imports (`CliqueStatus`, `CliqueFormation`, `getTalentRelationships`). Also fixed pre-existing `TalentTier` bug: `m.tier === 1` → `m.tier === 'A_LIST'` in `calculateExclusivity`.

## 2026-06-28 - Replace Object.values() with for...in loops in DynastySystem

**Learning:** `checkPregnancies`, `processComingOfAge`, and `calculateDynastyReputation` all used `Object.values()` on the talents dict, creating expensive intermediate arrays. `processComingOfAge` also allocated an `existingNepoIds` Set via `.filter().map().flat()` that was never read.
**Action:** Replaced all `Object.values()` with `for...in` loops with `hasOwnProperty` guards. Removed dead `existingNepoIds` allocation. Replaced `.reduce()` and `.filter()` in `calculateDynastyReputation` with manual accumulators. Fixed `DeathEvent` import (was importing from `../../types` but is exported from `./DeathSystem`). Fixed all `TalentTier` numeric comparisons: `parent.tier > 2` → `parent.tier !== 'A_LIST' && parent.tier !== 'B_LIST'`, `parent.tier === 1` → `parent.tier === 'A_LIST'`, etc. Fixed `generateTalent` call signature: removed spurious `rng` first argument, changed `tier: 4` → `tier: 'NEWCOMER'`.

## 2026-06-28 - Fix TalentTier type mismatches across remaining codebase

**Learning:** Multiple files had `TalentTier` numeric comparisons (`tier === 1`, `tier <= 2`) and numeric assignments (`tier = 1`, `tier = 4`) despite `TalentTier` being a string union type. The `BreakoutStar` interface had `previousTier: number` and `newTier: number` instead of `TalentTier`. The `TIER_TRAJECTORY_CHANCES` map used numeric keys. All `tierBias` arrays in `talentArchetypes.ts` used numeric values. Test data in 4 test files used numeric tier values. `generateTalent` call in `TalentLifecycleSystem` had an extra `rng` argument. CliqueSystem's `findPotentialCliques` tried to iterate `relationships` with `for...of` but `state.relationships.relationships` is a `Record` (object), not an array.
**Action:** Fixed all numeric tier comparisons to string literal comparisons across `TalentLifecycleSystem.ts`, `MarketingPromotionSystem.ts`, `driftEngine.ts`, `DeathSystem.ts`, `BreakoutStarEngine.ts`, `BiographyGenerator.ts`, `GuestStarEngine.ts`, `selectors.ts`, `TalentDiscoverySystem.ts`. Changed `BreakoutStar.previousTier` and `newTier` from `number` to `TalentTier`. Fixed `BreakoutStarEngine` numeric tier assignments. Fixed `TalentLifecycleSystem` numeric tier assignments and `generateTalent` call signature. Replaced `TIER_TRAJECTORY_CHANCES` numeric keys with `TalentTier` string keys. Replaced all `tierBias` numeric arrays with `TalentTier` string arrays across all 30+ archetype definitions. Fixed test data in 5 test files. Fixed CliqueSystem to use `for...in` instead of `for...of` for relationships Record. Fixed test assertion for `TalentLifecycleSystem` decay test.

## 2024-07-13 - Replace Object.values().forEach() with for...in loop in FranchiseEvolution
**Learning:** In high-frequency game engine loops like `calculateFranchiseEvolutionImpacts`, calling `Object.values(state.entities.projects).forEach()` creates an intermediate array of all projects on every tick, generating massive Garbage Collection overhead as the project pool grows.
**Action:** Replace `Object.values(state.entities.projects).forEach()` with a direct `for...in` loop accompanied by a `hasOwnProperty` check. When doing so, ensure mandatory performance documentation is provided in inline code comments within the source file to satisfy review requirements.
