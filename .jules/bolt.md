## 2024-11-20 - Array .find() inside game loops
**Learning:** Using `array.find()` inside high-frequency nested loops (like `projects.forEach` or `opportunities.forEach` nested with `rivals`) causes severe performance degradation due to unnecessary multiple O(N) array scans.
**Action:** Always pre-compute a `Map` lookup (`new Map()`) for array data before iterating through it in game loops to reduce `O(N * M)` complexity to `O(N + M)`.
