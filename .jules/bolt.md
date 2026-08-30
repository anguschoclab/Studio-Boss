## 2024-05-24 - Entity Processing GC Overhead in High-Frequency Game Loops
**Learning:** Passing `Object.values()` to helper functions that process ECS entities (like `advanceIPRights`) causes severe garbage collection spikes by repeatedly allocating intermediate arrays.
**Action:** Type helper functions to accept `Record<string, T>` directly alongside arrays, and use prototype-guarded `for...in` loops to iterate, completely eliminating the need for `Object.values()` array allocations.
