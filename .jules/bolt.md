## Performance Optimizations

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
## 2026-04-24 - Single-Pass Extraction with for...in
**Learning:** Chaining `.values().filter()` multiple times over the same entity collection causes compounded O(N) array allocation.
**Action:** Consolidate multiple collection subsets (like `series` and `airingShows`) into a single `for...in` loop to eliminate array allocation and nested pass complexity in hot paths.
