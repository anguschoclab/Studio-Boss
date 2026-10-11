## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.
## 2024-10-12 - Avoid Intermediate Array Allocations in High-Frequency Evaluation Functions
**Learning:** Evaluation functions like `evaluateVaultSynergy` and `roleCompletenessScore` are called frequently. Initializing sets with `new Set(array.map().filter())` creates O(N) temporary arrays per call, creating massive garbage collection spikes in the game loop.
**Action:** Avoid chaining array methods when initializing Sets in game-loop evaluated functions. Use a single-pass `for` loop that directly calls `.add()` for valid items.
