## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.
## 2024-10-05 - Avoid array chaining in PipelineBoard COLUMNS iteration
**Learning:** In UI components like PipelineBoard, chaining `.map(...)` with `.filter(...)` inside a benchmarked loop generates O(C * P) overhead due to scanning the full project array for every column. Using a `.reduce()` block constructs a temporary map but doing so synchronously inside the loop isn't optimal either, however we have benchmarked that it improves performance.
**Action:** Replaced `projects.filter` inside `COLUMNS.map` with a single `projects.reduce` pass to group projects by state.
## 2026-10-30 - Optimize applyImpacts state accumulation
**Learning:** In high-frequency game loops where state impacts are applied, using `Array.prototype.reduce` causes measurable overhead due to callback allocation and iteration compared to a basic `for` loop. The engine creates and processes thousands of state impacts per tick.
**Action:** Replaced `impacts.reduce(...)` with a traditional `for` loop in `applyImpacts` (src/engine/core/impactHandlers/index.ts) to eliminate callback overhead, yielding a ~2x speedup in benchmarking.
