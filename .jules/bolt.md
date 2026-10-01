## 2024-05-24 - Initial Bolt Journal

## 2024-05-24 - Avoid Multiple Filters on State Objects
**Learning:** Computing multiple derived counts from a large state dictionary using separate `Object.values().filter().length` chains causes redundant O(N) passes and unnecessary array allocations, leading to avoidable garbage collection pressure.
**Action:** Use a single, prototype-guarded `for...in` loop to iterate over the dictionary once and compute all aggregates concurrently.
