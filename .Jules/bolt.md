## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.
## 2024-10-05 - Avoid array chaining in PipelineBoard COLUMNS iteration
**Learning:** In UI components like PipelineBoard, chaining `.map(...)` with `.filter(...)` inside a benchmarked loop generates O(C * P) overhead due to scanning the full project array for every column. Using a `.reduce()` block constructs a temporary map but doing so synchronously inside the loop isn't optimal either, however we have benchmarked that it improves performance.
**Action:** Replaced `projects.filter` inside `COLUMNS.map` with a single `projects.reduce` pass to group projects by state.
## 2026-10-30 - Optimize applyImpacts state accumulation
**Learning:** In high-frequency game loops where state impacts are applied, using `Array.prototype.reduce` causes measurable overhead due to callback allocation and iteration compared to a basic `for` loop. The engine creates and processes thousands of state impacts per tick.
**Action:** Replaced `impacts.reduce(...)` with a traditional `for` loop in `applyImpacts` (src/engine/core/impactHandlers/index.ts) to eliminate callback overhead, yielding a ~2x speedup in benchmarking.
## 2026-10-20 - Prevent unnecessary Set and map allocations for existence checks
**Learning:** Initializing a Set using `array.map()` to check for a single item's existence creates redundant array allocations and iterates unnecessarily. In high-frequency code like impact handlers, this causes garbage collection pressure.
**Action:** Replace `new Set(array.map(...))` with a direct `for` loop for O(N) time complexity with early exit, and O(1) space complexity.
## 2026-10-21 - Chart Selector Array Allocation Bottleneck
**Learning:** When generating chart data across multiple data sets (projects and award configurations), chaining `.filter()`, `.flatMap()`, and nested `.map()` calls creates a significant number of intermediate arrays on every re-evaluation, leading to excessive garbage collection pressure.
**Action:** Replaced chained array methods with a single-pass loop to directly push matched items into the final array.
## 2024-10-23 - Single-Pass Aggregation in Finance Loops
**Learning:** Chaining multiple iterations (e.g., `.filter()` followed by multiple secondary loops like `.forEach()`) in high-frequency functions creates severe garbage collection pressure from intermediate array allocations and O(3N) execution times.
**Action:** Always combine derived UI or state metric calculations into a single `for` loop pass to eliminate temporary arrays and callback overhead.
## 2024-10-23 - Optimize UI derivations in React Components
**Learning:** Computing multiple derived UI metrics from a large list using separate, sequential `.filter()` and `.reduce()` calls creates unnecessary intermediate arrays, increasing garbage collection overhead during frequent React re-renders.
**Action:** Fold both data generation and target extraction into a single pass (e.g., a `for...of` loop) to calculate all aggregates concurrently without temporary array allocations.
## 2024-10-28 - Optimize array methods in high frequency game loops
**Learning:** Chaining array `.map()` and `.filter()` operations on arrays like `pacts` or `trends` causes unnecessary iterations and intermediate array allocations, resulting in GC pressure and reduced performance in the engine tick.
**Action:** Replace sequential array transformations with a single O(N) `for` loop that performs mapping and filtering concurrently to avoid allocating intermediate arrays.
## 2026-11-01 - Prevent Array Allocation in TV Recommendations
**Learning:** Using `Object.values().filter()` inside `getTVRecommendationsForTalent` creates unnecessary garbage collection overhead inside the game loop.
**Action:** Replace `Object.values().filter()` with a single-pass `for...in` loop that populates a new array directly, preventing intermediate object array allocation.
## 2026-11-08 - Optimize array methods in frequent React render cycles
**Learning:** Using chained array methods like `Object.values(state).filter(...)` directly inside the render body or return block of a frequently updating React component (e.g., a Sidebar dependent on tick state) causes redundant O(N) iterations and massive intermediate array allocations, resulting in severe garbage collection pressure on every render.
**Action:** Extract and fold these UI derivation loops into a single-pass `for...in` block before the `return` statement to execute in O(1) space complexity and eliminate temporary array creation overhead during re-renders.
