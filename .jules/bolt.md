## 2024-05-24 - Avoid flatMap and multiple filter passes in Crisis Evaluator
**Learning:** Found multiple array iterations (flatMap, filter, reduce) processing crisis handlers.
**Action:** Replaced with single-pass loops to prevent O(N) GC thrashing.
