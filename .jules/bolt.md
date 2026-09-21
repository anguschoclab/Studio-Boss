## 2024-05-24 - [Avoid O(N*M) Selectors]
**Learning:** Non-memoized Redux/Zustand selectors containing array allocations and `.filter` loops nested inside other loops (O(N*M)) can cause severe re-render performance issues.
**Action:** Extract the data traversal from the loop, perform a single O(N) `for...in` pass over state objects to pre-compute necessary values, and reuse those variables inside any subsequent loops.
