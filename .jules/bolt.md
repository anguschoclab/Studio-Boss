## ⚡ Bolt Optimization: O(N*M) Reduction in Razzies Processing

**Target:** `src/engine/systems/processors/processWorldEvents.ts`

**Issue:**
During Razzie week (every 52nd week), the `processWorldEvents` processor iterates through the entire `industry.talentPool` to check if a talent won a Razzie. Inside this loop, if a talent won, it executed an `O(N)` `.find()` against `studio.internal.projects` to fetch the first cult classic project and apply a crisis to it.
Because `.includes()` and `.find()` were used in the loop, the algorithm had O(T * R + W * P) complexity (where T=talent count, R=razzie winner count, W=winners found, P=project count). For large states, this scales poorly.

**Solution:**
1. Extracted the `relatedProject` lookup using `.find()` OUTSIDE the talent iteration loop, executing it precisely once in `O(P)` time.
2. Pre-indexed `razzies.razzieWinnerTalentIds` and `razzies.cultClassicProjectIds` into `Set`s, providing O(1) `.has()` lookups during iteration rather than O(R) `.includes()` lookups.

**Benchmark:**
Simulated with 5000 projects, 10,000 talent pool members, 100 Razzie winners, 1000 iterations.
* **Baseline:** ~17476ms
* **Optimized:** ~774ms
* **Result:** ~22.5x speedup (~95.5% reduction in execution time for the modified block).
