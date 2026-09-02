## 2025-01-20 - Object.entries() in Game Loops
**Learning:** In highly-called game loops (like AI motivation calculations), using `Object.entries().forEach()` allocates unnecessary intermediate arrays (an array of arrays for keys and values), causing significant garbage collection spikes.
**Action:** Use a prototype-guarded `for...in` loop instead to iterate over objects in frequent game loops to eliminate intermediate array allocations.
