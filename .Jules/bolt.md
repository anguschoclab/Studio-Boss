## 2024-10-04 - Optimize Nielsen ratings demographic generation

**Learning:** Using `Object.keys(DEMO_LABELS).map(...)` followed by an array `.find(...)` to extract a specific metric creates redundant intermediate arrays and iteration passes in high-frequency simulation loops like `nielsenSystem.ts`.
**Action:** Fold both array generation and metric extraction into a single, prototype-guarded `for...in` loop to eliminate intermediate allocations and nested searches.
## 2026-11-01 - Optimize TV Recommendations Filtering
**Learning:** Using `Object.values().filter(...)` inside high-frequency lookups creates unnecessary intermediate array allocations, adding memory pressure in tight simulation updates.
**Action:** Replace these patterns with direct `for...in` loops (with prototype checking) to minimize allocations and iterate efficiently.
