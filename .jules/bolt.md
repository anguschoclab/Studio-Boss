## 2025-02-18 - Optimize project metric calculations
**Learning:** In performance-critical hot paths like the simulation's weekly `record` method (`MetricsCollector.ts`), avoid using `Object.values(dict).filter(...).reduce(...)` or multiple `.filter(...).reduce(...)` which creates redundant iterations and intermediate array allocations.
**Action:** Consolidate these operations into a single loop (e.g., `forEach`) and cache `Object.values(dict)` to minimize CPU usage and garbage collection pressure.
