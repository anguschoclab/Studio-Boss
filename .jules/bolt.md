## 2025-04-18 - Optimized weekAdvance Performance Benchmark

**Learning:** Manual performance benchmarking with `console.log` and `performance.now()` is less accurate and harder to maintain than standardized benchmarking utilities.

**Action:** Refactored `weekAdvance.bench.ts` to use Vitest's `bench` utility, aligning it with other performance benchmarks in the codebase and removing leftover `console.log` statements.
