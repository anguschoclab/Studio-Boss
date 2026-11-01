## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.
## 2026-11-01 - Prevent Array Allocation in TV Recommendations
**Learning:** Using `Object.values().filter()` inside `getTVRecommendationsForTalent` creates unnecessary garbage collection overhead inside the game loop.
**Action:** Replace `Object.values().filter()` with a single-pass `for...in` loop that populates a new array directly, preventing intermediate object array allocation.
