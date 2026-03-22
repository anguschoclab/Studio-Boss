1. **Explore `src/engine/systems/franchises.ts` and `src/engine/data/genres.ts`:**
   - Review current franchise expansion and fatigue logic.
   - Look for hooks related to crossover events, superhero fatigue, and market saturation.

2. **Update `src/engine/data/genres.ts`:**
   - Add new fatigue categories or tweak existing ones (e.g., adding explicit `Superhero` if it's a genre or adjusting `Action` and `Sci-Fi`).

3. **Update `src/engine/systems/franchises.ts`:**
   - Enhance the `exploitIP` function.
   - Improve the calculation of `saturationPenalty` to reflect exponential decay for heavily saturated genres.
   - Add logic for "Superhero Fatigue" or generic genre over-saturation if a genre has too many active/recent releases.
   - Refine crossover logic to be more strict or impactful (e.g., requires both to be highly successful or introduces a "Cinematic Universe" phase).
   - Ensure the function never returns `null` for stubs (keep the existing logic intact, just add on top).
   - Verify that properties like `isSpinoff`, `initialBuzzBonus`, `parentProjectId` are correctly handled so they feed into pipeline metrics.

4. **Verify tests:**
   - Run tests `npx vitest run` and linting `bun x eslint .` to ensure no regressions.
   - Pre-commit step.
