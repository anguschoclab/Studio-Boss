## 2024-09-30 - Prevent array allocation in high-frequency game loops
**Learning:** Using `Object.keys().map()` on static configuration objects inside high-frequency game loops or nested functions creates unnecessary intermediate array allocations, causing severe garbage collection pressure.
**Action:** Replace `Object.keys().map()` and related array methods with direct `for...in` loops (using prototype guards) when iterating over static objects in performance-critical paths.
