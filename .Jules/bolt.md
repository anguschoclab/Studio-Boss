## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.
## 2026-10-20 - Prevent unnecessary Set and map allocations for existence checks
**Learning:** Initializing a Set using `array.map()` to check for a single item's existence creates redundant array allocations and iterates unnecessarily. In high-frequency code like impact handlers, this causes garbage collection pressure.
**Action:** Replace `new Set(array.map(...))` with a direct `for` loop for O(N) time complexity with early exit, and O(1) space complexity.
