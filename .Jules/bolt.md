## 2024-05-24 - Optimize array iterations in releaseSimulation
**Learning:** Chaining `.reduce` and `.find` array methods over `attachedTalent` inside `calculateReviewScore` causes redundant iteration and intermediate evaluations. In highly active loops, this creates unnecessary overhead. Consolidating array traversals into a single pass reduces O(2N) to O(N).
**Action:** Replace multiple chained array operations (like `.reduce` for sums and `.find` for searches) with a single `for` loop pass when calculating aggregated metrics from arrays.
