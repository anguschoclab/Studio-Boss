1. **Optimize \`checkAchievements\` in \`AchievementsSystem.ts\`**
   - It currently allocates \`Object.values(state.entities.projects)\`, \`Object.values(state.entities.talents)\`, and \`Object.values(state.entities.rivals)\` on every check.
   - Refactor to use \`for...in\` to iterate over \`state.entities.projects\`, \`state.entities.talents\`, and \`state.entities.rivals\`.
   - Update any array method calls (like \`.filter\`, \`.some\`, \`.map\`) to operate directly inside the \`for...in\` loop to avoid creating intermediate arrays.

2. **Optimize \`advanceRivals\` in \`rivals.ts\`**
   - It currently allocates \`Object.values(state.entities.rivals)\` and then \`Object.values(state.entities.talents)\` inside a loop over ALL_RIVALS.
   - Refactor to use \`for...in\` for both rivals and talents.
   - Merge the two `for` loops over ALL_RIVALS into one.

3. **Verify functionality with tests**
   - Run \`pnpm test\` to ensure no existing logic is broken.

4. **Update journal and create PR**
   - Add learning to \`.jules/bolt.md\` about avoiding \`Object.values\` in hot paths like engine loops.
   - Create a commit and submit the change.
