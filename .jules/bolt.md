## 2026-09-01 - Prevent GC Spikes in High-Frequency AI Game Loops
**Learning:** Using `Object.entries().forEach()` inside high-frequency game loops like AI motivation calculations creates unnecessary intermediate arrays (arrays of arrays for keys and values), leading to large garbage collection spikes.
**Action:** Use a prototype-guarded `for...in` loop for object iteration in performance-critical code paths to avoid intermediate allocations and reduce GC overhead.
