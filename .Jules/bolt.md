## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.
## 2024-10-23 - Single-Pass Aggregation in Finance Loops
**Learning:** Chaining multiple iterations (e.g., `.filter()` followed by multiple secondary loops like `.forEach()`) in high-frequency functions creates severe garbage collection pressure from intermediate array allocations and O(3N) execution times.
**Action:** Always combine derived UI or state metric calculations into a single `for` loop pass to eliminate temporary arrays and callback overhead.
