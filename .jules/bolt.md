
## $(date +%Y-%m-%d) - Optimization of Nielsen Snapshot Aggregation
**Learning:** Chaining multiple `.reduce()` operations to calculate separate averages (like `avgHH`, `avgDemo`, `avgViewers`, `peak`, and `avgDvrLift`) on an array of Nielsen snapshots inside `nielsenSystem.ts` results in unnecessary multiple O(N) array iterations. This is particularly inefficient for systems called repeatedly per project during high-frequency simulation ticks (e.g., `tickTelevision`).
**Action:** Consolidate multiple aggregate calculations into a single `for` loop pass over the array to compute `sumHH`, `sumDemo`, `sumViewers`, track the `peak`, and compute `sumDvrLift` simultaneously.

## 2025-02-28 - Optimization of Nielsen Snapshot Aggregation
**Learning:** Chaining multiple `.reduce()` operations to calculate separate averages (like `avgHH`, `avgDemo`, `avgViewers`, `peak`, and `avgDvrLift`) on an array of Nielsen snapshots inside `nielsenSystem.ts` results in unnecessary multiple O(N) array iterations. This is particularly inefficient for systems called repeatedly per project during high-frequency simulation ticks (e.g., `tickTelevision`).
**Action:** Consolidate multiple aggregate calculations into a single `for` loop pass over the array to compute `sumHH`, `sumDemo`, `sumViewers`, track the `peak`, and compute `sumDvrLift` simultaneously.
