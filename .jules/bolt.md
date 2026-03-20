## 2024-05-18 - [Optimize map().filter() to reduce()]
**Learning:** Replaced inefficient arrays chaining operations such as `map().filter()` with a single `reduce()` operation to save iterations and avoid unnecessary array allocations. Also discovered a bug where `contractsByProject.has(talent.id)` incorrectly used the project ID keyed `Map` for talent verification, fixing it with an O(1) active `Set` of talent IDs instead.
**Action:** Consolidate chains of mapping and filtering into a single loop via reduce() to boost performance in core loop components and rigorously double check the data shapes of Map inputs vs checks.

## 2024-05-18 - [Optimize multiple array filters/maps into single reduce pass]
**Learning:** Replaced multiple chained iterations (e.g., `filter()` then another `filter()` then a `map()`) inside heavily-called game engine loops like `runAwardsCeremony` with a single O(n) pass using `reduce`. This avoids intermediate object allocation and significantly reduces the big-O constant factor, delivering ~4.4x speedup on a single feature benchmark.
**Action:** When evaluating grouped criteria across large arrays (like formatting types or statuses), prefer a single pass `reduce` structure, or standard iteration with `for`, rather than stacking functional array methods.
