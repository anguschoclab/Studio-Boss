## 2024-05-24 - Array allocation inside object entries
**Learning:** Avoid Object.entries().map() when constructing new objects based on existing objects inside high-frequency loops or functions, as this creates multiple intermediate arrays, increasing GC pressure.
**Action:** Use a direct `for...in` loop with `Object.prototype.hasOwnProperty.call` protection and populate the new object iteratively.
