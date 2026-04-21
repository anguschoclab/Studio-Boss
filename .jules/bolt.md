## 2025-02-18 - Optimize project metric calculations
**Learning:** In performance-critical hot paths like the simulation's weekly `record` method (`MetricsCollector.ts`), avoid using `Object.values(dict).filter(...).reduce(...)` or multiple `.filter(...).reduce(...)` which creates redundant iterations and intermediate array allocations.
**Action:** Consolidate these operations into a single loop (e.g., `forEach`) and cache `Object.values(dict)` to minimize CPU usage and garbage collection pressure.

## 2026-04-20 - Consolidate loop iterations in simulation hot paths
**Learning:** In performance-critical simulation tick methods like `MetricsCollector.record`, multiple successive iterations over the same collection (e.g. `allStudios.forEach`) can cause significant CPU overhead and GC pressure. Redundant tracking logic for subsets of data can often be merged into a single pass.
**Action:** Always combine conditional filtering and metrics aggregation into a single primary `forEach` or `for` loop over the largest dataset.
