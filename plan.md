1. **Optimize `checkAchievements` in `AchievementsSystem.ts`**
   - It currently allocates `Object.values(state.entities.projects)`, `Object.values(state.entities.talents)`, and `Object.values(state.entities.rivals)` on every check.
   - Refactor to use `for...in` to iterate over `state.entities.projects`, `state.entities.talents`, and `state.entities.rivals` avoiding array creation overhead.
   - For `projects`, we filter `releasedProjects` (state === 'released' || 'post_release' || 'archived').
   - For `talents`, we check if any `A_LIST` was newcomer.
   - For `rivals`, we find their cash values to compare against player cash.

2. **Optimize `advanceRivals` in `rivals.ts`**
   - It currently allocates `Object.values(state.entities.rivals)` and then calls `Object.values(state.entities.talents)` inside a second loop over `ALL_RIVALS`.
   - Refactor to create the talent pool array *once* before looping over rivals.
   - Instead of allocating `ALL_RIVALS`, just iterate over `state.entities.rivals` with `for...in`.
   - Merge the two loops (updating rival + checking poach news) into a single `for...in` loop over `state.entities.rivals`.

3. **Verify functionality with tests**
   - Run `pnpm test` to ensure logic remains intact.

4. **Complete Pre-Commit Steps**
   - Follow `pre_commit_instructions` before submitting.

5. **Submit PR**
   - Format PR following Bolt's guidelines (e.g. "⚡ Bolt: Replace Object.values with for...in for State Records").
