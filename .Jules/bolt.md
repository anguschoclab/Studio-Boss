## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.
## 2024-11-04 - Optimize state impact accumulation
**Learning:** Using `Array.prototype.reduce` for state accumulation in high-frequency game loop functions (like `applyImpacts`) causes measurable callback allocation overhead and execution time delays.
**Action:** Use a traditional `for` loop instead of `reduce` for iterating over impacts to minimize overhead and improve execution speed.
