## 2024-10-02 - Eliminate Object.values() allocation in selectFatigueForAsset
**Learning:** In heavily used Redux/Zustand selectors like `selectFatigueForAsset` which recalculates franchise fatigue iteratively, creating intermediate arrays via `Object.values()` causes unnecessary O(N) memory allocations and leads to garbage collection thrashing in tight game loops.
**Action:** Preempt array allocation by directly iterating over state dictionaries (e.g., `state.entities.projects`) using prototype-guarded `for...in` loops whenever counting or searching records.
