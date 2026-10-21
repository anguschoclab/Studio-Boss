## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.

## 2026-10-21 - Chart Selector Array Allocation Bottleneck
**Learning:** When generating chart data across multiple data sets (projects and award configurations), chaining `.filter()`, `.flatMap()`, and nested `.map()` calls creates a significant number of intermediate arrays on every re-evaluation, leading to excessive garbage collection pressure.
**Action:** Replaced chained array methods with a single-pass loop to directly push matched items into the final array.
