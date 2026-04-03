## Performance Optimizations

### Deals System (`advanceDeals`)
- Transformed O(N) map + O(N) filter into a single O(N) `for` loop in `advanceDeals`.
- Reduced memory allocations by eliminating the intermediate mapped array.
- Measured a ~21% reduction in execution time for heavy loads (100k items, 100 iterations) from ~849ms to ~669ms.
## 2026-03-31 - Iterate over State Records using for...in loops
**Learning:** Using Object.values() on high-frequency State Records (like projects) causes O(N) array allocation per tick, leading to garbage collection spikes.
**Action:** Replace Object.values() with for...in loops when iterating over high-frequency State Records in the engine to avoid O(N) array allocation overhead.

## 2024-04-02 - Avoid Object.values in Engine Loops
**Learning:** Using Object.values() on large state dictionaries like talentPool inside high-frequency engine loops causes unnecessary O(N) array allocation and garbage collection pressure every tick.
**Action:** Iterate over dictionary records using for...in to avoid array allocation overhead.

## 2025-01-20 - Optimize Studio Core Loop
**Learning:** Replacing O(N) array filtering with O(1) Map lookups and `for...in` iteration prevents GC spikes during weekly simulation ticks.
**Action:** Refactored `productionEngine.ts`, `finance.ts`, and `selectors.ts` to pre-calculate lookup maps, eliminate inline allocations, and replace `reduce` with `for` loops.
