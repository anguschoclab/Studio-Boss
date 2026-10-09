## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.

## 2024-10-09 - Avoid Object.values() in unmemoized selectors
**Learning:** Using `Object.values()` inside an unmemoized selector function like `selectFatigueForAsset` creates unnecessary intermediate array allocations on every invocation, causing O(N) memory overhead and increasing GC pressure.
**Action:** Replace `Object.values()` with a prototype-guarded `for...in` loop to iterate directly over the object without allocating a new array.
