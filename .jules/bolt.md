## 2024-09-15 - Remove intermediate Map allocation in production loop
**Learning:** Using `Object.entries()` to convert a `Record` to a `Map` inside a high-frequency game loop like `tickProduction` creates unnecessary intermediate array allocations, causing memory pressure and garbage collection overhead.
**Action:** Change helper functions to accept `Record<string, T>` directly, allowing O(1) property access (e.g., `records[id]`) without needing to construct a `Map` each tick.
