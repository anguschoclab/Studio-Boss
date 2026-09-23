## 2024-05-24 - Optimize Snapshot Derivations
**Learning:** Chaining `Object.values().filter()` creates unnecessary intermediate array allocations and causes redundant O(N) iteration passes, putting pressure on garbage collection during high-frequency snapshot captures or evaluations.
**Action:** Replace `Object.values().filter()` chains with a single prototype-guarded `for...in` loop to compute multiple aggregates (like active and completed projects) simultaneously in an O(N) pass without array allocations.

## 2024-05-24 - Optimize Snapshot Derivations
**Learning:** Chaining `Object.values().filter()` creates unnecessary intermediate array allocations and causes redundant O(N) iteration passes, putting pressure on garbage collection during high-frequency snapshot captures or evaluations.
**Action:** Replace `Object.values().filter()` chains with a single prototype-guarded `for...in` loop to compute multiple aggregates (like active and completed projects) simultaneously in an O(N) pass without array allocations.
