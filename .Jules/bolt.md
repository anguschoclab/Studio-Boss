## 2026-10-14 - Prevent O(N log N) sorting for Max Value
**Learning:** High-frequency systems like OpportunitySystem used `Object.entries().sort()` to find the highest bid, allocating unnecessary arrays and performing O(N log N) work for an O(N) problem.
**Action:** Replaced `Object.entries().sort()` with a single-pass `for...in` loop to find the max value, reducing both CPU overhead and GC pressure.
