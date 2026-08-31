## 2024-05-18 - Optimized agency poach target selection loop
**Learning:** Chaining `.filter()` on an already mapped array in highly frequent game loops (like agency ticks per agent) creates redundant GC pressure by allocating multiple intermediate arrays, even when iterating over relatively small `RivalStudio` lists.
**Action:** Always fuse sequential array collection steps into a single `for...in` pass when evaluating conditional subsets, bypassing the `.filter()` allocation entirely.
