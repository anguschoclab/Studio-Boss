# Bolt's Journal

## 2025-03-09 - [Reduce Object Allocation Overhead]
**Learning:** In hot loops like `runAwardsCeremony` operating over large arrays (like `state.projects`), array reduction `[].reduce()` creating and returning intermediate objects or doing destructuring assignment has a measurable overhead.
**Action:** Replace `reduce()` object grouping passes with simple `for` loops allocating into separate arrays directly for a ~3.2x performance gain, while keeping code readability high.

## 2026-03-29 - [Precalculate Static Bounds in Hot Loops]
**Learning:** The game's main advance loop checks conditions that run random evaluations (e.g., `checkAndTriggerCrisis`). Calculating minimum/maximum array constraints dynamically inside these checks results in needless O(N) operations.
**Action:** Extract calculation of array extremes and constant logic into a one-time precalculation phase when the module loads, ensuring hot loops operate with O(1) property lookups.
