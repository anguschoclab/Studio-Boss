## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.

## 2024-11-20 - Array Method Chaining in Tick Loops

**Learning:** Chaining array methods like `.filter()`, `.map()`, and `.forEach()` on the same array during high-frequency game ticks causes significant unnecessary iterations and intermediate array allocations, compounding garbage collection overhead.
**Action:** When performing multiple transformations or side-effects on an array within a game tick, use a single `for` loop to compute all aggregates, transformations, and side-effects in an O(N) pass, completely eliminating intermediate array allocations.
