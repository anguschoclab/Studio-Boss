## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.

## 2024-11-20 - Avoid Multiple Iterations on Historical Arrays

**Learning:** Using multiple `.reduce()` operations after a `.filter()` on large historical arrays (like `revenueHistory`) causes redundant O(N) passes and intermediate array allocations.
**Action:** Replace `.filter().reduce()` chains with a single `for` loop to compute multiple aggregate values concurrently without temporary array allocations.
