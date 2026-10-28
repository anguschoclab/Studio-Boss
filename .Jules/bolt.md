## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.

## 2024-10-28 - Optimize array methods in high frequency game loops

**Learning:** Chaining array `.map()` and `.filter()` operations on arrays like `pacts` or `trends` causes unnecessary iterations and intermediate array allocations, resulting in GC pressure and reduced performance in the engine tick.
**Action:** Replace sequential array transformations with a single O(N) `for` loop that performs mapping and filtering concurrently to avoid allocating intermediate arrays.
