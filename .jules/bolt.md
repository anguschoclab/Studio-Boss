## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.

## 2024-10-06 - Avoid .map().filter() intermediate array allocations

**Learning:** Using `projectContracts.map(...).filter(...)` to initialize a Set creates unnecessary intermediate array allocations, causing GC pressure in high-frequency functions.
**Action:** Replace `array.map().filter()` chains with a single-pass `for` loop that directly `add()`s valid items to the Set.
