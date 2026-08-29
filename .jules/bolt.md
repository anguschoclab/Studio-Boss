## 2024-05-15 - AI Motivation Iteration Optimization
**Learning:** `Object.entries(obj).forEach()` in high-frequency game loops allocates intermediate arrays of arrays for keys and values, causing noticeable garbage collection spikes.
**Action:** Use prototype-guarded `for...in` loops directly over the object to eliminate unnecessary array allocations in hot paths like AI tick calculations.
