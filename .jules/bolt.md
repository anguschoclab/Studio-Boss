## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.
## 2026-10-10 - Optimize RivalRevenueCalculator loops
**Learning:** Chaining .filter() and multiple .reduce() operations on arrays creates unnecessary intermediate array allocations and redundant iteration passes, increasing garbage collection overhead.
**Action:** Combine these operations into a single O(N) for-loop to calculate multiple aggregates concurrently without temporary arrays.
