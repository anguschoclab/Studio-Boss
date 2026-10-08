## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.

## 2024-10-06 - Avoid chaining map and filter for Set initialization
**Learning:** Using `array.map(...).filter(...)` to initialize a `Set` (or when dealing with `Object.values().filter().map()`) creates redundant intermediate arrays and iteration passes which increases GC pressure in high-frequency functions.
**Action:** Use a single-pass `for` or `for...in` loop that directly calls `.add()` on the `Set` for valid items to eliminate intermediate allocations and nested passes.
