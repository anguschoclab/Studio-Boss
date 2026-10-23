## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.

## 2024-10-23 - Optimize UI derivations in React Components

**Learning:** Computing multiple derived UI metrics from a large list using separate, sequential `.filter()` and `.reduce()` calls creates unnecessary intermediate arrays, increasing garbage collection overhead during frequent React re-renders.
**Action:** Fold both data generation and target extraction into a single pass (e.g., a `for...of` loop) to calculate all aggregates concurrently without temporary array allocations.
