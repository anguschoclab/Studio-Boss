
## 2024-05-24 - Single Pass Loop Over Object Entries
**Learning:** Calling `Object.values()` and then `.filter()` repeatedly on the same object creates multiple intermediate arrays, degrading performance in high-frequency functions.
**Action:** Replace `Object.values(obj).filter(...)` calls with a single-pass prototype-guarded `for...in` loop to avoid intermediate allocations and compute aggregates simultaneously.
