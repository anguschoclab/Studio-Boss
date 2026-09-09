## 2026-09-09 - Avoid filter-reduce chains for array aggregates
**Learning:** Chaining `.filter().reduce()` over game state arrays (like `market.buyers`) allocates intermediate arrays which causes garbage collection overhead in tick-based systems.
**Action:** Combine the filter and reduce logic into a single direct `for` loop pass, computing multiple aggregates simultaneously where applicable.
