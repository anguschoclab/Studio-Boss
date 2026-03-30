# ⚡ Bolt: Architectural Learnings

## Optimization: O(1) Project Lookup in Scandals Generator

**Problem:**
In `src/engine/systems/scandals.ts`, the `generateScandals` function iterates over the entire talent pool to roll for controversy risk. If a talent triggers a scandal, the function uses `Array.prototype.find()` on `state.studio.internal.projects` within a string interpolation to fetch the title of the project the talent is attached to. Since this happens inside a hot simulation generation loop, `find` forces an O(N) linear array traversal for *every single triggered scandal*, degrading performance substantially in heavily populated end-game states.

**Solution:**
Replaced the `Array.prototype.find()` method with an O(1) Dictionary/Map lookup.

We pre-process the studio's project array into a Map (`projectTitleMap`) at the start of the function:
```typescript
const projectTitleMap = new Map<string, string>();
for (const p of state.studio.internal.projects) {
  projectTitleMap.set(p.id, p.title);
}
```

Then, during the loop over the talent pool, we extract the title in O(1) time:
```typescript
const projectTitle = projectTitleMap.get(projectId) || 'Unknown Project';
```

**Outcome:**
Eliminated O(N^2) scaling when calculating the scandal project details, significantly improving the performance baseline, as proved by custom Vitest benchmarks (`src/test/performance/scandals.bench.ts`).
