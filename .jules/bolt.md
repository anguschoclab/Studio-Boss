## 2024-05-20 - Avoid Object.entries().forEach() in High-Frequency Game Loops
**Learning:** Using `Object.entries().forEach()` in frequently called loops (like AI motivation calculations) allocates intermediate arrays for both keys and values, leading to severe garbage collection spikes.
**Action:** Use a prototype-guarded `for...in` loop instead when iterating over objects in high-frequency paths to eliminate these unnecessary allocations.
