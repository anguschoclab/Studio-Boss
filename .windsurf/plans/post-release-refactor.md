# Refactor: Move handlePostReleasePhase to PostReleaseHandler.ts

## Step 1: Update PostReleaseHandler.ts
- Remove unused `isSeriesProject` import
- Remove `(p as any)` casts (use `p.budget`, `p.revenue`, `p.weeksInPhase` directly)
- Add update text generation (from original projects.ts version)
- Make `rng` optional with `randRange` fallback
- Return `PostReleaseResult { impacts, update }` instead of just `StateImpact[]`
- Don't double-increment weeksInPhase (advanceProject already increments it)

## Step 2: Update projects.ts
- Import `handlePostReleasePhase` from `./projectHandlers/PostReleaseHandler`
- Remove local `handlePostReleasePhase` function (lines 230-263)
- Update call site in `advanceProject` (lines 374-377) to pass `rng` and apply impacts to `p`

## Step 3: Run tests
- `npx vitest run src/test/engine/systems/projects.test.ts`
