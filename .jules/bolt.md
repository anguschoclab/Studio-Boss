
## 2024-04-19 - Consolidated Loops in Weekly Tick Metrics
**Learning:** In the weekly tick hot path (`MetricsCollector.ts`), having separate loops that iterate over `Object.values(state.entities.projects)` with chained `.filter().reduce()` operations creates immense garbage collection pressure and O(n) array allocations for every simulation tick.
**Action:** Always fuse iterations into a single O(n) loop over collections when calculating multiple aggregate metrics, manually tracking counts and sums inside the unified loop.
