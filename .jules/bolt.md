## 2025-02-28 - Prevent array allocation when iterating market configurations
**Learning:** Using `Object.keys().filter()` or `Object.keys().map()` over constants like `MARKET_CONFIGS` causes unnecessary intermediate array creation and O(N) GC overhead on every evaluation.
**Action:** Iterating with a `for...in` loop directly avoids intermediate arrays, while keeping O(N) performance on frequent evaluations (e.g. regional ratings calculation).
