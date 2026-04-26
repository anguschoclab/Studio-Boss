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
## 2024-05-18 - Pre-grouping arrays for O(1) retrieval
**Learning:** Nested iterations matching items by ID (e.g. O(Projects * Contracts) complexity) create large performance bottlenecks, especially since Array.filter() allocates a new array each loop.
**Action:** Pre-group items using a `Record` or `Map` before iterating, reducing complexity to O(N+M) and minimizing GC pressure by eliminating inner-loop array allocations.
## 2026-04-26 - Eliminate multiple .filter() array allocations using a single loop pass
**Learning:** Chaining `Object.values().filter()` creates unnecessary intermediate array allocations per tick, significantly increasing memory overhead and GC pressure when iterating over large datasets like the global projects entity record.
**Action:** Replace `Object.values().filter()` operations with a single `for...in` loop to traverse records directly and push matching entities into results arrays in a single pass.
