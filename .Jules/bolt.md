# Bolt's Journal

## 2025-03-09 - [Reduce Object Allocation Overhead]
**Learning:** In hot loops like `runAwardsCeremony` operating over large arrays (like `state.projects`), array reduction `[].reduce()` creating and returning intermediate objects or doing destructuring assignment has a measurable overhead.
**Action:** Replace `reduce()` object grouping passes with simple `for` loops allocating into separate arrays directly for a ~3.2x performance gain, while keeping code readability high.

## 2025-03-09 - [Eliminate O(N^2) Array Scans in Simulation Loops]
**Learning:** Hot game loops simulating independent entities (like projects) often pass the full `GameState` into helper functions. Helper functions (like `processDirectorDisputes`) that perform `.find()` lookups on global arrays (like `contracts` and `talentPool`) within these project loops create hidden O(N*M) performance bottlenecks. In a benchmark environment, this severely limits scaling.
**Action:** When iterating over entities in a hot loop, do not pass the full global state to helpers. Instead, pre-compute O(1) Lookup Maps (e.g., `talentPoolMap`) and pre-filter relevant sub-arrays (e.g., `projectContracts`) outside the loop, and pass those highly focused, optimized data structures as arguments.
