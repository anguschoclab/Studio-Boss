## 2024-05-24 - Avoid Object.entries in game loops
**Learning:** In highly-called game loops (like AI motivation calculations), `Object.entries().forEach()` allocates unnecessary intermediate arrays (an array of arrays for keys and values) causing garbage collection spikes.
**Action:** Use a prototype-guarded `for...in` loop instead.
