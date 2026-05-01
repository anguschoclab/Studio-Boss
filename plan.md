1. **Expand Franchise System (`src/engine/systems/ip/fatigueEngine.ts` and `src/engine/systems/ip/franchiseCoordinator.ts`)**
   - In `fatigueEngine.ts`: Update `calculateFranchiseFatigue` to take `genre: string` instead of `genreType: 'spectacle' | 'comfort_food'`. Look up the risk from `FRANCHISE_FATIGUE_RISK` imported from `../../data/genres`. Apply an oversaturation multiplier if `genreSaturation > 10`. Update `fatigueEngine.test.ts` to match.
   - In `franchiseCoordinator.ts`: Import `CROSSOVER_AFFINITY` from `../../data/genres`. Add logic to `calculateFranchiseEquity` to calculate genre crossover synergy.

2. **Integrate new logics into generation metrics**
   - In `projectSlice.ts`, update the `calculateFranchiseFatigue` call to pass `project.genre` instead of ternary logic checking for spectacle.

3. **Pre commit checks**
   - Complete pre commit steps to make sure proper testing, verifications, reviews and reflections are done.

4. **Submit changes**
   - Submit the change with a descriptive commit message.
