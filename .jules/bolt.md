## 2026-09-28 - Avoid Object.values() allocations in frequent selectors
**Learning:** Using `Object.values()` inside selector functions that evaluate derived stats (like `selectFatigueForAsset`) creates intermediate arrays, causing unnecessary garbage collection pressure, especially when calculating properties for lists of items.
**Action:** Iterate over entity records directly using a prototype-guarded `for...in` loop to compute aggregated metrics without temporary array allocations.
